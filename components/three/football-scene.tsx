"use client";

import "@/lib/patch-three-clock";
import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function Football() {
  const group = React.useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.5;
    group.current.rotation.x += delta * 0.12;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.4}>
      <group ref={group} scale={2.2}>
        <mesh>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#e2e8f0"
            flatShading
            roughness={0.3}
            metalness={0.08}
          />
        </mesh>
        <mesh scale={1.002}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#071124" wireframe transparent opacity={0.85} />
        </mesh>
      </group>
    </Float>
  );
}

export function FootballScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-hidden="true"
    >
      <ambientLight intensity={0.3} />
      <spotLight position={[-5, 8, 5]} intensity={160} angle={0.55} penumbra={0.9} color="#fff7cc" />
      <spotLight position={[5, -4, 4]} intensity={80} angle={0.6} penumbra={1} color="#d90429" />
      <Football />
      <fog attach="fog" args={["#020617", 8, 16]} />
    </Canvas>
  );
}
