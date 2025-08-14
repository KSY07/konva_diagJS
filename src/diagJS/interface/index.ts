import Konva from "konva";
import { generateId } from "../utils/utils";
import type { CoreModel } from "../core/model";

export interface Observable {
    observe(): void;
}

export interface Observer {

}

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
    layerNo: number; // Grid = -1
    abstract render(): void;

    constructor(type: RenderableType, layerNo: number) {
        this.layer = new Konva.Layer();
        this.layerNo = layerNo;

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

export interface CanvasSnapshot {
    stage: Konva.Stage;
    model: CoreModel;
}