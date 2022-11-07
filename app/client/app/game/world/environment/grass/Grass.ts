import {
    BufferGeometry,
    CanvasTexture,
    DoubleSide,
    Group,
    Mesh,
    MeshBasicMaterial,
    MeshDepthMaterial,
    MeshPhongMaterial,
    NearestFilter,
    PlaneGeometry,
    RGBADepthPacking,
    Uniform,
} from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import Assets from '../../../assets/Assets';
import { GlobalStore } from '../../../globalStore/GlobalStore';
import LoopsManager from '../../../loopsManager/LoopsManager';
import Day from '../../day/Day';

export class Grass {
    private group: Group;
    private mover: Mesh;
    private moverEnabled = false;
    private uniforms = {
        uTime: {
            value: 0,
        },
        uGrassHeight: {
            value: null,
        },
    };

    private grassHeightCanvas: {
        ctx: CanvasRenderingContext2D;
        canvas: HTMLCanvasElement;
        resolution: number;
    };
    private grassHeightTexture: CanvasTexture;

    constructor() {
        LoopsManager.subscribe('update', this.update);
        LoopsManager.subscribe('userActions', this.mowGrass);
        Day.subscribe(this.dayUpdate);

        this.grassHeightCanvas = this.createСanvas();
        this.grassHeightTexture = new CanvasTexture(this.grassHeightCanvas.canvas);
        this.grassHeightTexture.flipY = false;
        const mesh = this.createMesh();
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        this.mover = this.createMover();
        this.group = new Group();
        this.group.add(mesh, this.mover);

        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('keyup', this.keyDownListener);
    }

    private keyDownListener = (e: KeyboardEvent) => {
        if (e.code === 'KeyM') this.moverEnabled = e.type === 'keydown';
    };

    private createСanvas() {
        const resolution = 1024;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = resolution;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, resolution, resolution);

        return { canvas, ctx, resolution };
    }

    private update = (time: number) => {
        this.uniforms.uTime.value = time;

        const { x, z } = GlobalStore.cameraTarget;
        this.mover.position.set(x, 0.01, z);
    };

    private dayUpdate = (time: number) => {
        this.grow(time);
    };

    private grow = (time: number) => {
        if (time % 180 === 0) {
            const { ctx, resolution } = this.grassHeightCanvas;
            ctx.fillStyle = 'rgba(255,255,255,0.01)';
            ctx.fillRect(0, 0, resolution, resolution);
            this.grassHeightTexture.needsUpdate = true;
        }
    };

    private createMover() {
        const mover = new Mesh(
            new PlaneGeometry(),
            new MeshBasicMaterial({
                map: Assets.getTexture('grassMover'),
                alphaTest: 0.5,
            })
        );
        mover.rotateX(-Math.PI / 2);
        mover.position.y = 0.01;
        return mover;
    }

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

        const grassHeightTexture = this.grassHeightTexture;
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
                 vPosition.y -= 0.175;
                 vPosition.y += height_value * 0.175;
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
                 vPosition.y -= 0.175;
                 vPosition.y += height_value * 0.175;
                 vPosition.z += sin(vPosition.y * (normal.z) * (uTime * 10.0)) * 0.05 ;
                 gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                `
            );

            shader.vertexShader = vertex;
        };

        return mesh;
    }

    private mowGrass = () => {
        this.mover.visible = this.moverEnabled;
        if (!this.moverEnabled) {
            return;
        }

        const { ctx, resolution } = this.grassHeightCanvas;
        const { x, z } = GlobalStore.cameraTarget;

        const canvas_x = ((x + 5) / 5) * (resolution / 2);
        const canvas_y = ((z + 5) / 5) * (resolution / 2);
        const radius = (this.mover.scale.x / 15) * resolution;
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(canvas_x, canvas_y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this.grassHeightTexture.needsUpdate = true;
    };

    getMesh() {
        return this.group;
    }
}
