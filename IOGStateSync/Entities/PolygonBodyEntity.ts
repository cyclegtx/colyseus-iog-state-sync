import {Bodies, IChamferableBodyDefinition, Vector, World, Body} from "matter-js";
import { PhysicsEntity } from "./PhysicsEntity";
import { GameRoom } from "../GameRoom";

export class PolygonBodyEntity extends PhysicsEntity {
    bodyType: string = "polygon";
    sides:number = 3;
    r: number = 0;

    constructor(
        room:GameRoom,
        type:string,
        x: number,
        y: number,
        sides:number,
        r: number,
        options?:IChamferableBodyDefinition,
    ) {
        super(room, type, x, y, r*2, r*2, options);
        sides = sides < 3?3:sides;
        this.sides = sides;
        this.r = r;
        this.createBody();
    }

    createBody(){
        this.body = Bodies.polygon(this.x, this.y, this.sides, this.r);
        this.body['entity_id'] = this.id;
        World.add(this.room.engine.world, this.body);
    }

}