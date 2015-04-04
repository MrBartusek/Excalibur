/// <reference path="Actor.ts" />

module ex {
   /**
    * Enum representing the different horizontal text alignments
    */
   export enum TextAlign {
      /**
       * The text is left-aligned.
       */
      Left,
      /**
       * The text is right-aligned.
       */
      Right,
      /**
       * The text is centered.
       */
      Center,
      /**
       * The text is aligned at the normal start of the line (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
       */
      Start,
      /**
       * The text is aligned at the normal end of the line (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
       */
      End
   }

   /**
    * Enum representing the different baseline text alignments
    */
   export enum BaseAlign {
      /**
       * The text baseline is the top of the em square.
       */
      Top,
      /**
       * The text baseline is the hanging baseline.  Currently unsupported; this will act like alphabetic.
       */
      Hanging,
      /**
       * The text baseline is the middle of the em square.
       */
      Middle,
      /**
       * The text baseline is the normal alphabetic baseline.
       */
      Alphabetic,
      /**
       * The text baseline is the ideographic baseline; this is the bottom of 
       * the body of the characters, if the main body of characters protrudes 
       * beneath the alphabetic baseline.  Currently unsupported; this will 
       * act like alphabetic.
       */
      Ideographic,
      /**
       * The text baseline is the bottom of the bounding box.  This differs
       * from the ideographic baseline in that the ideographic baseline 
       * doesn't consider descenders.
       */
      Bottom
   }

   /**
    * Labels are the way to draw small amounts of text to the screen in Excalibur. They are
    * actors and inherit all of the benifits and capabilities.
    *
    * It is recommended to use a [[SpriteFont]] for labels as the raw Canvas
    * API for drawing text is slow (`fillText`).
    */
   export class Label extends Actor {

      /**
       * The text to draw.
       */
      public text: string;

      /**
       * The [[SpriteFont]] to use, if any. Overrides [[font]] if present.
       */
      public spriteFont: SpriteFont;

      /**
       * The CSS font string (e.g. `10px sans-serif`, `10px Droid Sans Pro`). Web fonts
       * are supported, same as in CSS.
       */
      public font: string;

      /**
       * Gets or sets the horizontal text alignment property for the label. 
       */
      public textAlign: TextAlign;

      /**
       * Gets or sets the baseline alignment property for the label.
       */
      public baseAlign: BaseAlign;

      /**
       * Gets or sets the maximum width (in pixels) that the label should occupy
       */
      public maxWidth: number;
      
      /**
       * Gets or sets the letter spacing on a Label. Only supported with Sprite Fonts.
       */
      public letterSpacing: number = 0; //px

      /**
       * Whether or not the [[SpriteFont]] will be case-sensitive when matching characters.
       */
      public caseInsensitive: boolean = true;

      private _textShadowOn: boolean = false;
      private _shadowOffsetX: number = 0;
      private _shadowOffsetY: number = 0;
      private _shadowColor: Color = Color.Black.clone();
      private _shadowColorDirty: boolean = false;

      private _textSprites: { [key: string]: Sprite; } = {};
      private _shadowSprites: { [key: string]: Sprite; } = {};

      private _color: Color = Color.Black.clone();

      /**
       * @param text        The text of the label
       * @param x           The x position of the label
       * @param y           The y position of the label
       * @param font        Use any valid CSS font string for the label's font. Web fonts are supported. Default is `10px sans-serif`.
       * @param spriteFont  Use an Excalibur sprite font for the label's font, if a SpriteFont is provided it will take precendence over a css font.
       */
      constructor(text?: string, x?: number, y?: number, font?: string, spriteFont?: SpriteFont) {
         super(x, y);
         this.text = text || "";
         this.color = Color.Black.clone();
         this.spriteFont = spriteFont;
         this.collisionType = CollisionType.PreventCollision;
         this.font = font || "10px sans-serif"; // coallesce to default canvas font
         if (spriteFont) {
            this._textSprites = spriteFont.getTextSprites();
         }
      }


      /**
       * Returns the width of the text in the label (in pixels);
       * @param ctx  Rending context to measure the string with
       */
      public getTextWidth(ctx: CanvasRenderingContext2D): number {
         var oldFont = ctx.font;
         ctx.font = this.font;
         var width = ctx.measureText(this.text).width;
         ctx.font = oldFont;
         return width;
      }

      // TypeScript doesn't support string enums :(
      private _lookupTextAlign(textAlign: TextAlign): string {
         switch (textAlign) {
            case TextAlign.Left:
               return "left";
               break;
            case TextAlign.Right:
               return "right";
               break;
            case TextAlign.Center:
               return "center";
               break;
            case TextAlign.End:
               return "end";
               break;
            case TextAlign.Start:
               return "start";
               break;
            default:
               return "start";
               break;
         }
      }

