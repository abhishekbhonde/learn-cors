'use client';
import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleField({ count = 200 }) {
    const ref = useRef<THREE.Points>(null);

    // Generate random positions in a box volume
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        const cyanColor = new THREE.Color('#00e5ff');
        const purpleColor = new THREE.Color('#a855f7');
        const whiteColor = new THREE.Color('#ffffff');

        for (let i = 0; i < count; i++) {
            // Position in a large box
            positions[i * 3] = (Math.random() - 0.5) * 30;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            // Random color selection
            const rand = Math.random();
            const color = rand < 0.4 ? cyanColor : rand < 0.7 ? purpleColor : whiteColor;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return { positions, colors };
    }, [count]);

    useFrame((state, delta) => {
        if (ref.current) {
            // Slow rotation
            ref.current.rotation.y += delta * 0.02;
            ref.current.rotation.x += delta * 0.01;

            // Drift particles upward slowly
            const positions = ref.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < count; i++) {
                positions[i * 3 + 1] += delta * 0.1; // Y drift

                // Wrap around
                if (positions[i * 3 + 1] > 10) {
                    positions[i * 3 + 1] = -10;
                }
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <Points ref={ref} limit={count}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <PointMaterial
                transparent
                vertexColors
                size={0.08}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
}
