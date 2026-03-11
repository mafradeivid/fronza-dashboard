"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [senha,setSenha] = useState("")
  const [erro,setErro] = useState("")
  const [mostrarSenha,setMostrarSenha] = useState(false)
  const [loading,setLoading] = useState(false)

  function login(){

    setErro("")
    setLoading(true)

    setTimeout(()=>{

      if(email === "tophaus@orbit.com" && senha === "Orbit2025"){

        localStorage.setItem("auth","true")
        router.push("/")

      }else{

        setErro("Email ou senha inválidos")
        setLoading(false)

      }

    },600)

  }

  function handleKey(e:React.KeyboardEvent){

    if(e.key === "Enter"){
      login()
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
    width:460,
    background:"#000",
    padding:60,
    borderRadius:14,
    color:"#fff",
    textAlign:"center",
    boxShadow:"0 15px 40px rgba(0,0,0,0.25)",
    animation:"fade 0.5s ease"
  }}>

  <div style={{
  display:"flex",
  justifyContent:"center",
  marginBottom:35
}}>
  <Image
    src="/logo.png"
    alt="Logo Top Haus"
    width={170}
    height={170}
  />
</div>

 

  {/* EMAIL */}

  <div style={{textAlign:"left", marginBottom:16}}>

    <label style={{fontSize:13, color:"#ccc"}}>E-mail</label>

    <input
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
      placeholder="Digite seu e-mail"
      onKeyDown={handleKey}
      style={{
        width:"100%",
        padding:12,
        marginTop:6,
        borderRadius:6,
        border:"1px solid #444",
        background:"#111",
        color:"#fff",
        outline:"none"
      }}
    />

  </div>

  {/* SENHA */}

  <div style={{textAlign:"left"}}>

    <label style={{fontSize:13, color:"#ccc"}}>Senha</label>

    <div style={{position:"relative"}}>

      <input
        type={mostrarSenha ? "text" : "password"}
        value={senha}
        onChange={(e)=>setSenha(e.target.value)}
        placeholder="Digite sua senha"
        onKeyDown={handleKey}
        style={{
          width:"100%",
          padding:12,
          marginTop:6,
          borderRadius:6,
          border:"1px solid #444",
          background:"#111",
          color:"#fff",
          outline:"none"
        }}
      />

      <button
        type="button"
        onClick={()=>setMostrarSenha(!mostrarSenha)}
        style={{
          position:"absolute",
          right:8,
          top:10,
          fontSize:12,
          background:"transparent",
          border:"none",
          color:"#aaa",
          cursor:"pointer"
        }}
      >
        {mostrarSenha ? "Ocultar" : "Ver"}
      </button>

    </div>

  </div>

  {/* BOTÃO */}

  <button
    onClick={login}
    disabled={loading}
    style={{
      width:"100%",
      padding:14,
      marginTop:26,
      borderRadius:8,
      border:"none",
      background: loading ? "#666" : "#2563eb",
      color:"#fff",
      fontWeight:600,
      fontSize:15,
      cursor:"pointer",
      transition:"0.2s"
    }}
  >
    {loading ? "Entrando..." : "Entrar"}
  </button>

  {erro && (
    <p style={{
      color:"#ff6b6b",
      marginTop:14,
      fontSize:14
    }}>
      {erro}
    </p>
  )}

  </div>

  <style>
  {`
    @keyframes fade {
      from {
        opacity:0;
        transform:translateY(10px);
      }
      to {
        opacity:1;
        transform:translateY(0);
      }
    }
  `}
  </style>

  </div>

  )

}