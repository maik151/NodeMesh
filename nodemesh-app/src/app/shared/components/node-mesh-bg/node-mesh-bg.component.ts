import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { ThemeService } from '../../../core/services/ui/theme.service';

@Component({
    selector: 'app-node-mesh-bg',
    standalone: true,
    template: `<canvas #canvas class="mesh-canvas"></canvas>`,
    styles: [`
        :host { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .mesh-canvas { width: 100%; height: 100%; display: block; }
    `]
})
export class NodeMeshBgComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

    private ctx!: CanvasRenderingContext2D;
    private animId = 0;
    private nodes: Node[] = [];
    private readonly NODE_COUNT = 80;
    private readonly CONNECT_DIST = 180;

    constructor(private readonly zone: NgZone, public readonly themeService: ThemeService) { }

    ngAfterViewInit(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        this.resize();
        this.initNodes();

        window.addEventListener('resize', this.resizeBound);

        // Run animation outside Angular zone so it doesn't trigger change detection
        this.zone.runOutsideAngular(() => this.animate());
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animId);
        window.removeEventListener('resize', this.resizeBound);
    }

    private readonly resizeBound = () => this.resize();

    private resize(): void {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    private getRandom(): number {
        const array = new Uint32Array(1);
        globalThis.crypto.getRandomValues(array);
        return array[0] / (0xFFFFFFFF + 1);
    }

    private initNodes(): void {
        const { width, height } = this.canvasRef.nativeElement;
        this.nodes = [];
        for (let i = 0; i < this.NODE_COUNT; i++) {
            this.nodes.push({
                x: this.getRandom() * width,
                y: this.getRandom() * height,
                vx: (this.getRandom() - 0.5) * 0.4,
                vy: (this.getRandom() - 0.5) * 0.4,
                r: this.getRandom() * 2 + 1.5,
            });
        }
    }

    private readonly animate = (): void => {
        const canvas = this.canvasRef.nativeElement;
        const { width, height } = canvas;
        const ctx = this.ctx;
        const isDark = this.themeService.isDark;

        ctx.clearRect(0, 0, width, height);

        // Colors
        const nodeColor = isDark ? 'rgba(159,255,34,' : 'rgba(80,140,20,';
        const lineColor = isDark ? 'rgba(159,255,34,' : 'rgba(80,140,20,';

        this.updateAndDrawNodes(ctx, nodeColor, isDark, width, height);
        this.drawConnections(ctx, lineColor, isDark);

        this.animId = requestAnimationFrame(this.animate);
    };

    private updateAndDrawNodes(ctx: CanvasRenderingContext2D, color: string, isDark: boolean, w: number, h: number): void {
        for (const n of this.nodes) {
            n.x += n.vx;
            n.y += n.vy;

            if (n.x < 0 || n.x > w) n.vx *= -1;
            if (n.y < 0 || n.y > h) n.vy *= -1;

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = color + '0.9)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + 3, 0, Math.PI * 2);
            ctx.fillStyle = color + (isDark ? '0.15)' : '0.10)');
            ctx.fill();
        }
    }

    private drawConnections(ctx: CanvasRenderingContext2D, color: string, isDark: boolean): void {
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const dist = Math.hypot(dx, dy);

                if (dist < this.CONNECT_DIST) {
                    const opacity = (1 - dist / this.CONNECT_DIST) * (isDark ? 0.35 : 0.4);
                    ctx.beginPath();
                    ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    ctx.strokeStyle = color + opacity + ')';
                    ctx.lineWidth = isDark ? 0.8 : 1.2;
                    ctx.stroke();
                }
            }
        }
    }
}

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
}
