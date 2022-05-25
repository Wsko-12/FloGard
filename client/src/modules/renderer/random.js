export default class Random{
    m = 4294967296;
    a = 1664525;
    c = 1013904223;
    
    constructor(seed = Math.random() ){
        this.seed = seed;
        this.z = (this.a * this.seed + this.c) % this.m;
        this.step = 0;
    }   

    get(){
        this.z = (this.a * this.z + this.c) % this.m;
        return this.z / this.m;
    }

    getFromMinus(){
        const value = this.get();
        return (value-0.5)*2;
    }
}