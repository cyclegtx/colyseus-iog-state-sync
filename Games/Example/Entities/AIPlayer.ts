import { Vector, Body, Query, Bounds, Vertices, Bodies } from "matter-js";
import { Player } from "./Player";
import { nosync } from "colyseus";
import { Character } from "./Character";
import { Crate } from "./Crate";
import { GameRoom } from "../GameRoom";


export class AIPlayer extends Player {
    @nosync
    AIAction:string = "init";

    @nosync
    dirction:Vector = Vector.create(0,0);

    @nosync
    timeSinceLastThink:number = 0;

    @nosync
    timeBetweenThink:number = 2000;

    @nosync
    targetPosition:Vector = null;


    constructor(
        room:GameRoom,
    ) {
        super(room, "BOT_" + Math.random(), null);
        this.timeSinceLastThink = this.timeBetweenThink*0.5;
    }

    update(dt){
        super.update(dt);
        if(this.timeSinceLastThink < this.timeBetweenThink){
            this.timeSinceLastThink += dt;
        }else{
            this.AIAction = "idle";
        }

        if(this.character.action == "dead"){
            return;
        }

        if(this.AIAction == "idle"){
            this.findSomethingToDo();
        }else if(this.AIAction == "wander"){
            this.dirction = Vector.sub(this.mousePosition,this.character.body.position);
            if(Vector.magnitudeSquared(this.dirction) > 1){
                this.dirction = Vector.normalise(this.dirction);
                this.character.dirX = this.dirction.x;
                this.character.dirY = this.dirction.y;
            }else{
                this.character.dirX = 0;
                this.character.dirY = 0;
            }
        }else if(this.AIAction == "walkToTarget"){
            if(this.targetPosition != null){
                this.dirction = Vector.sub(this.targetPosition, this.character.body.position);
                if (Vector.magnitudeSquared(this.dirction) > 1) {
                    this.dirction = Vector.normalise(this.dirction);
                    this.character.dirX = this.dirction.x;
                    this.character.dirY = this.dirction.y;
                } else {
                    this.character.dirX = 0;
                    this.character.dirY = 0;
                }
            }
        }

    }

    seek() {
        let viewWidth = 160;
        let viewHeight = 160;
        let viewBounds: Bounds = {
            min: { x: this.character.body.position.x - viewWidth / 2, y: this.character.body.position.y - viewHeight / 2 },
            max: { x: this.character.body.position.x + viewWidth / 2, y: this.character.body.position.y + viewHeight / 2 },
        }
        let bodiesInView: Body[] = Query.region(this.room.engine.world.bodies, viewBounds);
        bodiesInView = bodiesInView.filter(b => {
            return b['entity_id'] != this.character.id;
        })
        bodiesInView.sort((a: Body, b: Body) => {
            return Vector.magnitudeSquared(Vector.sub(a.position, this.character.body.position)) - Vector.magnitudeSquared(Vector.sub(b.position, this.character.body.position));
        });

        let nearestCharacter: Character = null;
        let nearestCrate: Crate = null;
        bodiesInView.forEach((b) => {
            let entity = this.room.getEntityById(b['entity_id']);
            if (entity) {
                if (nearestCharacter === null && entity.type === "Character") {
                    nearestCharacter = entity as Character;
                }
                if (nearestCrate === null && entity.type === "Crate") {
                    nearestCrate = entity as Crate;
                }
            }
        });
        return {
            nearestCharacter: nearestCharacter,
            nearestCrate: nearestCrate
        };
    }

    findSomethingToDo(){
        let res = this.seek();

        if(this.character.entityInHand !== null){
            if (res.nearestCharacter) {
                this.character.mousePosition = res.nearestCharacter.body.position;
                this.character.throw();
                this.AIAction = "idle";
            }
        }else{
            if(res.nearestCrate){
                this.targetPosition = res.nearestCrate.body.position;
                this.AIAction = "walkToTarget";
            }
        }

        if(this.AIAction == "idle"){
            this.AIAction = "wander";
            this.mousePosition = this.room.rndInMap(32);
        }
        this.timeSinceLastThink = 0;
    }
}