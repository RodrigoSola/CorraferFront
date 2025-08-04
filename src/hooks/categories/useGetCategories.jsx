import {  useEffect, useState } from 'react'

function useGetCategories() {

    const [ categories, setCategories ] = useState([])
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        const fetchCategories = async () => {
     try {
       
        const response = await fetch("http://localhost:3000/api/categories", {
            "method" : "GET",
            "headers": {
                "content-type": "application/json",
        
            }
            
        })
        if(response.ok){
                const data = await response.json()
                setCategories(data)
            }else{
                setError("Error al cargar las categorías")
            }
     } catch (err) {
        setError("Error de conexion")
        console.error(err)
     }finally{
        setLoading(false)
     }
        
     }  
     fetchCategories() 
    }, [])
  return (
    {categories, loading, error}
  )
}

export default useGetCategories