import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import './PackageScene.css'

// Wooden Shipping Pallet Component
function Pallet() {
  const woodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#8A5E38',
        roughness: 0.9,
        metalness: 0.05,
      }),
    []
  )

  const darkWoodMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#6B4423',
        roughness: 0.95,
        metalness: 0.05,
      }),
    []
  )

  return (
    <group position={[0, -1.05, 0]}>
      {/* Top Deck Slats (5 slats with realistic warehouse gaps) */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((z, i) => (
        <mesh key={`top-${i}`} position={[0, 0.12, z]} castShadow receiveShadow material={woodMaterial}>
          <boxGeometry args={[2.4, 0.04, 0.28]} />
        </mesh>
      ))}

      {/* 3 Forklift Stringer Runners / Spacer Blocks */}
      {[-0.95, 0, 0.95].map((x, i) => (
        <group key={`runner-${i}`} position={[x, 0.04, 0]}>
          <mesh castShadow receiveShadow material={darkWoodMaterial}>
            <boxGeometry args={[0.12, 0.12, 2.0]} />
          </mesh>
        </group>
      ))}

      {/* Bottom Skids */}
      {[-0.8, 0, 0.8].map((z, i) => (
        <mesh key={`bot-${i}`} position={[0, -0.04, z]} receiveShadow material={darkWoodMaterial}>
          <boxGeometry args={[2.4, 0.03, 0.24]} />
        </mesh>
      ))}
    </group>
  )
}

// Heavy Industrial Wooden Cargo Crate (Peti Kayu Berat)
function WoodenCrate() {
  const crateWood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#5A3D28',
        roughness: 0.88,
        metalness: 0.02,
      }),
    []
  )

  const frameWood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#462E1C',
        roughness: 0.92,
        metalness: 0.05,
      }),
    []
  )

  const steelCorner = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2A2A2A',
        roughness: 0.4,
        metalness: 0.85,
      }),
    []
  )

  const stencilMaterial = useMemo(() => {
    // Generate a procedural canvas texture for stenciled cargo markings
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#5A3D28'
      ctx.fillRect(0, 0, 512, 256)
      
      // Black stenciled text
      ctx.fillStyle = 'rgba(28, 28, 28, 0.92)'
      ctx.font = 'bold 36px "Courier New", monospace'
      ctx.fillText('KURBHAN LOGISTICS', 30, 60)
      ctx.font = 'bold 24px monospace'
      ctx.fillText('MANIFEST: KB-CRATE-09', 30, 105)
      ctx.fillText('CARGO CLASS: HEAVY / TRONTON', 30, 140)
      
      // Warning Stencil
      ctx.strokeStyle = '#C62828'
      ctx.lineWidth = 4
      ctx.strokeRect(30, 165, 200, 50)
      ctx.fillStyle = '#C62828'
      ctx.font = 'bold 22px monospace'
      ctx.fillText('▲ THIS SIDE UP ▲', 40, 198)

      // Barcode graphic
      ctx.fillStyle = '#1C1C1C'
      for (let i = 270; i < 480; i += 7) {
        const w = (i % 3 === 0) ? 4 : 2
        ctx.fillRect(i, 165, w, 45)
      }
    }
    const texture = new THREE.CanvasTexture(canvas)
    return new THREE.MeshBasicMaterial({ map: texture, transparent: true })
  }, [])

  return (
    <group position={[-0.15, -0.3, 0]}>
      {/* Main Solid Wooden Box */}
      <mesh castShadow receiveShadow material={crateWood}>
        <boxGeometry args={[1.5, 1.2, 1.4]} />
      </mesh>

      {/* Frame Battens / Wooden Reinforcement Struts */}
      {/* Top and Bottom Horizontal Battens */}
      <mesh position={[0, 0.58, 0.71]} castShadow material={frameWood}>
        <boxGeometry args={[1.52, 0.08, 0.04]} />
      </mesh>
      <mesh position={[0, -0.58, 0.71]} castShadow material={frameWood}>
        <boxGeometry args={[1.52, 0.08, 0.04]} />
      </mesh>
      {/* Left and Right Vertical Battens */}
      <mesh position={[-0.72, 0, 0.71]} castShadow material={frameWood}>
        <boxGeometry args={[0.08, 1.22, 0.04]} />
      </mesh>
      <mesh position={[0.72, 0, 0.71]} castShadow material={frameWood}>
        <boxGeometry args={[0.08, 1.22, 0.04]} />
      </mesh>
      {/* Diagonal Cargo Cross-Brace */}
      <mesh position={[0, 0, 0.715]} rotation={[0, 0, Math.PI / 4.8]} castShadow material={frameWood}>
        <boxGeometry args={[1.7, 0.06, 0.03]} />
      </mesh>

      {/* Steel Corner Angles */}
      {[
        [-0.74, 0.58, 0.7],
        [0.74, 0.58, 0.7],
        [-0.74, -0.58, 0.7],
        [0.74, -0.58, 0.7],
      ].map(([x, y, z], idx) => (
        <mesh key={`corner-${idx}`} position={[x, y, z]} castShadow material={steelCorner}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
        </mesh>
      ))}

      {/* Stenciled Front Waybill Marking */}
      <mesh position={[0, 0.02, 0.71]} material={stencilMaterial}>
        <planeGeometry args={[1.2, 0.6]} />
      </mesh>
    </group>
  )
}

