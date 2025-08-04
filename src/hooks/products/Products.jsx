import { useEffect, useState } from "react";
import { useCart } from "../../components/CartContext"; 
import IVAModal from "../../components/ModalIVA";
import useFetchProducts from "./useFetchProducts";
import useDeleteProduct from "./useDeleteProduct";
import { FaTrash, FaEdit } from "react-icons/fa";
import useUpdateProduct from "./useUpdateProduct";
import ImprovedCart from "../../components/ImprovedCart";
import Nav from "../../components/Nav";

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
  
  // ✅ Obtenemos cart del contexto
  const { addToCart, getCartCount, cart } = useCart();
  
  // 🔍 DEBUG: Agregar logs para verificar
  console.log('🔍 Products - Cart desde contexto:', cart);
  console.log('🔍 Products - Cart length:', cart?.length);
  console.log('🔍 Products - Cart count:', getCartCount());
  
  const [products, setProducts] = useState(initialProducts || []);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showIVAModal, setShowIVAModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    barcode: "",
  });
  const [percentage, setPercentage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!done) {
      fetchProducts();
    } else {
      setProducts(initialProducts || []);
    }
  }, [fetchProducts, done, initialProducts]);

  const handleAddToCart = () => {
    if (searchResult) {
      setShowIVAModal(true);
    }
  };

  const handleIVAConfirm = (priceWithIVA, priceWithoutIVA) => {
    if (!searchResult || !priceWithIVA || !priceWithoutIVA) {
      console.error('❌ Error: Datos incompletos');
      return;
    }
    addToCart(searchResult, quantity, priceWithIVA, priceWithoutIVA);
    setShowIVAModal(false);
    setSearchResult(null);
    setQuantity(1);
  };

  const filteredProducts = (products || []).filter(product => {
    if (!product || !product.name || !product.barcode) {
      return false;
    }
    
    return (
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
    );
  });

  if (isLoading) {
    return (
      <div>
        <h2>Productos</h2>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Productos</h2>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={fetchProducts}>Intentar de nuevo</button>
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

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProduct(editingProduct._id, formData).then(() => {
      setProducts(
        products.map((product) =>
          product._id === editingProduct._id
            ? { ...product, ...formData }
            : product
        )
      );
      setEditingProduct(null);
    });
  };

  const handleDelete = (_id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas borrar este producto?");
    if (confirmDelete) {
      deleteProduct(_id).then(() => {
        setProducts(products.filter((product) => product._id !== _id));
      });
    }
  };

  const handleIncreasePrice = () => {
    const increasePercentage = parseFloat(percentage);
    if (!isNaN(increasePercentage) && increasePercentage > 0) {
      const updatedProducts = products
        .filter(product => product && typeof product.price === 'number')
        .map((product) => {
          const newPrice = product.price + product.price * (increasePercentage / 100);
          return { ...product, price: newPrice.toFixed(2) };
        });
      
      setProducts(updatedProducts);
      setPercentage("");
      
      const updatePromises = updatedProducts.map(product =>
        updateProduct(product._id, { price: product.price })
      );
      
      Promise.all(updatePromises)
        .then(() => {
          console.log("Todos los productos han sido actualizados en el backend.");
        })
        .catch((error) => {
          console.error("Error al actualizar los productos en el backend:", error);
        });
    } else {
      alert("Por favor, ingresa un porcentaje válido.");
    }
  };

  // 🔍 DEBUG: Función para verificar antes de mostrar el carrito
  const handleShowCart = () => {
    console.log('🔍 Products - Antes de mostrar carrito:');
    console.log('🔍 Products - Cart:', cart);
    console.log('🔍 Products - Cart length:', cart?.length);
    setShowCart(true);
  };

  return (
    <div>
      <Nav />

      <div style={{ display: "flex" }}>
        
        <div
          style={{
            width: "200px",
            padding: "10px",
            borderRight: "1px solid #ccc",
          }}
        >
          <input
            type="text"
            placeholder="Buscar..."
            style={{ width: "100%", padding: "5px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ marginTop: "10px" }}>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="Porcentaje"
              style={{ width: "70%", padding: "5px" }}
            />
            <button onClick={handleIncreasePrice} style={{ marginLeft: "5px" }}>
              Aumentar Precio
            </button>
          </div>
        </div>

        <div style={{ padding: "10px", flex: 1 }}>
          <h2 style={{ textAlign: "center" }}>Productos</h2>
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                borderBottom: "1px solid #ddd",
              }}
            >
              <div>
                <strong>{product.name}</strong>
                <br />
                Precio: ${product.price}
                <br />
                Stock: {product.stock}
                <br />
                Código: {product.barcode}
              </div>
              <div>
                <button 
                  onClick={() => {
                    setSearchResult(product);
                    setShowIVAModal(true);
                    setQuantity(1);
                    handleAddToCart()
                  }}
                >
                  Agregar al Carrito
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  style={{ marginRight: "5px" }}
                >
                  <FaTrash />
                </button>
                <button onClick={() => handleEditClick(product)}>
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}

          <IVAModal
            isOpen={showIVAModal}
            onClose={() => setShowIVAModal(false)}
            onConfirm={handleIVAConfirm}
            product={searchResult}
            quantity={quantity}
          />

          {/* ✅ Pasamos el cart correctamente */}
          <ImprovedCart
            isOpen={showCart}
            onClose={() => setShowCart(false)}
            cart={cart}
          />

          <div>
            <h3>Carrito ({getCartCount()})</h3>
            {/* 🔍 DEBUG: Mostrar contenido del carrito aquí también */}
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Debug: Cart items: {cart?.length || 0}
              {cart && cart.length > 0 && (
                <ul>
                  {cart.map((item, index) => (
                    <li key={index}>{item.name} - Qty: {item.quantity}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            onClick={handleShowCart} // ✅ Usar la función con debug
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Ver Carrito ({getCartCount()})
          </button>
        </div>

        {editingProduct && (
          <form onSubmit={handleUpdate} style={{ marginTop: "20px" }}>
            <h3>Editar Producto</h3>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Nombre"
              required
            />
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Precio"
              required
            />
            <input
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="Stock"
              required
            />
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              placeholder="Código de barras"
              required
            />
            <button type="submit">Actualizar Producto</button>
            <button type="button" onClick={() => setEditingProduct(null)}>
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Products;