// image-zoom.directive.ts
import { Directive, ElementRef, HostListener, Input, output, signal, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appImageZoom]',
  standalone: true,
  exportAs: 'appImageZoom'
})
export class ImageZoomDirective implements AfterViewInit {
  @Input() zoomStep = 0.1;

  private scaleSignal = signal(1);
  private translateX = 0;
  private translateY = 0;
  private isPanning = false;
  private startX = 0;
  private startY = 0;
  private lastX = 0;
  private lastY = 0;

  // Container and image dimensions
  private container!: HTMLElement;
  private image!: HTMLImageElement;
  private containerRect = { width: 0, height: 0 };
  private imageRect = { width: 0, height: 0 };

  get scale() {
    return this.scaleSignal();
  }

  imageScale = output<number>();

  constructor(private el: ElementRef<HTMLImageElement>) {
    this.image = this.el.nativeElement;
    this.image.style.transformOrigin = '0 0';
    this.image.style.transition = 'transform 0.2s ease';
  }

  ngAfterViewInit() {
    // Get container (parent element with overflow)
    this.container = this.image.parentElement!;
    this.updateDimensions();
  }

  private updateDimensions() {
    this.containerRect = this.container.getBoundingClientRect();
    this.imageRect = this.image.getBoundingClientRect();
  }

  private getMaxTranslation(): { maxX: number; maxY: number } {
    const scale = this.scaleSignal();

    // Calculate how much the image exceeds the container
    const imageWidth = this.imageRect.width;
    const imageHeight = this.imageRect.height;
    const containerWidth = this.containerRect.width;
    const containerHeight = this.containerRect.height;

    // Calculate overflow at current scale
    const overflowX = Math.max(0, (imageWidth * scale - containerWidth) / 2);
    const overflowY = Math.max(0, (imageHeight * scale - containerHeight) / 2);

    return { maxX: overflowX, maxY: overflowY };
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      const oldScale = this.scaleSignal();
      const delta = event.deltaY > 0 ? -this.zoomStep : this.zoomStep;
      let newScale = Math.min(3, Math.max(1, oldScale + delta));

      this.scaleSignal.set(newScale);

      // Recalculate translation bounds after zoom
      this.applyBounds();
      this.updateTransform();
      this.imageScale.emit(this.scaleSignal());
      event.preventDefault();
    }
  }

  private applyBounds() {
    const { maxX, maxY } = this.getMaxTranslation();
    this.translateX = this.clamp(this.translateX, -maxX, maxX);
    this.translateY = this.clamp(this.translateY, -maxY, maxY);
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.scaleSignal() > 1) {
      this.isPanning = true;
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.lastX = this.translateX;
      this.lastY = this.translateY;
      event.preventDefault();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isPanning) {
      const deltaX = event.clientX - this.startX;
      const deltaY = event.clientY - this.startY;

      let newX = this.lastX + deltaX;
      let newY = this.lastY + deltaY;

      // Apply bounds
      const { maxX, maxY } = this.getMaxTranslation();
      newX = this.clamp(newX, -maxX, maxX);
      newY = this.clamp(newY, -maxY, maxY);

      this.translateX = newX;
      this.translateY = newY;
      this.updateTransform();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isPanning = false;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.scaleSignal() > 1 && event.touches.length === 1) {
      this.isPanning = true;
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
      this.lastX = this.translateX;
      this.lastY = this.translateY;
      event.preventDefault();
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isPanning && event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - this.startX;
      const deltaY = event.touches[0].clientY - this.startY;

      let newX = this.lastX + deltaX;
      let newY = this.lastY + deltaY;

      const { maxX, maxY } = this.getMaxTranslation();
      newX = this.clamp(newX, -maxX, maxX);
      newY = this.clamp(newY, -maxY, maxY);

      this.translateX = newX;
      this.translateY = newY;
      this.updateTransform();
      event.preventDefault();
    }
  }

  @HostListener('touchend')
  onTouchEnd() {
    this.isPanning = false;
  }

  @HostListener('window:resize')
  onResize() {
    this.updateDimensions();
    this.applyBounds();
    this.updateTransform();
  }

  private updateTransform() {
    this.updateDimensions();
    this.image.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scaleSignal()})`;
  }

  zoomIn() {
    const newScale = Math.min(3, this.scaleSignal() + this.zoomStep);
    this.scaleSignal.set(newScale);
    this.applyBounds();
    this.updateTransform();
    this.imageScale.emit(this.scaleSignal());
  }

  zoomOut() {
    const newScale = Math.max(1, this.scaleSignal() - this.zoomStep);
    this.scaleSignal.set(newScale);
    if (this.scaleSignal() === 1) {
      this.translateX = 0;
      this.translateY = 0;
    } else {
      this.applyBounds();
    }
    this.updateTransform();
    this.imageScale.emit(this.scaleSignal());
  }

  reset() {
    this.scaleSignal.set(1);
    this.translateX = 0;
    this.translateY = 0;
    this.updateTransform();
    this.imageScale.emit(this.scaleSignal());
  }
}