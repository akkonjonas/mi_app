# Documentación Técnica Completa - mi_app (ERPNext)

## 1. Estructura del Proyecto

```
frappe-bench/
└── apps/
    └── mi_app/
        └── mi_app/
            └── productos/
                └── page/
                    └── agregar_producto/
                        ├── agregar_producto.js    (Frontend - 331 líneas)
                        ├── agregar_producto.py   (Backend - 351 líneas)
                        └── agregar_producto.json  (Definición de Page)
```

## 2. Tech Stack

- **Framework**: Frappe v15 / ERPNext v15
- **Backend**: Python 3
- **Frontend**: Vanilla JavaScript + jQuery
- **Librería de Barcode**: JsBarcode (CDN)

---

## 3. Backend (Python) - agregar_producto.py

### 3.1 Funciones expone a API

```python
# Obtiene datos para los dropdowns
@frappe.whitelist()
def get_warehouses()                           # Lista warehouses activos

@frappe.whitelist()
def get_item_groups()                           # Lista Item Groups

@frappe.whitelist()
def get_brands()                                # Lista Brands

# Crea nuevas entidades
@frappe.whitelist()
def crear_item_group(nombre)                    # Crea Item Group si no existe

@frappe.whitelist()
def crear_brand(nombre)                         # Crea Brand si no existe

# Genera códigos de barras
@frappe.whitelist()
def generar_barcodes_default(nombre, talles)    # Dict {talle: barcode}

# Función principal
@frappe.whitelist()
def crear_producto(nombre, descripcion, marca, categoria, precio, 
                   talles, warehouse, cantidades, subcategoria, 
                   barcodes_variantes)

# Impresión
@frappe.whitelist()
def generar_etiquetas_html(etiquetas)           # Retorna HTML para imprimir
```

### 3.2 Funciones internas

```python
def obtener_grupo_raiz()                         # Obtiene root Item Group

def crear_atributo_talle(talles)                # Crea/actualiza Item Attribute "Talle"

def generar_barcode(nombre, talle)              # Genera: nombre + talle sin espacios

def crear_variante_manual(template, talle, precio, categoria, marca, 
                          subcategoria, barcode_personalizado=None)

def crear_stock(items, warehouse, cantidades)   # Crea Stock Entry (Material Receipt)
```

### 3.3 Lógica de negocio - crear_producto()

```
1. VALIDACIONES
   - nombre obligatorio
   - categoría obligatoria
   - precio no negativo
   - al menos un talle

2. CREACIÓN DE ENTIDADES (si no existen)
   - Item Group (categoría)
   - Brand (marca)
   - Item Attribute (Talle)

3. CREAR ITEM PADRE (Template)
   - item_code = nombre
   - has_variants = 1
   - brand = marca
   - item_group = categoría

4. CREAR VARIANTES
   Por cada talle:
   - item_code = "nombre-talle"
   - variant_of = "nombre"
   - attributes = [{"attribute": "Talle", "attribute_value": talle}]
   - barcodes = [{"barcode": barcode}]
   - brand = marca
   - item_group = subcategoría o categoría

5. CREAR STOCK
   - Stock Entry type: "Material Receipt"
   - Por cada variante con cantidad > 0
   - Auto-submit

6. RETORNO
   - "Producto + stock + códigos de barras creados correctamente"
```

### 3.4 Estructura de datos ERPNext

**Item (Template/Padre)**
```python
{
    "doctype": "Item",
    "item_code": "ZapatillasNike",
    "item_name": "ZapatillasNike",
    "description": "Descripción...",
    "item_group": "Calzado",
    "brand": "Nike",
    "is_stock_item": 1,
    "has_variants": 1,
    "attributes": [{"attribute": "Talle"}]
}
```

**Item (Variante)**
```python
{
    "doctype": "Item",
    "item_code": "ZapatillasNike-S",
    "item_name": "ZapatillasNike S",
    "variant_of": "ZapatillasNike",
    "standard_rate": 50.00,
    "item_group": "Calzado",
    "brand": "Nike",
    "is_stock_item": 1,
    "attributes": [{"attribute": "Talle", "attribute_value": "S"}],
    "barcodes": [{"barcode": "ZapatillasNikeS"}]
}
```

