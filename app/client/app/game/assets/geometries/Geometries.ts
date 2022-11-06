import { geometriesAtlas } from './atlas';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { BufferGeometry } from 'three';

class Geometries {
    static loaded: Record<string, BufferGeometry> = {};
    static load = () => {
        return new Promise((res) => {
            const loader = new GLTFLoader();
            let index = -1;
            const load = () => {
                index++;
                if (!geometriesAtlas[index]) {
                    res(true);
                    return;
                }
                const data = geometriesAtlas[index];
                const path = './assets/geometries/' + data.folder + data.file;
                loader.load(path, (model) => {
                    const mesh = model.scene.children[0] as THREE.Mesh;
                    this.loaded[data.name] = mesh.geometry;
                    load();
                });
            };
            load();
        });
    };
}
export default Geometries;
