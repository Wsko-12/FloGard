import {
    Color,
    DepthFormat,
    DepthTexture,
    NearestFilter,
    PerspectiveCamera,
    Scene,
    ShaderMaterial,
    UnsignedShortType,
    WebGLRenderer,
    WebGLRenderTarget,
} from 'three';
import { FullScreenQuad, Pass } from 'three/examples/jsm/postprocessing/Pass';

export default class CartoonOutline implements Pass {
    private scene: Scene | null = null;
    private camera: PerspectiveCamera | null = null;

    private material: ShaderMaterial;

    private fsQuad: FullScreenQuad;
    public enabled = true;
    public needsSwap = true;
    public clear = false;
    public renderToScreen = true;

    constructor(
        properties: {
            color: Color;
            size: number;
            difference: number;
        },
        scene?: Scene,
        camera?: PerspectiveCamera
    ) {
        this.scene = scene || null;
        this.camera = camera || null;

        this.material = new ShaderMaterial({
            uniforms: {
                tDiffuse: { value: null },
                tDepth: { value: null },
                cameraNear: { value: camera?.near || 0.1 },
                cameraFar: { value: camera?.far || 100 },
                outlineColor: { value: properties.color },
                outlineSize: { value: properties.size },
                outlineDifference: { value: properties.difference },
                resolution: {
                    value: {
                        x: window.innerWidth,
                        y: window.innerHeight,
                    },
                },
            },

            vertexShader: /* glsl */ `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
                }`,

            fragmentShader: /* glsl */ `
                #include <common>
                #include <packing>
                precision lowp float;
                uniform sampler2D tDiffuse;
                uniform sampler2D tDepth;
                varying vec2 vUv;
                uniform vec2 resolution;
                uniform float cameraNear;
                uniform float cameraFar;
                uniform vec3 outlineColor;
                uniform float outlineSize;
                uniform float outlineDifference;

                float readDepth( sampler2D depthSampler, vec2 coord ) {
                    float fragCoordZ = texture2D( depthSampler, coord ).x;
                    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                    return viewZToOrthographicDepth( viewZ, 0.1, 20.0 );
                }
                void main() {
                    vec4 texture = texture2D( tDiffuse, vUv );
                    float depth = 1.0 - readDepth( tDepth, vUv );
                    // vec3 depthColor = vec3(depth);
                    float shift_x = (1.0/(resolution.x*0.5)*0.5) * outlineSize;
                    float shift_y = (1.0/(resolution.y*0.5)*0.5) * outlineSize;
                    float depth_top = 1.0 - readDepth(tDepth, vec2(vUv.x,vUv.y+shift_y));
                    float depth_bottom = 1.0 - readDepth(tDepth, vec2(vUv.x,vUv.y-shift_y));
                    float depth_left = 1.0 - readDepth(tDepth, vec2(vUv.x-shift_x,vUv.y));
                    float depth_right = 1.0 - readDepth(tDepth, vec2(vUv.x+shift_x,vUv.y));
                    float depth_round_average = (depth+depth_top+depth_bottom+depth_left+depth_right)*0.20;
                    float outline = abs(depth - depth_round_average);
                    float outline_step = 1.0 - step(outline,1.0/outlineDifference);
                    gl_FragColor = vec4(mix(texture.rgb,outlineColor, outline_step),1.0);
                }`,
        });

        this.fsQuad = new FullScreenQuad(this.material);
    }

    public setScene(scene: Scene) {
        this.scene = scene;
    }
    public setCamera(camera: PerspectiveCamera) {
        this.camera = camera;
        this.material.uniforms.cameraNear.value = camera.near;
        this.material.uniforms.cameraFar.value = camera.far;
    }

    public setSize(width: number, height: number) {
        this.material.uniforms.resolution.value.x = width;
        this.material.uniforms.resolution.value.y = height;
    }

    public disable(value: boolean) {
        this.enabled = !value;
    }

    public setOutlineColor(color: number) {
        this.material.uniforms.outlineColor.value = new Color(color);
    }

    public setOutlineDifference(difference: number) {
        this.material.uniforms.outlineDifference.value = difference;
    }

    public getOutlineDifference() {
        return this.material.uniforms.outlineDifference.value;
    }

    public setOutlineSize(size: number) {
        this.material.uniforms.outlineSize.value = size;
    }

    public getOutlineSize() {
        return this.material.uniforms.outlineSize.value;
    }

    public render(renderer: WebGLRenderer, writeBuffer: WebGLRenderTarget, readBuffer: WebGLRenderTarget): void {
        if (this.scene && this.camera && this.enabled) {
            this.material.uniforms.tDepth.value = readBuffer.depthTexture;
            this.material.uniforms.tDiffuse.value = readBuffer.texture;
            renderer.setRenderTarget(null);
            this.fsQuad.render(renderer);
        }
    }
}
