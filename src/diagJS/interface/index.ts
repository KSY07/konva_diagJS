import Konva from "konva";
import { generateId } from "../utils/utils";

export enum RenderableType {
    Grid = 1, // Grid should be located at the back of the layers.
    Shape = 2,
    Node = 6,
    Link = 8,
    Port = 10,
    Context = 12,
}

export abstract class Renderable {
    id: string = "";
    layer: Konva.Layer;
    layerNo: number;
    //bounds?: () => Konva.Rect | { x: number; y: number; width: number; height: number};
    abstract render(): void;

    constructor(type: RenderableType) {
        switch(type) {
            case RenderableType.Grid:
                this.id = generateId("grid");
                break;
            case RenderableType.Node:
                this.id = generateId("node");
                break;
            default:
                this.id = generateId("renderable");
                break;
        }
    }
}