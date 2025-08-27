import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, RefreshCw, FileText, TrendingUp, Users, DollarSign, Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalInvoices: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    officialCount: 0,
    testingCount: 0,
    avgAmount: 0
  });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'fechaEmision',
    order: 'desc',
    testing: '',
    status: '',
    cliente: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices =useCallback( async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('order', filters.order);
      
      if (filters.testing !== '') {
        params.append('testing', filters.testing);
      }
      if (filters.status !== '') {
        params.append('status', filters.status);
      }
      if (searchTerm.trim() !== '') {
        params.append('cliente', searchTerm.trim());
      }

      const url = `http://localhost:3000/api/arca/invoices?${params.toString()}`;
      console.log('📡 Haciendo petición a:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Respuesta no JSON:', text);
        throw new Error('El servidor no devolvió datos JSON válidos.');
      }

      const result = await response.json();
      console.log('📊 Datos recibidos:', result);
      
      if (result.success) {
        setInvoices(result.invoices || []);
        setPagination(result.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalInvoices: result.invoices?.length || 0,
          hasNext: false,
          hasPrev: false
        });
        setStats(result.stats || {
          totalInvoices: result.invoices?.length || 0,
          totalAmount: 0,
          officialCount: 0,
          testingCount: 0,
          avgAmount: 0
        });
      } else {
        throw new Error(result.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ Error cargando facturas:', error);
      setError(error.message);
      
      // Solo mostrar datos de prueba si es error de conexión
      if (error.message.includes('Failed to fetch') || 
          error.message.includes('ECONNREFUSED') ||
          error.message.includes('Error 500') ||
          error.message.includes('NetworkError')) {
        
        const mockInvoices = [
          {
            _id: '507f1f77bcf86cd799439011',
            id: '507f1f77bcf86cd799439011',
            numeroFactura: 'TEST-001',
            tipo: 'C',
            cliente: 'Cliente de Prueba',
            clientEmail: 'cliente@test.com',
            total: 1250.00,
            fechaEmision: new Date(),
            fechaEmisionFormatted: new Date().toLocaleDateString('es-AR'),
            testing: true,
            status: 'completed',
            pdfFileName: 'test-invoice.pdf',
            viewUrl: '/invoices/test-invoice.pdf',
            downloadUrl: '/invoices/download/test-invoice.pdf',
            emailSent: false,
            createdAt: new Date()
          },
         
        ];
        
        setInvoices(mockInvoices);
        setStats({
          totalInvoices: 2,
          totalAmount: 4750.50,
          officialCount: 1,
          testingCount: 1,
          avgAmount: 2375.25
        });
        setError('⚠️ Servidor no disponible - Mostrando datos de prueba');
      } else {
        setInvoices([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchInvoices();
  }, [filters,fetchInvoices]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.cliente) {
        setFilters(prev => ({ ...prev, cliente: searchTerm, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.cliente]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ FUNCIÓN CORREGIDA PARA VER PDF
  const handleViewPDF = async (invoice) => {
    try {
      const invoiceId = invoice._id || invoice.id;
      console.log('👁️ Viendo PDF para factura:', { 
        invoiceId, 
        numeroFactura: invoice.numeroFactura,
        pdfFileName: invoice.pdfFileName,
      });
      
      if (!invoiceId) {
        alert('❌ ID de factura no disponible');
        return;
      }

      // 🌐 URL del PDF desde el servidor
      const pdfUrl = `http://localhost:3000/api/arca/invoices/${invoiceId}/pdf`;
      console.log('📄 Cargando PDF desde:', pdfUrl);
      
      // ✅ ABRIR VENTANA OPTIMIZADA PARA PDF
      const pdfWindow = window.open('', '_blank', 
        'width=1200,height=900,scrollbars=yes,resizable=yes,menubar=yes,toolbar=yes,location=yes,status=yes'
      );
      
      if (!pdfWindow) {
        alert('❌ El navegador bloqueó la ventana emergente.\nPor favor, permite ventanas emergentes para este sitio.');
        return;
      }

      // ✅ MOSTRAR LOADING Y CONFIGURAR LA VENTANA PARA PDF
      pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Factura ${invoice.numeroFactura}</title>
            <style>
              * { 
                margin: 0; 
                padding: 0; 
                box-sizing: border-box; 
              }
              
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: #f1f5f9; 
                overflow: hidden;
                height: 100vh;
              }
              
              .header {
                background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                color: white;
                padding: 12px 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                height: 60px;
              }
              
              .header-left {
                display: flex;
                align-items: center;
                gap: 12px;
              }
              
              .header-left h1 {
                font-size: 18px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              
              .badge {
                background: rgba(59,130,246,0.2);
                color: #3b82f6;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
                border: 1px solid rgba(59,130,246,0.3);
              }
              
              .header-actions {
                display: flex;
                gap: 8px;
              }
              
              .btn {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
                padding: 8px 14px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                white-space: nowrap;
              }
              
              .btn:hover {
                background: rgba(255,255,255,0.2);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              }
              
              .btn-primary {
                background: rgba(34,197,94,0.15);
                border-color: rgba(34,197,94,0.3);
                color: #22c55e;
              }
              
              .btn-primary:hover {
                background: rgba(34,197,94,0.25);
                color: #16a34a;
              }
              
              .pdf-container {
                position: fixed;
                top: 60px;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                border-top: 1px solid #e2e8f0;
              }
              
              .pdf-frame {
                width: 100%;
                height: 100%;
                border: none;
                background: white;
                display: block;
              }
              
              .loading-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 100;
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                border: 1px solid #e2e8f0;
              }
              
              .loading-spinner {
                width: 48px;
                height: 48px;
                border: 4px solid #f1f5f9;
                border-top: 4px solid #2563eb;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
              }
              
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              
              .loading-text {
                color: #64748b;
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 8px;
              }
              
              .loading-subtitle {
                color: #94a3b8;
                font-size: 13px;
              }
              
              .error-container {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                background: #fef2f2;
                border: 2px solid #fecaca;
                border-radius: 12px;
                padding: 40px;
                max-width: 500px;
                box-shadow: 0 8px 32px rgba(239,68,68,0.1);
              }
              
              .error-title {
                color: #dc2626;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
              }
              
              .error-message {
                color: #b91c1c;
                font-size: 14px;
                margin-bottom: 20px;
                line-height: 1.5;
              }
              
              .error-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
              }
              
              .btn-error {
                background: #dc2626;
                color: white;
                border: none;
              }
              
              .btn-error:hover {
                background: #b91c1c;
              }
              
              /* Estilos para impresión */
              @media print {
                .header {
                  display: none !important;
                }
                .pdf-container {
                  top: 0 !important;
                }
                body {
                  background: white !important;
                }
              }
              
              /* Ocultar elementos cuando se carga el PDF */
              .pdf-loaded .loading-container {
                display: none;
              }
            </style>
          </head>
          <body>
            <!-- Header con controles -->
            <div class="header">
              <div class="header-left">
                <h1>
                  📄 Factura ${invoice.numeroFactura}
                </h1>
                ${invoice.testing ? 
                  '<span class="badge">🧪 TESTING</span>' : 
                  '<span class="badge" style="background: rgba(34,197,94,0.2); color: #22c55e; border-color: rgba(34,197,94,0.3);">✅ OFICIAL</span>'
                }
              </div>
              
              <div class="header-actions">
                <button onclick="window.print()" class="btn btn-primary">
                  🖨️ Imprimir
                </button>
                <a href="${pdfUrl}" download="factura_${invoice.numeroFactura}.pdf" class="btn">
                  ⬇️ Descargar
                </a>
                <button onclick="location.reload()" class="btn">
                  🔄 Recargar
                </button>
                <button onclick="window.close()" class="btn">
                  ❌ Cerrar
                </button>
              </div>
            </div>

            <!-- Contenedor del PDF -->
            <div class="pdf-container">
              <!-- Loading -->
              <div class="loading-container" id="loadingContainer">
                <div class="loading-spinner"></div>
                <div class="loading-text">Cargando factura...</div>
                <div class="loading-subtitle">
                  ${invoice.numeroFactura} • ID: ${invoiceId.substring(0, 8)}...
                </div>
              </div>

              <!-- PDF Frame -->
              <iframe 
                id="pdfFrame"
                src="${pdfUrl}" 
                class="pdf-frame"
                onload="handlePdfLoad()"
                onerror="handlePdfError()"
                title="Factura ${invoice.numeroFactura}"
              ></iframe>
            </div>

            <script>
              let loadTimeout;
              let hasLoaded = false;

              // Función cuando se carga el PDF exitosamente
              function handlePdfLoad() {
                console.log('✅ PDF cargado exitosamente');
                clearTimeout(loadTimeout);
                hasLoaded = true;
                
                // Ocultar loading
                document.body.classList.add('pdf-loaded');
                
                // Focus en el iframe para mejor experiencia
                document.getElementById('pdfFrame').focus();
              }

              // Función cuando hay error cargando el PDF
              function handlePdfError() {
                console.error('❌ Error cargando PDF');
                clearTimeout(loadTimeout);
                showError('No se pudo cargar el archivo PDF desde el servidor.');
              }

              // Mostrar error
              function showError(message) {
                document.querySelector('.pdf-container').innerHTML = \`
                  <div class="error-container">
                    <div class="error-title">
                      ❌ Error al cargar PDF
                    </div>
                    <div class="error-message">
                      \${message}<br><br>
                      <strong>URL:</strong> ${pdfUrl}<br>
                      <strong>Factura:</strong> ${invoice.numeroFactura}
                    </div>
                    <div class="error-actions">
                      <button onclick="location.reload()" class="btn btn-error">
                        🔄 Reintentar
                      </button>
                      <button onclick="window.close()" class="btn">
                        ❌ Cerrar
                      </button>
                    </div>
                  </div>
                \`;
              }

              // Timeout de 15 segundos para mostrar error si no carga
              loadTimeout = setTimeout(() => {
                if (!hasLoaded) {
                  console.warn('⏰ Timeout cargando PDF');
                  showError('El PDF está tardando demasiado en cargar. Verifique su conexión a internet.');
                }
              }, 15000);

              // Mejorar la experiencia de impresión
              window.addEventListener('beforeprint', () => {
                console.log('🖨️ Iniciando impresión...');
              });

              // Shortcuts de teclado
              document.addEventListener('keydown', (e) => {
                // Ctrl+P para imprimir
                if (e.ctrlKey && e.key === 'p') {
                  e.preventDefault();
                  window.print();
                }
                // Escape para cerrar
                if (e.key === 'Escape') {
                  window.close();
                }
                // F5 para recargar
                if (e.key === 'F5') {
                  e.preventDefault();
                  location.reload();
                }
              });

              // Auto-focus en la ventana
              window.focus();
              
              console.log('🚀 Ventana PDF inicializada para:', '${invoice.numeroFactura}');
            </script>
          </body>
        </html>
      `);

      // Cerrar el documento para que se renderice
      pdfWindow.document.close();

    } catch (error) {
      console.error('❌ Error abriendo PDF:', error);
      alert(`❌ Error al abrir el PDF: ${error.message}`);
    }
  };

  // ✅ FUNCIÓN AUXILIAR PARA DESCARGAR PDF DIRECTAMENTE
  const handleDownloadPDF = async (invoice) => {
    try {
      const invoiceId = invoice._id || invoice.id;
      const downloadUrl = `http://localhost:3000/api/arca/invoices/${invoiceId}/pdf`;
      
      // Crear enlace temporal para descarga
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `factura_${invoice.numeroFactura}.pdf`;
      link.target = '_blank';
      
      // Agregar al DOM, hacer click y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('⬇️ Descarga iniciada:', invoice.numeroFactura);
    } catch (error) {
      console.error('❌ Error descargando PDF:', error);
      alert(`❌ Error al descargar: ${error.message}`);
    }
  };

  const getStatusBadge = (invoice) => {
    const statusConfig = {
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '✅', label: 'Completada' },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '⏳', label: 'Pendiente' },
      error: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '❌', label: 'Error' },
      cancelled: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', icon: '🚫', label: 'Cancelada' }
    };
    
    const config = statusConfig[invoice.status] || statusConfig.completed;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center text-sm text-gray-600">
          <span>
            Mostrando {Math.min((pagination.currentPage - 1) * filters.limit + 1, pagination.totalInvoices)} a{' '}
            {Math.min(pagination.currentPage * filters.limit, pagination.totalInvoices)} de{' '}
            {pagination.totalInvoices} resultados
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={pagination.currentPage === 1}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Primera
          </button>
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          
          <span className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium">
            {pagination.currentPage} de {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNext}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            Última
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="w-8 h-8" />
                Gestión de Facturas
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-normal">
                  v3.4 Fixed
                </span>
              </h1>
              <p className="text-blue-100 mt-2">
                Administra y consulta todas las facturas guardadas en MongoDB
              </p>
            </div>
            <button
              onClick={fetchInvoices}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all duration-200 backdrop-blur-sm border border-white/20"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Alert */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg border-l-4 ${
            error.includes('datos de prueba') || error.includes('Servidor no disponible') 
              ? 'bg-amber-50 border-amber-400 text-amber-800' 
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className="text-lg">
                {error.includes('datos de prueba') || error.includes('Servidor no disponible') ? '⚠️' : '❌'}
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {!error && (
          <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="text-emerald-600 text-lg">✅</div>
              <p className="text-emerald-800 font-medium">
                Conectado a la API - Datos desde MongoDB
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards con diseño moderno */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Monto Total</p>
                <p className="text-3xl font-bold text-purple-600">${stats.totalAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Promedio</p>
                <p className="text-3xl font-bold text-orange-600">${stats.avgAmount?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros y Búsqueda</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <select
                value={`${filters.sortBy}_${filters.order}`}
                onChange={(e) => {
                  const [sortBy, order] = e.target.value.split('_');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('order', order);
                }}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="fechaEmision_desc">📅 Más recientes</option>
                <option value="fechaEmision_asc">📅 Más antiguos</option>
                <option value="numeroFactura_asc">🔢 Por número</option>
                <option value="cliente_asc">👤 Por cliente</option>
                <option value="total_desc">💰 Por monto ↓</option>
                <option value="total_asc">💰 Por monto ↑</option>
              </select>

              <select
                value={filters.testing}
                onChange={(e) => handleFilterChange('testing', e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">📋 Todas</option>
                <option value="true">🧪 Solo pruebas</option>
                <option value="false">🏛️ Solo oficiales</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">📊 Todos los estados</option>
                <option value="completed">✅ Completadas</option>
                <option value="pending">⏳ Pendientes</option>
                <option value="error">❌ Con error</option>
                <option value="cancelled">🚫 Canceladas</option>
              </select>

              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg font-medium">
              📄 {pagination.totalInvoices} factura{pagination.totalInvoices !== 1 ? 's' : ''} total{pagination.totalInvoices !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>

        {/* Tabla de facturas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Cargando facturas desde MongoDB...</p>
              </div>
            </div>
          )}

          {!loading && invoices.length === 0 && (
            <div className="p-16 text-center">
              <div className="text-gray-300 text-8xl mb-6">📄</div>
              <div className="text-2xl font-semibold text-gray-600 mb-3">
                {searchTerm || filters.testing !== '' || filters.status !== '' ? 'No se encontraron facturas' : 'No hay facturas disponibles'}
              </div>
              <div className="text-gray-500 mb-6">
                {searchTerm || filters.testing !== '' || filters.status !== ''
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Las facturas generadas aparecerán aquí'
                }
              </div>
            </div>
          )}

          {!loading && invoices.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Factura
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {invoices.map((invoice) => (
                      <tr key={invoice._id || invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                  Factura {invoice.tipo}
                                </span>
                                {invoice.testing && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    🧪 Test
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {invoice.numeroFactura}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                ID: {invoice._id || invoice.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {invoice.cliente}
                            </div>
                            {invoice.clientEmail && (
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                📧 {invoice.clientEmail}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.fechaEmisionFormatted}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-gray-900">
                            ${(invoice.total || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(invoice)}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {/* ✅ BOTÓN VER PDF CORREGIDO */}
                            <button
                              onClick={() => handleViewPDF(invoice)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                              title="Ver PDF en nueva ventana"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </button>
                            
                            {/* ✅ BOTÓN DESCARGAR PDF */}
                            <button
                              onClick={() => handleDownloadPDF(invoice)}
                              className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4" />
                              Descargar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage