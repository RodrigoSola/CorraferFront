import { useState } from "react";

function useLoginUser() {
  const [error, setError] = useState(null);
  const loginUser = async formData => {
    const initialUrl = "http://localhost:3000/api/users/login";
    try {
      setError(null); // Reset error state before making the request
      console.log ("Enviando datos:" ,formData);
      const response = await fetch(initialUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token") || "",
        },
        body: JSON.stringify(formData),
      });

      console.log("Respuesta del servidor:", response.status); // Debug
      if (response.ok) {
        const data = await response.json();
        console.log("Datos recibidos : ",data);
        
       if(data.token){
         localStorage.setItem("token", data.token);
         const token = localStorage.getItem("token");
         console.log("Token:", token);
         return true;
       }else{
        setError(data.msg || "Error al iniciar sesión");
        return false;
       }
        } else {
          let errorMessage

           try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || response.statusText;
                } catch {
                    errorMessage = response.statusText || `Error ${response.status}`;
                }
                
                console.log("Error del servidor:", errorMessage); // Debug
                setError(errorMessage);
                return false;
            }
        } catch (error) {
            console.error("Error en la petición:", error); // Debug
            setError(error.message || "Error de conexión con el servidor");
            return false;
        }
       
 
}
 return { loginUser, error };
}
export default useLoginUser;




