import { DoubleSide, Mesh, MeshDepthMaterial, MeshPhongMaterial, RGBADepthPacking } from 'three';
import { Point2 } from '../../../../../utils/Geometry';
import Random from '../../../../../utils/random';
import Assets from '../../../../assets/Assets';
import LoopsManager from '../../../../loopsManager/LoopsManager';
import { GROUND_SIZE } from '../../ground/Ground';
import { UNIFORM_WIND_DIRECTION, UNIFORM_WIND_STRENGTH } from '../Grass';
import { EWeeds, WEED_CONFIG } from './config';

const getWeedRandomType = (random: number) => {
    const types = Object.keys(WEED_CONFIG) as EWeeds[];
    const index = Math.floor(types.length * random);
    return types[index];
};

const getWeedRandomNumberByType = (random: number, type: EWeeds) => {
    const count = WEED_CONFIG[type] as number;
    const index = Math.floor(count * random) + 1;
    return index;
};

let WeedsMaterials: Record<string, { base: MeshPhongMaterial; depth: MeshDepthMaterial }> | null = null;

export default class Weed {
    static initMaterialsAtlas() {
        const uniforms = {
            uTime: {
                value: 0,
            },
        };

        LoopsManager.subscribe('update', (time) => {
            uniforms.uTime.value = time;
        });

        const atlas: Record<string, { base: MeshPhongMaterial; depth: MeshDepthMaterial }> = {};
        Object.keys(WEED_CONFIG).forEach((weedType) => {
            const texture = Assets.getTexture(weedType);
            const base = new MeshPhongMaterial({
                map: texture,
                side: DoubleSide,
                alphaTest: 0.1,
                alphaMap: texture,
            });

            base.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = uniforms.uTime;
                shader.uniforms.uWindStrength = UNIFORM_WIND_STRENGTH;
                shader.uniforms.uWindDirection = UNIFORM_WIND_DIRECTION;

                let vertex = shader.vertexShader;
                vertex = vertex.replace(
                    '#include <common>',
                    `#include <common>
                     uniform float uTime;
                     uniform float uWindStrength;
                     uniform vec2 uWindDirection;
                    `
                );
                vertex = vertex.replace(
                    '#include <clipping_planes_vertex>',
                    `#include <clipping_planes_vertex>
                     vec3 vPosition = position;

                     // wind
                     float windBiasValue = 0.025;
                    
                     //wind small hesitation
                     float hesitation = sin(uTime * 20.0) * uWindStrength;
                     float windBias =  hesitation * max(position.y, 0.0) * windBiasValue;
                     windBias += hesitation * windBiasValue * 0.01 * normal.x;
                     vPosition.x += windBias;
                     vPosition.z += windBias;

                     // wind waves
                     float xPosValue = max(sin(uTime + position.x * 0.5), 0.0);
                     float zPosValue = max(sin(uTime + position.z * 0.5), 0.0);
     
                     // here use position with height
                     vPosition.x += xPosValue * (-uWindDirection.x * uWindStrength) * vPosition.y * 0.25;
                     vPosition.z += zPosValue * (-uWindDirection.y * uWindStrength) * vPosition.y * 0.25;
                     vPosition.y -= (xPosValue + zPosValue) * position.y * 0.10 * uWindStrength;
     


                     gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                    `
                );
                shader.vertexShader = vertex;
            };

            const depth = new MeshDepthMaterial({
                depthPacking: RGBADepthPacking,
                map: texture,
                alphaTest: 0.5,
            });
            depth.onBeforeCompile = (shader) => {
                shader.uniforms.uTime = uniforms.uTime;
                shader.uniforms.uWindStrength = UNIFORM_WIND_STRENGTH;
                shader.uniforms.uWindDirection = UNIFORM_WIND_DIRECTION;

                let vertex = shader.vertexShader;
                vertex = vertex.replace(
                    '#include <common>',
                    `#include <common>
                     uniform float uTime;
                     uniform float uWindStrength;
                     uniform vec2 uWindDirection;
                    `
                );
                vertex = vertex.replace(
                    '#include <clipping_planes_vertex>',
                    `#include <clipping_planes_vertex>
                     vec3 vPosition = position;

                     // wind
                     float windBiasValue = 0.2;
    
                     //wind small hesitation
                     float hesitation = sin(uTime * 10.0 + normal.z + normal.x) * uWindStrength;
                     float windBias =  hesitation * max(position.y, 0.0) * windBiasValue;
                     windBias += hesitation * windBiasValue * 0.01;
                     vPosition.x += windBias * normal.x;
                     vPosition.z += windBias * normal.z;


                     gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
                    `
                );
                shader.vertexShader = vertex;
            };
            atlas[weedType] = { base, depth };
        });

        return atlas;
    }

    private position: Point2;

    private random: Random;
    private seed: number;
    private mesh: Mesh;

    constructor(seed = Math.random()) {
        const x = (Math.random() - 0.5) * GROUND_SIZE;
        const z = (Math.random() - 0.5) * GROUND_SIZE;

        this.position = new Point2(x, z);

        this.seed = seed;
        this.random = new Random(seed * 10000);
        const type = getWeedRandomType(this.random.get());
        const number = getWeedRandomNumberByType(this.random.get(), type);

        const geometry = Assets.getGeometry(`${type}_${number}`).clone();
        const rotation = Math.PI * 4 * this.random.get();
        geometry.rotateY(rotation);
        geometry.translate(x, 0, z);

        if (WeedsMaterials === null) {
            WeedsMaterials = Weed.initMaterialsAtlas();
        }

        const materials = WeedsMaterials[type];

        this.mesh = new Mesh(geometry, materials.base);
        this.mesh.customDepthMaterial = materials.depth;

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }

    public getSeed() {
        return this.seed;
    }

    public getMesh() {
        return this.mesh;
    }

    public getPositionPoint() {
        return this.position;
    }
}
