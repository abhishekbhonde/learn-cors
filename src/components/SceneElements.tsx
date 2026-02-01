'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Box, Torus, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Internet Cloud - The middle "hop" point
export function InternetCloud() {
    const groupRef = useRef<THREE.Group>(null);
    const ringsRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = clock.elapsedTime * 0.1;
        }
        if (ringsRef.current) {
            ringsRef.current.rotation.z = clock.elapsedTime * 0.3;
            ringsRef.current.rotation.x = clock.elapsedTime * 0.2;
        }
    });

    return (
        <group position={[0, 5, 2]}>
            <Float speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
                {/* Core sphere */}
                <Sphere args={[0.6, 32, 32]} ref={groupRef as any}>
                    <meshStandardMaterial
                        color="#1a1a2e"
                        metalness={0.9}
                        roughness={0.1}
                        emissive="#00e5ff"
                        emissiveIntensity={0.2}
                    />
                </Sphere>

                {/* Orbiting rings */}
                <group ref={ringsRef}>
                    <Torus args={[1, 0.02, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
                        <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
                    </Torus>
                    <Torus args={[1.2, 0.015, 16, 100]} rotation={[Math.PI / 2, Math.PI / 4, 0]}>
                        <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
                    </Torus>
                    <Torus args={[0.8, 0.01, 16, 100]} rotation={[0, Math.PI / 3, Math.PI / 6]}>
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                    </Torus>
                </group>

                {/* Small orbiting nodes */}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                    <OrbitingNode key={i} index={i} radius={1.5} speed={0.5 + i * 0.1} />
                ))}

                <Text position={[0, 1.5, 0]} fontSize={0.15} color="#ffffff" anchorX="center">
                    INTERNET
                </Text>
            </Float>

            {/* Point light for glow effect */}
            <pointLight position={[0, 0, 0]} intensity={2} color="#00e5ff" distance={5} decay={2} />
        </group>
    );
}

function OrbitingNode({ index, radius, speed }: { index: number; radius: number; speed: number }) {
    const ref = useRef<THREE.Mesh>(null);
    const offset = (index / 6) * Math.PI * 2;

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.elapsedTime * speed + offset;
            ref.current.position.x = Math.cos(t) * radius;
            ref.current.position.z = Math.sin(t) * radius;
            ref.current.position.y = Math.sin(t * 2) * 0.3;
        }
    });

    return (
        <Sphere ref={ref} args={[0.05, 16, 16]}>
            <meshBasicMaterial color={index % 2 === 0 ? "#00e5ff" : "#a855f7"} />
        </Sphere>
    );
}

// Data waypoints along the path
export function DataWaypoints() {
    const positions = [
        [-3, 2.5, 1.5],
        [0, 5, 2.5],
        [3, 2.5, 1.5],
    ];

    return (
        <group>
            {positions.map((pos, i) => (
                <DataNode key={i} position={pos as [number, number, number]} index={i} />
            ))}
        </group>
    );
}

function DataNode({ position, index }: { position: [number, number, number]; index: number }) {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.elapsedTime * 0.5;
            ref.current.rotation.z = Math.sin(clock.elapsedTime + index) * 0.2;
        }
    });

    return (
        <group position={position} ref={ref}>
            <Box args={[0.2, 0.2, 0.2]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                <meshStandardMaterial
                    color="#1a1a2e"
                    metalness={0.9}
                    roughness={0.2}
                    emissive={index === 1 ? "#00e5ff" : "#a855f7"}
                    emissiveIntensity={0.5}
                />
            </Box>
            {/* Glow ring */}
            <Torus args={[0.3, 0.01, 8, 32]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color={index === 1 ? "#00e5ff" : "#a855f7"} transparent opacity={0.3} />
            </Torus>
        </group>
    );
}

// Floating satellites around the scene
export function Satellites() {
    return (
        <group>
            <Satellite position={[-8, 6, -5]} color="#00e5ff" />
            <Satellite position={[8, 7, -4]} color="#a855f7" />
            <Satellite position={[0, 8, -8]} color="#22c55e" />
        </group>
    );
}

function Satellite({ position, color }: { position: [number, number, number]; color: string }) {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.elapsedTime * 0.2;
            ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.5;
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* Body */}
            <Box args={[0.3, 0.15, 0.15]}>
                <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </Box>
            {/* Solar panels */}
            <Box args={[0.02, 0.4, 0.2]} position={[-0.25, 0, 0]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </Box>
            <Box args={[0.02, 0.4, 0.2]} position={[0.25, 0, 0]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </Box>
            {/* Antenna */}
            <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
        </group>
    );
}

// CORS Firewall Shield (appears at server)
export function CorsFirewall({ active, blocked }: { active: boolean; blocked: boolean }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (ref.current && active) {
            ref.current.rotation.z = clock.elapsedTime * 0.5;
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.3 + Math.sin(clock.elapsedTime * 3) * 0.1;
        }
    });

    if (!active) return null;

    return (
        <group position={[4, 0, 0]}>
            {/* Shield hexagon pattern */}
            <mesh ref={ref} rotation={[0, -Math.PI / 4, 0]}>
                <torusGeometry args={[2, 0.05, 6, 6]} />
                <meshBasicMaterial color={blocked ? "#ef4444" : "#22c55e"} transparent opacity={0.4} />
            </mesh>

            {/* Inner shield */}
            <mesh rotation={[0, -Math.PI / 4, 0]}>
                <ringGeometry args={[1.5, 2, 6]} />
                <meshBasicMaterial
                    color={blocked ? "#ef4444" : "#22c55e"}
                    transparent
                    opacity={0.1}
                    side={THREE.DoubleSide}
                />
            </mesh>

            <Text position={[0.5, 2.5, 0]} fontSize={0.12} color={blocked ? "#ef4444" : "#22c55e"} anchorX="center">
                {blocked ? "CORS BLOCKED" : "CORS ALLOWED"}
            </Text>
        </group>
    );
}

