import { useState } from 'react';

const InvoiceSuccessModal = ({ 
  isOpen, 
  onClose, 
  invoiceData, 
  onDownloadPDF, 
  onViewPDF, 
  onPrintPDF 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isViewing, setIsViewing] = useState(false);

  // ✅ Debug logs temporales
  console.log('🔍 InvoiceSuccessModal - invoiceData:', invoiceData);
  console.log('🔍 invoiceData.total:', invoiceData?.total);
  console.log('🔍 typeof total:', typeof invoiceData?.total);

  if (!isOpen || !invoiceData) return null;

  // ✅ Valores por defecto seguros para prevenir errores
  const safeInvoiceData = {
    numeroFactura: 'N/A',
    tipo: 'N/A',
    cae: 'N/A',
    cliente: 'N/A',
    fechaEmision: new Date().toLocaleDateString(),
    metodoPago: 'N/A',
    total: 0,
    testing: false,
    pdfFileName: null,
    downloadUrl: null,
    viewUrl: null,
    client: null,
    ...invoiceData // Sobrescribir con datos reales si existen
  };

  // ✅ Validación adicional para campos críticos
  const safeTotal = typeof safeInvoiceData.total === 'number' ? safeInvoiceData.total : 0;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (safeInvoiceData.downloadUrl && safeInvoiceData.downloadUrl !== '#') {
        // Crear enlace temporal para descargar
        const link = document.createElement('a');
        link.href = safeInvoiceData.downloadUrl;
        link.download = safeInvoiceData.pdfFileName || `factura_${safeInvoiceData.numeroFactura}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('PDF no disponible para descargar - URL no válida');
      }
      if (onDownloadPDF) onDownloadPDF(safeInvoiceData);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Error al descargar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleView = async () => {
    setIsViewing(true);
    try {
      if (safeInvoiceData.viewUrl && safeInvoiceData.viewUrl !== '#') {
        window.open(safeInvoiceData.viewUrl, '_blank', 'width=800,height=600,scrollbars=yes');
      } else {
        alert('PDF no disponible para visualizar - URL no válida');
      }
      if (onViewPDF) onViewPDF(safeInvoiceData);
    } catch (error) {
      console.error('Error abriendo PDF:', error);
      alert('Error al abrir el PDF');
    } finally {
      setIsViewing(false);
    }
  };

  const handlePrint = async () => {
    try {
      if (safeInvoiceData.viewUrl && safeInvoiceData.viewUrl !== '#') {
        // Abrir PDF en ventana nueva para imprimir
        const printWindow = window.open(safeInvoiceData.viewUrl, '_blank', 'width=800,height=600');
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 1000);
          };
        }
      } else {
        alert('PDF no disponible para imprimir - URL no válida');
      }
      if (onPrintPDF) onPrintPDF(safeInvoiceData);
    } catch (error) {
      console.error('Error imprimiendo PDF:', error);
      alert('Error al imprimir el PDF');
    }
  };

  const handleEmailPDF = () => {
    if (safeInvoiceData.client?.email) {
      const subject = `Factura ${safeInvoiceData.numeroFactura} - ${safeInvoiceData.client.name}`;
      const body = `Estimado/a ${safeInvoiceData.client.name},\n\nAdjunto encontrará la factura ${safeInvoiceData.numeroFactura} por un total de $${safeTotal.toFixed(2)}.\n\nGracias por su compra.\n\nSaludos cordiales.`;
      const mailtoLink = `mailto:${safeInvoiceData.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } else {
      alert('El cliente no tiene email registrado');
    }
  };

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      animation: 'fadeIn 0.3s ease-out'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
      transform: 'scale(1)',
      animation: 'slideIn 0.3s ease-out'
    },
    header: {
      textAlign: 'center',
      marginBottom: '1.5rem'
    },
    icon: {
      fontSize: '4rem',
      marginBottom: '1rem'
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#333'
    },
    subtitle: {
      fontSize: '0.9rem',
      color: '#666',
      marginBottom: '1rem'
    },
    testBanner: {
      backgroundColor: '#e3f2fd',
      border: '2px solid #2196f3',
      borderRadius: '8px',
      padding: '0.75rem',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    testText: {
      color: '#1976d2',
      fontWeight: '600',
      fontSize: '0.9rem'
    },
    infoCard: {
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1.5rem',
      border: '1px solid #e9ecef'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
      fontSize: '0.9rem'
    },
    infoLabel: {
      fontWeight: '500',
      color: '#666'
    },
    infoValue: {
      fontWeight: '600',
      color: '#333'
    },
    totalRow: {
      borderTop: '2px solid #e9ecef',
      paddingTop: '0.5rem',
      fontSize: '1.1rem'
    },
    buttonsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    button: {
      padding: '0.75rem 1rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
      textDecoration: 'none'
    },
    primaryButton: {
      backgroundColor: '#2196f3',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#4caf50',
      color: 'white'
    },
    printButton: {
      backgroundColor: '#ff9800',
      color: 'white'
    },
    emailButton: {
      backgroundColor: '#9c27b0',
      color: 'white'
    },
    closeButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      width: '100%',
      marginTop: '0.5rem'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    spinner: {
      width: '16px',
      height: '16px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    debugInfo: {
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '0.5rem',
      fontSize: '0.75rem',
      fontFamily: 'monospace',
      marginBottom: '1rem',
      color: '#333'
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* ✅ Debug info temporal */}
        <div style={styles.debugInfo}>
          <strong>DEBUG INFO:</strong><br/>
          total: {JSON.stringify(safeInvoiceData.total)} (type: {typeof safeInvoiceData.total})<br/>
          safeTotal: {safeTotal}<br/>
          pdfFileName: {safeInvoiceData.pdfFileName || 'null'}<br/>
          downloadUrl: {safeInvoiceData.downloadUrl || 'null'}
        </div>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.icon}>
            {safeInvoiceData.testing ? '🧪' : '✅'}
          </div>
          <h2 style={{
            ...styles.title,
            color: safeInvoiceData.testing ? '#1976d2' : '#4caf50'
          }}>
            {safeInvoiceData.testing ? '¡Factura de Prueba Generada!' : '¡Factura Generada Exitosamente!'}
          </h2>
          <p style={styles.subtitle}>
            {safeInvoiceData.testing 
              ? 'Tu factura de prueba está lista para ver, descargar o imprimir'
              : 'Tu factura oficial está lista para ver, descargar o imprimir'
            }
          </p>
        </div>

        {/* Banner de testing */}
        {safeInvoiceData.testing && (
          <div style={styles.testBanner}>
            <div style={styles.testText}>
              🧪 MODO TESTING - Esta factura no tiene validez fiscal
            </div>
          </div>
        )}

        {/* Información de la factura */}
        <div style={styles.infoCard}>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Número de Factura:</span>
            <span style={styles.infoValue}>{safeInvoiceData.numeroFactura}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Tipo:</span>
            <span style={styles.infoValue}>Factura {safeInvoiceData.tipo}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>CAE:</span>
            <span style={styles.infoValue}>{safeInvoiceData.cae}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Cliente:</span>
            <span style={styles.infoValue}>{safeInvoiceData.cliente}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Fecha:</span>
            <span style={styles.infoValue}>{safeInvoiceData.fechaEmision}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Método de Pago:</span>
            <span style={styles.infoValue}>{safeInvoiceData.metodoPago}</span>
          </div>
          <div style={{...styles.infoRow, ...styles.totalRow}}>
            <span style={styles.infoLabel}>TOTAL:</span>
            <span style={{...styles.infoValue, color: '#2196f3'}}>
              ${safeTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Botones de acción para PDF */}
        {safeInvoiceData.pdfFileName && (
          <div style={styles.buttonsGrid}>
            {/* Ver PDF */}
            <button
              onClick={handleView}
              disabled={isViewing}
              style={{
                ...styles.button,
                ...styles.primaryButton,
                ...(isViewing ? styles.disabledButton : {})
              }}
              onMouseOver={(e) => {
                if (!isViewing) e.target.style.backgroundColor = '#1976d2';
              }}
              onMouseOut={(e) => {
                if (!isViewing) e.target.style.backgroundColor = '#2196f3';
              }}
            >
              {isViewing ? (
                <div style={styles.spinner}></div>
              ) : (
                '👁️'
              )}
              Ver PDF
            </button>

            {/* Descargar PDF */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                ...(isDownloading ? styles.disabledButton : {})
              }}
              onMouseOver={(e) => {
                if (!isDownloading) e.target.style.backgroundColor = '#388e3c';
              }}
              onMouseOut={(e) => {
                if (!isDownloading) e.target.style.backgroundColor = '#4caf50';
              }}
            >
              {isDownloading ? (
                <div style={styles.spinner}></div>
              ) : (
                '💾'
              )}
              Descargar
            </button>

            {/* Imprimir PDF */}
            <button
              onClick={handlePrint}
              style={{
                ...styles.button,
                ...styles.printButton
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f57c00'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ff9800'}
            >
              🖨️ Imprimir
            </button>

            {/* Enviar por Email */}
            <button
              onClick={handleEmailPDF}
              disabled={!safeInvoiceData.client?.email}
              style={{
                ...styles.button,
                ...styles.emailButton,
                ...(!safeInvoiceData.client?.email ? styles.disabledButton : {})
              }}
              onMouseOver={(e) => {
                if (safeInvoiceData.client?.email) e.target.style.backgroundColor = '#7b1fa2';
              }}
              onMouseOut={(e) => {
                if (safeInvoiceData.client?.email) e.target.style.backgroundColor = '#9c27b0';
              }}
              title={!safeInvoiceData.client?.email ? 'Cliente sin email' : 'Enviar por email'}
            >
              📧 Email
            </button>
          </div>
        )}

        {/* Advertencia si no hay PDF */}
        {!safeInvoiceData.pdfFileName && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <span style={{ color: '#856404' }}>
              ⚠️ PDF no disponible - Los datos de la factura fueron generados pero sin archivo PDF
            </span>
          </div>
        )}

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            ...styles.button,
            ...styles.closeButton
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
        >
          Cerrar
        </button>

        {/* Información adicional */}
        <div style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#666',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid #e9ecef'
        }}>
          {safeInvoiceData.testing 
            ? '💡 Esta factura de prueba es solo para testing del sistema'
            : '💡 Esta factura ha sido registrada oficialmente en AFIP'
          }
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InvoiceSuccessModal;