import frappe
import json


@frappe.whitelist()
def get_warehouses():
	warehouses = frappe.get_all("Warehouse", filters={"is_group": 0}, fields=["name"], order_by="name")
	return [w.name for w in warehouses]


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
	return f"{nombre[:5].upper()}{talle}{frappe.generate_hash(length=5)}"


# 🔹 Crear variante
def crear_variante_manual(template, talle, precio, categoria):
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
			"item_group": categoria,
			"is_stock_item": 1,
		}
	)

	# 🔹 atributo
	variante.append("attributes", {"attribute": "Talle", "attribute_value": talle})

	# 🔥 código de barras
	barcode = generar_barcode(template, talle)

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
def crear_producto(nombre, descripcion, marca, categoria, precio, talles, warehouse=None, cantidades=None):
	# 🔴 VALIDACIONES
	if not nombre:
		frappe.throw("El nombre del producto es obligatorio")

	if not categoria:
		frappe.throw("La categoría es obligatoria")

	if precio is not None and float(precio) < 0:
		frappe.throw("El precio no puede ser negativo")

	lista_talles = [t.strip().replace(".", "") for t in talles.split(",") if t.strip()]

	if not lista_talles:
		frappe.throw("Debe ingresar al menos un talle")

	if isinstance(cantidades, str):
		cantidades = json.loads(cantidades)

	if not cantidades:
		cantidades = {}

	# 🔹 Categoría
	if not frappe.db.exists("Item Group", categoria):
		frappe.get_doc(
			{
				"doctype": "Item Group",
				"item_group_name": categoria,
				"parent_item_group": obtener_grupo_raiz(),
				"is_group": 0,
			}
		).insert()

	# 🔹 Marca
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
		item_code = crear_variante_manual(nombre, t, precio, categoria)
		items_creados.append(item_code)

	# 🔥 CREAR STOCK
	if warehouse and cantidades:
		crear_stock(items_creados, warehouse, cantidades)

	return "Producto + stock + códigos de barras creados correctamente"
