import { BufferGeometry, DoubleSide, Mesh, MeshToonMaterial, NearestFilter } from 'three';
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
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        LoopsManager.subscribe('update', this.update);
        this.mesh.position.y = -0.08;
    }

    private update = (time: number) => {
        this.uniforms.uTime.value = time;
    };

    private createMesh() {
        const grassGeometry = Assets.getGeometry('grass');
        const texture = Assets.getTexture('grass');
        texture.minFilter = NearestFilter;

        const material = new MeshToonMaterial({
            color: 0x37452e,
            alphaMap: texture,
            alphaTest: 0.01,
            side: DoubleSide,
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
                const shiftX = x * 2 - 4;
                const shiftZ = y * 2 - 4;

                const angle = Math.floor(Math.random() * 4);
                geometry.rotateY(Math.PI * angle);

                geometry.translate(shiftX, 0, shiftZ);
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
