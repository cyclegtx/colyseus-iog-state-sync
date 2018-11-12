import { EntityMap } from "colyseus";
import { Entity } from "./Entities/Entity";
import { Player } from "./Entities/Player";

export class GameState {
    entities: EntityMap<Entity> = {};
    players: EntityMap<Player> = {};
}