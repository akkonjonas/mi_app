frappe.pages['agregar-producto'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Agregar Producto',
        single_column: true
    });

    window.productosCreados = [];
    window.esEdicion = false;
    window.nombreOriginalEdicion = null;

    $(wrapper).html(`
        <style>
            .agregar-producto-container {
                max-width: 900px;
                margin: 0 auto;
                padding: 20px;
            }
            .panel-custom {
                background: #fff;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                padding: 25px;
                margin-bottom: 20px;
            }
            .panel-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 20px;
                border-radius: 10px 10px 0 0;
                margin: -25px -25px 20px -25px;
            }
            .panel-header h3 {
                margin: 0;
                font-weight: 600;
            }
            .form-group label {
                font-weight: 600;
                color: #333;
                margin-bottom: 5px;
            }
            .required-field::after {
                content: " *";
                color: #e74c3c;
            }
            .btn-agregar {
                background: #27ae60;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
            }
            .btn-agregar:hover {
                background: #219a52;
            }
            .btn-guardar {
                background: #3498db;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            }
            .btn-guardar:hover {
                background: #2980b9;
            }
            .btn-limpiar {
                background: #95a5a6;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            }
            .btn-limpiar:hover {
                background: #7f8c8d;
            }
            .btn-imprimir {
                background: #e67e22;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 5px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            }
            .btn-imprimir:hover {
                background: #d35400;
            }
            .btn-block {
                display: block;
                width: 100%;
            }
            .atributo-card {
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 10px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            .atributo-card .atributo-nombre {
                font-weight: 700;
                color: #2c3e50;
                min-width: 60px;
            }
            .atributo-card input {
                flex: 1;
            }
            .producto-card {
                background: #fff;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 5px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .producto-info {
                flex: 1;
            }
            .producto-info strong {
                color: #2c3e50;
                font-size: 16px;
            }
            .producto-info .detalles {
                color: #7f8c8d;
                font-size: 13px;
                margin-top: 5px;
            }
            .producto-acciones {
                display: flex;
                gap: 15px;
            }
            .btn-icon {
                background: transparent;
                border: none;
                cursor: pointer;
                font-size: 18px;
                padding: 5px 8px;
                opacity: 0.7;
                transition: opacity 0.2s;
            }
            .btn-icon:hover {
                opacity: 1;
            }
            .ayuda-panel {
                background: #ecf0f1;
                border-radius: 10px;
                padding: 0;
                margin-top: 30px;
                overflow: hidden;
            }
            .ayuda-panel .panel-header {
                background: #bdc3c7;
                color: #2c3e50;
                padding: 12px 15px;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 0;
                border-radius: 10px 10px 0 0;
            }
            .ayuda-panel .panel-header:hover {
                background: #aab7b8;
            }
            .ayuda-panel .panel-content {
                padding: 15px 20px;
                display: none;
            }
            .ayuda-panel .panel-content.show {
                display: block;
            }
            .ayuda-panel h4 {
                color: #2c3e50;
                margin-top: 0;
            }
            .ayuda-panel ol {
                color: #34495e;
                line-height: 1.8;
            }
            .footer-credits {
                text-align: center;
                padding: 20px;
                margin-top: 30px;
                color: #7f8c8d;
                font-size: 12px;
                border-top: 1px solid #dee2e6;
            }
            .filtros-panel {
                background: #f8f9fa;
                border-radius: 10px;
                padding: 15px;
                margin-top: 30px;
            }
            .filtros-panel .filtros-row {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-bottom: 15px;
            }
            .filtros-panel select, .filtros-panel input {
                flex: 1;
                min-width: 150px;
            }
            .tabla-productos {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            .tabla-productos th, .tabla-productos td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #dee2e6;
            }
            .tabla-productos th {
                background: #ecf0f1;
                font-weight: 600;
            }
            .tabla-productos input.precio-input {
                width: 100px;
                padding: 5px;
            }
            .btn-actualizar {
                background: #27ae60;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
                margin-top: 10px;
            }
            .btn-actualizar:hover {
                background: #219a52;
            }
            .checkbox-seleccionar {
                width: 14px;
                height: 14px;
                cursor: pointer;
            }
            #seleccionar-todos {
                width: 14px;
                height: 14px;
                cursor: pointer;
            }
            .btn-ajuste {
                padding: 4px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 13px;
                margin-right: 5px;
            }
            .btn-aumentar {
                background: #27ae60;
                color: white;
            }
            .btn-disminuir {
                background: #e74c3c;
                color: white;
            }
            .btn-fijar {
                background: #3498db;
                color: white;
            }
            .checkbox-custom {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 5px;
            }
            .checkbox-custom input {
                width: 18px;
                height: 18px;
            }
            .checkbox-custom label {
                margin: 0;
                font-weight: 500;
            }
            .stock-input {
                border-color: #3498db !important;
            }
            .barcode-input {
                border-color: #9b59b6 !important;
            }
            .input-error {
                border-color: #e74c3c !important;
            }
        </style>
        
        <div class="agregar-producto-container">
            <div class="panel-custom">
                <div class="panel-header">
                    <h3>Agregar Nuevo Producto</h3>
                </div>
                
                <div class="form-group">
                    <label class="required-field">Nombre del Producto</label>
                    <input id="nombre" class="form-control" placeholder="Ej: Zapatillas Nike Air Max" tabindex="1">
                </div>

                <div class="form-group">
                    <label class="required-field">Descripción</label>
                    <textarea id="descripcion" class="form-control" rows="2" placeholder="Descripción detallada del producto" tabindex="2"></textarea>
                </div>

                <div class="form-row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Marca</label>
                            <div class="input-group">
                                <select id="marca" class="form-control" tabindex="3">
                                    <option value="">Seleccionar marca...</option>
                                </select>
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-agregar" onclick="agregarNuevaMarca()" title="Crear nueva marca" tabindex="-1">+</button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Categoría</label>
                            <div class="input-group">
                                <select id="categoria" class="form-control" tabindex="4">
                                    <option value="">Seleccionar categoría...</option>
                                </select>
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-agregar" onclick="agregarNuevaCategoria()" title="Crear nueva categoría" tabindex="-1">+</button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="col-md-6">
                        <div class="form-group">
                            <label>Subcategoría</label>
                            <div class="input-group">
                                <select id="subcategoria" class="form-control" tabindex="5">
                                    <option value="">Seleccionar subcategoría...</option>
                                </select>
                                <span class="input-group-btn">
                                    <button type="button" class="btn btn-agregar" onclick="agregarNuevaSubcategoria()" title="Crear nueva subcategoría" tabindex="-1">+</button>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-group">
                            <label class="required-field">Precio</label>
                            <input id="precio" class="form-control" type="number" step="0.01" placeholder="0.00" tabindex="6">
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Warehouse (Almacén)</label>
                    <select id="warehouse" class="form-control" tabindex="7"></select>
                </div>

                <div class="checkbox-custom">
                    <input type="checkbox" id="usar-stock-minimo" tabindex="8">
                    <label for="usar-stock-minimo">Agregar stock mínimo a todas las variantes</label>
                </div>
                <div id="stock-minimo-container" class="form-group" style="display:none; margin-left: 28px;">
                    <label>Cantidad mínima por variante:</label>
                    <input type="number" id="stock-minimo" class="form-control" style="max-width: 200px;" placeholder="1" min="0" value="1">
                </div>

                <div class="form-group">
                    <label class="required-field">Atributos (separados por coma)</label>
                    <input id="talles" class="form-control" placeholder="Ej: S, M, L, XL, XXL" tabindex="9">
                </div>

                <div id="talles-container" class="form-group" style="display:none;">
                    <label>Stock por atributo:</label>
                    <div id="cantidades-talles"></div>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
                    <button onclick="actualizarTalles()" class="btn btn-limpiar" tabindex="10">Agregar Atributos</button>
                    <button onclick="crearProducto()" class="btn btn-guardar" tabindex="100">💾 Guardar Producto</button>
                    <button onclick="limpiarFormulario()" class="btn btn-limpiar" tabindex="101">🔄 Limpiar</button>
                    <button onclick="imprimirTodasEtiquetas()" class="btn btn-imprimir" style="display:none;" id="btn-imprimir-todas" tabindex="102">🖨️ Imprimir Todas las Etiquetas</button>
                </div>
            </div>
            
            <div class="panel-custom" id="productos-panel" style="display: none;">
                <div class="panel-header" style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);">
                    <h4>Productos Creados (<span id="contador-productos">0</span>)</h4>
                </div>
                <div id="lista-productos-creados"></div>
            </div>
            
            <div class="ayuda-panel">
                <div class="panel-header" onclick="toggleAyuda()">
                    <h4 style="margin:0;">📖 Guía de Uso</h4>
                    <span id="ayuda-toggle-icon">▼</span>
                </div>
                <div class="panel-content" id="ayuda-contenido">
                    <ol>
                        <li><strong>Nombre y Descripción:</strong> Complete los datos básicos del producto (campos obligatorios).</li>
                        <li><strong>Marca y Categoría:</strong> Seleccione del listado o cree nuevas opciones con el botón +.</li>
                        <li><strong>Precio:</strong> Ingrese el precio de venta del producto (obligatorio).</li>
                        <li><strong>Warehouse:</strong> Seleccione el almacén donde se guardará el stock.</li>
                        <li><strong>Stock Mínimo:</strong> Active esta opción si desea agregar una cantidad base a todas las variantes.</li>
                        <li><strong>Atributos:</strong> Ingrese los talles/colores separados por coma (campo obligatorio).</li>
                        <li><strong>Agregar Atributos:</strong> Haga clic para crear los campos de stock y código de barras.</li>
                        <li><strong>Stock y Códigos:</strong> Complete las cantidades y opcionalmente modifique los códigos de barras.</li>
                        <li><strong>Guardar:</strong> El producto se crea y queda en lista para imprimir etiquetas.</li>
                        <li><strong>Imprimir:</strong> Genere las etiquetas con códigos de barras para pegar en los productos.</li>
                    </ol>
                </div>
            </div>
            
            <div class="panel-custom" style="margin-top: 30px;">
                <div class="panel-header" style="background: linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%);">
                    <h4 style="margin:0;">📦 Lista de Productos</h4>
                </div>
                <div style="padding: 15px;">
                    <div class="form-row" style="margin-bottom: 15px;">
                        <div class="col-md-4">
                            <input type="text" id="item-search" class="form-control" placeholder="Buscar producto..." onkeyup="filtrarItems()">
                        </div>
                        <div class="col-md-3">
                            <select id="item-marca" class="form-control" onchange="cargarItems()">
                                <option value="">Todas las marcas</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select id="item-categoria" class="form-control" onchange="cargarItems()">
                                <option value="">Todas las categorías</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <button onclick="limpiarFiltros()" class="btn btn-secondary btn-block">🔄</button>
                        </div>
                    </div>
                    <div id="items-grid"></div>
                </div>
            </div>
            
            <div class="footer-credits">
                <p>🔧 Desarrollado por <strong>Saltamontech - Silva Jonás</strong></p>
                <p>📦 <strong>Todos los derechos reservados para Odín Suite</strong></p>
                <p>Versión 1.0.0</p>
            </div>
        </div>
    `);

    cargarWarehouses();
    cargarItemGroups();
    cargarMarcas();
    cargarFiltrosItems();
    cargarItems();
    
    $("#usar-stock-minimo").change(function() {
        $("#stock-minimo-container").toggle(this.checked);
    });
};

