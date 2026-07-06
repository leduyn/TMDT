'use client'
import { useMemo } from 'react'
import * as THREE from 'three'

export default function FloorGrid() {
  const grid = useMemo(() => {
    const size = 120
    const divisions = 60
    const geo = new THREE.BufferGeometry()
    const vertices: number[] = []
    const colors: number[] = []
    const half = size / 2
    const step = size / divisions
    const c = new THREE.Color('#00f2fe')

    for (let i = 0; i <= divisions; i++) {
      const pos = -half + i * step
      vertices.push(-half, 0, pos, half, 0, pos)
      vertices.push(pos, 0, -half, pos, 0, half)
      for (let j = 0; j < 2; j++) {
        colors.push(c.r * 0.3, c.g * 0.3, c.b * 0.3)
        colors.push(c.r * 0.3, c.g * 0.3, c.b * 0.3)
      }
    }
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [])

  return (
    <primitive object={new THREE.LineSegments(grid, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.4 }))} />
  )
}
