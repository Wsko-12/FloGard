import PageBuilder from '../../common/PageBuilder';

export default class GameUI {
    private static canvas: HTMLCanvasElement = PageBuilder.createElement('canvas');
    private static container = PageBuilder.createElement('canvas');
    static init() {
        this.container.append(this.canvas);
        document.getElementById('app')?.append(this.canvas);
    }

    static getCanvas() {
        return this.canvas;
    }

    static dispose() {
        this.container.remove();
    }
}
