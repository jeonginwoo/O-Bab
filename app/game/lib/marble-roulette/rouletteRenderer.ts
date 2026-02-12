import { canvasHeight, canvasWidth, initialZoom, Themes } from './data/constants';
import { Camera } from './camera';
import { StageDef } from './data/maps';
import { Marble } from './marble';
import { ParticleManager } from './particleManager';
import { GameObject } from './gameObject';
import { UIObject } from './UIObject';
import { VectorLike } from './types/VectorLike';
import { MapEntityState } from './types/MapEntity.type';
import { ColorTheme } from './types/ColorTheme';
import { KeywordService } from './keywordService';

export type RenderParameters = {
  camera: Camera;
  stage: StageDef;
  entities: MapEntityState[];
  marbles: Marble[];
  winners: Marble[];
  particleManager: ParticleManager;
  effects: GameObject[];
  winnerRank: number;
  winner: Marble | null;
  size: VectorLike;
  theme: ColorTheme;
};

export class RouletteRenderer {
  private _canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  public sizeFactor = 1;

  private _images: { [key: string]: HTMLImageElement } = {};
  private _theme: ColorTheme = Themes.dark;
  private _keywordService: KeywordService = new KeywordService();
  private resizeObserver: ResizeObserver | null = null;
  private _isDestroyed = false;

  constructor() {
  }

  get width() {
    return this._canvas.width;
  }

  get height() {
    return this._canvas.height;
  }

  get canvas() {
    return this._canvas;
  }

  set theme(value: ColorTheme) {
    this._theme = value;
  }

  destroy() {
    this._isDestroyed = true;
    this.resizeObserver?.disconnect();
    this._canvas?.remove();
  }

  async init(container: HTMLElement) {
    await Promise.all([this._load(), this._keywordService.init()]);

    if (this._isDestroyed || !document.body.contains(container)) {
        return;
    }

    this._canvas = document.createElement('canvas');
    this._canvas.width = canvasWidth;
    this._canvas.height = canvasHeight;
    this.ctx = this._canvas.getContext('2d', {
      alpha: true,
    }) as CanvasRenderingContext2D;

    container.appendChild(this._canvas);

    const resizing = (entries?: ResizeObserverEntry[]) => {
      let width, height;
      
      if (entries && entries.length > 0) {
        width = entries[0].contentRect.width;
        height = entries[0].contentRect.height;
      } else {
        const rect = container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
      }

      // Fallback for valid dimensions
      if (!width || width === 0) width = 640;
      if (!height || height === 0) height = 360;
      
      this._canvas.width = width;
      this._canvas.height = height;
      this.sizeFactor = 1;
    };

    this.resizeObserver = new ResizeObserver(resizing);

    this.resizeObserver.observe(container);
    resizing();
  }

