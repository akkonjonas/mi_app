import frappe
import json


@frappe.whitelist()
def get_warehouses():
	warehouses = frappe.get_all("Warehouse", filters={"is_group": 0}, fields=["name"], order_by="name")
	return [w.name for w in warehouses]


@frappe.whitelist()
def get_item_groups():
	grupos = frappe.get_all("Item Group", fields=["name"], order_by="name")
	return [g.name for g in grupos]


@frappe.whitelist()
def get_brands():
	marcas = frappe.get_all("Brand", fields=["name"], order_by="name")
	return [m.name for m in marcas]


@frappe.whitelist()
def generar_barcodes_default(nombre, talles):
	lista_talles = [t.strip() for t in talles.split(",") if t.strip()]
	barcodes = {}
	for t in lista_talles:
		barcodes[t] = generar_barcode(nombre, t)
	return barcodes


@frappe.whitelist()
def crear_item_group(nombre):
	if frappe.db.exists("Item Group", nombre):
		frappe.throw(f"La categoría '{nombre}' ya existe")
	frappe.get_doc(
		{
			"doctype": "Item Group",
			"item_group_name": nombre,
			"parent_item_group": obtener_grupo_raiz(),
			"is_group": 0,
		}
	).insert()
	return nombre


@frappe.whitelist()
def crear_brand(nombre):
	if frappe.db.exists("Brand", nombre):
		frappe.throw(f"La marca '{nombre}' ya existe")
	frappe.get_doc({"doctype": "Brand", "brand": nombre}).insert()
	return nombre


def obtener_grupo_raiz():
	grupo = frappe.get_all(
		"Item Group",
		filters={"is_group": 1, "parent_item_group": ["in", ["", None]]},
		fields=["name"],
		limit=1,
	)

	if not grupo:
		frappe.throw("No se encontró grupo raíz de productos")

	return grupo[0].name


# 🔹 Crear atributo Talle
def crear_atributo_talle(talles):
	if not frappe.db.exists("Item Attribute", "Talle"):
		attr = frappe.get_doc(
			{"doctype": "Item Attribute", "attribute_name": "Talle", "item_attribute_values": []}
		)

		for t in talles:
			valor = t.strip()
			attr.append("item_attribute_values", {"attribute_value": valor, "abbr": valor})

		attr.insert()

	else:
		attr = frappe.get_doc("Item Attribute", "Talle")

		valores_existentes = [v.attribute_value for v in attr.item_attribute_values]

		for t in talles:
			valor = t.strip()
			if valor not in valores_existentes:
				attr.append("item_attribute_values", {"attribute_value": valor, "abbr": valor})

		attr.save()


# 🔥 Generar código de barras
def generar_barcode(nombre, talle):
	nombre_limpio = nombre.replace(" ", "").upper()
	talle_limpio = talle.upper()
	return f"{nombre_limpio}{talle_limpio}"


# 🔹 Crear variante
def crear_variante_manual(
	template, talle, precio, categoria, marca, subcategoria, barcode_personalizado=None
):
	nombre_variante = f"{template}-{talle}"

	if frappe.db.exists("Item", nombre_variante):
		return nombre_variante

	variante = frappe.get_doc(
		{
			"doctype": "Item",
			"item_code": nombre_variante,
			"item_name": f"{template} {talle}",
			"variant_of": template,
			"standard_rate": float(precio),
			"item_group": subcategoria if subcategoria else categoria,
			"brand": marca,
			"is_stock_item": 1,
		}
	)

	variante.append("attributes", {"attribute": "Talle", "attribute_value": talle})

	barcode = barcode_personalizado if barcode_personalizado else generar_barcode(template, talle)
	variante.append("barcodes", {"barcode": barcode})

	variante.insert()

	return nombre_variante


# 🔥 Crear stock automático
def crear_stock(items, warehouse, cantidades):
	if not warehouse:
		frappe.throw("El warehouse es obligatorio")

	wh_doc = frappe.get_doc("Warehouse", warehouse)
	compania = wh_doc.company

	stock_entry = frappe.get_doc(
		{
			"doctype": "Stock Entry",
			"stock_entry_type": "Material Receipt",
			"to_warehouse": warehouse,
			"company": compania,
			"items": [],
		}
	)

	for item_code in items:
		talle = item_code.split("-")[-1]
		qty = cantidades.get(talle, 0)
		if qty > 0:
			stock_entry.append(
				"items",
				{
					"item_code": item_code,
					"qty": qty,
					"t_warehouse": warehouse,
				},
			)

	if not stock_entry.items:
		frappe.throw("No hay cantidades válidas para crear stock")

	stock_entry.insert()
	stock_entry.submit()


