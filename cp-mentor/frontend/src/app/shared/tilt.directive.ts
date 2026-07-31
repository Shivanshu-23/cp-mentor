import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTilt]'
})
export class TiltDirective {
  @Input() tiltMax = 10;
  @Input() tiltScale = 1.03;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {
    this.renderer.addClass(this.el.nativeElement, 'tilt-el');
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
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
