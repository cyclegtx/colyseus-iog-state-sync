import {Bodies, IChamferableBodyDefinition, Vector, World, Body} from "matter-js";
import { PhysicsEntity } from "./PhysicsEntity";
import { GameRoom } from "../GameRoom";
import { debugsync } from "../DebugSetting";

export class CircleBodyEntity extends PhysicsEntity {
    @debugsync
    bodyType: string = "circle";

    r: number = 0;
    
    /**
     *Creates an instance of CircleBodyEntity.
     * @param {GameRoom} room
     * @param {string} type
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {IChamferableBodyDefinition} [options]
     * @memberof CircleBodyEntity
     */
    constructor(
        room:GameRoom,
        type:string,
        x: number,
        y: number,
        r: number,
        options?:IChamferableBodyDefinition,
    ) {
        super(room, type, x, y, r*2, r*2, options);
        this.r = r;
        this.createBody();
    }

    createBody(){
        this.body = Bodies.circle(this.x, this.y, this.r, this.physicsOptions);
        this.body['entity_id'] = this.id;
        World.add(this.room.engine.world, this.body);
    }

}