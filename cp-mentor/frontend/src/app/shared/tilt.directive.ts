import { Directive, ElementRef, HostListener, Inject, Input, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTilt]',
  standalone: true
})
export class TiltDirective {
  @Input() tiltMax = 10;
  @Input() tiltScale = 1.03;

  // window doesn't exist during SSR; this directive is instantiated for every
  // matching element in the template regardless of the host component's own
  // lifecycle guards, so it needs its own guard.
  private readonly isBrowser: boolean;
  private reducedMotion = false;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2, @Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer.addClass(this.el.nativeElement, 'tilt-el');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (this.reducedMotion) return;
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * this.tiltMax;
    const rotateX = -((y - centerY) / centerY) * this.tiltMax;

    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${this.tiltScale})`
    );

    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    this.renderer.setStyle(this.el.nativeElement, '--tilt-glow-x', `${px}%`);
    this.renderer.setStyle(this.el.nativeElement, '--tilt-glow-y', `${py}%`);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
    );
  }
}
