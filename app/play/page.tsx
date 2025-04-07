"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, RefreshCw } from "lucide-react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

export default function PlayPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [realPart, setRealPart] = useState(3)
  const [imagPart, setImagPart] = useState(3)
  const [animate, setAnimate] = useState(false)
  const [trace, setTrace] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(0.01)
  const [animationRadius, setAnimationRadius] = useState(1.5)
  const [animationAngle, setAnimationAngle] = useState(0)

  //  Use effect for mounted
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const container3DRef = useRef<HTMLDivElement>(null)
  const container2DRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const sphereRef = useRef<THREE.Mesh | null>(null)
  const pointOnSphereRef = useRef<THREE.Mesh | null>(null)
  const pointOnPlaneRef = useRef<THREE.Mesh | null>(null)
  const projectionLineRef = useRef<THREE.Line | null>(null)
  const trailPointsRef = useRef<THREE.Points | null>(null)
  const trailPositions = useRef<number[]>([])
  const animationRef = useRef<number | null>(null)
  const sphereLabelRef = useRef<THREE.Sprite | null>(null)

  // Initialize 2D canvas
  useEffect(() => {
    if (!isMounted || !container2DRef.current) return

    const draw2DPlane = () => {
      const canvas = container2DRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas dimensions
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      // Clear canvas
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Set background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Draw grid
      const gridSize = 1
      const gridExtent = 3
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const scale = Math.min(rect.width, rect.height) / (2 * gridExtent + 1)

      // Draw grid lines
      ctx.strokeStyle = "#334155"
      ctx.lineWidth = 1

      // Vertical grid lines
      for (let x = -gridExtent; x <= gridExtent; x++) {
        const posX = centerX + x * scale
        ctx.beginPath()
        ctx.moveTo(posX, 0)
        ctx.lineTo(posX, rect.height)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let y = -gridExtent; y <= gridExtent; y++) {
        const posY = centerY - y * scale
        ctx.beginPath()
        ctx.moveTo(0, posY)
        ctx.lineTo(rect.width, posY)
        ctx.stroke()
      }

      ctx.strokeStyle = "#f8fafc"
      ctx.lineWidth = 2

      // x-axis (Re)
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(rect.width, centerY)
      ctx.stroke()

      // y-axis (Im)
      ctx.beginPath()
      ctx.moveTo(centerX, 0)
      ctx.lineTo(centerX, rect.height)
      ctx.stroke()

      // Label axes
      ctx.font = "16px monospace"
      ctx.fillStyle = "#f8fafc"
      ctx.textAlign = "right"
      ctx.textBaseline = "top"
      ctx.fillText("Im", centerX - 10, 10)

      ctx.textAlign = "right"
      ctx.textBaseline = "top"
      ctx.fillText("Re", rect.width - 10, centerY + 10)

      // Draw grid numbers
      ctx.font = "12px monospace"
      ctx.fillStyle = "#94a3b8"

      // x-axis numbers
      for (let x = -gridExtent; x <= gridExtent; x++) {
        if (x === 0) continue 
        const posX = centerX + x * scale
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        ctx.fillText(x.toString(), posX, centerY + 5)
      }

      // y-axis numbers
      for (let y = -gridExtent; y <= gridExtent; y++) {
        if (y === 0) continue 
        const posY = centerY - y * scale
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        ctx.fillText(y + "i", centerX - 5, posY)
      }

      const pointX = centerX + realPart * scale
      const pointY = centerY - imagPart * scale

      if (trace) {
        const trailPoints = trailPositions.current
        for (let i = 0; i < trailPoints.length; i += 3) {
          const trailX = centerX + trailPoints[i] * scale
          const trailY = centerY - trailPoints[i + 1] * scale

          ctx.fillStyle = `rgba(0, 100, 255, ${0.3 + 0.7 * (i / trailPoints.length)})`
          ctx.beginPath()
          ctx.arc(trailX, trailY, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw point
      ctx.fillStyle = "#3b82f6"
      ctx.beginPath()
      ctx.arc(pointX, pointY, 8, 0, Math.PI * 2)
      ctx.fill()

      // Draw circle around point
      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(pointX, pointY, 12, 0, Math.PI * 2)
      ctx.stroke()

      // Label the point
      ctx.fillStyle = "#3b82f6"
      ctx.font = "bold 14px monospace"
      ctx.textAlign = "left"
      ctx.textBaseline = "bottom"
      ctx.fillText(`z = (${realPart.toFixed(1)}, ${imagPart.toFixed(1)})`, pointX + 15, pointY - 5)
    }

    draw2DPlane()

    const handleResize = () => {
      draw2DPlane()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [realPart, imagPart, trace, trailPositions, isMounted])

  // Function to create text labels
  const createTextLabel = (text: string, x: number, y: number, z: number, color: number) => {
    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d")
    if (!context) return new THREE.Object3D()

    canvas.width = 128
    canvas.height = 64

    context.fillStyle = `rgba(0, 0, 0, 0)`
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.font = `Bold ${Math.floor(canvas.width / 8)}px monospace`
    context.textAlign = "center"
    context.textBaseline = "middle"
    context.fillStyle = `#${color.toString(16).padStart(6, "0")}`
    context.fillText(text, canvas.width / 2, canvas.height / 2)

    const texture = new THREE.Texture(canvas)
    texture.needsUpdate = true

    const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(material)
    sprite.position.set(x, y, z)
    sprite.scale.set(0.5, 0.25, 1)

    return sprite
  }

  const createAxisIndicator = () => {
    const container = document.createElement("div")
    container.className = "absolute bottom-4 left-4 bg-slate-900/80 border border-slate-700 rounded p-2 text-xs"
    container.style.zIndex = "10"

    container.innerHTML = `
      <div class="font-bold mb-1 text-cosmic-300">GUIA DE EJES</div>
      <div class="flex items-center mb-1">
        <div class="w-3 h-3 bg-red-500 mr-2"></div>
        <span class="text-white">Eje rojo: Parte Real (x)</span>
      </div>
      <div class="flex items-center">
        <div class="w-3 h-3 bg-green-500 mr-2"></div>
        <span class="text-white">Eje verde: Parte imaginaria (z)</span>
      </div>
    `

    return container
  }

  useEffect(() => {
    if (!isMounted || !container3DRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      container3DRef.current.clientWidth / container3DRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.set(3, 2, 3)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(container3DRef.current.clientWidth, container3DRef.current.clientHeight)
    container3DRef.current.appendChild(renderer.domElement)

    if (container3DRef.current) {
      const axisIndicator = createAxisIndicator()
      container3DRef.current.appendChild(axisIndicator)
    }

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Create the Riemann sphere
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xadd8e6,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
      emissive: 0x6b6bff,
      emissiveIntensity: 0.1,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)
    sphereRef.current = sphere

    // Create the equator
    const equatorGeometry = new THREE.TorusGeometry(1, 0.01, 16, 100)
    const equatorMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const equator = new THREE.Mesh(equatorGeometry, equatorMaterial)
    equator.rotation.x = Math.PI / 2
    scene.add(equator)

    const planeGeometry = new THREE.PlaneGeometry(8, 8)
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.rotation.x = Math.PI / 2
    plane.position.y = 0 
    scene.add(plane)

    const gridHelper = new THREE.GridHelper(8, 16, 0x334155, 0x334155)
    gridHelper.position.y = 0.01
    scene.add(gridHelper)

    const axisLength = 4

    const realAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-axisLength, 0, 0),
      new THREE.Vector3(axisLength, 0, 0),
    ])
    const realAxisMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 })
    const realAxis = new THREE.Line(realAxisGeometry, realAxisMaterial)
    scene.add(realAxis)

    const realAxisArrow = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(axisLength - 0.5, 0, 0),
      0.5,
      0xff0000,
      0.2,
      0.1,
    )
    scene.add(realAxisArrow)

    const realLabel = createTextLabel("Re", axisLength, 0, 0, 0xff0000)
    scene.add(realLabel)

    const imagAxisGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -axisLength),
      new THREE.Vector3(0, 0, axisLength),
    ])
    const imagAxisMaterial = new THREE.LineBasicMaterial({ color: 0x00cc00 })
    const imagAxis = new THREE.Line(imagAxisGeometry, imagAxisMaterial)
    scene.add(imagAxis)

    const imagAxisArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, axisLength - 0.5),
      0.5,
      0x00cc00,
      0.2,
      0.1,
    )
    scene.add(imagAxisArrow)

    const imagLabel = createTextLabel("Im", 0, 0, axisLength, 0x00cc00)
    scene.add(imagLabel)

    const northPoleGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const northPoleMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 })
    const northPole = new THREE.Mesh(northPoleGeometry, northPoleMaterial)
    northPole.position.set(0, 1, 0)
    scene.add(northPole)

    const northPoleLabel = createTextLabel("N", 0, 1.2, 0, 0x444444)
    scene.add(northPoleLabel)

    const southPoleGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const southPoleMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 })
    const southPole = new THREE.Mesh(southPoleGeometry, southPoleMaterial)
    southPole.position.set(0, -1, 0)
    scene.add(southPole)

    const southPoleLabel = createTextLabel("S", 0, -1.2, 0, 0x444444)
    scene.add(southPoleLabel)

    const pointOnSphereGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const pointOnSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x9c27b0 })
    const pointOnSphere = new THREE.Mesh(pointOnSphereGeometry, pointOnSphereMaterial)
    scene.add(pointOnSphere)
    pointOnSphereRef.current = pointOnSphere

    const pointOnSphereLabel = createTextLabel("P(z)", 0, 0, 0, 0x9c27b0)
    scene.add(pointOnSphereLabel)
    pointOnSphereLabel.userData = { followTarget: pointOnSphere, offset: new THREE.Vector3(0.2, 0.2, 0.2) }
    sphereLabelRef.current = pointOnSphereLabel

    const pointOnPlaneGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    const pointOnPlaneMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 }) 
    const pointOnPlane = new THREE.Mesh(pointOnPlaneGeometry, pointOnPlaneMaterial)
    scene.add(pointOnPlane)
    pointOnPlaneRef.current = pointOnPlane

    const projectionLineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    const projectionLineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ])
    const projectionLine = new THREE.Line(projectionLineGeometry, projectionLineMaterial)
    scene.add(projectionLine)
    projectionLineRef.current = projectionLine

    const trailGeometry = new THREE.BufferGeometry()
    const trailMaterial = new THREE.PointsMaterial({
      color: 0x3b82f6,
      size: 0.03,
      sizeAttenuation: true,
    })
    const trail = new THREE.Points(trailGeometry, trailMaterial)
    scene.add(trail)
    trailPointsRef.current = trail

    updatePoint(realPart, imagPart)

    const animate = () => {
      requestAnimationFrame(animate)

      scene.traverse((object) => {
        if (object.userData && object.userData.followTarget) {
          const target = object.userData.followTarget
          const offset = object.userData.offset || new THREE.Vector3(0, 0, 0)
          object.position.copy(target.position).add(offset)
        }
      })

      controls.update()
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container3DRef.current) return

      camera.aspect = container3DRef.current.clientWidth / container3DRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(container3DRef.current.clientWidth, container3DRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (container3DRef.current) {
        container3DRef.current.removeChild(renderer.domElement)
      }
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isMounted])

  useEffect(() => {
    updatePoint(realPart, imagPart)
  }, [realPart, imagPart, trace])

  useEffect(() => {
    if (animate) {
      const animatePoints = () => {
        const newReal = animationRadius * Math.cos(animationAngle)
        const newImag = animationRadius * Math.sin(animationAngle)

        setRealPart(newReal)
        setImagPart(newImag)
        setAnimationAngle((prev) => prev + animationSpeed)

        animationRef.current = requestAnimationFrame(animatePoints)
      }

      animationRef.current = requestAnimationFrame(animatePoints)
    } else if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate, animationSpeed, animationRadius, animationAngle])

  const updatePoint = (real: number, imag: number) => {
    if (!pointOnSphereRef.current || !pointOnPlaneRef.current || !projectionLineRef.current || !trailPointsRef.current)
      return

    const planePosition = new THREE.Vector3(real, 0, imag)
    pointOnPlaneRef.current.position.copy(planePosition)

    const r2 = real * real + imag * imag

    if (r2 > 1000) {
      pointOnSphereRef.current.position.set(0, 1, 0)
    } else {
      const x = (2 * real) / (1 + r2)
      const y = (r2 - 1) / (r2 + 1)
      const z = (2 * imag) / (1 + r2)

      pointOnSphereRef.current.position.set(x, y, z)
    }

    const northPolePosition = new THREE.Vector3(0, 1, 0)
    const projectionLineGeometry = new THREE.BufferGeometry().setFromPoints([
      northPolePosition,
      pointOnSphereRef.current.position,
      planePosition,
    ])
    projectionLineRef.current.geometry.dispose()
    projectionLineRef.current.geometry = projectionLineGeometry

    if (trace) {
      trailPositions.current.push(real, imagPart, 0)

      const maxTrailPoints = 100
      if (trailPositions.current.length > maxTrailPoints * 3) {
        trailPositions.current = trailPositions.current.slice(-maxTrailPoints * 3)
      }

      const trailGeometry = new THREE.BufferGeometry()
      const positions = []
      for (let i = 0; i < trailPositions.current.length; i += 3) {
        positions.push(
          trailPositions.current[i],
          0,
          trailPositions.current[i + 1],
        )
      }
      trailGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
      trailPointsRef.current.geometry.dispose()
      trailPointsRef.current.geometry = trailGeometry
    }
  }

  const handleReset = () => {
    setRealPart(3)
    setImagPart(3)
    setAnimationAngle(0)
    trailPositions.current = []
    if (trailPointsRef.current) {
      const trailGeometry = new THREE.BufferGeometry()
      trailGeometry.setAttribute("position", new THREE.Float32BufferAttribute([], 3))
      trailPointsRef.current.geometry.dispose()
      trailPointsRef.current.geometry = trailGeometry
    }
  }

  const getSphereCoordinates = () => {
    const r2 = realPart * realPart + imagPart * imagPart

    return {
      x: (2 * realPart) / (1 + r2),
      y: (r2 - 1) / (1 + r2),
      z: (2 * imagPart) / (1 + r2),
    }
  }

  const sphereCoords = getSphereCoordinates()

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 font-mono overflow-hidden relative">
        <div className="absolute inset-0 bg-retro-grid z-0"></div>
        <div className="absolute inset-0 bg-retro-fade z-0"></div>
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-xl">Loading visualization...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-mono overflow-hidden relative">
      <div className="absolute inset-0 bg-retro-grid z-0"></div>
      <div className="absolute inset-0 bg-retro-fade z-0"></div>
      <div className="relative z-10 flex flex-col h-screen">
        <div className="p-4">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="w-fit border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
        <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
          <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div className="h-full w-full relative">
              <canvas ref={container2DRef} className="w-full h-full"></canvas>
            </div>
          </div>
          <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
            <div ref={container3DRef} className="w-full h-full"></div>
          </div>
        </div>
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-cosmic-300">Parte Real (x)</label>
                    <span className="text-sm text-white">{realPart.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[realPart]}
                    min={-3}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setRealPart(value[0])}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-cosmic-400 [&_[role=slider]]:border-cosmic-300"
                    disabled={animate}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm text-cosmic-300">Parte Imaginaria (y)</label>
                    <span className="text-sm text-white">{imagPart.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[imagPart]}
                    min={-3}
                    max={3}
                    step={0.1}
                    onValueChange={(value) => setImagPart(value[0])}
                    className="[&>span:first-child]:h-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-cosmic-400 [&_[role=slider]]:border-cosmic-300"
                    disabled={animate}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="animate"
                      checked={animate}
                      onCheckedChange={(checked) => setAnimate(checked === true)}
                      className="data-[state=checked]:bg-cosmic-600 data-[state=checked]:border-cosmic-600"
                    />
                    <label htmlFor="animate" className="text-sm text-white cursor-pointer">
                      Animate
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trace"
                      checked={trace}
                      onCheckedChange={(checked) => setTrace(checked === true)}
                      className="data-[state=checked]:bg-cosmic-600 data-[state=checked]:border-cosmic-600"
                    />
                    <label htmlFor="trace" className="text-sm text-white cursor-pointer">
                      Trace
                    </label>
                  </div>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 hover:bg-slate-800 text-white ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                {animate && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-cosmic-300">Animation Speed</label>
                      <span className="text-sm text-white">{animationSpeed.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[animationSpeed]}
                      min={0.001}
                      max={0.05}
                      step={0.001}
                      onValueChange={(value) => setAnimationSpeed(value[0])}
                      className="[&>span:first-child]:h-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-cosmic-400 [&_[role=slider]]:border-cosmic-300"
                    />
                  </div>
                )}
                {animate && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm text-cosmic-300">Radius</label>
                      <span className="text-sm text-white">{animationRadius.toFixed(2)}</span>
                    </div>
                    <Slider
                      value={[animationRadius]}
                      min={0.1}
                      max={3}
                      step={0.1}
                      onValueChange={(value) => setAnimationRadius(value[0])}
                      className="[&>span:first-child]:h-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-cosmic-400 [&_[role=slider]]:border-cosmic-300"
                    />
                  </div>
                )}
                <div className="text-xs text-slate-300 border border-slate-800 p-3 rounded bg-slate-900/70">
                  <div className="font-bold mb-1 text-cosmic-300">INFORMACION DEL NUMERO COMPLEJO</div>
                  <div>
                    z = {realPart.toFixed(2)} {imagPart >= 0 ? "+" : ""} {imagPart.toFixed(2)}i
                  </div>
                  <div>|z| = {Math.sqrt(realPart * realPart + imagPart * imagPart).toFixed(4)}</div>
                  <div>arg(z) = {Math.atan2(imagPart, realPart).toFixed(4)} rad</div>
                  <div className="mt-1 pt-1 border-t border-slate-800">
                    <div className="font-bold text-cosmic-300">COORDENADAS DE LA ESFERA</div>
                    <div>X = {sphereCoords.x.toFixed(4)}</div>
                    <div>Y = {sphereCoords.y.toFixed(4)}</div>
                    <div>Z = {sphereCoords.z.toFixed(4)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

