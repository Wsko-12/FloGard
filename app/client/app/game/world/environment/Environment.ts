import { BoxBufferGeometry, Mesh, MeshBasicMaterial } from 'three';
import World from '../World';
import Ground from './ground/Ground';
import Sky from './sky/Sky';

export default class Environment {
    private static sky: Sky | null = null;
    private static ground: Ground | null = null;

    public static init() {
        const scene = World.getScene();
        this.sky = new Sky();
        this.ground = new Ground();
        scene.add(this.sky.getMesh(), this.ground.getMesh());
    }
}
