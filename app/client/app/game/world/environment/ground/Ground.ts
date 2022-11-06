import { DoubleSide, Mesh, MeshBasicMaterial } from 'three';
import Assets from '../../../assets/Assets';

export default class Ground {
    private mesh: Mesh;
    constructor() {
        const geometry = Assets.getGeometry('ground');
        const texture = Assets.getTexture('ground');
        const material = new MeshBasicMaterial({ map: texture, alphaTest: 0.5, side: DoubleSide });
        const mesh = new Mesh(geometry, material);
        this.mesh = mesh;
    }

    getMesh() {
        return this.mesh;
    }
}
