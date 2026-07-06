'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { ProductDTO } from '@/types'
import { formatPrice, getGeometryForCategory } from '@/lib/utils'
import { useStore } from '@/store/useStore'

interface Props {
  product: ProductDTO
  position: [number, number, number]
  categoryName: string
  neonColor?: string
}

function Shape({ shape }: { shape: string }) {
  switch (shape) {
    case 'torusKnot':
      return <torusKnotGeometry args={[0.5, 0.2, 64, 8]} />
    case 'box':
      return <boxGeometry args={[0.7, 0.7, 0.7]} />
    case 'dodecahedron':
      return <dodecahedronGeometry args={[0.5]} />
    case 'icosahedron':
      return <icosahedronGeometry args={[0.5]} />
    case 'torus':
      return <torusGeometry args={[0.5, 0.2, 16, 32]} />
    default:
      return <sphereGeometry args={[0.5, 32, 32]} />
  }
}

function HolographicTooltip({ product, color }: { product: ProductDTO; color: string }) {
  return (
    <div
      style={{
        pointerEvents: 'none',
        background: 'rgba(3, 3, 3, 0.85)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${color}44`,
        borderRadius: 8,
        padding: '8px 14px',
        minWidth: 140,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${color}11, transparent, ${color}11)`,
          backgroundSize: '100% 4px',
          animation: 'none',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0.6,
        }}
      />
      <p
        style={{
          color: 'rgba(255,255,255,0.9)',
          fontSize: 11,
          fontWeight: 500,
          fontFamily: 'monospace',
          margin: 0,
          maxWidth: 140,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {product.name}
      </p>
      <p
        style={{
          color,
          fontSize: 12,
          fontFamily: 'monospace',
          fontWeight: 700,
          margin: '4px 0 0',
          textShadow: `0 0 10px ${color}`,
        }}
      >
        {formatPrice(product.basePrice ?? product.appliedPrice)}
      </p>
    </div>
  )
}

export default function Product3D({ product, position, categoryName, neonColor }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const selectProduct = useStore((s) => s.selectProduct)
  const neonIntensity = useStore((s) => s.neonIntensity)
  const { shape, color } = getGeometryForCategory(categoryName)
  const accent = neonColor || color

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.sin(t * 0.3 + position[0]) * 0.15
    meshRef.current.rotation.y += 0.01

    if (glowRef.current) {
      const scale = 1 + Math.sin(t * 1.5 + position[0]) * 0.05
      glowRef.current.scale.setScalar(scale)
      if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
        const baseOpacity = neonIntensity === 'high' ? 0.12 : 0.03
        const range = neonIntensity === 'high' ? 0.06 : 0.015
        glowRef.current.material.opacity = baseOpacity + Math.sin(t * 1.2 + position[0]) * range
      }
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh
        ref={glowRef}
        position={position}
        scale={1.4}
      >
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={0.1} depthWrite={false} />
      </mesh>

      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); selectProduct(product) }}
      >
        <Shape shape={shape} />
        <meshStandardMaterial
          color={color}
          emissive={hovered ? accent : color}
          emissiveIntensity={hovered ? 0.6 : (neonIntensity === 'high' ? 0.1 : 0.02)}
          metalness={0.7}
          roughness={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={2.8} center>
          <HolographicTooltip product={product} color={accent} />
        </Html>
      )}
    </Float>
  )
}
