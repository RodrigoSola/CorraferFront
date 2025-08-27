import { useState, useEffect, useCallback } from 'react';
import useARCAIntegration from './useARCAIntegration';
import useFetchClients from '../clients/useFetchClients';
import CompanyConfigModal from '../invoices/CompanyConfigModal';

const ARCACheckoutModal = ({ isOpen, onClose, cartItems, onCheckoutComplete }) => {
  console.log('Valor de isOpen que se pasa al ARCACheckoutModal:', isOpen);
  const { 
    generateARCAInvoice, 
    determineInvoiceType, 
    testingMode, 
    setTestingMode, 
    error 
  } = useARCAIntegration();
  
  const { clients, fetchClients } = useFetchClients();
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    cuit: '',
    location: '',
    typeOfClient: 'CF',
    email: ''
  });
  const [showCompanyConfig, setShowCompanyConfig] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Debug logging mejorado
  useEffect(() => {
    console.log('🔍 ARCACheckoutModal - Estado:', { 
      isOpen, 
      cartItems: cartItems?.length || 0, 
      isLoading,
      selectedClient: selectedClient?.name || 'none'
    });
  }, [isOpen, cartItems, isLoading, selectedClient]);

  useEffect(() => {
    if (isOpen && clients.length === 0) {
      console.log('📡 Cargando clientes...');
      fetchClients();
    }
  }, [isOpen, clients.length, fetchClients]);

  // Filtrar clientes por búsqueda
  const filteredClients = clients.filter(client => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(term) ||
      client.alias?.toLowerCase().includes(term) ||
      client.cuit?.toLowerCase().includes(term) ||
      client.location?.toLowerCase().includes(term)
    );
  });

  const calculateCartTotal = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => {
      return total + (item.priceWithIVA * item.quantity);
    }, 0);
  };

  const getInvoiceTypeDisplay = (client) => {
    if (!client) return 'C (Consumidor Final)';
    const { description } = determineInvoiceType(client);
    return description;
  };

  const handleAddNewClient = () => {
    const tempClient = {
      _id: 'temp_' + Date.now(),
      name: newClientData.name,
      cuit: newClientData.cuit,
      location: newClientData.location,
      typeOfClient: newClientData.typeOfClient,
      email: newClientData.email
    };
    
    setSelectedClient(tempClient);
    setShowNewClientForm(false);
    setNewClientData({
      name: '',
      cuit: '',
      location: '',
      typeOfClient: 'CF',
      email: ''
    });
  };

  // ✅ Función de cierre con validación
  const handleClose = useCallback(() => {
    if (isLoading) {
      console.log('🚫 No se puede cerrar durante la carga');
      return;
    }
    
    console.log('🔄 Cerrando ARCACheckoutModal');
    
    // Resetear estados del modal
    setSelectedClient(null);
    setSearchTerm('');
    setShowNewClientForm(false);
    setShowCompanyConfig(false);
    
    // Llamar función de cierre del padre
    onClose();
  }, [onClose, isLoading]);

  // ✅ Manejo de ESC mejorado
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        console.log('⌨️ ESC presionado - cerrando modal');
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose, isLoading]);

  // ✅ FUNCIÓN CRÍTICA: Generar factura
  const handleGenerateInvoice = async (e) => {
    console.log('🏛️ handleGenerateInvoice iniciado');
    
    // ✅ Prevenir cualquier propagación de eventos
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    
    if (!selectedClient) {
      alert('Por favor selecciona un cliente');
      return;
    }
    
    if (!cartItems || cartItems.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }
    
    console.log('🏛️ Iniciando generación de factura...');
    setIsLoading(true);
    
    try {
      console.log('🏛️ Generando factura con:', {
        client: selectedClient,
        cartItems: cartItems.length,
        paymentMethod,
        testingMode
      });
      
      const result = await generateARCAInvoice(selectedClient, cartItems, paymentMethod);
      
      if (!result) {
        throw new Error('No se recibió resultado de la factura');
      }
      
      console.log('✅ Resultado de factura recibido:', result);
      
      const completeInvoiceData = {
        ...result,
        client: selectedClient,
        items: cartItems,
        paymentMethod,
        pdfFileName: result.pdfFileName,
        downloadUrl: result.downloadUrl,
        viewUrl: result.viewUrl,
        completedAt: new Date().toISOString()
      };
      
      console.log('✅ Factura generada exitosamente:', completeInvoiceData);
      
      // ✅ Llamar onCheckoutComplete que manejará el resto
      if (onCheckoutComplete) {
        onCheckoutComplete(completeInvoiceData);
      }
      
    } catch (error) {
      console.error('❌ Error generando factura:', error);
      alert(`Error al generar la factura: ${error.message}`);
      // En caso de error, mantener el modal abierto para reintentar
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN CRÍTICA: Manejo de clicks en overlay
  const handleOverlayClick = (e) => {
    // Solo cerrar si el click es exactamente en el overlay y no estamos cargando
    if (e.target === e.currentTarget && !isLoading) {
      console.log('🔄 Click en overlay - cerrando modal');
      handleClose();
    } else if (isLoading) {
      console.log('🚫 Click ignorado - está cargando');
    }
  };

  console.log("ARCACheckoutModal - Estado de renderizado:", { 
    isOpen, 
    cartItems: cartItems?.length || 0, 
    isLoading,
    clientsLoaded: clients.length 
  });

  // ✅ No renderizar si no está abierto
  if (!isOpen) {
    console.log('❌ ARCACheckoutModal - No renderizando (isOpen:', isOpen, ')');
    return null;
  }

  console.log('✅ ARCACheckoutModal - Renderizando modal');

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        style={{ zIndex: 10000 }} // ✅ Z-index mayor que el carrito
        onClick={handleOverlayClick} // ✅ Usar función específica
      >
        <div 
          className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()} // ✅ Prevenir propagación en contenido
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              🏛️ Checkout ARCA/AFIP
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCompanyConfig(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                disabled={isLoading}
              >
                ⚙️ Config
              </button>
              <button
                onClick={isLoading ? undefined : handleClose}
                className={`text-gray-500 hover:text-gray-700 text-2xl ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
                title={isLoading ? 'Espere a que termine la operación' : 'Cerrar'}
              >
                ×
              </button>
            </div>
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-lg font-semibold">Generando factura ARCA...</p>
                <p className="text-sm text-gray-600">Por favor espere, esto puede tardar unos segundos</p>
                <div className="mt-2 text-xs text-gray-500">
                  ⚠️ No cierre esta ventana durante el proceso
                </div>
              </div>
            </div>
          )}

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            
            {/* Modo Testing */}
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">Modo de Facturación</h3>
                  <p className="text-sm text-yellow-600">
                    {testingMode ? 'Facturas de prueba (no válidas para AFIP)' : 'Facturas oficiales AFIP'}
                  </p>
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={testingMode}
                    onChange={(e) => setTestingMode(e.target.checked)}
                    className="rounded"
                    disabled={isLoading}
                  />
                  <span className="text-sm">Modo Testing</span>
                </label>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Selección de Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seleccionar Cliente</h3>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                    disabled={isLoading}
                  >
                    + Nuevo
                  </button>
                </div>

                {/* Formulario nuevo cliente */}
                {showNewClientForm && (
                  <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
                    <h4 className="font-semibold">Nuevo Cliente</h4>
                    
                    <input
                      type="text"
                      placeholder="Nombre *"
                      value={newClientData.name}
                      onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    
                    <input
                      type="text"
                      placeholder="CUIT (opcional)"
                      value={newClientData.cuit}
                      onChange={(e) => setNewClientData({...newClientData, cuit: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    
                    <input
                      type="text"
                      placeholder="Ubicación"
                      value={newClientData.location}
                      onChange={(e) => setNewClientData({...newClientData, location: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />

                    <select
                      value={newClientData.typeOfClient}
                      onChange={(e) => setNewClientData({...newClientData, typeOfClient: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <option value="CF">Consumidor Final</option>
                      <option value="RI">Responsable Inscripto</option>
                      <option value="MONOTRIBUTO">Monotributo</option>
                      <option value="EX">Exento</option>
                    </select>

                    <input
                      type="email"
                      placeholder="Email (opcional)"
                      value={newClientData.email}
                      onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddNewClient}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                        disabled={!newClientData.name || isLoading}
                      >
                        Usar Cliente
                      </button>
                      <button
                        onClick={() => setShowNewClientForm(false)}
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 disabled:bg-gray-200"
                        disabled={isLoading}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Lista de clientes */}
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {filteredClients.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {clients.length === 0 ? (
                        <div>
                          <div className="animate-pulse">🔄 Cargando clientes...</div>
                        </div>
                      ) : searchTerm ? (
                        'No se encontraron clientes con ese criterio'
                      ) : (
                        'No se encontraron clientes'
                      )}
                    </div>
                  ) : (
                    filteredClients.map(client => (
                      <div
                        key={client._id}
                        onClick={() => !isLoading && setSelectedClient(client)}
                        className={`p-3 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedClient?._id === client._id ? 'bg-blue-50 border-blue-200' : ''
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-semibold">{client.name}</div>
                        {client.cuit && <div className="text-sm text-gray-600">CUIT: {client.cuit}</div>}
                        {client.location && <div className="text-sm text-gray-600">{client.location}</div>}
                        <div className="text-xs text-blue-600">{client.typeOfClient}</div>
                        {client.email && <div className="text-xs text-gray-500">📧 {client.email}</div>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Resumen del Pedido</h3>
                
                {/* Información del cliente seleccionado */}
                {selectedClient && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Cliente Seleccionado</h4>
                    <p className="font-medium">{selectedClient.name}</p>
                    {selectedClient.cuit && <p className="text-sm">CUIT: {selectedClient.cuit}</p>}
                    {selectedClient.email && <p className="text-sm">📧 {selectedClient.email}</p>}
                    <p className="text-sm">Tipo de factura: <span className="font-medium">{getInvoiceTypeDisplay(selectedClient)}</span></p>
                  </div>
                )}

                {/* Método de pago */}
                <div>
                  <label className="block text-sm font-medium mb-2">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                  </select>
                </div>

                {/* Items del carrito */}
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  <h4 className="font-semibold">Productos ({cartItems?.length || 0})</h4>
                  {cartItems && cartItems.length > 0 ? (
                    cartItems.map((item, index) => (
                      <div key={item._id || index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-600">Cant: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${(item.priceWithIVA * item.quantity).toFixed(2)}</div>
                          <div className="text-xs text-gray-600">${item.priceWithIVA.toFixed(2)} c/u</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No hay productos en el carrito
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-xl text-green-600">
                      ${calculateCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={!selectedClient || isLoading || !cartItems || cartItems.length === 0}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando Factura ARCA...
                      </span>
                    ) : (
                      '🏛️ Generar Factura ARCA'
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Procesando...' : 'Cancelar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuración */}
      {showCompanyConfig && (
        <CompanyConfigModal
          isOpen={showCompanyConfig}
          onClose={() => setShowCompanyConfig(false)}
        />
      )}
    </>
  );
};

export default ARCACheckoutModal;