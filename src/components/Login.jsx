import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function Login() {
    const { login, error } = useAuth();
    const navigate = useNavigate();

         

    
    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    
    // Estado local para manejar errores del login
    const [errorLogin, setErrorLogin] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        // Limpiar errores previos
        setErrorLogin(null);
       
        
        try {
            const success = await login(form);
 
            if (success) {
                
                navigate("/home");
                
            } else {
                // Usar un mensaje de error por defecto si error es undefined
                const mensajeError = error || "El usuario y/o contraseña son incorrectos";
                setErrorLogin(mensajeError);
                console.error("Login falló:", mensajeError);
                
                // // Limpiar el formulario
                // setForm({
                //     email: "",
                //     password: ""
                // });
            }
        } catch (err) {
            // Manejar cualquier error inesperado
            const mensajeError = err.message || "Error inesperado durante el login";
            setErrorLogin(mensajeError);
            console.error("Error inesperado en login:", err);
            
            // Limpiar el formulario
            setForm({
                email: "",
                password: ""
            });
        }
    };

    const handleNoUser = () => {
        navigate("/register");
    };

    return (
        <section>
            <h1>Login</h1>
            <p>¿No tenes usuario? Crealo <span style={{color: "blue", cursor: 'pointer'}} onClick={handleNoUser}>aqui</span></p>
            <br />
            <form onSubmit={handleLogin}>
                <label htmlFor="email">Email: </label>
                <input 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    required
                />
                <br />
                <label htmlFor="password">Password: </label>
                <input 
                    type="password" 
                    name="password" 
                    value={form.password} 
                    onChange={e => setForm({...form, password: e.target.value})}
                    required
                />
                <br />
                <button type="submit">Login</button>
            </form>
            
            {/* Mostrar error local en lugar del error del contexto */}
            {errorLogin && <p style={{color: "red"}}>Error: {errorLogin}</p>}
            
            {/* También puedes mostrar el error del contexto si es necesario */}
            {error && !errorLogin && <p style={{color: "red"}}>Error: {error}</p>}
        </section>
    );
}

export default Login