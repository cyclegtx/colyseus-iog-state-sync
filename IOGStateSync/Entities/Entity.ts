import shortid = require("shortid");
import { nosync } from "colyseus";
import { GameRoom } from "../GameRoom";
import { debug,debugsync } from "../DebugSetting";

export class Entity {

    @nosync
    room: GameRoom = null;

    @nosync
    id:string = null;

    angle: number = 0;
    action: string = "";
    type: string = "";
    x: number = 0;
    y: number = 0;
    
    @debugsync
    width: number = 0;

    @debugsync
    height: number = 0;

    @debugsync
    debug:boolean = debug;

    scale: number = 1;


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

    update(dt:number):void{}

}