import LoopsManager from '../../loopsManager/LoopsManager';

export type TDayCallback = (gameTime: number) => void;

export const FULL_DAY_TIME = 1440;
// TODO: add dev functions with freeze and setTime;
export default class Day {
    static time = 600;
    static fullDay = FULL_DAY_TIME;
    static subscribers: TDayCallback[] = [];
    private static freezed = true;
    static init() {
        LoopsManager.subscribe('tick', this.update);
    }

    static update = () => {
        if (!this.freezed) {
            this.time += 1;
            this.time = this.time % this.fullDay;
        }

        this.callSubscribers();
    };

    static getTimeHM = () => {
        const h = Math.floor(this.time / 60);
        const m = this.time - h * 60;
        return [h, m];
    };

    static subscribe = (cb: TDayCallback) => {
        this.subscribers.push(cb);
    };

    static unsubscribe = (cb: TDayCallback) => {
        const index = this.subscribers.indexOf(cb);
        if (index != -1) {
            this.subscribers.splice(index, 1);
        }
    };

    static callSubscribers = () => {
        this.subscribers.forEach((cb) => cb(this.time));
    };
}
