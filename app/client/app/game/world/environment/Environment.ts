import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from 'three';
import World from '../World';
import Sky from './sky/Sky';

export default class Environment {
    private static sky: Sky | null = null;

    public static init() {
        const scene = World.getScene();
        this.sky = new Sky();
        const box = new Mesh(new BoxBufferGeometry(), new MeshBasicMaterial({ color: 0xff0000 }));
        scene.add(this.sky.getMesh(), box);
    }
}
