import {Body, Bodies, IChamferableBodyDefinition, World} from "matter-js";
import { PhysicsEntity } from "./PhysicsEntity";
import { GameRoom } from "../GameRoom";

export class RectBodyEntity extends PhysicsEntity {
    bodyType: string = "rect";

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
        this.createBody();
    }

    createBody(){
        this.body = Bodies.rectangle(this.x, this.y, this.width, this.height, this.physicsOptions);
        this.body['entity_id'] = this.id;
        World.add(this.room.engine.world, this.body);
    }

}