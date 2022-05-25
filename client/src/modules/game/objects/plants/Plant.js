import * as THREE from 'three';
import Random from '../../../utils/random';


export default class Plant{
    constructor(seed,material,position){
        this.position = position;
        this.seed = seed;
        this.random = new Random(this.seed);
        this.geometry = new THREE.BufferGeometry();
        this.mesh = new THREE.Mesh(this.geometry, material);
        this.stage = -1;
    }
    grow(){
        this.stage++;
    }
    updateGeometry(attributes){
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(attributes.position),3));
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(attributes.uv),2));
        console.log(attributes)
    };

};