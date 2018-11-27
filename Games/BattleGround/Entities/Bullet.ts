import { CircleBodyEntity } from "../../../IOGStateSync/Entities/CircleBodyEntity";
import { Tank } from "./Tank";
import { nosync } from "colyseus";
import { PhysicsEntity } from "../../../IOGStateSync/Entities/PhysicsEntity";
import { Food } from "./Food";
import { GameRoom } from "../../../IOGStateSync/GameRoom";


export class Bullet extends CircleBodyEntity{

    @nosync
    owner:Tank = null;

    @nosync
    life:number = 3000;

    @nosync
    damage:number = 7;

    ownerId:string = "";

    @nosync
    private _health: number = 1;
    public get health(): number {
        return this._health;
    }
    public set health(value: number) {
        this._health = value;
        if(this._health <= 0){
            this.destroy();
        }
    }

    constructor(room:GameRoom,tank:Tank,x:number,y:number){
        super(room,"Bullet",x,y,12,{isSensor:true});
        this.owner = tank;
        this.ownerId = tank.sessionId;
        //以下默认变量不需要同步
        nosync(this,"action");
        nosync(this,"angle");
        nosync(this,"scale");

    }

    update(dt){
        super.update(dt);

        this.life -= dt;
        if(this.life <= 0){
            this.destroy();
        }

    }

    onCollisionStart(other: PhysicsEntity, self: PhysicsEntity) {
        super.onCollisionStart(other, self);

        if(other instanceof Food){
            other.hitByTank(this.owner,this.damage);
        }

        if(other instanceof Tank){
            if(other === this.owner){
                return;
            }
            other.hurtBy(this.owner,this.damage);
        }

        if(other instanceof Bullet){
            if(other.owner === this.owner){
                return;
            }
        }

        this.health--;
    }

}