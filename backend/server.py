from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import secrets
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiohttp
import PyPDF2
import io
import json


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Storage directories
STORAGE_DIR = ROOT_DIR / 'storage'
CONTRACTS_DIR = STORAGE_DIR / 'contracts'
SIGNED_DIR = STORAGE_DIR / 'signed'

CONTRACTS_DIR.mkdir(parents=True, exist_ok=True)
SIGNED_DIR.mkdir(parents=True, exist_ok=True)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Pydantic Models
class AdminLoginRequest(BaseModel):
    username: str
    password: str

class AdminLoginResponse(BaseModel):
    success: bool
    token: str
    message: str

class Contract(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    file_path: str
    file_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    fields: List[Dict] = []

class ContractCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SignatureRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contract_id: str
    signer_name: str
    signer_email: EmailStr
    signer_phone: Optional[str] = None
    status: str = "pending"  # pending, otp_sent, signed, rejected
    token: str = Field(default_factory=lambda: secrets.token_urlsafe(32))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    signed_at: Optional[datetime] = None
    signed_file_path: Optional[str] = None
    signed_file_hash: Optional[str] = None

class SignatureRequestCreate(BaseModel):
    contract_id: str
    signer_name: str
    signer_email: EmailStr
    signer_phone: Optional[str] = None
    send_via_email: bool = True
    send_via_sms: bool = False

class OTPSendRequest(BaseModel):
    request_id: str

class OTPVerifyRequest(BaseModel):
    request_id: str
    otp: str

class OTPVerifyResponse(BaseModel):
    success: bool
    message: str

class SignContractRequest(BaseModel):
    request_id: str
    form_data: Dict
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AuditLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    request_id: str
    action: str
    details: Dict
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class VerifyIntegrityRequest(BaseModel):
    file_hash: str

class VerifyIntegrityResponse(BaseModel):
    valid: bool
    message: str
    found_in_system: bool


# Utility Functions
def calculate_file_hash(file_path: Path) -> str:
    """Calculate SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

def generate_otp() -> str:
    """Generate 6-digit OTP"""
    return str(secrets.randbelow(1000000)).zfill(6)

async def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send email via SMTP"""
    try:
        smtp_host = os.environ.get('SMTP_HOST', 'mail.academiajotuns.com')
        smtp_port = int(os.environ.get('SMTP_PORT', 465))
        smtp_user = os.environ.get('SMTP_USER', 'sistema.contratos@academiajotuns.com')
        smtp_pass = os.environ.get('SMTP_PASS', '')
        
        message = MIMEMultipart('alternative')
        message['From'] = smtp_user
        message['To'] = to_email
        message['Subject'] = subject
        
        html_part = MIMEText(body, 'html')
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_pass,
            use_tls=True
        )
        return True
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return False

async def send_sms(phone: str, message: str) -> bool:
    """Send SMS via TextMeBot API"""
    try:
        api_key = os.environ.get('TEXTMEBOT_API_KEY', '')
        url = f"https://api.textmebot.com/send.php?recipient={phone}&apikey={api_key}&text={message}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return response.status == 200
    except Exception as e:
        logger.error(f"Error sending SMS: {str(e)}")
        return False

