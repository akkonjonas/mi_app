console.log("🚀 POS CUSTOM LOADED");

// =========================
// VARIABLES
// =========================

let transfer_items = [];

// =========================
// ESPERAR POS MODERNO
// =========================

let check_pos = setInterval(() => {

    if (window.cur_pos && cur_pos.frm) {

        clearInterval(check_pos);

        console.log("✅ POS detectado");

        let pos = cur_pos;

        // =====================================================
        // AFIP (CABECERA)
        // =====================================================

        let afip_html = `

        <div id="afip_box"
             style="
                padding:15px;
                background:#f8f9fa;
                margin-bottom:20px;
                border-radius:12px;
                border:1px solid #ddd;
             ">

            <h3 style="
                margin-bottom:15px;
                color:#0d6efd;
            ">
                🇦🇷 AFIP
            </h3>

            <label style="font-weight:bold;">
                🪪 CUIT / DNI
            </label>

            <input type="text"
                   id="cuit_input"
                   class="form-control"
                   placeholder="Ingresar CUIT o DNI"/>

            <br>

            <label style="font-weight:bold;">
                🧾 Tipo Comprobante
            </label>

            <select id="tipo_comprobante"
                    class="form-control">

                <option>Factura A</option>

                <option selected>
                    Factura B
                </option>

                <option>Factura C</option>

                <option>Nota de Crédito A</option>
                <option>Nota de Crédito B</option>
                <option>Nota de Crédito C</option>

                <option>Nota de Débito A</option>
                <option>Nota de Débito B</option>
                <option>Nota de Débito C</option>

                <option>Remito X</option>

            </select>

        </div>
        `;

        // =====================================================
        // TRANSFERENCIAS (ABAJO)
        // =====================================================

        let transfer_html = `

        <div id="custom_pos_box"
             style="
                padding:15px;
                background:#f8f9fa;
                margin-top:30px;
                border-radius:12px;
                border:1px solid #ddd;
             ">

            <!-- ================= -->
            <!-- BOTON -->
            <!-- ================= -->

            <button id="toggle_transfer"
                    style="
                        width:100%;
                        background:#198754;
                        color:white;
                        border:none;
                        padding:18px;
                        font-size:20px;
                        font-weight:bold;
                        border-radius:12px;
                        cursor:pointer;
                        box-shadow:0px 2px 10px rgba(0,0,0,0.15);
                    ">

                📦 Transferencias entre sucursales

            </button>

            <!-- ================= -->
            <!-- MODULO -->
            <!-- ================= -->

            <div id="transfer_module"
                 style="
                    display:none;
                    margin-top:20px;
                    padding:20px;
                    background:white;
                    border-radius:12px;
                    border:1px solid #ddd;
                 ">

                <h4 style="
                    margin-bottom:20px;
                    color:#198754;
                ">
                    📦 Nueva Transferencia
                </h4>

                <!-- ================= -->
                <!-- GUIA -->
                <!-- ================= -->

                <div style="
                    background:#eef6ff;
                    border:1px solid #b8daff;
                    padding:15px;
                    border-radius:10px;
                    margin-bottom:20px;
                    font-size:15px;
                    line-height:1.8;
                ">

                    <b>👨‍💼 ¿Cómo funciona?</b>

                    <br><br>

                    1️⃣ Elegir sucursal destino

                    <br>

                    2️⃣ Escanear productos uno por uno

                    <br>

                    3️⃣ Verificar la lista cargada

                    <br>

                    4️⃣ Click en 🚚 Enviar Transferencia

                    <br><br>

                    ✅ El stock se moverá automáticamente.

                </div>

                <!-- ================= -->
                <!-- DESTINO -->
                <!-- ================= -->

                <label style="font-weight:bold;">
                    🏪 Sucursal destino
                </label>

                <select id="destino"
                        class="form-control">
                </select>

                <br>

                <!-- ================= -->
                <!-- BARCODE -->
                <!-- ================= -->

                <label style="font-weight:bold;">
                    🔍 Escanear código barras
                </label>

                <input type="text"
                       id="barcode_input"
                       class="form-control"
                       placeholder="Escanear producto"/>

                <br>

                <!-- ================= -->
                <!-- LISTA -->
                <!-- ================= -->

                <div id="lista_productos"></div>

                <br>

                <!-- ================= -->
                <!-- BOTON -->
                <!-- ================= -->

                <button id="enviar_transferencia"
                        style="
                            width:100%;
                            background:#0d6efd;
                            color:white;
                            border:none;
                            padding:18px;
                            font-size:20px;
                            font-weight:bold;
                            border-radius:12px;
                            cursor:pointer;
                        ">

                    🚚 Enviar Transferencia

                </button>

            </div>

        </div>
        `;

        // =====================================================
        // INSERTAR AFIP ARRIBA
        // =====================================================

        document.querySelector(".page-content")
            ?.insertAdjacentHTML("afterbegin", afip_html);

        // =====================================================
        // INSERTAR TRANSFERENCIAS ABAJO
        // =====================================================

        document.querySelector(".page-content")
            ?.insertAdjacentHTML("beforeend", transfer_html);

        console.log("✅ UI insertada");

        // =====================================================
        // TOGGLE MODULO
        // =====================================================

        $("#toggle_transfer").on("click", function() {

            $("#transfer_module").slideToggle();

        });

        // =====================================================
        // CARGAR WAREHOUSES
        // =====================================================

        frappe.call({

            method: "frappe.client.get_list",

            args: {

                doctype: "Warehouse",

                fields: [
                    "name"
                ],

                limit_page_length: 100

            },

            callback: function(r) {

                if (r.message) {

                    r.message.forEach(function(warehouse) {

                        $("#destino").append(`

                            <option value="${warehouse.name}">
                                ${warehouse.name}
                            </option>

                        `);

                    });

                }

            }

        });

        // =====================================================
        // AFIP
        // =====================================================

        $("#tipo_comprobante").on("change", function() {

            pos.frm.set_value(
                "tipo_comprobante",
                $(this).val()
            );

        });

        $("#cuit_input").on("change", function() {

            let cuit = $(this).val();

            console.log("🔍 Consultar AFIP:", cuit);

            // 🔥 Aquí luego conectamos AFIP real

        });

        // =====================================================
        // ESCANEAR BARCODE
        // =====================================================

        $("#barcode_input").on("change", function() {

            let barcode = $(this).val();

            buscar_producto(barcode);

            $(this).val("");

        });

        // =====================================================
        // ENVIAR TRANSFERENCIA
        // =====================================================

        $("#enviar_transferencia").on("click", function() {

            if (transfer_items.length === 0) {

                frappe.msgprint(
                    "❌ No hay productos cargados"
                );

                return;
            }

            let destino = $("#destino").val();

            frappe.call({

                method: "mi_app.api.crear_transferencia",

                args: {
                    items: transfer_items,
                    destino: destino
                },

                callback: function(r) {

                    frappe.msgprint(
                        "✅ Transferencia creada: " + r.message
                    );

                    transfer_items = [];

                    $("#lista_productos").html("");

                }

            });

        });

    }

}, 1000);


// =====================================================
// BUSCAR PRODUCTO
// =====================================================

function buscar_producto(barcode) {

    frappe.call({

        method: "frappe.client.get_list",

        args: {

            doctype: "Item",

            filters: {
                barcode: barcode
            },

            fields: [
                "item_code",
                "item_name"
            ]

        },

        callback: function(r) {

            if (r.message.length > 0) {

                let item = r.message[0];

                transfer_items.push({
                    item_code: item.item_code,
                    qty: 1
                });

                $("#lista_productos").append(`

                    <div style="
                        padding:12px;
                        background:#f8f9fa;
                        margin-bottom:10px;
                        border-radius:10px;
                        border:1px solid #ddd;
                        font-size:16px;
                    ">

                        ✅ ${item.item_name}

                    </div>

                `);

            } else {

                frappe.msgprint(
                    "❌ Producto no encontrado"
                );

            }

        }

    });

}