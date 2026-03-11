"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {

const router = useRouter()

const [email,setEmail] = useState("")
const [senha,setSenha] = useState("")
const [erro,setErro] = useState("")

function login(){

if(email === "tophaus@orbit.com" && senha === "Orbit2025"){

localStorage.setItem("auth","true")

router.push("/")

}else{

setErro("Email ou senha inválidos")

}

}

return(

<div style={{
height:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#e5e7eb"
}}>

<div style={{
width:380,
background:"black",
padding:40,
borderRadius:12,
color:"white",
textAlign:"center"
}}>

<img
src="/logo.png"
style={{width:120,marginBottom:20}}
/>

<h2 style={{marginBottom:20}}>
Bem-vindo ao Painel Financeiro do Top Haus
</h2>

<input
placeholder="E-mail"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{
width:"100%",
padding:10,
marginTop:10,
borderRadius:6,
border:"none"
}}
/>

<input
type="password"
placeholder="Senha"
value={senha}
onChange={(e)=>setSenha(e.target.value)}
style={{
width:"100%",
padding:10,
marginTop:10,
borderRadius:6,
border:"none"
}}
/>

<button
onClick={login}
style={{
width:"100%",
padding:12,
marginTop:20,
borderRadius:6,
border:"none",
background:"#e5e5e5"
}}
>
Entrar
</button>

<p style={{color:"red",marginTop:10}}>
{erro}
</p>

</div>

</div>

)

}