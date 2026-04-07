# Documentación técnica - mi_app (Agregar Producto)

## Descripción general

Módulo personalizado para ERPNext que permite agregar productos con variantes de manera simplificada, incluyendo gestión de stock automático e impresión de etiquetas de código de barras.

## Ubicación

```
apps/mi_app/mi_app/productos/page/agregar_producto/
├── agregar_producto.js    # Frontend (UI)
├── agregar_producto.py    # Backend (lógica)
└── agregar_producto.json  # Definición de la Page
```

---

## Funcionalidades

### 1. Formulario de Agregar Producto

**Campos disponibles:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| Nombre | Input texto | Nombre del producto (obligatorio) |
| Descripción | Textarea | Descripción opcional |
| Marca | Select + botón agregar | Lista de marcas existentes + crear nuevas |
| Subcategoría | Select + botón agregar | Lista de subcategorías + crear nuevas |
| Categoría | Select + botón agregar | Lista de categorías + crear nuevas |
| Precio | Input número | Precio del producto |
| Warehouse | Select | Almacén para el stock |
| Talles/Colores | Input texto | Atributos separados por coma |

### 2. Generación automática de variantes

Al hacer clic en "Agregar Talles":
- Se generan campos de cantidad por cada atributo
- Se generan códigos de barras automáticos para cada variante

**Código de barras:**
- Formato: `nombre + atributo` sin espacios (ej: `ZapatillasNikeS`)
- Formato de barras: CODE128

### 3. Creación automática de entidades

Si no existen, se crean automáticamente:
- **Item Group** (categoría/subcategoría)
- **Brand** (marca)
- **Item Attribute** (Talle)
- **Item** (template con variantes)
- **Stock Entry** (receipt de stock)

### 4. Impresión de etiquetas

Después de guardar el producto:
- Pregunta si desea imprimir etiquetas
- Genera HTML con JsBarcode
- Cantidad de etiquetas = stock cargado por variante

**Formato de etiqueta:**
```
[Nombre del producto]
[Talle/Atributo]
[||| |||||| ||||||| ]
ZapatillasNikeS
```

---

## API Backend

### Funciones disponibles

| Función | Descripción |
|---------|-------------|
| `get_warehouses()` | Lista warehouses disponibles |
| `get_item_groups()` | Lista de categorías/subcategorías |
| `get_brands()` | Lista de marcas |
| `crear_item_group(nombre)` | Crea nueva categoría |
| `crear_brand(nombre)` | Crea nueva marca |
| `generar_barcodes_default(nombre, talles)` | Genera códigos de barras por defecto |
| `crear_producto(...)` | Crea producto, variantes y stock |
| `generar_etiquetas_html(etiquetas)` | Genera HTML para imprimir |

### Parámetros de `crear_producto`

```python
crear_producto(
    nombre,           # string (obligatorio)
    descripcion,     # string
    marca,           # string
    categoria,       # string (obligatorio)
    precio,          # float
    talles,          # string "S,M,L" (obligatorio)
    warehouse,       # string
    cantidades,      # dict {"S": 10, "M": 5}
    subcategoria,    # string
    barcodes_variantes # dict {"S": "codigo"}
)
```

---

## Estructura de datos

### Item (Producto padre)
```json
{
    "item_code": "ZapatillasNike",
    "has_variants": 1,
    "brand": "Nike",
    "item_group": "Calzado",
    "attributes": [{"attribute": "Talle"}]
}
```

### Item Variant
```json
{
    "item_code": "ZapatillasNikeS",
    "variant_of": "ZapatillasNike",
    "brand": "Nike",
    "item_group": "Calzado",
    "attributes": [{"attribute": "Talle", "attribute_value": "S"}],
    "barcodes": [{"barcode": "ZapatillasNikeS"}]
}
```

---

## Estilos de etiqueta

- Tamaño: 50mm x 25mm
- Nombre: 8px, negrita, centrado
- Atributo: 10px, centrado
- Código de barras: CODE128, height 30, muestra valor

---

## Errores comunes y soluciones

### "invalid literal for int()"
- Ocurría con códigos EAN que contenían letras
- Solución: Cambiar a CODE128 que acepta cualquier caracter

### Solo se generaba 1 etiqueta
- Causa: Uso de `etiquetas.index(etiqueta)` que siempre devolvía 0
- Solución: Usar `enumerate(etiquetas)` para obtener índice correcto

---

## Uso

1. Acceder a `/app/agregar-producto`
2. Completar los campos del formulario
3. Ingresar talles/colores separados por coma
4. Hacer clic en "Agregar Talles"
5. Ingresar cantidad por variante
6. Opcional: modificar códigos de barras
7. Hacer clic en "Guardar"
8. Confirmar impresión de etiquetas si se desea

---

## Dependencias

- Frappe Framework 15+
- ERPNext 15+
- JsBarcode (incluido en el HTML generado)
