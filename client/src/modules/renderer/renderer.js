import MAIN from '../../index.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Test from '../game/objects/plants/flowers/lib/Test';
let THREE;
export default {
    init(startRender){
        THREE = MAIN.THREE;
        const canvasRenderer = document.createElement('canvas');
        canvasRenderer.showContextMenu = function(e) {
            e.preventDefault();
        };
        document.body.append(canvasRenderer);
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRenderer,
        });
        this.renderer = renderer;
        const camera = new THREE.PerspectiveCamera(10, 2, 0.2, 500);
        this.camera = camera;
        camera.position.set(5, 5, 5);
        camera.lookAt(0, 0, 0);
        
        this.controls = new OrbitControls( camera, renderer.domElement );

        const scene = new THREE.Scene();
        this.scene = scene;

        window.addEventListener("resize", ()=>{this.setSize()});
        this.setSize();
        renderer.setClearColor(new THREE.Color(0x8dd8e0));

        const test = new Test();
        scene.add(test.mesh);
        
        if(startRender) this.render();
    },

    setSize(){
        const canvas = this.renderer.domElement;
        const windowPixelRatio = Math.min(window.devicePixelRatio, 2);
        const windowWidth = +canvas.clientWidth * windowPixelRatio;
        const windowHeight = +canvas.clientHeight * windowPixelRatio;


        
        this.renderer.setSize(windowWidth, windowHeight,false);
        this.renderer.setPixelRatio(windowPixelRatio);

        this.camera.aspect = windowWidth / windowHeight;
        this.camera.updateProjectionMatrix();
        if(this.composer){
            this.composer.setSize(windowWidth, windowHeight);
        }
    },

    render:function(){
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(()=>{this.render()});
    },
};