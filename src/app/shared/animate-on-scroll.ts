import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAnimateOnScroll]'
})
export class AnimateOnScroll {

  @Input() animationClass = 'visible';
  @Input() threshold = 0.2;
  @Input() once = true;
  @Input() animateImmediately = false;
  @Input() offset = 0;
  hasAnimated = false;
  animationInterval:any;

  observer!: IntersectionObserver;
  
  constructor(private el: ElementRef) {}

   private checkAndAnimate() {
    if (this.hasAnimated && this.once) return;
    
    const rect = this.el.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const isVisible = rect.top < windowHeight && rect.bottom > 0;
    
    if (isVisible || this.animateImmediately) {
      this.el.nativeElement.classList.add(this.animationClass);
      this.hasAnimated = true;
      
      if (this.observer && this.once) {
        this.observer.unobserve(this.el.nativeElement);
      }
    }    
  }
  
  ngAfterViewInit() {
    const options = {
      root: null,
      rootMargin: `${this.offset}px 0px ${this.offset}px 0px`,
      threshold: this.threshold
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.el.nativeElement.classList.add(this.animationClass);
          if (this.once) {
            this.observer.unobserve(entry.target);
          }
        } else if (!this.once) {
          this.el.nativeElement.classList.remove(this.animationClass);
        }
      });
    }, options);
    
    this.observer.observe(this.el.nativeElement);
    this.checkAndAnimate();
  }
  
  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
      clearInterval(this.animationInterval)
    }
  }

}