**Stock Entry**
```python
{
    "doctype": "Stock Entry",
    "stock_entry_type": "Material Receipt",
    "to_warehouse": "Almacén Principal - Company",
    "company": "Company",
    "items": [
        {"item_code": "ZapatillasNike-S", "qty": 10, "t_warehouse": "..."},
        {"item_code": "ZapatillasNike-M", "qty": 15, "t_warehouse": "..."}
    ]
}
```

---

## 4. Frontend (JavaScript) - agregar_producto.js

### 4.1 Estructura del HTML generado

```html
<!-- Formulario -->
<input id="nombre" placeholder="Nombre del producto">
<textarea id="descripcion"></textarea>

<!-- Marca + Subcategoría -->
<select id="marca"><option>Seleccionar...</option></select>
<button onclick="agregarNuevaMarca()">+</button>

<select id="subcategoria"><option>Seleccionar...</option></select>
<button onclick="agregarNuevaSubcategoria()">+</button>

<!-- Categoría + Precio -->
<select id="categoria"><option>Seleccionar...</option></select>
<button onclick="agregarNuevaCategoria()">+</button>
<input id="precio" type="number">

<select id="warehouse"></select>

<input id="talles" placeholder="S, M, L, XL">

<!-- Contenedor dinámico -->
<div id="talles-container" style="display:none;">
    <div id="cantidades-talles">
        <!-- Por cada talle: -->
        <div class="form-row">
            <strong>S</strong>
            <input class="cantidad-talle" data-talle="S">
            <input class="barcode-talle" data-talle="S">
        </div>
    </div>
</div>

<button onclick="actualizarTalles()">Agregar Talles</button>
<button onclick="crearProducto()">Guardar</button>
```

### 4.2 Funciones JavaScript

```javascript
// Inicialización - se ejecuta al cargar la página
frappe.pages['agregar-producto'].on_page_load = function(wrapper) {
    // Genera HTML del formulario
    // Llama: cargarWarehouses(), cargarItemGroups(), cargarMarcas()
}

// Carga datos para dropdowns
function cargarWarehouses()    // get_warehouses()
function cargarItemGroups()    // get_item_groups() → llena categoría y subcategoría
function cargarMarcas()       // get_brands()

// Crear nuevas entidades
function agregarNuevaMarca()       // prompt + crear_brand
function agregarNuevaCategoria()   // prompt + crear_item_group
function agregarNuevaSubcategoria() // prompt + crear_item_group

// Genera inputs dinámicos
function actualizarTalles() {
    // 1. Limpia contenedor
    // 2. Por cada talle: genera input cantidad + input barcode
    // 3. Muestra contenedor
    // 4. Llama backend para generar_barcodes_default
}

// Envía datos al backend
function crearProducto() {
    // 1. Recolecta cantidades y barcodes de inputs
    // 2. Llama crear_producto con todos los params
    // 3. En callback: pregunta si imprimir etiquetas
}

// Impresión
function imprimirEtiquetas(nombre, cantidades, barcodes_variantes) {
    // 1. Genera array de etiquetas (1 por cantidad)
    // 2. Llama generar_etiquetas_html
    // 3. Abre window.print() con el HTML recibido
}
```

### 4.3 Llamadas a API Frappe

```javascript
frappe.call({
    method: "ruta.completa.del.metodo",
    args: { param1: valor1, param2: valor2 },
    callback: function(r) {
        // r.message contiene el retorno del backend
    }
})
```

---

## 5. Generación de Etiquetas

### 5.1 Input (Python)

```python
etiquetas = [
    {"nombre": "ZapatillasNike", "talle": "S", "barcode": "ZapatillasNikeS"},
    {"nombre": "ZapatillasNike", "talle": "S", "barcode": "ZapatillasNikeS"},
    {"nombre": "ZapatillasNike", "talle": "M", "barcode": "ZapatillasNikeM"},
]
```

