import { useState } from "react";

function useCreateProduct() {
  const [error, setError] = useState();
  const [ isLoading, setIsLoading ] = useState(false)
  const initialUrl = "http://localhost:3000/api/products/create";
  const createProduct = async (formData) => {
    setIsLoading(true)
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log(token);
      const response = await fetch(initialUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(formData),
      });
        console.log(response);
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.msg || errorData.message || response.statusText;
        setError(errorMessage);
        console.log("Error Data:", errorData);
        return false;
      }
      const createProduct = await response.json()
      console.log("Producto creado:", createProduct);
      return createProduct
    } catch (error) {
      console.error("Error en createProduct", error);
      setError(error.message || "Error al crear el producto. Intenta nuevamente."  );
      return false;
    }finally{
      setIsLoading(false)
    }
  };
  return { createProduct, isLoading, error };
}

export default useCreateProduct;
