import { Skills, STUCK_DELAY, Themes } from './data/constants';
import { rad } from './utils/utils';
import options from './options';
import { VectorLike } from './types/VectorLike';
import { Vector } from './utils/Vector';
import { IPhysics } from './IPhysics';
import { ColorTheme } from './types/ColorTheme';
import { transformGuard } from './utils/transformGuard';

// Fallback palette
const DEFAULT_PALETTE = [0, 30, 60, 120, 180, 210, 270, 300, 330];

export class Marble {
  type = 'marble' as const;
  name: string = '';
  size: number = 0.5;
  color: string = 'red';
  hue: number = 0;
  impact: number = 0;
  weight: number = 1;
  skill: Skills = Skills.None;
  isActive: boolean = false;

  private _skillRate = 0.0005;
  private _coolTime = 5000;
  private _maxCoolTime = 5000;
  private _stuckTime = 0;
  private lastPosition: VectorLike = { x: 0, y: 0 };
  private theme: ColorTheme = Themes.dark;
  private variation: number = 0;
  private colorIndex: number = 0;

  private physics: IPhysics;

  id: number;

  get position() {
    return this.physics.getMarblePosition(this.id) || { x: 0, y: 0, angle: 0 };
  }

  get x() {
    return this.position.x;
  }

  set x(v: number) {
    this.position.x = v;
  }

  get y() {
    return this.position.y;
  }

  set y(v: number) {
    this.position.y = v;
  }

  get angle() {
    return this.position.angle;
  }

  constructor(
    physics: IPhysics,
    order: number,
    max: number,
    name?: string,
    weight: number = 1,
    palette: number[] = DEFAULT_PALETTE,
  ) {
    this.name = name || `M${order}`;
    this.weight = weight;
    this.physics = physics;

    this._maxCoolTime = 1000 + (1 - this.weight) * 4000;
    this._coolTime = this._maxCoolTime * Math.random();
    this._skillRate = 0.2 * this.weight;

    const maxLine = Math.ceil(max / 10);
    const line = Math.floor(order / 10);
    const lineDelta = -Math.max(0, Math.ceil(maxLine - 5));
    
    this.id = order;
    this.variation = (Math.random() * 10) - 5;
    this.colorIndex = Math.floor(Math.random() * 10000);
    this.updatePalette(palette);

    physics.createMarble(
      order,
      10.25 + (order % 10) * 0.6,
      maxLine - line + lineDelta,
    );
  }

  public updatePalette(palette: number[]) {
    if (!palette || palette.length === 0) return;
    this.hue = palette[this.colorIndex % palette.length];
    this.hue = (this.hue + this.variation + 360) % 360;
    this.color = `hsl(${this.hue} 100% 70%)`;
  }

  update(deltaTime: number) {
    if (
      this.isActive &&
      Vector.lenSq(Vector.sub(this.lastPosition, this.position)) < 0.00001
    ) {
      this._stuckTime += deltaTime;

      if (this._stuckTime > STUCK_DELAY) {
        this.physics.shakeMarble(this.id);
        this._stuckTime = 0;
      }
    } else {
      this._stuckTime = 0;
    }
    this.lastPosition = { x: this.position.x, y: this.position.y };

    this.skill = Skills.None;
    if (this.impact) {
      this.impact = Math.max(0, this.impact - deltaTime);
    }
    if (!this.isActive) return;
    if (options.useSkills) {
      this._updateSkillInformation(deltaTime);
    }
  }

