import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Escala Verbo',
  description: 'Gerenciamento de escalas para departamentos da igreja',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <header className="text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #534AB7 0%, #3d35a0 100%)' }}>
          <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-sm font-black" style={{ color: '#534AB7' }}>EV</span>
              </div>
              <div>
                <div className="font-bold text-base leading-tight">Escala Verbo</div>
                <div className="text-purple-200 text-xs leading-tight">Gestão de escalas</div>
              </div>
            </Link>
            <span className="text-purple-200 text-xs hidden sm:block italic">"Um só Senhor, uma só fé" — Ef 4:5</span>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
