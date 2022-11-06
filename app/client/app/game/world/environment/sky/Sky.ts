import { BackSide, Color, Mesh, MeshBasicMaterial, SphereBufferGeometry } from 'three';
import Assets from '../../../assets/Assets';
import World from '../../World';

export default class Sky {
    mesh: Mesh;
    constructor() {
        const color = new Color(0xff0000);
        const scene = World.getScene();
        scene.background = color;
        const geometry = new SphereBufferGeometry(15, 10, 5);
        const texture = Assets.getTexture('sceneEnvMap');
        const material = new MeshBasicMaterial({
            map: texture,
            opacity: 0.5,
            transparent: true,
        });
        material.side = BackSide;
        this.mesh = new Mesh(geometry, material);
    }

    getMesh() {
        return this.mesh;
    }
}
