import frappe
import json

@frappe.whitelist()
def crear_transferencia(items, destino):

    if isinstance(items, str):
        items = json.loads(items)

    stock_entry = frappe.new_doc("Stock Entry")

    stock_entry.stock_entry_type = "Material Transfer"

    stock_entry.from_warehouse = "Depósito Principal - AJ"

    stock_entry.to_warehouse = destino

    for item in items:

        stock_entry.append("items", {

            "item_code": item["item_code"],
            "qty": item["qty"],
            "s_warehouse": "Depósito Principal - AJ",
            "t_warehouse": destino

        })

    stock_entry.insert()
    stock_entry.submit()

    return stock_entry.name
