import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LiquidGlassComponent } from './liquid-glass.component';
import { SimpleChange, NgZone } from '@angular/core';
import { vi } from 'vitest';

describe('LiquidGlassComponent', () => {
    let component: LiquidGlassComponent;
    let fixture: ComponentFixture<LiquidGlassComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LiquidGlassComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(LiquidGlassComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('debe reaccionar a cambios en los inputs mediante ngOnChanges', () => {
        const spy = vi.spyOn(component as any, 'updateGlassEffect');
        
        component.ngOnChanges({
            backgroundColor: new SimpleChange(null, 'rgba(0,0,0,0.5)', false)
        });

        expect(spy).toHaveBeenCalled();
    });

    it('debe detectar falta de soporte SVG en Firefox/Safari y usar fallback de blur', () => {
        // Simulamos Firefox de forma segura
        const userAgentSpy = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:100.0) Gecko/20100101 Firefox/100.0');
        
        // Instanciamos manualmente para esta prueba específica
        const freshComponent = new LiquidGlassComponent(TestBed.inject(NgZone));
        
        expect((freshComponent as any).hasSVGFilterSupport).toBe(false);

        userAgentSpy.mockRestore();
    });

    it('debe usar fallback de blur si las dimensiones son muy pequeñas (<30px)', () => {
        const element = component.glassContainer.nativeElement;
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(20);
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(20);

        (component as any).updateGlassEffect();

        expect(element.style.backdropFilter).toContain('blur');
        expect(element.style.backdropFilter).not.toContain('url');
    });

    it('debe generar y aplicar efectos SVG complejos si hay soporte y tamaño suficiente', () => {
        const element = component.glassContainer.nativeElement;
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(200);
        vi.spyOn(element, 'offsetHeight', 'get').mockReturnValue(100);
        
        // JSDOM puede fallar al parsear el string complejo de backdrop-filter,
        // así que chequeamos que intente aplicarlo.
        const styleSpy = vi.spyOn(element.style, 'setProperty');

        (component as any).updateGlassEffect();

        expect(styleSpy).toHaveBeenCalledWith('backdrop-filter', expect.stringContaining('url(\'data:image/svg+xml'));
        expect(styleSpy).toHaveBeenCalledWith('-webkit-backdrop-filter', expect.stringContaining('#displace'));
    });

    it('debe limpiar el ResizeObserver al destruirse', () => {
        const disconnectSpy = vi.fn();
        (component as any).resizeObserver = {
            observe: vi.fn(),
            disconnect: disconnectSpy
        };

        component.ngOnDestroy();

        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('debe manejar dimensiones cero sin hacer nada', () => {
        const element = component.glassContainer.nativeElement;
        vi.spyOn(element, 'offsetWidth', 'get').mockReturnValue(0);
        
        const styleSpy = vi.spyOn(element.style, 'setProperty');
        (component as any).updateGlassEffect();

        expect(styleSpy).not.toHaveBeenCalled();
    });
});
