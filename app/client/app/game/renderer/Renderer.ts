import { WebGLRenderer } from 'three';
import LoopsManager from '../loopsManager/LoopsManager';
import GameUI from '../ui/GameUI';
import World from '../world/World';
import GameCamera from './gameCamera/GameCamera';
import PostprocessorManager from './postprocessorManager/PostprocessorManager';
import Stats from 'three/examples/jsm/libs/stats.module';

export default class Renderer {
    private static renderer: WebGLRenderer | null = null;
    private static postprocessorManager: PostprocessorManager | null = null;
    private static stats = Stats();

    static init() {
        const canvas = GameUI.getCanvas();
        GameCamera.init(canvas);

        const renderer = new WebGLRenderer({
            canvas,
        });
        this.renderer = renderer;

        renderer.setClearColor(0x00ffff);

        window.addEventListener('resize', this.setSize);
        this.setSize();
        LoopsManager.subscribe('render', this.render);

        this.postprocessorManager = new PostprocessorManager(renderer);
        this.setDevFunctions();
    }

    private static setSize = () => {
        const windowPixelRatio = 1;
        const windowWidth = +window.innerWidth * windowPixelRatio;
        const windowHeight = +window.innerHeight * windowPixelRatio;

        const renderer = this.renderer;

        if (!renderer) {
            console.error('[Renderer setSize] renderer undefined');
            return;
        }

        renderer.setSize(windowWidth, windowHeight, false);
        renderer.setPixelRatio(windowPixelRatio);

        const canvas = GameUI.getCanvas();

        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        const camera = GameCamera.getCamera();

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        if (this.postprocessorManager) {
            this.postprocessorManager.setSize(windowWidth, windowHeight);
        }
    };

    static dispose() {
        document.removeEventListener('resize', this.setSize);
        this.renderer?.dispose();
    }

    static render = () => {
        this.stats.update();
        if (this.postprocessorManager && this.postprocessorManager.isDisabled() === false) {
            this.postprocessorManager.render();
        } else {
            this.renderer?.render(World.getScene(), GameCamera.getCamera());
        }
    };

    private static setDevFunctions() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(globalThis as any).devMode) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(globalThis as any).$dev) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).$dev = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).$dev.renderer = {
            showStats: (value: boolean) => {
                if (value) {
                    document.getElementById('app')?.appendChild(this.stats.dom);
                } else {
                    this.stats.dom.remove();
                }
            },
        };
    }
}
