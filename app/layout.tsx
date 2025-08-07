import './globals.css'
import type { Metadata } from 'next'
import AuthGate from './(components)/AuthGate'

export const metadata: Metadata = {
  title: 'femwpai - Chat AI + WhatsApp',
  description: 'Chat de clientes con IA integrado y WhatsApp Business API',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full antialiased">
        <AuthGate>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </AuthGate>
      </body>
    </html>
  )
} 