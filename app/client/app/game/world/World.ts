import { BoxBufferGeometry, Mesh, MeshBasicMaterial, Scene } from 'three';

export default class World {
    static scene: Scene | null = null;
    static init() {
        const scene = new Scene();
        this.scene = scene;
        const box = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial());
        scene.add(box);
    }

    static getScene() {
        if (!this.scene) {
            throw new Error('[World getScene] scene undefined');
        }
        return this.scene;
    }
}
