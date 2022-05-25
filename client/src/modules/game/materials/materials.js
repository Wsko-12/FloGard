import * as THREE from 'three';
import MAIN from '../../../index';

const MATERIALS = {
    init(){
        this.flowers = new THREE.MeshBasicMaterial({map:MAIN.ASSETS.textures.flowers,side:THREE.DoubleSide,alphaTest:0.2});
        return this;
    }
}

export default MATERIALS;