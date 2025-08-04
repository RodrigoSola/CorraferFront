function IVAModal({ isOpen, onClose, onConfirm, product, quantity }) {
  if (!isOpen || !product) return null;

  const basePrice = product.adjustedPrice || product.price || 0;
  const priceWithoutIVA = basePrice;
  const priceWithIVA = basePrice * 1.21; // 21% IVA

  const handleConfirm = () => {
    console.log('✅ Usuario confirmó producto:', { priceWithIVA, priceWithoutIVA });
    // Pasamos ambos precios al carrito
    onConfirm(priceWithIVA, priceWithoutIVA);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '20px' }}>💰 Confirmar Producto</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <p><strong>📦 {product.name || 'Producto'}</strong></p>
          <p>🔢 Cantidad: {quantity}</p>
          <p>💵 Precio base: ${basePrice.toFixed(2)}</p>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{
              padding: '15px',
              border: '2px solid #007bff',
              borderRadius: '6px',
              backgroundColor: '#f8f9ff'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>🏷️ Precio con IVA: ${priceWithIVA.toFixed(2)} c/u</strong>
                <br />
                <small>Total: ${(priceWithIVA * quantity).toFixed(2)}</small>
              </div>
              <div>
                <strong>🏪 Precio sin IVA: ${priceWithoutIVA.toFixed(2)} c/u</strong>
                <br />
                <small>Total: ${(priceWithoutIVA * quantity).toFixed(2)}</small>
              </div>
            </div>
            
            <button
              onClick={handleConfirm}
              style={{
                padding: '15px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✅ Agregar al Carrito
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ❌ Cancelar
        </button>
      </div>
    </div>
  );
}

export default IVAModal;
