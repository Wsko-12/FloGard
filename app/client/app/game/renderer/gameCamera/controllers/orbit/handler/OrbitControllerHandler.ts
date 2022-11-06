import { ICustomMouseEvent } from '../../../../../../../../ts/interfaces';
import { Point2, Vector2 } from '../../../../../../utils/Geometry';
import CameraOrbitController from '../CameraOrbitController';

export default class OrbitControllerHandler {
    static createPointerEvent(type: string, cords: [number, number]) {
        const event = new CustomEvent<ICustomMouseEvent>(type, {
            detail: {
                x: (cords[0] / window.innerWidth) * 2 - 1,
                y: -(cords[1] / window.innerHeight) * 2 + 1,
            },
        });
        return event;
    }

    private controller: CameraOrbitController;
    private time = 0;
    private mouse = {
        x: 0,
        y: 0,
        clicked: {
            x: 0,
            y: 0,
            flag: false,
            moved: false,
            timestamp: 0,
        },
        context: {
            x: 0,
            y: 0,
            flag: false,
            moved: false,
            timestamp: 0,
        },
    };

    private touch = {
        x: 0,
        y: 0,
        x2: 0,
        y2: 0,
        clicked: false,
        double: true,
        moved: false,
        timestamp: 0,
    };

    private eventHandler: HTMLElement | null = null;

    private contextmenu: (e: MouseEvent) => boolean;
    private wheel: (e: WheelEvent) => void;

    private mouseDown: (e: MouseEvent) => void;
    private mouseMove: (e: MouseEvent) => void;
    private mouseUp: (e: MouseEvent) => void;

    private touchStart: (e: TouchEvent) => void;
    private touchMove: (e: TouchEvent) => void;
    private touchEnd: (e: TouchEvent) => void;

