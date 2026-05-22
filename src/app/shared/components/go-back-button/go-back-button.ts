import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  faPen,
  faTag,
  faDollarSign,
  faCube,
  faImage,
  faCloudUpload,
  faExclamationTriangle,
  faEdit,
  faAlignLeft,
  faComment
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-go-back-button',
  imports: [FaIconComponent, TranslateModule],
  templateUrl: './go-back-button.html',
  styleUrl: './go-back-button.scss',
})
export class GoBackButton {

  isLanguageEnglish = signal(localStorage.getItem('language') == 'en');
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
  interval!: any;

  router = inject(Router);
  private translate = inject(TranslateService);



  // In your component
  updateIcon = faPen;

  nameIcon = faTag;
  editIcon = faEdit;
  descriptionIcon = faAlignLeft;
  messageIcon = faComment;
  priceIcon = faDollarSign;
  stockIcon = faCube;
  imageIcon = faImage;
  uploadIcon = faCloudUpload;
  warningIcon = faExclamationTriangle;
  destroy$ = new Subject<void>();


  ngOnInit(): void {
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe((val) => {
      this.isLanguageEnglish.set(val.lang == 'en')
    })
  }
  goBack() {
    this.router.navigate(['/'], {
      replaceUrl: true
    })
  }

  getArrowIcon() {
    return this.isLanguageEnglish() ? faArrowLeft : faArrowRight;
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
