import { RectBodyEntity } from "../../../IOGStateSync/Entities/RectBodyEntity";
import { Vector, Body} from "matter-js";
import { nosync } from "colyseus";
import { PhysicsEntity } from "../../../IOGStateSync/Entities/PhysicsEntity";
import { Crate } from "./Crate";
import { Player } from "./Player";
import { GameRoom } from "../../../IOGStateSync/GameRoom";



export class Character extends RectBodyEntity {
    @nosync
    entityInHand: PhysicsEntity = null;

    dirX: number = 0;

    @nosync
    dirY: number = 0;

    @nosync
    mousePosition: Vector = Vector.create(0, 1);

    @nosync
    mouseDistance: Vector = Vector.create(0, 0);

    @nosync
    mlb: boolean = false;

    @nosync
    mrb: boolean = false;

    @nosync
    speed: number = 1;

    @nosync
    owner: Player = null;

    score: number = 0;
    name: string = "";
    sessionId:string = null;

    constructor(
        room:GameRoom,
        owner:Player,
        x: number,
        y:number,
    ) {
        super(room,"Character",x,y,16,16,{frictionAir:0.8,inertia: Infinity});
        this.owner = owner;
        this.name = owner.name;
        this.action = "idle";
    }

    update(dt: number) {
        super.update(dt);

        // this.cursor.x = this.mousePosition.x;
        // this.cursor.y = this.mousePosition.y;

        // if(this.body.velocity.x != 0 || this.body.velocity.y != 0){
        //     console.log(this.body.velocity)

        // }
        if(this.action == "dead"){
            return;
        }

        if(this.mlb === true && this.entityInHand != null){
            this.action = "hide";
        }else if(this.mlb === false && this.action == "hide"){
            this.action = "idle";
        }

        this.mouseDistance = Vector.sub(this.mousePosition,this.body.position);
        // Body.setAngle(this.body, Vector.angle(Vector.create(0, 1), this.mouseDistance));

        if(this.action != "hide"){
            if (this.dirX != 0 || this.dirY != 0) {
                Body.translate(this.body, Vector.mult(Vector.create(this.dirX, this.dirY), this.speed));
                // Body.setVelocity(this.body,Vector.create(this.dirX*20,this.dirY*20));
                this.action = "move";
            } else {
                this.action = "idle";
            }
        }

        if (this.mrb === true && this.entityInHand != null) {
            this.throw();
        }
        
    }

    /**
     *处理用户输入
     *
     * @param {*} client
     * @param {*} CMD
     * @param {*} value
     * @memberof Character
     */
    onCMD(CMD, value) {
        if (CMD === "move") {
            this.move(value.x, value.y);
        } else if (CMD === "mousemove") {
            this.mousePosition.x = value.x;
            this.mousePosition.y = value.y;
        } else if (CMD === "mlb") {
            this.mlb = value;
        } else if (CMD === "mrb") {
            this.mrb = value;
        }
    }


    /**
     *被其他角色伤害
     *
     * @param {Character} character 其他角色
     * @memberof Character
     */
    hurtBy(character: Character) {
        this.dead();
    }


    /**
     *玩家死亡
     *
     * @memberof Character
     */
    dead() {
        if (this.entityInHand != null){
            if(this.entityInHand instanceof Crate){
                this.entityInHand.releaseFromCharacter();
            }
        }

        this.action = "dead";
        this.owner.waitForRespawn();
        this.disablePhysics();
    }



    /**
     *移动
     *
     * @param {number} x
     * @param {number} y
     * @memberof Character
     */
    public move(x: number, y: number) {
        let _dir = Vector.create(x, y);
        _dir = Vector.normalise(_dir);
        this.dirX = _dir.x;
        this.dirY = _dir.y;
    }

    onCollisionStart(other: PhysicsEntity, self: PhysicsEntity) {
        super.onCollisionStart(other, self);
        if (other instanceof Crate) {
            if (this.entityInHand == null) {
                other.getByCharacter(this);
            }
        }
    }

    /**
     *投掷
     *
     * @memberof Character
     */
    throw() {
        if (this.entityInHand != null) {
            let b: Body = this.entityInHand.body;
            let dir = Vector.normalise(Vector.sub(this.mousePosition, this.body.position));


            (this.entityInHand as PhysicsEntity).enablePhysics();

            this.entityInHand.action = "throw";
            Body.setPosition(b, Vector.add(this.body.position, Vector.mult(dir, 10)));
            // Body.setVelocity(b, Vector.mult(dir,3));
            Body.applyForce(b, b.position, Vector.mult(dir, 0.5));
            this.entityInHand = null;
            this.action = "idle";
        }
    }
    

}