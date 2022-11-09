import World from '../World';
import { Grass } from './grass/Grass';
import Ground from './ground/Ground';
import Sky from './sky/Sky';
import Sun from './sun/Sun';
import Weather from './weather/Weather';

export default class Environment {
    private static sky: Sky | null = null;
    private static ground: Ground | null = null;
    private static grass: Grass | null = null;
    private static sun: Sun | null = null;
    private static weather: Weather | null = null;

    public static init() {
        const scene = World.getScene();
        this.sky = new Sky();
        this.ground = new Ground();
        this.grass = new Grass();
        this.sun = new Sun();
        this.weather = new Weather();
        scene.add(
            this.sky.getMesh(),
            this.ground.getMesh(),
            this.grass.getMesh(),
            this.sun.getMesh(),
            this.weather.getMesh()
        );
    }
}
