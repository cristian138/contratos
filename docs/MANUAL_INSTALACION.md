# Manual de Instalación
## Sistema de Firma Electrónica - Academia Jotuns

---

## Requisitos Previos

### Software Necesario
- **Python 3.11+**
- **Node.js 18+** y **Yarn**
- **MongoDB 4.4+**
- **Sistema Operativo**: Linux (Ubuntu/Debian recomendado) o compatible

### Credenciales Requeridas
1. **Servidor SMTP** (para envío de emails)
2. **API Key de TextMeBot** (opcional, para SMS)

---

## Instalación Paso a Paso

### 1. Clonar o Preparar el Proyecto

```bash
cd /app
```

### 2. Instalación del Backend

#### 2.1. Crear entorno virtual e instalar dependencias

```bash
cd /app/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 2.2. Configurar Variables de Entorno

Editar el archivo `/app/backend/.env`:

```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="jotuns_contracts"
CORS_ORIGINS="*"

# Configuración SMTP
SMTP_HOST="mail.academiajotuns.com"
SMTP_PORT="465"
SMTP_USER="sistema.contratos@academiajotuns.com"
SMTP_PASS="SU_CONTRASEÑA_SMTP"

# API TextMeBot (Opcional)
TEXTMEBOT_API_KEY="SU_API_KEY"

# Credenciales Admin
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="SU_CONTRASEÑA_SEGURA"
```

**IMPORTANTE**: Cambie `SU_CONTRASEÑA_SMTP`, `SU_API_KEY` y `SU_CONTRASEÑA_SEGURA` por sus credenciales reales.

#### 2.3. Crear Directorios de Almacenamiento

```bash
mkdir -p /app/backend/storage/contracts
mkdir -p /app/backend/storage/signed
```

### 3. Instalación del Frontend

#### 3.1. Instalar Dependencias

```bash
cd /app/frontend
yarn install
```

#### 3.2. Configurar Variables de Entorno

Editar el archivo `/app/frontend/.env`:

```bash
REACT_APP_BACKEND_URL=http://localhost:8001
# O su URL de producción:
# REACT_APP_BACKEND_URL=https://su-dominio.com
```

### 4. Iniciar MongoDB

```bash
# Si usa systemd:
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar estado:
sudo systemctl status mongod
```

### 5. Iniciar los Servicios

#### Opción A: Con Supervisor (Producción)

Si ya tiene supervisor configurado:

```bash
sudo supervisorctl start backend
sudo supervisorctl start frontend
```

#### Opción B: Manualmente (Desarrollo)

**Terminal 1 - Backend:**
```bash
cd /app/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd /app/frontend
yarn start
```

### 6. Verificar Instalación

Abra su navegador y visite:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001/api/

---

## Configuración de Producción

### 1. Usar HTTPS

Configure un proxy reverso (Nginx/Apache) con certificado SSL:

```nginx
server {
    listen 443 ssl;
    server_name su-dominio.com;

    ssl_certificate /ruta/cert.pem;
    ssl_certificate_key /ruta/key.pem;

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
```

### 2. Configurar Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Backup Automático

Configure cron para backup de MongoDB:

```bash
# Crear script de backup
sudo nano /usr/local/bin/backup-contracts.sh
```

Contenido:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db jotuns_contracts --out /backup/mongodb_$DATE
tar -czf /backup/contracts_files_$DATE.tar.gz /app/backend/storage/
# Eliminar backups antiguos (más de 30 días)
find /backup -type f -mtime +30 -delete
```

Agregar a cron:
```bash
sudo chmod +x /usr/local/bin/backup-contracts.sh
crontab -e
# Agregar línea:
0 2 * * * /usr/local/bin/backup-contracts.sh
```

---

## Solución de Problemas

### Error: "Cannot connect to MongoDB"
**Solución**: Verificar que MongoDB esté corriendo:
```bash
sudo systemctl status mongod
```

### Error: "SMTP authentication failed"
**Solución**: Verificar credenciales SMTP en `.env` y que el servidor permita autenticación.

### Error: "Port 8001 already in use"
**Solución**: Matar proceso existente:
```bash
sudo lsof -i :8001
sudo kill -9 <PID>
```

### Frontend no carga
**Solución**: 
1. Verificar que `REACT_APP_BACKEND_URL` en `/app/frontend/.env` sea correcta
2. Limpiar cache y reinstalar:
```bash
cd /app/frontend
rm -rf node_modules package-lock.json
yarn install
yarn start
```

---

## Mantenimiento

### Actualizar el Sistema

```bash
# Backend
cd /app/backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Frontend
cd /app/frontend
yarn upgrade
```

### Ver Logs

```bash
# Backend (con supervisor)
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/backend.out.log

# MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

### Reiniciar Servicios

```bash
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

---

## Contacto y Soporte

Para soporte técnico, contacte al administrador del sistema.

**Sistema desarrollado conforme a:**
- Ley 527 de 1999 (Colombia)
- Decreto 2364 de 2012

---

**Versión**: 1.0  
**Fecha**: Diciembre 2025  
**Academia Jotuns Club SAS**