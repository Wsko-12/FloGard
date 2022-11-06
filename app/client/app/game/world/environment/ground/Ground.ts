import { DoubleSide, Mesh, MeshToonMaterial } from 'three';
import Assets from '../../../assets/Assets';

export default class Ground {
    private mesh: Mesh;
    constructor() {
        const geometry = Assets.getGeometry('ground');
        const texture = Assets.getTexture('ground');
        const material = new MeshToonMaterial({ map: texture, alphaTest: 0.5, side: DoubleSide });
        const mesh = new Mesh(geometry, material);
        mesh.receiveShadow = true;
        this.mesh = mesh;
    }

    getMesh() {
        return this.mesh;
    }
}
