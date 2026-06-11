"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function Football() {
  const group = React.useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.35;
    group.current.rotation.x += delta * 0.08;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={group} position={[2.6, 0.4, 0]} scale={1.15}>
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#e2e8f0"
            flatShading
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        <mesh scale={1.001}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#071124" wireframe transparent opacity={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

function Trophy() {
  const group = React.useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.4;
  });

  const gold = (
    <meshStandardMaterial color="#ffd60a" metalness={0.95} roughness={0.25} />
  );

  // Stylized World Cup silhouette: plinth, twin spiral stem, globe crown
  const stemPoints = React.useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      // hourglass curve: wide base, narrow waist, flares to hold the globe
      const r = 0.42 - 0.28 * Math.sin(t * Math.PI) + 0.18 * t * t;
      pts.push(new THREE.Vector2(Math.max(r, 0.1), t * 1.7));
    }
    return pts;
  }, []);

  return (
    <Float speed={1.1} rotationIntensity={0.15} floatIntensity={0.7}>
      <group ref={group} position={[-2.8, -0.4, -0.5]} scale={0.9}>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.62, 0.72, 0.36, 48]} />
          <meshStandardMaterial color="#0f5132" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <latheGeometry args={[stemPoints, 48]} />
          {gold}
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <sphereGeometry args={[0.55, 32, 32]} />
          {gold}
        </mesh>
      </group>
    </Float>
  );
}

// Deterministic PRNG keeps the particle layout stable across renders
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ParticleField({ count = 900 }: { count?: number }) {
  const points = React.useRef<THREE.Points>(null);
  const positions = React.useMemo(() => {
    const rand = mulberry32(2026);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 22;
      arr[i * 3 + 1] = (rand() - 0.5) * 14;
      arr[i * 3 + 2] = (rand() - 0.5) * 10 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#ffd60a"
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Rig() {
  useFrame((state) => {
    // gentle camera parallax following the pointer
    const { camera, pointer } = state;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.6, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.35, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7.5], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-hidden="true"
    >
      <ambientLight intensity={0.25} />
      {/* stadium floodlights */}
      <spotLight position={[-8, 9, 6]} intensity={220} angle={0.5} penumbra={0.8} color="#fff7cc" />
      <spotLight position={[8, 9, 6]} intensity={180} angle={0.5} penumbra={0.8} color="#e2e8f0" />
      <pointLight position={[0, -5, 4]} intensity={60} color="#d90429" />
      <Football />
      <Trophy />
      <ParticleField />
      <Rig />
      <fog attach="fog" args={["#020617", 9, 18]} />
    </Canvas>
  );
}
