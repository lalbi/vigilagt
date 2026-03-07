// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700', '900'],
})

export const metadata: Metadata = {
  title: 'VIGILAGT — Plataforma ciudadana de transparencia política',
  description: 'Seguimiento ciudadano de políticos guatemaltecos. Historial, casos de corrupción, votaciones y patrimonio en un solo lugar.',
  keywords: ['Guatemala', 'política', 'transparencia', 'corrupción', 'congreso', 'ciudadano'],
  openGraph: {
    title: 'VIGILAGT',
    description: 'El expediente público de la política guatemalteca.',
    locale: 'es_GT',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#0a0c0f] text-[#e8eaf0] antialiased">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

// ─── Navegación ───────────────────────────────────────────
function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2530] bg-[#0a0c0f]/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1B3A6B] flex items-center justify-center text-white font-bold text-sm rounded-sm">
            GT
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-[#1B3A6B]">VIG</span>
            <span className="text-white" style={{
              WebkitTextStroke: '1.5px #1B3A6B',
            }}>IL</span>
            <span className="text-[#1B3A6B]">AGT</span>
          </span>
        </a>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/politicos', label: 'Directorio' },
            { href: '/casos', label: 'Casos Activos' },
            { href: '/rankings', label: 'Rankings' },
            { href: '/reportar', label: 'Reportar' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="px-4 py-2 text-sm text-[#8a94a8] hover:text-white transition-colors rounded-md hover:bg-[#111318]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Status pill */}
        <div className="flex items-center gap-2 text-xs text-[#5a6478] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          Base de datos activa
        </div>
      </div>
    </header>
  )
}

// ─── Footer ───────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#1e2530] mt-24 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="font-bold text-lg mb-2">
              <span className="text-[#1B3A6B]">VIG</span>
              <span className="text-white" style={{ WebkitTextStroke: '1.5px #1B3A6B' }}>IL</span>
              <span className="text-[#1B3A6B]">AGT</span>
            </div>
            <p className="text-sm text-[#5a6478] max-w-xs">
              Plataforma ciudadana de transparencia política. Iniciativa independiente, sin filiación partidaria.
            </p>
          </div>
          <div className="text-xs text-[#5a6478] font-mono">
            <p>Solo publicamos información con fuente pública verificable.</p>
            <p className="mt-1">Guatemala · {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
