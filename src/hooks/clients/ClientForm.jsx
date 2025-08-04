import { useState, useEffect } from 'react';

function ClientForm({ client, onSubmit, onCancel, isEditing = false }) {
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    cuit: '',
    fiscalDirection: '',
    location: '',
    province: '',
    country: '',
    typeOfClient: '',
    owesDebt: false,
    debtAmount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Llenar el formulario cuando se edita un cliente
  useEffect(() => {
    if (isEditing && client) {
      setFormData({
        name: client.name || '',
        alias: client.alias || '',
        cuit: client.cuit || '',
        fiscalDirection: client.fiscalDirection || '',
        location: client.location || '',
        province: client.province || '',
        country: client.country || '',
        typeOfClient: client.typeOfClient || '',
        owesDebt: client.owesDebt || false,
        debtAmount: client.debtAmount || 0
      });
    }
  }, [client, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación básica del lado del cliente
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      setIsLoading(false);
      return;
    }

    try {
      console.log('📝 Enviando datos del formulario:', formData);
      
      // Llamar directamente a onSubmit con los datos del formulario
      // NO con la respuesta del servidor
      onSubmit(formData, isEditing);
      
      // Limpiar formulario si es creación
      if (!isEditing) {
        setFormData({
          name: '',
          alias: '',
          cuit: '',
          fiscalDirection: '',
          location: '', 
          province: '',
          country: '',
          typeOfClient: '',
          owesDebt: false
        });
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      margin: '20px 0', 
      borderRadius: '5px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>{isEditing ? 'Editar Cliente' : 'Crear Nuevo Cliente'}</h3>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          Error: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="name">Nombre: *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="alias">Alias:</label>
          <input
            type="text"
            id="alias"
            name="alias"
            value={formData.alias}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="cuit">CUIT:</label>
          <input
            type="text"
            id="cuit"
            name="cuit"
            value={formData.cuit}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="fiscalDirection">Dirección Fiscal:</label>
          <input
            type="text"
            id="fiscalDirection"
            name="fiscalDirection"
            value={formData.fiscalDirection}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="location">Localidad:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="province">Provincia:</label>
          <input
            type="text"
            id="province"
            name="province"
            value={formData.province}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="country">País:</label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="typeOfClient">Tipo de Cliente:</label>
          <select
            id="typeOfClient"
            name="typeOfClient"
            value={formData.typeOfClient}
            onChange={handleChange}
            style={{ width: '100%', padding: '5px', marginLeft: '10px' }}
          >
            <option value="">Seleccionar tipo</option>
            <option value="RI">RI (Responsable Inscripto)</option>
            <option value="EX">EX (Exento)</option>
          </select>
        </div>

        {/* Nuevo campo de deuda */}
        <div style={{ 
          marginBottom: '10px', 
          padding: '15px', 
          backgroundColor: '#f0f8ff', 
          border: '1px solid #b3d9ff', 
          borderRadius: '5px' 
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            <input
              type="checkbox"
              name="owesDebt"
              checked={formData.owesDebt}
              onChange={handleChange}
              style={{ 
                marginRight: '10px', 
                transform: 'scale(1.2)'
              }}
            />
            💰 Este cliente debe dinero
          </label>
          <small style={{ 
            display: 'block', 
            marginTop: '5px', 
            color: '#666',
            marginLeft: '30px'
          }}>
            Marca esta casilla si el cliente tiene deudas pendientes
          </small>
        </div>
        {formData.owesDebt && (
  <div style={{ marginTop: '10px', marginLeft: '30px' }}>
    <label htmlFor="debtAmount">💵 Monto de la deuda:</label>
    <input
      type="number"
      id="debtAmount"
      name="debtAmount"
      value={formData.debtAmount}
      onChange={handleChange}
      placeholder="Ej: 1000.50"
      style={{ width: '100%', padding: '5px', marginTop: '5px' }}
    />
  </div>
)}

        <div style={{ marginTop: '20px' }}>
          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginRight: '10px'
            }}
          >
            {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
          </button>
          
          {isEditing && (
            <button 
              type="button" 
              onClick={onCancel}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ClientForm;