import shortid = require("shortid");
import { nosync } from "colyseus";
import { GameRoom } from "../GameRoom";

export class Entity {
    @nosync
    public room: GameRoom = null;

    public id:string = null;
    public angle: number = 0;
    public action: string = "";
    public type: string = "";
    public x: number = 0;
    public y: number = 0;
    public width: number = 0;
    public height: number = 0;


    constructor(
        room: GameRoom,
        type:string,
        x: number,
        y: number,
        width:number,
        height:number
    ) {
        this.room = room;
        this.id = shortid.generate();
        this.type = type;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     *删除
     *
     * @memberof Entity
     */
    destroy():void{
        delete this.room.state.entities[this.id];
    }

    update(dt:number):void{
    }

}