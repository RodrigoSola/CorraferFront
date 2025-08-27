import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

// ✅ Crear el contexto del carrito
const CartContext = createContext();

// ✅ Hook para usar el contexto
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    console.error('❌ useCart debe ser usado dentro de CartProvider');
    // ✅ Retornar valores por defecto en lugar de lanzar error
    return {
      cart: [],
      addToCart: () => console.warn('CartProvider no disponible'),
      removeFromCart: () => console.warn('CartProvider no disponible'),
      updateCartItem: () => console.warn('CartProvider no disponible'),
      clearCart: () => console.warn('CartProvider no disponible'),
      getDetailedTotals: () => ({
        withIVA: 0,
        withoutIVA: 0,
        totalItems: 0,
        avgPrice: 0,
        ivaAmount: 0
      }),
      cartStats: {
        totalItems: 0,
        totalPrice: 0,
        totalPriceWithoutIVA: 0,
        uniqueProducts: 0,
        averagePrice: 0
      }
    };
  }
  return context;
};

// ✅ Componente de debug opcional (optimizado)
export const CartDebugger = () => {
  const { cart, cartStats } = useCart();
  
  if (import.meta.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '12px',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <div><strong>🛒 Cart Debug:</strong></div>
      <div>Productos únicos: {cart.length}</div>
      <div>Items totales: {cartStats.totalItems}</div>
      <div>Total con IVA: ${cartStats.totalPrice.toFixed(2)}</div>
      <div>Total sin IVA: ${cartStats.totalPriceWithoutIVA.toFixed(2)}</div>
      <div>Precio promedio: ${cartStats.averagePrice.toFixed(2)}</div>
      <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.8 }}>
        Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

