import { DoubleSide, Mesh, MeshDepthMaterial, MeshPhongMaterial, RGBADepthPacking } from 'three';
import { Point2 } from '../../../../../utils/Geometry';
import Random from '../../../../../utils/random';
import Assets from '../../../../assets/Assets';
import LoopsManager from '../../../../loopsManager/LoopsManager';
import { GROUND_SIZE } from '../../ground/Ground';
import { UNIFORM_WIND_STRENGTH } from '../Grass';
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

                let vertex = shader.vertexShader;
                vertex = vertex.replace(
                    '#include <common>',
                    `#include <common>
                     uniform float uWindStrength;
                     uniform float uTime;
                    `
                );

                vertex = vertex.replace(
                    '#include <fog_vertex>',
                    `#include <fog_vertex>
                     vec3 vPosition = position;
                     vPosition.z += sin(vPosition.y * (uTime * uWindStrength)) * 0.04 ;
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

                let vertex = shader.vertexShader;
                vertex = vertex.replace(
                    '#include <common>',
                    `#include <common>
                     uniform float uWindStrength;
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
                     vPosition.z += sin(vPosition.y * (normal.z) * (uTime * uWindStrength)) * 0.05 ;
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

        const geometry = Assets.getGeometry(`${type}_${number}`);

        if (WeedsMaterials === null) {
            WeedsMaterials = Weed.initMaterialsAtlas();
        }

        const materials = WeedsMaterials[type];

        this.mesh = new Mesh(geometry, materials.base);
        this.mesh.customDepthMaterial = materials.depth;
        const rotation = Math.PI * 4 * this.random.get();

        this.mesh.position.set(x, 0, z);
        this.mesh.rotation.set(0, rotation, 0);
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
