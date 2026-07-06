'use client'
import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import type { ProductDTO } from '@/types'
import { getGeometryForCategory } from '@/lib/utils'

function PreviewShape({ product, categoryName }: { product: ProductDTO; categoryName?: string }) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const { shape, color } = getGeometryForCategory(categoryName || '')

  useFrame(({ clock }) => {
    meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.4) * 0.1
    meshRef.current.rotation.y += 0.015
  })

  const renderShape = () => {
    switch (shape) {
      case 'torusKnot':
        return <torusKnotGeometry args={[0.8, 0.25, 64, 8]} />
      case 'box':
        return <boxGeometry args={[1, 1, 1]} />
      case 'dodecahedron':
        return <dodecahedronGeometry args={[0.7]} />
      case 'icosahedron':
        return <icosahedronGeometry args={[0.7]} />
      case 'torus':
        return <torusGeometry args={[0.7, 0.25, 16, 32]} />
      default:
        return <sphereGeometry args={[0.7, 32, 32]} />
    }
  }

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={1.2}>
        {renderShape()}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.95}
        />
      </mesh>
      <Sparkles count={20} scale={2} size={0.8} speed={0.4} color={color} />
    </Float>
  )
}

interface Props {
  product: ProductDTO
  categoryName?: string
}

export default function ProductPreview({ product, categoryName }: Props) {
  return (
    <div className="w-full aspect-square rounded-xl overflow-hidden glass bg-space/80">
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 3, 3]} intensity={0.6} color="#4facfe" />
        <directionalLight position={[-3, 2, -3]} intensity={0.3} color="#00f2fe" />
        <pointLight position={[0, 2, 0]} intensity={0.3} color="#00f2fe" />
        <Suspense fallback={null}>
          <PreviewShape product={product} categoryName={categoryName} />
        </Suspense>
      </Canvas>
    </div>
  )
}
