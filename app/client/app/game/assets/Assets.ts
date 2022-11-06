import Geometries from './geometries/Geometries';
import Images from './images/Images';
import Textures from './textures/Textures';

class Assets {
    static load = async () => {
        await Textures.load();
        await Images.load();
        await Geometries.load();
        return true;
    };

    static getTexture(name: string) {
        return Textures.get(name);
    }
    static getGeometry(name: string) {
        return Geometries.get(name);
    }
}

export default Assets;
