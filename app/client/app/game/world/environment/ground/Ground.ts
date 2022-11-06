import { DoubleSide, Mesh, MeshToonMaterial } from 'three';
import Assets from '../../../assets/Assets';

export default class Ground {
    private mesh: Mesh;
    constructor() {
        const geometry = Assets.getGeometry('ground');
        const texture = Assets.getTexture('ground');
        const material = new MeshToonMaterial({ map: texture, alphaTest: 0.5, side: DoubleSide });
        const mesh = new Mesh(geometry, material);
        mesh.scale.set(1.03, 1, 1.03);
        mesh.receiveShadow = true;
        this.mesh = mesh;
    }

    getMesh() {
        return this.mesh;
    }
}
