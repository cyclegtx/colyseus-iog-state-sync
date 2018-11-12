import {Body, Bodies, IChamferableBodyDefinition} from "matter-js";
import { PhysicsEntity } from "./PhysicsEntity";
import { GameRoom } from "../GameRoom";

export class RectBodyEntity extends PhysicsEntity {

    constructor(
        room:GameRoom,
        type:string,
        x: number,
        y: number,
        width:number,
        height:number,
        options?:IChamferableBodyDefinition,
    ) {

        super(room, type, x, y, width, height, options);
    }

    createBody(){
        this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, this.physicsOptions);
    }

}