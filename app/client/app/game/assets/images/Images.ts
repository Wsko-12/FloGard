import { imagesAtlas } from './atlas';

export default class Images {
    static loaded: Record<string, HTMLImageElement> = {};
    static load() {
        return new Promise((res) => {
            let index = -1;
            const load = () => {
                index++;
                if (!imagesAtlas[index]) {
                    res(true);
                    return;
                }
                const data = imagesAtlas[index];
                const path = './assets/images/' + data.folder + '/' + data.file;
                const img = new Image();
                img.src = path;
                img.onload = () => {
                    this.loaded[data.name] = img;
                    load();
                };
            };
            load();
        });
    }
}
