'use client'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  count?: number
}

export default function Particles({ count = 300 }: Props) {
  const meshRef = useRef<THREE.Points>(null!)

  const [positions, sizes, speeds] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const siz = new Float32Array(count)
    const spd = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60
      pos[i * 3 + 1] = Math.random() * 20 + 1
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10
      siz[i] = Math.random() * 2 + 0.5
      spd[i] = Math.random() * 0.15 + 0.03
    }
    return [pos, siz, spd]
  }, [count])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const positionsAttrib = meshRef.current.geometry.attributes.position
    const posArray = positionsAttrib.array as Float32Array
    for (let i = 0; i < count; i++) {
      posArray[i * 3 + 1] += Math.sin(t * speeds[i] + i) * 0.002
      posArray[i * 3] += Math.cos(t * speeds[i] * 0.5 + i * 0.1) * 0.001
    }
    positionsAttrib.needsUpdate = true
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))
    return geo
  }, [positions, sizes])

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.06}
        color="#00f2fe"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
