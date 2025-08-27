import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useCart } from './CartContext';
import { 
  FaTrash, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaTimes, 
  FaPercentage, 
  FaExclamationTriangle,
  FaStar,        // ✅ AGREGADO: Importar FaStar
  FaReceipt,     // ✅ AGREGADO: Importar FaReceipt  
  FaBoxes        // ✅ AGREGADO: Importar FaBoxes
} from 'react-icons/fa';
import "../css/ImporvedCart.css"

const ImprovedCart = ({ isOpen, onClose, onGoToInvoice }) => {
  // ✅ Usar el contexto del carrito directamente
  const {
    cart = [],
    removeFromCart,
    updateCartItem,
    clearCart,
    getDetailedTotals
  } = useCart();

  const [showIVA, setShowIVA] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  console.log('🔄 Render ImprovedCart:', { isOpen, cartLength: cart?.length });
  console.log('🛒 ImprovedCart - Items:', cart?.length || 0, 'Cart contents:', cart);

  
  // ✅ Función para actualizar cantidad de un producto
  const handleUpdateQuantity = useCallback(async (productId, newQuantity) => {
    if (isUpdating) return;
    
    setIsAnimating(true);
    
    setIsUpdating(true);
    console.log('📝 Actualizando cantidad:', productId, 'nueva cantidad:', newQuantity);
    
    try {
      const success = await updateCartItem(productId, newQuantity);
      if (success) {
        console.log('✅ Cantidad actualizada exitosamente');
      } else {
        console.error('❌ Error actualizando cantidad');
        alert('Error al actualizar la cantidad. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('❌ Error en handleUpdateQuantity:', error);
      alert('Error al actualizar la cantidad. Inténtalo de nuevo.');
    } finally {
      setIsUpdating(false);
    }
  }, [updateCartItem, isUpdating]);

  // ✅ Función para eliminar producto
  const handleRemoveProduct = useCallback(async (productId, productName) => {
    if (isUpdating) return;
    
    console.log('🗑️ Eliminando producto:', productId);
    
    const confirmDelete = window.confirm(`¿Eliminar "${productName}" del carrito?`);
    if (confirmDelete) {
      setIsUpdating(true);
      setIsAnimating(true);
      try {
        const success = await removeFromCart(productId);
        if (success) {
          console.log('✅ Producto eliminado exitosamente');
        } else {
          console.error('❌ Error eliminando producto');
          alert('Error al eliminar el producto. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('❌ Error en handleRemoveProduct:', error);
        alert('Error al eliminar el producto. Inténtalo de nuevo.');
      } finally {
        setIsUpdating(false);
      }
    }
  }, [removeFromCart, isUpdating]);

  // ✅ Función MEJORADA para vaciar carrito completo
  const handleClearCart = useCallback(async () => {
    if (isUpdating) return;
    
    const confirmClear = window.confirm(
      `¿Estás seguro de vaciar todo el carrito?\n\n` +
      `Se eliminarán ${cart?.length || 0} productos.\n` +
      `Esta acción no se puede deshacer.`
    );
    
    if (confirmClear) {
      setIsUpdating(true);
      setIsAnimating(true);
      
      console.log('🗑️ Vaciando carrito completo...', { 
        productCount: cart?.length || 0,
        cartItems: cart?.map(item => item.name)
      });
      
      try {
        const success = await clearCart();
        if (success) {
          console.log('✅ Carrito vaciado exitosamente');
          
          // ✅ MOSTRAR MENSAJE DE CONFIRMACIÓN
          setTimeout(() => {
            alert(`✅ Carrito vaciado exitosamente.\n\nSe eliminaron ${cart?.length || 0} productos.`);
          }, 500);
          
          // ✅ CERRAR MODAL SI EL CARRITO ESTÁ VACÍO
          setTimeout(() => {
            if (onClose && typeof onClose === 'function') {
              onClose();
            }
          }, 1500);
          
        } else {
          console.error('❌ Error vaciando carrito');
          alert('Error al vaciar el carrito. Inténtalo de nuevo.');
        }
      } catch (error) {
        console.error('❌ Error en handleClearCart:', error);
        alert('Error al vaciar el carrito. Inténtalo de nuevo.');
      } finally {
        setIsUpdating(false);
        setTimeout(() => setIsAnimating(false), 300);
      }
    }
  }, [clearCart, isUpdating, cart, onClose]);

  // ✅ Calcular totales usando getDetailedTotals
  const totals = useMemo(() => {
    return getDetailedTotals();
  }, [getDetailedTotals]);

  // ✅ Manejar cierre del modal
  const handleClose = useCallback(() => {
    if (isUpdating) return;
    console.log('🔄 Cerrando carrito por click en botón');
    onClose();
  }, [onClose, isUpdating]);

  const handleOverlayClick = useCallback((e) => {
    if (isUpdating) return;
    if (e.target === e.currentTarget) {
      console.log('🔄 Cerrando carrito por click en overlay');
      onClose();
    }
  }, [onClose, isUpdating]);

  // ✅ Manejar navegación a facturación
  const handleGoToInvoice = useCallback(() => {
    if (isUpdating || !cart || cart.length === 0) return;
    
    console.log('🧾 Navegando a generador de facturas desde carrito');
    handleClose();
    
    // Llamar callback si existe
    if (onGoToInvoice) {
      onGoToInvoice();
    }
  }, [cart, isUpdating, handleClose, onGoToInvoice]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  // ✅ EFECTO PARA CERRAR AUTOMÁTICAMENTE CUANDO EL CARRITO SE VACÍA
  useEffect(() => {
    if (isOpen && (!cart || cart.length === 0) && !isUpdating) {
      console.log('📦 Carrito vacío detectado, cerrando modal en 2 segundos...');
      
      const timer = setTimeout(() => {
        if (onClose && typeof onClose === 'function') {
          console.log('🔄 Cerrando carrito automáticamente (vacío)');
          onClose();
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, cart, isUpdating, onClose]);

  if (!isOpen) return null;

  return (
     <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(30,64,175,0.6) 100%)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
      onClick={handleOverlayClick}
    >
      {/* Partículas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div 
        className={`flex justify-center items-center min-h-screen p-4 transition-all duration-300 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div 
          className="w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-[1.01]"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e2e8f0 100%)',
            borderRadius: '24px',
            border: '2px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          
          {/* ✅ Header ultra mejorado con gradiente y efectos */}
          <div 
            className="relative overflow-hidden p-6"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Patrón de fondo animado */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  animation: 'float 6s ease-in-out infinite'
                }}
              />
            </div>

            <div className="relative flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div 
                  className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl border border-white/30 shadow-lg transform transition-all duration-300 hover:scale-110"
                  style={{
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  <FaShoppingCart className="text-white text-2xl animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">
                    🛒 Carrito de Compras
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                      <span className="text-white font-semibold">
                        {totals.totalItems} productos • ${showIVA ? totals.withIVA.toFixed(2) : totals.withoutIVA.toFixed(2)}
                      </span>
                    </div>
          
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-full shadow-lg">
                      <span className="text-white font-bold text-sm">
                        💎 Premium Cart
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Toggle IVA mejorado */}
                <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
                  <FaPercentage className="text-white/80" />
                  <button
                    onClick={() => setShowIVA(!showIVA)}
                    disabled={isUpdating}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform ${
                      showIVA 
                        ? 'bg-white text-purple-600 shadow-lg scale-105' 
                        : 'bg-white/20 text-white hover:bg-white/30'
                    } ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                  >
                    {showIVA ? '💰 Con IVA' : '💸 Sin IVA'}
                  </button>
                </div>
                
                <button 
                  onClick={handleClose}
                  disabled={isUpdating}
                  className={`text-white/80 hover:text-white hover:bg-white/20 p-3 rounded-xl transition-all duration-300 transform ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                  }`}
                  style={{
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <FaTimes size={24} />
                </button>
              </div>
            </div>

            {/* Barra de progreso animada */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-gradient-to-r from-white to-yellow-200 transition-all duration-1000"
                style={{ 
                  width: `${Math.min(100, (totals.withIVA / 1000) * 100)}%`,
                  animation: 'shimmer 2s infinite'
                }}
              />
            </div>
          </div>

          {/* ✅ Indicador de carga mejorado */}
          {isUpdating && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b px-6 py-3">
              <div className="flex items-center gap-3 text-blue-700">
                <div 
                  className="w-5 h-5 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"
                  style={{ borderWidth: '3px' }}
                />
                <span className="font-semibold">⚡ Actualizando carrito mágicamente...</span>
                <div className="flex gap-1 ml-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ✅ MENSAJE ESPECIAL CUANDO EL CARRITO SE ESTÁ VACIANDO */}
          {isUpdating && cart && cart.length === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b px-6 py-4">
              <div className="flex items-center gap-3 text-emerald-700">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <div>
                  <span className="font-bold">¡Carrito vaciado exitosamente!</span>
                  <p className="text-sm text-emerald-600">El modal se cerrará automáticamente...</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Contenido del carrito ultra mejorado */}
          <div className="flex-1 overflow-auto p-6">
            {!cart || cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="text-8xl mb-4 opacity-20 animate-bounce">🛒</div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-10 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent mb-4">
                  {isUpdating ? 'Vaciando carrito...' : 'Tu carrito está vacío'}
                </h3>
                <p className="text-gray-500 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                  {isUpdating 
                    ? 'Procesando eliminación de productos...' 
                    : '¡Descubre productos increíbles y comienza a llenar tu carrito de sueños!'
                  }
                </p>
                {!isUpdating && (
                  <button
                    onClick={handleClose}
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
                  >
                    ✨ Explorar Productos
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item, index) => {
                  const priceWithIVA = parseFloat(item.priceWithIVA || item.unitPrice || 0);
                  const priceWithoutIVA = parseFloat(item.priceWithoutIVA || (priceWithIVA / 1.21));
                  const displayPrice = showIVA ? priceWithIVA : priceWithoutIVA;
                  const totalPrice = displayPrice * item.quantity;
                  
                  return (
                    <div 
                      key={item._id || index}
                      className={`group relative overflow-hidden rounded-2xl p-6 border-2 transition-all duration-500 transform hover:scale-[1.02] hover:shadow-2xl ${
                        isUpdating ? 'opacity-70 scale-95' : 'hover:-translate-y-1'
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4) 1',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)'
                      }}
                    >
                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                        <div 
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                            transform: 'translateX(-100%)',
                            animation: 'shine 2s infinite'
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="font-bold text-gray-800 text-xl group-hover:text-blue-600 transition-colors">
                              {item.name}
                            </h4>
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-1 rounded-full">
                              <FaStar className="text-white text-xs" />
                            </div>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-600 italic mb-4 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border">
                              📝 {item.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-3 mb-4 flex-wrap">
                            <div className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full font-bold shadow-sm">
                              💰 ${displayPrice.toFixed(2)} c/u
                            </div>
                            {item.barcode && (
                              <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-2 rounded-full font-mono text-sm shadow-sm">
                                🏷️ {item.barcode}
                              </div>
                            )}
                            <div className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-4 py-2 rounded-full font-bold shadow-sm">
                              📦 Stock: {item.stock || 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                            ${totalPrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                            {showIVA ? '✅ IVA incluido' : '💸 Sin IVA'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Controles de cantidad ultra mejorados */}
                      <div className="flex justify-between items-center pt-4 border-t border-gradient-to-r from-blue-200 to-purple-200">
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-700">📦 Cantidad:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item._id, Math.max(1, item.quantity - 1))}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-lg"
                            >
                              <FaMinus size={14} />
                            </button>
                            
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newValue = Math.max(1, parseInt(e.target.value) || 1);
                                if (newValue !== item.quantity) {
                                  handleUpdateQuantity(item._id, newValue);
                                }
                              }}
                              disabled={isUpdating}
                              className="w-20 h-10 text-center border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              min="1"
                              style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                              }}
                            />
                            
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                              disabled={isUpdating}
                              className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full flex items-center justify-center hover:from-green-500 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 shadow-lg"
                            >
                              <FaPlus size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveProduct(item._id, item.name)}
                          disabled={isUpdating}
                          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-100 to-red-200 text-red-600 rounded-xl hover:from-red-200 hover:to-red-300 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <FaTrash size={14} />
                          Eliminar
                        </button>
                      </div>
                      
                      {/* Información de precios mejorada */}
                      <div className="mt-4 p-4 rounded-xl border-2" style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                        borderImage: 'linear-gradient(45deg, #e2e8f0, #cbd5e1) 1'
                      }}>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">💰 Con IVA:</span>
                            <span className="font-bold text-blue-600">${priceWithIVA.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">💸 Sin IVA:</span>
                            <span className="font-bold text-purple-600">${priceWithoutIVA.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">📊 Subtotal con IVA:</span>
                            <span className="font-bold text-green-600">${(priceWithIVA * item.quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">📈 Subtotal sin IVA:</span>
                            <span className="font-bold text-emerald-600">${(priceWithoutIVA * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ✅ Footer ultra mejorado con totales y acciones */}
          {cart && cart.length > 0 && (
            <div 
              className="border-t-2 p-6"
              style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderImage: 'linear-gradient(45deg, #3b82f6, #8b5cf6) 1'
              }}
            >
              {/* Resumen de totales mejorado */}
              <div 
                className="rounded-2xl p-6 mb-6 border-2 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                  borderImage: 'linear-gradient(45deg, #06b6d4, #3b82f6) 1'
                }}
              >
                <h3 className="font-bold text-2xl mb-4 bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
                  📊 Resumen del Pedido Premium
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                      <span className="text-gray-700 font-medium">🏷️ Total productos:</span>
                      <span className="font-bold text-blue-600 text-lg">{cart.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                      <span className="text-gray-700 font-medium">📦 Total unidades:</span>
                      <span className="font-bold text-purple-600 text-lg">{totals.totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-indigo-50 rounded-lg">
                      <span className="text-gray-700 font-medium">💎 Precio promedio:</span>
                      <span className="font-bold text-indigo-600 text-lg">${totals.avgPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium">📊 IVA total:</span>
                      <span className="font-bold text-green-600 text-lg">${totals.ivaAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 bg-cyan-50 rounded-lg">
                      <span className="text-gray-700 font-medium">💰 Subtotal con IVA:</span>
                      <span className="font-bold text-cyan-600 text-lg">${totals.withIVA.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-teal-50 rounded-lg">
                      <span className="text-gray-700 font-medium">💸 Subtotal sin IVA:</span>
                      <span className="font-bold text-teal-600 text-lg">${totals.withoutIVA.toFixed(2)}</span>
                    </div>
                    <div 
                      className="flex justify-between items-center p-4 rounded-xl border-2 shadow-md"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: '2px solid #059669'
                      }}
                    >
                      <span className="text-white font-bold text-lg">💎 Total a pagar:</span>
                      <span className="text-white font-bold text-2xl">
                        ${showIVA ? totals.withIVA.toFixed(2) : totals.withoutIVA.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Información adicional mejorada */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <FaPercentage className="flex-shrink-0" />
                    <span>💡 Usa el toggle "Con IVA/Sin IVA" para cambiar vista</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <FaReceipt className="flex-shrink-0" />
                    <span>🧾 Precios de facturación se configuran al generar</span>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción ultra mejorados */}
              <div className="flex justify-between items-center">
                {/* ✅ BOTÓN VACIAR CARRITO MEJORADO */}
                <button
                  onClick={handleClearCart}
                  disabled={isUpdating}
                  className={`group px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 ${
                    isUpdating 
                      ? 'opacity-50 cursor-not-allowed transform-none' 
                      : 'hover:scale-105'
                  }`}
                  title={`Eliminar todos los ${cart.length} productos del carrito`}
                >
                  <FaTrash className={`transition-transform duration-300 ${!isUpdating ? 'group-hover:animate-bounce' : ''}`} />
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Vaciando...
                    </>
                  ) : (
                    <>
                      🗑️ Vaciar Carrito
                      <span className="text-xs bg-red-700 px-2 py-1 rounded-full">
                        {cart.length}
                      </span>
                    </>
                  )}
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleClose}
                    disabled={isUpdating}
                    className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    ↩️ Seguir Comprando
                  </button>
                  
                  <button
                    onClick={handleGoToInvoice}
                    disabled={isUpdating}
                    className="group px-10 py-4 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 text-white rounded-2xl hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-pulse hover:animate-none relative"
                    style={{
                      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                  >
                    <FaReceipt className="group-hover:animate-spin" />
                    🧾 Generar Factura
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                  </button>
                </div>
              </div>

              {/* ✅ Advertencias y consejos mejorados */}
              {totals.totalItems > 50 && (
                <div 
                  className="mt-6 p-4 rounded-2xl border-2 flex items-center gap-3 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                    borderColor: '#f59e0b'
                  }}
                >
                  <FaExclamationTriangle className="text-yellow-600 text-xl flex-shrink-0 animate-bounce" />
                  <div>
                    <span className="text-yellow-800 font-bold">⚠️ Carrito grande detectado:</span>
                    <p className="text-yellow-700 mt-1">
                      Tienes {totals.totalItems} productos. Considera dividir en múltiples facturas para mejor gestión.
                    </p>
                  </div>
                </div>
              )}

              {totals.withIVA > 10000 && (
                <div 
                  className="mt-4 p-4 rounded-2xl border-2 flex items-center gap-3 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderColor: '#3b82f6'
                  }}
                >
                  <FaBoxes className="text-blue-600 text-xl flex-shrink-0 animate-pulse" />
                  <div>
                    <span className="text-blue-800 font-bold">💎 Venta Premium:</span>
                    <p className="text-blue-700 mt-1">
                      Total mayor a $10,000. Verifica los datos del cliente para una facturación precisa.
                    </p>
                  </div>
                </div>
              )}

              {/* ✅ MENSAJE DE CONFIRMACIÓN CUANDO EL CARRITO SE VACIÓ */}
              {cart.length === 0 && (
                <div 
                  className="mt-4 p-4 rounded-2xl border-2 flex items-center gap-3 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    borderColor: '#10b981'
                  }}
                >
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 font-bold">🎉 ¡Carrito vaciado exitosamente!</span>
                    <p className="text-emerald-700 mt-1">
                      Todos los productos han sido eliminados. El modal se cerrará automáticamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ ESTILOS CSS MEJORADOS PARA ANIMACIONES */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Mejorar la animación del botón vaciar carrito */
        .group:hover .group-hover\\:animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        
        /* Animación personalizada para el loading del carrito vacío */
        .empty-cart-loading {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        /* Mejorar transiciones */
        * {
          transition-property: transform, opacity, background-color, border-color, color, fill, stroke;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default ImprovedCart;