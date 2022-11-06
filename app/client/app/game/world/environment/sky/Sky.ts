import {
    AmbientLight,
    BackSide,
    Color,
    Group,
    Mesh,
    MeshBasicMaterial,
    MultiplyBlending,
    SphereBufferGeometry,
} from 'three';
import { RGBArr } from '../../../../../../ts/types';
import { getColorByDayTime, memoize } from '../../../../utils/utils';
import Assets from '../../../assets/Assets';
import Day, { FULL_DAY_TIME, TDayCallback } from '../../day/Day';
import World from '../../World';

const skyColors: RGBArr[] = [
    [17, 34, 82],
    [17, 34, 82],
    [255, 160, 222],
    [255, 237, 211],
    [215, 255, 255],

    [215, 255, 255],
    [215, 255, 255],
    [255, 68, 68],
    [8, 15, 34],
];

const getSkyColorByTimeMemoized = memoize((time: number) => {
    return getColorByDayTime(skyColors, time, FULL_DAY_TIME);
});

export default class Sky {
    mesh: Group;
    color: Color;
    light: AmbientLight;
    constructor() {
        const color = new Color(0x000000);
        this.color = color;
        const scene = World.getScene();
        scene.background = this.color;
        const geometry = new SphereBufferGeometry(25, 10, 5);
        const texture = Assets.getTexture('sceneEnvMap');
        const material = new MeshBasicMaterial({
            map: texture,
            opacity: 0.5,
            transparent: true,
            blending: MultiplyBlending,
        });
        material.side = BackSide;
        this.mesh = new Group();

        const skyBox = new Mesh(geometry, material);
        const light = new AmbientLight(0xffffff, 0.4);

        this.light = light;

        this.mesh.add(skyBox, light);

        Day.subscribe(this.update);
    }

    getMesh() {
        return this.mesh;
    }

    update: TDayCallback = (time) => {
        const color = getSkyColorByTimeMemoized(time);
        this.color.set(color);
    };
}