// Holographic Info Display
export function HolographicDisplay({ position, title, value }: { position: [number, number, number]; title: string; value: string }) {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* Background panel */}
            <mesh>
                <planeGeometry args={[1.5, 0.6]} />
                <meshBasicMaterial color="#00e5ff" transparent opacity={0.05} side={THREE.DoubleSide} />
            </mesh>

            {/* Border */}
            <mesh>
                <ringGeometry args={[0.7, 0.75, 4]} />
                <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>

            <Text position={[0, 0.1, 0.01]} fontSize={0.08} color="#00e5ff" anchorX="center">
                {title}
            </Text>
            <Text position={[0, -0.1, 0.01]} fontSize={0.12} color="#ffffff" anchorX="center">
                {value}
            </Text>
        </group>
    );
}

// Floating tech platforms
export function TechPlatforms() {
    return (
        <group>
            <Platform position={[-7, -2, 3]} size={2} color="#00e5ff" />
            <Platform position={[7, -2, 3]} size={2} color="#a855f7" />
            <Platform position={[0, -2, -5]} size={3} color="#22c55e" />
        </group>
    );
}

function Platform({ position, size, color }: { position: [number, number, number]; size: number; color: string }) {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.elapsedTime * 0.1;
            ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.3) * 0.2;
        }
    });

    return (
        <group ref={ref} position={position}>
            {/* Main platform */}
            <mesh>
                <cylinderGeometry args={[size * 0.5, size * 0.6, 0.1, 6]} />
                <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Edge glow */}
            <mesh position={[0, 0.02, 0]}>
                <torusGeometry args={[size * 0.55, 0.02, 8, 6]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>

            {/* Center hologram */}
            <mesh position={[0, 0.3, 0]}>
                <coneGeometry args={[0.1, 0.4, 4]} />
                <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
        </group>
    );
}

// Connection beams between major points
export function ConnectionBeams() {
    return (
        <group>
            {/* Beam from Browser area */}
            <Beam from={[-5, -3, 0]} to={[-5, 3, 0]} color="#00e5ff" />

            {/* Beam from Server area */}
            <Beam from={[5, -3, 0]} to={[5, 3, 0]} color="#a855f7" />
        </group>
    );
}

function Beam({ from, to, color }: { from: [number, number, number]; to: [number, number, number]; color: string }) {
    const ref = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            mat.opacity = 0.1 + Math.sin(clock.elapsedTime * 2) * 0.05;
        }
    });

    const midPoint = [
        (from[0] + to[0]) / 2,
        (from[1] + to[1]) / 2,
        (from[2] + to[2]) / 2,
    ];
    const length = Math.sqrt(
        Math.pow(to[0] - from[0], 2) +
        Math.pow(to[1] - from[1], 2) +
        Math.pow(to[2] - from[2], 2)
    );

    return (
        <mesh ref={ref} position={midPoint as [number, number, number]}>
            <cylinderGeometry args={[0.02, 0.02, length, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
    );
}
