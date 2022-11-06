import { BufferGeometry, Mesh, MeshBasicMaterial } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Assets from '../../../assets/Assets';
import LoopsManager from '../../../loopsManager/LoopsManager';

export class Grass {
    private mesh: Mesh;
    private uniforms = {
        uTime: {
            value: 0,
        },
    };

    constructor() {
        this.mesh = this.createMesh();
        LoopsManager.subscribe('update', this.update);
    }

    private update = (time: number) => {
        this.uniforms.uTime.value = time;
    };

    private createMesh() {
        const grassGeometry = Assets.getGeometry('grass');
        const texture = Assets.getTexture('grass');

        const material = new MeshBasicMaterial({
            color: 0x415933,
            alphaMap: texture,
            alphaTest: 0.01,
        });

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = this.uniforms.uTime;
            let vertex = shader.vertexShader;
            vertex = vertex.replace(
                '#include <common>',
                `#include <common>
                uniform float uTime;
                `
            );

            vertex = vertex.replace(
                '#include <fog_vertex>',
                `#include <fog_vertex>
                 vec3 vPosition = position;
                 vPosition.z += sin(vPosition.y * (normal.z) * (uTime * 10.0)) * 0.05 ;
                 gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                `
            );
            shader.vertexShader = vertex;
        };

        //merged
        const geometries: BufferGeometry[] = [];
        for (let x = 0; x < 5; x++) {
            for (let y = 0; y < 5; y++) {
                const geometry = grassGeometry.clone();
                const shiftX = x * 1.85 - 3.7;
                const shiftZ = y * 1.85 - 3.7;
                geometry.translate(shiftX, 0, shiftZ);
                if (Math.random() > 0.5) {
                    geometry.rotateY(Math.PI * 2);
                }
                geometries.push(geometry);
            }
        }

        const merged = BufferGeometryUtils.mergeBufferGeometries(geometries);
        return new Mesh(merged, material);
    }

    getMesh() {
        return this.mesh;
    }
}
