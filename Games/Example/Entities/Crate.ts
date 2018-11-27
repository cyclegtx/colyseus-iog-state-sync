import { RectBodyEntity } from "../../../IOGStateSync/Entities/RectBodyEntity";
import { Body, Vector } from "matter-js";
import { nosync } from "colyseus";
import { PhysicsEntity } from "../../../IOGStateSync/Entities/PhysicsEntity";
import { Character } from "./Character";
import { GameRoom } from "../GameRoom";


export class Crate extends RectBodyEntity {
    
    @nosync
    owner:Character = null;

    offset:Vector = Vector.create(0,-16);

    delayOnRemove:number = 500;

    delayOnThrowRecover:number = 400;
    throwRecoverTime:number = 0;

    constructor(
        room:GameRoom,
        x: number,
        y: number
    ) {
        super(room, "Crate", x, y, 16, 16, { mass: 10, inertia: Infinity, frictionAir:0.3});
        this.action = "idle";
    }

    update(dt: number){
        if (this.owner != null && this.action != "throw" && this.action != "break") {
            if (this.owner.action == "hide") {
                Body.setPosition(this.body, this.owner.body.position);
                this.action = "idle";
            }else{
                Body.setPosition(this.body, Vector.add(this.owner.body.position, this.offset));
                this.action = "hold";
            }
        }

        if(this.action == "break"){
            if(this.delayOnRemove <= 0){
                this.destroy();
            }else{
                this.delayOnRemove -= dt;
            }
        }

        if(this.action == "throw"){
            if (this.throwRecoverTime < this.delayOnThrowRecover){
                this.throwRecoverTime += dt;
            }else{
                this.owner = null;
                this.action = "idle";
                this.throwRecoverTime = 0;
            }
        }

        super.update(dt);
    }

    /**
     *被用户拾取
     *
     * @param {Character} character
     * @returns
     * @memberof Crate
     */
    public getByCharacter(character:Character){
        if(this.owner != null && this.action !== "idle"){
            return;
        }
        this.action = "hold";
        this.owner = character;
        character.entityInHand = this;
        this.disablePhysics();
    }

    /**
     *从玩家手中释放
     *
     * @memberof Crate
     */
    public releaseFromCharacter(){
        if(this.owner != null && this.action !== "throw"){
            this.owner.entityInHand = null;
            this.owner = null;
            this.action = "idle";
            this.enablePhysics();
        }
    }

    onCollisionStart(other: PhysicsEntity, self: PhysicsEntity): void {
        super.onCollisionStart(other,self);
        if(this.action == "throw"){
            if (other instanceof Character){
                other.hurtBy(this.owner);
            }
            this.action = "break";
        }
    }
}