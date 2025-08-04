import { useState } from 'react';


const useARCAIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ Modo testing
  const [testingMode, setTestingMode] = useState(true); // Cambiar a false para producción

  // URL base de tu API
  const API_BASE_URL = 'http://localhost:3000/api/arca';

  // Determinar tipo de factura según cliente
  const determineInvoiceType = (client) => {
    if (!client || !client.cuit || client.cuit === "0" || client.typeOfClient === 'CF') {
      return { type: 'C', description: 'C (Consumidor Final)' };
    }

    switch (client.typeOfClient?.toUpperCase()) {
      case 'RI':
      case 'RESPONSABLE_INSCRIPTO':
        return { type: 'A', description: 'A (Discrimina IVA)' };
      case 'EX':
      case 'EXENTO':
        return { type: 'A', description: 'A (Exento)' };
      case 'MONOTRIBUTO':
        return { type: 'B', description: 'B (No discrimina IVA)' };
      default:
        return { type: 'C', description: 'C (Consumidor Final)' };
    }
  };

  // ✅ Generar factura de prueba con datos completos de PDF
  const generateTestInvoice = async (client, cartItems, paymentMethod = 'Efectivo') => {
  // Llamar al backend con testing: true
  const response = await fetch(`${API_BASE_URL}/generate-invoice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client,
      cartItems,
      paymentMethod,
      testing: true // ✅ Backend generará PDF de prueba
    })
  });
  
  const result = await response.json();
  return result;
};




  // Generar factura oficial con ARCA
  const generateARCAInvoice = async (client, cartItems, paymentMethod = 'Efectivo') => {
    setIsLoading(true);
    setError(null);
    
    console.log('🔍 generateARCAInvoice called - testingMode:', testingMode);
    
    // ✅ Si está en modo testing, usar la función de prueba
    if (testingMode) {
      console.log('🧪 Modo Testing: Generando factura de prueba');
      return generateTestInvoice(client, cartItems, paymentMethod);
    }

    try {
      // Validaciones básicas
      if (!cartItems || cartItems.length === 0) {
        throw new Error('No hay productos en el carrito');
      }

      if (!client || !client.name) {
        throw new Error('Datos del cliente incompletos');
      }

      // Realizar petición al backend
      const response = await fetch(`${API_BASE_URL}/generate-invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client,
          cartItems,
          paymentMethod,
          testing: testingMode // ✅ Enviar modo testing al backend
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al generar la factura');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      setIsLoading(false);
      return {
        success: true,
        numeroFactura: result.numeroFactura,
        cae: result.cae,
        fechaVencimientoCAE: result.fechaVencimientoCAE,
        tipo: result.tipo,
        descripcionTipo: result.descripcionTipo,
        cliente: result.cliente,
        client: client, // ✅ Incluir datos completos del cliente
        total: result.total,
        subtotal: result.subtotal,
        iva: result.iva,
        fechaEmision: result.fechaEmision,
        metodoPago: result.metodoPago,
        items: cartItems, // ✅ Incluir items del carrito
        testing: testingMode,
        // ✅ Datos de PDF desde el backend
        pdfPath: result.pdfPath,
        pdfFileName: result.pdfFileName,
        downloadUrl: result.downloadUrl,
        viewUrl: result.viewUrl
      };

    } catch (error) {
      setIsLoading(false);
      setError(error.message);
      throw error;
    }
  };

  // Obtener configuración de la empresa
  const getCompanyConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/company-config`);
      
      if (!response.ok) {
        throw new Error('Error al obtener configuración');
      }

      const result = await response.json();
      return result.config;

    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      throw error;
    }
  };

  // Actualizar configuración de la empresa
  const updateCompanyConfig = async (configData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/company-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...configData,
          testing: testingMode // ✅ Incluir modo testing
        })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar configuración');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw error;
    }
  };

  // Validar datos de empresa
  const validateCompanyData = (config) => {
    const errors = [];

    if (!config.cuit || config.cuit.length < 11) {
      errors.push('CUIT inválido');
    }

    if (!config.razonSocial || config.razonSocial.trim() === '') {
      errors.push('Razón Social es obligatoria');
    }

    if (!testingMode) {
      if (!config.usuario || config.usuario.trim() === '') {
        errors.push('Usuario AFIP es obligatorio');
      }

      if (!config.password || config.password.trim() === '') {
        errors.push('Contraseña AFIP es obligatoria');
      }
    }

    return errors;
  };

  // Formatear CUIT
  const formatCUIT = (cuit) => {
    if (!cuit) return '';
    const cleaned = cuit.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 10)}-${cleaned.substring(10)}`;
    }
    return cleaned;
  };

  return {
    generateARCAInvoice,
    generateTestInvoice, // ✅ Exportar función de prueba
    getCompanyConfig,
    updateCompanyConfig,
    determineInvoiceType,
    validateCompanyData,
    formatCUIT,
    testingMode, // ✅ Exportar estado
    setTestingMode, // ✅ Exportar setter
    isLoading,
    error
  };
};

export default useARCAIntegration;