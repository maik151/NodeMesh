import { Component, ElementRef, Input, OnDestroy, AfterViewInit, ViewChild, NgZone, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-liquid-glass',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div #glassContainer class="glass-box" [class.is-animating]="isAnimating">
            <div class="content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            width: fit-content;
            max-width: 100%;
        }
        .glass-box {
            position: relative;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.4);
            box-shadow: 
              inset 0 0 0 1px rgba(255,255,255, 0.08), 
              0 8px 32px 0 rgba(0, 0, 0, 0.3);
            transition: transform 0.1s ease;
            will-change: backdrop-filter;
        }
        .glass-box.is-animating {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            transition: none !important;
        }
        .content {
            width: 100%;
            height: 100%;
        }
    `]
})
export class LiquidGlassComponent implements AfterViewInit, OnDestroy, OnChanges {
    @ViewChild('glassContainer', { static: true }) glassContainer!: ElementRef<HTMLDivElement>;

    @Input() radius: number = 16;
    @Input() depth: number = 5;
    @Input() blur: number = 2;
    @Input() strength: number = 100;
    @Input() chromaticAberration: number = 2;
    @Input() backgroundColor: string = 'rgba(255, 255, 255, 0.15)';
    @Input() isAnimating: boolean = false;
    @Input() simple: boolean = false;

    private resizeObserver!: ResizeObserver;
    private hasSVGFilterSupport = true;
    private lastWidth = 0;
    private lastHeight = 0;

    constructor(
        private readonly zone: NgZone,
    ) {
        this.detectSVGFilterSupport();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.glassContainer && (changes['backgroundColor'] || changes['blur'] || changes['strength'] || changes['depth'] || changes['radius'] || changes['chromaticAberration'])) {
            this.updateGlassEffect();
        }
    }

    ngAfterViewInit(): void {
        this.zone.runOutsideAngular(() => {
            this.resizeObserver = new ResizeObserver(() => {
                this.updateGlassEffect();
            });
            this.resizeObserver.observe(this.glassContainer.nativeElement);
        });

        setTimeout(() => this.updateGlassEffect(), 0);
    }

    ngOnDestroy(): void {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    private detectSVGFilterSupport() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isFirefox = /firefox|fxios/.test(userAgent);
        const isSafari = /safari/.test(userAgent) && !/chrome|chromium|crios|edg/.test(userAgent);
        if (isFirefox || isSafari) {
            this.hasSVGFilterSupport = false;
        }
    }

    private updateGlassEffect(): void {
        const element = this.glassContainer.nativeElement;

        const actualWidth = Math.ceil(element.offsetWidth);
        const actualHeight = Math.ceil(element.offsetHeight);

        if (actualWidth === 0 || actualHeight === 0) return;
        
        // Skip if dimensions haven't changed to avoid expensive paint/reflow
        if (actualWidth === this.lastWidth && actualHeight === this.lastHeight) return;
        
        this.lastWidth = actualWidth;
        this.lastHeight = actualHeight;

        this.zone.runOutsideAngular(() => {
            element.style.borderRadius = `${this.radius}px`;
            element.style.background = this.backgroundColor;

            // PERFORMANCE: Skip SVG filters if simple mode is ON or if element is in transition
            // or if it's too large/small. Standard CSS blur is Hardware Accelerated.
            if (this.simple || !this.hasSVGFilterSupport || actualWidth < 30 || actualHeight < 30 || actualHeight > 500 || this.depth < 2) {
                const blurVal = `blur(${this.blur}px)`;
                if (element.style.backdropFilter !== blurVal) {
                    element.style.setProperty('backdrop-filter', blurVal);
                    element.style.setProperty('-webkit-backdrop-filter', blurVal);
                }
                return;
            }

            const filterUrl = this.getDisplacementFilter(actualHeight, actualWidth);
            const bgFilter = `blur(${this.blur / 3}px) url('${filterUrl}') blur(${this.blur / 1.5}px)`;

            element.style.setProperty('backdrop-filter', bgFilter);
            element.style.setProperty('-webkit-backdrop-filter', bgFilter);
        });
    }

    private getDisplacementMap(height: number, width: number): string {
        const rHeight = (this.radius / height) * 15;
        const rWidth = (this.radius / width) * 15;

        let svg = '<svg height="' + height + '" width="' + width + '" viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">';
        svg += '<style>.mix { mix-blend-mode: screen; }</style>';
        svg += '<defs>';
        svg += '<linearGradient id="Y" x1="0" x2="0" y1="' + Math.ceil(rHeight) + '%" y2="' + Math.floor(100 - rHeight) + '%">';
        svg += '<stop offset="0%" stop-color="#0F0" /><stop offset="100%" stop-color="#000" />';
        svg += '</linearGradient>';
        svg += '<linearGradient id="X" x1="' + Math.ceil(rWidth) + '%" x2="' + Math.floor(100 - rWidth) + '%" y1="0" y2="0">';
        svg += '<stop offset="0%" stop-color="#F00" /><stop offset="100%" stop-color="#000" />';
        svg += '</linearGradient>';
        svg += '</defs>';
        svg += '<rect x="0" y="0" height="' + height + '" width="' + width + '" fill="#808080" />';
        svg += '<g filter="blur(2px)">';
        svg += '<rect x="0" y="0" height="' + height + '" width="' + width + '" fill="#000080" />';
        svg += '<rect x="0" y="0" height="' + height + '" width="' + width + '" fill="url(#Y)" class="mix" />';
        svg += '<rect x="0" y="0" height="' + height + '" width="' + width + '" fill="url(#X)" class="mix" />';
        svg += '<rect x="' + this.depth + '" y="' + this.depth + '" height="' + (height - 2 * this.depth) + '" width="' + (width - 2 * this.depth) + '" fill="#808080" rx="' + this.radius + '" ry="' + this.radius + '" filter="blur(' + this.depth + 'px)" />';
        svg += '</g></svg>';

        return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    }

    private getDisplacementFilter(height: number, width: number): string {
        const displacementMapUrl = this.getDisplacementMap(height, width);
        const scale1 = this.strength + this.chromaticAberration * 2;
        const scale2 = this.strength + this.chromaticAberration;

        let svg = '<svg height="' + height + '" width="' + width + '" viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">';
        svg += '<defs><filter id="displace" color-interpolation-filters="sRGB">';
        svg += '<feImage x="0" y="0" height="' + height + '" width="' + width + '" href="' + displacementMapUrl + '" result="displacementMap" />';
        svg += '<feDisplacementMap transform-origin="center" in="SourceGraphic" in2="displacementMap" scale="' + scale1 + '" xChannelSelector="R" yChannelSelector="G" />';
        svg += '<feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedR" />';
        svg += '<feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="' + scale2 + '" xChannelSelector="R" yChannelSelector="G" />';
        svg += '<feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedG" />';
        svg += '<feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="' + this.strength + '" xChannelSelector="R" yChannelSelector="G" />';
        svg += '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="displacedB" />';
        svg += '<feBlend in="displacedR" in2="displacedG" mode="screen"/><feBlend in2="displacedB" mode="screen"/>';
        svg += '</filter></defs></svg>';

        return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
    }
}
