// src/app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, Space_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VIGILAGT — Transparencia Política Guatemala',
  description: 'Plataforma ciudadana de transparencia política en Guatemala. Historial, casos, patrimonio y votaciones de políticos guatemaltecos.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${spaceMono.variable}`}>
      <body className="bg-[#0a0c0f] text-white antialiased">

        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 border-b border-[#1e2530] bg-[#0a0c0f]/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-mono text-xl font-black tracking-tight">
              <span className="text-[#1B3A6B]">VIGILA</span>
              <span className="text-white" style={{ WebkitTextStroke: '1px #1B3A6B' }}>GT</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/politicos" className="font-mono text-xs text-[#8a94a8] hover:text-white transition-colors uppercase tracking-wider">
                Directorio
              </Link>
              <Link href="/reportar" className="font-mono text-xs text-[#8a94a8] hover:text-white transition-colors uppercase tracking-wider">
                Reportar
              </Link>
            </div>
          </div>
        </nav>

        {/* CONTENIDO */}
        <main>{children}</main>

        {/* FOOTER */}
        <footer className="border-t border-[#1e2530] mt-20 py-12 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

              {/* Logo y descripción */}
              <div className="text-center md:text-left">
                <div className="font-mono text-lg font-black mb-1">
                  <span className="text-[#1B3A6B]">VIGILA</span>
                  <span className="text-white" style={{ WebkitTextStroke: '1px #1B3A6B' }}>GT</span>
                </div>
                <p className="font-mono text-xs text-[#3a4458]">
                  Iniciativa ciudadana independiente · Guatemala
                </p>
              </div>

              {/* Links */}
              <div className="flex items-center gap-6">
                <Link href="/politicos" className="font-mono text-xs text-[#3a4458] hover:text-[#5a6478] transition-colors">
                  Directorio
                </Link>
                <Link href="/reportar" className="font-mono text-xs text-[#3a4458] hover:text-[#5a6478] transition-colors">
                  Reportar
                </Link>
                <span className="text-[#1e2530]">·</span>
                <Link
                  href="/admin"
                  className="font-mono text-[10px] text-[#1e2530] hover:text-[#3a4458] transition-colors"
                  title="Acceso administrativo"
                >
                  ⚙
                </Link>
              </div>
            </div>

            <div className="border-t border-[#1e2530] mt-8 pt-8 text-center">
              <p className="font-mono text-[10px] text-[#2a3040]">
                Toda la información publicada proviene de fuentes públicas verificables. VIGILAGT no es responsable por el uso que terceros hagan de esta información.
              </p>
            </div>
          </div>
        </footer>

      </body>
    </html>
  )
}
