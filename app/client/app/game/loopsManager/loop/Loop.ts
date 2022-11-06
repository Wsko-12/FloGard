export type TLoopCallback = (time: number) => void;

export default class Loop {
    private fps: number;
    private oneFrameTime: number;
    private subscribers: TLoopCallback[] = [];
    private frame = 0;
    private timestamp = 0;
    private paused = false;

    constructor(fps: number, callback?: TLoopCallback) {
        this.fps = fps;
        this.oneFrameTime = 1 / fps;

        if (callback) {
            this.subscribe(callback);
        }
    }

    public setFps(fps: number) {
        this.oneFrameTime = 1 / fps;
        this.fps = fps;
    }

    public pause(value: boolean) {
        this.paused = value;
    }

    public play(delta: number) {
        if (this.paused) {
            return;
        }
        this.timestamp += delta;
        if (this.timestamp > this.oneFrameTime) {
            this.frame++;
            this.timestamp = this.timestamp % this.oneFrameTime;
            this.callSubscribers();
        }
    }

    public subscribe(callback: TLoopCallback) {
        this.subscribers.push(callback);
    }

    public unsubscribe(callback: TLoopCallback) {
        const index = this.subscribers.indexOf(callback);
        if (index != -1) {
            this.subscribers.splice(index, 1);
        }
    }

    private callSubscribers() {
        this.subscribers.forEach((callback) => {
            callback(this.frame / this.fps);
        });
    }
}
