import { useCallback, useState } from "react";

function useFetchClients() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const initialUrl = "http://localhost:3000/api/clients/get";

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setDone(false);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }
      
      const response = await fetch(initialUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error:", errorResponse); 
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Datos recibidos del servidor:', data);
      
      // Extraer el array de clientes de la respuesta
      const clientsArray = Array.isArray(data) ? data : 
                          Array.isArray(data.clients) ? data.clients : [];
      console.log('📋 Array de clientes procesado:', clientsArray);
      
      setClients(clientsArray);
      setDone(true);
      return clientsArray;
    } catch (err) {
      console.error('❌ Error en fetchClients:', err);
      setError(err.message);
      setClients([]); // Asegurar que siempre sea un array
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [initialUrl]);

  const refetch = useCallback(() => {
    setDone(false);
    return fetchClients();
  }, [fetchClients]);

  // Función para agregar un cliente - CORREGIDA
  const addClient = useCallback(async(newClientData) => {
    console.log('➕ Intentando agregar cliente:', newClientData);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3000/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClientData)
      });

      console.log('📡 Create response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('❌ Error del servidor:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('❌ No se pudo parsear error JSON:', parseError);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Cliente creado, respuesta del servidor:', responseData);

      // Verificar que tenemos el cliente en la respuesta
      if (!responseData.client) {
        console.warn('⚠️ No se recibió el cliente en la respuesta');
      }

      // Hacer refetch para obtener la lista actualizada
      console.log('🔄 Refrescando lista de clientes...');
      await fetchClients();
      
      return responseData;
      
    } catch (error) {
      console.error('❌ Error en addClient:', error);
      throw error; // Propagar el error original, no crear uno nuevo genérico
    }
  }, [fetchClients]);

  // Función para actualizar un cliente de forma optimista
  const updateClient = useCallback(async (updatedClientData, clientId) => {
    console.log('✏️ Actualizando cliente:', updatedClientData);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`http://localhost:3000/api/clients/update/${clientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedClientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Refetch para obtener datos actualizados
      await fetchClients();
      
      return responseData;
      
    } catch (error) {
      console.error('❌ Error en updateClient:', error);
      throw error;
    }
  }, [fetchClients]);

  // Función para eliminar un cliente
  const removeClient = useCallback(async (clientId) => {
    console.log('🗑️ Eliminando cliente con ID:', clientId);
    console.log('🔍 Tipo de clientId:', typeof clientId, 'Valor:', clientId);
    
    // Validar que el ID existe y no está vacío
    if (!clientId || clientId.toString().trim() === '') {
      throw new Error('ID de cliente inválido');
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const deleteUrl = `http://localhost:3000/api/clients/delete/${clientId}`;
      console.log('🌐 URL de eliminación:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('❌ Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('❌ No se pudo parsear error JSON:', parseError);
        }
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('✅ Cliente eliminado, respuesta:', responseData);

      // Actualización optimista del estado local
      setClients(prev => {
        if (!Array.isArray(prev)) {
          console.warn('⚠️ prev no es un array, retornando array vacío');
          return [];
        }
        return prev.filter(client => client._id !== clientId);
      });

      return true;
      
    } catch (error) {
      console.error('❌ Error en removeClient:', error);
      // Si hay error, refetch para restaurar el estado correcto
      await fetchClients();
      throw error;
    }
  }, [fetchClients]);

  // Función para establecer clientes manualmente (útil para debug)
  const setClientsManually = useCallback((newClients) => {
    const clientsArray = Array.isArray(newClients) ? newClients : [];
    setClients(clientsArray);
  }, []);

  return { 
    clients, 
    setClients: setClientsManually,
    fetchClients, 
    addClient, 
    updateClient, 
    removeClient, 
    refetch, 
    isLoading, 
    error, 
    done 
  };
}

export default useFetchClients;