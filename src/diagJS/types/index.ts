import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage } from "konva/lib/Stage";
import { Renderable } from "../interface";

export interface ObjectData {
    [index:string]: any;
}

export type Key = string | number | undefined;

export interface CanvasCurrent extends CanvasSnapshot {}

export interface CanvasSnapshot {
    pos: {x: number , y: number};
    scale: {x: number, y: number};
    size: { w: number, h: number};
    components: Renderable[];
}

export enum ShapeType {
    Rectangle = "rectangle",
    RoundedRectangle = "roundedRectangle", 
    Circle = "circle",
    Ellipse = "ellipse",
    Diamond = "diamond",
    Triangle = "triangle",
    Hexagon = "hexagon"
}

export interface NodeTemplateAttr {

}