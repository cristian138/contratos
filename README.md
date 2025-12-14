# Sistema de Firma Electrónica
## Academia Jotuns Club SAS

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19.0+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.5+-47A248.svg)](https://www.mongodb.com/)

Sistema completo de gestión y firma electrónica de contratos digitales con plena validez legal en Colombia, conforme a la **Ley 527 de 1999** y el **Decreto 2364 de 2012**.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Cumplimiento Normativo](#-cumplimiento-normativo)
- [Tecnologías](#-tecnologías)
- [Instalación Rápida](#-instalación-rápida)
- [Uso](#-uso)
- [Documentación](#-documentación)
- [Arquitectura](#-arquitectura)
- [Seguridad](#-seguridad)
- [Licencia](#-licencia)

---

## ✨ Características

### Gestión de Contratos
- ✅ Carga de plantillas PDF con campos AcroForms
- ✅ Almacenamiento seguro en VPS
- ✅ Cálculo automático de hash SHA-256
- ✅ Extracción automática de campos del formulario
- ✅ Descarga de contratos originales

### Proceso de Firma
- ✅ **Autenticación de dos factores** mediante OTP
- ✅ Envío de OTP por **email corporativo**
- ✅ Envío opcional de OTP por **SMS** (TextMeBot)
- ✅ Portal de firma público (sin registro)
- ✅ Validación de identidad inequívoca
- ✅ Manifestación expresa de voluntad
- ✅ Captura de IP, User-Agent y timestamp

### Auditoría y Trazabilidad
- ✅ **Logs inmutables** de todas las acciones
- ✅ Registro de: IP, fecha/hora, acción, detalles
- ✅ Cumplimiento de requisitos normativos
- ✅ Evidencia válida para procesos judiciales

### Verificación de Integridad
- ✅ Verificación mediante hash SHA-256
- ✅ Detección de cualquier alteración
- ✅ Interfaz web para carga de documentos
- ✅ Cálculo automático de hash

### Dashboard Administrativo
- ✅ Métricas en tiempo real
- ✅ Estado de solicitudes
- ✅ Gestión completa de contratos
- ✅ Panel de auditoría

---

## ⚖️ Cumplimiento Normativo

### Ley 527 de 1999 - Artículo 7

El sistema cumple con todos los requisitos para la validez de mensajes de datos y firmas digitales:

| Requisito Legal | Implementación |
|-----------------|----------------|
| **Identificación del firmante** | Email verificado + OTP único |
| **Manifestación de voluntad** | Aceptación explícita + completado de formulario |
| **Asociación con el mensaje** | Hash SHA-256 + metadata vinculada |
| **Método confiable** | Autenticación 2FA + logs inmutables |

### Decreto 2364 de 2012

- **Artículo 4**: Confiabilidad del método de firma
  - ✅ Datos de creación exclusivos del firmante (OTP)
  - ✅ Control del firmante sobre el proceso
  - ✅ Detección de alteraciones (SHA-256)

- **Artículo 6**: Obligaciones del firmante
  - ✅ Advertencias sobre custodia del OTP
  - ✅ Mecanismo de reporte de compromiso

---

## 🛠 Tecnologías

### Backend
- **Framework**: FastAPI 0.110+
- **Lenguaje**: Python 3.11+
- **Base de Datos**: MongoDB 4.5+
- **PDF Processing**: PyPDF2
- **Email**: aiosmtplib (SMTP async)
- **SMS**: TextMeBot API
- **Hashing**: SHA-256 (hashlib)

### Frontend
- **Framework**: React 19.0+
- **Routing**: React Router 7
- **UI Library**: Shadcn/UI + Tailwind CSS 3.4+
- **HTTP Client**: Axios
- **Notificaciones**: Sonner
- **Forms**: React Hook Form + Zod

### Infraestructura
- **Servidor Web**: Nginx (proxy reverso)
- **Process Manager**: Supervisor
- **Containerización**: Docker (opcional)

---

## 🚀 Instalación Rápida

### Requisitos Previos

- Python 3.11+
- Node.js 18+ y Yarn
- MongoDB 4.5+
- Credenciales SMTP
- API Key de TextMeBot (opcional)

### Credenciales por Defecto

- **Usuario Admin**: `admin`
- **Contraseña Admin**: `admin123`
- **Cambiar en producción**: Editar `ADMIN_PASSWORD` en `/app/backend/.env`

Ver [Manual de Instalación](docs/MANUAL_INSTALACION.md) para instrucciones completas.

---

## 📖 Uso

### Acceso al Sistema

1. **Panel Administrativo**: `https://su-dominio.com/admin/login`
   - Usuario: `admin`
   - Contraseña: La configurada en `.env`

2. **Portal de Firma**: `https://su-dominio.com/sign/{token}`
   - Acceso público mediante enlace único

### Flujo Básico

1. **Administrador carga contrato** (PDF con AcroForms)
2. **Crea solicitud de firma** con datos del firmante
3. **Envía OTP** al email del firmante
4. **Firmante accede al enlace**, verifica OTP y firma
5. **Sistema registra todo** en logs de auditoría
6. **Verificación de integridad** disponible en cualquier momento

Ver [Manual de Uso](docs/MANUAL_USO.md) para instrucciones detalladas.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Manual de Instalación](docs/MANUAL_INSTALACION.md) | Guía completa de instalación y configuración |
| [Manual de Uso](docs/MANUAL_USO.md) | Instrucciones detalladas para usuarios |
| [Arquitectura](docs/ARQUITECTURA.md) | Diseño técnico y componentes del sistema |

---

## 🏗 Arquitectura

```
┌─────────────┐
│   Cliente   │ (Navegador)
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────┐
│    Nginx    │ (Proxy Reverso + SSL)
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
   ▼        ▼
┌──────┐ ┌───────┐
│React │ │FastAPI│
└──────┘ └───┬───┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐ ┌───┐ ┌──────┐
│MongoDB │ │SMS│ │ SMTP │
└────────┘ └───┘ └──────┘
```

### Componentes Principales

- **Frontend (React)**: Interfaz de usuario responsive
- **Backend (FastAPI)**: API REST con Python
- **MongoDB**: Base de datos NoSQL
- **SMTP**: Envío de emails y OTP
- **TextMeBot**: Envío de SMS opcional

---

## 🔒 Seguridad

### Características de Seguridad

- **TLS/SSL**: Comunicaciones cifradas
- **Autenticación 2FA**: OTP para firmantes
- **Hash SHA-256**: Integridad de documentos
- **Logs Inmutables**: Trazabilidad completa
- **Auditoría**: IP, User-Agent, timestamps

### Cumplimiento

- ✅ Ley 527 de 1999 (Colombia)
- ✅ Decreto 2364 de 2012
- ✅ Estándares NIST para hashing
- ✅ Buenas prácticas OWASP

---

## 📞 Contacto y Soporte

**Academia Jotuns Club SAS**  
Email: sistema.contratos@academiajotuns.com

**Sistema conforme a:**
- Ley 527 de 1999 (Colombia)
- Decreto 2364 de 2012

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2025
