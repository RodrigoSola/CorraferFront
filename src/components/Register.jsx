import { useState } from "react"
import useRegisterUser from "../hooks/user/useRegisterUser.jsx";
import { useNavigate } from "react-router-dom";



function Register() {

   

    const [form, setForm] = useState({
        email:"",
        password:""
    })

    const navigate = useNavigate();

  const { registerUser, error } = useRegisterUser();

    const handleRegister = async (e) => {
        e.preventDefault();
        const response = await registerUser(form);
        console.log("Register success");
        if(response){
          navigate("/")
        }
    }
  return (
    <section>
        <h1>Register</h1>
        <br />
        <form  onSubmit={handleRegister}>
            <label htmlFor="email">Email: </label>
            <input type="email" name="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            <br />
            <label htmlFor="password">Password: </label>
            <input type="password" name="password"  value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
            <br />
            {error && <p style={{color: 'red'}}>Error: {error}</p>}
           <button type="submit">Register</button>

        </form>
    </section>
  )
}

export default Register