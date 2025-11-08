'use client'

/**
 * 3D Swarm Visualization
 *
 * KILLER 3D FEATURE using Three.js! 🤯
 *
 * Shows agents as glowing spheres with communication lines
 * - Real-time agent positions
 * - Consensus convergence animation
 * - Force-directed layout
 * - Interactive camera controls
 */

import { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Line, Text } from '@react-three/drei'
import * as THREE from 'three'

interface Agent3D {
  id: string
  name: string
  position: [number, number, number]
  velocity: [number, number, number]
  color: string
  status: 'scanning' | 'analyzing' | 'executing' | 'consensus'
  connections: string[] // IDs of connected agents
}

interface Swarm3DProps {
  agents?: Agent3D[]
  showConnections?: boolean
  enablePhysics?: boolean
}

export default function Swarm3D({
  agents: externalAgents,
  showConnections = true,
  enablePhysics = true,
}: Swarm3DProps) {
  const [internalAgents, setInternalAgents] = useState<Agent3D[]>([])

  // Use external agents or generate demo agents
  useEffect(() => {
    if (externalAgents) {
      setInternalAgents(externalAgents)
    } else {
      // Generate demo agents
      const demoAgents: Agent3D[] = [
        {
          id: 'agent-1',
          name: 'Cost Hunter',
          position: [2, 1, 0],
          velocity: [0, 0, 0],
          color: '#9945FF',
          status: 'scanning',
          connections: ['agent-2', 'agent-3'],
        },
        {
          id: 'agent-2',
          name: 'Speed Demon',
          position: [-2, -1, 1],
          velocity: [0, 0, 0],
          color: '#14F195',
          status: 'analyzing',
          connections: ['agent-1', 'agent-4'],
        },
        {
          id: 'agent-3',
          name: 'Balanced Bot',
          position: [0, 2, -1],
          velocity: [0, 0, 0],
          color: '#00D4FF',
          status: 'scanning',
          connections: ['agent-1', 'agent-5'],
        },
        {
          id: 'agent-4',
          name: 'Smart Trader',
          position: [1, -2, 0],
          velocity: [0, 0, 0],
          color: '#FF6B6B',
          status: 'consensus',
          connections: ['agent-2', 'agent-5'],
        },
        {
          id: 'agent-5',
          name: 'Swarm Leader',
          position: [-1, 0, 2],
          velocity: [0, 0, 0],
          color: '#FFD93D',
          status: 'executing',
          connections: ['agent-3', 'agent-4'],
        },
      ]
      setInternalAgents(demoAgents)
    }
  }, [externalAgents])

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden bg-background-tertiary border border-border">
      <Canvas camera={{ position: [0, 0, 12], fov: 50 }}>
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#9945FF" />

        {/* Background */}
        <mesh position={[0, 0, -10]}>
          <planeGeometry args={[50, 50]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>

        {/* Agents */}
        {internalAgents.map((agent, index) => (
          <AgentSphere
            key={agent.id}
            agent={agent}
            agents={internalAgents}
            setAgents={setInternalAgents}
            enablePhysics={enablePhysics}
          />
        ))}

        {/* Connections */}
        {showConnections && internalAgents.map((agent) =>
          agent.connections.map((targetId) => {
            const target = internalAgents.find(a => a.id === targetId)
            if (!target) return null

            return (
              <ConnectionLine
                key={`${agent.id}-${targetId}`}
                start={agent.position}
                end={target.position}
                color={agent.color}
              />
            )
          })
        )}

        {/* Grid */}
        <gridHelper args={[20, 20, '#222222', '#111111']} />

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={20}
          minDistance={5}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass p-4 rounded-lg">
        <div className="text-xs text-text-secondary mb-2">Agent Status:</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success" />
            <span className="text-white">Scanning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-primary" />
            <span className="text-white">Analyzing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent-secondary" />
            <span className="text-white">Executing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-warning" />
            <span className="text-white">Consensus</span>
          </div>
        </div>
      </div>

      {/* Controls hint */}
      <div className="absolute top-4 right-4 glass p-3 rounded-lg text-xs text-text-secondary">
        <div className="font-bold text-white mb-1">Controls:</div>
        <div>🖱️ Drag to rotate</div>
        <div>🔍 Scroll to zoom</div>
        <div>👆 Right-click to pan</div>
      </div>
    </div>
  )
}

