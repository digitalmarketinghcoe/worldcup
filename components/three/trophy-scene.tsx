"use client";

import "@/lib/patch-three-clock";
import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

function Trophy() {
  const group = React.useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.45;
  });

  const stemPoints = React.useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = i / 32;
      const r = 0.44 - 0.3 * Math.sin(t * Math.PI) + 0.2 * t * t;
      pts.push(new THREE.Vector2(Math.max(r, 0.08), t * 2.0));
    }
    return pts;
  }, []);

  const gold = <meshStandardMaterial color="#ffd60a" metalness={0.96} roughness={0.2} />;

  return (
    <Float speed={1.0} rotationIntensity={0.1} floatIntensity={0.8}>
      <group ref={group} scale={1.1}>
        {/* green base plinth */}
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.7, 0.8, 0.4, 64]} />
          <meshStandardMaterial color="#0f5132" metalness={0.45} roughness={0.35} />
        </mesh>
        {/* gold stem */}
        <mesh position={[0, 0, 0]}>
          <latheGeometry args={[stemPoints, 64]} />
          {gold}
        </mesh>
        {/* globe crown */}
        <mesh position={[0, 2.3, 0]}>
          <sphereGeometry args={[0.62, 48, 48]} />
          {gold}
        </mesh>
        {/* crown ring */}
        <mesh position={[0, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.65, 0.06, 16, 64]} />
          {gold}
        </mesh>
      </group>
    </Float>
  );
}

export function TrophyScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 7], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="!absolute inset-0"
      aria-hidden="true"
    >
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 10, 5]} intensity={280} angle={0.45} penumbra={0.7} color="#fff7cc" />
      <spotLight position={[-6, 2, 4]} intensity={120} angle={0.6} penumbra={1} color="#ffd60a" />
      <pointLight position={[0, -3, 3]} intensity={50} color="#d90429" />
      <Trophy />
      <fog attach="fog" args={["#020617", 9, 18]} />
    </Canvas>
  );
}
