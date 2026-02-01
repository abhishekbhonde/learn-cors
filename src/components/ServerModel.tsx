'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Float, RoundedBox, Cylinder, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

export default function ServerModel(props: any) {
    const groupRef = useRef<THREE.Group>(null);
    const glowRef = useRef<THREE.Mesh>(null);
    const lightsRef = useRef<THREE.Group>(null);
    const fanRef = useRef<THREE.Group>(null);
    const orbitRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        // Breathing glow
        if (glowRef.current) {
            const scale = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.05;
            glowRef.current.scale.setScalar(scale);
        }
        // Blinking lights
        if (lightsRef.current) {
            lightsRef.current.children.forEach((child, i) => {
                const mesh = child as THREE.Mesh;
                const mat = mesh.material as THREE.MeshStandardMaterial;
                const blink = Math.sin(clock.elapsedTime * (2 + i * 0.7) + i * 0.5) > 0;
                mat.emissiveIntensity = blink ? 4 : 0.3;
            });
        }
        // Spinning fan
        if (fanRef.current) {
            fanRef.current.rotation.z = clock.elapsedTime * 10;
        }
        // Orbiting elements
        if (orbitRef.current) {
            orbitRef.current.rotation.y = -clock.elapsedTime * 0.4;
        }
    });

    return (
        <group {...props} ref={groupRef}>
            <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.35}>
                {/* Main Server Chassis */}
                <RoundedBox args={[2, 3.5, 1.4]} position={[0, 0.75, 0]} radius={0.06} smoothness={4} castShadow>
                    <meshStandardMaterial color="#12121a" metalness={0.95} roughness={0.1} />
                </RoundedBox>

                {/* Front Panel */}
                <mesh position={[0, 0.75, 0.71]}>
                    <boxGeometry args={[1.85, 3.3, 0.02]} />
                    <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.15} />
                </mesh>

                {/* Server Rack Slots */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <group key={i} position={[0, 2.2 - i * 0.5, 0.72]}>
                        {/* Slot Face */}
                        <RoundedBox args={[1.7, 0.35, 0.03]} radius={0.015} smoothness={2}>
                            <meshStandardMaterial color="#0f0f18" metalness={0.85} roughness={0.25} />
                        </RoundedBox>
                        {/* Drive bay indicator */}
                        <mesh position={[0.6, 0, 0.02]}>
                            <boxGeometry args={[0.3, 0.2, 0.01]} />
                            <meshStandardMaterial color="#1a1a28" metalness={0.8} roughness={0.3} />
                        </mesh>
                        {/* Ventilation */}
                        <mesh position={[-0.3, 0, 0.02]}>
                            <boxGeometry args={[0.8, 0.15, 0.01]} />
                            <meshStandardMaterial color="#080810" metalness={0.5} roughness={0.5} />
                        </mesh>
                    </group>
                ))}

                {/* Status Lights */}
                <group ref={lightsRef}>
                    {[0, 1, 2, 3, 4, 5].map(i => (
                        <Sphere key={i} args={[0.04, 16, 16]} position={[0.7, 2.2 - i * 0.5, 0.75]}>
                            <meshStandardMaterial
                                color={i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#a855f7" : "#00e5ff"}
                                emissive={i % 3 === 0 ? "#22c55e" : i % 3 === 1 ? "#a855f7" : "#00e5ff"}
                                emissiveIntensity={2}
                            />
                        </Sphere>
                    ))}
                </group>

                {/* Power button */}
                <Cylinder args={[0.08, 0.08, 0.02, 32]} position={[-0.7, 2.2, 0.73]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1} />
                </Cylinder>

                {/* Side Vents */}
                {[-1.01, 1.01].map((x, i) => (
                    <group key={i} position={[x, 0.75, 0]}>
                        {[0, 1, 2, 3, 4].map(j => (
                            <mesh key={j} position={[0, 1 - j * 0.5, 0]}>
                                <boxGeometry args={[0.02, 0.08, 1]} />
                                <meshStandardMaterial color="#080810" metalness={0.7} roughness={0.3} />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Top with exhaust vents */}
                <mesh position={[0, 2.52, 0]}>
                    <boxGeometry args={[1.95, 0.04, 1.35]} />
                    <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.15} />
                </mesh>

                {/* Exhaust fans */}
                <group ref={fanRef} position={[0.5, 2.54, 0]}>
                    <Cylinder args={[0.25, 0.25, 0.02, 32]} rotation={[Math.PI / 2, 0, 0]}>
                        <meshStandardMaterial color="#1a1a28" metalness={0.8} roughness={0.2} />
                    </Cylinder>
                    {[0, 1, 2, 3].map(i => (
                        <mesh key={i} rotation={[Math.PI / 2, 0, (i / 4) * Math.PI * 2]}>
                            <boxGeometry args={[0.4, 0.01, 0.05]} />
                            <meshStandardMaterial color="#252540" metalness={0.7} roughness={0.3} />
                        </mesh>
                    ))}
                </group>

                <Cylinder args={[0.2, 0.2, 0.02, 32]} position={[-0.5, 2.54, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <meshStandardMaterial color="#1a1a28" metalness={0.8} roughness={0.2} />
                </Cylinder>

                {/* Base Stand */}
                <RoundedBox args={[2.2, 0.12, 1.6]} position={[0, -1.05, 0]} radius={0.02} smoothness={2} castShadow>
                    <meshStandardMaterial color="#1a1a28" metalness={0.9} roughness={0.15} />
                </RoundedBox>

                {/* Base feet */}
                {[[-0.8, -0.6], [0.8, -0.6], [-0.8, 0.6], [0.8, 0.6]].map(([x, z], i) => (
                    <Cylinder key={i} args={[0.08, 0.1, 0.1, 16]} position={[x, -1.15, z]}>
                        <meshStandardMaterial color="#0a0a12" metalness={0.9} roughness={0.2} />
                    </Cylinder>
                ))}

                {/* Orbiting data */}
                <group ref={orbitRef}>
                    {[0, 1, 2, 3].map(i => (
                        <Box
                            key={i}
                            args={[0.08, 0.08, 0.08]}
                            position={[
                                Math.cos((i / 4) * Math.PI * 2) * 1.8,
                                1,
                                Math.sin((i / 4) * Math.PI * 2) * 1.8
                            ]}
                            rotation={[Math.PI / 4, Math.PI / 4, 0]}
                        >
                            <meshBasicMaterial color="#a855f7" />
                        </Box>
                    ))}
                </group>

                {/* Glow Rings */}
                <mesh ref={glowRef} position={[0, 0.75, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.6, 0.015, 16, 100]} />
                    <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
                </mesh>

                <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.9, 0.01, 16, 100]} />
                    <meshBasicMaterial color="#a855f7" transparent opacity={0.2} />
                </mesh>

                {/* Labels */}
                <Text
                    position={[0, 3.2, 0]}
                    fontSize={0.28}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.015}
                    outlineColor="#a855f7"
                >
                    SERVER
                </Text>
                <Text
                    position={[0, 2.9, 0]}
                    fontSize={0.14}
                    color="#a855f7"
                    anchorX="center"
                    anchorY="middle"
                >
                    TARGET ORIGIN
                </Text>
            </Float>

            {/* Ground glow */}
            <pointLight position={[0, -2, 0]} intensity={1} color="#a855f7" distance={5} decay={2} />
        </group>
    );
}
