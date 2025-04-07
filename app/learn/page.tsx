import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono p-8">
      <div className="absolute inset-0 bg-retro-grid z-0"></div>
      <div className="absolute inset-0 bg-retro-fade z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="mb-8 border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        <h1 className="text-4xl font-bold text-white mb-6 text-glow">Entendiendo la Esfera de Riemann</h1>

        <div className="space-y-6 text-slate-200">
          <section className="border border-slate-800 p-6 rounded-xl bg-slate-900/70">
            <h2 className="text-2xl font-bold text-cosmic-300 mb-4">¿Qué es la Esfera de Riemann?</h2>
            <p className="mb-4">
              La esfera de Riemann es una representación geométrica del plano complejo extendido: el plano complejo más
              un punto en el infinito. Permite visualizar los números complejos en la superficie de una esfera mediante
              proyección estereográfica.
            </p>
            <p>
              Nombrada en honor al matemático alemán Bernhard Riemann, esta construcción nos permite pensar en el
              infinito complejo como un solo punto, lo cual es una herramienta poderosa en el análisis complejo.
            </p>
          </section>

          <section className="border border-slate-800 p-6 rounded-xl bg-slate-900/70">
            <h2 className="text-2xl font-bold text-cosmic-300 mb-4">Proyección Estereográfica</h2>
            <p className="mb-4">
              La proyección estereográfica mapea puntos desde una esfera hacia un plano. Para la esfera de Riemann:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>El plano complejo se coloca tangente al polo sur de una esfera unitaria</li>
              <li>Cada punto en la esfera (excepto el polo norte) se proyecta en el plano</li>
              <li>El polo norte representa el punto en el infinito</li>
            </ul>
            <p>Esto crea una correspondencia uno a uno entre el plano complejo extendido y la esfera.</p>
          </section>

          <section className="border border-slate-800 p-6 rounded-xl bg-slate-900/70">
            <h2 className="text-2xl font-bold text-cosmic-300 mb-4">Formulación Matemática</h2>
            <p className="mb-4">
              Para un número complejo z = x + iy, el punto correspondiente en la esfera de Riemann tiene coordenadas:
            </p>
            <div className="bg-slate-800/50 p-4 rounded font-mono text-white mb-4">
              X = 2x / (1 + |z|²)
              <br />Y = 2y / (1 + |z|²)
              <br />Z = (|z|² - 1) / (|z|² + 1)
            </div>
            <p>
              De forma inversa, para un punto (X,Y,Z) en la esfera (excepto el polo norte), el número complejo
              correspondiente es:
            </p>
            <div className="bg-slate-800/50 p-4 rounded font-mono text-white">z = (X + iY) / (1 - Z)</div>
          </section>

          <section className="border border-slate-800 p-6 rounded-xl bg-slate-900/70">
            <h2 className="text-2xl font-bold text-cosmic-300 mb-4">Aplicaciones</h2>
            <p className="mb-4">La esfera de Riemann tiene numerosas aplicaciones en matemáticas y física:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Análisis complejo: estudiar el comportamiento de funciones cerca del infinito</li>
              <li>Mapeo conforme: preservación de ángulos en transformaciones geométricas</li>
              <li>Transformaciones de Möbius: que aparecen como rotaciones de la esfera</li>
              <li>Mecánica cuántica: representación de estados de espín de partículas</li>
              <li>Ingeniería eléctrica: adaptación de impedancia en gráficos de Smith</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
