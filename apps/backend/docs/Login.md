# Documentación de Autenticación y Manejo de Sesiones en React Native y NestJS

## Introducción

Este documento describe cómo implementar un sistema de autenticación y manejo de sesiones de forma segura en una aplicación móvil con React Native y un backend en Node.js usando NestJS. La implementación sigue ciertas mejores prácticas, incluyendo autenticación basada en tokens JWT, almacenamiento seguro, manejo de sesiones y protección CSRF.

## Conceptos Clave

1. **Autenticación Basada en Tokens**: Uso de JSON Web Tokens (JWT) para autenticar solicitudes. Los tokens deben ser seguros y contener una fecha de expiración.
2. **Almacenamiento Seguro**: Almacenamiento seguro de tokens usando bibliotecas como `react-native-keychain`.
3. **Manejo de Sesiones**: Implementación de tokens de acceso de corta duración y tokens de refresco de larga duración.
4. **Protección CSRF**: Protección contra ataques CSRF mediante la validación de tokens CSRF en el backend.
5. **Manejo de Errores**: Manejo adecuado de errores de autenticación y autorización.

## Flujo de Autenticación

### 1. Registro de Usuario

Cuando un usuario se registra, se envían sus credenciales al backend a través de un endpoint de registro. El backend valida y almacena esta información.

### 2. Inicio de Sesión (Login)

1. **Solicitud de Login**: El usuario envía sus credenciales al endpoint de login.
2. **Validación de Credenciales**: El backend valida las credenciales. Si son correctas, se generan `access_token` y `refresh_token`.
3. **Respuesta del Login**: El backend envía los tokens al cliente.
4. **Almacenamiento Seguro**: El cliente almacena los tokens de forma segura.

### 3. Protección CSRF

1. **Generación del Token CSRF**: Al iniciar sesión, el backend genera un `csrfToken` y lo envía al cliente.
2. **Validación del Token CSRF**: El backend valida el `csrfToken` en cada solicitud.

### 4. Acceso a Recursos Protegidos

1. **Inclusión del Access Token**: El cliente incluye el `access_token` en las cabeceras de las solicitudes.
2. **Verificación del Token**: El backend verifica el `access_token`.

### 5. Refresco de Token

1. **Solicitud de Refresh Token**: El cliente envía una solicitud al endpoint de refresh con el `refresh_token`.
2. **Verificación del Refresh Token**: El backend verifica el `refresh_token`.
3. **Respuesta del Refresh Token**: El backend envía un nuevo `access_token` al cliente.

## Flujo de Ejemplo en Postman

# Flujo de Ejemplo en Postman

### 1. Obtener el CSRF Token

**Método:** `GET`  
**URL:** `{{baseUrl}}/auth/csrf-token`  
**Headers:** Ninguno

**Respuesta:**
```
{
  "csrfToken": "valor_del_csrfToken"
}
```

### 2. Iniciar Sesión

**Método:** `POST`  
**URL:** `{{baseUrl}}/auth/login`  
**Headers:** `X-CSRF-Token: valor_del_csrfToken`  
**Body:**  
```
{
  "username": "miusuario",
  "password": "micontrasena"
}
```

**Respuesta:**
```
{
  "access_token": "valor_del_access_token",
  "refresh_token": "valor_del_refresh_token"
}
```

### 3. Acceder a Recursos Protegidos

**Método:** `GET`  
**URL:** `{{baseUrl}}/protected-resource`  
**Headers:** `Authorization: Bearer valor_del_access_token`

### 4. Refrescar el Access Token

**Método:** `POST`  
**URL:** `{{baseUrl}}/auth/refresh-token`  
**Headers:** `X-CSRF-Token: valor_del_csrfToken`  
**Body:**  
```
{
  "token": "valor_del_refresh_token"
}
```

**Respuesta:**
```
{
  "access_token": "nuevo_valor_del_access_token"
}
``` 