import { Player as BasePlayer } from "../../../IOGStateSync/Entities/Player";
import { nosync, Client } from "colyseus";
import { Tank } from "./Tank";
import { GameRoom as BaseGameRoom } from "../../../IOGStateSync/GameRoom";

export class Player extends BasePlayer {

    @nosync
    delayOnRespawn: number = 3000;

    @nosync
    respawnCountDown: number = 0;

    @nosync
    tank:Tank = null;

    tankId:string = null;

    kill:number = 0;
    death:number = 0;

    constructor(
        room: BaseGameRoom,
        name:string,
        client:Client,
    ) {
        super(room, name, client);
        this.respawn();
    }


    /**
     *处理用户输入
     *
     * @param {*} client
     * @param {*} CMD
     * @param {*} value
     * @memberof TestPlayer
     */
    onCMD(CMD, value) {
        super.onCMD(CMD,value);
        if(this.tank){
            this.tank.onCMD(CMD,value);
        }
    }


    update(dt){
        super.update(dt);
        if(this.action === "waitForRespawn"){
            if (this.respawnCountDown > 0) {
                this.respawnCountDown -= dt;
            }else{
                this.respawn();
            }
            return;
        }
    }

    waitForRespawn(){
        this.action = "waitForRespawn";
        this.tank.destroy();
        this.tank = null;
        this.respawnCountDown = this.delayOnRespawn;
    }

    respawn(){
        let position = this.room.rndInMap();
        this.tank = new Tank(this.room, this, position.x, position.y);
        this.room.addEntity(this.tank);
        this.tankId = this.tank.id;
        this.action = "idle";
    }


    destroy() {
        super.destroy();
        if(this.tank){
            this.tank.destroy()
        }
    }

}