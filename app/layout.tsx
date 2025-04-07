import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { VT323 } from "next/font/google"

// Load VT323 font using Next.js font system
const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-vt323",
})

export const metadata: Metadata = {
  title: "RiemSphere - Visualización de la Esfera de Riemann | Matemáticas Complejas",
  description: "Explora la proyección estereográfica y visualiza números complejos en una esfera de Riemann con esta herramienta interactiva. Aprende conceptos matemáticos avanzados de forma visual e intuitiva.",
  keywords: ["esfera de riemann", "números complejos", "proyección estereográfica", "visualización matemática", "análisis complejo", "matemáticas interactivas"],
  authors: [{ name: "RiemSphere" }],
  openGraph: {
    title: "RiemSphere - Visualización de la Esfera de Riemann",
    description: "Explora la proyección estereográfica y visualiza números complejos en una esfera de Riemann con esta herramienta interactiva.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={vt323.variable}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

