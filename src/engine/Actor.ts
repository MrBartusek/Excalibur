import { BoundingBox } from './Collision/BoundingBox';
import { Texture } from './Resources/Texture';
import {
  InitializeEvent,
  KillEvent,
  PreUpdateEvent,
  PostUpdateEvent,
  PreDrawEvent,
  PostDrawEvent,
  PreDebugDrawEvent,
  PostDebugDrawEvent,
  PostCollisionEvent,
  PreCollisionEvent,
  CollisionStartEvent,
  CollisionEndEvent,
  PostKillEvent,
  PreKillEvent,
  GameEvent,
  ExitTriggerEvent,
  EnterTriggerEvent,
  EnterViewPortEvent,
  ExitViewPortEvent
} from './Events';
import { PointerEvent, WheelEvent, PointerDragEvent, PointerEventName } from './Input/Pointer';
import { Engine } from './Engine';
import { Color } from './Drawing/Color';
import { Sprite } from './Drawing/Sprite';
import { Trait } from './Interfaces/Trait';
import { Drawable } from './Drawing/Drawable';
import { CanInitialize, CanUpdate, CanDraw, CanBeKilled } from './Interfaces/LifecycleEvents';
import { Scene } from './Scene';
import { Logger } from './Util/Log';
import { ActionContext } from './Actions/ActionContext';
import { ActionQueue } from './Actions/Action';
import { Vector } from './Algebra';
import { CollisionShape } from './Collision/CollisionShape';
import { Body } from './Collision/Body';
import { Side } from './Collision/Side';
import { Eventable } from './Interfaces/Evented';
import { Actionable } from './Actions/Actionable';
import { Configurable } from './Configurable';
import * as Traits from './Traits/Index';
import * as Effects from './Drawing/SpriteEffects';
import * as Util from './Util/Util';
import * as Events from './Events';
import { PointerEvents } from './Interfaces/PointerEvents';
import { CollisionType } from './Collision/CollisionType';
import { obsolete } from './Util/Decorators';
import { Collider } from './Collision/Collider';
import { Shape } from './Collision/Shape';
import { Entity } from './EntityComponentSystem/Entity';
import { TransformComponent } from './EntityComponentSystem/TransformComponent';
import { DrawingComponent } from './EntityComponentSystem/DrawingComponent';
import { BuiltinComponentType } from './EntityComponentSystem/Types';
import { DebugComponent } from './EntityComponentSystem';

export function isActor(x: any): x is Actor {
  return x instanceof Actor;
}

/**
 * [[include:Constructors.md]]
 */
export interface ActorArgs extends Partial<ActorImpl> {
  width?: number;
  height?: number;
  pos?: Vector;
  vel?: Vector;
  acc?: Vector;
  rotation?: number;
  rx?: number;
  z?: number;
  color?: Color;
  visible?: boolean;
  body?: Body;
}

export interface ActorDefaults {
  anchor: Vector;
}

/**
 * @hidden
 */

export class ActorImpl extends Entity implements Actionable, Eventable, PointerEvents, CanInitialize, CanUpdate, CanDraw, CanBeKilled {
  // #region Properties

  /**
   * Indicates the next id to be set
   */
  public static defaults: ActorDefaults = {
    anchor: Vector.Half
  };

  /**
   * The physics body the is associated with this actor. The body is the container for all physical properties, like position, velocity,
   * acceleration, mass, inertia, etc.
   */
  public get body(): Body {
    return this._body;
  }

  public set body(body: Body) {
    this._body = body;
    this._body.entity = this;
  }

  private _body: Body;

  /**
   * Gets the collision geometry shape to use for collision possible options are [Circle|circles], [ConvexPolygon|polygons], and
   * [Edge|edges].
   * @obsolete Use Actor.body.collider.shape, collisionArea will be removed in v0.24.0
   */
  @obsolete({ message: 'Actor.collisionArea will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.shape' })
  public get collisionArea(): CollisionShape {
    return this.body.collider.shape;
  }

  /**
   * Gets the collision geometry shape to use for collision possible options are [Circle|circles], [ConvexPolygon|polygons], and
   * [Edge|edges].
   * @obsolete use Actor.body.collider.shape, collisionArea will be removed in v0.24.0
   */
  public set collisionArea(area: CollisionShape) {
    this.body.collider.shape = area;
  }

  /**
   * Gets the x position of the actor relative to it's parent (if any)
   * @obsolete ex.Actor.x will be removed in v0.24.0, use ex.Actor.pos.x
   */
  @obsolete({ message: 'ex.Actor.x will be removed in v0.24.0', alternateMethod: 'ex.Actor.pos.x, or ex.Actor.body.pos.x' })
  public get x(): number {
    return this.body.pos.x;
  }

  /**
   * Sets the x position of the actor relative to it's parent (if any)
   * @obsolete ex.Actor.x will be removed in v0.24.0, use ex.Actor.pos.x
   */
  public set x(theX: number) {
    this.body.pos.x = theX;
  }

  /**
   * Gets the y position of the actor relative to it's parent (if any)
   * @obsolete ex.Actor.y will be removed in v0.24.0, use ex.Actor.pos.y
   */
  @obsolete({ message: 'ex.Actor.y will be removed in v0.24.0', alternateMethod: 'ex.Actor.pos.y, or ex.Actor.body.pos.y' })
  public get y(): number {
    return this.body.pos.y;
  }

  /**
   * Sets the y position of the actor relative to it's parent (if any)
   * @obsolete ex.Actor.y will be removed in v0.24.0, use ex.Actor.pos.y
   */
  public set y(theY: number) {
    this.body.pos.y = theY;
  }

  /**
   * Gets the position vector of the actor in pixels
   */
  public get pos(): Vector {
    return this.body.pos;
  }

  /**
   * Sets the position vector of the actor in pixels
   */
  public set pos(thePos: Vector) {
    this.body.pos.setTo(thePos.x, thePos.y);
  }

  /**
   * Gets the position vector of the actor from the last frame
   */
  public get oldPos(): Vector {
    return this.body.oldPos;
  }

  /**
   * Sets the position vector of the actor in the last frame
   */
  public set oldPos(thePos: Vector) {
    this.body.oldPos.setTo(thePos.x, thePos.y);
  }

  /**
   * Gets the velocity vector of the actor in pixels/sec
   */
  public get vel(): Vector {
    return this.body.vel;
  }

  /**
   * Sets the velocity vector of the actor in pixels/sec
   */
  public set vel(theVel: Vector) {
    this.body.vel.setTo(theVel.x, theVel.y);
  }

  /**
   * Gets the velocity vector of the actor from the last frame
   */
  public get oldVel(): Vector {
    return this.body.oldVel;
  }

