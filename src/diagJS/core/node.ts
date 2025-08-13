import Konva from "konva";
import { Renderable, RenderableType } from "../interface";
import type { ObjectData, Key } from "../types";
import { Binding, BindingMode } from "../model";

export class NodeTemplate extends Renderable {
    shapes: Konva.Shape[];
    
    override render() {

    }  
};

export class NodeTemplateBuilder {
    
}

export class Node extends Renderable {
    data: ObjectData;
    group?: Konva.Group | null;
    template: Konva.Shape;
    //ports: Port[];
    isSelected: boolean = false;
    position: {x: number, y: number}; // Relative To Canvas
    canResizable: boolean = true;
    canDraggable: boolean = true;
    isGroup: boolean = false;

    constructor() {
        super(RenderableType.Node);
        this.layer = new Konva.Layer();
    }

    override render() {
        
    }
}