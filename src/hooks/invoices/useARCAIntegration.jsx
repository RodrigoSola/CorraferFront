import { useState, useCallback } from 'react';

const useARCAIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testingMode, setTestingMode] = useState(true);

  // ✅ Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ Función mejorada para manejar errores HTTP
  const handleError = useCallback(async (response, context) => {
    let errorMessage = `Error HTTP: ${response.status}`;
    
    try {
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else if (contentType && contentType.includes('text/html')) {
        // El servidor está devolviendo HTML (probablemente una página de error)
        errorMessage = `Servidor no disponible (${response.status}). Verifica que el backend esté ejecutándose en http://localhost:3000`;
      } else {
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      }
    } catch (parseError) {
      console.error('Error parseando respuesta de error:', parseError);
      errorMessage = `Error ${response.status}: Servidor backend no disponible o mal configurado`;
    }

    console.error(`❌ ${context}:`, { status: response.status, message: errorMessage });
    throw new Error(errorMessage);
  }, []);

  // ✅ Función principal para generar factura ARCA - CORREGIDA
  const generateARCAInvoice = useCallback(async (invoiceParams, legacyCart, legacyPaymentMethod) => {
    console.log('🧾 Generando factura ARCA...');
    console.log('📦 Parámetros recibidos:', invoiceParams, legacyCart, legacyPaymentMethod);

    // ✅ VALIDACIÓN Y NORMALIZACIÓN DE PARÁMETROS
    let client, cart, paymentMethod;

    // Detectar el formato de los parámetros
    if (invoiceParams && typeof invoiceParams === 'object' && !Array.isArray(invoiceParams)) {
      if (invoiceParams.client && invoiceParams.products) {
        // Formato: { client, products, paymentMethod, ... }
        client = invoiceParams.client;
        cart = invoiceParams.products;
        paymentMethod = invoiceParams.paymentMethod || 'Efectivo';
      } else if (invoiceParams.client && invoiceParams.cart) {
        // Formato: { client, cart, paymentMethod }
        client = invoiceParams.client;
        cart = invoiceParams.cart;
        paymentMethod = invoiceParams.paymentMethod || 'Efectivo';
      } else if (legacyCart) {
        // Formato legacy: (client, cart, paymentMethod)
        client = invoiceParams;
        cart = legacyCart;
        paymentMethod = legacyPaymentMethod || 'Efectivo';
      } else {
        // Asumir que es un cliente y buscar cart en las propiedades
        client = invoiceParams;
        cart = [];
        paymentMethod = 'Efectivo';
      }
    } else if (Array.isArray(invoiceParams)) {
      // Si el primer parámetro es el array del carrito
      cart = invoiceParams;
      client = { name: 'Consumidor Final', typeOfClient: 'CF' };
      paymentMethod = legacyCart || 'Efectivo'; // En este caso legacyCart sería el paymentMethod
    } else {
      // Formato legacy: (client, cart, paymentMethod) - pero client no es objeto
      client = invoiceParams || { name: 'Consumidor Final', typeOfClient: 'CF' };
      cart = legacyCart || [];
      paymentMethod = legacyPaymentMethod || 'Efectivo';
    }

    // ✅ VALIDACIONES CRÍTICAS
    console.log('👤 Cliente procesado:', client);
    console.log('🛒 Carrito procesado:', cart);
    console.log('💳 Método de pago:', paymentMethod);

    if (!cart) {
      throw new Error('No se proporcionó carrito de productos');
    }

    if (!Array.isArray(cart)) {
      console.error('❌ El carrito no es un array:', typeof cart, cart);
      throw new Error('El carrito debe ser un array de productos');
    }

    if (cart.length === 0) {
      throw new Error('No hay productos en el carrito');
    }

    // Validar que cada producto tenga la estructura mínima
    const validatedCart = cart.map((item, index) => {
      if (!item || typeof item !== 'object') {
        throw new Error(`El producto en posición ${index} no es válido`);
      }

      return {
        name: item.name || item.description || `Producto ${index + 1}`,
        quantity: parseInt(item.quantity || 1),
        unitPrice: parseFloat(item.unitPrice || item.priceWithIVA || 0),
        priceWithIVA: parseFloat(item.priceWithIVA || item.unitPrice || 0),
        priceWithoutIVA: parseFloat(item.priceWithoutIVA || (item.priceWithIVA || item.unitPrice || 0) / 1.21),
        barcode: item.barcode || item.id || `ITEM_${Date.now()}_${index}`,
        description: item.description || item.name || ''
      };
    });

    console.log('🔍 Carrito validado:', validatedCart);

    setIsLoading(true);
    setError(null);

    try {
      // ✅ PRIMERO: Verificar que el servidor esté disponible
      console.log('🔍 Verificando servidor backend...');
      
      let serverCheck;
      try {
        serverCheck = await fetch('http://localhost:3000/api/health', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
      } catch (fetchError) {
        console.error('Error al verificar el servidor:', fetchError);
        throw new Error('Backend no disponible. Asegúrate de que el servidor esté ejecutándose en http://localhost:3000');
      }

      if (!serverCheck.ok) {
        throw new Error(`Servidor backend no responde (Status: ${serverCheck.status})`);
      }

      // ✅ SEGUNDO: Verificar que ARCA esté configurado
      console.log('🏛️ Verificando configuración ARCA...');
      
      let arcaCheck;
      try {
        arcaCheck = await fetch('http://localhost:3000/api/arca/test', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        });
      } catch (fetchError) {
        console.error('Error al verificar ARCA:', fetchError);
        throw new Error('Módulo ARCA no disponible. Verifica la configuración del backend.');
      }

      if (!arcaCheck.ok) {
        throw new Error(`ARCA no configurado correctamente (Status: ${arcaCheck.status})`);
      }

      // ✅ TERCERO: Preparar datos para ARCA (corregido)
      const invoiceData = {
        client: {
          name: client?.name || 'Consumidor Final',
          cuit: client?.cuit || '',
          email: client?.email || '',
          location: client?.address || '',
          typeOfClient: client?.typeOfClient || 'CF'
        },
        cartItems: validatedCart, // Usar el carrito validado
        paymentMethod: paymentMethod,
        testing: testingMode,
        total: validatedCart.reduce((sum, item) => sum + (item.priceWithIVA * item.quantity), 0)
      };

      console.log('📤 Enviando factura a ARCA:', invoiceData);

      // ✅ CUARTO: Realizar petición al endpoint correcto
      const response = await fetch('http://localhost:3000/api/arca/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(invoiceData),
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      console.log('📥 Respuesta recibida:', { status: response.status, ok: response.ok });

      // ✅ Manejar respuesta
      if (!response.ok) {
        await handleError(response, 'Error generando factura ARCA');
      }

      const result = await response.json();
      console.log('✅ Factura ARCA generada exitosamente:', result);

      // ✅ Formatear respuesta para el componente
      return {
        success: true,
        numeroFactura: result.numeroFactura || result.invoiceNumber,
        cae: result.cae,
        vencimientoCae: result.fechaVencimientoCAE || result.vencimientoCae,
        tipoComprobante: result.tipo || result.type,
        total: result.total || invoiceData.total,
        cliente: result.clientData || invoiceData.client,
        items: result.items || invoiceData.cartItems,
        fechaEmision: result.fechaEmision || new Date().toISOString(),
        metodoPago: paymentMethod,
        testing: testingMode,
        downloadUrl: result.downloadUrl,
        viewUrl: result.viewUrl,
        pdfUrl: result.pdfUrl,
        _id: result._id || result.id,
        rawResponse: result
      };

    } catch (error) {
      console.error('❌ Error generando factura ARCA:', error);
      setError(error.message);
      
      return {
        success: false,
        error: error.message,
        testing: testingMode
      };
    } finally {
      setIsLoading(false);
    }
  }, [testingMode, handleError]);

  // ✅ Función para generar factura simple (consumidor final) - CORREGIDA
  const generateSimpleInvoice = useCallback(async (invoiceParams, legacyPaymentMethod) => {
    console.log('📄 Generando factura simple para Consumidor Final...');
    console.log('📦 Parámetros recibidos:', invoiceParams, legacyPaymentMethod);

    // Normalizar parámetros
    let cart, paymentMethod;
    
    if (invoiceParams && typeof invoiceParams === 'object' && !Array.isArray(invoiceParams)) {
      if (invoiceParams.products) {
        cart = invoiceParams.products;
        paymentMethod = invoiceParams.paymentMethod || 'Efectivo';
      } else {
        cart = invoiceParams.cart || invoiceParams;
        paymentMethod = invoiceParams.paymentMethod || 'Efectivo';
      }
    } else if (Array.isArray(invoiceParams)) {
      cart = invoiceParams;
      paymentMethod = legacyPaymentMethod || 'Efectivo';
    } else {
      // Fallback
      cart = invoiceParams || [];
      paymentMethod = legacyPaymentMethod || 'Efectivo';
    }
    
    return await generateARCAInvoice({
      client: { name: 'Consumidor Final', typeOfClient: 'CF' }, 
      products: cart,
      paymentMethod: paymentMethod
    });
  }, [generateARCAInvoice]);

  // ✅ Función para verificar salud del servidor
  const checkServerHealth = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        // También verificar ARCA específicamente
        const arcaResponse = await fetch('http://localhost:3000/api/arca/test', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        return arcaResponse.ok;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ Servidor no disponible:', error.message);
      return false;
    }
  }, []);

  // ✅ Función para listar facturas con mejor manejo de errores
  const listInvoices = useCallback(async (filters = {}) => {
    console.log('📋 Listando facturas...');
    
    try {
      const queryParams = new URLSearchParams({
        limit: filters.limit || 20,
        page: filters.page || 1,
        sortBy: filters.sortBy || 'fechaEmision',
        sortOrder: filters.sortOrder || 'desc'
      });

      const response = await fetch(`http://localhost:3000/api/arca/invoices?${queryParams}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status === 404 || response.status === 500) {
          console.warn('⚠️ Endpoint de facturas no disponible');
          return { invoices: [], total: 0, success: true };
        }
        await handleError(response, 'Error listando facturas');
      }

      const result = await response.json();
      return {
        invoices: result.invoices || [],
        total: result.total || 0,
        success: true
      };

    } catch (error) {
      console.error('❌ Error listando facturas:', error);
      return {
        invoices: [],
        total: 0,
        success: false,
        error: error.message
      };
    }
  }, [handleError]);

  return {
    // Estados
    isLoading,
    error,
    testingMode,
    
    // Funciones principales
    generateARCAInvoice,
    generateSimpleInvoice,
    listInvoices,
    
    // Funciones de utilidad
    clearError,
    checkServerHealth,
    setTestingMode
  };
};

export default useARCAIntegration;