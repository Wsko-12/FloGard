import Flower from "../Flower";

export default class Test extends Flower{
    constructor(seed = Math.random(),position){
        const properties = {
            stem:{
                count:1,
                type:'Straight',
                division:'No',
                maxStages:5,
                attributes:{
                    position:[-0.05,0,0,0.05,0,0,0,0.1,0,],
                    uv:[0.009941522032022476,0.008291780948638916,0.0003614849701989442,0.008291780948638916,0.0051515065133571625,-0.000004649162292480469],
                },

                sprout:{
                    attributes:{
                        position:[-0.03799603506922722,0,0,0.03799603506922722,0,0,0,0.06580913811922073,-2.8766087289966435e-9],
                        uv:[0.006621888373047113,0.0004928708076477051,0.009485503658652306,0.0004929304122924805,0.008053694851696491,0.0029727816581726074],
                    },
                },
            },

            bud:{
                type:'closed',
                position:'tip',
                sprout:{
                    stage:2,
                    attributes:{
                        position:[-0.022729983553290367,0,0,0.022729983553290367,0,0,0,0.045321401208639145,0,9.935590128407057e-10,0,0.022729981690645218,-9.935590128407057e-10,0,-0.022729981690645218,0,0.045321397483348846,0],
                        uv:[0.000005934634828008711,0.00016111135482788086,0.0042859530076384544,0.0001914501190185547,0.00211559166200459,0.004443347454071045,0.000005934634828008711,0.00016111135482788086,0.0042859530076384544,0.0001914501190185547,0.00211559166200459,0.004443347454071045],
                    },
                },
                stage:5,
            },
        };
        super(seed,properties,position);
    };
};