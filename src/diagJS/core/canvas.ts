import Konva from "konva";
import { Renderable } from "../interface";
import { CoreCanvasGrid } from "./grid";

export class CoreCanvas {
  stage: Konva.Stage;
  width: number;
  height: number;
  maxWidth: number;
  maxHeight: number;
  div: HTMLDivElement;
  grid?: CoreCanvasGrid;
  gridOptions?: Partial<CoreCanvasGrid>
  layerCount: number;
  components: Renderable[] = []; // sort by layerNo (without Grid Layer)
  
  // Node/Link management
  nodes: Map<string, Node> = new Map();
  // Templates
  nodeTemplates: Map<string, Konva.Shape> = new Map();
  // Selection
  selectedNodes: Set<Node> = new Set();

  constructor(divId: string, options?: Partial<CoreCanvas>) {
    const selectDiv = document.querySelector(`#${divId}`);

    if (selectDiv instanceof HTMLDivElement) {
      this.div = selectDiv;
    } else {
      throw new Error(`div Not Found ID: ${divId}`);
    }

    this.width = options?.width ? options.width : 500;
    this.height = options?.height ? options.height : 500;
    this.maxWidth = options?.maxWidth ? options.maxWidth : this.width;
    this.maxHeight = options?.maxHeight ? options.maxHeight : this.height;

    this.layerCount = 0;

    this.stage = new Konva.Stage({
      container: divId,
      width: this.width,
      height: this.height,
      draggable: true,
      dragBoundFunc: (pos) => {
        const scale = this.stage.scaleX();
        
        const maxX = 0;
        const minX = this.width - this.maxWidth * scale;
        const maxY = 0;
        const minY = this.height - this.maxHeight * scale;
        
        let newX = pos.x;
        let newY = pos.y;
        
        if (newX > maxX) newX = maxX;
        if (newX < minX) newX = minX;
        if (newY > maxY) newY = maxY;
        if (newY < minY) newY = minY;
        
        return {
          x: newX,
          y: newY
        };
      },
    });

    const grid = new CoreCanvasGrid(this, this.gridOptions);
    this.grid = grid;
  }

}
