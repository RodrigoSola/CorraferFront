import { useState, useRef, useEffect } from 'react';
import ImprovedCart from './ImprovedCart';
import { useCart } from './CartContext'; // CAMBIADO: Importar del contexto
import IVAModal from './ModalIVA';
import useFetchProducts from '../hooks/products/useFetchProducts';

function BarcodeInput() {
  const [manualBarcode, setManualBarcode] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [searchResult, setSearchResult] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showIVAModal, setShowIVAModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  // CAMBIADO: Usar el contexto en lugar del hook local
  const { addToCart, getCartCount } = useCart();
  const { products, fetchProducts, isLoading, error, done } = useFetchProducts();
  
  // Cargar productos al inicializar el componente
  useEffect(() => {
    if (!done) {
      fetchProducts();
    }
  }, [fetchProducts, done]);

  // Auto-enfocar el input al cargar el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filtrado automático mientras se escribe
  useEffect(() => {
    if (manualBarcode.trim() && products.length > 0) {
      const filtered = products.filter(product => {
        const barcode = product.barcode || '';
        const name = product.name || '';
        const id = product._id || '';
        
        return barcode.toLowerCase().includes(manualBarcode.toLowerCase()) ||
               name.toLowerCase().includes(manualBarcode.toLowerCase()) ||
               id.toLowerCase().includes(manualBarcode.toLowerCase());
      }).slice(0, 5); // Limitar a 5 sugerencias
      
      setFilteredProducts(filtered);
      setShowSuggestions(filtered.length > 0 && manualBarcode.length > 0);
      
      // Búsqueda exacta automática
      const exactMatch = products.find(product => 
        (product.barcode && product.barcode === manualBarcode) || 
        (product._id && product._id === manualBarcode)
      );
      
      if (exactMatch && exactMatch !== searchResult) {
        setSearchResult(exactMatch);
        setSearchError(null);
        setShowSuggestions(false);
      } else if (!exactMatch && searchResult) {
        setSearchResult(null);
      }
    } else {
      setFilteredProducts([]);
      setShowSuggestions(false);
      if (searchResult) {
        setSearchResult(null);
      }
    }
  }, [manualBarcode, products, searchResult]);

  // Función para seleccionar un producto de las sugerencias
  const selectProduct = (product) => {
    setManualBarcode(product.barcode || product._id || '');
    setSearchResult(product);
    setShowSuggestions(false);
    setSearchError(null);
    inputRef.current?.focus();
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualBarcode.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setShowSuggestions(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const foundProduct = products.find(product => 
        (product.barcode && product.barcode === manualBarcode.trim()) || 
        (product._id && product._id === manualBarcode.trim())
      );
      
      if (foundProduct) {
        setSearchResult(foundProduct);
      } else {
        setSearchError(`No se encontró ningún producto con el código: ${manualBarcode}`);
        setSearchResult(null);
      }
    } catch (error) {
      console.error(error);
      setSearchError('Error al buscar el producto');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = () => {
    if (searchResult) {
      setShowIVAModal(true);
    }
  };

  const handleIVAConfirm = (priceWithIVA, priceWithoutIVA) => {
    console.log('🎯 IVA confirmado:', { priceWithIVA, priceWithoutIVA, product: searchResult, quantity });
    
    if (!searchResult || !priceWithIVA || !priceWithoutIVA) {
      console.error('❌ Error: Datos incompletos');
      return;
    }
    
    // AGREGAMOS DEBUG ANTES DE AGREGAR AL CARRITO
    console.log('📦 ANTES de agregar - Estado actual del carrito:');
    
    // Agregar al carrito usando el contexto
    addToCart(searchResult, quantity, priceWithIVA, priceWithoutIVA);
    
    console.log('📦 DESPUÉS de agregar - Conteo:', getCartCount());
    
    // Cerrar modal
    setShowIVAModal(false);
    
    // Limpiar formulario para continuar agregando productos
    setSearchResult(null);
    setManualBarcode('');
    setQuantity(1);
    setSearchError(null);
    setShowSuggestions(false);
    
    // Mostrar mensaje de éxito
    console.log('✅ Producto agregado correctamente al carrito');
    
    // Mantener foco en el input para seguir escaneando
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const clearSearch = () => {
    setSearchResult(null);
    setSearchError(null);
    setManualBarcode('');
    setQuantity(1);
    setFilteredProducts([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation para las sugerencias
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      clearSearch();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResult) {
        handleAddToCart();
      } else {
        handleManualSearch(e);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ color: 'red' }}>Error al cargar productos: {error}</p>
        <button onClick={fetchProducts}>Intentar de nuevo</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>Buscar Producto por Código de Barras</h3>
        
        <div style={{ marginBottom: '15px', position: 'relative' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Código de barras o nombre del producto..."
                autoComplete="off"
                style={{
                  padding: '12px',
                  border: '2px solid #007bff',
                  borderRadius: '6px',
                  width: '100%',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              
              {/* Sugerencias dropdown */}
              {showSuggestions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderTop: 'none',
                  borderRadius: '0 0 6px 6px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {filteredProducts.map(product => (
                    <div
                      key={product._id}
                      onClick={() => selectProduct(product)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                        ':hover': { backgroundColor: '#f5f5f5' }
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={{ fontWeight: 'bold' }}>{product.name || 'Sin nombre'}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Código: {product.barcode || product._id || 'Sin código'} | Precio: ${(product.adjustedPrice || product.price || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={handleManualSearch}
              disabled={isSearching || !manualBarcode.trim()}
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSearching ? 'not-allowed' : 'pointer',
                opacity: isSearching ? 0.6 : 1,
                whiteSpace: 'nowrap'
              }}
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button
            onClick={clearSearch}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Limpiar
          </button>
          
          <button
            onClick={() => setShowCart(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Ver Carrito ({getCartCount()}) {/* AGREGADO: Mostrar contador */}
          </button>
        </div>

        {/* Indicador de productos disponibles */}
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>📦 {products.length} productos cargados</strong>
          <div style={{ marginTop: '5px', color: '#666' }}>
            💡 Tip: Escribe para ver sugerencias, o escanea/escribe el código completo
          </div>
        </div>

        {searchError && (
          <div style={{ 
            color: 'red', 
            padding: '12px', 
            backgroundColor: '#fee', 
            borderRadius: '4px',
            marginBottom: '15px',
            border: '1px solid #fcc'
          }}>
            ❌ {searchError}
          </div>
        )}

        {searchResult && (
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '15px', 
            borderRadius: '6px',
            marginBottom: '15px',
            border: '2px solid #007bff'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>✅ Producto Encontrado:</h4>
            <div style={{ marginBottom: '10px' }}>
              <p><strong>Nombre:</strong> {searchResult.name}</p>
              <p><strong>Código:</strong> {searchResult.barcode}</p>
              <p><strong>Precio:</strong> ${(searchResult.adjustedPrice || searchResult.price).toFixed(2)}</p>
              <p><strong>Stock:</strong> {searchResult.stock} unidades</p>
              <p><strong>Categoría:</strong> {searchResult.category?.name || 'Sin categoría'}</p>
            </div>
            
            <div style={{ 
              marginTop: '15px', 
              display: 'flex', 
              gap: '15px', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong>Cantidad:</strong>
                <input
                  type="number"
                  min="1"
                  max={searchResult.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    width: '80px',
                    textAlign: 'center'
                  }}
                />
              </label>
              
              <button
                onClick={handleAddToCart}
                disabled={quantity > searchResult.stock || quantity < 1}
                style={{
                  padding: '12px 24px',
                  backgroundColor: (quantity > searchResult.stock || quantity < 1) ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (quantity > searchResult.stock || quantity < 1) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                🛒 Agregar al Carrito
              </button>
            </div>
            
            {quantity > searchResult.stock && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '8px', margin: 0 }}>
                ⚠️ Cantidad excede el stock disponible ({searchResult.stock})
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de selección IVA */}
      <IVAModal
        isOpen={showIVAModal}
        onClose={() => setShowIVAModal(false)}
        onConfirm={handleIVAConfirm}
        product={searchResult}
        quantity={quantity}
      />

      {/* Carrito */}
      <ImprovedCart
        isOpen={showCart}
        onClose={() => setShowCart(false)}
      />
    </div>
  );
}

export default BarcodeInput;