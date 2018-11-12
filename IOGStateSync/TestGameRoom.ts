import { GameRoom } from "./GameRoom";
import { Crate } from "./Entities/Crate";
import { Entity } from "./Entities/Entity";
import { AIPlayer } from "./Entities/AIPlayer";

export class TestGameRoom extends GameRoom {
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
    
}