import Assets from './assets/Assets';
import LoopsManager from './loopsManager/LoopsManager';
import Renderer from './renderer/Renderer';
import GameUI from './ui/GameUI';
import World from './world/World';

export default class Game {
    static init = async () => {
        await Assets.load();
        LoopsManager.init();
        GameUI.init();
        World.init();
        Renderer.init();
        LoopsManager.start();
    };
}
