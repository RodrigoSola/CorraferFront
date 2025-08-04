import { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import ARCACheckoutModal from '../hooks/invoices/ARCACheckoutModal';
import InvoiceSuccessModal from '../hooks/invoices/InvoiceSuccessModal'; // ✅ Importar modal

const ImprovedCart = ({ 
  isOpen, 
  onClose, 
  cart = [], 
  clearCart,
  onCheckout
}) => {
  const [showWithIVA, setShowWithIVA] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // ✅ Estado para modal de éxito
  const [invoiceResult, setInvoiceResult] = useState(null); // ✅ Datos de la factura
  
  // Ensure cart is always an array
  const safeCartItems = Array.isArray(cart) ? cart : [];
  const { updateQuantity, removeFromCart } = useCart();
  
  console.log('🛒 ImprovedCart - Cart recibido:', safeCartItems);
  console.log('🛒 ImprovedCart - Props:', { isOpen, cartLength: cart?.length });

  // Función para manejar el checkout ARCA
  const handleARCACheckout = (e) => {
console.log('🔍 1. Button clicked - event:', e);
  console.log('🔍 2. Current URL:', window.location.href);
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('🔍 3. After preventDefault');
  console.log('🔍 4. About to close cart and open ARCA modal');
    console.log('🏛️ Abriendo modal ARCA con:', safeCartItems);
    onClose();
    
    setTimeout(() => {
      setShowCheckoutModal(true);
    }, 100);
  };

  // ✅ Función para manejar completado de checkout
  const handleCheckoutComplete = (invoiceData) => {
    console.log('✅ Checkout completado:', invoiceData);
    console.log('✅ Checkout completado - OBJETO COMPLETO:', JSON.stringify(invoiceData, null, 2));
    // Cerrar modal de checkout
    setShowCheckoutModal(false);
    
    // Limpiar carrito
    if (clearCart) {
      clearCart();
    }
    
     const fixedInvoiceData = {
      ...invoiceData,
      // Si es testing, crear URLs de desarrollo
      downloadUrl: invoiceData.testing 
        ? `/api/invoices/download/${invoiceData.pdfFileName}`
        : invoiceData.downloadUrl,
      viewUrl: invoiceData.testing 
        ? `/api/invoices/view/${invoiceData.pdfFileName}`
        : invoiceData.viewUrl
    };
    console.log('🔧 URLs corregidas:', {
      original: { downloadUrl: invoiceData.downloadUrl, viewUrl: invoiceData.viewUrl },
      fixed: { downloadUrl: fixedInvoiceData.downloadUrl, viewUrl: fixedInvoiceData.viewUrl }
    });
    // Guardar datos de la factura y mostrar modal de éxito
    setInvoiceResult(fixedInvoiceData);
    setShowSuccessModal(true);
    
    // Callback opcional
    if (onCheckout) {
      onCheckout(fixedInvoiceData);
    }
  };

  // ✅ Función handleSimpleInvoice actualizada
  const handleSimpleInvoice = async () => {
  try {
    // Llamar al backend para generar factura simple con PDF
    const response = await fetch('/api/arca/generate-simple-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: safeCartItems,
        paymentMethod: 'No especificado',
        simple: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      onClose();
      setTimeout(() => {
        setInvoiceResult(result);
        setShowSuccessModal(true);
        if (clearCart) clearCart();
        if (onCheckout) onCheckout(result);
      }, 100);
    }
  } catch (error) {
    console.error('Error generando factura simple:', error);
    alert('Error al generar la factura simple');
  }
};

  // ✅ Manejar cierre del modal de éxito
  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setInvoiceResult(null);
  };

  // ✅ Manejar descarga de PDF
  const handleDownloadPDF = (fixedInvoiceData) => {
    console.log('📥 Descargando PDF:', fixedInvoiceData.pdfFileName);
    console.log('📥 URL de descarga:', fixedInvoiceData.downloadUrl);
    
    if (fixedInvoiceData.downloadUrl && fixedInvoiceData.downloadUrl !== '#' && !fixedInvoiceData.downloadUrl.includes('#test')) {
      // Crear un enlace temporal para forzar descarga
      const link = document.createElement('a');
      link.href = fixedInvoiceData.downloadUrl;
      link.download = fixedInvoiceData.pdfFileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.warn('⚠️ URL de descarga no válida:', fixedInvoiceData.downloadUrl);
      alert('PDF no disponible para descargar en modo de testing');
    }
  };
  // ✅ Manejar vista de PDF
  const handleViewPDF = (fixedInvoiceData) => {
   
    console.log('👁️ Viendo PDF:', fixedInvoiceData.pdfFileName);
    console.log('👁️ URL de vista:', fixedInvoiceData.viewUrl);
    if (fixedInvoiceData.viewUrl) {
        window.location.href = fixedInvoiceData.viewUrl; // Redirigir a la misma ventana
    } else {
        console.warn('⚠️ URL de vista no válida:', fixedInvoiceData.viewUrl);
        alert('PDF no disponible para visualizar.');
    }
};

  // ✅ Manejar impresión de PDF
 const handlePrintPDF = (invoiceData) => {
    console.log('🖨️ Imprimiendo PDF:', invoiceData.pdfFileName);
    console.log('🖨️ URL de impresión:', invoiceData.viewUrl);
    
    if (invoiceData.viewUrl && invoiceData.viewUrl !== '#' && !invoiceData.viewUrl.includes('#test')) {
      const printWindow = window.open(invoiceData.viewUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 1000);
        };
      } else {
        console.warn('⚠️ No se pudo abrir ventana de impresión');
        alert('No se pudo abrir la ventana de impresión');
      }
    } else {
      console.warn('⚠️ URL de impresión no válida:', invoiceData.viewUrl);
      alert('PDF no disponible para imprimir en modo de testing');
    }
  };

  // Calculate totals
  const calculateTotal = () => {
    return safeCartItems.reduce((total, item) => {
      const price = showWithIVA ? item.priceWithIVA : item.priceWithoutIVA;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateIVAAmount = () => {
    return safeCartItems.reduce((total, item) => {
      const basePrice = item.priceWithoutIVA;
      const ivaAmount = basePrice * 0.21;
      return total + (ivaAmount * item.quantity);
    }, 0);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    console.log('📝 Cambiando cantidad:', { productId, newQuantity });
    if (newQuantity < 1) {
      handleRemoveItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    console.log('🗑️ Removiendo item:', productId);
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (confirmDelete) {
      removeFromCart(productId);
    }
  };

  const handleIncreaseQuantity = (productId, currentQuantity) => {
    handleQuantityChange(productId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (productId, currentQuantity) => {
    handleQuantityChange(productId, currentQuantity - 1);
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !showCheckoutModal && !showSuccessModal) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose, showCheckoutModal, showSuccessModal]);

  if (!isOpen && !showCheckoutModal && !showSuccessModal) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'flex-end'
    },
    panel: {
      background: 'white',
      width: '100%',
      maxWidth: '400px',
      height: '100%',
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      zIndex: 1001
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      borderBottom: '1px solid #e5e5e5',
      backgroundColor: '#f8f9fa'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#666',
      transition: 'color 0.2s'
    },
    priceToggle: {
      padding: '1rem',
      backgroundColor: '#e3f2fd',
      borderBottom: '1px solid #e5e5e5'
    },
    toggleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    toggleButtons: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    toggleButton: {
      padding: '0.25rem 0.75rem',
      border: 'none',
      borderRadius: '1rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    toggleButtonActive: {
      backgroundColor: '#2196f3',
      color: 'white'
    },
    toggleButtonInactive: {
      backgroundColor: '#e0e0e0',
      color: '#666'
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem'
    },
    emptyCart: {
      textAlign: 'center',
      padding: '2rem 0',
      color: '#666'
    },
    emptyIcon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    cartItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    },
    cartItem: {
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      padding: '0.75rem',
      border: '1px solid #e5e5e5'
    },
    itemName: {
      fontWeight: '600',
      color: '#333',
      marginBottom: '0.5rem'
    },
    itemPrices: {
      fontSize: '0.875rem',
      color: '#666',
      marginBottom: '0.75rem'
    },
    priceRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.25rem'
    },
    itemControls: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    quantityControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    quantityButton: {
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      border: 'none',
      backgroundColor: '#e0e0e0',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      transition: 'background-color 0.2s'
    },
    quantity: {
      minWidth: '3rem',
      textAlign: 'center',
      fontWeight: '500'
    },
    itemTotal: {
      fontWeight: 'bold',
      fontSize: '1.125rem',
      margin: '10px'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.25rem',
      color: '#dc3545',
      transition: 'color 0.2s'
    },
    footer: {
      borderTop: '1px solid #e5e5e5',
      backgroundColor: '#f8f9fa',
      padding: '1rem'
    },
    totalsSection: {
      marginBottom: '1rem'
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
      fontSize: '0.875rem'
    },
    finalTotal: {
      fontWeight: 'bold',
      fontSize: '1.125rem',
      color: '#2196f3',
      paddingTop: '0.5rem',
      borderTop: '1px solid #e5e5e5'
    },
    actionButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    actionButton: {
      width: '100%',
      padding: '0.75rem',
      border: 'none',
      borderRadius: '0.5rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#2196f3',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#4caf50',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#9e9e9e',
      color: 'white',
      fontSize: '0.875rem',
      padding: '0.5rem'
    },
    cartInfo: {
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#666',
      marginTop: '0.5rem'
    }
  };

  return (
    <>
      {/* Debug info */}
      {console.log('🔍 Renderizando ImprovedCart - isOpen:', isOpen, 'items:', safeCartItems.length)}
      
      {isOpen && !showCheckoutModal && !showSuccessModal && (
        <>
          {/* Overlay del carrito */}
          <div style={styles.overlay}>
            <div 
              style={{ position: 'fixed', inset: 0 }}
              onClick={onClose}
            />
            
            {/* Panel del carrito */}
            <div style={styles.panel}>
              {/* Header */}
              <div style={styles.header}>
                <h2 style={styles.title}>
                  🛒 Carrito de Compras
                </h2>
                <button
                  onClick={onClose}
                  style={styles.closeButton}
                  onMouseOver={(e) => e.target.style.color = '#333'}
                  onMouseOut={(e) => e.target.style.color = '#666'}
                >
                  ×
                </button>
              </div>

              {/* Toggle Ver precios */}
              <div style={styles.priceToggle}>
                <div style={styles.toggleContainer}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333' }}>Ver precios:</span>
                  <div style={styles.toggleButtons}>
                    <button
                      onClick={() => setShowWithIVA(false)}
                      style={{
                        ...styles.toggleButton,
                        ...((!showWithIVA) ? styles.toggleButtonActive : styles.toggleButtonInactive)
                      }}
                      onMouseOver={(e) => {
                        if (showWithIVA) e.target.style.backgroundColor = '#d0d0d0';
                      }}
                      onMouseOut={(e) => {
                        if (showWithIVA) e.target.style.backgroundColor = '#e0e0e0';
                      }}
                    >
                      Sin IVA
                    </button>
                    <button
                      onClick={() => setShowWithIVA(true)}
                      style={{
                        ...styles.toggleButton,
                        ...(showWithIVA ? styles.toggleButtonActive : styles.toggleButtonInactive)
                      }}
                      onMouseOver={(e) => {
                        if (!showWithIVA) e.target.style.backgroundColor = '#d0d0d0';
                      }}
                      onMouseOut={(e) => {
                        if (!showWithIVA) e.target.style.backgroundColor = '#e0e0e0';
                      }}
                    >
                      Con IVA
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', margin: 0 }}>
                  {showWithIVA 
                    ? 'Mostrando precios finales con IVA incluido' 
                    : 'Mostrando precios base sin IVA'}
                </p>
              </div>

              {/* Contenido del carrito */}
              <div style={styles.content}>
                {safeCartItems.length === 0 ? (
                  <div style={styles.emptyCart}>
                    <div style={styles.emptyIcon}>🛒</div>
                    <p>Tu carrito está vacío</p>
                    <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Agrega productos para comenzar</p>
                  </div>
                ) : (
                  <div style={styles.cartItems}>
                    {safeCartItems.map((item, index) => {
                      const displayPrice = showWithIVA ? item.priceWithIVA : item.priceWithoutIVA;
                      const itemTotal = displayPrice * item.quantity;
                      
                      console.log('🛒 Renderizando item:', item.name, 'Precio:', displayPrice, 'Cantidad:', item.quantity);
                      
                      return (
                        <div key={item._id || index} style={styles.cartItem}>
                          {/* Nombre del producto */}
                          <div style={styles.itemName}>
                            {item.name || 'Producto sin nombre'}
                          </div>
                          
                          {/* Precios */}
                          <div style={styles.itemPrices}>
                            <div style={styles.priceRow}>
                              <span>Precio unitario ({showWithIVA ? 'con IVA' : 'sin IVA'}):</span>
                              <span style={{ fontWeight: '500' }}>${displayPrice.toFixed(2)}</span>
                            </div>
                            {!showWithIVA && (
                              <div style={{ ...styles.priceRow, fontSize: '0.75rem', color: '#999' }}>
                                <span>Con IVA sería:</span>
                                <span>${item.priceWithIVA.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Controles de cantidad */}
                          <div style={styles.itemControls}>
                            <div style={styles.quantityControls}>
                              <button
                                onClick={() => handleDecreaseQuantity(item._id, item.quantity)}
                                style={styles.quantityButton}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#d0d0d0'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                              >
                                -
                              </button>
                              <span style={styles.quantity}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleIncreaseQuantity(item._id, item.quantity)}
                                style={styles.quantityButton}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#d0d0d0'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Total del item */}
                            <div style={styles.itemTotal}>
                              ${itemTotal.toFixed(2)}
                            </div>

                            {/* Botón eliminar */}
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              style={styles.removeButton}
                              onMouseOver={(e) => e.target.style.color = '#c82333'}
                              onMouseOut={(e) => e.target.style.color = '#dc3545'}
                              title="Eliminar producto"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer con totales y botones */}
              {safeCartItems.length > 0 && (
                <div style={styles.footer}>
                  {/* Resumen de totales */}
                  <div style={styles.totalsSection}>
                    {!showWithIVA && (
                      <>
                        <div style={styles.totalRow}>
                          <span>Subtotal (sin IVA):</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div style={styles.totalRow}>
                          <span>IVA (21%):</span>
                          <span>${calculateIVAAmount().toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    
                    <div style={{ ...styles.totalRow, ...styles.finalTotal }}>
                      <span>Total {showWithIVA ? '(con IVA)' : '(+ IVA)'}:</span>
                      <span>
                        ${showWithIVA ? calculateTotal().toFixed(2) : (calculateTotal() + calculateIVAAmount()).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div style={styles.actionButtons}>
                    {/* Botón Facturar con ARCA/AFIP */}
                    <button
                    type="button" // ✅ Importante: tipo button
                    onClick={handleARCACheckout} // ✅ NO debe tener href ni estar en <a>
                    disabled={false} // No deshabilitado
                    style={{ 
                      ...styles.actionButton, 
                      ...styles.primaryButton,
                      cursor: 'pointer' // ✅ Asegurar que sea clickeable
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#1976d2';
                      console.log('🔍 Hover en botón ARCA');
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#2196f3';
                    }}
                  >
                    🏛️ Facturar con ARCA/AFIP
                  </button>

                    {/* Botón Factura Simple */}
                    <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSimpleInvoice();
                    }}
                    style={{ ...styles.actionButton, ...styles.secondaryButton }}
                  >
                    📄 Factura Simple
                  </button>
                    {/* Botón limpiar carrito */}
                    <button
                      onClick={() => {
                        if (window.confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
                          clearCart();
                        }
                      }}
                      style={{ ...styles.actionButton, ...styles.dangerButton }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#757575'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#9e9e9e'}
                    >
                      🗑️ Limpiar Carrito
                    </button>
                  </div>

                  {/* Información adicional */}
                  <div style={styles.cartInfo}>
                    {safeCartItems.length} producto{safeCartItems.length !== 1 ? 's' : ''} en el carrito
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal ARCA */}
      <ARCACheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={safeCartItems}
        onCheckoutComplete={handleCheckoutComplete} 
      />

      {/* ✅ Modal de éxito con opciones de PDF */}
      <InvoiceSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        invoiceData={invoiceResult}
        onDownloadPDF={handleDownloadPDF}
        onViewPDF={handleViewPDF}
        onPrintPDF={handlePrintPDF}
      />
    </>
  );
};

export default ImprovedCart;