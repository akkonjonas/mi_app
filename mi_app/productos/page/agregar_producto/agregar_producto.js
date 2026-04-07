frappe.pages['agregar-producto'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Agregar Producto',
        single_column: true
    });

    $(wrapper).html(`
        <div class="form-layout">
            <h3>Nuevo Producto</h3>

            <div class="form-group">
                <label>Nombre *</label>
                <input id="nombre" class="form-control" placeholder="Nombre del producto">
            </div>

            <div class="form-group">
                <label>Descripción</label>
                <textarea id="descripcion" class="form-control" placeholder="Descripción"></textarea>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Marca</label>
                    <div class="input-group">
                        <select id="marca" class="form-control">
                            <option value="">Seleccionar...</option>
                        </select>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="agregarNuevaMarca()" title="Agregar nueva marca">+</button>
                        </span>
                    </div>
                </div>
                <div class="col">
                    <label>Categoría *</label>
                    <div class="input-group">
                        <select id="categoria" class="form-control">
                            <option value="">Seleccionar...</option>
                        </select>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="agregarNuevaCategoria()" title="Agregar nueva categoría">+</button>
                        </span>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Subcategoría</label>
                    <div class="input-group">
                        <select id="subcategoria" class="form-control">
                            <option value="">Seleccionar...</option>
                        </select>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="agregarNuevaSubcategoria()" title="Agregar nueva subcategoría">+</button>
                        </span>
                    </div>
                </div>
                <div class="col">
                    <label>Precio</label>
                    <input id="precio" class="form-control" type="number" step="0.01" placeholder="Precio">
                </div>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Warehouse</label>
                    <select id="warehouse" class="form-control"></select>
                </div>
            </div>

            <div class="form-group">
                <label>Talles (separados por coma) *</label>
                <input id="talles" class="form-control" placeholder="S, M, L, XL">
            </div>

            <div id="talles-container" class="form-group" style="display:none;">
                <label>Cantidad por talle:</label>
                <div id="cantidades-talles"></div>
            </div>

            <button onclick="actualizarTalles()" class="btn btn-default">Agregar Talles</button>
            <button onclick="crearProducto()" class="btn btn-primary">Guardar</button>
        </div>
    `);

    cargarWarehouses();
    cargarItemGroups();
    cargarMarcas();
};

function cargarWarehouses() {
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.get_warehouses",
        callback: function(r) {
            if (r.message) {
                var select = $("#warehouse");
                r.message.forEach(function(w) {
                    select.append(new Option(w, w));
                });
            }
        }
    });
}

function cargarItemGroups() {
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.get_item_groups",
        callback: function(r) {
            if (r.message) {
                var catSelect = $("#categoria");
                var subSelect = $("#subcategoria");
                r.message.forEach(function(g) {
                    catSelect.append(new Option(g, g));
                    subSelect.append(new Option(g, g));
                });
            }
        }
    });
}

function cargarMarcas() {
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.get_brands",
        callback: function(r) {
            if (r.message) {
                var select = $("#marca");
                r.message.forEach(function(m) {
                    select.append(new Option(m, m));
                });
            }
        }
    });
}

function agregarNuevaMarca() {
    var nombre = prompt("Ingrese el nombre de la nueva marca:");
    if (nombre && nombre.trim()) {
        frappe.call({
            method: "mi_app.productos.page.agregar_producto.agregar_producto.crear_brand",
            args: { nombre: nombre.trim() },
            callback: function(r) {
                if (r.message) {
                    $("#marca").append(new Option(r.message, r.message));
                    $("#marca").val(r.message);
                    frappe.msgprint("Marca creada: " + r.message);
                }
            }
        });
    }
}

function agregarNuevaCategoria() {
    var nombre = prompt("Ingrese el nombre de la nueva categoría:");
    if (nombre && nombre.trim()) {
        frappe.call({
            method: "mi_app.productos.page.agregar_producto.agregar_producto.crear_item_group",
            args: { nombre: nombre.trim() },
            callback: function(r) {
                if (r.message) {
                    $("#categoria").append(new Option(r.message, r.message));
                    $("#categoria").val(r.message);
                    frappe.msgprint("Categoría creada: " + r.message);
                }
            }
        });
    }
}

