import React, { useState, useRef } from 'react';
import { Download, FileText, Receipt, Calculator } from 'lucide-react';

const InvoiceSystem = () => {
  const [invoiceData, setInvoiceData] = useState({
    type: 'A', // A, B, C
    number: '0001-00000001',
    date: new Date().toISOString().split('T')[0],
    client: {
      name: '',
      cuit: '',
      address: '',
      condition: 'Consumidor Final' // IVA Responsable Inscripto, Exento, etc.
    },
    items: [
      { description: 'Producto ejemplo', quantity: 1, price: 100, iva: 21 }
    ],
    paymentMethod: 'Efectivo'
  });

  const [companyData] = useState({
    name: 'CORRAFER',
    cuit: '20-12345678-9',
    address: 'Av. Savio 1940, Buenos Aires',
    phone: '(011) 4444-5555',
    email: 'info@miempresa.com.ar',
    iibb: '123-456789-0',
    startDate: '01/01/2020'
  });

  const [documentType, setDocumentType] = useState('factura'); // factura, presupuesto, ticket
  const invoiceRef = useRef();

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateIVA = () => {
    if (invoiceData.type === 'C') return 0; // Factura C no discrimina IVA
    return invoiceData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      return sum + (itemTotal * item.iva / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA();
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { description: '', quantity: 1, price: 0, iva: 21 }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = value;
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: newItems });
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    const content = invoiceRef.current.innerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${invoiceData.type} - ${invoiceData.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { border: 2px solid #000; padding: 10px; margin-bottom: 20px; }
            .company-info { text-align: center; }
            .invoice-type { 
              display: inline-block; 
              border: 2px solid #000; 
              width: 40px; 
              height: 40px; 
              text-align: center; 
              line-height: 36px; 
              font-size: 24px; 
              font-weight: bold; 
              margin: 10px;
            }
            .client-info { border: 1px solid #000; padding: 10px; margin: 10px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items-table th { background-color: #f0f0f0; }
            .totals { text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; border-top: 1px solid #000; padding-top: 20px; }
            @media print { 
              button { display: none; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${content}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getDocumentTitle = () => {
    switch(documentType) {
      case 'factura': return `FACTURA ${invoiceData.type}`;
      case 'presupuesto': return 'PRESUPUESTO';
      case 'ticket': return 'TICKET';
      default: return 'DOCUMENTO';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Panel de Control */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Sistema de Facturación</h2>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label>Tipo de Documento:</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="factura">Factura</option>
              <option value="presupuesto">Presupuesto</option>
              <option value="ticket">Ticket</option>
            </select>
          </div>
          
          {documentType === 'factura' && (
            <div>
              <label>Tipo de Factura:</label>
              <select 
                value={invoiceData.type} 
                onChange={(e) => setInvoiceData({...invoiceData, type: e.target.value})}
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value="A">Factura A</option>
                <option value="B">Factura B</option>
                <option value="C">Factura C</option>
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Datos del Cliente</h3>
            <input
              type="text"
              placeholder="Nombre/Razón Social"
              value={invoiceData.client.name}
              onChange={(e) => setInvoiceData({
                ...invoiceData, 
                client: {...invoiceData.client, name: e.target.value}
              })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="CUIT/DNI"
              value={invoiceData.client.cuit}
              onChange={(e) => setInvoiceData({
                ...invoiceData, 
                client: {...invoiceData.client, cuit: e.target.value}
              })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="text"
              placeholder="Dirección"
              value={invoiceData.client.address}
              onChange={(e) => setInvoiceData({
                ...invoiceData, 
                client: {...invoiceData.client, address: e.target.value}
              })}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <select
              value={invoiceData.client.condition}
              onChange={(e) => setInvoiceData({
                ...invoiceData, 
                client: {...invoiceData.client, condition: e.target.value}
              })}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="IVA Responsable Inscripto">IVA Responsable Inscripto</option>
              <option value="IVA Exento">IVA Exento</option>
              <option value="Monotributo">Monotributo</option>
            </select>
          </div>
          
          <div>
            <h3>Datos del Documento</h3>
            <input
              type="text"
              placeholder="Número"
              value={invoiceData.number}
              onChange={(e) => setInvoiceData({...invoiceData, number: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <input
              type="date"
              value={invoiceData.date}
              onChange={(e) => setInvoiceData({...invoiceData, date: e.target.value})}
              style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            />
            <select
              value={invoiceData.paymentMethod}
              onChange={(e) => setInvoiceData({...invoiceData, paymentMethod: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginTop: '20px' }}>
          <h3>Productos/Servicios</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#e9ecef' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Descripción</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Cantidad</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Precio</th>
                {documentType === 'factura' && invoiceData.type !== 'C' && (
                  <th style={{ border: '1px solid #ccc', padding: '8px' }}>IVA %</th>
                )}
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      style={{ width: '100%', border: 'none', padding: '4px' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', border: 'none', padding: '4px' }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', border: 'none', padding: '4px' }}
                    />
                  </td>
                  {documentType === 'factura' && invoiceData.type !== 'C' && (
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      <select
                        value={item.iva}
                        onChange={(e) => updateItem(index, 'iva', parseFloat(e.target.value))}
                        style={{ width: '100%', border: 'none', padding: '4px' }}
                      >
                        <option value={0}>0%</option>
                        <option value={10.5}>10.5%</option>
                        <option value={21}>21%</option>
                        <option value={27}>27%</option>
                      </select>
                    </td>
                  )}
                  <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    <button 
                      onClick={() => removeItem(index)}
                      style={{ 
                        backgroundColor: '#dc3545', 
                        color: 'white', 
                        border: 'none', 
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            onClick={addItem}
            style={{ 
              marginTop: '10px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Agregar Item
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button 
            onClick={generatePDF}
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginLeft: 'auto'
            }}
          >
            <Download size={20} />
            Generar e Imprimir {getDocumentTitle()}
          </button>
        </div>
      </div>

      {/* Vista Previa del Documento */}
      <div 
        ref={invoiceRef}
        style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          border: '1px solid #ccc',
          minHeight: '800px'
        }}
      >
        {/* Header */}
        <div style={{ 
          border: '2px solid #000', 
          padding: '20px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              {companyData.name}
            </div>
            <div>CUIT: {companyData.cuit}</div>
            <div>{companyData.address}</div>
            <div>Tel: {companyData.phone}</div>
            <div>Email: {companyData.email}</div>
            <div>Ingresos Brutos: {companyData.iibb}</div>
            <div>Inicio de Actividades: {companyData.startDate}</div>
          </div>
          
          <div style={{ 
            border: '2px solid #000', 
            width: '80px', 
            height: '80px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '0 20px'
          }}>
            {documentType === 'factura' ? invoiceData.type : 
             documentType === 'presupuesto' ? 'P' : 'T'}
          </div>
          
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
              {getDocumentTitle()}
            </div>
            <div>N° {invoiceData.number}</div>
            <div>Fecha: {new Date(invoiceData.date).toLocaleDateString('es-AR')}</div>
          </div>
        </div>

        {/* Cliente */}
        <div style={{ 
          border: '1px solid #000', 
          padding: '15px', 
          marginBottom: '20px' 
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>DATOS DEL CLIENTE:</div>
          <div>Nombre/Razón Social: {invoiceData.client.name}</div>
          <div>CUIT/DNI: {invoiceData.client.cuit}</div>
          <div>Dirección: {invoiceData.client.address}</div>
          <div>Condición IVA: {invoiceData.client.condition}</div>
        </div>

        {/* Items */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginBottom: '20px' 
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0' }}>
                Descripción
              </th>
              <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0' }}>
                Cantidad
              </th>
              <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0' }}>
                Precio Unit.
              </th>
              {documentType === 'factura' && invoiceData.type !== 'C' && (
                <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0' }}>
                  IVA %
                </th>
              )}
              <th style={{ border: '1px solid #000', padding: '10px', backgroundColor: '#f0f0f0' }}>
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #000', padding: '10px' }}>
                  {item.description}
                </td>
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                  {item.quantity}
                </td>
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>
                  ${item.price.toFixed(2)}
                </td>
                {documentType === 'factura' && invoiceData.type !== 'C' && (
                  <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                    {item.iva}%
                  </td>
                )}
                <td style={{ border: '1px solid #000', padding: '10px', textAlign: 'right' }}>
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div style={{ textAlign: 'right', marginBottom: '40px' }}>
          <div style={{ marginBottom: '5px' }}>
            <strong>Subtotal: ${calculateSubtotal().toFixed(2)}</strong>
          </div>
          {documentType === 'factura' && invoiceData.type !== 'C' && calculateIVA() > 0 && (
            <div style={{ marginBottom: '5px' }}>
              <strong>IVA: ${calculateIVA().toFixed(2)}</strong>
            </div>
          )}
          <div style={{ fontSize: '18px', marginTop: '10px' }}>
            <strong>TOTAL: ${calculateTotal().toFixed(2)}</strong>
          </div>
          <div style={{ marginTop: '10px' }}>
            <strong>Forma de Pago: {invoiceData.paymentMethod}</strong>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #000', 
          paddingTop: '20px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {documentType === 'presupuesto' && (
            <div style={{ marginBottom: '10px' }}>
              <strong>PRESUPUESTO VÁLIDO POR 30 DÍAS</strong>
            </div>
          )}
          {documentType === 'ticket' && (
            <div style={{ marginBottom: '10px' }}>
              <strong>DOCUMENTO NO VÁLIDO COMO FACTURA</strong>
            </div>
          )}
          <div>
            Este documento fue generado electrónicamente
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceSystem;