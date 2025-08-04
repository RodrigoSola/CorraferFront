import { useEffect, useState } from 'react';
import useFetchClients from '../hooks/clients/useFetchClients';
import ClientForm from '../hooks/clients/ClientForm';
import ClientItem from '../hooks/clients/ClientItem';
import Nav from './Nav';


function Clients() {
  const { 
    clients, 
    fetchClients, 
    addClient, 
    updateClient, 
    removeClient, 
    isLoading, 
    error 
  } = useFetchClients();

  const [editingClient, setEditingClient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, ri, ex
  const [debtFilter, setDebtFilter] = useState('all'); // all, owes, paid

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Función para filtrar clientes
  const filteredClients = clients.filter(client => {
    if (!client) return false;
    
    // Filtro por término de búsqueda
    const searchMatch = !searchTerm || 
      (client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       client.alias?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       client.cuit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       client.location?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filtro por tipo de cliente
    const typeMatch = filterType === 'all' || 
      client.typeOfClient?.toLowerCase() === filterType.toLowerCase();
    
    // Filtro por deudas
    const debtMatch = debtFilter === 'all' || 
      (debtFilter === 'owes' && client.owesDebt) ||
      (debtFilter === 'paid' && !client.owesDebt);
    
    return searchMatch && typeMatch && debtMatch;
  });

  const handleFormSubmit = async (formData, isEditing) => {
    setSubmitError('');
    
    try {
      if (isEditing) {
        console.log('🔄 Actualizando cliente existente:', formData);
        await updateClient(formData, editingClient._id);
        setEditingClient(null);
      } else {
        console.log('➕ Creando nuevo cliente - datos del formulario:', formData);
        // Asegurarnos de pasar solo los datos del formulario, no la respuesta del servidor
        await addClient(formData);
      }
      
      setShowForm(false);
      console.log('✅ Operación completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error al guardar el cliente:', error);
      setSubmitError(error.message || 'Error desconocido al guardar el cliente');
    }
  };

  const handleEdit = (client) => {
    console.log('✏️ Editando cliente:', client);
    setEditingClient(client);
    setShowForm(true);
    setSubmitError('');
  };

  const handleDelete = async (clientId) => {
    try {
      console.log('🗑️ Eliminando cliente:', clientId);
      await removeClient(clientId);
      console.log('✅ Cliente eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      alert('Error al eliminar el cliente: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setShowForm(false);
    setSubmitError('');
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setShowForm(true);
    setSubmitError('');
  };

  // Función para cambiar el estado de deuda rápidamente
  const toggleDebt = async (client) => {
  const updatedClient = {
    ...client,
    owesDebt: !client.owesDebt,
    debtAmount: client.owesDebt ? 0 : client.debtAmount || 0
  };

  try {
    await updateClient(updatedClient, client._id);
    console.log(`💰 Estado de deuda actualizado para ${client.name}`);
  } catch (error) {
    console.error('❌ Error al cambiar estado de deuda:', error);
    alert('Error al cambiar el estado de deuda: ' + error.message);
  }
};
  const clearSearch = () => {
    setSearchTerm('');
    setFilterType('all');
    setDebtFilter('all');
  };

  if (isLoading && clients.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Clientes</h2>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  if (error && clients.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Clientes</h2>
        <p style={{ color: "red" }}>Error: {error}</p>
        <button onClick={fetchClients}>Intentar de nuevo</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Nav />
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1>Gestión de Clientes</h1>
        <button 
          onClick={handleNewClient}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#495057' }}>🔍 Buscar y Filtrar Clientes</h3>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px',
          alignItems: 'end'
        }}>
          {/* Campo de búsqueda */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Buscar:
            </label>
            <input
              type="text"
              placeholder="Nombre, alias, CUIT o localidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Filtro por tipo */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Tipo de Cliente:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos</option>
              <option value="ri">RI (Responsable Inscripto)</option>
              <option value="ex">EX (Exento)</option>
            </select>
          </div>

          {/* Filtro por deudas */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Estado de Deuda:
            </label>
            <select
              value={debtFilter}
              onChange={(e) => setDebtFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="all">Todos</option>
              <option value="owes">Debe dinero</option>
              <option value="paid">Al día</option>
            </select>
          </div>

          {/* Botón limpiar */}
          <div>
            <button
              onClick={clearSearch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
            >
              🧹 Limpiar
            </button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div style={{ 
          marginTop: '15px', 
          padding: '10px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          📊 Mostrando <strong>{filteredClients.length}</strong> de <strong>{clients.length}</strong> clientes
          {searchTerm && (
            <span> | Búsqueda: "<strong>{searchTerm}</strong>"</span>
          )}
          {filterType !== 'all' && (
            <span> | Tipo: <strong>{filterType.toUpperCase()}</strong></span>
          )}
          {debtFilter !== 'all' && (
            <span> | Deuda: <strong>{debtFilter === 'owes' ? 'Debe dinero' : 'Al día'}</strong></span>
          )}
        </div>
      </div>

      {/* Error de submit */}
      {submitError && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px',
          border: '1px solid #f44336'
        }}>
          <strong>Error:</strong> {submitError}
        </div>
      )}

      {/* Error general */}
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px' 
        }}>
          Error: {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <ClientForm
          client={editingClient}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
          isEditing={!!editingClient}
        />
      )}

      {/* Lista de clientes */}
      <div style={{ marginTop: '20px' }}>
        <h2>Lista de Clientes ({filteredClients.length})</h2>
        
        {filteredClients.length > 0 ? (
          <div>
            {filteredClients.map(client => (
              <ClientItem
                key={client._id}
                client={client}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleDebt={toggleDebt}
              />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '5px',
            color: '#6c757d'
          }}>
            {clients.length === 0 ? (
              <>
                <h3>No hay clientes registrados</h3>
                <p>Haz clic en "Nuevo Cliente" para agregar el primer cliente.</p>
              </>
            ) : (
              <>
                <h3>No se encontraron clientes</h3>
                <p>Intenta cambiar los filtros de búsqueda.</p>
                <button 
                  onClick={clearSearch}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Mostrar todos los clientes
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div style={{ 
          position: 'fixed', 
          top: '20px', 
          right: '20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: '5px',
          zIndex: 1000
        }}>
          Actualizando...
        </div>
      )}

      {/* Debug info - descomenta para debugging */}
      {/* <DebugInfo clients={clients} isLoading={isLoading} error={error} /> */}
    </div>
  );
}

export default Clients;