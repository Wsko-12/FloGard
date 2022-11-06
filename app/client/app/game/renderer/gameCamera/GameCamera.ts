import { PerspectiveCamera } from 'three';
import { Point3 } from '../../../utils/Geometry';
import { TLoopCallback } from '../../loopsManager/loop/Loop';
import LoopsManager from '../../loopsManager/LoopsManager';
import CameraController from './controllers/CameraController';
import CameraOrbitController from './controllers/orbit/CameraOrbitController';

export default class GameCamera {
    private static camera: PerspectiveCamera | null = null;
    private static position: Point3 | null = null;
    private static target: Point3 | null = null;
    private static controller: CameraController;
    static init(mouseEventsHandler: HTMLElement) {
        const camera = new PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 50);
        this.camera = camera;

        this.position = new Point3(10, 0, 0);
        this.target = new Point3(0, 0, 0);

        this.controller = new CameraOrbitController(mouseEventsHandler, this.position, this.target, this.camera);

        LoopsManager.subscribe('update', this.update);
    }

    static getCamera() {
        if (!this.camera) {
            throw new Error('[GameCamera getCamera] first init GameCamera');
        }
        return this.camera;
    }

    public static update: TLoopCallback = (time) => {
        const { camera, position, target } = this;
        if (!camera || !position || !target) {
            throw new Error('[GameCamera update] first init GameCamera ');
        }

        {
            const { x, y, z } = position;
            camera.position.set(x, y, z);
        }
        {
            const { x, y, z } = target;
            camera.lookAt(x, y, z);
        }

        this.controller.update(time);
    };
}
