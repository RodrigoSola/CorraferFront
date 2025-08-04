import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Crear el contexto
const CartContext = createContext(undefined);

// Hook para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};

// Provider del contexto
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [includeIVA, setIncludeIVA] = useState(true);

  // Función para calcular el total
  const calculateTotal = useCallback((cartItems, useIVA) => {
    console.log('🧮 Calculando total para:', cartItems, 'con IVA:', useIVA);
    const newTotal = cartItems.reduce((sum, item) => {
      const price = useIVA ? (item.priceWithIVA || 0) : (item.priceWithoutIVA || 0);
      const itemTotal = price * (item.quantity || 0);
      console.log(`Precio item ${item.name}: $${price} x ${item.quantity} = $${itemTotal}`);
      return sum + itemTotal;
    }, 0);
    console.log('💰 Total calculado:', newTotal);
    return newTotal;
  }, []);

  // Recalcular total cuando cambie el carrito o el estado de IVA
  useEffect(() => {
    console.log('🔄 Recalculando total. Cart length:', cart.length);
    const newTotal = calculateTotal(cart, includeIVA);
    setTotal(newTotal);
  }, [cart, includeIVA, calculateTotal]);

  const addToCart = useCallback((product, quantity = 1, priceWithIVA, priceWithoutIVA) => {
    console.log('🛒 Agregando al carrito:', {
      product: product?.name || 'Sin nombre',
      productId: product?._id,
      quantity,
      priceWithIVA,
      priceWithoutIVA
    });

    // Validaciones
    if (!product || !product._id) {
      console.error('❌ Error: Producto inválido', product);
      return;
    }

    if (priceWithIVA === undefined || priceWithIVA === null || priceWithoutIVA === undefined || priceWithoutIVA === null) {
      console.error('❌ Error: Precios no definidos', { priceWithIVA, priceWithoutIVA });
      return;
    }

    if (quantity <= 0) {
      console.error('❌ Error: Cantidad debe ser mayor a 0');
      return;
    }

    setCart(prevCart => {
      console.log('🔍 Estado actual del carrito:', prevCart);
      
      const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
      console.log('🔍 Índice del producto existente:', existingItemIndex);
      
      let newCart;

      if (existingItemIndex !== -1) {
        // Si el producto ya existe, actualizar cantidad
        newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity
        };
        console.log('📝 Actualizando cantidad del producto existente');
      } else {
        // Si es un producto nuevo, agregarlo
        const newItem = { 
          ...product, 
          quantity: quantity, 
          priceWithIVA: priceWithIVA, 
          priceWithoutIVA: priceWithoutIVA
        };
        console.log('➕ Agregando nuevo producto:', newItem);
        newCart = [...prevCart, newItem];
      }
      
      console.log('🛒 Nuevo estado del carrito:', newCart);
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    console.log('🗑️ Removiendo del carrito:', productId);
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item._id !== productId);
      console.log('🛒 Carrito después de remover:', newCart);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    console.log('📝 Actualizando cantidad:', { productId, newQuantity });
    
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item._id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
      console.log('🛒 Carrito después de actualizar cantidad:', newCart);
      return newCart;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    console.log('🧹 Limpiando carrito completo');
    setCart([]);
  }, []);

  const getCartCount = useCallback(() => {
    const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    console.log('🔢 Conteo del carrito:', count);
    return count;
  }, [cart]);

  const toggleIVA = useCallback(() => {
    console.log('🔄 Cambiando estado IVA de:', includeIVA, 'a:', !includeIVA);
    setIncludeIVA(prev => !prev);
  }, [includeIVA]);

  // Debug info
  console.log('🛒 CartContext State:', {
    cartLength: cart.length,
    total: total.toFixed(2),
    includeIVA,
    hasItems: cart.length > 0
  });

  const value = {
    cart,
    cartItems: cart, // ✅ Agregamos cartItems como alias para compatibilidad
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    includeIVA,
    toggleIVA
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};