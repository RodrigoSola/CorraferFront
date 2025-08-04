import { useState } from 'react'

const statusEnum = ["disponible","alquilado"]
const sizeEnum= ["pequeño", "grande"]
function CreateDumpster() {

      const [form, setForm] = useState({
              name: "",
              size: 0,
              status: 0,
              currentRental: null
            })
  return (
    <section>
        <h2>Crear Producto</h2>
        <br />
        <form >



            <div>
            <label htmlFor="name">Nombre: </label>
            <input type="name" name="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div>
            <label htmlFor="size">Tamaño: </label>
            <select name="size" value={form.size} onChange={e => setForm({...form, size: e.target.value})} required >
                <option value="" disable>Elije tamaño: </option>
                {sizeEnum.map(size => (
                    <option key={size} value={size}>{size.toLowerCase()}</option>
                ))}
            </select>
            </div>


            <div>
            <label htmlFor="status">Estado: </label>
            
            <select name="status" value={form.status} onChange={e => setForm({...form, category: e.target.value})} required >
                <option value="" disable>Elije estado: </option>
                {statusEnum.map(status => (
                    <option key={status} value={status}>{status.toLowerCase()}</option>
                ))}
            </select>
            </div>

            <button type="submit">Crear Volquete</button>



        </form>
    </section>
  )
}

export default CreateDumpster