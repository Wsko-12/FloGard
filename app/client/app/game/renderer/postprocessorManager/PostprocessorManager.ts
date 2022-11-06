import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { Color, DepthTexture, PerspectiveCamera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import CartoonOutline from './CartoonOutline/CartoonOutline';
import World from '../../world/World';
import GameCamera from '../gameCamera/GameCamera';

export default class PostprocessorManager {
    private composer: EffectComposer;
    private camera: PerspectiveCamera | null = null;
    private scene: Scene | null = null;
    private disabled = false;
    private renderPass: RenderPass | null = null;
    private passes: { [key: string]: Pass } = {};

    constructor(renderer: WebGLRenderer) {
        const target = new WebGLRenderTarget(window.innerWidth, window.innerHeight);
        target.depthTexture = new DepthTexture(window.innerWidth, window.innerHeight);
        this.composer = new EffectComposer(renderer, target);
        this.scene = World.getScene();
        this.camera = GameCamera.getCamera();
        this.setDevFunctions();
        this.createRenderPass();
    }

    public setSize(width: number, height: number) {
        this.composer.setSize(width, height);
    }

    public isDisabled() {
        return this.disabled;
    }

    public render() {
        this.composer.render();
    }

    private createRenderPass() {
        if (this.scene && this.camera && !this.renderPass) {
            this.renderPass = new RenderPass(this.scene, this.camera);
            this.composer.addPass(this.renderPass);

            this.passes.cartoonOutline = new CartoonOutline(
                {
                    color: new Color(0x303030),
                    size: 1,
                    difference: 2000,
                },
                this.scene,
                this.camera
            );

            this.composer.addPass(this.passes.cartoonOutline);
        }
    }

    private setDevFunctions() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(globalThis as any).devMode) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(globalThis as any).$dev) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (globalThis as any).$dev = {};
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).$dev.postprocessing = {
            disable: (value: boolean) => {
                this.disabled = value;
            },

            getPasses: () => this.passes,
        };
    }
}
