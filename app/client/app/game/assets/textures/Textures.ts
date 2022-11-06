import { Texture, TextureLoader } from 'three';
import { textureAtlas } from './atlas';
class Textures {
    static loaded: Record<string, Texture> = {};
    static load() {
        return new Promise((res) => {
            const loader = new TextureLoader();
            let index = -1;
            const load = () => {
                index++;
                if (!textureAtlas[index]) {
                    res(true);
                    return;
                }
                const data = textureAtlas[index];
                const path = './assets/textures/' + data.folder + '/' + data.file;
                loader.load(path, (texture) => {
                    texture.flipY = false;
                    this.loaded[data.name] = texture;
                    load();
                });
            };
            load();
        });
    }
}
export default Textures;