/**
 * Individual Agent Sphere
 */
function AgentSphere({
  agent,
  agents,
  setAgents,
  enablePhysics,
}: {
  agent: Agent3D
  agents: Agent3D[]
  setAgents: (agents: Agent3D[]) => void
  enablePhysics: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  // Animate agent movement (simple physics simulation)
  useFrame((state, delta) => {
    if (!meshRef.current || !enablePhysics) return

    // Get current agent data
    const currentAgent = agents.find(a => a.id === agent.id)
    if (!currentAgent) return

    // Apply gentle forces to move agents
    const forces: [number, number, number] = [0, 0, 0]

    // Attraction to center (weak)
    const centerDist = Math.sqrt(
      currentAgent.position[0] ** 2 +
      currentAgent.position[1] ** 2 +
      currentAgent.position[2] ** 2
    )
    if (centerDist > 0) {
      forces[0] -= (currentAgent.position[0] / centerDist) * 0.01
      forces[1] -= (currentAgent.position[1] / centerDist) * 0.01
      forces[2] -= (currentAgent.position[2] / centerDist) * 0.01
    }

    // Repulsion from other agents
    agents.forEach(other => {
      if (other.id === agent.id) return

      const dx = currentAgent.position[0] - other.position[0]
      const dy = currentAgent.position[1] - other.position[1]
      const dz = currentAgent.position[2] - other.position[2]
      const dist = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2)

      if (dist > 0 && dist < 3) {
        const force = (3 - dist) * 0.05
        forces[0] += (dx / dist) * force
        forces[1] += (dy / dist) * force
        forces[2] += (dz / dist) * force
      }
    })

    // Update velocity
    const newVelocity: [number, number, number] = [
      currentAgent.velocity[0] * 0.95 + forces[0],
      currentAgent.velocity[1] * 0.95 + forces[1],
      currentAgent.velocity[2] * 0.95 + forces[2],
    ]

    // Update position
    const newPosition: [number, number, number] = [
      currentAgent.position[0] + newVelocity[0],
      currentAgent.position[1] + newVelocity[1],
      currentAgent.position[2] + newVelocity[2],
    ]

    // Update mesh position
    meshRef.current.position.set(...newPosition)

    // Update agent data
    setAgents(agents.map(a =>
      a.id === agent.id
        ? { ...a, position: newPosition, velocity: newVelocity }
        : a
    ))
  })

  // Pulsing animation based on status
  const pulseSpeed = agent.status === 'executing' ? 2 : agent.status === 'analyzing' ? 1.5 : 1
  const pulseScale = agent.status === 'consensus' ? 1.3 : 1.1

  useFrame((state) => {
    if (!meshRef.current) return
    const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.15 + 1
    meshRef.current.scale.setScalar(hovered ? pulseScale : pulse)
  })

  // Glow intensity based on status
  const glowIntensity = agent.status === 'executing' ? 2 : agent.status === 'consensus' ? 1.5 : 1

  return (
    <group position={agent.position}>
      <Sphere
        ref={meshRef}
        args={[0.5, 32, 32]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
      >
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={glowIntensity}
          roughness={0.3}
          metalness={0.8}
        />
      </Sphere>

      {/* Agent label */}
      {(hovered || clicked) && (
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {agent.name}
        </Text>
      )}

      {/* Status ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.75, 32]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/**
 * Connection Line Between Agents
 */
function ConnectionLine({
  start,
  end,
  color,
}: {
  start: [number, number, number]
  end: [number, number, number]
  color: string
}) {
  const points = useMemo(() => [
    new THREE.Vector3(...start),
    new THREE.Vector3(...end),
  ], [start, end])

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      opacity={0.3}
      transparent
      dashed
      dashScale={50}
      dashSize={0.1}
      gapSize={0.05}
    />
  )
}
