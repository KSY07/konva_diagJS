import Konva from "konva";
import { Renderable, RenderableType } from "../interface";
import { CoreCanvas } from "./canvas";

export class CoreCanvasGrid extends Renderable {
  canvas: CoreCanvas
  isVisible?: boolean = true;
  majorGridMargin?: number;
  minorGridMargin?: number;
  majorGridColor?: string;
  minorGridColor?: string;
  minorGridColorStops?: Map<number, string>;
  backgroundColor?: string;
  darkBackgroundColor?: string;

  constructor(canv: CoreCanvas, gridOptions?: Partial<CoreCanvasGrid>) {
    super(RenderableType.Grid, -1);
    this.canvas = canv;
    this.layerNo = -1; // Grid is Absoultely Lowest Layer
    this.majorGridMargin = gridOptions?.majorGridMargin ?? 50;
    this.minorGridMargin = gridOptions?.minorGridMargin ?? 10;

    this.majorGridColor = gridOptions?.majorGridColor ?? "#b3b3b3";
    this.minorGridColor = gridOptions?.minorGridColor ?? "#e0e0e0";
    this.backgroundColor = gridOptions?.backgroundColor ?? "#ffffff";

    const gridLayer = new Konva.Layer({ 
      listening: false, 
      clip: {x:0, y:0, width: this.canvas.maxWidth, height: this.canvas.maxHeight}
    });
    this.layer = gridLayer;
    this.canvas.stage.add(this.layer);
    this.layer.moveToBottom(); // Grid는 항상 맨 뒤로

    this.render();
  }

  override render() {
    
    if (this.isVisible) {
      this.layer.destroyChildren();

      const major = this.majorGridMargin!;
      const minor = this.minorGridMargin!;

      // 배경을 maxWidth x maxHeight 전체에 그리기
      this.layer.add(
        new Konva.Rect({
          x: 0,
          y: 0,
          width: this.canvas.maxWidth,
          height: this.canvas.maxHeight,
          fill: this.backgroundColor!,
        })
      );

      // Grid 전체 영역에 대해 그리기 (0 ~ maxWidth, 0 ~ maxHeight)
      const firstMajorX = 0;
      const firstMajorY = 0;

      // Minor lines between majors (vertical)
      for (let X = firstMajorX; X <= this.canvas.maxWidth; X += major) {
        for (let k = 1; k < 5; k++) {
          const xw = X + k * minor;
          if (xw > this.canvas.maxWidth!) continue;
          this.layer.add(
            new Konva.Line({
              points: [xw, 0, xw, this.canvas.maxHeight],
              stroke: this.minorGridColor!,
              strokeWidth: 1,
              perfectDrawEnabled: false,
            })
          );
        }
      }

      // Minor lines between majors (horizontal)
      for (let Y = firstMajorY; Y <= this.canvas.maxHeight; Y += major) {
        for (let k = 1; k < 5; k++) {
          const yw = Y + k * minor;
          if (yw > this.canvas.maxHeight!) continue;
          this.layer.add(
            new Konva.Line({
              points: [0, yw, this.canvas.maxWidth, yw],
              stroke: this.minorGridColor!,
              strokeWidth: 1,
              perfectDrawEnabled: false,
            })
          );
        }
      }

      // Major lines (vertical)
      for (let xw = firstMajorX; xw <= this.canvas.maxWidth; xw += major) {
        this.layer.add(
          new Konva.Line({
            points: [xw, 0, xw, this.canvas.maxHeight],
            stroke: this.majorGridColor!,
            strokeWidth: 1.5,
            perfectDrawEnabled: false,
          })
        );
      }

      // Major lines (horizontal)
      for (let yw = firstMajorY; yw <= this.canvas.maxHeight; yw += major) {
        this.layer.add(
          new Konva.Line({
            points: [0, yw, this.canvas.maxWidth, yw],
            stroke: this.majorGridColor!,
            strokeWidth: 1.5,
            perfectDrawEnabled: false,
          })
        );
      }

      // Border for maxWidth / maxHeight
      this.layer.add(
        new Konva.Rect({
          x: 0,
          y: 0,
          width: this.canvas.maxWidth,
          height: this.canvas.maxHeight,
          stroke: "#a0a0a0",
          strokeWidth: 2,
          fill: undefined,
          listening: false,
        })
      );

      this.layer.draw();
    }
  }
}
