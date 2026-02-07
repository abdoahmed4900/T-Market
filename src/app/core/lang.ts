import { Directive, ElementRef, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appLangDirective]'
})
export class LangDirective {
  
  elementRef= inject(ElementRef);
  translateService = inject(TranslateService);
  ngOnInit(): void {
    this.translateService.onLangChange.subscribe(() => {
      this.updateDirection();
    });
    this.updateDirection();
  }
  updateDirection() {
    const currentLang = this.translateService.getCurrentLang();
    this.elementRef.nativeElement.classList.toggle('rtl', currentLang === 'ar');
  }

}
