import { PaginationService } from '../../../../shared/services/pagination.service';
import { Component, inject, Signal, signal } from '@angular/core';
import { PaginationContainer } from "../../../../shared/components/pagination-container/pagination-container";
import { SupportService } from '../../../support/services/support.service';
import { Subject, takeUntil } from 'rxjs';
import { Support } from '../../../support/interfaces/support';
import { AnimateOnScroll } from '../../../../shared/animate-on-scroll';
import { TranslateModule } from '@ngx-translate/core';
import { GoBackButton } from "../../../../shared/components/go-back-button/go-back-button";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faHeadset, faUser, faIdCard, faTag, faReply, faInbox, faMessage } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-show-supports',
  imports: [PaginationContainer, AnimateOnScroll, TranslateModule, GoBackButton, FaIconComponent],
  providers: [PaginationService],
  templateUrl: './show-supports.html',
  styleUrl: './show-supports.scss',
})
export class ShowSupports {
  isLoaded = signal(false);

  paginationService = inject(PaginationService);
  supportService = inject(SupportService);

  showedSupports: Signal<Support[]> = this.paginationService.showedProducts;

  destroy$ = new Subject<void>();

  allSupports = signal<Support[]>([])

  supportIcon = faHeadset;
  userIcon = faUser;
  idIcon = faIdCard;
  titleIcon = faTag;
  messageIcon = faMessage;
  replyIcon = faReply;
  emptyIcon = faInbox;

  ngOnInit(): void {
    this.supportService.readAllSupports().pipe(takeUntil(this.destroy$)).subscribe(
      {
        next: (value) => {
          this.isLoaded.set(false);
          this.paginationService.reset();
          this.paginationService.productsPerPage.set(9);
          this.allSupports.set(value);
          this.paginationService.initializePagination(value);
          this.isLoaded.set(true);
        },
      }
    )
  }
}
