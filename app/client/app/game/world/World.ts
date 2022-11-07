import { Scene } from 'three';
import Day from './day/Day';
import Environment from './environment/Environment';

export default class World {
    static scene: Scene | null = null;
    static init() {
        const scene = new Scene();
        this.scene = scene;
        Day.init();
        Environment.init();
    }

    static getScene() {
        if (!this.scene) {
            throw new Error('[World getScene] scene undefined');
        }
        return this.scene;
    }
}
