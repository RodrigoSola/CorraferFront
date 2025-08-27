import { useState, useEffect, useCallback } from 'react';

const CompanyConfigModal = ({ isOpen, onClose }) => {
  // URL base de tu API
  const API_BASE_URL = 'http://localhost:3000/api/arca';
  
  const [config, setConfig] = useState({
    cuit: '',
    razonSocial: '',
    ptoVenta: '0001',
    usuario: '',
    password: '',
    domicilio: '',
    condicionIVA: 'Responsable Inscripto'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen, loadConfig]);

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
        body: JSON.stringify(configData)
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

    if (!config.usuario || config.usuario.trim() === '') {
      errors.push('Usuario AFIP es obligatorio');
    }

    if (!config.password || config.password.trim() === '') {
      errors.push('Contraseña AFIP es obligatoria');
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

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentConfig = await getCompanyConfig();
      setConfig(currentConfig);
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setIsLoading(false);
    }
  },[]);

  const handleSave = async () => {
    // Validar datos
    const validationErrors = validateCompanyData(config);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      await updateCompanyConfig(config);
      alert('✅ Configuración guardada correctamente');
      onClose();
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'cuit') {
      value = formatCUIT(value);
    }
    setConfig({ ...config, [field]: value });
    setErrors([]); // Limpiar errores al escribir
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b-2 border-blue-500 pb-4">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            🏢 Configuración de Empresa
          </h2>
          <button 
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Cargando configuración...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-yellow-800">Información Importante</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Necesitas tener una cuenta habilitada en AFIP con Clave Fiscal para usar ARCA. 
                    Los datos que ingreses aquí se usarán para conectarse automáticamente al sistema.
                  </p>
                </div>
              </div>
            </div>

            {/* Errores */}
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Errores:</h4>
                <ul className="text-red-700 text-sm space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CUIT */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  CUIT de la Empresa *
                </label>
                <input
                  type="text"
                  value={config.cuit}
                  onChange={(e) => handleInputChange('cuit', e.target.value)}
                  placeholder="20-12345678-9"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength="13"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formato: XX-XXXXXXXX-X
                </p>
              </div>

              {/* Razón Social */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Razón Social *
                </label>
                <input
                  type="text"
                  value={config.razonSocial}
                  onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                  placeholder="MI EMPRESA S.A.S"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Domicilio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">
                  Domicilio Fiscal
                </label>
                <input
                  type="text"
                  value={config.domicilio}
                  onChange={(e) => handleInputChange('domicilio', e.target.value)}
                  placeholder="Calle Falsa 123, Ciudad, Provincia"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Punto de Venta */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Punto de Venta
                </label>
                <input
                  type="text"
                  value={config.ptoVenta}
                  onChange={(e) => handleInputChange('ptoVenta', e.target.value)}
                  placeholder="0001"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  maxLength="4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número autorizado por AFIP
                </p>
              </div>

              {/* Condición IVA */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Condición ante IVA
                </label>
                <select
                  value={config.condicionIVA}
                  onChange={(e) => handleInputChange('condicionIVA', e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Exento">Exento</option>
                </select>
              </div>

              {/* Credenciales AFIP */}
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold mb-3 text-gray-700">🔐 Credenciales AFIP</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Usuario/CUIL *
                    </label>
                    <input
                      type="text"
                      value={config.usuario}
                      onChange={(e) => handleInputChange('usuario', e.target.value)}
                      placeholder="Tu usuario de AFIP"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Contraseña/Clave Fiscal *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={config.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Tu clave fiscal"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Importante:</strong> Estas credenciales se almacenan de forma segura y solo se usan 
                    para conectarse automáticamente a ARCA. Nunca compartimos tu información.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 ${
                  isSaving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    💾 Guardar Configuración
                  </>
                )}
              </button>
            </div>

            {/* Información adicional */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700">
              <strong>💡 ¿Necesitas ayuda?</strong>
              <ul className="mt-2 space-y-1">
                <li>• Si no tienes Clave Fiscal, podés crearla en <strong>afip.gob.ar</strong></li>
                <li>• Para habilitar ARCA, ingresá a "Mis Aplicaciones" en AFIP</li>
                <li>• El punto de venta debe estar autorizado en tu cuenta de AFIP</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyConfigModal;