import {
    AmbientLight,
    BackSide,
    Color,
    Group,
    Mesh,
    MeshBasicMaterial,
    MultiplyBlending,
    RepeatWrapping,
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
    [171, 214, 214],
    [171, 214, 214],

    [171, 214, 214],
    [171, 214, 214],
    [255, 68, 68],
    [8, 15, 34],
];

const getSkyColorByTimeMemoized = memoize((time: number) => {
    return getColorByDayTime(skyColors, time, FULL_DAY_TIME);
});

export default class Sky {
    private mesh: Group;
    private color: Color;
    private starBox: Mesh;
    private skyBox: Mesh;
    private light: AmbientLight;
    constructor() {
        const color = new Color(0x000000);
        this.color = color;
        const scene = World.getScene();
        scene.background = this.color;
        const geometry = new SphereBufferGeometry(25, 10, 5);
        const texture = Assets.getTexture('sceneEnvMap');
        const material = new MeshBasicMaterial({
            map: texture,
            opacity: 0.8,
            transparent: true,
            side: BackSide,
        });
        this.mesh = new Group();

        const starsTexture = Assets.getTexture('stars');
        starsTexture.wrapS = starsTexture.wrapT = RepeatWrapping;
        starsTexture.repeat.x = 10;
        starsTexture.repeat.y = 5;

        const starsMaterial = new MeshBasicMaterial({
            map: starsTexture,
            side: BackSide,
            alphaTest: 0.2,
            transparent: true,
            opacity: 1,
        });

        const skyBox = new Mesh(geometry, material);
        const starBox = new Mesh(geometry, starsMaterial);

        const light = new AmbientLight(0xffffff, 0.65);

        this.light = light;
        this.starBox = starBox;
        this.skyBox = skyBox;

        this.mesh.add(skyBox, light, starBox);

        Day.subscribe(this.update);
    }

    getMesh() {
        return this.mesh;
    }

    update: TDayCallback = (time) => {
        const color = getSkyColorByTimeMemoized(time);
        this.color.set(color);
        const opacity = Math.abs(0.5 - time / FULL_DAY_TIME) * 2;
        (this.starBox.material as MeshBasicMaterial).opacity = opacity;
    };
}
