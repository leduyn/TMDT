'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Edges } from '@react-three/drei'
import * as THREE from 'three'
import Product3D from './Product3D'
import type { ShelfData } from '@/types'
import { useStore } from '@/store/useStore'

interface Props {
  shelf: ShelfData
  onClick?: () => void
}

function ShelfGlow({ position, width, height }: { position: [number, number, number]; width: number; height: number }) {
  const glowRef = useRef<THREE.Mesh>(null!)
  const neonIntensity = useStore((s) => s.neonIntensity)

  useFrame(({ clock }) => {
    const baseOpacity = neonIntensity === 'high' ? 0.25 : 0.08
    const range = neonIntensity === 'high' ? 0.15 : 0.04
    const pulse = baseOpacity + Math.sin(clock.getElapsedTime() * 0.5) * range
    if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = pulse
    }
  })

  return (
    <mesh ref={glowRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width + 1.5, 0.15]} />
      <meshBasicMaterial color="#00f2fe" transparent opacity={0.25} depthWrite={false} />
    </mesh>
  )
}

export default function Shelf({ shelf, onClick }: Props) {
  const { category, products, position } = shelf
  const [x, y, z] = position
  const maxPerRow = 5
  const spacing = 1.8
  const shelfWidth = Math.min(products.length, maxPerRow) * spacing + 1
  const shelfDepth = Math.ceil(products.length / maxPerRow) * spacing + 0.5
  const neonIntensity = useStore((s) => s.neonIntensity)

  const neonColor = useMemo(() => {
    const colors = ['#00f2fe', '#4facfe', '#ff6b6b', '#00ff87', '#ffd93d', '#a78bfa', '#f472b6', '#34d399']
    return colors[category.id % colors.length]
  }, [category.id])

  return (
    <group position={position}>
      <group onClick={onClick}>
        <ShelfGlow position={[0, -0.1, -shelfDepth / 2 + 0.5]} width={shelfWidth} height={0.1} />

        <mesh position={[0, -0.05, -shelfDepth / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[shelfWidth, 0.1]} />
          <meshStandardMaterial color={neonColor} transparent opacity={neonIntensity === 'high' ? 0.15 : 0.05} metalness={0.8} roughness={0.1} />
        </mesh>

        <mesh position={[0, -0.05, -shelfDepth / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[shelfWidth, 0.1]} />
          <meshBasicMaterial color={neonColor} transparent opacity={neonIntensity === 'high' ? 0.08 : 0.02} side={THREE.DoubleSide} />
          <Edges color={neonColor} threshold={15} />
        </mesh>

        <mesh position={[-shelfWidth / 2, 0.5, -shelfDepth / 2 + 0.5]}>
          <boxGeometry args={[0.04, 1.2, shelfDepth]} />
          <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={neonIntensity === 'high' ? 0.2 : 0.05} transparent opacity={neonIntensity === 'high' ? 0.3 : 0.1} />
        </mesh>
        <mesh position={[shelfWidth / 2, 0.5, -shelfDepth / 2 + 0.5]}>
          <boxGeometry args={[0.04, 1.2, shelfDepth]} />
          <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={neonIntensity === 'high' ? 0.2 : 0.05} transparent opacity={neonIntensity === 'high' ? 0.3 : 0.1} />
        </mesh>

        <mesh position={[0, -0.6, -shelfDepth / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[shelfWidth + 0.5, shelfDepth]} />
          <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.3} transparent opacity={0.4} />
        </mesh>
      </group>

      <Text
        position={[0, 1.2, -shelfDepth / 2 + 0.5]}
        fontSize={0.35}
        color={neonColor}
        anchorX="center"
        anchorY="middle"
        onClick={onClick}
      >
        {category.name}
      </Text>

      <group>
        {products.slice(0, 10).map((product, idx) => {
          const row = Math.floor(idx / maxPerRow)
          const col = idx % maxPerRow
          const offsetX = (col - (Math.min(products.length, maxPerRow) - 1) / 2) * spacing
          const offsetZ = row * (-spacing)
          return (
            <Product3D
              key={product.id}
              product={product}
              position={[offsetX, 0.4, offsetZ - shelfDepth / 2 + 0.5]}
              categoryName={category.name}
              neonColor={neonColor}
            />
          )
        })}
      </group>
    </group>
  )
}
