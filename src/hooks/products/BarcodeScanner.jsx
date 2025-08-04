import { useCallback, useEffect, useRef, useState } from 'react';
import Quagga from 'quagga';
import { detectBarcodePattern } from './detectedBarcodePattern';
function BarcodeScanner({ onDetected, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [ startCamera, stopCamera, onError ]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsScanning(true);
        startScanning();
      }
    } catch (err) {
      const errorMessage = 'Error al acceder a la cámara: ' + err.message;
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [onError, startScanning]); // Dependencia de onError
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsScanning(false);
  }, [stream]); // Dependencia de stream
//   



  const startScanning = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && isScanning) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Establecer el tamaño del canvas igual al video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar el frame del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obtener los datos de la imagen
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
         // Llama a detectBarcodePattern y maneja la promesa
       detectBarcodePattern(imageData)
                .then(barcode => {
                    setIsScanning(false);
                    if (onDetected) {
                        onDetected(barcode);
                    }
                })
                .catch(error => {
                    console.error(error); // Manejo de errores
                });
      }
    }, 100); // Escanear cada 100ms
  }, [isScanning, onDetected]); // Dependencias de isScanning y onDetected

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);


  
    // Inicializar QuaggaJS
Quagga.init({
  inputStream: {
    type: "LiveStream",
    target: videoRef.current
  },
  decoder: {
    readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader"]
  }
}, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  Quagga.start();
});

// Escuchar detecciones
Quagga.onDetected((result) => {
  if (onDetected) {
    onDetected(result.codeResult.code);
  }
});
    
  

  const handleManualInput = () => {
    // Función para permitir entrada manual cuando el escaneo automático no funciona
    const manualBarcode = prompt('Ingrese el código de barras manualmente:');
    if (manualBarcode && manualBarcode.trim()) {
      setIsScanning(false);
      if (onDetected) {
        onDetected(manualBarcode.trim());
      }
    }
}

  return (
    <div style={{ textAlign: 'center' }}>
      <h4>Escáner de Código de Barras</h4>
      
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          backgroundColor: '#fee', 
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}

      <div style={{ position: 'relative', display: 'inline-block' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            maxWidth: '500px',
            height: 'auto',
            border: '2px solid #007bff',
            borderRadius: '8px'
          }}
          playsInline
          muted
        />
        
        {/* Canvas oculto para procesamiento de imagen */}
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        
        {/* Overlay para mostrar el área de escaneo */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          height: '20%',
          border: '2px solid #ff0000',
          borderRadius: '4px',
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#ff0000',
            fontSize: '12px',
            fontWeight: 'bold',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            Coloque el código de barras aquí
          </div>
        </div>
      </div>

      <div style={{ marginTop: '15px' }}>
        <button
          onClick={handleManualInput}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Entrada Manual
        </button>
        
        <button
          onClick={isScanning ? stopCamera : startCamera}
          style={{
            padding: '10px 20px',
            backgroundColor: isScanning ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isScanning ? 'Detener Escaneo' : 'Iniciar Escaneo'}
        </button>
      </div>

      {isScanning && (
        <div style={{ 
          marginTop: '10px', 
          color: '#28a745',
          fontSize: '14px'
        }}>
          🔍 Escaneando... Coloque el código de barras en el área marcada
        </div>
      )}

      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#666',
        maxWidth: '500px',
        margin: '15px auto 0'
      }}>
        <p><strong>Nota:</strong> Para implementar detección real de códigos de barras, necesitarás instalar una librería como QuaggaJS:</p>
        <code style={{ backgroundColor: '#f8f9fa', padding: '2px 4px', borderRadius: '3px' }}>
          npm install quagga
        </code>
      </div>
    </div>
  );
}

export default BarcodeScanner;