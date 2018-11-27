import { GameRoom as BaseGameRoom } from "../../IOGStateSync/GameRoom";
import { Entity } from "../../IOGStateSync/Entities/Entity";
import { RectBodyEntity } from "../../IOGStateSync/Entities/RectBodyEntity";
import { PolygonBodyEntity } from "../../IOGStateSync/Entities/PolygonBodyEntity";
import { Player } from "./Entities/Player";
import { Client } from "colyseus";

export class GameRoom extends BaseGameRoom {
    mapWidth: number = 1000;
    mapHeight:number = 1000;
    
    bots: Entity[] = [];

    // When room is initialized
    onInit(options: any) {
        super.onInit(options);
        this.setPatchRate(50);
        // this.setPatchRate(16.67);
        // this.engine.world.gravity.scale = 0.002;

        let testEntities = [];



        let rp = this.rndInMap();
        testEntities.push(new PolygonBodyEntity(this, "TestRect", rp.x, rp.y, 3, 32,{inertia:0}));
        rp = this.rndInMap();
        testEntities.push(new PolygonBodyEntity(this, "TestRect", rp.x, rp.y, 4, 32,{inertia:0}));
        rp = this.rndInMap();
        testEntities.push(new PolygonBodyEntity(this, "TestRect", rp.x, rp.y, 5, 32,{inertia:0}));
        rp = this.rndInMap();
        testEntities.push(new PolygonBodyEntity(this, "TestRect", rp.x, rp.y, 6, 32,{inertia:0}));
        rp = this.rndInMap();
        testEntities.push(new PolygonBodyEntity(this, "TestRect", rp.x, rp.y, 7, 32,{inertia:0}));
        rp = this.rndInMap();
        testEntities.push(new PolygonBodyEntity(this, "TestRect", rp.x, rp.y, 8, 32,{inertia:0}));

        testEntities.forEach(e=>{
            this.addEntity(e);
        })
        
        rp = this.rndInMap();
        let lt = new RectBodyEntity(this, "TestRect", rp.x, rp.y, 64, 64);
        this.addEntity(lt);

    }

    addPlayer(client:Client,name:string) {
        let playerEntity = new Player(this, name, client);
        playerEntity.client = client;
        this.players.set(client.sessionId, playerEntity);
        this.addEntity(playerEntity);
    }
    
}