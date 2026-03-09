import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

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
    private readonly NODE_COUNT = 60;
    private readonly CONNECT_DIST = 150;

    constructor(private zone: NgZone, public themeService: ThemeService) { }

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

    private resizeBound = () => this.resize();

    private resize(): void {
        const canvas = this.canvasRef.nativeElement;
        const rect = canvas.parentElement!.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    private initNodes(): void {
        const { width, height } = this.canvasRef.nativeElement;
        this.nodes = [];
        for (let i = 0; i < this.NODE_COUNT; i++) {
            this.nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1.5,
            });
        }
    }

    private animate = (): void => {
        const canvas = this.canvasRef.nativeElement;
        const { width, height } = canvas;
        const ctx = this.ctx;
        const isDark = this.themeService.isDark;

        ctx.clearRect(0, 0, width, height);

        // Colors
        const nodeColor = isDark ? 'rgba(159,255,34,' : 'rgba(100,160,30,';
        const lineColor = isDark ? 'rgba(159,255,34,' : 'rgba(100,160,30,';

        // Update & draw nodes
        for (const n of this.nodes) {
            n.x += n.vx;
            n.y += n.vy;

            // Bounce off edges
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;

            // Draw dot
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = nodeColor + '0.8)';
            ctx.fill();

            // Glow (only dark mode for perf)
            if (isDark) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r + 2, 0, Math.PI * 2);
                ctx.fillStyle = nodeColor + '0.15)';
                ctx.fill();
            }
        }

        // Draw connecting lines
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.CONNECT_DIST) {
                    const opacity = (1 - dist / this.CONNECT_DIST) * (isDark ? 0.35 : 0.18);
                    ctx.beginPath();
                    ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    ctx.strokeStyle = lineColor + opacity + ')';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        this.animId = requestAnimationFrame(this.animate);
    };
}

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
}
