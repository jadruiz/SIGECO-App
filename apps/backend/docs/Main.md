#
├── package.json
├── prometheus.yml
├── src
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── main.ts
│   ├── config                     # Configuración centralizada
│   │   ├── config.ts
│   │   ├── data-source.ts
│   │   └── env.validation.ts
│   ├── core                       # Funcionalidades transversales
│   │   ├── filters
│   │   │   └── all-exceptions.filter.ts
│   │   ├── middleware
│   │   │   └── cookie.middleware.ts
│   │   ├── guards
│   │   │   └── jwt-auth.guard.ts
│   │   ├── decorators
│   │   │   └── public.decorator.ts
│   │   └── utils
│   │       ├── hash.util.ts
│   │       └── pagination.util.ts
│   ├── shared                     # Módulo compartido
│   │   ├── shared.module.ts
│   │   └── shared.service.ts
│   ├── auth                       # Autenticación y autorización
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   ├── oauth.strategy.ts
│   │   ├── dto
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   ├── register.dto.ts
│   │   │   ├── verify-email.dto.ts
│   │   │   ├── forgot-password.dto.ts
│   │   │   └── reset-password.dto.ts
│   │   └── entities
│   │       └── oauth-provider.entity.ts
│   ├── modules                    # Agrupación modular
│   │   ├── users                  # Gestión de administradores
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── repository
│   │   │   │   └── user.repository.ts
│   │   │   └── entities
│   │   │       └── user.entity.ts
│   │   ├── participants           # Gestión de participantes
│   │   │   ├── participants.controller.ts
│   │   │   ├── participants.module.ts
│   │   │   ├── participants.service.ts
│   │   │   └── entities
│   │   │       └── participant.entity.ts
│   │   ├── articles               # Artículos científicos
│   │   │   ├── articles.controller.ts
│   │   │   ├── articles.module.ts
│   │   │   ├── articles.service.ts
│   │   │   └── entities
│   │   │       └── article.entity.ts
│   │   ├── conferences            # Gestión de congresos
│   │   │   ├── conferences.controller.ts
│   │   │   ├── conferences.module.ts
│   │   │   ├── conferences.service.ts
│   │   │   └── entities
│   │   │       └── conference.entity.ts
│   │   ├── sessions               # Sesiones temáticas
│   │   │   ├── sessions.controller.ts
│   │   │   ├── sessions.module.ts
│   │   │   ├── sessions.service.ts
│   │   │   └── entities
│   │   │       └── session.entity.ts
│   │   ├── addons                 # Servicios adicionales
│   │   │   ├── addons.controller.ts
│   │   │   ├── addons.module.ts
│   │   │   ├── addons.service.ts
│   │   │   └── entities
│   │   │       └── addon.entity.ts
│   │   ├── evaluations            # Evaluaciones
│   │   │   ├── evaluations.controller.ts
│   │   │   ├── evaluations.module.ts
│   │   │   ├── evaluations.service.ts
│   │   │   └── entities
│   │   │       └── evaluation.entity.ts
│   │   ├── audit-logs             # Auditoría
│   │   │   ├── audit-logs.controller.ts
│   │   │   ├── audit-logs.module.ts
│   │   │   └── audit-logs.service.ts
│   │   └── roles-permissions      # Roles y permisos
│   │       ├── roles.controller.ts
│   │       ├── roles.module.ts
│   │       ├── roles.service.ts
│   │       └── entities
│   │           ├── role.entity.ts
│   │           └── permission.entity.ts
│   ├── database                   # Migraciones y Seeders
│   │   ├── migrations
│   │   │   ├── 20240606-init-schema.ts
│   │   └── seeders
│   │       ├── user.seeder.ts
│   │       └── participant.seeder.ts
└── test                          # Pruebas unitarias y e2e
    ├── app.e2e-spec.ts
    └── jest-e2e.json


# Configuración del Proyecto

Este directorio contiene archivos relacionados con la configuración global del proyecto, incluyendo:
- `config.ts`: Variables de entorno y configuración general.
- `data-source.ts`: Configuración de TypeORM para la base de datos.
- `env.validation.ts`: Validación de variables de entorno utilizando `Joi`.

# Core - Funcionalidades Transversales

Este directorio contiene utilidades globales reutilizables en todo el proyecto:
- **filters**: Filtros globales para manejar excepciones.
- **middleware**: Middlewares personalizados.
- **guards**: Guards para control de acceso (ej., JWT).
- **decorators**: Decoradores personalizados.
- **utils**: Funciones de utilidad como `hash.util.ts` para manejo de contraseñas.

# Módulos del Proyecto

Cada subdirectorio dentro de `modules` representa una funcionalidad específica implementada como un módulo independiente:
- **auth**: Autenticación y autorización.
- **users**: Gestión de administradores.
- **participants**: Gestión de participantes registrados.
- **articles**: Gestión de artículos científicos.
- **conferences**: Gestión de congresos académicos.
- **sessions**: Gestión de sesiones temáticas.
- **addons**: Gestión de servicios adicionales.
- **evaluations**: Evaluación de artículos.
- **audit-logs**: Registro de acciones críticas.
- **roles-permissions**: Control de roles y permisos.

Cada módulo contiene:
- **Controller**: Define los endpoints.
- **Service**: Lógica de negocio.
- **Entities**: Modelos TypeORM para la base de datos.

# Migraciones y Seeders

- **migrations**: Contiene archivos de migración para inicializar o actualizar la base de datos.
- **seeders**: Archivos para insertar datos iniciales en la base de datos (ej., usuarios por defecto).
