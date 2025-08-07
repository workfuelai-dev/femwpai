"use client"
import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header() {
  const [dark, setDark] = useState(false)
  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
      <div className="font-semibold">femwpai</div>
      <div className="flex items-center gap-2">
        <button onClick={()=>setDark(v=>!v)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
          {dark ? <Sun size={16}/> : <Moon size={16}/>}
        </button>
      </div>
    </header>
  )
} 