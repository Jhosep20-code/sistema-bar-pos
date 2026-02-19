# 🔥 FUEGO EN LA NOCHE - Sistema POS para Bares

> Sistema de Punto de Venta premium con arquitectura profesional para bares y restaurantes

![Version](https://img.shields.io/badge/version-2.0.0-gold)
![React](https://img.shields.io/badge/React-18.3-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-cyan)

## ✨ Características Principales

### Core Features ✅
- **Gestión de Mesas** con estados visuales (Libre, Ocupada, Cuenta Pedida)
- **Carrito de Pedidos** touch-friendly para dispositivos móviles
- **Cobro Dividido por Items** - Solución real para mesas grandes
- **Sistema de Propinas** - 10%/15%/20% + monto personalizado
- **Control de Caja** con apertura, cierre y reconciliación
- **Inventario Inteligente** con descuento automático basado en recetas
- **Dashboard con Métricas** - Ventas por hora, top productos

### Advanced Features (Phase 2) 🚧
- [ ] Autenticación multi-usuario (Admin, Gerente, Mesero, Barman)
- [ ] Integración Supabase para sincronización multi-dispositivo
- [ ] Pasarelas de pago (Yape, Plin, Visa/Mastercard)
- [ ] Reservas de mesas
- [ ] Impresión de tickets (ESC/POS)
- [ ] Reportes en PDF
- [ ] Modo offline con PWA

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

```bash
# 1. Clonar el repositorio o navegar al directorio
cd "Sistema para Bar"

# 2. Instalar dependencias
npm install

# 3. Ejecutar en desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:5173
```

## 📱 Uso del Sistema

### 1. Abrir Caja
1. Ir a la sección "Caja"
2. Ingresar monto inicial (efectivo en caja)
3. Click en "Abrir Caja"

### 2. Tomar un Pedido
1. Seleccionar una mesa libre en la vista "Mesas"
2. Agregar productos desde el catálogo
3. Ajustar cantidades si es necesario
4. Presionar "Pedir Cuenta" cuando el cliente solicita

### 3. Cobrar (con Propinas)
1. Click en "Cobrar"
2. Seleccionar items a cobrar (checkbox individual)
3. **Agregar propina** (opcional):
   - Elegir porcentaje: 10%, 15%, o 20%
   - O ingresar monto personalizado
4. Ver total con propina incluida
5. Confirmar pago

### 4. Cobro Parcial (Mesa Dividida)
- **Caso de uso:** Mesa de 15 personas que pagan por separado
- **Solución:** Seleccionar solo los items de cada persona
- El sistema calcula automáticamente el saldo restante
- La mesa permanece activa hasta que todo esté pagado

### 5. Cerrar Caja
1. Ir a "Caja"
2. Click en "Cerrar Caja"
3. Ingresar monto contado físicamente
4. El sistema muestra diferencias (faltante/sobrante)

## 🏗️ Arquitectura

### Estructura de Directorios

```
src/
├── components/           # Componentes React
│   ├── TablesGrid.jsx   # Grid de mesas
│   ├── OrderCart.jsx    # Carrito de pedidos
│   ├── SplitCheckModal.jsx  # Modal de cobro dividido
│   ├── CashControl.jsx  # Control de caja
│   └── Dashboard.jsx    # Métricas
├── hooks/               # Custom Hooks
│   ├── useOrders.js     # Gestión de pedidos
│   ├── useInventory.js  # Gestión de inventario
│   └── useCashRegister.js  # Control de caja
├── services/            # Servicios
│   ├── database.js      # Simulación de BD con LocalStorage
│   └── inventoryLogic.js  # Lógica de descuento de inventario
├── App.jsx              # Componente principal
└── main.jsx             # Entry point
```

### Base de Datos (LocalStorage)

El sistema simula una base de datos relacional completa:

| Tabla | Descripción |
|-------|-------------|
| `productos_venta` | Productos del menú |
| `insumos_inventario` | Materias primas |
| `recetas` | Relación producto → insumos |
| `mesas` | Estado de mesas |
| `pedidos` | Órdenes de clientes |
| `caja` | Registro de caja |
| `ventas` | Historial de ventas |

> **Nota:** Ready para migrar a Supabase/Firebase

## 💡 Características Innovadoras

### 1. Sistema de Propinas Flexible

```javascript
// Opciones de propina
- 10% del subtotal
- 15% del subtotal  
- 20% del subtotal
- Monto personalizado (ej: S/ 5.50)
- Sin propina
```

Las propinas se registran separadas del monto de venta para tracking:

```json
{
  "subtotal": 45.00,
  "propina": 6.75,
  "total": 51.75
}
```

### 2. Descuento Automático de Inventario

Ejemplo: Al vender 1 "Pisco Sour", el sistema descuenta:
- 90ml de Pisco
- 30ml de Jarabe de Goma
- 30ml de Limón
- 1 Huevo
- 100g de Hielo

**Beneficio:** Control exacto del inventario sin intervención manual

### 3. Cobro Dividido Inteligente

Sistema único que permite seleccionar **items específicos** en lugar de dividir el total:

```
Mesa 5 (Total: S/ 450)
├─ Persona A paga: 2 cervezas → S/ 16
├─ Persona B paga: 1 coctel + 1 agua → S/ 30
├─ Persona C paga: 3 piqueos → S/ 45
└─ Saldo pendiente: S/ 359
```

## 🎨 Diseño

### Paleta de Colores

- **Background:** `#0F0F0F` (Negro Mate)
- **Cards:** `#1A1A1A` (Gris Carbón)
- **Borders:** `#2C2C2C` (Gris Sutil)
- **Gold Accent:** `#D4AF37` (Oro Premium)
- **Text Secondary:** `#8B8B8B` (Plomo)

### Mobile-First

- Botones táctiles de mínimo 44×44px
- Grid responsive (3 columnas en móvil → 6 en desktop)
- Fuente: Inter (Google Fonts)
- Animaciones suaves de 300ms

## 📊 Dashboard y Reportes

### Métricas Disponibles

1. **Total de Ventas del Día**
2. **Número de Transacciones**
3. **Promedio por Venta**
4. **Estado de Caja** (Abierta/Cerrada)
5. **Gráfico: Ventas por Hora** (identifica horas punta)
6. **Top 5 Productos Más Vendidos**

## 🔐 Próximas Características (Roadmap)

### Q1 2026
- [ ] Autenticación con Supabase
- [ ] Roles y permisos
- [ ] Integración Yape/Plin

### Q2 2026
- [ ] Reservas de mesas con calendario
- [ ] Impresión de tickets
- [ ] Reportes PDF

### Q3 2026
- [ ] Modo offline (PWA)
- [ ] Sincronización multi-dispositivo
- [ ] App móvil nativa

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3+ | Framework UI |
| Vite | 7.3+ | Build tool |
| Tailwind CSS | 3.x | Estilos |
| Lucide React | 0.564+ | Iconos |
| Recharts | 3.7+ | Gráficos |
| date-fns | 4.1+ | Fechas |

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 🤝 Contribuir

Este proyecto está en desarrollo activo. Para contribuir:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Proyecto privado para uso comercial.

## 👥 Autor

Desarrollado POR Jhosep Michael para optimizar operaciones de bares y restaurantes.

---

**v2.0.0** - Sistema de Propinas Implementado  
**v1.0.0** - Release Inicial con Core Features
