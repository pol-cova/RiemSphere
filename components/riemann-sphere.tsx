"use client"

import { useRef, useEffect, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

export default function RiemannSphere() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || !containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 3

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    const ambientLight = new THREE.AmbientLight(0x333333)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x6b6bff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
      emissive: 0x6b6bff,
      emissiveIntensity: 0.1,
    })
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
    scene.add(sphere)

    const equatorGeometry = new THREE.TorusGeometry(1, 0.01, 16, 100)
    const equatorMaterial = new THREE.MeshBasicMaterial({ color: 0x6b6bff })
    const equator = new THREE.Mesh(equatorGeometry, equatorMaterial)
    equator.rotation.x = Math.PI / 2
    scene.add(equator)

    const planeGeometry = new THREE.CircleGeometry(1, 32)
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9000,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      wireframe: true,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.position.y = 0
    scene.add(plane)

    const axesHelper = new THREE.AxesHelper(1.5)
    scene.add(axesHelper)

    const gridHelper = new THREE.GridHelper(2, 20, 0x444444, 0x444444)
    gridHelper.rotation.x = Math.PI / 2
    scene.add(gridHelper)

    const pointGeometry = new THREE.SphereGeometry(0.03, 16, 16)
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

    const complexPoints = [
      { re: 1, im: 0 },
      { re: 0, im: 1 },
      { re: -1, im: 0 },
      { re: 0, im: -1 },
      { re: 0.5, im: 0.5 },
      { re: -0.5, im: 0.5 },
    ]

    complexPoints.forEach((point) => {
      // Stereographic projection formula
      const denom = 1 + point.re * point.re + point.im * point.im
      const x = (2 * point.re) / denom
      const y = (2 * point.im) / denom
      const z = (-1 + point.re * point.re + point.im * point.im) / denom

      const spherePoint = new THREE.Mesh(pointGeometry, pointMaterial)
      spherePoint.position.set(x, y, z)
      scene.add(spherePoint)

      // Also add a point on the complex plane
      const planePoint = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ color: 0xff9000 })) // Orange
      planePoint.position.set(point.re, 0, point.im)
      scene.add(planePoint)

      // Connect the points with a line
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x6b6bff, transparent: true, opacity: 0.5 }) // Cosmic-500
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(point.re, 0, point.im),
      ])
      const line = new THREE.Line(lineGeometry, lineMaterial)
      scene.add(line)
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)

      sphere.rotation.y += 0.001
      equator.rotation.y += 0.001

      controls.update()
      renderer.render(scene, camera)
    }

    animate()
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [isMounted])

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-slate-950 flex items-center justify-center">
        <div className="text-cosmic-300 animate-pulse">Loading visualization...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-950">
    </div>
  )
}