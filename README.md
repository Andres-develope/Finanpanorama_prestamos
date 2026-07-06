# PrestaFácil - Sistema de Gestión de Préstamos

Sistema web para gestionar préstamos personales con generación de pagarés, firma digital y auditoría.

## 🏗️ Arquitectura MVC

El proyecto sigue el patrón de diseño **Model-View-Controller (MVC)**:

```
prestafacil/
├── server.js                    # Punto de entrada de la aplicación
├── package.json                 # Dependencias y scripts
├── src/                         # Código fuente (Backend)
│   ├── models/                  # MODELOS - Lógica de datos
│   │   ├── index.js            
│   │   └── Cliente.js           # Modelo de Cliente/Préstamo
│   ├── controllers/             # CONTROLADORES - Lógica de negocio
│   │   ├── index.js            
│   │   └── clienteController.js # Controlador de clientes
│   └── routes/                  # RUTAS - Definición de endpoints
│       ├── index.js            
│       ├── clienteRoutes.js     # Rutas API de clientes
│       └── viewRoutes.js        # Rutas de vistas HTML
└── public/                      # VISTAS - Frontend
    ├── css/
    │   └── styles.css           # Estilos globales
    ├── index.html               # Página de inicio
    ├── solicitud.html           # Formulario de solicitud
    ├── pagare.html              # Documento de pagaré
    └── clientes.html            # Lista de clientes
```

## 📋 Componentes MVC

### Models (Modelos)
Los modelos representan la estructura de datos y la lógica de negocio:
- **Cliente.js**: Gestiona datos de clientes, préstamos y firmas digitales

### Controllers (Controladores)
Los controladores manejan las peticiones HTTP y coordinan modelos con vistas:
- **clienteController.js**: CRUD de clientes, firma de documentos, estadísticas

### Views (Vistas)
Las vistas son las interfaces de usuario (HTML/CSS/JS):
- **index.html**: Landing page
- **solicitud.html**: Formulario de préstamo
- **pagare.html**: Documento legal con firma digital y QR
- **clientes.html**: Panel de administración

### Routes (Rutas)
Las rutas definen los endpoints de la API:
- **clienteRoutes.js**: Endpoints de la API REST
- **viewRoutes.js**: Rutas para servir vistas HTML

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

## 🔌 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/clientes` | Obtener todos los clientes |
| GET | `/api/clientes/stats` | Obtener estadísticas |
| GET | `/api/clientes/:id` | Obtener cliente por ID |
| POST | `/api/clientes` | Crear nuevo cliente |
| PUT | `/api/clientes/:id` | Actualizar cliente |
| DELETE | `/api/clientes/:id` | Eliminar cliente |
| POST | `/api/clientes/:id/firmar` | Firmar documento |

## 🎨 Vistas

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/solicitud` | Formulario de solicitud de préstamo |
| `/pagare/:id` | Documento de pagaré (requiere ID de cliente) |
| `/clientes` | Lista de clientes registrados |

## 🛠️ Tecnologías

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Patrón**: MVC (Model-View-Controller)
- **Librerías Frontend**: 
  - QRCode.js (generación de QR)
  - JsBarcode (códigos de barras)

## 📄 Licencia

ISC
