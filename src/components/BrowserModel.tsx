'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Text, Float, RoundedBox, Cylinder, Torus } from '@react-three/drei';
import * as THREE from 'three';

export default function BrowserModel(props: any) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const screenRef = useRef<THREE.Mesh>(null);
    const orbitRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        // Breathing glow
        if (glowRef.current) {
            const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.05;
            glowRef.current.scale.setScalar(scale);
        }
        // Screen pulse
        if (screenRef.current) {
            const mat = screenRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 3) * 0.3;
        }
        // Orbiting elements
        if (orbitRef.current) {
            orbitRef.current.rotation.y = clock.elapsedTime * 0.5;
        }
    });

    return (
        <group {...props} ref={groupRef}>
            <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.4}>
                {/* Main Laptop Body */}
                <group>
                    {/* Base/Keyboard */}
                    <RoundedBox args={[2.4, 0.12, 1.5]} position={[0, -0.8, 0]} radius={0.04} smoothness={4} castShadow>
                        <meshStandardMaterial color="#1a1a2e" metalness={0.95} roughness={0.1} />
                    </RoundedBox>

                    {/* Keyboard surface */}
                    <mesh position={[0, -0.73, 0.1]}>
                        <boxGeometry args={[2.1, 0.01, 1.1]} />
                        <meshStandardMaterial color="#252540" metalness={0.7} roughness={0.4} />
                    </mesh>

                    {/* Touchpad */}
                    <mesh position={[0, -0.72, 0.5]}>
                        <boxGeometry args={[0.6, 0.01, 0.4]} />
                        <meshStandardMaterial color="#2a2a45" metalness={0.8} roughness={0.3} />
                    </mesh>

                    {/* Screen Frame */}
                    <RoundedBox
                        args={[2.4, 1.7, 0.06]}
                        position={[0, 0.15, -0.75]}
                        rotation={[-0.12, 0, 0]}
                        radius={0.03}
                        smoothness={4}
                        castShadow
                    >
                        <meshStandardMaterial color="#1a1a2e" metalness={0.95} roughness={0.08} />
                    </RoundedBox>

                    {/* Screen Display */}
                    <mesh ref={screenRef} position={[0, 0.15, -0.71]} rotation={[-0.12, 0, 0]}>
                        <planeGeometry args={[2.1, 1.4]} />
                        <meshStandardMaterial
                            color="#00e5ff"
                            emissive="#00e5ff"
                            emissiveIntensity={0.6}
                            metalness={0.1}
                            roughness={0.8}
                        />
                    </mesh>

                    {/* Screen content lines */}
                    {[0, 1, 2].map(i => (
                        <mesh key={i} position={[-0.5, 0.4 - i * 0.25, -0.705]} rotation={[-0.12, 0, 0]}>
                            <boxGeometry args={[1, 0.05, 0.001]} />
                            <meshBasicMaterial color="#0088aa" transparent opacity={0.5} />
                        </mesh>
                    ))}

                    {/* Camera dot */}
                    <Sphere args={[0.03, 16, 16]} position={[0, 0.92, -0.72]}>
                        <meshStandardMaterial color="#1a1a2e" emissive="#22c55e" emissiveIntensity={2} />
                    </Sphere>

                    {/* Hinge */}
                    <Cylinder args={[0.04, 0.04, 2.2, 16]} position={[0, -0.74, -0.7]} rotation={[0, 0, Math.PI / 2]}>
                        <meshStandardMaterial color="#252545" metalness={0.9} roughness={0.2} />
                    </Cylinder>
                </group>

                {/* Orbiting data nodes */}
                <group ref={orbitRef}>
                    {[0, 1, 2].map(i => (
                        <Sphere
                            key={i}
                            args={[0.06, 16, 16]}
                            position={[
                                Math.cos((i / 3) * Math.PI * 2) * 2,
                                0.5,
                                Math.sin((i / 3) * Math.PI * 2) * 2
                            ]}
                        >
                            <meshBasicMaterial color="#00e5ff" />
                        </Sphere>
                    ))}
                </group>

                {/* Glow Ring */}
                <mesh ref={glowRef} position={[0, -0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2, 0.015, 16, 100]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} />
                </mesh>

                {/* Secondary ring */}
                <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.3, 0.01, 16, 100]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} />
                </mesh>

                {/* Labels */}
                <Text
                    position={[0, 1.8, 0]}
                    fontSize={0.28}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.015}
                    outlineColor="#00e5ff"
                >
                    BROWSER
                </Text>
                <Text
                    position={[0, 1.5, 0]}
                    fontSize={0.14}
                    color="#00e5ff"
                    anchorX="center"
                    anchorY="middle"
                >
                    CLIENT ORIGIN
                </Text>
            </Float>

            {/* Ground glow */}
            <pointLight position={[0, -2, 0]} intensity={1} color="#00e5ff" distance={5} decay={2} />
        </group>
    );
}
