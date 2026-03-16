import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { ProgressService } from './progress.service';

@Component({
  selector: 'app-payment-progress-bar',
  imports: [TranslatePipe],
  templateUrl: './payment-progress-bar.html',
  styleUrl: './payment-progress-bar.scss',
})
export class PaymentProgressBar{

  translateService = inject(TranslateService);
  progressService = inject(ProgressService);
  progressPercent = this.progressService.progressPercent;

  progressStrings = ['PROGRESS_BAR.CART','PROGRESS_BAR.PAYMENT','PROGRESS_BAR.DONE']
  destroy$ = new Subject<void>();
  isProgressing = computed(() => this.progressService.progressPercent() > 0)
  

  progressText = computed(() => {
    const percent = this.progressPercent();
    if (percent <= 33) return this.progressStrings[0]; 
    if (percent <= 66) return this.progressStrings[1];
    return this.progressStrings[2];     
  })

  languageSub = this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(
    {
      next : (value) => {
        this.isEnglish.set(value.lang == 'en' ? true : false);
      },
    }
  )

  isEnglish = signal(localStorage.getItem('language') === 'en');

  progressElement = viewChild<HTMLElement>('progress');

  ngOnInit(): void {
    if(!this.isProgressing()){
      this.progressService.goToFirstStep();
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
