import shortid = require("shortid");
import { Vector, Body} from "matter-js";
import { nosync } from "colyseus";
import { PhysicsEntity } from "../../../IOGStateSync/Entities/PhysicsEntity";
import { Player } from "./Player";
import { CircleBodyEntity } from "../../../IOGStateSync/Entities/CircleBodyEntity";
import { Food } from "./Food";
import { Bullet } from "./Bullet";
import { GameRoom } from "../../../IOGStateSync/GameRoom";


export class Tank extends CircleBodyEntity {

    @nosync
    levelTable: [number, number, number][] = [
        [0, 4, 1],
        [4, 9, 1],
        [13, 15, 2],
        [28, 22, 3],
        [50, 28, 4],
        [78, 35, 5],
        [113, 44, 6],
        [157, 54, 7],
        [211, 64, 8],
        [275, 75, 9],
        [350, 87, 10],
        [437, 101, 11],
        [538, 113, 11],
        [655, 132, 12],
        [787, 151, 12],
        [938, 171, 13],
        [1109, 192, 13],
        [1301, 215, 13],
        [1516, 241, 14],
        [1757, 269, 14],
        [2026, 299, 15],
        [2325, 333, 15],
        [2658, 368, 15],
        [3026, 407, 16],
        [3433, 450, 16],
        [3883, 496, 16],
        [4379, 546, 17],
        [4925, 600, 17],
        [5525, 659, 17],
        [6184, 723, 17],
        [6907, 791, 18],
        [7698, 839, 18],
        [8537, 889, 18],
        [9426, 942, 19],
        [10368, 999, 19],
        [11367, 1059, 19],
        [12426, 1123, 19],
        [13549, 1190, 20],
        [14739, 1261, 20],
        [16000, 1337, 20],
        [17337, 1417, 20],
        [18754, 1502, 21],
        [20256, 1593, 21],
        [21849, 1687, 21],
        [23536, Infinity, 22],
    ];

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
    speed: number = 3;

    @nosync
    owner: Player = null;

    @nosync
    shootTimer:number = 0;

    @nosync
    shootCD:number = 600;

    @nosync
    regenTimer: number = 0;

    @nosync
    regenCD: number = 1000;

    /**
     *每秒钟恢复生命值百分比
     *
     * @type {number}
     * @memberof Tank
     */
    @nosync
    regenPerSecond: number = 0.0312;

    score:number = 0;
    curScore: number = 0;
    nextScore:number = 0;

    level:number = 1;

    health: number = 10;
    maxHealth: number = 10;

    name: string = "";
    sessionId:string = null;

    frontBarrels: number = 1;
    rightBarrels: number = 0;
    backBarrels: number = 0;
    leftBarrels: number = 0;

    @nosync
    unSelectedSkills:any[][] = [];

    constructor(
        room:GameRoom,
        owner:Player,
        x: number,
        y:number,
    ) {
        super(room, "Tank", x, y, 32, { frictionAir: 0.8, inertia: Infinity });
        this.owner = owner;
        this.name = owner.name;
        this.sessionId = owner.sessionId;
        this.action = "idle";
        this.setLevel(1);
        this.health = this.maxHealth;
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

        //regen
        this.regenTimer -= dt;
        if(this.regenTimer <= 0){
            this.regenTimer = this.regenCD;
            let health = this.health + this.maxHealth * this.regenPerSecond;
            this.health = health>this.maxHealth?this.maxHealth:health;
        }

        Body.setAngle(this.body, Vector.angle(this.mousePosition, this.body.position));

        this.mouseDistance = Vector.sub(this.mousePosition,this.body.position);
        // Body.setAngle(this.body, Vector.angle(Vector.create(0, 1), this.mouseDistance));

        if (this.action == "shoot" && this.shootTimer <= 0 && this.mlb) {
            this.shoot();
        }

        if (this.dirX != 0 || this.dirY != 0) {
            Body.translate(this.body, Vector.mult(Vector.create(this.dirX, this.dirY), this.speed));
            // Body.setVelocity(this.body,Vector.create(this.dirX*20,this.dirY*20));
        }

        if(this.shootTimer > 0){
            this.shootTimer -= dt;
        }else{
            this.action = "idle";
        }

        if(this.mlb && this.shootTimer <= 0){
            this.action = "shoot";
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
            // if(this.mlb){
            //     this.scaleBody(1.1);
            // }
        } else if (CMD === "mrb") {
            this.mrb = value;
            // if (this.mrb) {
            //     this.scaleBody(0.9);
            // }
        }else if(["1","2","3","4"].indexOf(CMD) !== -1){
        }else if(CMD === "selectSkill"){
            console.log(CMD,value);
            this.selectSkill(value);
        }
    }


    /**
     *被其他角色伤害
     *
     * @param {Tank} tank 其他角色
     * @memberof Character
     */
    hurtBy(tank: Tank, _damage:number) {
        this.health -= _damage;
        if(this.health <= 0){
            this.health = 0;
            tank.owner.kill++;
            this.dead();
        }
    }


    /**
     *玩家死亡
     *
     * @memberof Character
     */
    dead() {
        this.action = "dead";
        this.owner.death++;
        this.owner.waitForRespawn();
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
        if (other instanceof Food) {
            other.hitByTank(this,7);
        }
    }

    /**
     *发射子弹
     *
     * @memberof ExampleCharacter
     */
    shoot(){
        this.directionShoot(0, this.frontBarrels);
        this.directionShoot(1, this.rightBarrels);
        this.directionShoot(2, this.backBarrels);
        this.directionShoot(3,this.leftBarrels);
        this.shootTimer = this.shootCD;
    }

