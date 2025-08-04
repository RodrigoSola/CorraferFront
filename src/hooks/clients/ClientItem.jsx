import { useState } from 'react';

function ClientItem({ client, onEdit, onDelete, onToggleDebt }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingDebt, setIsTogglingDebt] = useState(false);

  const handleToggleDebt = async () => {
    setIsTogglingDebt(true);
    try {
      await onToggleDebt(client);
    } catch (error) {
      console.error('❌ Error al cambiar estado de deuda:', error);
    } finally {
      setIsTogglingDebt(false);
    }
  };

  const handleDelete = async () => {
    // Verificar que el cliente y su ID existen
    if (!client || !client._id) {
      alert('Error: Cliente o ID no válido');
      console.error('❌ Cliente inválido:', client);
      return;
    }

    console.log('🔍 Cliente a eliminar:', client);
    console.log('🔍 ID del cliente:', client._id);
    console.log('🔍 Tipo de ID:', typeof client._id);

    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${client.name}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log('🗑️ Iniciando eliminación del cliente:', client._id);
      await onDelete(client._id);
      console.log('✅ Cliente eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar cliente:', error);
      alert('Error al eliminar el cliente: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Verificar que el cliente existe antes de renderizar
  if (!client) {
    return (
      <div style={{ 
        border: '1px solid #ff0000', 
        padding: '15px', 
        margin: '10px 0', 
        borderRadius: '5px',
        backgroundColor: '#ffebee' 
      }}>
        <p style={{ color: '#d32f2f' }}>Error: Cliente no válido</p>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #ddd',
      padding: '15px',
      margin: '10px 0',
      borderRadius: '5px',
      backgroundColor: 'white'
    }}>
      {/* Debug info (puedes comentar esto en producción) */}
      <div style={{ 
        fontSize: '10px', 
        color: '#666', 
        marginBottom: '5px',
        fontFamily: 'monospace' 
      }}>
        ID: {client._id || 'NO_ID'} | Tipo: {typeof client._id}
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong style={{ fontSize: '18px', color: '#333' }}>
          {client.name || 'Sin nombre'}
        </strong>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px', 
        marginBottom: '15px' 
      }}>
        <div><strong>Alias:</strong> {client.alias || 'N/A'}</div>
        <div><strong>CUIT:</strong> {client.cuit || 'N/A'}</div>
        <div><strong>Dirección Fiscal:</strong> {client.fiscalDirection || 'N/A'}</div>
        <div><strong>Localidad:</strong> {client.location || 'N/A'}</div>
        <div><strong>Provincia:</strong> {client.province || 'N/A'}</div>
        <div><strong>País:</strong> {client.country || 'N/A'}</div>
        <div><strong>Tipo de Cliente:</strong> {client.typeOfClient || 'N/A'}</div>
        {client.owesDebt && (
  <div><strong>💰 Deuda:</strong> ${client.debtAmount || 'N/A'}</div>
  
)}

      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onEdit(client)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          ✏️ Editar
        </button>
        
        <button
          onClick={handleDelete}
          disabled={isDeleting || !client._id}
          style={{
            padding: '8px 16px',
            backgroundColor: isDeleting || !client._id ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isDeleting || !client._id ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
          onMouseOver={(e) => {
            if (!isDeleting && client._id) e.target.style.backgroundColor = '#c82333';
          }}
          onMouseOut={(e) => {
            if (!isDeleting && client._id) e.target.style.backgroundColor = '#dc3545';
          }}
        >
          {isDeleting ? '🔄 Eliminando...' : '🗑️ Eliminar'}
        </button>
        <button
  onClick={handleToggleDebt}
  disabled={isTogglingDebt}
  style={{
    padding: '8px 16px',
    backgroundColor: client.owesDebt ? '#ffc107' : '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '14px'
  }}
>
  {isTogglingDebt 
    ? 'Actualizando...'
    : client.owesDebt 
      ? '💸 No debe'
      : '💰 Debe plata' }
</button>
      </div>
    </div>
  );
}

export default ClientItem;