  private _updateSkillInformation(deltaTime: number) {
    if (this._coolTime > 0) {
      this._coolTime -= deltaTime;
    }

    if (this._coolTime <= 0) {
      this.skill =
        Math.random() < this._skillRate ? Skills.Impact : Skills.None;
      this._coolTime = this._maxCoolTime;
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    outline: boolean,
    isMinimap: boolean = false,
    skin: CanvasImageSource | undefined,
    viewPort: { x: number, y: number, w: number, h: number, zoom: number },
    theme: ColorTheme,
  ) {
    this.theme = theme;
    const viewPortHw = (viewPort.w / viewPort.zoom / 2);
    const viewPortHh = (viewPort.h / viewPort.zoom / 2);
    const viewPortLeft = viewPort.x - viewPortHw;
    const viewPortRight = viewPort.x + viewPortHw;
    const viewPortTop = viewPort.y - viewPortHh - (this.size / 2);
    const viewPortBottom = viewPort.y + viewPortHh;
    if (!isMinimap && (this.x < viewPortLeft || this.x > viewPortRight || this.y < viewPortTop || this.y > viewPortBottom)) {
      return;
    }
    const transform = ctx.getTransform();
    if (isMinimap) {
      this._renderMinimap(ctx);
    } else {
      this._renderNormal(ctx, zoom, outline, skin);
    }
    ctx.setTransform(transform);
  }

  private _renderMinimap(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    this._drawMarbleBody(ctx, true);
  }

  private _drawMarbleBody(ctx: CanvasRenderingContext2D, isMinimap: boolean) {
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      isMinimap ? this.size : this.size / 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  private _renderNormal(
    ctx: CanvasRenderingContext2D,
    zoom: number,
    outline: boolean,
    skin?: CanvasImageSource,
  ) {
    const hs = this.size / 2;

    ctx.fillStyle = `hsl(${this.hue} 100% ${this.theme.marbleLightness + 25 * Math.min(1, this.impact / 500)}%`;

    // Apply glow based on theme
    if (this.theme.marbleGlow) {
      ctx.shadowColor = this.theme.marbleGlow;
      ctx.shadowBlur = zoom / 3;
    }

    // ctx.shadowColor = this.color;
    // ctx.shadowBlur = zoom / 2;
    if (skin) {
      transformGuard(ctx, () => {
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(skin, -hs, -hs, hs * 2, hs * 2);
      });
    } else {
      this._drawMarbleBody(ctx, false);
    }

    // Reset shadow only if we want to change it for text, but we want text to glow too.
    // However, text might need DIFFERENT shadow settings (e.g. smaller blur for text).
    // Let's reset here and let _drawName apply its own suitable glow.
    ctx.shadowColor = '';
    ctx.shadowBlur = 0;

    this._drawName(ctx, zoom);

    if (outline) {
      this._drawOutline(ctx, 2 / zoom);
    }

    if (options.useSkills) {
      this._renderCoolTime(ctx, zoom);
    }
  }

  private _drawName(ctx: CanvasRenderingContext2D, zoom: number) {
    transformGuard(ctx, () => {
      ctx.font = `12pt sans-serif`;
      
      // Removed black outline for cleaner look to match theme
      // ctx.strokeStyle = 'black';
      // ctx.lineWidth = 2;
      
      if (this.theme.rankStroke) {
        ctx.strokeStyle = this.theme.rankStroke;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
      }

      ctx.fillStyle = this.color;

      if (this.theme.marbleGlow) {
        ctx.shadowColor = this.theme.marbleGlow;
        ctx.shadowBlur = 4; // Consistent small glow for text
      } else {
        ctx.shadowBlur = 0;
      }
      
      ctx.translate(this.x, this.y + 0.25);
      ctx.scale(1 / zoom, 1 / zoom);
      
      if (this.theme.rankStroke) {
        ctx.strokeText(this.name, 0, 0);
      }
      ctx.fillText(this.name, 0, 0);
    });
  }

  private _drawOutline(ctx: CanvasRenderingContext2D, lineWidth: number) {
    ctx.beginPath();
    ctx.strokeStyle = this.theme.marbleWinningBorder;
    ctx.lineWidth = lineWidth;
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  private _renderCoolTime(ctx: CanvasRenderingContext2D, zoom: number) {
    ctx.strokeStyle = this.theme.coolTimeIndicator;
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    ctx.arc(
      this.x,
      this.y,
      this.size / 2 + 2 / zoom,
      rad(270),
      rad(270 + (360 * this._coolTime) / this._maxCoolTime),
    );
    ctx.stroke();
  }
}