function toggleAyuda() {
    $("#ayuda-contenido").toggleClass("show");
    $("#ayuda-toggle-icon").text($("#ayuda-contenido").hasClass("show") ? "▲" : "▼");
}

let filtrarTimeout;
function filtrarItems() {
    clearTimeout(filtrarTimeout);
    filtrarTimeout = setTimeout(cargarItems, 300);
}

function cargarFiltrosItems() {
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.get_brands",
        callback: function(r) {
            if (r.message) {
                r.message.forEach(function(m) {
                    $("#item-marca").append(new Option(m, m));
                });
            }
        }
    });
    
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.get_item_groups",
        callback: function(r) {
            if (r.message) {
                r.message.forEach(function(g) {
                    $("#item-categoria").append(new Option(g, g));
                });
            }
        }
    });
}

function cargarItems() {
    let search = $("#item-search").val();
    let marca = $("#item-marca").val();
    let categoria = $("#item-categoria").val();
    
    window.currentOffset = 0;
    window.currentSearch = search;
    window.currentMarca = marca;
    window.currentCategoria = categoria;
    window.itemsCargados = [];
    
    $("#items-grid").html('<div class="text-center text-muted p-3">Cargando...</div>');
    
    cargarMasItems();
}

function cargarMasItems() {
    $("#items-grid").find(".loading-more").remove();
    $("#items-grid").append('<div class="loading-more text-center p-3">Cargando más...</div>');
    
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.get_items_list",
        args: {
            filters: JSON.stringify({
                search: window.currentSearch, 
                marca: window.currentMarca, 
                categoria: window.currentCategoria,
                limit: 50,
                offset: window.currentOffset
            })
        },
        callback: function(r) {
            $(".loading-more").remove();
            
            if (r.message && r.message.items) {
                window.itemsCargados = window.itemsCargados.concat(r.message.items);
                window.currentOffset = r.message.offset;
                window.hasMore = r.message.has_more;
                
                renderItemsTable(window.itemsCargados);
            } else if (r.message && r.message.length > 0) {
                window.itemsCargados = window.itemsCargados.concat(r.message);
                window.currentOffset += r.message.length;
                
                renderItemsTable(window.itemsCargados);
            }
        }
    });
}

