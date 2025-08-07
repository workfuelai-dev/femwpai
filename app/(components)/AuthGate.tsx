"use client"
import { useEffect, useState } from 'react'

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  const defaultUser = (process.env.NEXT_PUBLIC_BASIC_USER ?? 'FEM2025')
  const defaultPass = (process.env.NEXT_PUBLIC_BASIC_PASS ?? 'FEM8infinito')

  useEffect(() => {
    const t = localStorage.getItem('auth-ok')
    if (t === '1') setOk(true)
  }, [])

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-xs border rounded-lg p-4">
          <div className="text-sm font-medium mb-2">Acceso</div>
          <input
            placeholder="Usuario"
            className="w-full border rounded px-2 py-1 mb-2 bg-transparent"
            value={user}
            onChange={e=>setUser(e.target.value)}
          />
          <input
            placeholder="Contraseña"
            className="w-full border rounded px-2 py-1 mb-3 bg-transparent"
            type="password"
            value={pass}
            onChange={e=>setPass(e.target.value)}
          />
          <button
            className="w-full bg-brand text-white rounded px-3 py-2"
            onClick={() => {
              if (user.trim() === defaultUser && pass.trim() === defaultPass) {
                localStorage.setItem('auth-ok','1')
                setOk(true)
              } else {
                alert('Credenciales inválidas')
              }
            }}
          >Entrar</button>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 