  /**
   * Sets the velocity vector of the actor from the last frame
   */
  public set oldVel(theVel: Vector) {
    this.body.oldVel.setTo(theVel.x, theVel.y);
  }

  /**
   * Gets the acceleration vector of the actor in pixels/second/second. An acceleration pointing down such as (0, 100) may be
   * useful to simulate a gravitational effect.
   */
  public get acc(): Vector {
    return this.body.acc;
  }

  /**
   * Sets the acceleration vector of teh actor in pixels/second/second
   */
  public set acc(theAcc: Vector) {
    this.body.acc.setTo(theAcc.x, theAcc.y);
  }

  /**
   * Sets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
   */
  public set oldAcc(theAcc: Vector) {
    this.body.oldAcc.setTo(theAcc.x, theAcc.y);
  }

  /**
   * Gets the acceleration of the actor from the last frame. This does not include the global acc [[Physics.acc]].
   */
  public get oldAcc(): Vector {
    return this.body.oldAcc;
  }

  /**
   * Gets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
   */
  public get rotation(): number {
    return this.body.rotation;
  }

  /**
   * Sets the rotation of the actor in radians. 1 radian = 180/PI Degrees.
   */
  public set rotation(theAngle: number) {
    this.body.rotation = theAngle;
  }

  /**
   * Gets the rotational velocity of the actor in radians/second
   */
  public get rx(): number {
    return this.body.rx;
  }

  /**
   * Sets the rotational velocity of the actor in radians/sec
   */
  public set rx(angularVelocity: number) {
    this.body.rx = angularVelocity;
  }

  /**
   * Gets the current torque applied to the actor. Torque can be thought of as rotational force
   * @obsolete ex.Actor.torque will be removed in v0.24.0, use ex.Actor.body.torque
   */
  @obsolete({ message: 'ex.Actor.torque will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.torque' })
  public get torque() {
    return this.body.torque;
  }

  /**
   * Sets the current torque applied to the actor. Torque can be thought of as rotational force
   * @obsolete ex.Actor.torque will be removed in v0.24.0, use ex.Actor.body.torque
   */
  public set torque(theTorque: number) {
    this.body.torque = theTorque;
  }

  /**
   * Get the current mass of the actor, mass can be thought of as the resistance to acceleration.
   * @obsolete ex.Actor.mass will be removed in v0.24.0, use ex.Actor.body.collider.mass
   */
  @obsolete({ message: 'ex.Actor.mass will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.mass' })
  public get mass() {
    return this.body.collider.mass;
  }

  /**
   * Sets the mass of the actor, mass can be thought of as the resistance to acceleration.
   * @obsolete ex.Actor.mass will be removed in v0.24.0, use ex.Actor.body.collider.mass
   */
  public set mass(theMass: number) {
    this.body.collider.mass = theMass;
  }

  /**
   * Gets the current moment of inertia, moi can be thought of as the resistance to rotation.
   * @obsolete ex.Actor.moi will be removed in v0.24.0, use ex.Actor.body.collider.inertia
   */
  @obsolete({ message: 'ex.Actor.moi will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.inertia' })
  public get moi() {
    return this.body.collider.inertia;
  }

  /**
   * Sets the current moment of inertia, moi can be thought of as the resistance to rotation.
   * @obsolete ex.Actor.moi will be removed in v0.24.0, use ex.Actor.body.collider.inertia
   */
  public set moi(theMoi: number) {
    this.body.collider.inertia = theMoi;
  }

  /**
   * Gets the coefficient of friction on this actor, this can be thought of as how sticky or slippery an object is.
   * @obsolete ex.Actor.friction will be removed in v0.24.0, use ex.Actor.body.collider.friction
   */
  @obsolete({ message: 'ex.Actor.friction will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.friction' })
  public get friction() {
    return this.body.collider.friction;
  }

  /**
   * Sets the coefficient of friction of this actor, this can ve thought of as how stick or slippery an object is.
   */
  public set friction(theFriction: number) {
    this.body.collider.friction = theFriction;
  }

  /**
   * Gets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
   * as bounciness.
   * @obsolete ex.Actor.restitution will be removed in v0.24.0, use ex.Actor.body.collider.restitution
   */
  @obsolete({ message: 'ex.Actor.restitution will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.bounciness' })
  public get restitution() {
    return this.body.collider.bounciness;
  }

  /**
   * Sets the coefficient of restitution of this actor, represents the amount of energy preserved after collision. Think of this
   * as bounciness.
   * @obsolete ex.Actor.restitution will be removed in v0.24.0, use ex.Actor.body.collider.restitution
   */
  public set restitution(theRestitution: number) {
    this.body.collider.bounciness = theRestitution;
  }

  /**
   * The anchor to apply all actor related transformations like rotation,
   * translation, and scaling. By default the anchor is in the center of
   * the actor. By default it is set to the center of the actor (.5, .5)
   *
   * An anchor of (.5, .5) will ensure that drawings are centered.
   *
   * Use `anchor.setTo` to set the anchor to a different point using
   * values between 0 and 1. For example, anchoring to the top-left would be
   * `Actor.anchor.setTo(0, 0)` and top-right would be `Actor.anchor.setTo(0, 1)`.
   */
  public get anchor() {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing && drawing.current) {
      return drawing.current.anchor;
    }
    if (drawing) {
      return drawing.noDrawingAnchor;
    }

