import { RectBodyEntity } from "./RectBodyEntity";
import { GameRoom } from "../GameRoom";

export class Wall extends RectBodyEntity{

    constructor(
        room:GameRoom,
        x: number,
        y: number,
        width:number,
        height:number,
    ) {
        super(room,"Wall",x,y,width,height,{isStatic:true});
    }
}