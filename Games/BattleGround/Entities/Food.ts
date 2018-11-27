import { CircleBodyEntity } from "../../../IOGStateSync/Entities/CircleBodyEntity";
import { Tank } from "./Tank";
import { nosync } from "colyseus";

export class Food extends CircleBodyEntity{

    @nosync
    score:number = 10;

    health: number = 10;
    maxHealth:number = 10;

    constructor(room,x,y){
        super(room,"Food",x,y,10,{isSensor:true,isStatic:true});
    }

    hitByTank(tank:Tank,damage:number){
        this.health -= damage;
        if(this.health <= 0){
            tank.addScore(this.score);
            this.destroy();
        }
    }

}