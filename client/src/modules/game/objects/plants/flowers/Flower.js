import * as THREE from "three";
import Plant from "../Plant";
import MAIN from '../../../../../index';

// console.log(MAIN)
export default class Flower extends Plant{
    constructor(){
        super(MAIN.MATERIALS.flowers);
    }
}