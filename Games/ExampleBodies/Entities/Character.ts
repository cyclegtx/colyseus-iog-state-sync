import { Vector, Body } from "matter-js";
import { GameRoom } from "../../../IOGStateSync/GameRoom";
import { nosync } from "colyseus";
import { Player } from "./Player";
import { CircleBodyEntity } from "../../../IOGStateSync/Entities/CircleBodyEntity";

export class Character extends CircleBodyEntity {

    dirX: number = 0;

    @nosync
    dirY: number = 0;

    @nosync
    mousePosition: Vector = Vector.create(0, 1);

    @nosync
    mouseDistance: Vector = Vector.create(0, 0);

    @nosync
    mlb: boolean = false;

    @nosync
    mrb: boolean = false;

    @nosync
    speed: number = 6;

    @nosync
    owner: Player = null;

    score: number = 0;
    name: string = "";
    sessionId: string = null;

    constructor(
        room: GameRoom,
        owner: Player,
        x: number,
        y: number,
    ) {
        super(room, "Example", x, y, 32, { frictionAir: 0.8, inertia: Infinity });
        this.owner = owner;
        this.name = owner.name;
        this.action = "idle";
    }

    update(dt: number) {
        super.update(dt);

        if (this.action == "dead") {
            return;
        }

        this.mouseDistance = Vector.sub(this.mousePosition, this.body.position);

        if (this.action != "hide") {
            if (this.dirX != 0 || this.dirY != 0) {
                Body.translate(this.body, Vector.mult(Vector.create(this.dirX, this.dirY), this.speed));
                this.action = "move";
            } else {
                this.action = "idle";
            }
        }

    }

    /**
     *处理用户输入
     *
     * @param {*} client
     * @param {*} CMD
     * @param {*} value
     * @memberof Character
     */
    onCMD(CMD, value) {
        if (CMD === "move") {
            this.move(value.x, value.y);
        } else if (CMD === "mousemove") {
            this.mousePosition.x = value.x;
            this.mousePosition.y = value.y;
        } else if (CMD === "mlb") {
            this.mlb = value;
            if(this.mlb){
                this.scaleBody(1.1);
            }
        } else if (CMD === "mrb") {
            this.mrb = value;
            if (this.mrb) {
                this.scaleBody(0.9);
            }
        }
    }


    /**
     *移动
     *
     * @param {number} x
     * @param {number} y
     * @memberof Character
     */
    public move(x: number, y: number) {
        let _dir = Vector.create(x, y);
        _dir = Vector.normalise(_dir);
        this.dirX = _dir.x;
        this.dirY = _dir.y;
    }


}