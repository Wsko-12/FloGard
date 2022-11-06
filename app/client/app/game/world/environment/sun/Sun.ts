import { DirectionalLight, Group } from 'three';
import { RGBArr } from '../../../../../../ts/types';
import { getColorByDayTime, memoize } from '../../../../utils/utils';
import Day, { FULL_DAY_TIME } from '../../day/Day';

const HEIGHT = 5;

const sunColors: RGBArr[] = [
    [255, 0, 0],
    [255, 0, 0],
    [255, 0, 128],
    [255, 242, 176],
    [255, 255, 255],
    [255, 128, 128],
    [255, 0, 0],
    [255, 0, 0],
];

const getSunColorByTimeMemoized = memoize((time: number) => {
    return getColorByDayTime(sunColors, time, FULL_DAY_TIME);
});

export default class Sun {
    private group: Group;
    private light: DirectionalLight;
    constructor() {
        this.group = new Group();

        const light = new DirectionalLight(undefined, 1);
        light.position.set(10, 10, 10);
        light.lookAt(0, 0, 0);
        light.castShadow = true;

        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.zoom = 0.7;
        light.shadow.bias = -0.00001;
        this.light = light;

        this.group.add(this.light);
        this.group.rotation.x = Math.PI / 8;
        Day.subscribe(this.update);
    }

    update = (time: number) => {
        const angle = Math.PI * 2 * (time / FULL_DAY_TIME) - Math.PI * 0.5;
        const x = Math.cos(angle) * HEIGHT;
        const y = Math.sin(angle) * HEIGHT;
        this.light.position.set(x, y, 0);

        this.light.intensity = y + 1 > 0 ? y / HEIGHT : 0;

        const color = getSunColorByTimeMemoized(time);
        this.light.color.set(color);
    };

    getMesh() {
        return this.group;
    }
}