    directionShoot(_dir:number,count:number){
        let startPosition = null;
        let direction: Vector = null;
        let offset:Vector = Vector.create(0,16);
        switch (_dir) {
            case 0:
                direction = Vector.normalise(this.mouseDistance);
                break;
            case 1:
                direction = Vector.normalise(Vector.rotate(this.mouseDistance, Math.PI / 2));
                offset = Vector.rotate(offset, Math.PI / 2);
                break;
            case 2:
                direction = Vector.normalise(Vector.rotate(this.mouseDistance, Math.PI));
                break;
            case 3:
                direction = Vector.normalise(Vector.rotate(this.mouseDistance, -Math.PI / 2));
                offset = Vector.rotate(offset, -Math.PI / 2);
                break;
        }
        if (count === 1) {
            startPosition = this.body.position;
            this.barrelShoot(startPosition, direction);
        } else if (count == 2) {
            startPosition = Vector.add(this.body.position, Vector.rotate(Vector.mult(offset,-1), this.body.angle));
            this.barrelShoot(startPosition, direction);
            startPosition = Vector.add(this.body.position, Vector.rotate(offset, this.body.angle));
            this.barrelShoot(startPosition, direction);
        } else if (count == 3) {
            startPosition = Vector.add(this.body.position, Vector.rotate(Vector.mult(offset, -1), this.body.angle));
            this.barrelShoot(startPosition, direction);
            this.barrelShoot(this.body.position, direction);
            startPosition = Vector.add(this.body.position, Vector.rotate(offset, this.body.angle));
            this.barrelShoot(startPosition, direction);
        }
    }

    barrelShoot(startPosition:Vector,direction:Vector){
        let bullet = new Bullet(this.room, this, startPosition.x, startPosition.y);
        this.room.addEntity(bullet);
        Body.setVelocity(bullet.body, Vector.mult(direction, 10));
    }

    /**
     *设置等级
     *
     * @memberof Tank
     */
    setLevel(_level:number){
        if(this.level != _level){
            
            if(this.level < _level){
                //TODO:生成Skill模板
                let allSkills = [0,1,2,3];
                let skillset = [];
                allSkills.sort(()=>{return Math.random()>0.5?1:-1})
                        .slice(0,3)
                        .forEach(s=>{
                            skillset.push([shortid.generate(),s])
                        });
                this.unSelectedSkills.push(skillset);
                console.log(this.unSelectedSkills)

                if(this.owner.client){
                    this.room.send(this.owner.client, ["unselectedSkills",this.unSelectedSkills[0]]);
                }
                // switch (Math.floor(Math.random() * 4)) {
                //     case 0:
                //         this.frontBarrels = this.frontBarrels +1>3?3:this.frontBarrels+1;
                //         break;
                //     case 1:
                //         this.rightBarrels = this.rightBarrels + 1 > 3 ? 3 : this.rightBarrels + 1;
                //         break;
                //     case 2:
                //         this.backBarrels = this.backBarrels + 1 > 3 ? 3 : this.backBarrels + 1;
                //         break;
                //     case 3:
                //         this.leftBarrels = this.leftBarrels + 1 > 3 ? 3 : this.leftBarrels + 1;
                //         break;
                // }
            }

            this.level = _level;

            this.shootCD = (this.level - 1)*7+600;
    
            let healthPer = this.health/this.maxHealth;
            this.maxHealth = (this.level - 1) * 2 + 50;
            this.health = this.maxHealth*healthPer;
    
            this.regenPerSecond = (this.level - 1)* 0.002 + 0.0312;
        }
    }

    /**
     *增加积分
     *
     * @param {number} _score 待增加的积分
     * @memberof Tank
     */
    addScore(_score: number) {
        this.score += _score;
        if (this.level < this.levelTable.length) {
            this.levelTable.forEach((value, key) => {
                if (this.score >= value[0] && this.score < value[0] + value[1]) {
                    this.setLevel(key + 1);
                    this.nextScore = value[0] + value[1];
                    this.curScore = value[0];
                }
            })
        }
    }
    
    /**
     *选择技能
     *
     * @param {*} selectorId
     * @returns
     * @memberof Tank
     */
    selectSkill(selectorId:number){
        if(this.unSelectedSkills.length <=0){
            return;
        }
        let skills = this.unSelectedSkills.shift();
        console.log(skills)
        skills = skills.filter(s=>{
            return s[0] == selectorId;
        });
        console.log(skills)
        if(skills.length >0){
            let skillId = skills[0][1];
            console.log(skillId);
            switch (skillId) {
                case 0:
                    this.frontBarrels = this.frontBarrels + 1 > 3 ? 3 : this.frontBarrels + 1;
                    break;
                case 1:
                    this.rightBarrels = this.rightBarrels + 1 > 3 ? 3 : this.rightBarrels + 1;
                    break;
                case 2:
                    this.backBarrels = this.backBarrels + 1 > 3 ? 3 : this.backBarrels + 1;
                    break;
                case 3:
                    this.leftBarrels = this.leftBarrels + 1 > 3 ? 3 : this.leftBarrels + 1;
                    break;
            }
        }

        if (this.owner.client) {
            if (this.unSelectedSkills.length > 0) {
                this.room.send(this.owner.client, ["unselectedSkills", this.unSelectedSkills[0]]);
            } else {
                this.room.send(this.owner.client, ["skillsAllSelected", this.unSelectedSkills[0]]);
            }
        }

    }

}