// Componente opcional para debug - puedes agregarlo temporalmente para ver qué se está enviando
import { useState } from 'react';

function DebugInfo() {
  const [debugData, setDebugData] = useState(null);

  const testCreateClient = async () => {
    const testData = {
      name: 'Cliente de Prueba',
      alias: 'Prueba',
      cuit: '20-12345678-9',
      fiscalDirection: 'Calle Falsa 123',
      locality: 'Ciudad de Prueba',
      province: 'Provincia de Prueba',
      country: 'Argentina',
      typeOfClient: 'Particular'
    };

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'No existe');
      
      const response = await fetch('http://localhost:3000/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Error parsing JSON:', e);
        responseData = responseText;
      }

      setDebugData({
        status: response.status,
        ok: response.ok,
        data: responseData,
        sentData: testData
      });

    } catch (error) {
      console.error('Error:', error);
      setDebugData({
        error: error.message
      });
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #ff6b6b', 
      borderRadius: '10px', 
      margin: '20px 0',
      backgroundColor: '#fff5f5'
    }}>
      <h3>🔧 Debug Information</h3>
      <button 
        onClick={testCreateClient}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Probar Crear Cliente
      </button>

      {debugData && (
        <div style={{ marginTop: '20px' }}>
          <h4>Resultados:</h4>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px' }}>
        <h4>Cosas a verificar en tu backend:</h4>
        <ul>
          <li>¿La ruta POST /api/clients/create existe?</li>
          <li>¿El middleware de autenticación está funcionando?</li>
          <li>¿El modelo de Cliente tiene todos los campos correctos?</li>
          <li>¿La base de datos está conectada?</li>
          <li>¿Hay validaciones que están fallando?</li>
        </ul>
      </div>
    </div>
  );
}

export default DebugInfo;