function renderItemsTable(items) {
    let html = `
        <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
            <div class="form-row align-items-center">
                <div class="col-md-2">
                    <select id="tipo-actualizacion" class="form-control">
                        <option value="fijar">Fijar precio</option>
                        <option value="aumentar">Aumentar %</option>
                        <option value="disminuir">Disminuir %</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="number" id="valor-actualizacion" class="form-control" placeholder="Valor">
                </div>
                <div class="col-md-4">
                    <button onclick="actualizarPreciosMasivo()" class="btn btn-warning btn-block">💰 Actualizar Precios</button>
                </div>
                <div class="col-md-4">
                    <button onclick="seleccionarTodos()" class="btn btn-info btn-block">☑️ Seleccionar Todos</button>
                </div>
            </div>
        </div>
        <table class="table table-bordered table-sm">
            <thead class="bg-light" style="position: sticky; top: 0;">
                <tr>
                    <th><input type="checkbox" id="select-all-items" onchange="toggleSelectAll()"></th>
                    <th>Producto</th>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Stock Mín</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    items.forEach(function(item) {
        let stockClass = item.stock <= item.stock_minimo ? 'text-danger font-weight-bold' : '';
        html += `
            <tr>
                <td><input type="checkbox" class="item-checkbox" value="${item.item_code}"></td>
                <td>${item.item_code}</td>
                <td>${item.brand || '-'}</td>
                <td>${item.item_group || '-'}</td>
                <td class="text-right">${parseFloat(item.precio || 0).toFixed(2)}</td>
                <td class="text-center ${stockClass}">${item.stock || 0}</td>
                <td class="text-center">${item.stock_minimo || 0}</td>
            </tr>
        `;
    });
    html += '</tbody></table>';
    
    if (window.hasMore) {
        html += '<div class="loading-more text-center p-2 text-muted">Cargando más...</div>';
    }
    
    $("#items-grid").html(html);
    
    $(window).on('scroll', function() {
        if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            if (window.hasMore && !$(".loading-more").length) {
                cargarMasItems();
            }
        }
    });
}

function limpiarFiltros() {
    $("#item-search").val("");
    $("#item-marca").val("");
    $("#item-categoria").val("");
    cargarItems();
}

let itemsTimeout;
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
                <div class="atributo-card">
                    <div class="atributo-nombre">${talle}</div>
                    <input type="number" class="form-control cantidad-talle stock-input" data-talle="${talle}" placeholder="Stock" min="0" tabindex="${tabStock}">
                    <input type="text" class="form-control barcode-talle barcode-input" data-talle="${talle}" placeholder="Código de barras" value="" tabindex="${tabBarcode}">
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
            barcodes_variantes: barcodes_variantes,
            es_edicion: window.esEdicion || false,
            nombre_original: window.nombreOriginalEdicion || null,
            stock_minimo: stockMinimo || null
        },
        callback: function(r) {
            frappe.msgprint("Producto guardado correctamente");
            
            window.esEdicion = false;
            window.nombreOriginalEdicion = null;
            
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
    window.esEdicion = false;
    window.nombreOriginalEdicion = null;
    $("#nombre").focus();
}

function actualizarListaProductos() {
    let container = $("#lista-productos-creados");
    container.html("");
    
    window.productosCreados.forEach(function(prod, index) {
        let talles = Object.keys(prod.cantidades).join(", ");
        let totalStock = Object.values(prod.cantidades).reduce((a,b)=>a+b, 0);
        let html = `
            <div class="producto-card">
                <div class="producto-info">
                    <strong>${prod.nombre}</strong>
                    <div class="detalles">
                        📦 Atributos: ${talles} | Stock Total: ${totalStock}
                    </div>
                </div>
                <div class="producto-acciones">
                    <button class="btn-icon btn-editar" onclick="editarProducto(${index})" title="Editar">✏️</button>
                    <button class="btn-icon btn-eliminar" onclick="eliminarProducto(${index})" title="Eliminar">🗑️</button>
                    <button class="btn-icon btn-imprimir-item" onclick="imprimirProductoIndividual(${index})" title="Imprimir etiquetas">🖨️</button>
                </div>
            </div>
        `;
        container.append(html);
    });
    
    if (window.productosCreados.length > 0) {
        $("#btn-imprimir-todas").show();
        $("#productos-panel").show();
        $("#contador-productos").text(window.productosCreados.length);
    } else {
        $("#btn-imprimir-todas").hide();
        $("#productos-panel").hide();
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
    window.esEdicion = true;
    window.nombreOriginalEdicion = prod.nombre;
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
        }
    });
}

function toggleSelectAll() {
    var checked = $("#select-all-items").prop("checked");
    $(".item-checkbox").prop("checked", checked);
}

function seleccionarTodos() {
    $(".item-checkbox").prop("checked", true);
    $("#select-all-items").prop("checked", true);
}

function actualizarPreciosMasivo() {
    var itemsSeleccionados = [];
    $(".item-checkbox:checked").each(function() {
        itemsSeleccionados.push($(this).val());
    });
    
    if (itemsSeleccionados.length === 0) {
        frappe.msgprint("Seleccione al menos un producto");
        return;
    }
    
    var tipo = $("#tipo-actualizacion").val();
    var valor = $("#valor-actualizacion").val();
    
    if (tipo !== "fijar" && (!valor || parseFloat(valor) <= 0)) {
        frappe.msgprint("Ingrese un valor válido");
        return;
    }
    
    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.actualizar_precios_masivo",
        args: {
            items_data: JSON.stringify(itemsSeleccionados),
            tipo_actualizacion: tipo,
            valor: valor
        },
        callback: function(r) {
            if (r.message) {
                var msg = "✅ Actualizados: " + r.message.actualizados;
                if (r.message.errors && r.message.errors.length > 0) {
                    msg += "\n❌ Errores: " + r.message.errors.length;
                }
                frappe.msgprint(msg);
                cargarItems();
            }
        }
    });
}
