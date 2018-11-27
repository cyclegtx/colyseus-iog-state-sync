import { Player as BasePlayer } from "../../../IOGStateSync/Entities/Player";
import { nosync, Client } from "colyseus";
import { Character } from "./Character";
import { GameRoom } from "../GameRoom";

export class Player extends BasePlayer {

    @nosync
    delayOnRespawn: number = 3000;

    @nosync
    respawnCountDown: number = 0;

    @nosync
    character:Character = null;

    constructor(
        room:GameRoom,
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
        this.character.onCMD(CMD,value);
    }


    update(dt){
        super.update(dt);
        if(this.action === "waitForRespawn"){
            if (this.respawnCountDown > 0) {
                this.respawnCountDown -= dt;
            }else{
                this.character.destroy();
                this.character = null;
                this.respawn();
            }
            return;
        }
    }

    waitForRespawn(){
        this.action = "waitForRespawn";
        this.respawnCountDown = this.delayOnRespawn;
    }

    respawn(){
        let position = this.room.rndInMap();
        this.character = new Character(this.room, this, position.x, position.y);
        this.room.addEntity(this.character);
        this.action = "idle";
    }

}