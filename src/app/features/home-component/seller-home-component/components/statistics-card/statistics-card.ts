import { Component, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { AnimateOnScroll } from "../../../../../shared/animate-on-scroll";

@Component({
  selector: 'app-statistics-card',
  imports: [TranslatePipe, AnimateOnScroll],
  templateUrl: './statistics-card.html',
  styleUrl: './statistics-card.scss',
})
export class StatisticsCard {
  showCard = input.required<boolean>();
  statisticNumber = input.required<number>();
  statisticName = input.required<string>();

  shouldShowContent = signal(false);

}