    return Vector.Half;
  }

  public set anchor(anchor: Vector) {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing && drawing.current) {
      drawing.current.anchor = anchor;
    }
    if (drawing) {
      drawing.noDrawingAnchor = anchor;
    }
  }

  // public anchor: Vector;

  /**
   * Indicates whether the actor is physically in the viewport
   */
  public get isOffScreen(): boolean {
    return !!this.components[BuiltinComponentType.Offscreen];
  }

  /**
   * The visibility of an actor drawing
   */
  public get visible(): boolean {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      return drawing.visible;
    }
    return false;
  }

  /**
   * The visibility of an actor drawing
   */
  public set visible(visible: boolean) {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      drawing.visible = visible;
    }
  }

  /**
   * The opacity of an actor. Passing in a color in the [[constructor]] will use the
   * color's opacity.
   */
  public opacity: number = 1;
  public previousOpacity: number = 1;

  /**
   * Direct access to the actor's [[ActionQueue]]. Useful if you are building custom actions.
   */
  public actionQueue: ActionQueue;

  /**
   * [[ActionContext|Action context]] of the actor. Useful for scripting actor behavior.
   */
  public actions: ActionContext;

  /**
   * Convenience reference to the global logger
   */
  public logger: Logger = Logger.getInstance();

  /**
   * The scene that the actor is in
   */
  public scene: Scene = null;

  /**
   * The parent of this actor
   */
  public parent: Actor = null;

  /**
   * The children of this actor
   */
  public children: Actor[] = [];

  /**
   * Gets or sets the current collision type of this actor. By
   * default it is ([[CollisionType.PreventCollision]]).
   * @obsolete ex.Actor.collisionType will be removed in v0.24.0, use ex.Actor.body.collider.type
   */
  @obsolete({ message: 'ex.Actor.collisionType will be removed in v0.24.0', alternateMethod: 'ex.Actor.body.collider.type' })
  public get collisionType(): CollisionType {
    return this.body.collider.type;
  }

  /**
   * Gets or sets the current collision type of this actor. By
   * default it is ([[CollisionType.PreventCollision]]).
   *  @obsolete ex.Actor.collisionType will be removed in v0.24.0, use ex.Actor.body.collider.type
   */
  public set collisionType(type: CollisionType) {
    this.body.collider.type = type;
  }

  /**
   * @obsolete Legacy collision groups will be removed in v0.24.0, use [[Actor.body.collider.collisionGroup]]
   */
  public collisionGroups: string[] = [];

  private _collisionHandlers: { [key: string]: { (actor: Actor): void }[] } = {};
  private _isInitialized: boolean = false;
  public frames: { [key: string]: Drawable } = {};

  //private _effectsDirty: boolean = false;

  /**
   * Access to the current drawing for the actor, this can be
   * an [[Animation]], [[Sprite]], or [[Polygon]].
   * Set drawings with [[setDrawing]].
   */
  public currentDrawing: Drawable = null;

  /**
   * Modify the current actor update pipeline.
   */
  public traits: Trait[] = [];

  /**
   * Sets the color of the actor. A rectangle of this color will be
   * drawn if no [[IDrawable]] is specified as the actors drawing.
   *
   * The default is `null` which prevents a rectangle from being drawn.
   */
  public get color(): Color {
    return this._color;
  }
  public set color(v: Color) {
    this._color = v.clone();
  }
  private _color: Color;

  /**
   * Whether or not to enable the [[CapturePointer]] trait that propagates
   * pointer events to this actor
   */
  public enableCapturePointer: boolean = false;

  /**
   * Configuration for [[CapturePointer]] trait
   */
  public capturePointer: Traits.CapturePointerConfig = {
    captureMoveEvents: false,
    captureDragEvents: false
  };

  private _isKilled: boolean = false;
  private _opacityFx = new Effects.Opacity(this.opacity);

  // #endregion

  /**
   * @param x       The starting x coordinate of the actor
   * @param y       The starting y coordinate of the actor
   * @param width   The starting width of the actor
   * @param height  The starting height of the actor
   * @param color   The starting color of the actor. Leave null to draw a transparent actor. The opacity of the color will be used as the
   * initial [[opacity]].
   */
  constructor(xOrConfig?: number | ActorArgs, y?: number, width?: number, height?: number, color?: Color) {
    super();

    // initialize default options
    this._initDefaults();

    // Build default components
    this.addComponent(new TransformComponent());
    this.addComponent(new DrawingComponent());

    let shouldInitializeBody = true;
    if (xOrConfig && typeof xOrConfig === 'object') {
      const config = xOrConfig;
      xOrConfig = config.pos ? config.pos.x : config.x;
      y = config.pos ? config.pos.y : config.y;
      width = config.width;
      height = config.height;

      if (config.body) {
        shouldInitializeBody = false;
        this.body = config.body;
        this.body.transform = this.components[BuiltinComponentType.Transform] as TransformComponent;
      }

      if (config.anchor) {
        this.anchor = config.anchor;
      }
    }

    // Body and collider bounds are still determined by actor width/height
    this.width = width || 0;
    this.height = height || 0;

    // Initialize default collider to be a box
    if (shouldInitializeBody) {
      this.body = new Body({
        transform: this.components[BuiltinComponentType.Transform] as TransformComponent,
        collider: new Collider({
          type: CollisionType.Passive,
          shape: Shape.Box(this.width, this.height, this.anchor)
        })
      });
    }

    // Position uses body to store values must be initialized after body
    this.pos.x = <number>xOrConfig || 0;
    this.pos.y = y || 0;

    if (color) {
      this.color = color;
      // set default opacity of an actor to the color
      this.opacity = color.a;
    }

    // Build default pipeline
    this.traits.push(new Traits.TileMapCollisionDetection());
    // this.traits.push(new Traits.OffscreenCulling());
    this.traits.push(new Traits.CapturePointer());

    // Build the action queue
    this.actionQueue = new ActionQueue(this);
    this.actions = new ActionContext(this);
  }

  /**
   * `onInitialize` is called before the first update of the actor. This method is meant to be
   * overridden. This is where initialization of child actors should take place.
   *
   * Synonymous with the event handler `.on('initialize', (evt) => {...})`
   */
  public onInitialize(_engine: Engine): void {
    // Override me
  }

  /**
   * Gets whether the actor is Initialized
   */
  public get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Initializes this actor and all it's child actors, meant to be called by the Scene before first update not by users of Excalibur.
   *
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * @internal
   */
  public _initialize(engine: Engine) {
    if (!this.isInitialized) {
      this.onInitialize(engine);
      super.emit('initialize', new InitializeEvent(engine, this));
      this._isInitialized = true;
    }
    for (const child of this.children) {
      child._initialize(engine);
    }
  }

  private _initDefaults() {
    this.anchor = Actor.defaults.anchor.clone();
  }

  // #region Events

  private _capturePointerEvents: PointerEventName[] = [
    'pointerup',
    'pointerdown',
    'pointermove',
    'pointerenter',
    'pointerleave',
    'pointerdragstart',
    'pointerdragend',
    'pointerdragmove',
    'pointerdragenter',
    'pointerdragleave'
  ];

  private _captureMoveEvents: PointerEventName[] = [
    'pointermove',
    'pointerenter',
    'pointerleave',
    'pointerdragmove',
    'pointerdragenter',
    'pointerdragleave'
  ];

  private _captureDragEvents: PointerEventName[] = [
    'pointerdragstart',
    'pointerdragend',
    'pointerdragmove',
    'pointerdragenter',
    'pointerdragleave'
  ];

  private _checkForPointerOptIn(eventName: string) {
    if (eventName) {
      const normalized = <PointerEventName>eventName.toLowerCase();

      if (this._capturePointerEvents.indexOf(normalized) !== -1) {
        this.enableCapturePointer = true;

        if (this._captureMoveEvents.indexOf(normalized) !== -1) {
          this.capturePointer.captureMoveEvents = true;
        }

        if (this._captureDragEvents.indexOf(normalized) !== -1) {
          this.capturePointer.captureDragEvents = true;
        }
      }
    }
  }

  public on(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
  public on(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
   *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touched a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public on(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
   * This event will not fire again until another collision and separation.
   *
   * Use cases for the **collisionend** event might be to detect when an actor has left a surface
   * (like jumping) or has left an area.
   */
  public on(eventName: Events.collisionend, handler: (event: CollisionEndEvent) => void): void;
  /**
   * The **precollision** event is fired **every frame** where a collision pair is found and two
   * bodies are intersecting.
   *
   * This event is useful for building in custom collision resolution logic in Passive-Passive or
   * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
   * richochet of the ball depending on which side of the paddle you hit.
   */
  public on(eventName: Events.precollision, handler: (event: PreCollisionEvent) => void): void;
  /**
   * The **postcollision** event is fired for **every frame** where collision resolution was performed.
   * Collision resolution is when two bodies influence each other and cause a response like bouncing
   * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
   * type collision pairs.
   *
   * Post collision would be useful if you need to know that collision resolution is happening or need to
   * tweak the default resolution.
   */
  public on(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
  public on(eventName: Events.kill, handler: (event: KillEvent) => void): void;
  public on(eventName: Events.prekill, handler: (event: PreKillEvent) => void): void;
  public on(eventName: Events.postkill, handler: (event: PostKillEvent) => void): void;
  public on(eventName: Events.initialize, handler: (event: InitializeEvent) => void): void;
  public on(eventName: Events.preupdate, handler: (event: PreUpdateEvent) => void): void;
  public on(eventName: Events.postupdate, handler: (event: PostUpdateEvent) => void): void;
  public on(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public on(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public on(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
  public on(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
  public on(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  public on(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  public on(eventName: Events.pointerdragstart, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragend, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragenter, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragleave, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.pointerdragmove, handler: (event: PointerDragEvent) => void): void;
  public on(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
  public on(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
  public on(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
  public on(eventName: string, handler: (event: any) => void): void {
    this._checkForPointerOptIn(eventName);
    super.on(eventName, handler);
  }

  public once(eventName: Events.exittrigger, handler: (event: ExitTriggerEvent) => void): void;
  public once(eventName: Events.entertrigger, handler: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
   *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public once(eventName: Events.collisionstart, handler: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
   * This event will not fire again until another collision and separation.
   *
   * Use cases for the **collisionend** event might be to detect when an actor has left a surface
   * (like jumping) or has left an area.
   */
  public once(eventName: Events.collisionend, handler: (event: CollisionEndEvent) => void): void;
  /**
   * The **precollision** event is fired **every frame** where a collision pair is found and two
   * bodies are intersecting.
   *
   * This event is useful for building in custom collision resolution logic in Passive-Passive or
   * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
   * richochet of the ball depending on which side of the paddle you hit.
   */
  public once(eventName: Events.precollision, handler: (event: PreCollisionEvent) => void): void;
  /**
   * The **postcollision** event is fired for **every frame** where collision resolution was performed.
   * Collision resolution is when two bodies influence each other and cause a response like bouncing
   * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
   * type collision pairs.
   *
   * Post collision would be useful if you need to know that collision resolution is happening or need to
   * tweak the default resolution.
   */
  public once(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
  public once(eventName: Events.kill, handler: (event: KillEvent) => void): void;
  public once(eventName: Events.postkill, handler: (event: PostKillEvent) => void): void;
  public once(eventName: Events.prekill, handler: (event: PreKillEvent) => void): void;
  public once(eventName: Events.initialize, handler: (event: InitializeEvent) => void): void;
  public once(eventName: Events.preupdate, handler: (event: PreUpdateEvent) => void): void;
  public once(eventName: Events.postupdate, handler: (event: PostUpdateEvent) => void): void;
  public once(eventName: Events.predraw, handler: (event: PreDrawEvent) => void): void;
  public once(eventName: Events.postdraw, handler: (event: PostDrawEvent) => void): void;
  public once(eventName: Events.predebugdraw, handler: (event: PreDebugDrawEvent) => void): void;
  public once(eventName: Events.postdebugdraw, handler: (event: PostDebugDrawEvent) => void): void;
  public once(eventName: Events.pointerup, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerdown, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerenter, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerleave, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointermove, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointercancel, handler: (event: PointerEvent) => void): void;
  public once(eventName: Events.pointerwheel, handler: (event: WheelEvent) => void): void;
  public once(eventName: Events.pointerdragstart, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragend, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragenter, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragleave, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.pointerdragmove, handler: (event: PointerDragEvent) => void): void;
  public once(eventName: Events.enterviewport, handler: (event: EnterViewPortEvent) => void): void;
  public once(eventName: Events.exitviewport, handler: (event: ExitViewPortEvent) => void): void;
  public once(eventName: string, handler: (event: GameEvent<Actor>) => void): void;
  public once(eventName: string, handler: (event: any) => void): void {
    this._checkForPointerOptIn(eventName);
    super.once(eventName, handler);
  }

  public off(eventName: Events.exittrigger, handler?: (event: ExitTriggerEvent) => void): void;
  public off(eventName: Events.entertrigger, handler?: (event: EnterTriggerEvent) => void): void;
  /**
   * The **collisionstart** event is fired when a [[Body|physics body]], usually attached to an actor,
   *  first starts colliding with another [[Body|body]], and will not fire again while in contact until
   *  the the pair separates and collides again.
   * Use cases for the **collisionstart** event may be detecting when an actor has touch a surface
   * (like landing) or if a item has been touched and needs to be picked up.
   */
  public off(eventName: Events.collisionstart, handler?: (event: CollisionStartEvent) => void): void;
  /**
   * The **collisionend** event is fired when two [[Body|physics bodies]] are no longer in contact.
   * This event will not fire again until another collision and separation.
   *
   * Use cases for the **collisionend** event might be to detect when an actor has left a surface
   * (like jumping) or has left an area.
   */
  public off(eventName: Events.collisionend, handler?: (event: CollisionEndEvent) => void): void;
  /**
   * The **precollision** event is fired **every frame** where a collision pair is found and two
   * bodies are intersecting.
   *
   * This event is useful for building in custom collision resolution logic in Passive-Passive or
   * Active-Passive scenarios. For example in a breakout game you may want to tweak the angle of
   * richochet of the ball depending on which side of the paddle you hit.
   */
  public off(eventName: Events.precollision, handler?: (event: PreCollisionEvent) => void): void;
  /**
   * The **postcollision** event is fired for **every frame** where collision resolution was performed.
   * Collision resolution is when two bodies influence each other and cause a response like bouncing
   * off one another. It is only possible to have *postcollision* event in Active-Active and Active-Fixed
   * type collision pairs.
   *
   * Post collision would be useful if you need to know that collision resolution is happening or need to
   * tweak the default resolution.
   */
  public off(eventName: Events.postcollision, handler: (event: PostCollisionEvent) => void): void;
  public off(eventName: Events.pointerup, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerdown, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerenter, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerleave, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointermove, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointercancel, handler?: (event: PointerEvent) => void): void;
  public off(eventName: Events.pointerwheel, handler?: (event: WheelEvent) => void): void;
  public off(eventName: Events.pointerdragstart, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragend, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragenter, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragleave, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.pointerdragmove, handler?: (event: PointerDragEvent) => void): void;
  public off(eventName: Events.prekill, handler?: (event: PreKillEvent) => void): void;
  public off(eventName: Events.postkill, handler?: (event: PostKillEvent) => void): void;
  public off(eventName: Events.initialize, handler?: (event: Events.InitializeEvent) => void): void;
  public off(eventName: Events.postupdate, handler?: (event: Events.PostUpdateEvent) => void): void;
  public off(eventName: Events.preupdate, handler?: (event: Events.PreUpdateEvent) => void): void;
  public off(eventName: Events.postdraw, handler?: (event: Events.PostDrawEvent) => void): void;
  public off(eventName: Events.predraw, handler?: (event: Events.PreDrawEvent) => void): void;
  public off(eventName: Events.enterviewport, handler?: (event: EnterViewPortEvent) => void): void;
  public off(eventName: Events.exitviewport, handler?: (event: ExitViewPortEvent) => void): void;
  public off(eventName: string, handler?: (event: GameEvent<Actor>) => void): void;
  public off(eventName: string, handler?: (event: any) => void): void {
    super.off(eventName, handler);
  }

  // #endregion

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _prekill handler for [[onPreKill]] lifecycle event
   * @internal
   */
  public _prekill(_scene: Scene) {
    super.emit('prekill', new PreKillEvent(this));
    this.onPreKill(_scene);
  }

  /**
   * Safe to override onPreKill lifecycle event handler. Synonymous with `.on('prekill', (evt) =>{...})`
   *
   * `onPreKill` is called directly before an actor is killed and removed from its current [[Scene]].
   */
  public onPreKill(_scene: Scene) {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _prekill handler for [[onPostKill]] lifecycle event
   * @internal
   */
  public _postkill(_scene: Scene) {
    super.emit('postkill', new PostKillEvent(this));
    this.onPostKill(_scene);
  }

  /**
   * Safe to override onPostKill lifecycle event handler. Synonymous with `.on('postkill', (evt) => {...})`
   *
   * `onPostKill` is called directly after an actor is killed and remove from its current [[Scene]].
   */
  public onPostKill(_scene: Scene) {
    // Override me
  }

  /**
   * If the current actor is a member of the scene, this will remove
   * it from the scene graph. It will no longer be drawn or updated.
   */
  public kill() {
    if (this.scene) {
      this._prekill(this.scene);
      this.emit('kill', new KillEvent(this));
      this._isKilled = true;
      this.scene.remove(this);
      this._postkill(this.scene);
    } else {
      this.logger.warn('Cannot kill actor, it was never added to the Scene');
    }
  }

  /**
   * If the current actor is killed, it will now not be killed.
   */
  public unkill() {
    this._isKilled = false;
  }

  /**
   * Indicates wether the actor has been killed.
   */
  public isKilled(): boolean {
    return this._isKilled;
  }

  /**
   * Adds a child actor to this actor. All movement of the child actor will be
   * relative to the parent actor. Meaning if the parent moves the child will
   * move with it.
   * @param actor The child actor to add
   */
  @obsolete()
  public add(actor: Actor) {
    actor.body.collider.type = CollisionType.PreventCollision;
    if (Util.addItemToArray(actor, this.children)) {
      actor.parent = this;
    }
  }
  /**
   * Removes a child actor from this actor.
   * @param actor The child actor to remove
   */
  @obsolete()
  public remove(actor: Actor) {
    if (Util.removeItemFromArray(actor, this.children)) {
      actor.parent = null;
    }
  }

  public get transform(): TransformComponent {
    const transform = this.components[BuiltinComponentType.Transform] as TransformComponent;
    return transform;
  }

  public get drawing(): DrawingComponent {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      return drawing;
    }
    return null;
  }

  public get debug(): DebugComponent {
    const debug = this.components[BuiltinComponentType.Debug] as DebugComponent;
    if (debug) {
      return debug;
    }
    return null;
  }

  /**
   * Sets the current drawing of the actor to the drawing corresponding to
   * the key.
   * @param key The key of the drawing
   */
  public setDrawing(key: string): void;
  /**
   * Sets the current drawing of the actor to the drawing corresponding to
   * an `enum` key (e.g. `Animations.Left`)
   * @param key The `enum` key of the drawing
   */
  public setDrawing(key: number): void;
  @obsolete()
  public setDrawing(key: any): void {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      drawing.show(key);
    }
  }

  /**
   * Adds a whole texture as the "default" drawing. Set a drawing using [[setDrawing]].
   */
  public addDrawing(texture: Texture): void;
  /**
   * Adds a whole sprite as the "default" drawing. Set a drawing using [[setDrawing]].
   */
  public addDrawing(sprite: Sprite): void;
  /**
   * Adds a drawing to the list of available drawings for an actor. Set a drawing using [[setDrawing]].
   * @param key     The key to associate with a drawing for this actor
   * @param drawing This can be an [[Animation]], [[Sprite]], or [[Polygon]].
   */
  public addDrawing(key: any, drawing: Drawable): void;
  @obsolete()
  public addDrawing(): void {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      if (arguments.length === 2) {
        drawing.add(<string>arguments[0], arguments[1]);
      } else {
        if (arguments[0] instanceof Sprite) {
          drawing.add('default', arguments[0]);
          drawing.show('default');
        }
        if (arguments[0] instanceof Texture) {
          drawing.add('default', arguments[0].asSprite());
          drawing.show('default');
        }
      }
    }
  }

  public get z(): number {
    const transform = this.components[BuiltinComponentType.Transform] as TransformComponent;
    if (transform) {
      return transform.z;
    }
    return 0;
  }

  public set z(newZ: number) {
    const transform = this.components[BuiltinComponentType.Transform] as TransformComponent;
    if (transform) {
      transform.z = newZ;
    }
  }

  /**
   * Gets the z-index of an actor. The z-index determines the relative order an actor is drawn in.
   * Actors with a higher z-index are drawn on top of actors with a lower z-index
   */
  @obsolete()
  public getZIndex(): number {
    return this.z;
  }

  /**
   * Sets the z-index of an actor and updates it in the drawing list for the scene.
   * The z-index determines the relative order an actor is drawn in.
   * Actors with a higher z-index are drawn on top of actors with a lower z-index
   * @param newIndex new z-index to assign
   */
  @obsolete()
  public setZIndex(newIndex: number) {
    this.z = newIndex;

    this.scene.cleanupDrawTree(this);
    // this._zIndex = newIndex;
    this.scene.updateDrawTree(this);
  }

  /**
   * Adds an actor to a collision group. Actors with no named collision groups are
   * considered to be in every collision group.
   *
   * Once in a collision group(s) actors will only collide with other actors in
   * that group.
   *
   * @param name The name of the collision group
   * @obsolete Use [[Actor.body.collider.collisionGroup]], legacy collisionGroups will be removed in v0.24.0
   */
  @obsolete({ message: 'Legacy collision groups will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.collisionGroup' })
  public addCollisionGroup(name: string) {
    this.collisionGroups.push(name);
  }
  /**
   * Removes an actor from a collision group.
   * @param name The name of the collision group
   * @obsolete Use [[Actor.body.collider.collisionGroup]], legacy collisionGroups will be removed in v0.24.0
   */
  @obsolete({ message: 'Legacy collision groups will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.collisionGroup' })
  public removeCollisionGroup(name: string) {
    const index = this.collisionGroups.indexOf(name);
    if (index !== -1) {
      this.collisionGroups.splice(index, 1);
    }
  }

  /**
   * Get the center point of an actor
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.center' })
  public getCenter(): Vector {
    return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
  }

  /**
   * Get the center point of an actor
   */
  public get center(): Vector {
    return new Vector(this.pos.x + this.width / 2 - this.anchor.x * this.width, this.pos.y + this.height / 2 - this.anchor.y * this.height);
  }

  public get width() {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      return drawing.noDrawingWidth;
    }
    return 0;
    // return this._width * this.getGlobalScale().x;
  }

  public set width(width: number) {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      drawing.noDrawingWidth = width;
    }

    // TODO should we event mess with collider shape here? this could be wrong
    if (this.body && this.body.collider) {
      this.body.collider.shape = Shape.Box(this.width, this.height, this.anchor);
      this.body.markCollisionShapeDirty();
    }
  }

  public get height() {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      return drawing.noDrawingHeight;
    }
    return 0;
    // return this._height * this.getGlobalScale().y;
  }

  public set height(height: number) {
    const drawing = this.components[BuiltinComponentType.Drawing] as DrawingComponent;
    if (drawing) {
      drawing.noDrawingHeight = height;
    }

    // TODO should we event mess with collider shape here? this could be wrong
    if (this.body && this.body.collider) {
      this.body.collider.shape = Shape.Box(this.width, this.height, this.anchor);
      this.body.markCollisionShapeDirty();
    }
  }

  /**
   * Gets the left edge of the actor
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.left' })
  public getLeft() {
    return this.getBounds().left;
  }

  /**
   * Gets the right edge of the actor
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.right' })
  public getRight() {
    return this.getBounds().right;
  }

  /**
   * Gets the top edge of the actor
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.top' })
  public getTop() {
    return this.getBounds().top;
  }

  /**
   * Gets the bottom edge of the actor
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.bottom' })
  public getBottom() {
    return this.getBounds().bottom;
  }

  /**
   * Gets this actor's rotation taking into account any parent relationships
   *
   * @returns Rotation angle in radians
   */
  public getWorldRotation(): number {
    if (!this.parent) {
      return this.rotation;
    }

    return this.rotation + this.parent.getWorldRotation();
  }

  /**
   * Gets an actor's world position taking into account parent relationships, scaling, rotation, and translation
   *
   * @returns Position in world coordinates
   */
  public getWorldPos(): Vector {
    if (!this.parent) {
      return this.pos.clone();
    }

    // collect parents
    const parents: Actor[] = [];
    let root: Actor = this;

    parents.push(this);

    // find parents
    while (root.parent) {
      root = root.parent;
      parents.push(root);
    }

    // calculate position
    const x = parents.reduceRight((px, p) => {
      if (p.parent) {
        return px + p.pos.x;
      }
      return px + p.pos.x;
    }, 0);

    const y = parents.reduceRight((py, p) => {
      if (p.parent) {
        return py + p.pos.y;
      }
      return py + p.pos.y;
    }, 0);

    // rotate around root anchor
    const ra = root.getWorldPos();
    const r = this.getWorldRotation();

    return new Vector(x, y).rotate(r, ra);
  }

  // #region Collision

  /**
   * Returns the actor's [[BoundingBox]] calculated for this instant in world space.
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds' })
  public getBounds(rotated: boolean = true): BoundingBox {
    // todo cache bounding box
    const anchor = this._getCalculatedAnchor();
    const pos = this.getWorldPos();

    const bb = new BoundingBox(pos.x - anchor.x, pos.y - anchor.y, pos.x + this.width - anchor.x, pos.y + this.height - anchor.y);

    return rotated ? bb.rotate(this.rotation, pos) : bb;
  }

  /**
   * Returns the actor's [[BoundingBox]] relative to the actor's position.
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.localBounds' })
  public getRelativeBounds(rotated: boolean = true): BoundingBox {
    // todo cache bounding box
    const anchor = this._getCalculatedAnchor();
    const bb = new BoundingBox(-anchor.x, -anchor.y, this.width - anchor.x, this.height - anchor.y);

    return rotated ? bb.rotate(this.rotation) : bb;
  }

  /**
   * Returns the actors unrotated geometry in world coordinates
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.bounds.getPoints()' })
  public getGeometry(): Vector[] {
    return this.getBounds(false).getPoints();
  }

  /**
   * Return the actor's unrotated geometry relative to the actor's position
   */
  @obsolete({ message: 'Will be removed in v0.24.0', alternateMethod: 'Actor.body.collider.localBounds.getPoints()' })
  public getRelativeGeometry(): Vector[] {
    return this.getRelativeBounds(false).getPoints();
  }

  /**
   * Tests whether the x/y specified are contained in the actor
   * @param x  X coordinate to test (in world coordinates)
   * @param y  Y coordinate to test (in world coordinates)
   * @param recurse checks whether the x/y are contained in any child actors (if they exist).
   */
  public contains(x: number, y: number, recurse: boolean = false): boolean {
    // These shenanigans are to handle child actor containment,
    // the only time getWorldPos and pos are different is a child actor
    const childShift = this.getWorldPos().sub(this.pos);
    const containment = this.body.collider.bounds.translate(childShift).contains(new Vector(x, y));

    if (recurse) {
      return (
        containment ||
        this.children.some((child: Actor) => {
          return child.contains(x, y, true);
        })
      );
    }

    return containment;
  }

  /**
   * Returns the side of the collision based on the intersection
   * @param intersect The displacement vector returned by a collision
   * @obsolete Actor.getSideFromIntersect will be removed in v0.24.0, use [[BoundingBox.sideFromIntersection]]
   */
  @obsolete({ message: 'Actor.getSideFromIntersect will be removed in v0.24.0', alternateMethod: 'BoundingBox.sideFromIntersection' })
  public getSideFromIntersect(intersect: Vector) {
    if (intersect) {
      if (Math.abs(intersect.x) > Math.abs(intersect.y)) {
        if (intersect.x < 0) {
          return Side.Right;
        }
        return Side.Left;
      } else {
        if (intersect.y < 0) {
          return Side.Bottom;
        }
        return Side.Top;
      }
    }
    return Side.None;
  }
  /**
   * Test whether the actor has collided with another actor, returns the side of the current actor that collided.
   * @param actor The other actor to test
   * @obsolete Actor.collidesWithSide will be removed in v0.24.0, use [[Actor.bounds.intersectWithSide]]
   */
  @obsolete({ message: 'Actor.collidesWithSide will be removed in v0.24.0', alternateMethod: 'Actor.bounds.intersectWithSide' })
  public collidesWithSide(actor: Actor): Side {
    const separationVector = this.collides(actor);
    if (!separationVector) {
      return Side.None;
    }
    if (Math.abs(separationVector.x) > Math.abs(separationVector.y)) {
      if (this.pos.x < actor.pos.x) {
        return Side.Right;
      } else {
        return Side.Left;
      }
    } else {
      if (this.pos.y < actor.pos.y) {
        return Side.Bottom;
      } else {
        return Side.Top;
      }
    }
  }
  /**
   * Test whether the actor has collided with another actor, returns the intersection vector on collision. Returns
   * `null` when there is no collision;
   * @param actor The other actor to test
   * @obsolete Actor.collides will be removed in v0.24.0, use [[Actor.bounds.interesect]] to get boudings intersection,
   * or [[Actor.body.collider.collide]] to collide with another collider
   */
  @obsolete({ message: 'Actor.collides will be removed  in v0.24.0', alternateMethod: 'Actor.bounds.intersect or Actor.' })
  public collides(actor: Actor): Vector {
    const bounds = this.body.collider.bounds;
    const otherBounds = actor.body.collider.bounds;
    const intersect = bounds.intersect(otherBounds);
    return intersect;
  }

  /**
   * Register a handler to fire when this actor collides with another in a specified group
   * @param group The group name to listen for
   * @param func The callback to fire on collision with another actor from the group. The callback is passed the other actor.
   */
  @obsolete({ message: 'Actor.onCollidesWIth will be removed  in v0.24.0', alternateMethod: 'Actor.collider.canCollide' })
  public onCollidesWith(group: string, func: (actor: Actor) => void) {
    if (!this._collisionHandlers[group]) {
      this._collisionHandlers[group] = [];
    }
    this._collisionHandlers[group].push(func);
  }
  @obsolete({ message: 'Actor.getCollisionHandlers will be removed  in v0.24.0' })
  public getCollisionHandlers(): { [key: string]: { (actor: Actor): void }[] } {
    return this._collisionHandlers;
  }
  /**
   * Removes all collision handlers for this group on this actor
   * @param group Group to remove all handlers for on this actor.
   */
  @obsolete({ message: 'Actor.getCollisionHandlers will be removed  in v0.24.0' })
  public removeCollidesWith(group: string) {
    this._collisionHandlers[group] = [];
  }
  /**
   * Returns true if the two actor.body.collider.shape's surfaces are less than or equal to the distance specified from each other
   * @param actor     Actor to test
   * @param distance  Distance in pixels to test
   */
  public within(actor: Actor, distance: number): boolean {
    return this.body.collider.shape.getClosestLineBetween(actor.body.collider.shape).getLength() <= distance;
  }

  // #endregion

  private _getCalculatedAnchor(): Vector {
    return new Vector(this.width * this.anchor.x, this.height * this.anchor.y);
  }

  protected _reapplyEffects(drawing: Drawable) {
    drawing.removeEffect(this._opacityFx);
    drawing.addEffect(this._opacityFx);
  }

  // #region Update

  /**
   * Called by the Engine, updates the state of the actor
   * @param engine The reference to the current game engine
   * @param delta  The time elapsed since the last update in milliseconds
   */
  public update(engine: Engine, delta: number) {
    this._initialize(engine);
    this._preupdate(engine, delta);

    // Update action queue
    this.actionQueue.update(delta);

    // Update color only opacity
    if (this.color) {
      this.color.a = this.opacity;
    }

    // calculate changing opacity
    if (this.previousOpacity !== this.opacity) {
      this.previousOpacity = this.opacity;
      this._opacityFx.opacity = this.opacity;
      // this._effectsDirty = true;
    }

    // capture old transform
    this.body.captureOldTransform();

    // Run Euler integration
    this.body.integrate(delta);

    // Update actor pipeline (movement, collision detection, event propagation, offscreen culling)
    for (const trait of this.traits) {
      trait.update(this, engine, delta);
    }

    // Update child actors
    for (let i = 0; i < this.children.length; i++) {
      this.children[i].update(engine, delta);
    }

    this._postupdate(engine, delta);
  }

  /**
   * Safe to override onPreUpdate lifecycle event handler. Synonymous with `.on('preupdate', (evt) =>{...})`
   *
   * `onPreUpdate` is called directly before an actor is updated.
   */
  public onPreUpdate(_engine: Engine, _delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostUpdate lifecycle event handler. Synonymous with `.on('postupdate', (evt) =>{...})`
   *
   * `onPostUpdate` is called directly after an actor is updated.
   */
  public onPostUpdate(_engine: Engine, _delta: number): void {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPreUpdate]] lifecycle event
   * @internal
   */
  public _preupdate(engine: Engine, delta: number): void {
    this.emit('preupdate', new PreUpdateEvent(engine, delta, this));
    this.onPreUpdate(engine, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _preupdate handler for [[onPostUpdate]] lifecycle event
   * @internal
   */
  public _postupdate(engine: Engine, delta: number): void {
    this.emit('postupdate', new PreUpdateEvent(engine, delta, this));
    this.onPostUpdate(engine, delta);
  }

  // endregion

  // #region Drawing
  /**
   * Called by the Engine, draws the actor to the screen
   * @param ctx   The rendering context
   * @param delta The time since the last draw in milliseconds
   */
  public draw(_ctx: CanvasRenderingContext2D, _delta: number) {
    /*ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale.x, this.scale.y);

    // translate canvas by anchor offset
    ctx.save();
    ctx.translate(-(this._width * this.anchor.x), -(this._height * this.anchor.y));

    this._predraw(ctx, delta);

    if (this.currentDrawing) {
      const drawing = this.currentDrawing;
      // See https://github.com/excaliburjs/Excalibur/pull/619 for discussion on this formula
      const offsetX = (this._width - drawing.width * drawing.scale.x) * this.anchor.x;
      const offsetY = (this._height - drawing.height * drawing.scale.y) * this.anchor.y;

      if (this._effectsDirty) {
        this._reapplyEffects(this.currentDrawing);
        this._effectsDirty = false;
      }

      this.currentDrawing.draw(ctx, offsetX, offsetY);
    } else {
      if (this.color && this.body && this.body.collider && this.body.collider.shape) {
        this.body.collider.shape.draw(ctx, this.color, new Vector(this.width * this.anchor.x, this.height * this.anchor.y));
      }
    }
    ctx.restore();

    // Draw child actors
    for (let i = 0; i < this.children.length; i++) {
      if (this.children[i].visible) {
        this.children[i].draw(ctx, delta);
      }
    }

    this._postdraw(ctx, delta);
    ctx.restore();*/
  }

  /**
   * Safe to override onPreDraw lifecycle event handler. Synonymous with `.on('predraw', (evt) =>{...})`
   *
   * `onPreDraw` is called directly before an actor is drawn, but after local transforms are made.
   */
  public onPreDraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    // Override me
  }

  /**
   * Safe to override onPostDraw lifecycle event handler. Synonymous with `.on('postdraw', (evt) =>{...})`
   *
   * `onPostDraw` is called directly after an actor is drawn, and before local transforms are removed.
   */
  public onPostDraw(_ctx: CanvasRenderingContext2D, _delta: number): void {
    // Override me
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _predraw handler for [[onPreDraw]] lifecycle event
   * @internal
   */
  public _predraw(ctx: CanvasRenderingContext2D, delta: number): void {
    this.emit('predraw', new PreDrawEvent(ctx, delta, this));
    this.onPreDraw(ctx, delta);
  }

  /**
   * It is not recommended that internal excalibur methods be overriden, do so at your own risk.
   *
   * Internal _postdraw handler for [[onPostDraw]] lifecycle event
   * @internal
   */
  public _postdraw(ctx: CanvasRenderingContext2D, delta: number): void {
    this.emit('postdraw', new PreDrawEvent(ctx, delta, this));
    this.onPostDraw(ctx, delta);
  }

  /**
   * Called by the Engine, draws the actors debugging to the screen
   * @param ctx The rendering context
   */
  /* istanbul ignore next */
  public debugDraw(_ctx: CanvasRenderingContext2D) {
    // this.emit('predebugdraw', new PreDebugDrawEvent(ctx, this));
    // this.body.collider.debugDraw(ctx);
    // // Draw actor bounding box
    // const bb = this.body.collider.localBounds.translate(this.getWorldPos());
    // bb.debugDraw(ctx);
    // // Draw actor Id
    // ctx.fillText('id: ' + this.id, bb.left + 3, bb.top + 10);
    // // Draw actor anchor Vector
    // ctx.fillStyle = Color.Yellow.toString();
    // ctx.beginPath();
    // ctx.arc(this.getWorldPos().x, this.getWorldPos().y, 3, 0, Math.PI * 2);
    // ctx.closePath();
    // ctx.fill();
    // // Culling Box debug draw
    // for (let j = 0; j < this.traits.length; j++) {
    //   if (this.traits[j] instanceof Traits.OffscreenCulling) {
    //     (<Traits.OffscreenCulling>this.traits[j]).cullingBox.debugDraw(ctx);
    //   }
    // }
    // // Unit Circle debug draw
    // ctx.strokeStyle = Color.Yellow.toString();
    // ctx.beginPath();
    // const radius = Math.min(this.width, this.height);
    // ctx.arc(this.getWorldPos().x, this.getWorldPos().y, radius, 0, Math.PI * 2);
    // ctx.closePath();
    // ctx.stroke();
    // const ticks: { [key: string]: number } = {
    //   '0 Pi': 0,
    //   'Pi/2': Math.PI / 2,
    //   Pi: Math.PI,
    //   '3/2 Pi': (3 * Math.PI) / 2
    // };
    // const oldFont = ctx.font;
    // for (const tick in ticks) {
    //   ctx.fillStyle = Color.Yellow.toString();
    //   ctx.font = '14px';
    //   ctx.textAlign = 'center';
    //   ctx.fillText(
    //     tick,
    //     this.getWorldPos().x + Math.cos(ticks[tick]) * (radius + 10),
    //     this.getWorldPos().y + Math.sin(ticks[tick]) * (radius + 10)
    //   );
    // }
    // ctx.font = oldFont;
    // // Draw child actors
    // for (let i = 0; i < this.children.length; i++) {
    //   this.children[i].debugDraw(ctx);
    // }
    // this.emit('postdebugdraw', new PostDebugDrawEvent(ctx, this));
  }

  /**
   * Returns the full array of ancestors
   */
  public getAncestors(): Actor[] {
    const path: Actor[] = [this];
    let currentActor: Actor = this;
    let parent: Actor;

    while ((parent = currentActor.parent)) {
      currentActor = parent;
      path.push(currentActor);
    }

    return path.reverse();
  }
  // #endregion
}

/**
 * The most important primitive in Excalibur is an `Actor`. Anything that
 * can move on the screen, collide with another `Actor`, respond to events,
 * or interact with the current scene, must be an actor. An `Actor` **must**
 * be part of a [[Scene]] for it to be drawn to the screen.
 *
 * [[include:Actors.md]]
 *
 *
 * [[include:Constructors.md]]
 *
 */
export class Actor extends Configurable(ActorImpl) {
  constructor();
  constructor(config?: ActorArgs);
  constructor(x?: number, y?: number, width?: number, height?: number, color?: Color);
  constructor(xOrConfig?: number | ActorArgs, y?: number, width?: number, height?: number, color?: Color) {
    super(xOrConfig, y, width, height, color);
  }
}
