
import { Link } from 'react-router-dom';
import '../css/Nav.css'; // Asegúrate de tener un archivo CSS para estilos
const Nav = () => {
    const handleLogout = () => {
        // Lógica para cerrar sesión
        console.log('Logout');
    };
    return (
        <nav className="navbar">
            <ul>
                <li>
                    <Link to="/products" className="nav-button">Productos</Link>
                </li>
                <li>
                    <Link to="/clients" className="nav-button">Clientes</Link>
                </li>
                <li>
                    <Link to="/invoices" className="nav-button">Facturas</Link>
                </li>
            </ul>
            <button onClick={handleLogout} className={`nav-button logout-button`}>Logout</button>
        </nav>
    );
};
export default Nav;