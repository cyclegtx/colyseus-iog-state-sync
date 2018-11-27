import { Vector, Body, Query, Bounds, Vertices, Bodies } from "matter-js";
import { Player } from "./Player";
import { nosync } from "colyseus";
import { GameRoom } from "../GameRoom";
import { Tank } from "./Tank";
import { Food } from "./Food";
import { PhysicsEntity } from "../../../IOGStateSync/Entities/PhysicsEntity";


export class AIPlayer extends Player {
    @nosync
    AIAction: string = "init";

    @nosync
    dirction: Vector = Vector.create(0, 0);

    @nosync
    timeSinceLastThink: number = 0;

    @nosync
    timeBetweenThink: number = 2000;

    @nosync
    targetPosition: Vector = null;

    @nosync
    nearestFood:Food = null;

    @nosync
    nearestTank:Tank = null;

    @nosync
    reachTargetTimer:number = 0;


    constructor(
        room: GameRoom
    ) {
        super(room, "BOT_",null);
        this.name += (this.room as GameRoom).bots.length;
        this.timeSinceLastThink = this.timeBetweenThink * 0.5;
    }

    update(dt) {
        super.update(dt);

        if (this.tank == null) {
            return
        }

        this.seek();

        if(this.tank.unSelectedSkills.length > 0){
            this.tank.selectSkill(Math.floor(Math.random() * 4));
        }
        
        if (this.timeSinceLastThink < this.timeBetweenThink) {
            this.timeSinceLastThink += dt;
        } else {
            this.AIAction = "idle";
        }

        if (this.tank == null || this.tank.action == "dead") {
            return;
        }

        if(this.nearestTank != null){
            this.targetPosition = this.nearestTank.body.position;
            this.AIAction = "shootTarget";
        }

        if (this.AIAction == "idle") {
            this.findSomethingToDo();
        } else if (this.AIAction == "wander") {
            this.dirction = Vector.sub(this.mousePosition, this.tank.body.position);
            if (Vector.magnitudeSquared(this.dirction) > 10) {
                this.dirction = Vector.normalise(this.dirction);
                this.tank.dirX = this.dirction.x;
                this.tank.dirY = this.dirction.y;
            } else {
                this.tank.dirX = 0;
                this.tank.dirY = 0;
            }
        } else if (this.AIAction == "walkToTarget") {
            if (this.targetPosition != null) {
                this.dirction = Vector.sub(this.targetPosition, this.tank.body.position);
                if (Vector.magnitudeSquared(this.dirction) > 10) {
                    this.dirction = Vector.normalise(this.dirction);
                    this.tank.dirX = this.dirction.x;
                    this.tank.dirY = this.dirction.y;
                } else {
                    this.tank.dirX = 0;
                    this.tank.dirY = 0;
                }
            }
        }else if(this.AIAction == "shootTarget"){
            this.tank.mousePosition = this.targetPosition;
            this.tank.mlb = true;
            this.dirction = Vector.sub(this.targetPosition, this.tank.body.position);
            if (Vector.magnitudeSquared(this.dirction) > 100000) {
                this.dirction = Vector.normalise(this.dirction);
                this.tank.dirX = this.dirction.x;
                this.tank.dirY = this.dirction.y;
            } else {
                this.reachTargetTimer -= dt;
                if(this.reachTargetTimer <= 0){
                    this.reachTargetTimer = 1000;
                    this.tank.dirX = Math.random()*2-1;
                    this.tank.dirY = Math.random()*2-1;
                }
            }
        }

    }

    seek() {

        let viewWidth = 512;
        let viewHeight = 512;
        
        let viewBounds: Bounds = {
            min: { x: this.tank.body.position.x - viewWidth / 2, y: this.tank.body.position.y - viewHeight / 2 },
            max: { x: this.tank.body.position.x + viewWidth / 2, y: this.tank.body.position.y + viewHeight / 2 },
        }
        let bodiesInView: Body[] = Query.region(this.room.engine.world.bodies, viewBounds);
        bodiesInView = bodiesInView.filter(b => {
            return b['entity_id'] != this.tank.id;
        })
        bodiesInView.sort((a: Body, b: Body) => {
            return Vector.magnitudeSquared(Vector.sub(a.position, this.tank.body.position)) - Vector.magnitudeSquared(Vector.sub(b.position, this.tank.body.position));
        });

        let nearestTank: Tank = null;
        let nearestFood: Food = null;
        bodiesInView.forEach((b) => {
            let entity = this.room.getEntityById(b['entity_id']) as PhysicsEntity;
            if (entity) {
                if (nearestTank === null && entity.type === "Tank") {
                    nearestTank = entity as Tank;
                }
                if (nearestFood === null && entity.type === "Food") {
                    nearestFood = entity as Food;
                }
            }
        });
        this.nearestFood = nearestFood;
        this.nearestTank = nearestTank;
    }

    findSomethingToDo() {
        if (this.nearestTank) {
            this.targetPosition = this.nearestTank.body.position;
            this.mousePosition = this.room.rndInMap(32);
            this.AIAction = "shootTarget";
        }else if (this.nearestFood) {
            this.targetPosition = this.nearestFood.body.position;
            this.mousePosition = this.room.rndInMap(32);
            this.AIAction = "shootTarget";
        }

        if (this.AIAction == "idle") {
            this.AIAction = "wander";
            this.mousePosition = this.room.rndInMap(32);
        }
        this.timeSinceLastThink = 0;
    }
}