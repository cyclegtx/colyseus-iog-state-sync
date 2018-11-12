import { EntityMap } from "colyseus";
import { Entity } from "./Entities/Entity";


export class GameState {
    entities: EntityMap<Entity> = {};
}