async def log_audit(request_id: str, action: str, details: Dict, ip_address: str = None, user_agent: str = None):
    """Create audit log entry"""
    audit = AuditLog(
        request_id=request_id,
        action=action,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    doc = audit.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.audit_logs.insert_one(doc)


# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "Sistema de Firma Electrónica - JOTUNS"}

# Admin Authentication
@api_router.post("/auth/admin/login", response_model=AdminLoginResponse)
async def admin_login(request: AdminLoginRequest):
    # Simple authentication - in production, use proper password hashing
    admin_user = os.environ.get('ADMIN_USERNAME', 'admin')
    admin_pass = os.environ.get('ADMIN_PASSWORD', 'admin123')
    
    if request.username == admin_user and request.password == admin_pass:
        token = secrets.token_urlsafe(32)
        return AdminLoginResponse(
            success=True,
            token=token,
            message="Login exitoso"
        )
    else:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

# Contract Management
@api_router.get("/contracts", response_model=List[Contract])
async def get_contracts():
    contracts = await db.contracts.find({}, {"_id": 0}).to_list(1000)
    for contract in contracts:
        if isinstance(contract.get('created_at'), str):
            contract['created_at'] = datetime.fromisoformat(contract['created_at'])
    return contracts

@api_router.post("/contracts", response_model=Contract)
async def create_contract(name: str = Form(...), description: str = Form(None), file: UploadFile = File(...)):
    # Save uploaded file
    file_id = str(uuid.uuid4())
    file_path = CONTRACTS_DIR / f"{file_id}_{file.filename}"
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Calculate hash
    file_hash = calculate_file_hash(file_path)
    
    # Extract PDF fields (simplified)
    fields = []
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        if '/AcroForm' in pdf_reader.trailer['/Root']:
            form = pdf_reader.trailer['/Root']['/AcroForm']
            if '/Fields' in form:
                for field in form['/Fields']:
                    field_obj = field.get_object()
                    if '/T' in field_obj:
                        fields.append({
                            "name": str(field_obj['/T']),
                            "type": "text"
                        })
    except Exception as e:
        logger.warning(f"Could not extract PDF fields: {str(e)}")
    
    contract = Contract(
        name=name,
        description=description,
        file_path=str(file_path),
        file_hash=file_hash,
        fields=fields
    )
    
    doc = contract.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contracts.insert_one(doc)
    
    return contract

@api_router.get("/contracts/{contract_id}")
async def get_contract(contract_id: str):
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    return contract

@api_router.get("/contracts/{contract_id}/download")
async def download_contract(contract_id: str):
    contract = await db.contracts.find_one({"id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    file_path = Path(contract['file_path'])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return FileResponse(file_path, filename=file_path.name)

# Signature Request Management
@api_router.get("/signature-requests", response_model=List[SignatureRequest])
async def get_signature_requests():
    requests = await db.signature_requests.find({}, {"_id": 0}).to_list(1000)
    for req in requests:
        if isinstance(req.get('created_at'), str):
            req['created_at'] = datetime.fromisoformat(req['created_at'])
        if req.get('signed_at') and isinstance(req['signed_at'], str):
            req['signed_at'] = datetime.fromisoformat(req['signed_at'])
    return requests

@api_router.post("/signature-requests", response_model=SignatureRequest)
async def create_signature_request(request: SignatureRequestCreate):
    # Verify contract exists
    contract = await db.contracts.find_one({"id": request.contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    sig_request = SignatureRequest(
        contract_id=request.contract_id,
        signer_name=request.signer_name,
        signer_email=request.signer_email,
        signer_phone=request.signer_phone
    )
    
    doc = sig_request.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.signature_requests.insert_one(doc)
    
    # Log audit
    await log_audit(
        request_id=sig_request.id,
        action="signature_request_created",
        details={
            "contract_id": request.contract_id,
            "signer_email": request.signer_email
        }
    )
    
    return sig_request

@api_router.get("/signature-requests/{request_id}")
async def get_signature_request(request_id: str):
    sig_request = await db.signature_requests.find_one({"id": request_id}, {"_id": 0})
    if not sig_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return sig_request

@api_router.get("/signature-requests/token/{token}")
async def get_signature_request_by_token(token: str):
    sig_request = await db.signature_requests.find_one({"token": token}, {"_id": 0})
    if not sig_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    return sig_request

# OTP Management
@api_router.post("/signature-requests/send-otp")
async def send_otp(request: OTPSendRequest):
    sig_request = await db.signature_requests.find_one({"id": request.request_id}, {"_id": 0})
    if not sig_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Generate OTP
    otp = generate_otp()
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Store OTP
    otp_doc = {
        "id": str(uuid.uuid4()),
        "request_id": request.request_id,
        "otp": otp,
        "expiry": expiry.isoformat(),
        "used": False
    }
    await db.otps.insert_one(otp_doc)
    
    # Send OTP via email
    email_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #002D54;">ACADEMIA JOTUNS - Código de Verificación</h2>
        <p>Estimado/a {sig_request['signer_name']},</p>
        <p>Su código de verificación para firmar el contrato es:</p>
        <h1 style="color: #002D54; font-size: 36px; letter-spacing: 5px;">{otp}</h1>
        <p>Este código expirará en 10 minutos.</p>
        <p>Si usted no solicitó este código, por favor ignore este mensaje.</p>
        <br>
        <p style="color: #666; font-size: 12px;">Academia Jotuns Club SAS</p>
    </body>
    </html>
    """
    
    email_sent = await send_email(
        to_email=sig_request['signer_email'],
        subject="Código de Verificación - Firma de Contrato",
        body=email_body
    )
    
    # Send OTP via SMS if phone provided
    sms_sent = False
    if sig_request.get('signer_phone'):
        sms_message = f"JOTUNS: Su código de verificación es: {otp}. Válido por 10 minutos."
        sms_sent = await send_sms(sig_request['signer_phone'], sms_message)
    
    # Update request status
    await db.signature_requests.update_one(
        {"id": request.request_id},
        {"$set": {"status": "otp_sent"}}
    )
    
    # Log audit
    await log_audit(
        request_id=request.request_id,
        action="otp_sent",
        details={
            "email_sent": email_sent,
            "sms_sent": sms_sent
        }
    )
    
    return {"success": True, "message": "OTP enviado exitosamente"}

@api_router.post("/signature-requests/verify-otp", response_model=OTPVerifyResponse)
async def verify_otp(request: OTPVerifyRequest):
    # Find OTP
    otp_doc = await db.otps.find_one(
        {
            "request_id": request.request_id,
            "otp": request.otp,
            "used": False
        },
        {"_id": 0}
    )
    
    if not otp_doc:
        await log_audit(
            request_id=request.request_id,
            action="otp_verification_failed",
            details={"reason": "invalid_otp"}
        )
        return OTPVerifyResponse(success=False, message="Código OTP inválido")
    
    # Check expiry
    expiry = datetime.fromisoformat(otp_doc['expiry'])
    if datetime.now(timezone.utc) > expiry:
        await log_audit(
            request_id=request.request_id,
            action="otp_verification_failed",
            details={"reason": "expired_otp"}
        )
        return OTPVerifyResponse(success=False, message="Código OTP expirado")
    
    # Mark OTP as used
    await db.otps.update_one(
        {"id": otp_doc['id']},
        {"$set": {"used": True}}
    )
    
    await log_audit(
        request_id=request.request_id,
        action="otp_verified",
        details={"otp_id": otp_doc['id']}
    )
    
    return OTPVerifyResponse(success=True, message="OTP verificado exitosamente")

# Contract Signing
@api_router.post("/signature-requests/sign")
async def sign_contract(request: SignContractRequest):
    sig_request = await db.signature_requests.find_one({"id": request.request_id}, {"_id": 0})
    if not sig_request:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    contract = await db.contracts.find_one({"id": sig_request['contract_id']}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contrato no encontrado")
    
    # For this MVP, we'll store the signed data as JSON alongside the original PDF
    signed_file_id = str(uuid.uuid4())
    signed_data_path = SIGNED_DIR / f"{signed_file_id}_data.json"
    signed_pdf_path = SIGNED_DIR / f"{signed_file_id}.pdf"
    
    # Copy original PDF
    import shutil
    shutil.copy(contract['file_path'], signed_pdf_path)
    
    # Save form data and signature metadata
    signature_data = {
        "request_id": request.request_id,
        "contract_id": sig_request['contract_id'],
        "signer_name": sig_request['signer_name'],
        "signer_email": sig_request['signer_email'],
        "form_data": request.form_data,
        "signed_at": datetime.now(timezone.utc).isoformat(),
        "ip_address": request.ip_address,
        "user_agent": request.user_agent,
        "original_file_hash": contract['file_hash']
    }
    
    with open(signed_data_path, 'w') as f:
        json.dump(signature_data, f, indent=2)
    
    # Calculate hash of signed document
    signed_hash = calculate_file_hash(signed_pdf_path)
    
    # Update signature request
    await db.signature_requests.update_one(
        {"id": request.request_id},
        {
            "$set": {
                "status": "signed",
                "signed_at": datetime.now(timezone.utc).isoformat(),
                "signed_file_path": str(signed_pdf_path),
                "signed_file_hash": signed_hash
            }
        }
    )
    
    # Log audit
    await log_audit(
        request_id=request.request_id,
        action="contract_signed",
        details={
            "signed_hash": signed_hash,
            "ip_address": request.ip_address,
            "user_agent": request.user_agent
        },
        ip_address=request.ip_address,
        user_agent=request.user_agent
    )
    
    # Send confirmation email
    email_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #002D54;">Contrato Firmado Exitosamente</h2>
        <p>Estimado/a {sig_request['signer_name']},</p>
        <p>Su contrato ha sido firmado exitosamente.</p>
        <p><strong>Fecha de firma:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
        <p><strong>Hash del documento:</strong> {signed_hash}</p>
        <p>Gracias por su confianza.</p>
        <br>
        <p style="color: #666; font-size: 12px;">Academia Jotuns Club SAS</p>
    </body>
    </html>
    """
    
    await send_email(
        to_email=sig_request['signer_email'],
        subject="Contrato Firmado - Academia Jotuns",
        body=email_body
    )
    
    return {
        "success": True,
        "message": "Contrato firmado exitosamente",
        "signed_hash": signed_hash
    }

# Audit Logs
@api_router.get("/audit-logs", response_model=List[AuditLog])
async def get_audit_logs(request_id: Optional[str] = None):
    query = {"request_id": request_id} if request_id else {}
    logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    for log in logs:
        if isinstance(log.get('timestamp'), str):
            log['timestamp'] = datetime.fromisoformat(log['timestamp'])
    
    return logs

# Integrity Verification
@api_router.post("/verify-integrity", response_model=VerifyIntegrityResponse)
async def verify_integrity(request: VerifyIntegrityRequest):
    # Check if hash exists in contracts
    contract = await db.contracts.find_one({"file_hash": request.file_hash}, {"_id": 0})
    if contract:
        return VerifyIntegrityResponse(
            valid=True,
            message="Documento válido - Hash encontrado en contratos originales",
            found_in_system=True
        )
    
    # Check if hash exists in signed documents
    sig_request = await db.signature_requests.find_one({"signed_file_hash": request.file_hash}, {"_id": 0})
    if sig_request:
        return VerifyIntegrityResponse(
            valid=True,
            message="Documento válido - Hash encontrado en contratos firmados",
            found_in_system=True
        )
    
    return VerifyIntegrityResponse(
        valid=False,
        message="Hash no encontrado en el sistema",
        found_in_system=False
    )

# Dashboard Stats
@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total_contracts = await db.contracts.count_documents({})
    total_requests = await db.signature_requests.count_documents({})
    pending_requests = await db.signature_requests.count_documents({"status": "pending"})
    signed_requests = await db.signature_requests.count_documents({"status": "signed"})
    
    return {
        "total_contracts": total_contracts,
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "signed_requests": signed_requests
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()