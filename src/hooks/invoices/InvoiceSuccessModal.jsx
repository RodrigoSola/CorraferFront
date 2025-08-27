import React, { useState, useEffect } from 'react';
import { FaCheck, FaReceipt, FaTimes, FaCheckCircle, FaStar, FaCopy, FaCalendarAlt, FaUser, FaCreditCard, FaHashtag } from 'react-icons/fa';

const InvoiceSuccessModal = ({ isOpen, onClose, invoiceData }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setShowConfetti(true);
      
      // Animación de entrada
      setTimeout(() => setIsAnimating(false), 500);
      
      // Confetti por 3 segundos
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isOpen]);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 300);
  };

  if (!isOpen || !invoiceData) return null;

  return (
    <div 
      className="fixed inset-0 z-[60] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.2) 50%, rgba(4, 120, 87, 0.3) 100%)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}
    >
      {/* Confetti animado */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce opacity-80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 20 + 15}px`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '✨', '🌟', '💫', '🎈', '🎆', '🥳'][Math.floor(Math.random() * 8)]}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className={`w-full max-w-2xl transition-all duration-500 transform ${
            isAnimating ? 'scale-95 opacity-0 rotate-2' : 'scale-100 opacity-100 rotate-0'
          }`}
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)',
            borderRadius: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            border: '3px solid transparent',
            backgroundClip: 'padding-box',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Borde animado con gradiente */}
          <div 
            className="absolute inset-0 rounded-[32px] p-[3px] animate-pulse"
            style={{
              background: 'linear-gradient(45deg, #10b981, #059669, #047857, #065f46)',
              backgroundSize: '300% 300%',
              animation: 'gradientShift 3s ease infinite'
            }}
          >
            <div 
              className="w-full h-full rounded-[29px]"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #ecfdf5 100%)'
              }}
            />
          </div>

          <div className="relative p-8">
            {/* Header de éxito ultra mejorado */}
            <div className="text-center mb-8">
              <div className="relative mb-6">
                {/* Círculo de éxito con animación */}
                <div 
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-2xl animate-bounce"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <FaCheckCircle className="text-white text-4xl" />
                </div>
                
                {/* Anillos de ondas */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-4 border-green-300 opacity-30 animate-ping" />
                  <div className="absolute w-40 h-40 rounded-full border-4 border-green-200 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>

              <h1 
                className="text-4xl font-bold mb-3"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                🎉 ¡Factura Generada Exitosamente!
              </h1>
              
              <p className="text-xl text-gray-600 mb-2">
                Tu factura ha sido procesada correctamente
              </p>
              
              {invoiceData.testing && (
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold border border-blue-300">
                  🧪 <span>Modo de Prueba</span>
                </div>
              )}
            </div>

            {/* Información de la factura mejorada */}
            <div 
              className="rounded-2xl p-6 mb-6 border-2"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                borderColor: '#d1d5db',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaReceipt className="text-green-600" />
                📄 Detalles de la Factura
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Número de factura */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-semibold text-sm mb-1">📋 Número de Factura</p>
                      <p className="text-2xl font-bold text-blue-800">
                        {invoiceData.numeroFactura || invoiceData.invoiceNumber || 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(invoiceData.numeroFactura || invoiceData.invoiceNumber || '', 'numero')}
                      className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-200 rounded-lg"
                    >
                      {copiedField === 'numero' ? <FaCheck /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                {/* CAE */}
                {invoiceData.cae && (
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-600 font-semibold text-sm mb-1">🔐 CAE</p>
                        <p className="text-lg font-bold text-purple-800 font-mono">
                          {invoiceData.cae}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(invoiceData.cae, 'cae')}
                        className="text-purple-600 hover:text-purple-800 transition-colors p-2 hover:bg-purple-200 rounded-lg"
                      >
                        {copiedField === 'cae' ? <FaCheck /> : <FaCopy />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Tipo de comprobante */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <p className="text-green-600 font-semibold text-sm mb-1">📝 Tipo de Comprobante</p>
                  <p className="text-xl font-bold text-green-800">
                    Factura {invoiceData.tipoComprobante || invoiceData.tipo || invoiceData.type || 'C'}
                  </p>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <p className="text-yellow-600 font-semibold text-sm mb-1">💰 Total</p>
                  <p className="text-2xl font-bold text-yellow-800">
                    ${parseFloat(invoiceData.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Fecha de emisión */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                  <p className="text-indigo-600 font-semibold text-sm mb-1">📅 Fecha de Emisión</p>
                  <p className="text-lg font-bold text-indigo-800">
                    {formatDate(invoiceData.fechaEmision)}
                  </p>
                </div>

                {/* Cliente */}
                <div className="bg-gradient-to-r from-teal-50 to-teal-100 p-4 rounded-xl border border-teal-200">
                  <p className="text-teal-600 font-semibold text-sm mb-1">👤 Cliente</p>
                  <p className="text-lg font-bold text-teal-800 truncate">
                    {invoiceData.cliente?.name || invoiceData.clientData?.name || 'Consumidor Final'}
                  </p>
                </div>

                {/* Vencimiento CAE */}
                {invoiceData.vencimientoCae && (
                  <div className="md:col-span-2 bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
                    <p className="text-red-600 font-semibold text-sm mb-1">⏰ Vencimiento CAE</p>
                    <p className="text-lg font-bold text-red-800">
                      {formatDate(invoiceData.vencimientoCae)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resumen de productos si existe */}
            {invoiceData.items && invoiceData.items.length > 0 && (
              <div 
                className="rounded-2xl p-6 mb-6 border-2"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  borderColor: '#cbd5e1'
                }}
              >
                <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  📦 Productos Facturados ({invoiceData.items.length})
                </h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {invoiceData.items.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                      <span className="font-medium text-gray-800 truncate">{item.name || item.description}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Qty: {item.quantity} • </span>
                        <span className="font-bold text-green-600">${parseFloat(item.priceWithIVA || item.price || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  {invoiceData.items.length > 5 && (
                    <div className="text-center text-gray-500 text-sm py-2">
                      ... y {invoiceData.items.length - 5} productos más
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje de éxito personalizado */}
            <div 
              className="rounded-2xl p-6 mb-6 text-center border-2"
              style={{
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                borderColor: '#10b981'
              }}
            >
              <div className="text-6xl mb-4">🎊</div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">
                ¡Proceso Completado con Éxito!
              </h3>
              <p className="text-green-700 text-lg leading-relaxed">
                La factura ha sido generada y guardada correctamente en el sistema. 
                {invoiceData.testing ? ' Recuerda que esta es una factura de prueba.' : ' Ya está disponible para su gestión.'}
              </p>
            </div>

            {/* Estadísticas de la transacción */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center bg-blue-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {invoiceData.items?.length || 0}
                </div>
                <div className="text-blue-700 text-sm font-medium">Productos</div>
              </div>
              <div className="text-center bg-purple-50 p-4 rounded-xl border border-purple-200">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  ${parseFloat(invoiceData.total || 0).toFixed(0)}
                </div>
                <div className="text-purple-700 text-sm font-medium">Monto Total</div>
              </div>
              <div className="text-center bg-green-50 p-4 rounded-xl border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  ✅
                </div>
                <div className="text-green-700 text-sm font-medium">Procesado</div>
              </div>
            </div>

            {/* Botón de cerrar mejorado */}
            <div className="flex justify-center">
              <button
                onClick={handleClose}
                className="group px-12 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3"
                style={{
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                <FaCheck className="group-hover:animate-bounce" />
                ✨ Continuar
                <div className="absolute -inset-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl opacity-20 group-hover:opacity-40 transition-opacity blur-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default InvoiceSuccessModal;