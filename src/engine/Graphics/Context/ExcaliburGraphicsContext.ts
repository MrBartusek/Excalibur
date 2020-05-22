import { Vector } from '../../Algebra';
import { Graphic } from '../Graphic';
import { Color } from '../../Drawing/Color';

// TODO should this use Graphic instead?
export type ImageSource = HTMLImageElement | HTMLCanvasElement;

export interface ExcaliburGraphicsContextState {
  opacity: number;
  z: number;
}

export interface ExcaliburContextOptions {
  elementId?: string;
  width: number;
  height: number;
  snapToPixel?: boolean;
  maxDrawingsPerBatch?: number;
}

export interface ExcaliburContextDiagnostics {
  quads: number;
  batches: number;
  uniqueTextures: number;
  maxTexturePerDraw: number;
}

export interface ExcaliburGraphicsContext {
  width: number;
  height: number;

  snapToPixel: boolean;

  backgroundColor: Color;
  opacity: number;
  z: number;

  // diag: ExcaliburContextDiagnostics;

  drawDebugRect(x: number, y: number, width: number, height: number): void;
  drawLine(start: Vector, end: Vector): void;

  /**
   * Draw an image to the Excalibur Graphics context at an x and y coordinate using the images width and height
   */
  drawImage(graphic: Graphic, x: number, y: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context at an x and y coordinate with a specific width and height
   */
  drawImage(graphic: Graphic, x: number, y: number, width: number, height: number): void;
  /**
   *
   * Draw an image to the Excalibur Graphics context specifying the source image coordinates (sx, sy, swidth, sheight)
   * and to a specific destination on the context (dx, dy, dwidth, dheight)
   */
  drawImage(
    graphic: Graphic,
    sx: number,
    sy: number,
    swidth?: number,
    sheight?: number,
    dx?: number,
    dy?: number,
    dwidth?: number,
    dheight?: number
  ): void;

  /**
   * Save the current state of the canvas to the stack (transforms and opacity)
   */
  save(): void;
  /**
   * Restore the state of the canvas from the stack
   */
  restore(): void;

  /**
   * Translate the origin of the context by an x and y
   * @param x
   * @param y
   */
  translate(x: number, y: number): void;
  /**
   * Rotate the context about the current origin
   */
  rotate(angle: number): void;
  /**
   * Scale the context by an x and y factor
   * @param x
   * @param y
   */
  scale(x: number, y: number): void;

  /**
   * Clears the screen with the current background color
   */
  clear(): void;

  /**
   * Flushes the batched draw calls to the screen
   */
  flush(): void;
}