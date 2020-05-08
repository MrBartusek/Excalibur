import { Graphic, GraphicOptions } from './Graphic';
import { RawImage } from './RawImage';
import { ExcaliburGraphicsContext, ImageSource } from './Context/ExcaliburGraphicsContext';

export type SourceView = { x: number; y: number; width: number; height: number };
export type DestinationSize = { width: number; height: number };

export interface SpriteOptions {
  /**
   * Image to create a sprite from
   */
  image: RawImage;
  /**
   * By default the source is the entire dimension of the [[RawImage]]
   */
  sourceView?: { x: number; y: number; width: number; height: number };
  /**
   * By default the size of the final sprite is the size of the [[RawImage]]
   */
  destSize?: { width: number; height: number };
}

export class Sprite extends Graphic {
  public rawImage: RawImage;
  public sourceView: SourceView;
  public destSize: DestinationSize;

  public static from(image: RawImage): Sprite {
    return new Sprite({
      image: image
    });
  }

  constructor(options: GraphicOptions & SpriteOptions) {
    super(options);
    this.rawImage = options.image;
    this.sourceView = options.sourceView ?? { x: 0, y: 0, width: 0, height: 0 };
    this.destSize = options.destSize ?? { width: 0, height: 0 };
    this.rawImage.whenLoaded.then(() => {
      this._updateSpriteDimensions();
    });
  }

  private _updateSpriteDimensions() {
    const { width: nativeWidth, height: nativeHeight } = this.rawImage;
    this.sourceView.width = this.sourceView.width || nativeWidth;
    this.sourceView.height = this.sourceView.height || nativeHeight;
    this.destSize.width = this.destSize.width || nativeWidth;
    this.destSize.height = this.destSize.height || nativeHeight;

    this.width = Math.ceil(this.destSize.width);
    this.height = Math.ceil(this.destSize.height);
  }

  public _drawImage(ex: ExcaliburGraphicsContext, x: number, y: number) {
    if (this.rawImage.isLoaded()) {
      this._updateSpriteDimensions();
      ex.drawImage(
        this,
        this.sourceView.x,
        this.sourceView.y,
        this.sourceView.width,
        this.sourceView.height,
        x,
        y,
        this.destSize.width,
        this.destSize.height
      );
    }
  }

  public getSource(): ImageSource {
    return this.rawImage.image;
  }

  public clone(): Sprite {
    return new Sprite({
      image: this.rawImage,
      sourceView: { ...this.sourceView },
      destSize: { ...this.destSize },
      ...this.cloneGraphicOptions()
    });
  }
}