// ✅ Proveedor del contexto del carrito
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // ✅ Memoizar el conteo del carrito para evitar recálculos
  const cartCount = useMemo(() => {
    try {
      if (!Array.isArray(cart)) {
        return 0;
      }

      const count = cart.reduce((total, item) => {
        const quantity = parseInt(item?.quantity || 0);
        return total + (isNaN(quantity) ? 0 : quantity);
      }, 0);

      return count;

    } catch (error) {
      console.error('❌ Error contando productos del carrito:', error);
      return 0;
    }
  }, [cart]);

  // ✅ Función memoizada para calcular total del carrito
  const calculateTotal = useCallback((cartItems, includeIVA = true) => {
    try {
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        return 0;
      }
      
      const total = cartItems.reduce((sum, item) => {
        if (!item || typeof item !== 'object') {
          console.warn('⚠️ Item inválido en carrito:', item);
          return sum;
        }

        const price = includeIVA 
          ? parseFloat(item.priceWithIVA || item.unitPrice || 0)
          : parseFloat(item.priceWithoutIVA || (item.priceWithIVA || item.unitPrice || 0) / 1.21);
        
        const quantity = parseInt(item.quantity || 1);
        
        if (isNaN(price) || isNaN(quantity)) {
          console.warn('⚠️ Precio o cantidad inválidos:', { price, quantity, item });
          return sum;
        }

        return sum + (price * quantity);
      }, 0);

      return parseFloat(total.toFixed(2));

    } catch (error) {
      console.error('❌ Error calculando total del carrito:', error);
      return 0;
    }
  }, []);

  // ✅ Memoizar totales con y sin IVA
  const cartTotals = useMemo(() => {
    const totalWithIVA = calculateTotal(cart, true);
    const totalWithoutIVA = calculateTotal(cart, false);
    
    return {
      withIVA: totalWithIVA,
      withoutIVA: totalWithoutIVA
    };
  }, [cart, calculateTotal]);

  // ✅ Función para agregar productos al carrito
  const addToCart = useCallback((product, quantity = 1, priceWithIVA, priceWithoutIVA) => {
    try {
      console.log('🛒 Agregando al carrito:', {
        product: product?.name,
        quantity,
        priceWithIVA,
        priceWithoutIVA
      });

      if (!product || !product._id) {
        console.error('❌ Producto inválido para agregar al carrito');
        return false;
      }

      const validQuantity = Math.max(1, parseInt(quantity) || 1);
      const validPriceWithIVA = parseFloat(priceWithIVA || product.price || 0);
      const validPriceWithoutIVA = parseFloat(priceWithoutIVA || (validPriceWithIVA / 1.21));

      if (validPriceWithIVA <= 0) {
        console.error('❌ Precio inválido para agregar al carrito');
        return false;
      }

      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(item => item._id === product._id);
        
        if (existingItemIndex >= 0) {
          // ✅ Producto ya existe, actualizar cantidad
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            quantity: updatedCart[existingItemIndex].quantity + validQuantity,
            priceWithIVA: validPriceWithIVA,
            priceWithoutIVA: validPriceWithoutIVA,
            unitPrice: validPriceWithIVA
          };
          
          console.log('✅ Producto actualizado en carrito:', updatedCart[existingItemIndex]);
          return updatedCart;
        } else {
          // ✅ Producto nuevo, agregar al carrito
          const newItem = {
            ...product,
            quantity: validQuantity,
            priceWithIVA: validPriceWithIVA,
            priceWithoutIVA: validPriceWithoutIVA,
            unitPrice: validPriceWithIVA,
            addedAt: new Date().toISOString()
          };
          
          console.log('✅ Nuevo producto agregado al carrito:', newItem);
          return [...prevCart, newItem];
        }
      });

      return true;

    } catch (error) {
      console.error('❌ Error agregando producto al carrito:', error);
      return false;
    }
  }, []);

  // ✅ Función para remover productos del carrito
  const removeFromCart = useCallback((productId) => {
    try {
      console.log('🗑️ Removiendo del carrito:', productId);
      
      setCart(prevCart => {
        const updatedCart = prevCart.filter(item => item._id !== productId);
        console.log('✅ Producto removido. Carrito actualizado:', updatedCart.length, 'items');
        return updatedCart;
      });

      return true;

    } catch (error) {
      console.error('❌ Error removiendo producto del carrito:', error);
      return false;
    }
  }, []);

  // ✅ Función para actualizar cantidad de un producto en el carrito
  const updateCartItem = useCallback((productId, newQuantity) => {
    try {
      console.log('📝 Actualizando cantidad en carrito:', productId, newQuantity);
      
      const validQuantity = Math.max(0, parseInt(newQuantity) || 0);
      
      if (validQuantity === 0) {
        return removeFromCart(productId);
      }

      setCart(prevCart => {
        return prevCart.map(item => {
          if (item._id === productId) {
            console.log('✅ Cantidad actualizada:', item.name, 'de', item.quantity, 'a', validQuantity);
            return {
              ...item,
              quantity: validQuantity
            };
          }
          return item;
        });
      });

      return true;

    } catch (error) {
      console.error('❌ Error actualizando cantidad en carrito:', error);
      return false;
    }
  }, [removeFromCart]);

  // ✅ Función para limpiar el carrito
  const clearCart = useCallback(() => {
    try {
      console.log('🧹 Limpiando carrito completo...');
      setCart([]);
      console.log('✅ Carrito limpiado exitosamente');
      return true;

    } catch (error) {
      console.error('❌ Error limpiando carrito:', error);
      return false;
    }
  }, []);

  // ✅ Función para obtener un producto específico del carrito
  const getCartItem = useCallback((productId) => {
    try {
      return cart.find(item => item._id === productId) || null;
    } catch (error) {
      console.error('❌ Error obteniendo item del carrito:', error);
      return null;
    }
  }, [cart]);

  // ✅ Función para verificar si un producto está en el carrito
  const isInCart = useCallback((productId) => {
    try {
      return cart.some(item => item._id === productId);
    } catch (error) {
      console.error('❌ Error verificando si está en carrito:', error);
      return false;
    }
  }, [cart]);

  // ✅ Función para obtener estadísticas del carrito (memoizada)
  const cartStats = useMemo(() => {
    try {
      const stats = {
        totalItems: cartCount,
        totalPrice: cartTotals.withIVA,
        totalPriceWithoutIVA: cartTotals.withoutIVA,
        uniqueProducts: cart.length,
        averagePrice: cartCount > 0 ? cartTotals.withIVA / cartCount : 0
      };
      
      return stats;

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del carrito:', error);
      return {
        totalItems: 0,
        totalPrice: 0,
        totalPriceWithoutIVA: 0,
        uniqueProducts: 0,
        averagePrice: 0
      };
    }
  }, [cart.length, cartCount, cartTotals]);

  // ✅ Función para obtener totales detallados
  const getDetailedTotals = useCallback(() => {
    if (!cart || cart.length === 0) {
      return {
        withIVA: 0,
        withoutIVA: 0,
        totalItems: 0,
        avgPrice: 0,
        ivaAmount: 0
      };
    }

    const totals = cart.reduce((acc, item) => {
      const quantity = parseInt(item.quantity || 1);
      const priceWithIVA = parseFloat(item.priceWithIVA || item.unitPrice || 0);
      const priceWithoutIVA = parseFloat(item.priceWithoutIVA || (priceWithIVA / 1.21));
      
      acc.withIVA += priceWithIVA * quantity;
      acc.withoutIVA += priceWithoutIVA * quantity;
      acc.totalItems += quantity;
      
      return acc;
    }, { withIVA: 0, withoutIVA: 0, totalItems: 0 });

    const avgPrice = totals.totalItems > 0 ? totals.withIVA / totals.totalItems : 0;
    const ivaAmount = totals.withIVA - totals.withoutIVA;

    return {
      withIVA: parseFloat(totals.withIVA.toFixed(2)),
      withoutIVA: parseFloat(totals.withoutIVA.toFixed(2)),
      totalItems: totals.totalItems,
      avgPrice: parseFloat(avgPrice.toFixed(2)),
      ivaAmount: parseFloat(ivaAmount.toFixed(2))
    };
  }, [cart]);

  // ✅ Efecto para debug del carrito (optimizado)
  useEffect(() => {
    if (import.meta.env.NODE_ENV === 'development') {
      console.log('🛒 Carrito actualizado:', {
        productos: cart.length,
        items: cartCount,
        total: cartTotals.withIVA,
        carrito: cart
      });
    }
  }, [cart, cartCount, cartTotals]);

  // ✅ Efecto para cargar carrito desde localStorage al inicio
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('shopping_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          console.log('📦 Cargando carrito desde localStorage:', parsedCart.length, 'productos');
          setCart(parsedCart);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando carrito desde localStorage:', error);
      setCart([]);
    }
  }, []);

  // ✅ Efecto para guardar carrito en localStorage (optimizado)
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem('shopping_cart', JSON.stringify(cart));
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('💾 Carrito guardado en localStorage');
        }
      } else {
        localStorage.removeItem('shopping_cart');
        if (import.meta.env.NODE_ENV === 'development') {
          console.log('🗑️ Carrito eliminado de localStorage');
        }
      }
    } catch (error) {
      console.error('❌ Error guardando carrito en localStorage:', error);
    }
  }, [cart]);

  // ✅ Valor del contexto memoizado (CORREGIDO)
  const contextValue = useMemo(() => ({
    // Estado
    cart,
    
    // Funciones principales
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    
    // Funciones de consulta
    getCartItem,
    isInCart,
    getDetailedTotals,
    
    // Función de cálculo para uso externo
    calculateTotal,
    
    // Estadísticas memoizadas
    cartStats
  }), [
    cart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartItem,
    isInCart,
    getDetailedTotals,
    calculateTotal,
    cartStats
  ]);

  // ✅ RETORNAR EL PROVIDER (FALTABA ESTO!)
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;