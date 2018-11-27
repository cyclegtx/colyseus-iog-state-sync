import {Body,  IChamferableBodyDefinition, World, Bodies} from "matter-js";
import { Entity } from "./Entity";
import { nosync } from "colyseus";
import { GameRoom } from "../GameRoom";
import { debugsync } from "../DebugSetting";


export abstract class PhysicsEntity extends Entity {
    @nosync
    body:Body = null;

    @debugsync
    bodyType:string = "rect";

    @debugsync
    physicsOptions: IChamferableBodyDefinition = {};

    @debugsync
    physicsEnabled: boolean = true;

    constructor(
        room:GameRoom,
        type:string,
        x: number,
        y: number,
        width:number,
        height:number,
        options?:IChamferableBodyDefinition,
    ) {
        super(room,type,x,y,width,height);

        this.physicsOptions = {isStatic:false};
        if(options !== undefined){
            this.physicsOptions = options;
        }

        if (this.physicsOptions.isStatic !== true) {
            this.physicsOptions.isStatic = false;
        }
    }

    update(dt:number){
        super.update(dt);
        //当位移超过阈值时，进行同步，增大阈值以减小频繁同步带来的额流量压力
        if(Math.abs(this.x - this.body.position.x) > 0.1){
            this.x = this.body.position.x;
        }
        if(Math.abs(this.y - this.body.position.y) > 0.1){
            this.y = this.body.position.y;
        }
        if(Math.abs(this.angle - this.body.angle) > 0.01){
            this.angle = this.body.angle;
        }
    }
    
    /**
     *创建Body
     *
     * @memberof PhysicsEntity
     */
    abstract createBody();

    /**
     *缩放Entity
     *
     * @param {number} scale 缩放倍数
     * @memberof PhysicsEntity
     */
    scaleBody(scale:number){
        this.scale *= scale;
        Body.scale(this.body, scale, scale);
    }

    /**
     *关闭物体效果
     *
     * @memberof PhysicsEntity
     */
    disablePhysics() {
        if(this.physicsEnabled === true){
            this.physicsEnabled = false;
            World.remove(this.room.engine.world, this.body);
        }
    }

    /**
     *开启物理效果
     *
     * @memberof PhysicsEntity
     */
    enablePhysics() {
        if (this.physicsEnabled === false) {
            this.physicsEnabled = true;
            World.add(this.room.engine.world, this.body);
        }
    }

    /**
     *删除
     *
     * @memberof PhysicsEntity
     */
    destroy(): void {
        super.destroy();
        World.remove(this.room.engine.world, this.body);
    }

    /**
     *当碰撞开始
     *
     * @param {PhysicsEntity} other 产生碰撞的另一个碰撞组件
     * @param {PhysicsEntity} self 产生碰撞的自身的碰撞组件
     * @memberof PhysicsEntity
     */
    onCollisionStart(other: PhysicsEntity, self: PhysicsEntity) {}

    /**
     *当碰撞结束
     *
     * @param {PhysicsEntity} other 产生碰撞的另一个碰撞组件
     * @param {PhysicsEntity} self 产生碰撞的自身的碰撞组件
     * @memberof PhysicsEntity
     */
    onCollisionEnd(other: PhysicsEntity, self: PhysicsEntity) {}

}