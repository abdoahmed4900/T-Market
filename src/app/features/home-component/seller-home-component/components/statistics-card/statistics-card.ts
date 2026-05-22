import { Component, Input, input, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { faArrowDown, faArrowUp, faBox } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-statistics-card',
  imports: [TranslateModule, AnimateOnScroll, FaIconComponent],
  templateUrl: './statistics-card.html',
  styleUrl: './statistics-card.scss',
})
export class StatisticsCard {
  showCard = input.required<boolean>();
  statisticNumber = input.required<number>();
  statisticName = input.required<string>();

  shouldShowContent = signal(false);
  @Input() statisticIcon = signal<any>(faBox);

  // Icons
  trendUpIcon = faArrowUp;
  trendDownIcon = faArrowDown;

}
