import { TranslateService } from '@ngx-translate/core';
// toast.service.ts
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ToastService implements OnDestroy {
  private snackBar = inject(MatSnackBar);
  private translateService = inject(TranslateService)
  destroy$ = new Subject<void>()

  horizontalPosition = signal<MatSnackBarHorizontalPosition>(this.translateService.currentLang == 'en' ? 'left' : 'right')

  constructor() {
    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.horizontalPosition.set(val.lang == 'en' ? 'left' : 'right')
    })
  }
  private show(message: string, panelClass: string, duration: number = 3000) {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: this.horizontalPosition(),
      verticalPosition: 'top',
      panelClass: [panelClass],
    });
  }

  success(message: string, duration?: number) {
    this.show(message, 'toast-success', duration);
  }

  error(message: string, duration?: number) {
    if (message.includes('undefined')) {
      this.show(this.translateService.instant('POOR_INTERNET'), 'toast-error', duration);
      return;
    }
    this.show(message, 'toast-error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'toast-info', duration);
  }

  warn(message: string, duration?: number) {
    this.show(message, 'toast-warning', duration);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}