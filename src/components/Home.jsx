

import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import CreateProducts from '../hooks/products/CreateProducts.jsx';
import { useNavigate } from 'react-router-dom';


function Home() {

  const { isAuthenticated, logout } = useAuth()

  const nav = useNavigate();

  useEffect(() =>{
    if(isAuthenticated === false) {
      nav("/");
    }

  },[isAuthenticated, nav])

  const handleLogout = () => {
    logout()
  }
    
  return (
    <>
    <button onClick={handleLogout}>Logout</button>
    <CreateProducts />
    
    </>
  )
}

export default Home