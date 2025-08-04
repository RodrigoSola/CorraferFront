import { useState, useEffect } from 'react';
import useARCAIntegration from './useARCAIntegration';
import useFetchClients from '../clients/useFetchClients';
import CompanyConfigModal from '../invoices/CompanyConfigModal';

const ARCACheckoutModal = ({ isOpen, onClose, cartItems, onCheckoutComplete }) => {
  const { 
    generateARCAInvoice, 
    determineInvoiceType, 
    testingMode, 
    setTestingMode, 
    isLoading,
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
  

  useEffect(() => {
    if (isOpen && clients.length === 0) {
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
    return cartItems.reduce((total, item) => {
      return total + (item.priceWithIVA * item.quantity);
    }, 0);
  };

  const getInvoiceTypeDisplay = (client) => {
    if (!client) return 'C (Consumidor Final)';
    const { description } = determineInvoiceType(client);
    return description;
  };

  // ✅ Función principal para generar factura
  const handleGenerateInvoice = async (e) => {

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!selectedClient) {
      alert('Por favor selecciona un cliente');
      return;
    }

    try {
      console.log('🏛️ Generando factura con:', {
        client: selectedClient,
        cartItems,
        paymentMethod,
        testingMode
      });

      const result = await generateARCAInvoice(selectedClient, cartItems, paymentMethod);
      console.log('✅ Factura generada - OBJETO COMPLETO:', JSON.stringify(result, null, 2));
      console.log('✅ Factura generada:', result);
      
      // ✅ Cerrar este modal inmediatamente
      onClose();
      
      // ✅ Llamar al callback con todos los datos necesarios
      setTimeout(() => {
        onCheckoutComplete({
          ...result,
          client: selectedClient,
          items: cartItems,
          paymentMethod,
          // ✅ Asegurar que los datos de PDF estén presentes
          pdfFileName: result.pdfFileName,
          downloadUrl: result.downloadUrl,
          viewUrl: result.viewUrl
        });
      }, 100);

    } catch (error) {
      console.error('❌ Error generando factura:', error);
      alert(`Error al generar la factura: ${error.message}`);
    }
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

  const handleClose = () => {
    setSelectedClient(null);
    setSearchTerm('');
    setShowNewClientForm(false);
    onClose();
  };

  if (!isOpen) return null;

  const modalBaseStyle = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center";
  const zIndexStyle = { zIndex: 9999 };

  return (
    <div className={modalBaseStyle} style={zIndexStyle}>
      <div className="bg-white p-8 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-blue-500 pb-4">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            {testingMode ? '🧪' : '🏛️'} 
            {testingMode ? 'Factura de Prueba ARCA' : 'Factura Oficial ARCA/AFIP'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        {/* Toggle Modo Testing */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-yellow-800 mb-1">🧪 Modo de Facturación:</h4>
              <p className="text-yellow-700 text-sm">
                {testingMode 
                  ? 'Generando facturas de prueba (sin validez fiscal) con PDF descargable'
                  : 'Generando facturas oficiales en AFIP con PDF oficial'
                }
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={testingMode}
                onChange={(e) => setTestingMode(e.target.checked)}
                className="w-4 h-4"
                disabled={isLoading}
              />
              <span className="font-medium text-yellow-800">Modo Testing</span>
            </label>
          </div>
        </div>

        {/* Resumen del Carrito */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            📦 Resumen de la Venta
          </h3>
          <div className="max-h-32 overflow-auto">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between py-1 border-b border-gray-200">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-semibold">${(item.priceWithIVA * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold text-lg mt-3 pt-2 border-t border-gray-300 text-blue-600">
            <span>TOTAL:</span>
            <span>${calculateCartTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Selección de Cliente */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              👤 Seleccionar Cliente
            </h3>
            <button
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
              disabled={isLoading}
            >
              {showNewClientForm ? '❌ Cancelar' : '➕ Cliente Nuevo'}
            </button>
          </div>

          {/* Formulario para cliente nuevo */}
          {showNewClientForm && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
              <h4 className="font-semibold mb-3">Datos del Cliente Nuevo:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Nombre/Razón Social *"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="CUIT (opcional)"
                  value={newClientData.cuit}
                  onChange={(e) => setNewClientData({...newClientData, cuit: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={newClientData.location}
                  onChange={(e) => setNewClientData({...newClientData, location: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <select
                  value={newClientData.typeOfClient}
                  onChange={(e) => setNewClientData({...newClientData, typeOfClient: e.target.value})}
                  className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                >
                  <option value="CF">Consumidor Final</option>
                  <option value="RI">Responsable Inscripto</option>
                  <option value="EX">Exento</option>
                  <option value="MONOTRIBUTO">Monotributo</option>
                </select>
              </div>
              <div className="mt-3">
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleAddNewClient}
                disabled={!newClientData.name.trim() || isLoading}
                className={`mt-3 px-4 py-2 rounded-lg text-white font-medium ${
                  newClientData.name.trim() && !isLoading
                    ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                ✅ Usar este Cliente
              </button>
            </div>
          )}

          {/* Buscador de clientes existentes */}
          {!showNewClientForm && (
            <>
              <input
                type="text"
                placeholder="🔍 Buscar cliente por nombre, alias, CUIT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 text-base"
                disabled={isLoading}
              />

              {/* Lista de clientes */}
              <div className="max-h-48 overflow-auto border rounded-lg">
                {filteredClients.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {searchTerm ? 'No se encontraron clientes' : 'Cargando clientes...'}
                  </div>
                ) : (
                  filteredClients.map(client => (
                    <div
                      key={client._id}
                      onClick={() => !isLoading && setSelectedClient(client)}
                      className={`p-3 border-b transition-colors ${
                        isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      } ${
                        selectedClient?._id === client._id 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-semibold">{client.name}</div>
                      <div className="text-sm text-gray-600">
                        {client.cuit && `CUIT: ${client.cuit} | `}
                        Tipo: {client.typeOfClient || 'CF'} | 
                        Factura: {getInvoiceTypeDisplay(client)}
                      </div>
                      {client.location && (
                        <div className="text-xs text-gray-500">📍 {client.location}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Cliente seleccionado */}
          {selectedClient && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">✅ Cliente Seleccionado:</h4>
              <div className="space-y-1">
                <div><strong>{selectedClient.name}</strong></div>
                {selectedClient.cuit && <div>CUIT: {selectedClient.cuit}</div>}
                <div>Tipo de Factura: <strong>{getInvoiceTypeDisplay(selectedClient)}</strong></div>
                {selectedClient.location && <div>Ubicación: {selectedClient.location}</div>}
                {selectedClient.email && <div>Email: {selectedClient.email}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Forma de Pago */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            💳 Forma de Pago:
          </label>
          <select 
            value={paymentMethod} 
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-base"
            disabled={isLoading}
          >
            <option value="Efectivo">💵 Efectivo</option>
            <option value="Tarjeta de Débito">💳 Tarjeta de Débito</option>
            <option value="Tarjeta de Crédito">💳 Tarjeta de Crédito</option>
            <option value="Transferencia Bancaria">🏦 Transferencia Bancaria</option>
            <option value="Cheque">📄 Cheque</option>
            <option value="Cuenta Corriente">📋 Cuenta Corriente</option>
          </select>
        </div>

        {/* Advertencia importante */}
        <div className={`mb-6 p-4 border rounded-lg ${
          testingMode 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            <span className={`text-xl ${testingMode ? 'text-blue-600' : 'text-yellow-600'}`}>
              {testingMode ? '🧪' : '⚠️'}
            </span>
            <div>
              <h4 className={`font-semibold ${testingMode ? 'text-blue-800' : 'text-yellow-800'}`}>
                {testingMode ? 'Modo Testing:' : 'Importante:'}
              </h4>
              <p className={`text-sm mt-1 ${testingMode ? 'text-blue-700' : 'text-yellow-700'}`}>
                {testingMode 
                  ? 'Esta factura será generada como prueba y NO tendrá validez fiscal. Se creará un PDF para descargar, ver e imprimir.'
                  : 'Esta factura será generada oficialmente en AFIP a través del sistema ARCA. Se creará un PDF oficial para descargar, ver e imprimir.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <span className="text-xl">❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 justify-end border-t pt-6">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleGenerateInvoice}
            disabled={!selectedClient || isLoading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 ${
              selectedClient && !isLoading
                ? (testingMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600') + ' cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {testingMode ? 'Generando Prueba...' : 'Generando Factura...'}
              </>
            ) : (
              <>
                {testingMode ? '🧪 Generar Factura de Prueba + PDF' : '🏛️ Generar Factura ARCA + PDF'}
              </>
            )}
          </button>
        </div>

        {/* Información adicional */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>💡 Información:</strong> 
          {testingMode 
            ? ' En modo testing puedes probar el sistema sin generar facturas reales. Se creará un PDF de prueba que puedes descargar, ver o imprimir.'
            : ' ARCA es el sistema gratuito de AFIP para facturación electrónica. Se generará un PDF oficial que puedes descargar, ver, imprimir o enviar por email.'
          }
        </div>
      </div>
    </div>
  );
};

export default ARCACheckoutModal;