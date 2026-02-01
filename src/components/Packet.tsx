'use client';
import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import type { SimulationOutput } from '../lib/corsLogic';

interface PacketProps {
    simulation: SimulationOutput;
    onComplete: () => void;
}

export default function Packet({ simulation, onComplete }: PacketProps) {
    // Main Packet Refs
    const mainGroupRef = useRef<THREE.Group>(null);
    const mainMeshRef = useRef<THREE.Mesh>(null);
    const preflightGroupRef = useRef<THREE.Group>(null);
    const preflightMeshRef = useRef<THREE.Mesh>(null);
    const responseGroupRef = useRef<THREE.Group>(null);

    // Particles & Rings
    const particlesRef = useRef<THREE.Group>(null);
    const ringsRef = useRef<THREE.Group>(null);

    // State for labels
    const [label, setLabel] = useState<string>("");
    const [labelColor, setLabelColor] = useState('text-cyan-400');
    const [showMainLabel, setShowMainLabel] = useState(false);
    const [showPreflightLabel, setShowPreflightLabel] = useState(false);
    const [showResponseLabel, setShowResponseLabel] = useState(false);

    // Animation progress values
    const progress = useRef({ main: 0, preflight: 0, response: 0 });

    // Curve: Browser [-5,0,0] -> Server [5,0,0]
    const forwardCurve = useMemo(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(-5, 0, 0),
        new THREE.Vector3(-3, 2.5, 1.5),
        new THREE.Vector3(0, 5, 2.5),
        new THREE.Vector3(3, 2.5, 1.5),
        new THREE.Vector3(5, 0, 0),
    ]), []);

    // Curve: Server [5,0,0] -> Browser [-5,0,0]
    const reverseCurve = useMemo(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(5, 0, 0),
        new THREE.Vector3(3, 2.5, 1.5),
        new THREE.Vector3(0, 5, 2.5),
        new THREE.Vector3(-3, 2.5, 1.5),
        new THREE.Vector3(-5, 0, 0),
    ]), []);

    // Spawn burst particles
    const spawnParticles = (pos: THREE.Vector3, count: number, color: string, type: 'burst' | 'shatter') => {
        if (!particlesRef.current) return;

        for (let i = 0; i < count; i++) {
            const geometry = type === 'burst'
                ? new THREE.SphereGeometry(0.06, 8, 8)
                : new THREE.BoxGeometry(0.08, 0.08, 0.08);
            const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 });
            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.copy(pos);
            particlesRef.current.add(mesh);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4 + (type === 'shatter' ? -2 : 0),
                (Math.random() - 0.5) * 4
            );

            gsap.to(mesh.position, {
                x: pos.x + velocity.x,
                y: pos.y + velocity.y,
                z: pos.z + velocity.z,
                duration: type === 'burst' ? 0.8 : 0.7,
                ease: 'power2.out'
            });
            gsap.to(material, {
                opacity: 0,
                duration: type === 'burst' ? 0.8 : 0.7,
                onComplete: () => {
                    particlesRef.current?.remove(mesh);
                    geometry.dispose();
                    material.dispose();
                }
            });
        }
    };

    // Spawn impact ring
    const spawnRing = (pos: THREE.Vector3, color: string) => {
        if (!ringsRef.current) return;
        const geometry = new THREE.TorusGeometry(1, 0.04, 16, 100);
        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        mesh.lookAt(pos.clone().add(new THREE.Vector3(0, 0, 1)));
        ringsRef.current.add(mesh);

        gsap.to(mesh.scale, { x: 2.2, y: 2.2, z: 1, duration: 0.6, ease: 'power2.out' });
        gsap.to(material, {
            opacity: 0,
            duration: 0.6,
            onComplete: () => {
                ringsRef.current?.remove(mesh);
                geometry.dispose();
                material.dispose();
            }
        });
    };

    useEffect(() => {
        // Reset all states
        progress.current = { main: 0, preflight: 0, response: 0 };
        setShowMainLabel(false);
        setShowPreflightLabel(false);
        setShowResponseLabel(false);

        if (mainGroupRef.current) {
            mainGroupRef.current.visible = false;
            mainGroupRef.current.position.set(-5, 0, 0);
            mainGroupRef.current.scale.set(0.3, 0.3, 0.3);
        }
        if (preflightGroupRef.current) {
            preflightGroupRef.current.visible = false;
            preflightGroupRef.current.position.set(-5, 0, 0);
            preflightGroupRef.current.scale.set(0.2, 0.2, 0.2);
        }
        if (responseGroupRef.current) {
            responseGroupRef.current.visible = false;
            responseGroupRef.current.position.set(5, 0, 0);
            responseGroupRef.current.scale.set(0.15, 0.15, 0.15);
        }

        // Reset materials
        if (mainMeshRef.current) {
            (mainMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 1;
        }
        if (preflightMeshRef.current) {
            (preflightMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 1;
        }

        const tl = gsap.timeline({ onComplete });

        // Build animation based on steps
        simulation.steps.forEach((step) => {
            switch (step) {
                case 'LAUNCH_PREFLIGHT':
                    tl.call(() => {
                        setLabel("OPTIONS (Preflight)");
                        setLabelColor("text-purple-400");
                        setShowPreflightLabel(true);
                        if (preflightGroupRef.current) {
                            preflightGroupRef.current.visible = true;
                            preflightGroupRef.current.scale.set(0, 0, 0);
                        }
                        spawnParticles(new THREE.Vector3(-5, 0, 0), 12, '#a855f7', 'burst');
                    });
                    tl.to(preflightGroupRef.current!.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.15, ease: 'elastic.out(1, 0.5)' });
                    break;

                case 'TRAVEL_PREFLIGHT':
                    tl.to(progress.current, { preflight: 1, duration: 3.5, ease: 'power2.inOut' });
                    break;

                case 'PREFLIGHT_SUCCESS':
                    tl.call(() => {
                        setLabel("✓ Preflight Passed");
                        setLabelColor("text-green-400");
                        spawnRing(new THREE.Vector3(5, 0, 0), '#22c55e');
                    });
                    tl.to(preflightGroupRef.current!.scale, { x: 0.35, y: 0.35, z: 0.35, duration: 0.1 });
                    tl.to(preflightMeshRef.current!.material, { opacity: 0, duration: 0.3 });
                    tl.call(() => setShowPreflightLabel(false));
                    tl.to({}, { duration: 0.8 }); // Pause before main
                    break;

                case 'PREFLIGHT_BLOCKED':
                    tl.call(() => {
                        setLabel("✗ Preflight Failed");
                        setLabelColor("text-red-500");
                        spawnRing(new THREE.Vector3(5, 0, 0), '#ef4444');
                        spawnParticles(new THREE.Vector3(5, 0, 0), 10, '#ef4444', 'shatter');
                    });
                    tl.to(preflightGroupRef.current!.position, { x: "+=0.2", duration: 0.04, repeat: 5, yoyo: true });
                    tl.to(preflightMeshRef.current!.material, { opacity: 0, duration: 0.2 });
                    tl.to({}, { duration: 1.5 }); // Hold
                    break;

                case 'LAUNCH_MAIN':
                    tl.call(() => {
                        setLabel("HTTP REQUEST");
                        setLabelColor("text-cyan-400");
                        setShowMainLabel(true);
                        if (mainGroupRef.current) {
                            mainGroupRef.current.visible = true;
                            mainGroupRef.current.scale.set(0, 0, 0);
                            mainGroupRef.current.position.set(-5, 0, 0);
                        }
                        if (mainMeshRef.current) {
                            (mainMeshRef.current.material as THREE.MeshStandardMaterial).opacity = 1;
                        }
                        spawnParticles(new THREE.Vector3(-5, 0, 0), 12, '#00e5ff', 'burst');
                    });
                    tl.to(mainGroupRef.current!.scale, { x: 0.3, y: 0.3, z: 0.3, duration: 0.15, ease: 'elastic.out(1, 0.5)' });
                    break;

                case 'TRAVEL_MAIN':
                    tl.to(progress.current, { main: 1, duration: 4.5, ease: 'power2.inOut' });
                    break;

                case 'IMPACT_SUCCESS':
                    tl.call(() => {
                        setLabel("✓ ALLOWED");
                        setLabelColor("text-green-400");
                        spawnRing(new THREE.Vector3(5, 0, 0), '#22c55e');
                        spawnParticles(new THREE.Vector3(5, 0, 0), 24, '#22c55e', 'burst');
                    });
                    tl.to(mainGroupRef.current!.scale, { x: 0.5, y: 0.5, z: 0.5, duration: 0.08 });
                    tl.call(() => spawnRing(new THREE.Vector3(5, 0, 0), '#22c55e'));
                    tl.to(mainMeshRef.current!.material, { opacity: 0, duration: 0.3 });
                    tl.call(() => setShowMainLabel(false));
                    break;

                case 'IMPACT_BLOCKED':
                    tl.call(() => {
                        setLabel("✗ BLOCKED");
                        setLabelColor("text-red-500");
                        spawnRing(new THREE.Vector3(5, 0, 0), '#ef4444');
                        spawnParticles(new THREE.Vector3(5, 0, 0), 16, '#ef4444', 'shatter');
                    });
                    tl.to(mainGroupRef.current!.scale, { x: 0.45, y: 0.45, z: 0.45, duration: 0.06 });
                    tl.to(mainGroupRef.current!.position, { x: "+=0.25", duration: 0.04, repeat: 7, yoyo: true });
                    tl.to(mainMeshRef.current!.material, { opacity: 0, duration: 0.25 });
                    tl.to({}, { duration: 1.5 });
                    break;

                case 'RESPONSE_TRAVEL':
                    tl.call(() => {
                        setLabel("RESPONSE");
                        setLabelColor("text-green-300");
                        setShowResponseLabel(true);
                        setShowMainLabel(false);
                        if (responseGroupRef.current) {
                            responseGroupRef.current.visible = true;
                        }
                    });
                    tl.to(progress.current, { response: 1, duration: 3.0, ease: 'power2.inOut' });
                    tl.call(() => {
                        if (responseGroupRef.current) responseGroupRef.current.visible = false;
                        setShowResponseLabel(false);
                    });
                    break;
            }
        });

        return () => { tl.kill(); };
    }, [simulation, forwardCurve, reverseCurve, onComplete]);

    // Update positions every frame
    useFrame((state) => {
        // Main Packet
        if (mainGroupRef.current?.visible) {
            const point = forwardCurve.getPoint(Math.min(1, Math.max(0, progress.current.main)));
            mainGroupRef.current.position.copy(point);
            mainGroupRef.current.rotation.y += 0.08;

            if (mainMeshRef.current) {
                const mat = mainMeshRef.current.material as THREE.MeshStandardMaterial;
                mat.emissiveIntensity = 2.5 + Math.sin(state.clock.elapsedTime * 8) * 1.5;
            }
        }

        // Preflight Packet
        if (preflightGroupRef.current?.visible) {
            const point = forwardCurve.getPoint(Math.min(1, Math.max(0, progress.current.preflight)));
            preflightGroupRef.current.position.copy(point);
            preflightGroupRef.current.rotation.x += 0.1;
            preflightGroupRef.current.rotation.z += 0.1;
        }

        // Response Packet
        if (responseGroupRef.current?.visible) {
            const point = reverseCurve.getPoint(Math.min(1, Math.max(0, progress.current.response)));
            responseGroupRef.current.position.copy(point);
        }
    });

    return (
        <>
            {/* Particles & Rings Containers */}
            <group ref={particlesRef} />
            <group ref={ringsRef} />

            {/* Main Packet */}
            <group ref={mainGroupRef} visible={false}>
                <mesh ref={mainMeshRef}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial
                        color="#00e5ff"
                        emissive="#00e5ff"
                        emissiveIntensity={3}
                        transparent
                    />
                </mesh>
                {showMainLabel && (
                    <Html position={[0, 2, 0]} center distanceFactor={10}>
                        <div className={`text-[11px] font-bold tracking-[2px] uppercase whitespace-nowrap ${labelColor} drop-shadow-lg`}>
                            {label}
                        </div>
                    </Html>
                )}
            </group>

            {/* Preflight Packet (Octahedron) */}
            <group ref={preflightGroupRef} visible={false}>
                <mesh ref={preflightMeshRef}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial
                        color="#a855f7"
                        emissive="#a855f7"
                        emissiveIntensity={2.5}
                        transparent
                    />
                </mesh>
                {showPreflightLabel && (
                    <Html position={[0, 2, 0]} center distanceFactor={10}>
                        <div className={`text-[11px] font-bold tracking-[2px] uppercase whitespace-nowrap ${labelColor} drop-shadow-lg`}>
                            {label}
                        </div>
                    </Html>
                )}
            </group>

            {/* Response Packet */}
            <group ref={responseGroupRef} visible={false}>
                <mesh>
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial
                        color="#22c55e"
                        emissive="#22c55e"
                        emissiveIntensity={2}
                        transparent
                    />
                </mesh>
                {showResponseLabel && (
                    <Html position={[0, 1.5, 0]} center distanceFactor={10}>
                        <div className={`text-[11px] font-bold tracking-[2px] uppercase whitespace-nowrap ${labelColor} drop-shadow-lg`}>
                            {label}
                        </div>
                    </Html>
                )}
            </group>
        </>
    );
}