  private async _loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((rs) => {
      const img = new Image();
      img.onload = () => {
        rs(img);
      };
      img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        rs(img); // Resolve anyway to prevent hanging
      };
      img.src = url;
    });
  }

  private async _load(): Promise<void> {
    const loadPromises: Promise<void>[] = [];
    /*
      [
        { name: '챔루', imgUrl: '/roulette-assets/images/chamru.png' },
        { name: '쿠빈', imgUrl: '/roulette-assets/images/kubin.png' },
        { name: '꽉변', imgUrl: '/roulette-assets/images/kkwak.png' },
        { name: '꽉변호사', imgUrl: '/roulette-assets/images/kkwak.png' },
        { name: '꽉 변호사', imgUrl: '/roulette-assets/images/kkwak.png' },
        { name: '주누피', imgUrl: '/roulette-assets/images/junyoop.png' },
        { name: '왈도쿤', imgUrl: '/roulette-assets/images/waldokun.png' },
      ].map(({ name, imgUrl }) => {
        return (async () => {
          this._images[name] = await this._loadImage(imgUrl.toString());
        })();
      });
    */

    loadPromises.push((async () => {
      // Keep only UI assets if any
      await this._loadImage('/roulette-assets/images/ff.svg');
    })());

    await Promise.all(loadPromises);
  }

  private getMarbleImage(name: string): CanvasImageSource | undefined {
    // Priority 1: Hardcoded images
    if (this._images[name]) {
      return this._images[name];
    }
    // Priority 2: Keyword sprites from API
    return this._keywordService.getSprite(name);
  }

  render(renderParameters: RenderParameters, uiObjects: UIObject[]) {
    this._theme = renderParameters.theme;
    this.ctx.fillStyle = this._theme.background;
    this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);

    this.ctx.save();
    this.ctx.scale(initialZoom, initialZoom);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.font = '0.4pt sans-serif';
    this.ctx.lineWidth = 3 / (renderParameters.camera.zoom + initialZoom);
    renderParameters.camera.renderScene(this.ctx, () => {
      this.renderEntities(renderParameters.entities);
      this.renderEffects(renderParameters);
      this.renderMarbles(renderParameters);
    });
    this.ctx.restore();

    uiObjects.forEach((obj) =>
      obj.render(
        this.ctx,
        renderParameters,
        this._canvas.width,
        this._canvas.height,
      ),
    );
    renderParameters.particleManager.render(this.ctx);
    this.renderWinner(renderParameters);
  }

  private renderEntities(entities: MapEntityState[]) {
    this.ctx.save();
    entities.forEach((entity) => {
      const transform = this.ctx.getTransform();
      this.ctx.translate(entity.x, entity.y);
      this.ctx.rotate(entity.angle);
      this.ctx.fillStyle = entity.shape.color ?? this._theme.entity[entity.shape.type].fill;
      this.ctx.strokeStyle = entity.shape.color ?? this._theme.entity[entity.shape.type].outline;
      this.ctx.shadowBlur = this._theme.entity[entity.shape.type].bloomRadius;
      this.ctx.shadowColor = entity.shape.bloomColor ?? entity.shape.color ?? this._theme.entity[entity.shape.type].bloom;
      const shape = entity.shape;
      switch (shape.type) {
        case 'polyline':
          if (shape.points.length > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.points[0][0], shape.points[0][1]);
            for (let i = 1; i < shape.points.length; i++) {
              this.ctx.lineTo(shape.points[i][0], shape.points[i][1]);
            }
            this.ctx.stroke();
          }
          break;
        case 'box':
          const w = shape.width * 2;
          const h = shape.height * 2;
          this.ctx.rotate(shape.rotation);
          this.ctx.fillRect(-w / 2, -h / 2, w, h);
          this.ctx.strokeRect(-w / 2, -h / 2, w, h);
          break;
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, shape.radius, 0, Math.PI * 2, false);
          this.ctx.stroke();
          break;
      }

      this.ctx.setTransform(transform);
    });
    this.ctx.restore();
  }

  private renderEffects({ effects, camera }: RenderParameters) {
    effects.forEach((effect) =>
      effect.render(this.ctx, camera.zoom * initialZoom, this._theme),
    );
  }

  private renderMarbles({
                          marbles,
                          camera,
                          winnerRank,
                          winners,
                          size,
                        }: RenderParameters) {
    const winnerIndex = winnerRank - winners.length;

    const viewPort = { x: camera.x, y: camera.y, w: size.x, h: size.y, zoom: camera.zoom * initialZoom };
    marbles.forEach((marble, i) => {
      marble.render(
        this.ctx,
        camera.zoom * initialZoom,
        i === winnerIndex,
        false,
        this.getMarbleImage(marble.name),
        viewPort,
        this._theme,
      );
    });
  }

  private renderWinner({ winner, theme }: RenderParameters) {
    if (!winner) return;
    this.ctx.save();
    this.ctx.fillStyle = theme.winnerBackground;
    this.ctx.fillRect(
      this._canvas.width / 2,
      this._canvas.height - 168,
      this._canvas.width / 2,
      168,
    );

    // Draw marble image or colored circle
    const marbleSize = 100;
    const marbleCenterX = this._canvas.width - marbleSize / 2 - 20;
    const marbleCenterY = this._canvas.height - 168 / 2;
    const marbleImage = this.getMarbleImage(winner.name);

    if (marbleImage) {
      this.ctx.drawImage(
        marbleImage,
        marbleCenterX - marbleSize / 2,
        marbleCenterY - marbleSize / 2,
        marbleSize,
        marbleSize,
      );
    } else {
      this.ctx.beginPath();
      this.ctx.arc(marbleCenterX, marbleCenterY, marbleSize / 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsl(${winner.hue} 100% ${theme.marbleLightness})`;
      this.ctx.fill();
    }

    this.ctx.fillStyle = theme.winnerText;
    this.ctx.strokeStyle = theme.winnerOutline;

    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.lineWidth = 4;
    const textRightX = marbleCenterX - marbleSize / 2 - 20;
    if (theme.winnerOutline) {
      this.ctx.strokeText('Winner', textRightX, this._canvas.height - 120);
    }

    this.ctx.fillText('Winner', textRightX, this._canvas.height - 120);
    this.ctx.font = 'bold 72px sans-serif';
    this.ctx.fillStyle = `hsl(${winner.hue} 100% ${theme.marbleLightness})`;
    if (theme.winnerOutline) {
      this.ctx.strokeText(winner.name, textRightX, this._canvas.height - 55);
    }
    this.ctx.fillText(winner.name, textRightX, this._canvas.height - 55);
    this.ctx.restore();
  }
}
