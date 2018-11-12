import { Room, Client } from "colyseus";
import { GameState } from "./GameState";
import { Engine, Vector, Events } from "matter-js";
import { Entity } from "./Entities/Entity";
import { Wall } from "./Entities/Wall";
import { Player } from "./Entities/Player";
import { TestPlayer } from "./Entities/TestPlayer";
import { PhysicsEntity } from "./Entities/PhysicsEntity";


export class GameRoom extends Room<GameState> {
    /**
     *房间最多人数
     *
     * @memberof IOGStateSyncRoom
     */
    maxClients = 20;

    /**
     *Matterjs Engine
     *
     * @type {Engine}
     * @memberof IOGStateSyncRoom
     */
    engine: Engine = null;

    /**
     *地图宽
     *
     * @type {number}
     * @memberof IOGStateSyncRoom
     */
    mapWidth: number = 250;

    /**
     *地图高
     *
     * @type {number}
     * @memberof IOGStateSyncRoom
     */
    mapHeight: number = 250;

    /**
     *地图边界宽度
     *
     * @type {number}
     * @memberof IOGStateSyncRoom
     */
    mapBorder: number = 50;

    state: GameState = null;


    // Authorize client based on provided options before WebSocket handshake is complete
    // onAuth (options: any) {
    //     return true;
    // }

    // When room is initialized
    onInit (options: any) { 
        this.state = new GameState();
        this.setState(this.state);
        this.engine = Engine.create();
        this.engine.world.gravity.scale = 0;
        this.createWalls();
        
        Events.on(this.engine, "collisionStart", this.onCollisionStart.bind(this));
        Events.on(this.engine, "collisionEnd", this.onCollisionStart.bind(this));

        this.setSimulationInterval(this.update.bind(this));
    }

    update() {
        for (let k in this.state.entities) {
            this.state.entities[k].update(this.clock.deltaTime);
        }
        Engine.update(this.engine, this.clock.deltaTime);
    }

    // Checks if a new client is allowed to join. (default: `return true`)
    requestJoin (options: any, isNew: boolean) {
        return true;
    }


    // When client successfully join the room
    onJoin (client: Client) {
        this.addPlayer(client.sessionId);
    }

    // When a client leaves the room
    onLeave (client: Client, consented: boolean) { 
        this.removePlayer(client.sessionId);
    }

    // When a client sends a message
    onMessage (client: Client, message: any) {
        if (message.CMD) {
            this.onCMD(client, message.CMD, message.value);
        }
    }

    // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
    onDispose () {
        console.log("Dispose IOGRoom");
    }

    /**
     *处理用户输入
     *
     * @param {*} client
     * @param {*} CMD
     * @param {*} value
     * @memberof IOGStateSyncRoom
     */
    onCMD(client, CMD, value) {
        let player:Player = this.state.players[client.sessionId];
        if (player) {
            player.onCMD(CMD, value);
        }
    }


    /**
     *创建游戏边界
     *
     * @memberof IOGStateSyncRoom
     */
    createWalls() {
        this.addEntity(new Wall(this, 0, this.mapHeight / 2 + this.mapBorder / 2, this.mapWidth + this.mapBorder * 2, this.mapBorder));
        this.addEntity(new Wall(this, 0, -this.mapHeight / 2 - this.mapBorder / 2, this.mapWidth + this.mapBorder * 2, this.mapBorder));
        this.addEntity(new Wall(this, -this.mapWidth / 2 - this.mapBorder / 2, 0, this.mapBorder, this.mapHeight + this.mapBorder * 2));
        this.addEntity(new Wall(this, this.mapWidth / 2 + this.mapBorder / 2, 0, this.mapBorder, this.mapHeight + this.mapBorder * 2));
    }

    /**
     *随机位置
     *
     * @returns {Vector}
     * @memberof IOGStateSyncRoom
     */
    rndPosition(): Vector {
        return Vector.create(
            Math.random() * 200 - 100,
            Math.random() * 200 - 100,
        )
    }

    /**
     *获取地图范围内随机位置
     *
     * @param {number} offset 边界
     * @returns {Vector}
     * @memberof IOGStateSyncRoom
     */
    rndInMap(_offset?: number): Vector {
        let offset = _offset === undefined ? 0 : _offset;
        return Vector.create(
            Math.random() * (this.mapWidth - offset) - this.mapWidth / 2,
            Math.random() * (this.mapHeight - offset) - this.mapHeight / 2,
        )
    }

    /**
     *添加玩家
     *
     * @param {string} sessionId
     * @memberof IOGStateSyncRoom
     */
    addPlayer(sessionId: string) {
        let playerEntity = new TestPlayer(this, "Player_" + Math.random());
        playerEntity.sessionId = sessionId;
        this.state.players[sessionId] = playerEntity;
        this.addEntity(playerEntity);
    }


    /**
     *删除玩家
     *
     * @param {string} sessionId
     * @memberof IOGStateSyncRoom
     */
    removePlayer(sessionId: string) {
        let player:Player = this.state.players[sessionId];
        if (player) {
            player.destroy();
        }
    }

    /**
     *添加Entity
     *
     * @param {Entity} entity
     * @memberof IOGStateSyncRoom
     */
    addEntity(entity: Entity): void {
        this.state.entities[entity.id] = entity;
    }

    /**
     *当碰撞开始
     *
     * @param {*} event
     * @memberof IOGStateSyncRoom
     */
    onCollisionStart(event) {
        let pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];

            let entityA:PhysicsEntity = this.state.entities[pair.bodyA.entity_id] as PhysicsEntity;
            let entityB:PhysicsEntity = this.state.entities[pair.bodyB.entity_id] as PhysicsEntity;
            if (entityA != undefined && entityB != undefined) {
                entityA.onCollisionStart(entityA, entityB);
                entityB.onCollisionStart(entityA, entityB);
            }
        }
    }

    /**
     *当碰撞结束
     *
     * @param {*} event
     * @memberof IOGStateSyncRoom
     */
    onCollisionEnd(event) {
        let pairs = event.pairs;
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            
            let entityA:PhysicsEntity = this.state.entities[pair.bodyA.entity_id] as PhysicsEntity;
            let entityB:PhysicsEntity = this.state.entities[pair.bodyB.entity_id] as PhysicsEntity;
            if (entityA != undefined && entityB != undefined) {
                entityA.onCollisionEnd(entityA, entityB);
                entityB.onCollisionEnd(entityA, entityB);
            }
        }
    }

    /**
     *根据id获取Entity
     *
     * @param {string} id
     * @returns
     * @memberof GameRoom
     */
    getEntityById(id:string){
        return this.state.entities[id];
    }

}