import { useState } from "react";

function useUpdateProduct() {
  const [err, setError] = useState();

 const updateProduct = async (id, updatedProduct) => {
    const initialURL = "http://localhost:3000/api/products/update/";
    const token = localStorage.getItem("token");
    setError(null);
  console.log("Token:", token);
  if (!token) {
      setError("Token no provisto. El usuario no está autenticado.");
      return false;
    }
    
    try {
      const response = await fetch(`${initialURL}${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProduct),
      });
      console.log("Response status:", response);
      if (response.ok) {
        return true;
      } else {
         const errorResponse = await response.json();
        setError(errorResponse.message || response.statusText);
        return false;
      }
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  return { updateProduct, err };
}

export default useUpdateProduct;
