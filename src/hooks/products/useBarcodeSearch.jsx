// import { useState, useCallback } from 'react';

// function useBarcodeSearch() {
//   const [searchResult, setSearchResult] = useState(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchError, setSearchError] = useState(null);

//   const searchByBarcode = useCallback(async (barcode) => {
//     if (!barcode || barcode.trim() === '') {
//       setSearchError('El código de barras no puede estar vacío');
//       return null;
//     }

//     setIsSearching(true);
//     setSearchError(null);
//     setSearchResult(null);

//     try {
//       const token = localStorage.getItem('token');
      
//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await fetch(`http://localhost:3000/api/products/barcode/${barcode}`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 404) {
//           setSearchError('Producto no encontrado');
//         } else {
//           const errorData = await response.json();
//           setSearchError(errorData.msg || 'Error al buscar el producto');
//         }
//         return null;
//       }

//       const product = await response.json();
//       setSearchResult(product);
//       return product;
//     } catch (error) {
//       console.error('Error searching by barcode:', error);
//       setSearchError(error.message || 'Error de conexión');
//       return null;
//     } finally {
//       setIsSearching(false);
//     }
//   }, []);

//   const clearSearch = () => {
//     setSearchResult(null);
//     setSearchError(null);
//   };

//   return {
//     searchResult,
//     isSearching,
//     searchError,
//     searchByBarcode,
//     clearSearch
//   };
// }

// export default useBarcodeSearch;