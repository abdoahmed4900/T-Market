// title.service.ts
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TitleService implements OnDestroy {
  private title = inject(Title);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateTitle();
    });

    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateTitle();
      });
  }

  private updateTitle() {
    const routeTitle = this.getRouteTitle();
    if (routeTitle) {
      this.translate.get(routeTitle).subscribe(translatedTitle => {
        this.title.setTitle(`${translatedTitle} | T-Market`);
      });
    } else {
      this.title.setTitle('T-Market');
    }
  }

  private getRouteTitle(): string | null {
    let currentRoute = this.router.routerState.snapshot.root;
    while (currentRoute.firstChild) {
      currentRoute = currentRoute.firstChild;
    }
    return currentRoute.data?.['title'] || null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}