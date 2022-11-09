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
    Vector2,
} from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Point2 } from '../../../../utils/Geometry';
import Assets from '../../../assets/Assets';
import { GlobalStore } from '../../../globalStore/GlobalStore';
import LoopsManager from '../../../loopsManager/LoopsManager';
import Day, { FULL_DAY_TIME } from '../../day/Day';
import { GROUND_SIZE } from '../ground/Ground';
import Weed from './weed/Weed';

export const UNIFORM_WIND_STRENGTH = {
    value: 1,
};

export const UNIFORM_WIND_DIRECTION = {
    value: new Vector2(1, 0),
};

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

    private weeds: Weed[] = [];
    private weedsMeshesGroup = new Group();

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
        this.group.add(mesh, this.mover, this.weedsMeshesGroup);

        document.addEventListener('keydown', this.keyDownListener);
        document.addEventListener('keyup', this.keyDownListener);

        for (let i = 0; i < 15; i++) {
            this.generateWeed();
        }
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

    private dayUpdate = (time: number) => {
        this.grow(time);
        if (time === FULL_DAY_TIME - 1) {
            this.generateWeed();
        }
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

    private generateWeed() {
        // use load here
        const weed = new Weed();
        this.weeds.push(weed);
        this.weedsMeshesGroup.add(weed.getMesh());
    }

    private removeWeeds(toRemove: number[]) {
        this.weeds = this.weeds.filter((weed, i) => {
            const isRemove = toRemove.includes(i);
            if (isRemove) {
                this.weedsMeshesGroup.remove(weed.getMesh());
            }
            return !isRemove;
        });
    }

    private update = (time: number) => {
        this.uniforms.uTime.value = time;

        const { x, z } = GlobalStore.cameraTarget;
        this.mover.position.set(x, 0.01, z);

        const strength = Math.abs(Math.sin(time * 0.1));
        console.log(strength);
        UNIFORM_WIND_STRENGTH.value = 1;
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

        const grassHeightTexture = this.grassHeightTexture;
        this.uniforms.uGrassHeight = new Uniform(grassHeightTexture);

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = this.uniforms.uTime;
            shader.uniforms.uGrassHeight = this.uniforms.uGrassHeight;
            shader.uniforms.uWindStrength = UNIFORM_WIND_STRENGTH;
            shader.uniforms.uWindDirection = UNIFORM_WIND_DIRECTION;
            let vertex = shader.vertexShader;
            vertex = vertex.replace(
                '#include <common>',
                `#include <common>
                 uniform float uTime;
                 uniform float uWindStrength;
                 uniform vec2 uWindDirection;
                 uniform sampler2D uGrassHeight;
                `
            );

            vertex = vertex.replace(
                '#include <fog_vertex>',
                `#include <fog_vertex>

                 vec3 vPosition = position;

                 // height
                 float x_p = position.x / 10.0 + 0.5;
                 float z_p = position.z / 10.0 + 0.5;
                 float height_value = texture2D(uGrassHeight, vec2(x_p, z_p)).r;
                 float heightBias = height_value * 0.175 - 0.175;
                 vPosition.y += heightBias;


                 // wind
                 float windBiasValue = 0.1;

                 //wind small hesitation
                 float hesitation = sin(uTime * 10.0 + normal.z + normal.x) * uWindStrength;
                 float windBias =  hesitation * max(position.y, 0.0) * windBiasValue;
                //  windBias += hesitation * windBiasValue * 0.01;
                 vPosition.x += windBias * normal.x;
                 vPosition.z += windBias * normal.z;


                 // wind waves
                float xPosValue = max(sin(uTime + position.x * 0.5), 0.0);
                float zPosValue = max(sin(uTime + position.z * 0.5), 0.0);

                // here use position with height
                vPosition.x += xPosValue * (-uWindDirection.x * uWindStrength * 0.75) * vPosition.y;
                vPosition.z += zPosValue * (-uWindDirection.y * uWindStrength * 0.75) * vPosition.y;
                vPosition.y -= (xPosValue + zPosValue) * vPosition.y * 0.45 * uWindStrength;


                // test wave
                // vPosition.y += max(sin(uTime + position.x * 0.5), 0.0);
        

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
            shader.uniforms.uWindStrength = UNIFORM_WIND_STRENGTH;
            shader.uniforms.uWindDirection = UNIFORM_WIND_DIRECTION;

            let vertex = shader.vertexShader;

            vertex = vertex.replace(
                '#include <common>',
                `#include <common>
                uniform float uTime;
                uniform float uWindStrength;
                uniform vec2 uWindDirection;
                uniform sampler2D uGrassHeight;
                `
            );

            vertex = vertex.replace(
                '#include <clipping_planes_vertex>',
                `#include <clipping_planes_vertex>
                vec3 vPosition = position;

                // height
                float x_p = position.x / 10.0 + 0.5;
                float z_p = position.z / 10.0 + 0.5;
                float height_value = texture2D(uGrassHeight, vec2(x_p, z_p)).r;
                float heightBias = height_value * 0.175 - 0.175;
                vPosition.y += heightBias;

                // wind
                float windBiasValue = 0.1;


                //wind small hesitation
                float hesitation = sin(uTime * 10.0 + normal.z + normal.x) * uWindStrength;
                float windBias =  hesitation * max(position.y, 0.0) * windBiasValue;
                // windBias += hesitation * windBiasValue * 0.01;
                vPosition.x += windBias * normal.x;
                vPosition.z += windBias * normal.z;


                // wind waves
               float xPosValue = max(sin(uTime + position.x * 0.5), 0.0);
               float zPosValue = max(sin(uTime + position.z * 0.5), 0.0);

               // here use position with height
               vPosition.x += xPosValue * (-uWindDirection.x * uWindStrength * 0.75) * vPosition.y;
               vPosition.z += zPosValue * (-uWindDirection.y * uWindStrength * 0.75) * vPosition.y;
               vPosition.y -= (xPosValue + zPosValue) * vPosition.y * 0.45 * uWindStrength;

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

        const canvas_x = ((x + GROUND_SIZE / 2) / (GROUND_SIZE / 2)) * (resolution / 2);
        const canvas_y = ((z + GROUND_SIZE / 2) / (GROUND_SIZE / 2)) * (resolution / 2);
        const radius = (this.mover.scale.x / (GROUND_SIZE * 1.5)) * resolution;
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(canvas_x, canvas_y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this.grassHeightTexture.needsUpdate = true;

        const mowPoint = new Point2(x, z);

        const toRemove: number[] = [];
        this.weeds.forEach((weed, i) => {
            const weedPoint = weed.getPositionPoint();
            const distance = mowPoint.getDistanceTo(weedPoint);
            if (distance < 0.5) {
                toRemove.push(i);
            }
        });

        this.removeWeeds(toRemove);
    };

    getMesh() {
        return this.group;
    }
}
