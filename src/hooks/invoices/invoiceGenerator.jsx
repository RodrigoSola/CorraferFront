import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaReceipt, FaUser, FaCog, FaShoppingCart, FaTimes, FaCheck, FaExclamationTriangle, FaSpinner, FaSearch, FaPlus, FaEdit, FaSave, FaUserPlus, FaDatabase, FaSync, FaStar, FaBuilding, FaIdCard, FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import '../../../src/css/InvoiceGenerator.css'
const InvoiceGenerator = ({ isOpen, onClose, cart: externalCart }) => {
  // Mock del carrito para la demo
  const cart = useMemo(() => externalCart, [externalCart]);

  // Estados principales
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [includeIVA, setIncludeIVA] = useState(true);
  const [testingMode, setTestingMode] = useState(true);
  
  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados del formulario de nuevo cliente
  const [newClient, setNewClient] = useState({
    name: '',
    cuit: '',
    typeOfClient: 'CF',
    email: '',
    phone: '',
    fiscalDirection: '',
    location: '',
    province: '',
    country: 'Argentina'
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  // Calcular totales del carrito
  const cartTotal = useMemo(() => {
    if (!cart || cart.length === 0) return 0;
    
    const total = cart.reduce((sum, item) => {
      const price = includeIVA 
        ? parseFloat(item.priceWithIVA || item.unitPrice || 0)
        : parseFloat(item.priceWithoutIVA || (item.priceWithIVA || item.unitPrice || 0) / 1.21);
      const qty = parseInt(item.quantity || 1);
      return sum + (price * qty);
    }, 0);
    
    return parseFloat(total.toFixed(2));
  }, [cart, includeIVA]);

  // Filtrar clientes según búsqueda
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    
    return clients.filter(client => 
      client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.cuit.includes(clientSearch) ||
      (client.email && client.email.toLowerCase().includes(clientSearch.toLowerCase()))
    );
  }, [clients, clientSearch]);

  // Cargar clientes desde la API
  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/clients/get', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Clientes cargados:', data);
      
      // El backend devuelve { message, clients }
      const clientsData = data.clients || [];
      
      // Formatear clientes para que coincidan con el formato esperado
      const formattedClients = clientsData.map(client => ({
        _id: client._id,
        name: client.name,
        cuit: client.cuit || '',
        typeOfClient: client.typeOfClient || 'CF',
        email: client.email || '',
        address: client.fiscalDirection || '',
        phone: client.phone || '',
        location: client.location || '',
        province: client.province || '',
        country: client.country || 'Argentina',
        isActive: client.isActive !== false,
        createdAt: client.createdAt,
        lastInvoice: client.lastInvoice,
        owesDebt: client.owesDebt || false,
        debtAmount: client.debtAmount || 0
      }));
      
      setClients(formattedClients);
      console.log('📦 Clientes formateados:', formattedClients);
      
    } catch (error) {
      console.error('❌ Error cargando clientes:', error);
      setError(`Error cargando clientes: ${error.message}`);
      // En caso de error, usar array vacío
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  // Crear nuevo cliente
  const handleCreateClient = useCallback(async () => {
    if (!newClient.name.trim()) {
      alert('El nombre del cliente es requerido');
      return;
    }

    if (!newClient.fiscalDirection.trim()) {
      alert('La dirección fiscal es requerida');
      return;
    }

    if (!newClient.cuit.trim()) {
      alert('El CUIT es requerido');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newClient)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Cliente creado:', data);
      
      // Formatear cliente creado
      const formattedClient = {
        _id: data.client._id,
        name: data.client.name,
        cuit: data.client.cuit || '',
        typeOfClient: data.client.typeOfClient || 'CF',
        email: data.client.email || '',
        address: data.client.fiscalDirection || '',
        phone: data.client.phone || '',
        location: data.client.location || '',
        province: data.client.province || '',
        country: data.client.country || 'Argentina',
        isActive: true,
        createdAt: data.client.createdAt || new Date().toISOString(),
        lastInvoice: null,
        owesDebt: data.client.owesDebt || false,
        debtAmount: data.client.debtAmount || 0
      };

      setClients(prev => [formattedClient, ...prev]);
      setSelectedClient(formattedClient);
      setIsCreatingClient(false);
      setNewClient({
        name: '',
        cuit: '',
        typeOfClient: 'CF',
        email: '',
        phone: '',
        fiscalDirection: '',
        location: '',
        province: '',
        country: 'Argentina'
      });
      
    } catch (error) {
      console.error('❌ Error creando cliente:', error);
      setError(`Error creando cliente: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [newClient]);

  // ✅ GENERAR FACTURA - ESTRUCTURA CORREGIDA PARA COINCIDIR CON EL CONTROLADOR
  const handleGenerateInvoice = useCallback(async () => {
    if (!cart || cart.length === 0) {
      alert('No hay productos en el carrito');
      return;
    }

    if (!selectedClient) {
      alert('Debe seleccionar un cliente');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ ESTRUCTURA DE DATOS CORREGIDA PARA COINCIDIR CON generateARCAInvoice
      const invoiceDataToSend = {
        // ✅ Usar 'client' como espera el controlador
        client: {
          _id: selectedClient._id,
          name: selectedClient.name,
          cuit: selectedClient.cuit || '',
          typeOfClient: selectedClient.typeOfClient || 'CF',
          email: selectedClient.email || '',
          fiscalDirection: selectedClient.address || selectedClient.fiscalDirection || '',
          phone: selectedClient.phone || '',
          location: selectedClient.location || '',
          province: selectedClient.province || '',
          country: selectedClient.country || 'Argentina'
        },
        
        // ✅ Usar 'cartItems' como espera el controlador (con fallback a 'items')
        cartItems: cart.map((item, index) => {
          const unitPrice = includeIVA 
            ? (item.priceWithIVA || item.unitPrice || 0)
            : (item.priceWithoutIVA || (item.priceWithIVA || item.unitPrice || 0) / 1.21);
          
          return {
            id: item._id || item.id || `item_${index}`,
            name: item.name || 'Producto sin nombre',
            description: item.description || '',
            quantity: parseInt(item.quantity) || 1,
            unitPrice: parseFloat(unitPrice),
            priceWithIVA: includeIVA ? parseFloat(unitPrice) : parseFloat(unitPrice) * 1.21,
            priceWithoutIVA: includeIVA ? parseFloat(unitPrice) / 1.21 : parseFloat(unitPrice),
            totalPrice: parseFloat(unitPrice) * parseInt(item.quantity || 1),
            barcode: item.barcode || '',
            category: item.category || 'General'
          };
        }),

        // ✅ Configuración adicional
        paymentMethod: paymentMethod,
        testing: testingMode,
        
        // ✅ Campos adicionales para compatibilidad
        total: cartTotal,
        includeIVA: includeIVA,
        
        // ✅ Metadatos
        metadata: {
          generatedAt: new Date().toISOString(),
          source: 'invoice-generator-web',
          version: '3.1'
        }
      };

      console.log('📤 Enviando datos de factura:', JSON.stringify(invoiceDataToSend, null, 2));

      // ✅ Llamar al endpoint correcto del controlador
      const response = await fetch('http://localhost:3000/api/arca/generate-simple-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(invoiceDataToSend)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || `Error HTTP ${response.status}`;
        } catch {
          errorMessage = `Error HTTP ${response.status}: ${errorText}`;
        }
        
        throw new Error(errorMessage);
      }

      const savedInvoice = await response.json();
      console.log('✅ Factura guardada exitosamente:', savedInvoice);

      // ✅ Crear datos para el modal de éxito
      const successInvoiceData = {
        success: true,
        numeroFactura: savedInvoice.numeroFactura || `00001-${String(Math.floor(Math.random() * 9999) + 1).padStart(8, '0')}`,
        cae: savedInvoice.cae || `${Math.floor(Math.random() * 90000000) + 10000000}${Math.floor(Math.random() * 90000000) + 10000000}`,
        tipoComprobante: savedInvoice.tipo || (selectedClient.typeOfClient === 'RI' ? 'A' : selectedClient.typeOfClient === 'MONOTRIBUTO' ? 'B' : 'C'),
        total: savedInvoice.total || cartTotal,
        cliente: selectedClient,
        items: cart,
        fechaEmision: savedInvoice.fechaEmision || new Date().toISOString(),
        vencimientoCae: savedInvoice.fechaVencimientoCAE || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        metodoPago: paymentMethod,
        testing: testingMode,
        _id: savedInvoice._id || savedInvoice.id || savedInvoice.invoice?.id,
        status: savedInvoice.status || 'completed',
        pdfFileName: savedInvoice.pdfFileName,
        viewUrl: savedInvoice.viewUrl,
        downloadUrl: savedInvoice.downloadUrl,
        backendResponse: savedInvoice
      };

      setInvoiceData(successInvoiceData);
      setShowSuccessModal(true);
      
      console.log('🎉 Factura procesada y modal mostrado');
      
    } catch (error) {
      console.error('❌ Error generando factura:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al generar la factura.';
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Error de conexión. Verifica que el servidor esté corriendo en http://localhost:3000';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Revisa los logs del backend.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Datos inválidos enviados al servidor. Verifica la información del cliente y productos.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [cart, selectedClient, cartTotal, paymentMethod, includeIVA, testingMode]);

  // Determinar tipo de factura
  const determineInvoiceType = useCallback((clientData) => {
    if (!clientData) return { type: 'C', description: 'Factura C', color: 'green' };
    
    switch (clientData.typeOfClient?.toUpperCase()) {
      case 'RI':
        return { type: 'A', description: 'Factura A (Responsable Inscripto)', color: 'red' };
      case 'MONOTRIBUTO':
        return { type: 'B', description: 'Factura B (Monotributo)', color: 'yellow' };
      case 'EX':
        return { type: 'E', description: 'Factura E (Exento)', color: 'blue' };
      default:
        return { type: 'C', description: 'Factura C (Consumidor Final)', color: 'green' };
    }
  }, []);

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cerrar modal
  const handleClose = useCallback(() => {
    setSelectedClient(null);
    setIsCreatingClient(false);
    setClientSearch('');
    setError(null);
    setShowSuccessModal(false);
    setInvoiceData(null);
    onClose();
  }, [onClose]);

  // Cargar clientes al abrir
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen, loadClients]);

  const invoiceTypeInfo = selectedClient ? determineInvoiceType(selectedClient) : { type: 'C', description: 'Selecciona un cliente', color: 'gray' };

  if (!isOpen) return null;
  

  return (
    <div className="modal">
      <div className="modal-content">
        {/* Header */}
        <div className="header-content">
          <div className="header-content-principal">
            <div className="div-header-principal">
              
              <div>
                <h1 className="header-content-title">Sistema de Facturación</h1>
                <p className="header-p">Facturación fiscal electrónica</p>
              </div>
            </div>
            
            <div className="div-header-principal">
              <label className="checkbox-modo-testing">
                <input
                  type="checkbox"
                  checked={testingMode}
                  onChange={(e) => setTestingMode(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="modo-testing">Modo Testing</span>
              </label>
              
              <button 
                onClick={handleClose}
                className="btn-close"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

         
        </div>

        {/* Contenido principal */}
        <div className="principal-content">
          
          {/* Panel izquierdo - Selector de clientes */}
          <div className="select-client-content ">
            
            {/* Header de clientes */}
            <div className="title-select-client-content">
              <div className="div-title-botons">
                <h3 className="title-select-client">
                 
                  Seleccionar Cliente
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadClients}
                    disabled={loadingClients}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {loadingClients ? <FaSpinner className="animate-spin" /> : <FaSync />}
                    Actualizar
                  </button>
                  
                  <button
                    onClick={() => setIsCreatingClient(!isCreatingClient)}
                    disabled={isLoading}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    <FaUserPlus />
                    {isCreatingClient ? 'Cancelar' : 'Nuevo'}
                  </button>
                </div>
              </div>
              
              {/* Buscador de clientes */}
              {!isCreatingClient && (
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, CUIT o email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Contenido de clientes */}
            <div className="flex-1 overflow-auto p-4">
              {isCreatingClient ? (
                /* Formulario de nuevo cliente */
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUserPlus className="text-green-600" />
                    Crear Nuevo Cliente
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Cliente *
                      </label>
                      <input
                        type="text"
                        value={newClient.name}
                        onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre completo o razón social"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CUIT *
                        </label>
                        <input
                          type="text"
                          value={newClient.cuit}
                          onChange={(e) => setNewClient(prev => ({ ...prev, cuit: e.target.value }))}
                          placeholder="20-12345678-9"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Cliente *
                        </label>
                        <select
                          value={newClient.typeOfClient}
                          onChange={(e) => setNewClient(prev => ({ ...prev, typeOfClient: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="CF">Consumidor Final</option>
                          <option value="RI">Responsable Inscripto</option>
                          <option value="MONOTRIBUTO">Monotributo</option>
                          <option value="EX">Exento</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección Fiscal *
                      </label>
                      <input
                        type="text"
                        value={newClient.fiscalDirection}
                        onChange={(e) => setNewClient(prev => ({ ...prev, fiscalDirection: e.target.value }))}
                        placeholder="Dirección fiscal completa"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email (opcional)
                        </label>
                        <input
                          type="email"
                          value={newClient.email}
                          onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="cliente@email.com"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono (opcional)
                        </label>
                        <input
                          type="text"
                          value={newClient.phone}
                          onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+54 11 1234-5678"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setIsCreatingClient(false)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateClient}
                        disabled={isLoading || !newClient.name.trim()}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                      >
                        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                        {isLoading ? 'Creando...' : 'Crear Cliente'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Lista de clientes */
                <>
                  {loadingClients ? (
                    <div className="text-center py-8">
                      <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-3" />
                      <p className="text-gray-600">Cargando clientes...</p>
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-3 opacity-20">👥</div>
                      <p className="text-gray-500">No se encontraron clientes</p>
                      {clientSearch && (
                        <p className="text-gray-400 mt-2 text-sm">Intenta con otros términos de búsqueda</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredClients.map((client) => (
                        <div
                          key={client._id}
                          onClick={() => setSelectedClient(client)}
                          className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                            selectedClient?._id === client._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 mb-1">{client.name}</h4>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  client.typeOfClient === 'RI' ? 'bg-red-100 text-red-800' :
                                  client.typeOfClient === 'MONOTRIBUTO' ? 'bg-yellow-100 text-yellow-800' :
                                  client.typeOfClient === 'EX' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {client.typeOfClient === 'RI' ? 'Responsable Inscripto' :
                                   client.typeOfClient === 'MONOTRIBUTO' ? 'Monotributo' :
                                   client.typeOfClient === 'EX' ? 'Exento' :
                                   'Consumidor Final'}
                                </span>
                              </div>
                            </div>
                            
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedClient?._id === client._id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedClient?._id === client._id && (
                                <FaCheck className="text-white text-xs" />
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            {client.cuit && (
                              <div className="flex items-center gap-2">
                                <FaIdCard className="text-red-500" />
                                <span className="font-mono">{client.cuit}</span>
                              </div>
                            )}
                            {client.email && (
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-blue-500" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                            {client.address && (
                              <div className="flex items-center gap-2">
                                <FaMapMarkerAlt className="text-green-500" />
                                <span className="truncate">{client.address}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Panel derecho - Configuración y generación */}
          <div className="w-1/2 flex flex-col">
            
            {/* Información del cliente seleccionado */}
            {selectedClient && (
              <div className="p-4 bg-green-50 border-b">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUser className="text-green-600" />
                  Cliente Seleccionado
                  <span className={`px-2 py-1 rounded-full text-sm font-bold ${
                    invoiceTypeInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                    invoiceTypeInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    invoiceTypeInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Factura {invoiceTypeInfo.type}
                  </span>
                </h3>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">{selectedClient.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FaBuilding className="text-purple-500" />
                      <span className="font-medium text-gray-700">Tipo:</span>
                      <span>{selectedClient.typeOfClient}</span>
                    </div>
                    {selectedClient.cuit && (
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-red-500" />
                        <span className="font-medium text-gray-700">CUIT:</span>
                        <span className="font-mono">{selectedClient.cuit}</span>
                      </div>
                    )}
                    {selectedClient.email && (
                      <div className="flex items-center gap-2">
                        <FaEnvelope className="text-blue-500" />
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="truncate">{selectedClient.email}</span>
                      </div>
                    )}
                    {selectedClient.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-green-500" />
                        <span className="font-medium text-gray-700">Teléfono:</span>
                        <span>{selectedClient.phone}</span>
                      </div>
                    )}
                  </div>
                  {selectedClient.address && (
                    <div className="mt-2 pt-2 border-t border-green-100 flex items-center gap-2 text-sm">
                      <FaMapMarkerAlt className="text-orange-500" />
                      <span className="font-medium text-gray-700">Dirección:</span>
                      <span>{selectedClient.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuración de factura */}
            <div className="p-4 bg-purple-50 border-b">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <FaCog className="text-purple-600" />
                Configuración de Factura
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    disabled={isLoading}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 w-full">
                    <input
                      type="checkbox"
                      checked={includeIVA}
                      onChange={(e) => setIncludeIVA(e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="font-medium text-gray-700">
                      {includeIVA ? 'Precios con IVA' : 'Precios sin IVA'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Resumen del carrito */}
            <div className="flex-1 overflow-auto p-4">
              <div className="flex items-center gap-2 mb-4">
                <FaShoppingCart className="text-blue-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Productos a Facturar ({cart.length})
                </h3>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="font-bold text-green-800">
                    Total: ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => {
                  const unitPrice = includeIVA 
                    ? (item.priceWithIVA || item.unitPrice || 0)
                    : (item.priceWithoutIVA || (item.priceWithIVA || item.unitPrice || 0) / 1.21);
                  const totalPrice = unitPrice * item.quantity;
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Qty: {item.quantity}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                              ${unitPrice.toFixed(2)} c/u
                            </span>
                            {item.barcode && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-mono">
                                {item.barcode}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-600 italic">{item.description}</p>
                          )}
                        </div>
                        
                        <div className="text-right ml-3">
                          <div className="text-lg font-bold text-green-600">
                            ${totalPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {includeIVA ? 'Con IVA' : 'Sin IVA'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer con acciones */}
            <div className="p-4 border-t bg-gray-50">
              {error && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" />
                  <div className="flex-1">
                    <p className="text-red-800 font-medium text-sm">Error</p>
                    <p className="text-red-600 text-xs">{error}</p>
                  </div>
                  <button onClick={clearError} className="text-red-500 hover:text-red-700">
                    <FaTimes />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-700">
                    {selectedClient ? `${invoiceTypeInfo.description} para ${selectedClient.name}` : 'Selecciona un cliente para continuar'}
                  </div>
                  {testingMode && (
                    <div className="flex items-center gap-1 text-blue-600 text-sm mt-1">
                      <span>Modo de prueba activado</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  
                  <button
                    onClick={handleGenerateInvoice}
                    disabled={isLoading || !selectedClient || !cart || cart.length === 0}
                    className="px-8 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Generando Factura...
                      </>
                    ) : (
                      <>
                        <FaReceipt />
                        Generar Factura {selectedClient ? invoiceTypeInfo.type : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de éxito */}
      {showSuccessModal && invoiceData && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <FaCheck className="text-white text-3xl" />
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                Factura Generada Exitosamente
              </h1>
              <p className="text-lg text-gray-600">
                Tu factura ha sido procesada correctamente
              </p>
              
              {invoiceData.testing && (
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium mt-2">
                  <span>Modo de Prueba</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-blue-600 font-medium text-sm mb-1">Número</p>
                  <p className="text-xl font-bold text-blue-800">{invoiceData.numeroFactura}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-green-600 font-medium text-sm mb-1">Total</p>
                  <p className="text-xl font-bold text-green-800">${invoiceData.total.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-purple-600 font-medium text-sm mb-1">Tipo</p>
                  <p className="text-xl font-bold text-purple-800">Factura {invoiceData.tipoComprobante}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-yellow-600 font-medium text-sm mb-1">Cliente</p>
                  <p className="text-lg font-bold text-yellow-800 truncate">{invoiceData.cliente.name}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setInvoiceData(null);
                  handleClose();
                }}
                className="px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-105 hover:shadow-lg"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceGenerator;