import { useEffect, useState, createContext, useContext} from "react";
import useLoginUser from "../hooks/user/useLoginUser";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
const { loginUser, error } = useLoginUser();

const [isAuthenticated, setIsAuthenticated] = useState(()=> {
    return localStorage.getItem("token") ? true : false
}) ;

const login = async (formData) => {
    const success = await loginUser(formData);
    if(success){
        setIsAuthenticated(true);
        return true;
    }else{
        console.error(error)
        return false;
    }
}

const logout = () => {    
    localStorage.removeItem("token");
    setIsAuthenticated(false);
}

useEffect (() =>{
    if(!isAuthenticated){
        localStorage.removeItem("token");
    }
}, [isAuthenticated])

return (
    <AuthContext.Provider value ={{ isAuthenticated, login, logout, error }}>
        {children}
    </AuthContext.Provider>
)
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;