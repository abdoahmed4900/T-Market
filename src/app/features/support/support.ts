import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Support } from './interfaces/support';
import { Subject, takeUntil } from 'rxjs';
import { SupportService } from './services/support.service';
import { ToastService } from '../../shared/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { Loader } from '../../shared/components/loader/loader';

import {
  faHeadset,
  faHeading,
  faPen,
  faComment,
  faPaperPlane,
  faInfoCircle,
  faExclamationTriangle,
  faArrowRight,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { AnimateOnScroll } from "../../shared/animate-on-scroll";

@Component({
  selector: 'app-support-page',
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, CommonModule, FaIconComponent, AnimateOnScroll],
  templateUrl: './support.html',
  styleUrl: './support.scss',
})
export class SupportPage {
  fb = inject(FormBuilder);
  supportForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    complaint: ['', [Validators.required, Validators.minLength(20)]],
  })
  destroy$ = new Subject<void>();
  supportService = inject(SupportService);
  translateService = inject(TranslateService);
  toastService = inject(ToastService);
  matDialog = inject(MatDialog);

  // In your component
  supportIcon = faHeadset;
  titleIcon = faHeading;
  editIcon = faPen;
  complaintIcon = faComment;
  messageIcon = faComment;
  sendIcon = faPaperPlane;
  infoIcon = faInfoCircle;
  warningIcon = faExclamationTriangle;
  arrowIcon = faArrowRight;

  constructor(private translate: TranslateService) {
    this.arrowIcon = this.translate.currentLang === 'ar' ? faArrowLeft : faArrowRight;
  }



  submitSupport() {
    let loader = this.matDialog.open(
      Loader,
      {
        disableClose: true,
      }
    )
    let support: Support = {
      complaintTitle: this.getField('title')!.value,
      complaint: this.getField('complaint')!.value,
      userId: localStorage.getItem('token')!,
      userName: localStorage.getItem('name')!,
      complaintDate: new Date().toDateString(),
    }
    this.supportService.addSupport(support).pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          loader.close();
          this.toastService.success(this.translateService.instant('SUCCESS_MESSAGES.SUPPORT_SENT'));
        },
        error: (err) => {
          loader.close();
        },
      }
    )
  }

  getField(controlName: string) {
    return this.supportForm.get(controlName)
  }
}
