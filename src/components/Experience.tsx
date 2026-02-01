import { Environment, Float, PerspectiveCamera, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useStore } from "../store/useStore";
import { damp3 } from "maath/easing";

export const Experience = () => {
    const currentStation = useStore((state) => state.currentStation);

    // Camera Rig
    // We can animate the camera position based on the currentStation
    useFrame((state, delta) => {
        // Station 0: Home view
        // Station 1: Detail view

        const targetPos = new THREE.Vector3(0, 0, 8);
        if (currentStation === 1) targetPos.set(4, 0, 4);
        if (currentStation === 2) targetPos.set(-4, 0, 4);

        damp3(state.camera.position, targetPos, 0.4, delta);

        // Make camera always look at center (or varying targets)
        state.camera.lookAt(0, 0, 0);
    });

    return (
        <>
            {/* Lighting & Environment */}
            <Environment preset="city" />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />
            <spotLight position={[-10, 10, 10]} intensity={2} color="#ff003c" angle={0.5} penumbra={1} />

            {/* 3D Elements */}
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <group position={[0, 0, 0]}>
                    <mesh>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#333" roughness={0.2} metalness={0.8} />
                    </mesh>
                    {/* Wireframe overlay for "Tech" look */}
                    <mesh scale={[1.01, 1.01, 1.01]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial wireframe color="#00f0ff" />
                    </mesh>
                </group>
            </Float>

            {/* Background Particles or Grid could go here */}
            <gridHelper args={[20, 20, 0x222222, 0x111111]} position={[0, -2, 0]} />
        </>
    );
};