### 5.2 Output (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
    <style>
        @page { size: 50mm 25mm; margin: 0; }
        .etiqueta { width: 50mm; height: 25mm; float: left; padding: 2mm; }
        .nombre { font-size: 8px; font-weight: bold; text-align: center; }
        .talle { font-size: 10px; text-align: center; }
        svg { width: 100%; height: 20mm; }
    </style>
</head>
<body>
    <div class="etiqueta">
        <div class="nombre">ZapatillasNike</div>
        <div class="talle">S</div>
        <svg id="barcode-0"></svg>
    </div>
    <script>
        JsBarcode("#barcode-0", "ZapatillasNikeS", {
            format: "CODE128",
            width: 2,
            height: 30,
            displayValue: true,
            fontSize: 10,
            margin: 5
        });
    </script>
</body>
</html>
```

---

## 6. Código de Barras

### 6.1 Generación (Python)

```python
def generar_barcode(nombre, talle):
    nombre_limpio = nombre.replace(" ", "").upper()  # sin espacios
    talle_limpio = talle.upper()
    return f"{nombre_limpio}{talle_limpio}"          # concatenado
```

### 6.2 Resultado

| Nombre | Talle | Barcode |
|--------|-------|---------|
| Zapatillas Nike | S | ZapatillasNikeS |
| Zapatillas Nike | M | ZapatillasNikeM |
| Billetera Raquel | Rojo | BilleteraRaquelRojo |

---

## 7. Flags de ERPNext utilizados

| Campo | Valor | Descripción |
|-------|-------|-------------|
| `is_stock_item` | 1 | Maneja stock |
| `has_variants` | 1 | Es template de variantes |
| `variant_of` | (item_code) | Referencia al template |
| `standard_rate` | float | Precio de venta |
| `is_group` | 0 | No es grupo (en Item Group) |

---

## 8. Rutas de acceso

- **URL**: `/app/agregar-producto`
- **Pathbench**: `agregar_producto.json` define la Page

---

## 9. Workflow completo

```
1. Usuario entra a /app/agregar-producto
2. Se cargan: warehouses, item_groups, brands
3. Usuario llena: nombre, descripción, marca, categoría, precio, talles
4. Usuario hace clic en "Agregar Talles"
5. Backend genera barcodes por defecto (nombre + talle sin espacios)
6. Usuario ingresa cantidades por talle
7. Usuario hace clic en "Guardar"
8. Backend:
   - Crea Item Group si no existe
   - Crea Brand si no existe
   - Crea/actualiza Item Attribute "Talle"
   - Crea Item Template (padre)
   - Crea Item Variantes con barcodes
   - Crea Stock Entry (Material Receipt)
9. Frontend pregunta: "¿Imprimir etiquetas?"
10. Si acepta → abre ventana con etiquetas para imprimir
```

---

## 10. Notas para modificaciones

### Para agregar un nuevo campo al formulario:
1. **Frontend**: Agregar input en el HTML dentro de `on_page_load`
2. **Frontend**: Agregar en `crearProducto()` args
3. **Backend**: Agregar parámetro en `crear_producto()`
4. **Backend**: Usar el valor en la lógica correspondiente

### Para cambiar el tamaño de etiqueta:
- Modificar CSS en `generar_etiquetas_html`:
  - `@page { size: 50mm 25mm; }`
  - `.etiqueta { width: 50mm; height: 25mm; }`

### Para cambiar formato de barcode:
- Modificar en `generar_etiquetas_html`:
  - `format: "CODE128"` (actual)
  - Opciones: "EAN13", "EAN8", "UPC", "CODE39"

### Para agregar más atributos (ej: Color):
1. **Backend**: Modificar `crear_atributo_talle` y `crear_variante_manual`
2. **Frontend**: Agregar input para nuevos atributos
3. **Frontend**: Modificar lógica de variantes