    constructor(controller: CameraOrbitController) {
        this.controller = controller;

        this.contextmenu = (e: MouseEvent): boolean => {
            e.preventDefault();
            return false;
        };

        this.wheel = (e: WheelEvent): void => {
            e.preventDefault();
            const { deltaX, deltaY } = e;
            if (deltaY !== 0) {
                if (deltaY % 1 === 0) {
                    if (deltaY === 100 || deltaY === -100) {
                        if (deltaY > 0) {
                            this.controller.zoom.delta += 0.1 * this.controller.speed;
                        } else {
                            this.controller.zoom.delta -= 0.1 * this.controller.speed;
                        }
                    } else {
                        this.controller.targetDirection.deltaY += (-e.deltaY / window.innerHeight) * 0.25;
                    }
                } else {
                    //pitch
                    this.controller.zoom.delta += deltaY * this.controller.speed * 0.01;
                }
            }

            if (deltaX !== 0) {
                this.controller.targetDirection.deltaX += (-e.deltaX / window.innerWidth) * 0.25;
            }
        };

        this.mouseDown = (e: MouseEvent): void => {
            e.preventDefault();
            if (e.button === 0) {
                this.mouse.clicked.x = e.clientX;
                this.mouse.clicked.y = e.clientY;
                this.mouse.clicked.flag = true;
                this.mouse.clicked.timestamp = e.timeStamp;
            }
            if (e.button === 2) {
                this.mouse.context.x = e.clientX;
                this.mouse.context.y = e.clientY;
                this.mouse.context.flag = true;
                this.mouse.context.timestamp = e.timeStamp;
            }
        };

        this.mouseMove = (e: MouseEvent): void => {
            e.preventDefault();
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
            const event = OrbitControllerHandler.createPointerEvent('ECustomEvents.mouseMove', [e.clientX, e.clientY]);
            this.eventHandler?.dispatchEvent(event);

            if (this.mouse.clicked.flag) {
                let deltaX = e.clientX - this.mouse.clicked.x;
                let deltaY = e.clientY - this.mouse.clicked.y;

                this.mouse.clicked.x = e.clientX;
                this.mouse.clicked.y = e.clientY;

                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    this.mouse.clicked.moved = true;
                }

                deltaX /= window.innerWidth;
                deltaY /= window.innerHeight;

                this.controller.targetDirection.deltaX = deltaX * this.controller.speed;
                this.controller.targetDirection.deltaY = deltaY * this.controller.speed;
            }

            if (this.mouse.context.flag) {
                this.mouse.context.moved = true;

                let deltaX = e.clientX - this.mouse.context.x;
                let deltaY = e.clientY - this.mouse.context.y;

                this.mouse.context.x = e.clientX;
                this.mouse.context.y = e.clientY;

                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    this.mouse.context.moved = true;
                }

                deltaX /= window.innerWidth;
                deltaY /= window.innerHeight;

                this.controller.cameraAngles.deltaAlpha += deltaX * this.controller.speed;
                this.controller.cameraAngles.deltaTetha += deltaY * this.controller.speed;
            }
        };

        this.mouseUp = (e: MouseEvent): void => {
            e.preventDefault();
            if (e.button === 0) {
                if (e.timeStamp - this.mouse.clicked.timestamp < 150 && !this.mouse.clicked.moved) {
                    const event = OrbitControllerHandler.createPointerEvent('ECustomEvents.click', [
                        e.clientX,
                        e.clientY,
                    ]);
                    this.eventHandler?.dispatchEvent(event);
                }
                this.mouse.clicked.flag = false;
                this.mouse.clicked.moved = false;
            }
            if (e.button === 2) {
                if (e.timeStamp - this.mouse.context.timestamp < 150 && !this.mouse.context.moved) {
                    console.log('context click');
                }
                this.mouse.context.flag = false;
                this.mouse.context.moved = false;
            }
            if (e.type === 'mouseleave') {
                this.mouse.clicked.flag = false;
                this.mouse.context.flag = false;
            }
        };

        this.touchStart = (e: TouchEvent): void => {
            e.preventDefault();
            this.touch.timestamp = e.timeStamp;
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
            if (e.touches.length === 1) {
                this.touch.clicked = true;
                this.touch.double = false;
            }
            if (e.touches.length > 1) {
                this.touch.clicked = false;
                this.touch.double = true;
                this.touch.x2 = e.touches[1].clientX;
                this.touch.y2 = e.touches[1].clientY;
            }
        };

        this.touchMove = (e: TouchEvent): void => {
            e.preventDefault();

            if (this.touch.clicked) {
                let deltaX = e.touches[0].clientX - this.touch.x;
                let deltaY = e.touches[0].clientY - this.touch.y;

                this.touch.x = e.touches[0].clientX;
                this.touch.y = e.touches[0].clientY;

                if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                    this.touch.moved = true;
                }

                deltaX /= window.innerWidth;
                deltaY /= window.innerHeight;

                this.controller.targetDirection.deltaX = deltaX * this.controller.speed;
                this.controller.targetDirection.deltaY = deltaY * this.controller.speed;
            }
            if (this.touch.double) {
                const vectorA = new Vector2(e.touches[0].clientX - this.touch.x, e.touches[0].clientY - this.touch.y);
                const vectorB = new Vector2(e.touches[1].clientX - this.touch.x2, e.touches[1].clientY - this.touch.y2);

                if (vectorA.getLength() > 10 || vectorB.getLength() > 10) {
                    this.touch.moved = true;
                }

                vectorA.normalize();
                vectorB.normalize();

                const dot = vectorA.dot(vectorB);
                if (dot < 0.75) {
                    //pitch
                    const pointABefore = new Point2(this.touch.x, this.touch.y);
                    const pointAAfter = new Point2(e.touches[0].clientX, e.touches[0].clientY);

                    const pointBBefore = new Point2(this.touch.x2, this.touch.y2);
                    const pointBAfter = new Point2(e.touches[1].clientX, e.touches[1].clientY);

                    const distanceBefore = pointABefore.getDistanceTo(pointBBefore);
                    const distanceAfter = pointAAfter.getDistanceTo(pointBAfter);

                    const delta = distanceAfter - distanceBefore;
                    this.controller.zoom.delta += -delta / Math.max(window.innerWidth, window.innerHeight);
                } else {
                    let deltaX = (e.touches[1].clientX - this.touch.x2) | (e.touches[0].clientX - this.touch.x);
                    let deltaY = (e.touches[1].clientY - this.touch.y2) | (e.touches[0].clientY - this.touch.y);

                    deltaX /= window.innerWidth;
                    deltaY /= window.innerHeight;

                    this.controller.cameraAngles.deltaAlpha += deltaX * this.controller.speed;
                    this.controller.cameraAngles.deltaTetha += deltaY * this.controller.speed;
                }

                this.touch.x = e.touches[0].clientX;
                this.touch.y = e.touches[0].clientY;
                this.touch.x2 = e.touches[1].clientX;
                this.touch.y2 = e.touches[1].clientY;
            }
        };

        this.touchEnd = (e: TouchEvent): void => {
            e.preventDefault();
            if (e.touches.length === 0) {
                if (e.timeStamp - this.touch.timestamp < 200 && !this.touch.moved) {
                    if (this.touch.clicked) {
                        const event = OrbitControllerHandler.createPointerEvent('ECustomEvents.click', [
                            this.touch.x,
                            this.touch.y,
                        ]);
                        this.eventHandler?.dispatchEvent(event);
                    }
                    if (this.touch.double) {
                        //don't use it better
                        console.log('context click');
                    }
                }

                this.touch.clicked = false;
                this.touch.double = false;
                this.touch.moved = false;
            } else if (e.touches.length === 1) {
                this.touch.x = e.touches[0].clientX;
                this.touch.y = e.touches[0].clientY;
                this.touch.clicked = true;
                this.touch.double = false;
            } else {
                this.touch.clicked = false;
                this.touch.double = true;
                this.touch.x = e.touches[0].clientX;
                this.touch.y = e.touches[0].clientY;
                this.touch.x2 = e.touches[1].clientX;
                this.touch.y2 = e.touches[1].clientY;
            }
        };
    }

    attach(element: HTMLElement): void {
        this.eventHandler = element;
        this.eventHandler.addEventListener('contextmenu', this.contextmenu);
        this.eventHandler.addEventListener('wheel', this.wheel);

        this.eventHandler.addEventListener('mousedown', this.mouseDown);
        this.eventHandler.addEventListener('mousemove', this.mouseMove);
        this.eventHandler.addEventListener('mouseup', this.mouseUp);
        this.eventHandler.addEventListener('mouseleave', this.mouseUp);

        this.eventHandler.addEventListener('touchmove', this.touchMove);
        this.eventHandler.addEventListener('touchstart', this.touchStart);
        this.eventHandler.addEventListener('touchend', this.touchEnd);
    }

    detach(): void {
        if (this.eventHandler) {
            this.eventHandler.removeEventListener('contextmenu', this.contextmenu);
            this.eventHandler.removeEventListener('wheel', this.wheel);

            this.eventHandler.removeEventListener('mousedown', this.mouseDown);
            this.eventHandler.removeEventListener('mousemove', this.mouseMove);
            this.eventHandler.removeEventListener('mouseup', this.mouseUp);
            this.eventHandler.removeEventListener('mouseleave', this.mouseUp);

            this.eventHandler.removeEventListener('touchmove', this.touchMove);
            this.eventHandler.removeEventListener('touchstart', this.touchStart);
            this.eventHandler.removeEventListener('touchend', this.touchEnd);
        }
    }

    update(time: number) {
        this.time = time;
    }
}
