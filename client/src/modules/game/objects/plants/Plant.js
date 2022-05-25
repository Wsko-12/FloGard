import * as THREE from 'three';
import Random from '../../../utils/random';


export default class Plant{
    constructor(material){
        // this.seed = seed || Math.random();
        this.geometry = new THREE.BufferGeometry();
        this.mesh = new THREE.Mesh(this.geometry, material);
    };
};