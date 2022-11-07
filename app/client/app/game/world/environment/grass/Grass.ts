import {
    BufferGeometry,
    DoubleSide,
    Mesh,
    MeshDepthMaterial,
    MeshPhongMaterial,
    MeshToonMaterial,
    NearestFilter,
    RepeatWrapping,
    RGBADepthPacking,
    Uniform,
} from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Assets from '../../../assets/Assets';
import LoopsManager from '../../../loopsManager/LoopsManager';

export class Grass {
    private mesh: Mesh;
    private uniforms = {
        uTime: {
            value: 0,
        },
        uGrassHeight: {
            value: null,
        },
    };

    constructor() {
        this.mesh = this.createMesh();
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        LoopsManager.subscribe('update', this.update);
        // this.mesh.position.y = -0.2;
    }

    private update = (time: number) => {
        this.uniforms.uTime.value = time;
    };

    private createMesh() {
        const grassGeometry = Assets.getGeometry('grass');
        const texture = Assets.getTexture('grass');
        texture.minFilter = NearestFilter;

        const material = new MeshPhongMaterial({
            color: 0x526644,
            map: texture,
            alphaTest: 0.5,
            side: DoubleSide,
        });

        const grassHeightTexture = Assets.getTexture('grassHeight');
        grassHeightTexture.wrapS = RepeatWrapping;
        grassHeightTexture.wrapT = RepeatWrapping;
        this.uniforms.uGrassHeight = new Uniform(grassHeightTexture);

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = this.uniforms.uTime;
            shader.uniforms.uGrassHeight = this.uniforms.uGrassHeight;
            let vertex = shader.vertexShader;
            vertex = vertex.replace(
                '#include <common>',
                `#include <common>
                 uniform float uTime;
                 uniform sampler2D uGrassHeight;
                `
            );

            vertex = vertex.replace(
                '#include <fog_vertex>',
                `#include <fog_vertex>
                 vec3 vPosition = position;
                 float x_p = vPosition.x / 10.0 + 0.5;
                 float z_p = vPosition.z / 10.0 + 0.5;
                 float height_value = texture2D(uGrassHeight, vec2(x_p, z_p)).r;
                 vPosition.y -= 0.2;
                 vPosition.y += height_value * 0.2;
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

        const mesh = new Mesh(merged, material);

        const depthMaterial = new MeshDepthMaterial({
            depthPacking: RGBADepthPacking,
            map: texture,
            alphaTest: 0.5,
        });
        mesh.customDepthMaterial = depthMaterial;

        depthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = this.uniforms.uTime;
            shader.uniforms.uGrassHeight = this.uniforms.uGrassHeight;
            let vertex = shader.vertexShader;

            vertex = vertex.replace(
                '#include <common>',
                `#include <common>
                 uniform float uTime;
                 uniform sampler2D uGrassHeight;
                `
            );

            vertex = vertex.replace(
                '#include <clipping_planes_vertex>',
                `#include <clipping_planes_vertex>
                 vec3 vPosition = position;
                 float x_p = vPosition.x / 10.0 + 0.5;
                 float z_p = vPosition.z / 10.0 + 0.5;
                 float height_value = texture2D(uGrassHeight, vec2(x_p, z_p)).r;
                 vPosition.y -= 0.2;
                 vPosition.y += height_value * 0.2;
                 vPosition.z += sin(vPosition.y * (normal.z) * (uTime * 10.0)) * 0.05 ;
                 gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                `
            );

            shader.vertexShader = vertex;
            console.log(shader.vertexShader);
        };

        return mesh;
    }

    getMesh() {
        return this.mesh;
    }
}
