import { Vector, Body} from "matter-js";
import { GameRoom } from "../GameRoom";
import { nosync } from "colyseus";
import { Entity } from "./Entity";


export class Player extends Entity {
    @nosync
    dirX: number = 0;

    @nosync
    dirY: number = 0;

    @nosync
    mousePosition: Vector = Vector.create(0, 1);

    score: number = 0;
    name: string = "";
    sessionId:string = null;

    constructor(
        room:GameRoom,
        name:string
    ) {
        super(room,"Player",0,0,0,0);
        this.name = name;
        this.action = "idle";
    }


    /**
     *处理用户输入
     *
     * @param {*} client
     * @param {*} CMD
     * @param {*} value
     * @memberof Player
     */
    onCMD(CMD, value) {}


    /**
     *删除
     *
     * @memberof Player
     */
    destroy(){
        super.destroy();
        this.room.players.delete(this.sessionId);
    }

}