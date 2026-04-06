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
                    <input id="marca" class="form-control" placeholder="Marca">
                </div>
                <div class="col">
                    <label>Categoría *</label>
                    <input id="categoria" class="form-control" placeholder="Categoría">
                </div>
            </div>

            <div class="form-row">
                <div class="col">
                    <label>Precio</label>
                    <input id="precio" class="form-control" type="number" step="0.01" placeholder="Precio">
                </div>
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

function actualizarTalles() {
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
                    <div class="col-md-4">
                        <strong>${talle}</strong>
                    </div>
                    <div class="col-md-8">
                        <input type="number" class="form-control cantidad-talle" data-talle="${talle}" placeholder="Cantidad" min="0">
                    </div>
                </div>
            `);
        }
    });
    
    containerPadre.toggle(hayTalles);
}

function crearProducto() {
    let cantidades = {};

    $(".cantidad-talle").each(function() {
        let talle = $(this).data("talle");
        let qty = $(this).val() || 0;
        if (talle && qty > 0) {
            cantidades[talle] = parseInt(qty);
        }
    });

    frappe.call({
        method: "mi_app.productos.page.agregar_producto.agregar_producto.crear_producto",
        args: {
            nombre: $("#nombre").val(),
            descripcion: $("#descripcion").val(),
            marca: $("#marca").val(),
            categoria: $("#categoria").val(),
            precio: $("#precio").val(),
            warehouse: $("#warehouse").val(),
            talles: $("#talles").val(),
            cantidades: cantidades
        },
        callback: function(r) {
            frappe.msgprint("Producto creado correctamente");
            window.location.reload();
        }
    });
}