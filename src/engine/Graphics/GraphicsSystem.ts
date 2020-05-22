import { isActor } from '../Actor';
import { ExcaliburGraphicsContext } from './Context/ExcaliburGraphicsContext';
import { Scene } from '../Scene';
import { Entity } from '../Entity';
import { GraphicsComponent } from './GraphicsComponent';
import { TransformComponent, CoordPlane } from '../Transform';
import { Circle } from './Circle';
import { Color } from '../Drawing/Color';
// import { Rect } from './Rect';
// import { Color } from '../Drawing/Color';

export class GraphicsSystem {
  public readonly types = [GraphicsComponent.type, TransformComponent.type];
  constructor(public ctx: ExcaliburGraphicsContext, public scene: Scene) {}
  private _token = 0;
  private _debugCircle = new Circle({
    radius: 5,
    color: Color.Red
  });

  public update(entities: Entity<GraphicsComponent | TransformComponent>[], delta: number): void {
    this._clearScreen();
    this._token++;
    // sort actors in z order
    entities.sort((a, b) => a.components.transform.z - b.components.transform.z);
    let transform: TransformComponent;
    let graphics: GraphicsComponent;
    for (let entity of entities) {
      transform = entity.components.transform;
      graphics = entity.components.graphics;

      if (this._isOffscreen(entity)) continue;
      this._pushCameraTransform(transform);

      this.ctx.save();
      graphics.update(delta, this._token);
      this._applyEntityTransform(transform);
      const [x, y] = this._applyActorAnchor(entity);
      this.ctx.z = transform.z;
      this.ctx.opacity = graphics.opacity * ((entity as any).opacity ?? 1);
      graphics.draw(this.ctx, x, y);
      this.ctx.restore();

      // TODO better debug draw system
      if ((this.scene as any)._engine.isDebug) {
        if (isActor(entity)) {
          this._debugCircle.draw(
            this.ctx,
            entity.getWorldPos().x - this._debugCircle.radius,
            entity.getWorldPos().y - this._debugCircle.radius
          );
        }
      }

      this._popCameraTransform(transform);
    }
    this.ctx.flush();
  }

  private _clearScreen(): void {
    this.ctx.clear();
  }

  private _isOffscreen(entity: Entity) {
    if (isActor(entity)) {
      return entity.isOffScreen;
    }
    return false;
  }

  private _applyEntityTransform(transform: TransformComponent): void {
    this.ctx.translate(transform.pos.x, transform.pos.y);
    this.ctx.rotate(transform.rotation);
    this.ctx.scale(transform.scale.x, transform.scale.y);
  }

  private _applyActorAnchor(entity: Entity): [number, number] {
    if (isActor(entity)) {
      this.ctx.translate(-(entity.width * entity.anchor.x), -(entity.height * entity.anchor.y));

      // TODO this is odd
      const gfx = entity.graphics.localBounds;
      if (gfx) {
        // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
        const offsetX = (entity.width - gfx.width) * entity.anchor.x;
        const offsetY = (entity.height - gfx.height) * entity.anchor.y;
        return [offsetX, offsetY];
      }
    }
    return [0, 0];
  }

  private _pushCameraTransform(transform: TransformComponent) {
    // Establish camera offset per entity
    if (transform.coordPlane === CoordPlane.World) {
      this.ctx.save();
      if (this?.scene?.camera) {
        this.scene.camera.draw(this.ctx);
      }
    }
  }

  private _popCameraTransform(transform: TransformComponent) {
    if (transform.coordPlane === CoordPlane.World) {
      // Apply camera world offset
      this.ctx.restore();
    }
  }
}