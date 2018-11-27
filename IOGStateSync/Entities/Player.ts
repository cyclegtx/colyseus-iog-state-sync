import { Vector} from "matter-js";
import { GameRoom } from "../GameRoom";
import { nosync, Client } from "colyseus";
import { Entity } from "./Entity";


export class Player extends Entity {
    @nosync
    dirX: number = 0;

    @nosync
    dirY: number = 0;

    @nosync
    mousePosition: Vector = Vector.create(0, 1);

    name: string = "";
    sessionId:string = null;

    @nosync
    client: Client = null;

    constructor(
        room:GameRoom,
        name:string,
        client:Client,
    ) {
        super(room,"Player",0,0,0,0);
        this.name = name;
        this.client = client;
        if(this.client){
            this.sessionId = this.client.sessionId;
        }
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