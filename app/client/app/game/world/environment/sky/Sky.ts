import { BackSide, Color, Mesh, MeshBasicMaterial, SphereBufferGeometry } from 'three';
import { RGBArr } from '../../../../../../ts/types';
import { getColorByDayTime, interpolateColor, memoize } from '../../../../utils/utils';
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
    mesh: Mesh;
    color: Color;
    constructor() {
        this.color = new Color(0x000000);
        const scene = World.getScene();
        scene.background = this.color;
        const geometry = new SphereBufferGeometry(15, 10, 5);
        const texture = Assets.getTexture('sceneEnvMap');
        const material = new MeshBasicMaterial({
            map: texture,
            opacity: 0.2,
            transparent: true,
        });
        material.side = BackSide;
        this.mesh = new Mesh(geometry, material);

        Day.subscribe(this.updateColor);
    }

    getMesh() {
        return this.mesh;
    }

    updateColor: TDayCallback = (time) => {
        const color = getSkyColorByTimeMemoized(time);
        this.color.set(color);
    };
}
