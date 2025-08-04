import { useState } from 'react'
import useCreateProduct from './useCreateProduct.jsx'
import useGetCategories from '../categories/useGetCategories.jsx'
import useFetchProducts from './useFetchProducts.jsx'
import Products from './Products.jsx' // Agregar import que faltaba
import { Link } from 'react-router-dom'

function CreateProducts() {
  const { createProduct, error: createError, isLoading: createLoading  } = useCreateProduct()
  const { categories } = useGetCategories()
  const { refetch: refetchProducts, products, addProduct } = useFetchProducts()
 

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    barcode: ""
  })
  
  const [submitError, setSubmitError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  

    const validateForm = () => {
    if (!form.name.trim()) {
      setSubmitError("El nombre del producto es requerido")
      return false
    }

    if (!form.name || !form.price || !form.stock || !form.category) {
      alert("Por favor, completa todos los campos");
      return  false;
    }

    if (Number(form.price) <= 0) {
      setSubmitError("El precio debe ser mayor a 0")
      return false
    }

    if (Number(form.stock) < 0) {
      setSubmitError("El stock no puede ser negativo")
      return false
    }
    // Validar código de barras si se proporciona
    if (form.barcode && !/^[0-9]{8}$|^[0-9]{12}$|^[0-9]{13}$|^[0-9]{14}$/.test(form.barcode)) {
      setSubmitError("El código de barras debe tener 8, 12, 13 o 14 dígitos")
      return false
    }


    return true
  }

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      stock: "",
      category: "",
      barcode: ""
    })
    setSubmitError("")
    setSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("=== INICIANDO CREACIÓN DE PRODUCTO ===")
    setSubmitError("")
    setSuccess(false)

    if (!validateForm()) {
      console.log("❌ Validación fallida")
      return
    }

    setIsSubmitting(true)
    console.log("✅ Validación exitosa, enviando datos...")

    try {
      const productData = {
        name: form.name.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        category: form.category,
        barcode: form.barcode
      }
      
      console.log("📤 Datos a enviar:", productData)
      
      // Crear el producto
      const response = await createProduct(productData)
      console.log("📥 Respuesta de createProduct:", response)

      if (response) {
        console.log("✅ Producto creado exitosamente!")
        
        // Opción 1: Agregar optimísticamente el producto a la lista
        if (response && response._id) {
          console.log("📝 Agregando producto a la lista optimísticamente")
          addProduct(response)
        }
        
        // Opción 2: Refetch para asegurar sincronización
        console.log("🔄 Refetching productos...")
        try {
          await refetchProducts()
          console.log("✅ Refetch completado")
        } catch (refetchError) {
          console.error("❌ Error en refetch:", refetchError)
        }

        // Resetear formulario y mostrar éxito
        resetForm()
        setSuccess(true)
        
        setTimeout(() => setSuccess(false), 3000)
        
      } else {
        console.log("❌ createProduct retornó false")
        setSubmitError(createError || "Error al crear el producto. Intenta nuevamente." )
      }
      
    } catch (error) {
      console.error("❌ Error inesperado:", error)
      setSubmitError("Error inesperado. Intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
      console.log("=== FINALIZADA CREACIÓN DE PRODUCTO ===")
    }
  }

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (submitError) setSubmitError("")
    if (success) setSuccess(false)
  }



  // Debug info
  console.log("🔍 Estado actual:", {
    isSubmitting,
    createLoading,
    createError,
    productsCount: products.length,
    formData: form
  })

  return (
    <section>
     
      <h2>Crear Producto</h2>
      <br />
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Product name:</label>
          <input 
            type="text" 
            name="name" 
            value={form.name} 
            onChange={e => handleInputChange('name', e.target.value)} 
            disabled={isSubmitting}
            required 
          />
        </div>

        <div>
          <label htmlFor="price">Price: $</label>
          <input 
            type="number" 
            name="price" 
            min="0" 
            step="0.01"
            value={form.price}  
            onChange={e => handleInputChange('price', e.target.value)}  
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="stock">Stock: </label>
          <input 
            type="number" 
            name="stock" 
            min="0" 
            value={form.stock} 
            onChange={e => handleInputChange('stock', e.target.value)} 
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label htmlFor="category">Categoria: </label>
          <select 
            name="category" 
            value={form.category} 
            onChange={e => handleInputChange('category', e.target.value)}
            disabled={isSubmitting}
            required
          >
            <option value="">Elije Categoria: </option>
            {categories && categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        
         <div>
          <label htmlFor="barcode">Código de Barras (opcional): </label>
          <input 
            type="text" 
            id="barcode"
            name="barcode" 
            value={form.barcode} 
            onChange={e => handleInputChange('barcode', e.target.value)}
            placeholder="8, 12, 13 o 14 dígitos"
            pattern="[0-9]{8}|[0-9]{12}|[0-9]{13}|[0-9]{14}"
            disabled={isSubmitting || createLoading}
          />
          <small className="text-gray-600 block mt-1">
            Formatos válidos: EAN-8 (8 dígitos), UPC-A (12 dígitos), EAN-13 (13 dígitos), ITF-14 (14 dígitos)
          </small>
        </div>

        {(submitError || createError) && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            {submitError || createError}
          </div>
        )}
        {success && (
          <div style={{ color: 'green', margin: '10px 0' }}>
            ✅ Producto creado exitosamente!
          </div>
        )}

       

        <button type="submit" disabled={isSubmitting || createLoading}>
          {isSubmitting ? 'Creando...' : 'Crear Producto'}
        </button>
      </form>
   
   
   <Link to="/products">Productos</Link>
   <br />
  <Link to= "/barcode">Buscar producto por codigo de barras</Link>
    </section>
  )
}

export default CreateProducts