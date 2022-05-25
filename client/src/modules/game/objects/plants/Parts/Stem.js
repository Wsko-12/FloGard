class Sprout{
    constructor(plant,position){
        this.plant = plant;
        this.properties = this.plant.properties.stem.sprout;
        this.attributes = {
            position:[...this.properties.attributes.position],
            uv:[...this.properties.attributes.uv],
        };
    };

    getAttributes(){
        return this.attributes;
    };
};


class Branch{
    constructor(root,properties){
        this.root = root;
    };
};


export class Stem{
    constructor(plant){
        this.plant = plant;
        this.properties = plant.properties.stem;
        this.branches = [];
        this.sprout = null;
    };

    grow(){
        if(this.plant.stage === 0){
            this.sprout = new Sprout(this.plant,this.position);
        }
    };

    getAttributes(){
        const attributes = {
            position:[],
            uv:[],
        };

        if(this.plant.stage === 0){
            const sprout = this.sprout.getAttributes();
            attributes.position = attributes.position.concat(sprout.position);
            attributes.uv = attributes.uv.concat(sprout.uv);
            return attributes;
        };
        
    };
}