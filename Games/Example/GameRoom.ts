import { GameRoom as BaseGameRoom } from "../../IOGStateSync/GameRoom";
import { Entity } from "../../IOGStateSync/Entities/Entity";
import { Crate } from "./Entities/Crate";
import { AIPlayer } from "./Entities/AIPlayer";
import { Player } from "./Entities/Player";
import { Client } from "colyseus";

export class GameRoom extends BaseGameRoom {
    public bots: Entity[] = [];

    // When room is initialized
    onInit(options: any) {
        super.onInit(options);
        this.setPatchRate(50);
        // this.setPatchRate(16.67);
        this.engine.world.gravity.scale = 0;
        this.createPickableEntites();
        this.createBots();
        this.clock.setInterval(this.checkPickableCount.bind(this),5000);
    }


    createPickableEntites() {
        for (let i = 10; i > 0; i--) {
            let posistion = this.rndInMap(32);
            this.addEntity(new Crate(this, posistion.x, posistion.y));
        }
    }

    createBots() {
        for (let i = 3; i > 0; i--) {
            let entity = new AIPlayer(this);
            this.bots.push(entity);
            this.addEntity(entity);
        }
    }

    checkPickableCount(){
        let count = 0;
        for(let k in this.state.entities){
            if(this.state.entities[k] instanceof Crate){
                count++;
            }
        }
        if(count < 5){
            for (let i = 10 - count; i > 0; i--) {
                let posistion = this.rndInMap(32);
                this.addEntity(new Crate(this, posistion.x, posistion.y));
            }
        }
        
    }

    addPlayer(client:Client, playername: string) {
        let playerEntity = new Player(this, playername, client);
        playerEntity.client = client;
        this.players.set(client.sessionId, playerEntity);
        this.addEntity(playerEntity);
    }
    
    onJoin(client: Client) {
        super.onJoin(client);
        this.addPlayer(client,"TestPlayer1");
    }
    
}