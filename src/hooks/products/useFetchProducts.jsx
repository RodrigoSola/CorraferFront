import { useCallback, useState } from "react";

function useFetchProducts() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [done, setDone] = useState();

  const initialUrl = "http://localhost:3000/api/products/get";

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setDone(false);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }
      console.log("Token:", token); 
      const response = await fetch(initialUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
         const errorResponse = await response.json(); // Obtener el mensaje de error del servidor
        console.error("Error:", errorResponse); 
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data || []);
      setDone(true);
      return data;
    } catch (err) {
      setError(err.message);
      setProducts([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    setDone(false);
    return fetchProducts();
  }, [fetchProducts]);

    // Add function to optimistically add a product to the list
  const addProduct = useCallback((newProduct) => {
    setProducts(prev => [...prev, newProduct]);
  }, []);

  // Add function to remove a product from the list
  const removeProduct = useCallback((productId) => {
    setProducts(prev => prev.filter(product => product._id !== productId));
  }, []);

  return { products, fetchProducts, addProduct, removeProduct, refetch, isLoading, error, done };
}

export default useFetchProducts;