// Stacked Corrugated Kraft Box (Kardus Kraft Atas)
function KraftBox() {
  const kraftMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#C9A876',
        roughness: 0.95,
        metalness: 0.01,
      }),
    []
  )

  const strappingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#F2B705', // Hazard yellow strapping
        roughness: 0.6,
        metalness: 0.1,
      }),
    []
  )

  const labelMaterial = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#F8F4EC'
      ctx.fillRect(0, 0, 256, 256)
      ctx.fillStyle = '#1C1C1C'
      ctx.font = 'bold 20px monospace'
      ctx.fillText('SURAT JALAN', 20, 40)
      ctx.font = '14px monospace'
      ctx.fillText('PRIORITY AIR / DARAT', 20, 70)
      ctx.fillText('WEIGHT: 18.5 KG', 20, 95)
      
      // Barcode
      for (let i = 20; i < 236; i += 6) {
        ctx.fillRect(i, 130, (i % 4 === 0) ? 4 : 2, 70)
      }
      ctx.fillText('KB-77890-EXP', 45, 230)
    }
    const texture = new THREE.CanvasTexture(canvas)
    return new THREE.MeshBasicMaterial({ map: texture })
  }, [])

  return (
    <group position={[0.25, 0.72, 0.08]} rotation={[0, -0.15, 0]}>
      {/* Main Corrugated Box */}
      <mesh castShadow receiveShadow material={kraftMaterial}>
        <boxGeometry args={[1.05, 0.75, 0.95]} />
      </mesh>

      {/* Industrial Strapping Bands */}
      <mesh position={[0, 0, 0]} castShadow material={strappingMaterial}>
        <boxGeometry args={[1.06, 0.76, 0.06]} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow material={strappingMaterial}>
        <boxGeometry args={[0.06, 0.76, 0.96]} />
      </mesh>

      {/* Waybill Shipping Label Sticker */}
      <mesh position={[0.15, 0.38, 0.15]} rotation={[-Math.PI / 2, 0, 0.08]} material={labelMaterial}>
        <planeGeometry args={[0.45, 0.45]} />
      </mesh>
    </group>
  )
}

// Orchestrated Cargo Scene
function FreightAssembly() {
  const groupRef = useRef<Group>(null)
  const landingProgress = useRef(0)

  useFrame((state) => {
    if (!groupRef.current) return

    // 1. One-time deliberate settling drop on initial load (Harmonic settling)
    if (landingProgress.current < 1) {
      landingProgress.current += 0.035
      const p = landingProgress.current
      // Heavy crate impact drop from +1.2 down to 0 with slight elastic settling
      const bounce = Math.sin(p * Math.PI * 2.5) * Math.exp(-p * 5) * 0.4
      groupRef.current.position.y = Math.max(0, (1 - p) * 0.6) + bounce
    } else {
      groupRef.current.position.y = 0
    }

    // 2. Interactive subtle mouse parallax (No continuous cheesy auto-spin!)
    const targetRotY = (state.pointer.x * Math.PI) / 14 + 0.35
    const targetRotX = (-state.pointer.y * Math.PI) / 22 + 0.12

    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05)
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Pallet />
      <WoodenCrate />
      <KraftBox />
    </group>
  )
}

export default function PackageScene({ className = '' }: { className?: string }) {
  return (
    <div className={`warehouse-scene-container ${className}`} aria-label="3D model tumpukan peti kargo dan palet kayu KurBhan">
      <Canvas
        camera={{ position: [2.8, 1.8, 4.4], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        {/* Industrial Warehouse Overhead Lighting */}
        <ambientLight intensity={0.65} color="#F5EFEB" />
        
        {/* Main High-Bay Pendant Lamp */}
        <directionalLight
          position={[4, 8, 5]}
          intensity={2.0}
          color="#FFF8E7"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* Cold Concrete Floor Fill / Rim Light */}
        <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#7A8B87" />
        
        {/* Warehouse Accent Light */}
        <pointLight position={[0, -0.5, 3]} intensity={0.4} color="#F2B705" />

        <FreightAssembly />

        {/* Sharp Industrial Floor Contact Shadow */}
        <ContactShadows
          position={[0, -1.18, 0]}
          opacity={0.75}
          scale={5.5}
          blur={1.6}
          far={3.5}
          color="#1C1C1C"
        />
      </Canvas>
      
      {/* Screen Reader Semantic Accessibility */}
      <div className="sr-only">
        Tampilan 3D interaktif tumpukan peti kemas kayu dan kardus ekspedisi KurBhan di atas palet kayu kargo.
      </div>
    </div>
  )
}
