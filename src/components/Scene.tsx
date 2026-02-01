'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import {
    Stars,
    Environment,
    OrbitControls,
    ContactShadows,
    Sparkles,
    Cloud,
    Sky
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import BrowserModel from './BrowserModel';
import ServerModel from './ServerModel';
import Packet from './Packet';
import ParticleField from './ParticleField';
import {
    InternetCloud,
    DataWaypoints,
    Satellites,
    CorsFirewall,
    HolographicDisplay,
    TechPlatforms,
    ConnectionBeams
} from './SceneElements';
import type { SimulationOutput } from '../lib/corsLogic';
import * as THREE from 'three';

interface SceneProps {
    simulation: SimulationOutput | null;
    isRunning: boolean;
    onAnimationComplete: () => void;
}

function SceneContent({ simulation, isRunning, onAnimationComplete, isMobile }: SceneProps & { isMobile: boolean }) {
    const browserPos: [number, number, number] = isMobile ? [0, 3.5, 0] : [-5, 0, 0];
    const serverPos: [number, number, number] = isMobile ? [0, -3.5, 0] : [5, 0, 0];

    const showFirewall = simulation !== null;
    const isBlocked = simulation?.wasBlocked ?? false;

    return (
        <>
            {/* Camera Controls */}
            <OrbitControls
                enableZoom={true}
                enablePan={false}
                minDistance={8}
                maxDistance={30}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.2}
                autoRotate={!isRunning}
                autoRotateSpeed={0.2}
            />

            {/* Fog for depth */}
            <fog attach="fog" args={['#050810', 20, 50]} />

            {/* Environment for reflections */}
            <Environment preset="night" />

            {/* === LIGHTING === */}
            <ambientLight intensity={0.1} color="#ffffff" />

            {/* Key Light - Cyan */}
            <spotLight
                position={[-12, 10, 8]}
                angle={0.3}
                penumbra={1}
                intensity={2.5}
                color="#00e5ff"
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            {/* Fill Light - Purple */}
            <spotLight
                position={[12, 10, 8]}
                angle={0.3}
                penumbra={1}
                intensity={2}
                color="#a855f7"
                castShadow
            />

            {/* Rim Light */}
            <spotLight
                position={[0, 15, -15]}
                angle={0.4}
                penumbra={0.5}
                intensity={1.5}
                color="#ffffff"
            />

            {/* Accent lights */}
            <pointLight position={[-5, 2, 3]} intensity={2} color="#00e5ff" distance={10} decay={2} />
            <pointLight position={[5, 2, 3]} intensity={2} color="#a855f7" distance={10} decay={2} />
            <pointLight position={[0, 8, 0]} intensity={1.5} color="#22c55e" distance={15} decay={2} />

            {/* === GROUND & GRID === */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]} receiveShadow>
                <planeGeometry args={[80, 80]} />
                <meshStandardMaterial
                    color="#030308"
                    metalness={0.95}
                    roughness={0.2}
                    envMapIntensity={0.3}
                />
            </mesh>

            <gridHelper args={[80, 80, 0x00e5ff, 0x0a0a15]} position={[0, -3.49, 0]} />

            <ContactShadows
                position={[0, -3.4, 0]}
                opacity={0.5}
                scale={40}
                blur={2.5}
                far={15}
                color="#000000"
            />

            {/* === BACKGROUND ELEMENTS === */}
            <Stars radius={100} depth={80} count={6000} factor={6} saturation={0.3} fade speed={0.3} />

            <Sparkles count={150} scale={30} size={3} speed={0.2} opacity={0.4} color="#00e5ff" />
            <Sparkles count={100} scale={30} size={2} speed={0.3} opacity={0.3} color="#a855f7" />
            <Sparkles count={50} scale={30} size={1.5} speed={0.4} opacity={0.2} color="#ffffff" />

            <ParticleField count={300} />

            {/* === SCENE ELEMENTS === */}
            <InternetCloud />
            <DataWaypoints />
            <Satellites />
            <TechPlatforms />
            <ConnectionBeams />

            {/* Holographic displays */}
            <HolographicDisplay
                position={[-8, 2, 2]}
                title="ORIGIN"
                value="localhost:3000"
            />
            <HolographicDisplay
                position={[8, 2, 2]}
                title="TARGET"
                value="api.server.com"
            />

            {/* CORS Firewall visualization */}
            <CorsFirewall active={showFirewall && !isRunning} blocked={isBlocked} />

            {/* === MAIN MODELS === */}
            <BrowserModel position={browserPos} />
            <ServerModel position={serverPos} />

            {/* Path visualization */}
            <mesh position={[0, 0, 0]}>
                <tubeGeometry args={[
                    new THREE.CatmullRomCurve3([
                        new THREE.Vector3(-5, 0, 0),
                        new THREE.Vector3(-3, 2.5, 1.5),
                        new THREE.Vector3(0, 5, 2.5),
                        new THREE.Vector3(3, 2.5, 1.5),
                        new THREE.Vector3(5, 0, 0),
                    ]),
                    64,
                    0.03,
                    8,
                    false
                ]} />
                <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} />
            </mesh>

            {/* Reverse path */}
            <mesh position={[0, -0.5, 0]}>
                <tubeGeometry args={[
                    new THREE.CatmullRomCurve3([
                        new THREE.Vector3(5, 0, 0),
                        new THREE.Vector3(3, -1.5, 1.5),
                        new THREE.Vector3(0, -2, 2),
                        new THREE.Vector3(-3, -1.5, 1.5),
                        new THREE.Vector3(-5, 0, 0),
                    ]),
                    64,
                    0.02,
                    8,
                    false
                ]} />
                <meshBasicMaterial color="#22c55e" transparent opacity={0.1} />
            </mesh>

            {/* === ANIMATION === */}
            {isRunning && simulation && (
                <Packet
                    simulation={simulation}
                    onComplete={onAnimationComplete}
                />
            )}

            {/* === POST-PROCESSING === */}
            <EffectComposer disableNormalPass>
                <Bloom
                    intensity={2.5}
                    luminanceThreshold={0.08}
                    luminanceSmoothing={0.9}
                    radius={1}
                    mipmapBlur
                />
                <Vignette eskil={false} offset={0.15} darkness={0.7} />
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={new THREE.Vector2(0.0008, 0.0008)}
                />
            </EffectComposer>
        </>
    );
}

export default function Scene({ simulation, isRunning, onAnimationComplete }: SceneProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const cameraPos: [number, number, number] = isMobile ? [0, 6, 20] : [0, 8, 18];

    return (
        <Canvas
            style={{ position: 'absolute', inset: 0, zIndex: 10 }}
            camera={{ position: cameraPos, fov: isMobile ? 50 : 42 }}
            gl={{
                alpha: true,
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.3
            }}
            shadows
            frameloop="always"
            dpr={[1, 2]}
        >
            <Suspense fallback={null}>
                <SceneContent
                    simulation={simulation}
                    isRunning={isRunning}
                    onAnimationComplete={onAnimationComplete}
                    isMobile={isMobile}
                />
            </Suspense>
        </Canvas>
    );
}
