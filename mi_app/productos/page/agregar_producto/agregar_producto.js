frappe.pages['agregar-producto'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Agregar Producto',
        single_column: true
    });

    window.productosCreados = [];
    window.tabIndex = 10;

    $(wrapper).html(`
        <div class="form-layout">
            <h3>Nuevo Producto</h3>

            <div class="form-group">
                <label>Nombre *</label>
                <input id="nombre" class="form-control" placeholder="Nombre del producto" tabindex="1">
            </div>

            <div class="form-group">
                <label>Descripción</label>
                <textarea id="descripcion" class="form-control" placeholder="Descripción" tabindex="2"></textarea>
            </div>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Marca</label>
                    <div class="input-group">
                        <select id="marca" class="form-control" tabindex="3">
                            <option value="">Seleccionar...</option>
                        </select>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="agregarNuevaMarca()" title="Agregar nueva marca" tabindex="-1">+</button>
                        </span>
                    </div>
                </div>
                <div class="col">
                    <label>Categoría *</label>
                    <div class="input-group">
                        <select id="categoria" class="form-control" tabindex="4">
                            <option value="">Seleccionar...</option>
                        </select>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="agregarNuevaCategoria()" title="Agregar nueva categoría" tabindex="-1">+</button>
                        </span>
                    </div>
                </div>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Subcategoría</label>
                    <div class="input-group">
                        <select id="subcategoria" class="form-control" tabindex="5">
                            <option value="">Seleccionar...</option>
                        </select>
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" onclick="agregarNuevaSubcategoria()" title="Agregar nueva subcategoría" tabindex="-1">+</button>
                        </span>
                    </div>
                </div>
                <div class="col">
                    <label>Precio</label>
                    <input id="precio" class="form-control" type="number" step="0.01" placeholder="Precio" tabindex="6">
                </div>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Warehouse</label>
                    <select id="warehouse" class="form-control" tabindex="7"></select>
                </div>
            </div>

            <div class="form-group" style="margin-top: 10px;">
                <label>
                    <input type="checkbox" id="usar-stock-minimo"> Agregar stock mínimo a todas las variantes
                </label>
            </div>
            <div id="stock-minimo-container" class="form-group" style="display:none;">
                <label>Stock mínimo por variante</label>
                <input type="number" id="stock-minimo" class="form-control" placeholder="Cantidad mínima" min="0" value="1">
            </div>

            <div class="form-group">
                <label>Talles (separados por coma) *</label>
                <input id="talles" class="form-control" placeholder="S, M, L, XL">
            </div>

            <div id="talles-container" class="form-group" style="display:none;">
                <label>Cantidad por talle:</label>
                <div id="cantidades-talles"></div>
            </div>

            <button onclick="actualizarTalles()" class="btn btn-default" tabindex="9">Agregar Talles</button>
            <button onclick="crearProducto()" class="btn btn-primary" tabindex="100">Guardar</button>
            <button onclick="limpiarFormulario()" class="btn btn-default" tabindex="101">Limpiar</button>
            <button onclick="imprimirTodasEtiquetas()" class="btn btn-info" style="display:none;" id="btn-imprimir-todas" tabindex="102">Imprimir Todas las Etiquetas</button>
        </div>
        
        <div class="form-layout" style="margin-top: 30px;">
            <h4>Productos Creados</h4>
            <div id="lista-productos-creados"></div>
        </div>
    `);

    cargarWarehouses();
    cargarItemGroups();
    cargarMarcas();
    
    $("#usar-stock-minimo").change(function() {
        $("#stock-minimo-container").toggle(this.checked);
    });
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
            },
            error: function(r) {
                frappe.msgprint("Error: La marca '" + nombre.trim() + "' ya existe");
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
            },
            error: function(r) {
                frappe.msgprint("Error: La categoría '" + nombre.trim() + "' ya existe");
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
            },
            error: function(r) {
                frappe.msgprint("Error: La subcategoría '" + nombre.trim() + "' ya existe");
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
    var tabStock = 10;
    var tabBarcode = 20;
    
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
                        <input type="number" class="form-control cantidad-talle" data-talle="${talle}" placeholder="Stock" min="0" tabindex="${tabStock}">
                    </div>
                    <div class="col-md-6">
                        <input type="text" class="form-control barcode-talle" data-talle="${talle}" placeholder="Código de barras" value="" tabindex="${tabBarcode}">
                    </div>
                </div>
            `);
            tabStock++;
            tabBarcode++;
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

    let usarStockMinimo = $("#usar-stock-minimo").is(":checked");
    let stockMinimo = parseInt($("#stock-minimo").val()) || 0;

    if (usarStockMinimo && stockMinimo > 0) {
        let tallesInput = $("#talles").val().split(",");
        tallesInput.forEach(function(t) {
            let talle = t.trim();
            if (talle) {
                if (!cantidades[talle]) {
                    cantidades[talle] = 0;
                }
                cantidades[talle] += stockMinimo;
            }
        });
    }

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
            
            let usarStockMinimo = $("#usar-stock-minimo").is(":checked");
            let stockMinimo = parseInt($("#stock-minimo").val()) || 0;
            
            let producto = {
                nombre: $("#nombre").val(),
                descripcion: $("#descripcion").val(),
                marca: $("#marca").val(),
                categoria: $("#categoria").val(),
                subcategoria: $("#subcategoria").val(),
                precio: $("#precio").val(),
                warehouse: $("#warehouse").val(),
                usarStockMinimo: usarStockMinimo,
                stockMinimo: stockMinimo,
                cantidades: cantidades,
                barcodes: barcodes_variantes
            };
            window.productosCreados.push(producto);
            
            actualizarListaProductos();
            limpiarFormulario();
        }
    });
}

function limpiarFormulario() {
    $("#nombre").val("");
    $("#descripcion").val("");
    $("#marca").val("");
    $("#categoria").val("");
    $("#subcategoria").val("");
    $("#precio").val("");
    $("#talles").val("");
    $("#cantidades-talles").html("");
    $("#talles-container").hide();
    $("#usar-stock-minimo").prop("checked", false);
    $("#stock-minimo-container").hide();
    $("#stock-minimo").val("1");
    $("#nombre").focus();
}

function actualizarListaProductos() {
    let container = $("#lista-productos-creados");
    container.html("");
    
    window.productosCreados.forEach(function(prod, index) {
        let talles = Object.keys(prod.cantidades).join(", ");
        let totalStock = Object.values(prod.cantidades).reduce((a,b)=>a+b, 0);
        let html = `
            <div class="form-row" style="margin-bottom: 5px; padding: 5px; border-bottom: 1px solid #eee; align-items: center;">
                <div class="col-md-3"><strong>${prod.nombre}</strong></div>
                <div class="col-md-3">Talles: ${talles}</div>
                <div class="col-md-2">Stock: ${totalStock}</div>
                <div class="col-md-2">
                    <button class="btn btn-xs btn-default" onclick="editarProducto(${index})" title="Editar">✏️</button>
                    <button class="btn btn-xs btn-danger" onclick="eliminarProducto(${index})" title="Eliminar">🗑️</button>
                </div>
                <div class="col-md-2">
                    <button class="btn btn-xs btn-info" onclick="imprimirProductoIndividual(${index})" title="Imprimir etiquetas">🖨️</button>
                </div>
            </div>
        `;
        container.append(html);
    });
    
    if (window.productosCreados.length > 0) {
        $("#btn-imprimir-todas").show();
    }
}

function editarProducto(index) {
    let prod = window.productosCreados[index];
    
    $("#nombre").val(prod.nombre);
    $("#descripcion").val(prod.descripcion || "");
    $("#marca").val(prod.marca || "");
    $("#categoria").val(prod.categoria || "");
    $("#subcategoria").val(prod.subcategoria || "");
    $("#precio").val(prod.precio || "");
    $("#warehouse").val(prod.warehouse || "");
    $("#talles").val(Object.keys(prod.cantidades).join(", "));
    $("#usar-stock-minimo").prop("checked", prod.usarStockMinimo || false);
    $("#stock-minimo").val(prod.stockMinimo || 1);
    $("#stock-minimo-container").toggle(prod.usarStockMinimo || false);
    
    actualizarTalles();
    
    setTimeout(function() {
        $(".cantidad-talle").each(function() {
            let talle = $(this).data("talle");
            if (prod.cantidades[talle] !== undefined) {
                $(this).val(prod.cantidades[talle]);
            }
        });
        
        $(".barcode-talle").each(function() {
            let talle = $(this).data("talle");
            if (prod.barcodes[talle]) {
                $(this).val(prod.barcodes[talle]);
            }
        });
    }, 100);
    
    window.productosCreados.splice(index, 1);
    actualizarListaProductos();
    
    frappe.msgprint("Editando producto: " + prod.nombre);
}

function eliminarProducto(index) {
    let prod = window.productosCreados[index];
    window.productosCreados.splice(index, 1);
    actualizarListaProductos();
    frappe.msgprint("Producto eliminado: " + prod.nombre);
}

function imprimirProductoIndividual(index) {
    let prod = window.productosCreados[index];
    let etiquetas = [];
    
    for (let [talle, qty] of Object.entries(prod.cantidades)) {
        let barcode = prod.barcodes[talle] || "";
        for (let i = 0; i < qty; i++) {
            etiquetas.push({
                nombre: prod.nombre,
                talle: talle,
                barcode: barcode
            });
        }
    }
    
    if (etiquetas.length === 0) {
        frappe.msgprint("No hay etiquetas para imprimir");
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
        }
    });
}

function imprimirTodasEtiquetas() {
    let todasEtiquetas = [];
    
    window.productosCreados.forEach(function(prod) {
        for (let [talle, qty] of Object.entries(prod.cantidades)) {
            let barcode = prod.barcodes[talle] || "";
            for (let i = 0; i < qty; i++) {
                todasEtiquetas.push({
                    nombre: prod.nombre,
                    talle: talle,
                    barcode: barcode
                });
            }
        }
    });
    
    if (todasEtiquetas.length === 0) {
        frappe.msgprint("No hay etiquetas para imprimir");
        return;
    }
    
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.generar_etiquetas_html",
        args: {
            etiquetas: JSON.stringify(todasEtiquetas)
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
