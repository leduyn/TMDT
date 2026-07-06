'use client'
import { useEffect, useMemo, useRef, Component, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Preload, Environment } from '@react-three/drei'
import * as THREE from 'three'
import FloorGrid from './FloorGrid'
import Shelf from './Shelf'
import Particles from './Particles'
import { useStore } from '@/store/useStore'
import type { ShelfData, CameraTarget } from '@/types'
import type { ProductDTO, CategoryDTO } from '@/types'

const SMOOTH_FACTOR = 0.035
const COL_WIDTH = 7

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function CameraController() {
  const cameraTarget = useStore((s) => s.cameraTarget)
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(0, 6, 14))
  const targetLook = useRef(new THREE.Vector3(0, 0, 0))
  const progress = useRef(1)
  const prevTarget = useRef<CameraTarget>('overview')

  useEffect(() => {
    progress.current = 0
    prevTarget.current = cameraTarget

    if (cameraTarget === 'overview') {
      targetPos.current.set(0, 6, 14)
      targetLook.current.set(0, 0, 0)
    } else if (typeof cameraTarget === 'object') {
      const idx = cameraTarget.categoryId
      const shelfX = (idx % 5) * COL_WIDTH - 14
      targetPos.current.set(shelfX * 0.35, 2.5, 5 + (idx % 3) * 0.5)
      targetLook.current.set(shelfX * 0.2, 0.2, 0)
    }
  }, [cameraTarget])

  useFrame(() => {
    if (progress.current < 1) {
      progress.current = Math.min(1, progress.current + SMOOTH_FACTOR * 1.5)
      const eased = easeInOutCubic(progress.current)
      camera.position.lerp(targetPos.current, eased * 0.06)
    }
    const lookTarget = new THREE.Vector3().lerpVectors(
      new THREE.Vector3(camera.position.x * 0.3, 0, 0),
      targetLook.current,
      0.5
    )
    camera.lookAt(lookTarget)
  })

  return null
}

function SceneContent({ shelves }: { shelves: ShelfData[] }) {
  const setFocusedCategory = useStore((s) => s.setFocusedCategory)
  const setCameraTarget = useStore((s) => s.setCameraTarget)
  const showGrid = useStore((s) => s.showGrid)

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[8, 12, 8]} intensity={0.6} color="#4facfe" />
      <directionalLight position={[-6, 6, -6]} intensity={0.3} color="#00f2fe" />
      <pointLight position={[0, 8, 0]} intensity={0.4} color="#00f2fe" />
      <pointLight position={[-10, 4, -10]} intensity={0.3} color="#4facfe" />
      <fog attach="fog" args={['#030303', 30, 70]} />
      {showGrid && <FloorGrid />}
      <Particles count={400} />
      <CameraController />
      {shelves.map((shelf, idx) => (
        <Shelf
          key={shelf.category.id}
          shelf={shelf}
          onClick={() => {
            setFocusedCategory(shelf.category.id)
            setCameraTarget({ categoryId: shelf.category.id })
          }}
        />
      ))}
    </>
  )
}

class CanvasErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-screen h-screen fixed inset-0 flex items-center justify-center bg-space">
          <p className="text-white/40 font-mono text-sm">3D Canvas error — check console</p>
        </div>
      )
    }
    return this.props.children
  }
}

interface Props {
  categories: CategoryDTO[]
  products: ProductDTO[]
}

export default function Scene({ categories, products }: Props) {
  const shelves: ShelfData[] = useMemo(() => {
    const cols = 5
    return categories.slice(0, 8).map((cat, idx) => {
      const col = idx % cols
      const row = Math.floor(idx / cols)
      const x = col * COL_WIDTH - 14
      const z = row * (-9) - 4
      return {
        category: cat,
        products: products.filter((p) => p.categoryId === cat.id),
        position: [x, 0, z] as [number, number, number],
      }
    })
  }, [categories, products])

  return (
    <div className="w-screen h-screen fixed inset-0">
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 6, 14], fov: 50, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          onCreated={(state) => {
            console.log('R3F Canvas ready', state.gl.capabilities)
          }}
          onError={(err) => {
            console.error('R3F Canvas error:', err)
          }}
        >
          <color attach="background" args={['#030303']} />
          <Suspense fallback={null}>
            <SceneContent shelves={shelves} />
            <Preload all />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  )
}