      private _lookupBaseAlign(baseAlign: BaseAlign): string {
         switch (baseAlign) {
            case BaseAlign.Alphabetic:
               return "alphabetic";
               break;
            case BaseAlign.Bottom:
               return "bottom";
               break;
            case BaseAlign.Hanging:
               return "hangin";
               break;
            case BaseAlign.Ideographic:
               return "ideographic";
               break;
            case BaseAlign.Middle:
               return "middle";
               break;
            case BaseAlign.Top:
               return "top";
               break;
            default:
               return "alphabetic";
               break;
         }
      }

      /**
       * Sets the text shadow for sprite fonts
       * @param offsetX      The x offset in pixels to place the shadow
       * @param offsetY      The y offset in pixles to place the shadow
       * @param shadowColor  The color of the text shadow
       */
      public setTextShadow(offsetX: number, offsetY: number, shadowColor: Color) {
         this._textShadowOn = true;
         this._shadowOffsetX = offsetX;
         this._shadowOffsetY = offsetY;
         this._shadowColor = shadowColor.clone();
         this._shadowColorDirty = true;
         for (var character in this._textSprites) {
            this._shadowSprites[character] = this._textSprites[character].clone();
         }
      }

      /**
       * Clears the current text shadow
       */
      public clearTextShadow() {
         this._textShadowOn = false;
         this._shadowOffsetX = 0;
         this._shadowOffsetY = 0;
         this._shadowColor = Color.Black.clone();
      }

      public update(engine: Engine, delta: number) {
         super.update(engine, delta);

         if (this.spriteFont && this._color !== this.color) {
            for (var character in this._textSprites) {
               this._textSprites[character].clearEffects();
               this._textSprites[character].addEffect(new Effects.Fill(this.color.clone()));
               this._color = this.color;
            }
         }

         if (this.spriteFont && this._textShadowOn && this._shadowColorDirty && this._shadowColor) {
            for (var character in this._shadowSprites) {
               this._shadowSprites[character].clearEffects();
               this._shadowSprites[character].addEffect(new Effects.Fill(this._shadowColor.clone()));
            }
            this._shadowColorDirty = false;
         }
      }

      public draw(ctx: CanvasRenderingContext2D, delta: number) {

         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.scale(this.scale.x, this.scale.y);
         ctx.rotate(this.rotation);

         if (this._textShadowOn) {
            ctx.save();
            ctx.translate(this._shadowOffsetX, this._shadowOffsetY);
            this._fontDraw(ctx, delta, this._shadowSprites);
            ctx.restore();
         }
         this._fontDraw(ctx, delta, this._textSprites);

         super.draw(ctx, delta);
         ctx.restore();
      }

      private _fontDraw(ctx: CanvasRenderingContext2D, delta: number, sprites: { [key: string]: Sprite; }) {

         if (this.spriteFont) {

            var currX = 0;

            for (var i = 0; i < this.text.length; i++) {
               var character = this.text[i];
               if (this.caseInsensitive) {
                  character = character.toLowerCase();
               }
               try {
                  var charSprite = sprites[character];
                  if (this.previousOpacity !== this.opacity) {
                     charSprite.clearEffects();
                     charSprite.addEffect(new ex.Effects.Opacity(this.opacity));
                  }
                  charSprite.draw(ctx, currX, 0);
                  currX += (charSprite.swidth + this.letterSpacing);
               } catch (e) {
                  Logger.getInstance().error("SpriteFont Error drawing char " + character);
               }
            }
            if (this.previousOpacity !== this.opacity) {
               this.previousOpacity = this.opacity;
            }
            //this.spriteFont.draw(ctx, 0, 0, this.text, color, this.letterSpacing);
         } else {
            var oldAlign = ctx.textAlign;
            var oldTextBaseline = ctx.textBaseline;

            ctx.textAlign = this._lookupTextAlign(this.textAlign);
            ctx.textBaseline = this._lookupBaseAlign(this.baseAlign);
            if (this.color) {
               this.color.a = this.opacity;
            }
            ctx.fillStyle = this.color.toString();
            ctx.font = this.font;
            if (this.maxWidth) {
               ctx.fillText(this.text, 0, 0, this.maxWidth);
            } else {
               ctx.fillText(this.text, 0, 0);
            }

            ctx.textAlign = oldAlign;
            ctx.textBaseline = oldTextBaseline;
         }
      }

      public debugDraw(ctx: CanvasRenderingContext2D) {
         super.debugDraw(ctx);
      }

   }
}