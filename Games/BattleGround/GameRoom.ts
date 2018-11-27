import { GameRoom as BaseGameRoom } from "../../IOGStateSync/GameRoom";
import { Entity } from "../../IOGStateSync/Entities/Entity";
import { Player } from "./Entities/Player";
import { Food } from "./Entities/Food";
import { AIPlayer } from "./Entities/AIPlayer";
import { Client } from "colyseus";

export class GameRoom extends BaseGameRoom {

    mapWidth: number = 2000;
    mapHeight:number = 2000;
    
    bots: Entity[] = [];

    foodCount:number = 100;



    // When room is initialized
    onInit(options: any) {
        super.onInit(options);
        // this.setPatchRate(16.667);
        this.setPatchRate(50);
        // this.addBots();
        this.addFoods();
        this.clock.setInterval(this.addFoods.bind(this),3000);
    }

    addPlayer(client: Client,name:string) {
        let playerEntity = new Player(this, name, client);
        this.players.set(client.sessionId, playerEntity);
        this.addEntity(playerEntity);
    }

    addFoods(){
        let count = 0;

        for(let key in this.state.entities){
            if(this.state.entities[key].type == "Food"){
                count++;
            }
        }

        for (let i = count; i < this.foodCount; i++) {
            let position = this.rndInMap(32);
            let food = new Food(this,position.x,position.y);
            this.addEntity(food);
        }
    }

    addBots(){
        for(let i=0;i<3;i++){
            let bot = new AIPlayer(this);
            this.bots.push(bot);
            this.addEntity(bot);
        }
    }
    
}