function agregarNuevaSubcategoria() {
    var nombre = prompt("Ingrese el nombre de la nueva subcategoría:");
    if (nombre && nombre.trim()) {
        frappe.call({
            method: "mi_app.productos.page.agregar_producto.agregar_producto.crear_item_group",
            args: { nombre: nombre.trim() },
            callback: function(r) {
                if (r.message) {
                    $("#subcategoria").append(new Option(r.message, r.message));
                    $("#subcategoria").val(r.message);
                    frappe.msgprint("Subcategoría creada: " + r.message);
                }
            }
        });
    }
}

function actualizarTalles() {
    var nombre = $("#nombre").val().trim();
    var tallesInput = $("#talles").val().split(",");
    var container = $("#cantidades-talles");
    var containerPadre = $("#talles-container");
    
    container.empty();
    
    var hayTalles = false;
    tallesInput.forEach(function(t) {
        var talle = t.trim();
        if (talle) {
            hayTalles = true;
            container.append(`
                <div class="form-row" style="margin-bottom: 10px;">
                    <div class="col-md-2">
                        <strong>${talle}</strong>
                    </div>
                    <div class="col-md-4">
                        <input type="number" class="form-control cantidad-talle" data-talle="${talle}" placeholder="Cantidad" min="0">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control barcode-talle" data-talle="${talle}" placeholder="Código de barras" value="">
                    </div>
                </div>
            `);
        }
    });
    
    containerPadre.toggle(hayTalles);
    
    if (nombre && hayTalles) {
        frappe.call({
            method: "mi_app.productos.page.agregar_producto.agregar_producto.generar_barcodes_default",
            args: {
                nombre: nombre.replace(/\s+/g, ""),
                talles: $("#talles").val()
            },
            callback: function(r) {
                if (r.message) {
                    $(".barcode-talle").each(function() {
                        var talle = $(this).data("talle");
                        if (r.message[talle]) {
                            $(this).val(r.message[talle]);
                        }
                    });
                }
            }
        });
    }
}

function crearProducto() {
    let cantidades = {};
    let barcodes_variantes = {};

    $(".cantidad-talle").each(function() {
        let talle = $(this).data("talle");
        let qty = $(this).val() || 0;
        if (talle && qty > 0) {
            cantidades[talle] = parseInt(qty);
        }
    });

    $(".barcode-talle").each(function() {
        let talle = $(this).data("talle");
        let barcode = $(this).val().replace(/\s+/g, "");
        if (talle && barcode) {
            barcodes_variantes[talle] = barcode;
        }
    });

    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.crear_producto",
        args: {
            nombre: $("#nombre").val(),
            descripcion: $("#descripcion").val(),
            marca: $("#marca").val(),
            categoria: $("#categoria").val(),
            subcategoria: $("#subcategoria").val(),
            precio: $("#precio").val(),
            warehouse: $("#warehouse").val(),
            talles: $("#talles").val(),
            cantidades: cantidades,
            barcodes_variantes: barcodes_variantes
        },
        callback: function(r) {
            frappe.msgprint("Producto creado correctamente");
            
            if (Object.keys(cantidades).length > 0) {
                frappe.confirm(
                    '¿Desea imprimir las etiquetas de código de barras?',
                    function() {
                        imprimirEtiquetas($("#nombre").val(), cantidades, barcodes_variantes);
                    },
                    function() {
                        window.location.reload();
                    }
                );
            } else {
                window.location.reload();
            }
        }
    });
}

function imprimirEtiquetas(nombre, cantidades, barcodes_variantes) {
    let etiquetas = [];
    
    for (let [talle, qty] of Object.entries(cantidades)) {
        let barcode = barcodes_variantes[talle] || "";
        for (let i = 0; i < qty; i++) {
            etiquetas.push({
                nombre: nombre,
                talle: talle,
                barcode: barcode
            });
        }
    }
    
    if (etiquetas.length === 0) {
        frappe.msgprint("No hay etiquetas para imprimir");
        window.location.reload();
        return;
    }
    
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.generar_etiquetas_html",
        args: {
            etiquetas: JSON.stringify(etiquetas)
        },
        callback: function(r) {
            if (r.message) {
                let printWindow = window.open('', '_blank');
                printWindow.document.write(r.message);
                printWindow.document.close();
                setTimeout(function() {
                    printWindow.print();
                }, 500);
            }
            window.location.reload();
        }
    });
}
