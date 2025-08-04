
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Products from './Products';
import CreateProducts from './CreateProducts';
import BarcodeInput from './BarcodeInput';
import Cart from './Cart';
import useCart from './useCart';

function AppHome() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const { addToCart, getCartCount } = useCart();

  const handleProductFound = (product) => {
    // Mostrar notificación cuando se encuentra un producto
    setNotification(`Producto encontrado: ${product.name}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleAddToCart = (product, quantity) => {
    addToCart(product, quantity);
    setNotification(`${product.name} agregado al carrito (${quantity} unidad${quantity > 1 ? 'es' : ''})`);
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#343a40',
          color: 'white',
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ margin: 0 }}>Sistema de Productos</h1>
          
          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
              Productos
            </Link>
            <Link to="/create" style={{ color: 'white', textDecoration: 'none' }}>
              Crear Producto
            </Link>
            <Link to="/scanner" style={{ color: 'white', textDecoration: 'none' }}>
              Escáner
            </Link>
            
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🛒 Carrito
              {getCartCount() > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {getCartCount()}
                </span>
              )}
            </button>
          </nav>
        </header>

        {/* Notification */}
        {notification && (
          <div style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {notification}
          </div>
        )}

        {/* Main Content */}
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/create" element={<CreateProducts />} />
            <Route path="/scanner" element={
              <div>
                <h2>Escáner de Productos</h2>
                <BarcodeInput
                  onProductFound={handleProductFound}
                  onAddToCart={handleAddToCart}
                />
              </div>
            } />
          </Routes>
        </main>

        {/* Cart Modal */}
        <Cart 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
        />
      </div>
    </Router>
  );
}

export default AppHome;