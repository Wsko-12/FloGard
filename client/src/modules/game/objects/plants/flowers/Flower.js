import * as THREE from "three";
import Plant from "../Plant";
import MAIN from '../../../../../index';
import { Stem } from "../Parts/Stem";

export default class Flower extends Plant{
    constructor(seed,properties,position){
        super(seed,MAIN.MATERIALS.flowers,position);
        this.properties = properties;
        this.stem = new Stem(this);
    };

    grow(){
        super.grow();
        this.stem.grow();

        this.updateGeometry();
    };

    updateGeometry(){
        const attributes = {
            position:[],
            uv:[],
        };

        
        const stem = this.stem.getAttributes();
        attributes.position = attributes.position.concat(stem.position);
        attributes.uv = attributes.uv.concat(stem.uv);

        super.updateGeometry(attributes);
    };
}