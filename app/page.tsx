"use client";
import Link from "next/link"
import { Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

const RiemannSphere = dynamic(() => import("@/components/riemann-sphere"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-cosmic-300 animate-pulse">Loading visualization...</div>
    </div>
  )
})

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono overflow-hidden relative">
      <div className="absolute inset-0 bg-retro-grid z-0"></div>
      <div className="absolute inset-0 bg-retro-fade z-0"></div>
      <nav className="relative z-10 flex items-center justify-between p-4 border-b border-slate-800/80 backdrop-blur-sm">
        <div className="text-2xl font-bold tracking-widest text-white">
          <span className="text-cosmic-400">Riem</span>Sphere
        </div>
        <Link href="https://github.com/pol-cova" target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            size="icon"
            className="border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </Button>
        </Link>
      </nav>

      <div className="relative z-10 flex flex-col md:flex-row h-[calc(100vh-73px)]">
        <div className="w-full md:w-1/3 p-8 flex flex-col justify-center items-center md:items-start space-y-8">
        <div className="space-y-2 max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight text-glow">
              Explora la
              <br />
              Esfera de Riemann
            </h1>
            <p className="text-slate-300 leading-relaxed">
              Visualiza números complejos en una esfera utilizando la proyección estereográfica, conectando el plano
              complejo con la geometría de una esfera.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
          <Link href="/play">
              <Button
                className="flex-1 bg-cosmic-600 hover:bg-cosmic-500 text-white font-bold border border-cosmic-400 shadow-[0_0_15px_rgba(107,107,255,0.5)] rounded-xl"
                size="lg"
              >
                JUGAR
              </Button>
            </Link>
            <Link href="/learn">
              <Button
                variant="outline"
                className="flex-1 border-cosmic-700 hover:bg-cosmic-900/50 text-white font-bold rounded-xl"
                size="lg"
              >
                APRENDER
              </Button>
            </Link>
          </div>

          <div className="text-xs text-slate-300 border border-slate-800 p-3 rounded bg-slate-900/70 max-w-md rounded-xl">
            <div className="font-bold mb-1 text-cosmic-300">TERMINAL // SYSTEM INFO</div>
            <div>
              COMPLEX PLANE MAPPING: <span className="text-cosmic-300">ACTIVE</span>
            </div>
            <div>
              STEREOGRAPHIC PROJECTION: <span className="text-cosmic-300">ENABLED</span>
            </div>
            <div>
              COORDINATE SYSTEM: <span className="text-cosmic-300">SPHERICAL</span>
            </div>
          </div>
        </div>
        <div className="w-full md:w-2/3 h-[50vh] md:h-full relative">
          <RiemannSphere />
          <div className="absolute bottom-4 right-4 text-xs text-slate-400 border border-slate-800 p-2 rounded bg-slate-900/70">
            © 2025 RiemSphere v1.0.0
          </div>
        </div>
      </div>
    </main>
  )
}