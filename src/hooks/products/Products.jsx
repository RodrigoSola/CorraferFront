import { useEffect, useState } from "react";
import { useCart } from "../../components/CartContext";
import IVAModal from "../../components/ModalIVA";
import useFetchProducts from "./useFetchProducts";
import useDeleteProduct from "./useDeleteProduct";
import {
  FaTrash,
  FaEdit,
  FaReceipt,
  FaShoppingCart,
  FaSearch,
  FaPercentage,
} from "react-icons/fa";
import useUpdateProduct from "../products/useUpdateProduct.js";
import ImprovedCart from "../../components/ImprovedCart";
import Nav from "../../components/Nav";
import InvoiceGenerator from "../invoices/invoiceGenerator";
import "../../css/Products.css";

function Products() {
  const {
    products: initialProducts,
    fetchProducts,
    isLoading,
    error,
    done,
  } = useFetchProducts();
  const { deleteProduct } = useDeleteProduct();
  const { updateProduct } = useUpdateProduct();

  // ✅ SOLUCIÓN: Obtener funciones del carrito con fallbacks
  const cartContext = useCart();
  const {
    cart = [],
    addToCart,
    getCartCount = () => 0,
    getTotalPrice = () => 0, // ✅ Función con fallback
  } = cartContext || {};

  const [products, setProducts] = useState(initialProducts || []);
  const [editingProduct, setEditingProduct] = useState(null);
 
  const [quantity, setQuantity] = useState(1);
  const [showIVAModal, setShowIVAModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);

  // ✅ Estado para incremento de precios mejorado
  const [isPriceUpdating, setIsPriceUpdating] = useState(false);
  const [priceUpdateStatus, setPriceUpdateStatus] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    barcode: "",
  });
  const [percentage, setPercentage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Estado para selector de productos para carrito
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!done) {
      fetchProducts();
    } else {
      setProducts(initialProducts || []);
    }
  }, [fetchProducts, done, initialProducts]);

  // ✅ Función mejorada para calcular total del carrito de forma segura
  const calculateCartTotal = () => {
    try {
      if (!cart || cart.length === 0) return 0;

      const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.priceWithIVA || item.unitPrice || 0);
        const qty = parseInt(item.quantity || 1);
        return sum + price * qty;
      }, 0);

      console.log("💰 Total calculado manualmente:", total);
      return total;
    } catch (error) {
      console.error("❌ Error calculando total:", error);
      return 0;
    }
  };

  // ✅ Función segura para obtener total del carrito
  const getCartTotal = () => {
    if (typeof getTotalPrice === "function") {
      try {
        return getTotalPrice();
      } catch (error) {
        console.error("Error usando getTotalPrice:", error);
        return calculateCartTotal();
      }
    }
    return calculateCartTotal();
  };

  // ✅ Función mejorada para búsqueda por código de barras
  const handleBarcodeSearch = (barcode) => {
    

    const product = products.find((p) => p.barcode === barcode.trim());
    if (product) {
      
      setSelectedProduct(product);
      console.log("🔍 Producto encontrado:", product);
    } else {
      
      setSelectedProduct(null);
      console.log("❌ Producto no encontrado con código:", barcode);
    }
  };

  // ✅ Función para agregar producto al carrito desde la tabla
  const handleAddProductToCart = (product) => {
    if (!addToCart) {
      console.error("❌ Función addToCart no disponible");
      setPriceUpdateStatus("❌ Error: Sistema de carrito no disponible");
      setTimeout(() => setPriceUpdateStatus(""), 3000);
      return;
    }

    setSelectedProduct(product);
   
    setShowIVAModal(true);
  };

  const handleIVAConfirm = (priceWithIVA, priceWithoutIVA) => {
    if (!selectedProduct || !priceWithIVA || !priceWithoutIVA || !addToCart) {
      console.error("❌ Error: Datos incompletos para agregar al carrito");
      setPriceUpdateStatus("❌ Error: Datos incompletos");
      setTimeout(() => setPriceUpdateStatus(""), 3000);
      return;
    }

    try {
      addToCart(selectedProduct, quantity, priceWithIVA, priceWithoutIVA);
      setShowIVAModal(false);
     
      setSelectedProduct(null);
      setQuantity(1);

      // ✅ Mostrar notificación de éxito
      setPriceUpdateStatus(`✅ ${selectedProduct.name} agregado al carrito`);
      setTimeout(() => setPriceUpdateStatus(""), 3000);

      console.log("✅ Producto agregado al carrito:", selectedProduct.name);
    } catch (error) {
      console.error("❌ Error agregando al carrito:", error);
      setPriceUpdateStatus(`❌ Error agregando ${selectedProduct.name}`);
      setTimeout(() => setPriceUpdateStatus(""), 5000);
    }
  };

  // ✅ Filtrar productos con validación mejorada
  const filteredProducts = (products || []).filter((product) => {
    if (!product || !product.name) {
      return false;
    }

    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const barcodeMatch =
      product.barcode && product.barcode.includes(searchTerm);

    return nameMatch || barcodeMatch;
  });

  if (isLoading) {
    return (
      <div>
        <Nav />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>⏳</div>
            <h2 style={{ color: "#333", margin: "0 0 10px 0" }}>
              Cargando Productos
            </h2>
            <p style={{ color: "#666", margin: 0 }}>Por favor espera...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Nav />
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-block",
              padding: "20px",
              backgroundColor: "#fee",
              borderRadius: "10px",
              border: "1px solid #fcc",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "10px" }}>❌</div>
            <h2 style={{ color: "#c33", margin: "0 0 10px 0" }}>
              Error al Cargar
            </h2>
            <p style={{ color: "#c33", margin: "0 0 15px 0" }}>{error}</p>
            <button
              onClick={fetchProducts}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              🔄 Intentar de Nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      barcode: product.barcode,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateProduct(editingProduct._id, formData);
      setProducts(
        products.map((product) =>
          product._id === editingProduct._id
            ? { ...product, ...formData, price: parseFloat(formData.price) }
            : product
        )
      );
      setEditingProduct(null);
      setPriceUpdateStatus(`✅ ${formData.name} actualizado exitosamente`);
      setTimeout(() => setPriceUpdateStatus(""), 3000);
    } catch (error) {
      console.error("Error actualizando producto:", error);
      setPriceUpdateStatus(`❌ Error actualizando ${formData.name}`);
      setTimeout(() => setPriceUpdateStatus(""), 5000);
    }
  };

  const handleDelete = async (_id) => {
    const product = products.find((p) => p._id === _id);
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar "${product?.name}"?`
    );

    if (confirmDelete) {
      try {
        await deleteProduct(_id);
        setProducts(products.filter((product) => product._id !== _id));
        setPriceUpdateStatus(`✅ ${product?.name} eliminado exitosamente`);
        setTimeout(() => setPriceUpdateStatus(""), 3000);
      } catch (error) {
        console.error("Error eliminando producto:", error);
        setPriceUpdateStatus(`❌ Error eliminando ${product?.name}`);
        setTimeout(() => setPriceUpdateStatus(""), 5000);
      }
    }
  };

  // ✅ Función mejorada para aumento de precios
  const handleIncreasePrice = async () => {
    const increasePercentage = parseFloat(percentage);

    if (!increasePercentage || increasePercentage <= 0) {
      alert("Por favor, ingresa un porcentaje válido mayor a 0.");
      return;
    }

    if (increasePercentage > 100) {
      const confirm = window.confirm(
        `¿Estás seguro de aumentar los precios un ${increasePercentage}%? Esto es un aumento muy alto.`
      );
      if (!confirm) return;
    }

    setIsPriceUpdating(true);
    setPriceUpdateStatus(`⏳ Actualizando precios (${increasePercentage}%)...`);

    try {
      // ✅ Filtrar solo productos válidos
      const validProducts = products.filter(
        (product) =>
          product &&
          typeof product.price === "number" &&
          product.price > 0 &&
          product._id
      );

      if (validProducts.length === 0) {
        throw new Error("No hay productos válidos para actualizar");
      }

      console.log(
        `📈 Iniciando actualización de ${validProducts.length} productos con ${increasePercentage}% de aumento`
      );

      // ✅ Calcular nuevos precios
      const updatedProducts = validProducts.map((product) => {
        const oldPrice = product.price;
        const newPrice = parseFloat(
          (oldPrice * (1 + increasePercentage / 100)).toFixed(2)
        );

        console.log(`💰 ${product.name}: $${oldPrice} → $${newPrice}`);

        return {
          ...product,
          price: newPrice,
          oldPrice: oldPrice, // Guardar precio anterior para referencia
        };
      });

      // ✅ Actualizar estado local primero
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          const updated = updatedProducts.find((up) => up._id === product._id);
          return updated || product;
        })
      );

      // ✅ Actualizar en backend uno por uno con manejo de errores
      let successful = 0;
      let failed = 0;

      for (const product of updatedProducts) {
        try {
          await updateProduct(product._id, { price: product.price });
          successful++;
          setPriceUpdateStatus(
            `⏳ Actualizando: ${successful}/${updatedProducts.length} completados`
          );
        } catch (error) {
          console.error(`❌ Error actualizando ${product.name}:`, error);
          failed++;
        }
      }

      // ✅ Mensaje de resultado final
      if (failed === 0) {
        setPriceUpdateStatus(
          `✅ ${successful} productos actualizados exitosamente (+${increasePercentage}%)`
        );
        console.log(
          `✅ Actualización completa: ${successful} productos actualizados`
        );
      } else {
        setPriceUpdateStatus(
          `⚠️ ${successful} exitosos, ${failed} fallaron. Verifica la consola.`
        );
        console.warn(
          `⚠️ Actualización parcial: ${successful} exitosos, ${failed} fallaron`
        );
      }

      setPercentage(""); // Limpiar campo
    } catch (error) {
      console.error("❌ Error general al actualizar precios:", error);
      setPriceUpdateStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsPriceUpdating(false);
      // ✅ Limpiar mensaje después de 5 segundos
      setTimeout(() => setPriceUpdateStatus(""), 5000);
    }
  };

  const handleShowCart = () => {
    setShowCart(true);
  };

  // ✅ Función MEJORADA para mostrar generador de facturas
  const handleShowInvoiceGenerator = () => {
    console.log("🧾 Verificando carrito para generar factura...");
    console.log("🛒 Carrito actual:", cart);
    console.log("📦 Total items en carrito:", getCartCount());

    // ✅ Verificar que hay productos en el carrito
    if (!cart || cart.length === 0) {
      alert(
        "⚠️ No hay productos en el carrito.\n\nPor favor:\n1. Busca productos usando el campo de búsqueda\n2. Haz clic en el botón 🛒 junto a cada producto\n3. Configura precio con/sin IVA\n4. Luego genera la factura"
      );
      return;
    }

    // ✅ Verificar que las funciones del carrito están disponibles
    if (!cartContext || typeof getTotalPrice !== "function") {
      console.error("❌ Contexto del carrito no disponible");
      alert("❌ Error del sistema: Carrito no disponible. Recarga la página.");
      return;
    }

    console.log("✅ Carrito válido, abriendo generador de facturas...");
    console.log("💰 Total del carrito: $", getCartTotal().toFixed(2));

    setShowInvoiceGenerator(true);
  };

  // ✅ Función para búsqueda rápida por código de barras
  const handleQuickSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Si parece un código de barras (solo números), buscar automáticamente
    if (value.length >= 3 && /^\d+$/.test(value)) {
      handleBarcodeSearch(value);
    }
  };

  return (
    <div>
      <Nav />

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        
        <div
         className="sidebarContent"
        >
          
          <div style={{ marginBottom: "25px" }}>
            <h4
              className="sidebarLogoBusqueda"
            >
              <FaSearch /> Búsqueda
            </h4>
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
             className="sidebarInputBusqueda"
              value={searchTerm}
              onChange={handleQuickSearch}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ddd")}
            />
            
          </div>

          
          <div
          className="aumentoPreciosContent"
          >
            <h4
              className="h4AumentoPrecios"
            >
              <FaPercentage /> Aumentar Precios
            </h4>
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="% (ej: 10)"
                disabled={isPriceUpdating}
               className="inputPorcentaje"
              />
              <button
                onClick={handleIncreasePrice}
                disabled={isPriceUpdating || !percentage}
                style={{
                  padding: "10px 16px",
                  backgroundColor: isPriceUpdating ? "#6c757d" : "#ffc107",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: isPriceUpdating ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {isPriceUpdating ? "⏳" : "📈"}
              </button>
            </div>

            {/* Información de productos válidos */}
            <div
              style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}
            >
              Productos válidos:{" "}
              {
                products.filter(
                  (p) => p && typeof p.price === "number" && p.price > 0
                ).length
              }
            </div>

            {/* Ejemplos de cálculo */}
            {percentage &&
              !isNaN(parseFloat(percentage)) &&
              parseFloat(percentage) > 0 && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#e65100",
                    fontWeight: "500",
                  }}
                >
                  Ejemplo: $100 → $
                  {(100 * (1 + parseFloat(percentage) / 100)).toFixed(2)}
                </div>
              )}
          </div>

         
          {priceUpdateStatus && (
            <div
              style={{
                marginBottom: "20px",
                padding: "12px",
                backgroundColor: priceUpdateStatus.startsWith("✅")
                  ? "#e8f5e8"
                  : priceUpdateStatus.startsWith("❌")
                  ? "#fee"
                  : "#e3f2fd",
                border: `1px solid ${
                  priceUpdateStatus.startsWith("✅")
                    ? "#c3e6c3"
                    : priceUpdateStatus.startsWith("❌")
                    ? "#fcc"
                    : "#bbdefb"
                }`,
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: "500",
                animation: "fadeIn 0.3s ease",
              }}
            >
              {priceUpdateStatus}
            </div>
          )}

          
          <div style={{ marginBottom: "25px" }}>
            
            <button
              onClick={handleShowInvoiceGenerator}
              disabled={!cart || cart.length === 0}
              className="btn-green "
              title={
                !cart || cart.length === 0
                  ? "Agrega productos al carrito primero"
                  : "Generar factura ARCA con los productos del carrito"
              }
            >
              <FaReceipt size={18} />
              {!cart || cart.length === 0 ? "Carrito Vacío" : "Generar Factura"}
            </button>

            {/* Instrucciones si el carrito está vacío */}
            {(!cart || cart.length === 0) && (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "#856404",
                  lineHeight: "1.4",
                  marginBottom: "15px",
                }}
              >
                <strong>💡 Para generar una factura:</strong>
                <br />
                1. Busca productos arriba
                <br />
                2. Haz clic en 🛒 en cada producto
                <br />
                3. Configura precios con/sin IVA
                <br />
                4. Luego genera la factura
              </div>
            )}

            <button onClick={handleShowCart} className="btn-blue">
              <FaShoppingCart /> Ver Carrito
              {getCartCount() > 0 && (
                <span className="getCartCount">{getCartCount()}</span>
              )}
            </button>
          </div>

          {/* ✅ Información del carrito MEJORADA */}
          {cart && cart.length > 0 ? (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#e8f5e8",
                borderRadius: "12px",
                border: "2px solid #c3e6c3",
                boxShadow: "0 3px 10px rgba(195,230,195,0.3)",
              }}
            >
              <div className="carritoLogo">
                🛒 Carrito: {getCartCount()} productos
              </div>
              <div className="carritoTotal">
                💰 Total: ${getCartTotal().toFixed(2)}
              </div>

              {/* Lista compacta de productos en el carrito */}
              <div
                style={{
                  fontSize: "11px",
                  color: "#155724",
                  marginBottom: "10px",
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
              >
                {cart.slice(0, 3).map((item, index) => (
                  <div key={index} className="listaProductosCarrito">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>
                      $
                      {(
                        (item.priceWithIVA || item.unitPrice || 0) *
                        item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
                {cart.length > 3 && (
                  <div
                    style={{
                      padding: "4px 0",
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    ... y {cart.length - 3} más
                  </div>
                )}
              </div>

              <div
                style={{
                  fontSize: "11px",
                  color: "#155724",
                  lineHeight: "1.4",
                }}
              >
                ✨ Sistema de facturación ARCA integrado
                <br />
                📄 Tipos A, B y C disponibles
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "2px dashed #dee2e6",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "30px",
                  marginBottom: "8px",
                  opacity: "0.5",
                }}
              >
                🛒
              </div>
              <div
                style={{ fontSize: "13px", color: "#666", fontWeight: "600" }}
              >
                Carrito vacío
              </div>
              <div
                style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}
              >
                Busca y agrega productos
              </div>
            </div>
          )}

          {/* Información de productos */}
          <div className="infoProductosCarrito">
            <div>
              <strong>📦 Total productos:</strong> {products.length}
            </div>
            <div>
              <strong>🔍 Mostrados:</strong> {filteredProducts.length}
            </div>
            <div>
              <strong>💰 Válidos para aumento:</strong>{" "}
              {
                products.filter(
                  (p) => p && typeof p.price === "number" && p.price > 0
                ).length
              }
            </div>
            <div>
              <strong>⚠️ Stock bajo (&lt;10):</strong>{" "}
              {filteredProducts.filter((p) => p.stock < 10).length}
            </div>
          </div>
        </div>

        {/* ✅ Contenido principal mejorado */}
        <div
          style={{
            padding: "25px",
            flex: 1,
            backgroundColor: "#ffffff",
            margin: "20px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
              paddingBottom: "15px",
              borderBottom: "2px solid #e9ecef",
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 5px 0",
                  color: "#333",
                  fontSize: "28px",
                  fontWeight: "700",
                }}
              >
                📦 Gestión de Productos
              </h2>
            </div>
            <div
              style={{ textAlign: "right", fontSize: "14px", color: "#666" }}
            >
              <div>
                <strong>Total productos:</strong> {filteredProducts.length}
              </div>
              {searchTerm && (
                <div style={{ color: "#007bff" }}>
                  🔍 Filtrado: "{searchTerm}"
                </div>
              )}
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Stock bajo (&lt;10):{" "}
                {filteredProducts.filter((p) => p.stock < 10).length}
              </div>
            </div>
          </div>

          {/* Tabla de productos mejorada */}
          {filteredProducts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                border: "2px dashed #dee2e6",
              }}
            >
              <div
                style={{
                  fontSize: "4rem",
                  marginBottom: "20px",
                  opacity: "0.5",
                }}
              >
                📭
              </div>
              <h3 style={{ color: "#666", margin: "0 0 10px 0" }}>
                No hay productos disponibles
              </h3>
              {searchTerm ? (
                <p className="infoBusquedaProductos">
                  No se encontraron productos con el término "{searchTerm}"
                  <br />
                  <button
                    onClick={() => setSearchTerm("")}
                    className="limpiaBusquedaProductos"
                  >
                    Limpiar búsqueda
                  </button>
                </p>
              ) : (
                <p className="infoBusquedaProductos">
                  Agrega productos para comenzar a trabajar
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                backgroundColor: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "1px solid #e9ecef",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th className="titulosProductos">Producto</th>
                    <th className="titulosProductos">Código</th>
                    <th className="titulosProductos">Precio</th>
                    <th className="titulosProductos">Stock</th>
                    <th className="titulosProductos">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product._id}
                      style={{
                        borderBottom: "1px solid #dee2e6",
                        backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                        transition: "background-color 0.2s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.parentNode.style.backgroundColor = "#f0f8ff")
                      }
                      onMouseOut={(e) =>
                        (e.target.parentNode.style.backgroundColor =
                          index % 2 === 0 ? "#fff" : "#f9f9f9")
                      }
                    >
                      {editingProduct && editingProduct._id === product._id ? (
                        <>
                          <td style={{ padding: "14px" }}>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                            />
                          </td>
                          <td style={{ padding: "14px" }}>
                            <input
                              type="text"
                              value={formData.barcode}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  barcode: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                            />
                          </td>
                          <td style={{ padding: "14px" }}>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  price: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                            />
                          </td>
                          <td style={{ padding: "14px" }}>
                            <input
                              type="number"
                              value={formData.stock}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  stock: e.target.value,
                                })
                              }
                              className="inputEdicionProducto"
                            />
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "center",
                              }}
                            >
                              <button
                                onClick={handleUpdate}
                                className="botonEdicionProducto"
                              >
                                ✅ Guardar
                              </button>
                              <button
                                onClick={() => setEditingProduct(null)}
                                className="cancelarEdicionProducto"
                              >
                                ❌ Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: "14px" }}>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#333",
                                fontSize: "15px",
                                marginBottom: "4px",
                              }}
                            >
                              {product.name}
                            </div>
                            {product.description && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#666",
                                  fontStyle: "italic",
                                }}
                              >
                                {product.description}
                              </div>
                            )}
                            {/* ✅ Indicador si el producto está en el carrito */}
                            {cart &&
                              cart.some((item) => item._id === product._id) && (
                                <div className="indicadorProductoEnCarrito">
                                  ✅ En carrito (
                                  {cart.find((item) => item._id === product._id)
                                    ?.quantity || 0}
                                  )
                                </div>
                              )}
                          </td>
                          <td style={{ padding: "14px" }}>
                            <code className="codigoProducto">
                              {product.barcode || "Sin código"}
                            </code>
                          </td>
                          <td className="precioProducto">
                            $
                            {typeof product.price === "number"
                              ? product.price.toFixed(2)
                              : product.price}
                          </td>
                          <td className="tdPrecioProducto">
                            <span
                              style={{
                                color:
                                  product.stock < 10
                                    ? "#dc3545"
                                    : product.stock < 20
                                    ? "#ffc107"
                                    : "#28a745",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                backgroundColor:
                                  product.stock < 10
                                    ? "#fee"
                                    : product.stock < 20
                                    ? "#fff3cd"
                                    : "#e8f5e8",
                                border: `1px solid ${
                                  product.stock < 10
                                    ? "#fcc"
                                    : product.stock < 20
                                    ? "#ffeaa7"
                                    : "#c3e6c3"
                                }`,
                              }}
                            >
                              {product.stock}
                              {product.stock < 10 && " ⚠️"}
                              {product.stock >= 10 &&
                                product.stock < 20 &&
                                " ⚡"}
                              {product.stock >= 20 && " ✅"}
                            </span>
                          </td>
                          <td style={{ padding: "14px", textAlign: "center" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                justifyContent: "center",
                                flexWrap: "wrap",
                              }}
                            >
                              {/* ✅ Botón agregar al carrito MEJORADO */}
                              <button
                                onClick={() => handleAddProductToCart(product)}
                                disabled={!addToCart || product.stock <= 0}
                                 className="botonAgregarAlCarrito"
                                style={{
                                  backgroundColor:
                                    !addToCart || product.stock <= 0
                                      ? "#6c757d"
                                      : cart &&
                                        cart.some(
                                          (item) => item._id === product._id
                                        )
                                      ? "#17a2b8"
                                      : "#28a745",
                                  cursor:
                                    !addToCart || product.stock <= 0
                                      ? "not-allowed"
                                      : "pointer",
                                }}
                               
                                title={
                                  product.stock <= 0
                                    ? "Sin stock"
                                    : !addToCart
                                    ? "Sistema de carrito no disponible"
                                    : cart &&
                                      cart.some(
                                        (item) => item._id === product._id
                                      )
                                    ? "Agregar más cantidad"
                                    : "Agregar al carrito"
                                }
                                onMouseOver={(e) => {
                                  if (addToCart && product.stock > 0) {
                                    e.target.style.transform =
                                      "translateY(-1px)";
                                    e.target.style.boxShadow =
                                      "0 4px 12px rgba(0,0,0,0.15)";
                                  }
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.transform = "translateY(0)";
                                  e.target.style.boxShadow = "none";
                                }}
                              >
                                {product.stock <= 0
                                  ? "❌"
                                  : cart &&
                                    cart.some(
                                      (item) => item._id === product._id
                                    )
                                  ? "🛒+"
                                  : "🛒"}
                              </button>

                              {/* Botón editar */}
                              <button
                                onClick={() => handleEditClick(product)}
                              className="botonEditarProducto"
                                title="Editar producto"
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = "#0056b3";
                                  e.target.style.transform = "translateY(-1px)";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = "#007bff";
                                  e.target.style.transform = "translateY(0)";
                                }}
                              >
                                <FaEdit />
                              </button>

                              {/* Botón eliminar */}
                              <button
                                onClick={() => handleDelete(product._id)}
                              className="botonBorrarProducto"
                                title="Eliminar producto"
                                onMouseOver={(e) => {
                                  e.target.style.backgroundColor = "#c82333";
                                  e.target.style.transform = "translateY(-1px)";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.backgroundColor = "#dc3545";
                                  e.target.style.transform = "translateY(0)";
                                }}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ✅ Estadísticas de productos */}
          {filteredProducts.length > 0 && (
            <div
            className="filtradoProductosEstadistica"
            >
              <h4
                className="h4FiltradoProductosEstadistica"
              >
                📊 Estadísticas de Inventario
              </h4>
              <div
                className="stockContent"
              >
                <div
                 className="stockContentFondo"
                >
                  <div
                   className="stockContentLetras"
                  >
                    {filteredProducts.filter((p) => p.stock >= 20).length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#155724" }}>
                    Stock Alto (≥20)
                  </div>
                </div>
                <div
                 className="stockMedioContent"
                >
                  <div
                  className="stockMedioFondo"
                  >
                    {
                      filteredProducts.filter(
                        (p) => p.stock >= 10 && p.stock < 20
                      ).length
                    }
                  </div>
                  <div style={{ fontSize: "12px", color: "#856404" }}>
                    Stock Medio (10-19)
                  </div>
                </div>
                <div
                  className="stockMedioLetra"
                >
                  <div
                    className="stockBajoContent"
                  >
                    {filteredProducts.filter((p) => p.stock < 10).length}
                  </div>
                  <div style={{ fontSize: "12px", color: "#721c24" }}>
                    Stock Bajo (&lt;10)
                  </div>
                </div>
                <div
                  className="stockBajoFondo"
                >
                  <div
                    className="valorInventarioContent"
                  >
                    $
                    {filteredProducts
                      .reduce((sum, p) => sum + p.price * p.stock, 0)
                      .toFixed(2)}
                  </div>
                  <div style={{ fontSize: "12px", color: "#1565c0" }}>
                    Valor Inventario
                  </div>
                </div>
                {/* ✅ Estadística adicional del carrito */}
                {cart && cart.length > 0 && (
                  <div
                   className="stockContentFondo"
                  >
                    <div
                     className="stockContentLetras"
                    >
                      {cart.length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#155724" }}>
                      En Carrito
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modales mejorados */}
      <IVAModal
        isOpen={showIVAModal}
        onClose={() => {
          setShowIVAModal(false);
          setSelectedProduct(null);
          
        }}
        onConfirm={handleIVAConfirm}
        product={selectedProduct}
        quantity={quantity}
      />

      <ImprovedCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
      />

      {/* ✅ Generador de Facturas ARCA - NO pasar productos, solo usar carrito */}
      <InvoiceGenerator
        isOpen={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        // ✅ CAMBIO IMPORTANTE: No pasar products, solo usar el carrito
        cart={cart}
      />

      {/* ✅ Estilos CSS para animaciones */}
      <style>{`
       
      `}</style>
    </div>
  );
}

export default Products;
