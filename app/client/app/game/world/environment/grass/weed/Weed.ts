import { DoubleSide, Mesh, MeshPhongMaterial } from 'three';
import { Point2 } from '../../../../../utils/Geometry';
import Random from '../../../../../utils/random';
import Assets from '../../../../assets/Assets';
import { GROUND_SIZE } from '../../ground/Ground';
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

let WeedsMaterials: Record<string, MeshPhongMaterial> | null = null;

export default class Weed {
    static initMaterialsAtlas() {
        const atlas: Record<string, MeshPhongMaterial> = {};
        Object.keys(WEED_CONFIG).forEach((weedType) => {
            const texture = Assets.getTexture(weedType);
            const material = new MeshPhongMaterial({
                map: texture,
                side: DoubleSide,
                alphaTest: 0.1,
                alphaMap: texture,
            });

            atlas[weedType] = material;
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

        const material = WeedsMaterials[type];

        this.mesh = new Mesh(geometry, material);
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