# 🔥 FUNCIÓN PRINCIPAL
@frappe.whitelist()
def crear_producto(
	nombre,
	descripcion,
	marca,
	categoria,
	precio,
	talles,
	warehouse=None,
	cantidades=None,
	subcategoria=None,
	barcodes_variantes=None,
	es_edicion=False,
	nombre_original=None,
):
	# 🔴 VALIDACIONES
	if not nombre:
		frappe.throw("El nombre del producto es obligatorio")

	if not descripcion:
		frappe.throw("La descripción es obligatoria")

	if precio is None or precio == "":
		frappe.throw("El precio es obligatorio")

	if es_edicion:
		if nombre_original and nombre_original != nombre:
			if frappe.db.exists("Item", nombre):
				frappe.throw(f"El producto '{nombre}' ya existe")
	else:
		if frappe.db.exists("Item", nombre):
			frappe.throw(f"El producto '{nombre}' ya existe")

	if not categoria:
		frappe.throw("La categoría es obligatoria")

	if not talles or not talles.strip():
		frappe.throw("Los atributos son obligatorios")

	lista_talles = [t.strip().replace(".", "") for t in talles.split(",") if t.strip()]

	if not lista_talles:
		frappe.throw("Debe ingresar al menos un atributo")

	if isinstance(cantidades, str):
		cantidades = json.loads(cantidades)

	if not cantidades:
		cantidades = {}

	if isinstance(barcodes_variantes, str):
		barcodes_variantes = json.loads(barcodes_variantes)

	if not barcodes_variantes:
		barcodes_variantes = {}

	if not es_edicion:
		for talle in lista_talles:
			nombre_variante = f"{nombre}-{talle}"
			if frappe.db.exists("Item", nombre_variante):
				frappe.throw(f"La variante '{nombre_variante}' ya existe")

		barcodes_a_verificar = {}
		for t in lista_talles:
			barcodes_a_verificar[t] = (
				barcodes_variantes.get(t) if barcodes_variantes.get(t) else generar_barcode(nombre, t)
			)

		for talle, barcode in barcodes_a_verificar.items():
			if barcode:
				barcode_existe = frappe.db.sql(
					"SELECT COUNT(*) FROM `tabItem Barcode` WHERE barcode = %s", (barcode,)
				)[0][0]
				if barcode_existe > 0:
					frappe.throw(f"El código de barras '{barcode}' ya está en uso")

	# 🔹 Categoría (solo crea si no existe - el usuario selecciona del dropdown)
	if not frappe.db.exists("Item Group", categoria):
		frappe.get_doc(
			{
				"doctype": "Item Group",
				"item_group_name": categoria,
				"parent_item_group": obtener_grupo_raiz(),
				"is_group": 0,
			}
		).insert()

	# 🔹 Marca (solo crea si no existe)
	if marca and not frappe.db.exists("Brand", marca):
		frappe.get_doc({"doctype": "Brand", "brand": marca}).insert()

	# 🔹 Atributo
	crear_atributo_talle(lista_talles)

	# 🔹 ITEM PADRE
	if not frappe.db.exists("Item", nombre):
		item = frappe.get_doc(
			{
				"doctype": "Item",
				"item_code": nombre,
				"item_name": nombre,
				"description": descripcion or nombre,
				"item_group": categoria,
				"brand": marca,
				"is_stock_item": 1,
				"has_variants": 1,
			}
		)

		item.append("attributes", {"attribute": "Talle"})

		item.insert()

	# 🔹 CREAR VARIANTES
	items_creados = []

	for t in lista_talles:
		barcode_personalizado = barcodes_variantes.get(t) if barcodes_variantes else None
		item_code = crear_variante_manual(
			nombre, t, precio, categoria, marca, subcategoria, barcode_personalizado
		)
		items_creados.append(item_code)

	# 🔥 CREAR STOCK
	if warehouse and cantidades:
		crear_stock(items_creados, warehouse, cantidades)

	return "Producto + stock + códigos de barras creados correctamente"


@frappe.whitelist()
def generar_etiquetas_html(etiquetas):
	if isinstance(etiquetas, str):
		etiquetas = json.loads(etiquetas)

	html = """
	<!DOCTYPE html>
	<html>
	<head>
		<title>Etiquetas</title>
		<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
		<style>
			@page { size: 50mm 25mm; margin: 0; }
			body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
			.etiqueta {
				width: 50mm;
				height: 25mm;
				float: left;
				box-sizing: border-box;
				padding: 2mm;
				border: 1px dashed #ccc;
				overflow: hidden;
			}
			.etiqueta .nombre {
				font-size: 8px;
				font-weight: bold;
				text-align: center;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.etiqueta .talle {
				font-size: 10px;
				text-align: center;
				margin: 1mm 0;
			}
			.etiqueta svg {
				width: 100%;
				height: 20mm;
			}
		</style>
	</head>
	<body>
	"""

	for i, etiqueta in enumerate(etiquetas):
		nombre = etiqueta.get("nombre", "")
		talle = etiqueta.get("talle", "")
		barcode = etiqueta.get("barcode", "")
		html += f"""
		<div class="etiqueta">
			<div class="nombre">{nombre}</div>
			<div class="talle">{talle}</div>
			<svg id="barcode-{i}"></svg>
		</div>
		"""

	html += """
	<script>
	"""

	barcodes_js = ""
	for i, etiqueta in enumerate(etiquetas):
		barcode = etiqueta.get("barcode", "")
		barcodes_js += f"""
		try {{
			JsBarcode("#barcode-{i}", "{barcode}", {{
				format: "CODE128",
				width: 2,
				height: 30,
				displayValue: true,
				fontSize: 10,
				margin: 5
			}});
		}} catch(e) {{ console.log("Error: " + "{barcode}"); }}
		"""

	html += (
		barcodes_js
		+ """
	</script>
	</body>
	</html>
	"""
	)

	return html


@frappe.whitelist()
def get_items_list(filters=None):
	if isinstance(filters, str):
		filters = json.loads(filters) if filters else {}

	f = {"is_stock_item": 1, "variant_of": ["!=", ""]}

	if filters.get("search"):
		f["item_code"] = ["like", f"%{filters.get('search')}%"]
	if filters.get("marca"):
		f["brand"] = filters.get("marca")
	if filters.get("categoria"):
		f["item_group"] = filters.get("categoria")

	items = frappe.get_all(
		"Item",
		filters=f,
		fields=["name", "item_code", "item_name", "brand", "item_group", "standard_rate", "qty"],
		order_by="modified desc",
		limit=50,
	)

	return [
		{
			"name": i.name,
			"item_code": i.item_code,
			"brand": i.brand or "",
			"item_group": i.item_group or "",
			"precio": i.standard_rate or 0,
		}
		for i in items
	]
