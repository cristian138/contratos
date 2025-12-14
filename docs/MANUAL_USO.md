# Manual de Uso
## Sistema de Firma Electrónica - Academia Jotuns

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Gestión de Contratos](#gestión-de-contratos)
4. [Solicitudes de Firma](#solicitudes-de-firma)
5. [Proceso de Firma (Firmante)](#proceso-de-firma-firmante)
6. [Auditoría y Trazabilidad](#auditoría-y-trazabilidad)
7. [Verificación de Integridad](#verificación-de-integridad)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

El Sistema de Firma Electrónica de Academia Jotuns permite gestionar, firmar y validar contratos digitales con plena validez legal según la normativa colombiana (Ley 527/1999 y Decreto 2364/2012).

### Características Principales

- ✅ **Firma electrónica con validez legal** en Colombia
- ✅ **Autenticación mediante OTP** (One-Time Password)
- ✅ **Trazabilidad completa** de todas las acciones
- ✅ **Hash SHA-256** para garantizar integridad
- ✅ **Logs de auditoría inmutables**
- ✅ **Notificaciones automáticas** por email y SMS

---

## Acceso al Sistema

### Para Administradores

1. Abrir el navegador y visitar: `https://su-dominio.com/admin/login`
2. Ingresar credenciales:
   - **Usuario**: `admin` (o el configurado)
   - **Contraseña**: La contraseña configurada
3. Hacer clic en **"Iniciar Sesión"**

### Para Firmantes

Los firmantes reciben un enlace único por correo electrónico en el formato:
```
https://su-dominio.com/sign/TOKEN_UNICO
```

No requieren registro ni contraseña.

---

## Gestión de Contratos

### 3.1. Ver Contratos Existentes

1. Desde el dashboard, hacer clic en **"Contratos"** en el menú lateral
2. Se mostrarán todas las plantillas de contratos cargadas
3. Para cada contrato puede ver:
   - Nombre y descripción
   - Fecha de creación
   - Hash SHA-256 del documento
   - Botón para descargar el PDF original

### 3.2. Cargar un Nuevo Contrato

#### Requisitos del Archivo PDF:
- Formato: PDF
- Con campos AcroForms (formulario interactivo)
- Tamaño recomendado: Menos de 10 MB

#### Pasos:

1. En la página de **Contratos**, hacer clic en **"Cargar Contrato"**
2. Completar el formulario:
   - **Nombre del Contrato**: Ej. "Contrato de Prestación de Servicios Deportivos"
   - **Descripción** (opcional): Breve descripción del contrato
   - **Archivo PDF**: Seleccionar el archivo desde su computadora
3. Hacer clic en **"Cargar Contrato"**
4. El sistema automáticamente:
   - Calculará el hash SHA-256
   - Extraerá los campos del formulario PDF
   - Almacenará el contrato de forma segura

### 3.3. Descargar un Contrato

1. En la tarjeta del contrato, hacer clic en **"Descargar"**
2. El archivo PDF se descargará a su dispositivo

---

## Solicitudes de Firma

### 4.1. Crear una Nueva Solicitud

1. Ir a **"Solicitudes"** en el menú lateral
2. Hacer clic en **"Nueva Solicitud"**
3. Completar el formulario:
   - **Contrato**: Seleccionar la plantilla de contrato
   - **Nombre del Firmante**: Nombre completo
   - **Email del Firmante**: Correo electrónico válido (obligatorio)
   - **Teléfono del Firmante**: Número de celular (opcional, para SMS)
4. Hacer clic en **"Crear Solicitud"**

El sistema generará automáticamente:
- Un **token único** para el firmante
- Un **enlace de firma** que puede compartir

### 4.2. Enviar OTP al Firmante

1. En la lista de solicitudes, ubicar la solicitud pendiente
2. Hacer clic en **"Enviar OTP"**
3. El sistema enviará:
   - **Email**: Código OTP de 6 dígitos
   - **SMS** (si se proporcionó teléfono): Código OTP

El código OTP:
- Es válido por **10 minutos**
- Solo puede usarse **una vez**
- Es único para cada solicitud

### 4.3. Compartir Enlace de Firma

1. En la tarjeta de solicitud, hacer clic en **"Copiar Enlace"**
2. El enlace se copiará al portapapeles
3. Compartir el enlace con el firmante por:
   - Email
   - WhatsApp
   - Cualquier medio de comunicación

### 4.4. Estados de las Solicitudes

- **Pendiente** (amarillo): Solicitud creada, esperando envío de OTP
- **OTP Enviado** (azul): Código enviado, esperando firma
- **Firmado** (verde): Contrato firmado exitosamente
- **Rechazado** (rojo): Solicitud rechazada o cancelada

---

## Proceso de Firma (Firmante)

### 5.1. Acceder al Enlace de Firma

1. Abrir el enlace recibido en el navegador
2. Aparecerá la pantalla de verificación de identidad

### 5.2. Verificación con OTP

1. Hacer clic en **"Enviar Código OTP"**
2. Revisar su correo electrónico
3. Copiar el código de 6 dígitos recibido
4. Ingresar el código en los campos provistos
5. Hacer clic en **"Verificar Código"**

### 5.3. Completar el Formulario

Una vez verificado el OTP:

1. Leer el contenido del contrato
2. Completar todos los campos obligatorios:
   - Nombre
   - Documento de identidad
   - Dirección
   - Teléfono
   - Email
   - Otros campos según el contrato
3. Leer la declaración de aceptación
4. Marcar la casilla de aceptación
5. Hacer clic en **"Firmar Contrato Electrónicamente"**

### 5.4. Confirmación de Firma

Al completar la firma:

1. Aparecerá un mensaje de éxito
2. Se mostrarán los detalles de la firma:
   - Nombre del firmante
   - Fecha y hora exacta
   - Método de autenticación
3. Recibirá un email de confirmación con:
   - Copia del contrato firmado
   - Hash SHA-256 del documento
   - Fecha y hora de firma

---

## Auditoría y Trazabilidad

### 6.1. Ver Logs de Auditoría

1. Ir a **"Auditoría"** en el menú lateral
2. Se mostrarán todos los eventos del sistema en orden cronológico

### 6.2. Información en los Logs

Cada registro contiene:

- **Acción realizada**: Tipo de evento
- **Fecha y hora**: Timestamp preciso (UTC)
- **Request ID**: Identificador único de la solicitud
- **Dirección IP**: IP desde donde se realizó la acción
- **User Agent**: Información del navegador
- **Detalles adicionales**: JSON con información específica

### 6.3. Tipos de Eventos Registrados

- `signature_request_created`: Solicitud creada
- `otp_sent`: OTP enviado
- `otp_verified`: OTP verificado correctamente
- `otp_verification_failed`: Intento fallido de verificación
- `contract_signed`: Contrato firmado exitosamente

### 6.4. Cumplimiento Normativo

Todos los logs cumplen con:
- **Ley 527 de 1999**: Requisitos de trazabilidad
- **Decreto 2364 de 2012**: Confiabilidad del método de firma
- **Inmutabilidad**: Los registros no pueden ser modificados

---

## Verificación de Integridad

### 7.1. ¿Para qué sirve?

La verificación de integridad permite:
- Confirmar que un documento no ha sido alterado
- Validar la autenticidad de un contrato firmado
- Comprobar que el documento existe en el sistema

### 7.2. Métodos de Verificación

#### Opción 1: Cargar el Archivo PDF

1. Ir a **"Verificar"** en el menú lateral
2. Hacer clic en **"Cargar Archivo"**
3. Seleccionar el PDF a verificar
4. El sistema calculará automáticamente el hash SHA-256
5. Hacer clic en **"Verificar Integridad"**

#### Opción 2: Ingresar el Hash Manualmente

1. Si ya tiene el hash SHA-256 del documento
2. Ingresarlo en el campo **"Hash"** (64 caracteres hexadecimales)
3. Hacer clic en **"Verificar Integridad"**

### 7.3. Interpretar los Resultados

#### Documento Válido ✅

```
✓ Documento válido - Hash encontrado en el sistema
```

**Significado**: El documento está registrado en la base de datos y no ha sido modificado.

#### Documento No Encontrado ❌

```
✗ Hash no encontrado en el sistema
```

**Significado**: El documento no está registrado o ha sido alterado después de la firma.

### 7.4. Valor Legal de la Verificación

La verificación con hash SHA-256:
- Cumple con estándares internacionales (NIST)
- Detecta cualquier modificación, por mínima que sea
- Sirve como prueba de integridad en procesos judiciales
- Es reconocida por la normativa colombiana

---

## Preguntas Frecuentes

### ¿Qué validez legal tiene la firma electrónica?

La firma electrónica mediante OTP cumple con la **Ley 527 de 1999** de Colombia, que establece que las firmas electrónicas tienen la misma validez que las manuscritas cuando cumplen ciertos requisitos de identificación, manifestación de voluntad y detección de alteraciones.

### ¿Cuánto tiempo tarda en llegar el OTP?

El OTP llega generalmente en **menos de 1 minuto**. Si no lo recibe:
1. Revisar la carpeta de spam
2. Verificar que el email sea correcto
3. Solicitar un nuevo OTP

### ¿Qué pasa si el OTP expira?

Los códigos OTP expiran después de **10 minutos**. Si esto ocurre, simplemente:
1. Regresar a la página de firma
2. Solicitar un nuevo OTP
3. Ingresar el nuevo código recibido

### ¿Puedo modificar un contrato después de firmarlo?

**No**. Una vez firmado, el contrato es inmutable. Cualquier cambio:
- Invalidaría el hash SHA-256
- Sería detectado por el sistema de verificación
- Rompería la integridad del documento

Si necesita hacer cambios, debe:
1. Crear una nueva versión del contrato
2. Generar una nueva solicitud de firma

### ¿Cómo recupero una contraseña de administrador?

Para recuperar o cambiar la contraseña de administrador:
1. Acceder al servidor donde está instalado el sistema
2. Editar el archivo `/app/backend/.env`
3. Cambiar el valor de `ADMIN_PASSWORD`
4. Reiniciar el servicio backend

### ¿Puedo eliminar un contrato firmado?

**No se recomienda** por razones legales y de auditoría. Sin embargo, si es absolutamente necesario:
1. Debe hacerse con acceso directo a la base de datos
2. Se perderá el registro de auditoría asociado
3. La verificación de integridad ya no será posible

### ¿Qué navegadores son compatibles?

El sistema es compatible con:
- ✅ Google Chrome (recomendado)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ⚠️ Internet Explorer (no recomendado)

### ¿Funciona en dispositivos móviles?

**Sí**, el sistema es totalmente responsive y funciona en:
- Smartphones (iOS y Android)
- Tablets
- Computadoras de escritorio

### ¿Cómo exporto todos los contratos firmados?

Para realizar una exportación completa:

```bash
# Backup de la base de datos
mongodump --db jotuns_contracts --out /backup/

# Backup de archivos PDF
tar -czf contratos_backup.tar.gz /app/backend/storage/
```

### ¿Puedo personalizar los correos de notificación?

Sí, puede modificar las plantillas de email en:
- Archivo: `/app/backend/server.py`
- Buscar las funciones: `send_email`
- Personalizar el HTML de los correos

---

## Soporte Técnico

Para asistencia técnica o consultas:

- **Email**: sistema.contratos@academiajotuns.com
- **Teléfono**: [Número de contacto]

---

## Marco Legal

Este sistema cumple con:

### Ley 527 de 1999
**Artículo 7**: Requisitos de la firma digital
- Identificación del firmante
- Manifestación de voluntad
- Asociación con el mensaje
- Método confiable

### Decreto 2364 de 2012
**Artículo 4**: Confiabilidad del método de firma
- Datos exclusivos del firmante
- Control del firmante sobre los datos
- Detección de alteraciones

**Artículo 6**: Obligaciones del firmante
- Custodia de credenciales (OTP)
- Notificación de compromisos

---

**Versión**: 1.0  
**Fecha**: Diciembre 2025  
**Academia Jotuns Club SAS**