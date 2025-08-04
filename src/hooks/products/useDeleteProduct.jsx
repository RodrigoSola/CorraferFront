import { useState } from "react";

function useDeleteProduct() {
  const [err, setError] = useState();

 const deleteProduct = async (id) => {
    const initialURL = "http://localhost:3000/api/products/delete/";
    const token = localStorage.getItem("token");
    setError(null);
  console.log("Token:", token);
  if (!token) {
      setError("Token no provisto. El usuario no está autenticado.");
      return false;
    }
    console.log("Token:", token); // Verifica el token
    try {
      const response = await fetch(`${initialURL}${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  return { deleteProduct, err };
}

export default useDeleteProduct;
