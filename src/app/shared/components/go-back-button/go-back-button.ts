import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-go-back-button',
  imports: [FaIconComponent,TranslatePipe],
  templateUrl: './go-back-button.html',
  styleUrl: './go-back-button.scss',
})
export class GoBackButton {

  isLanguageEnglish = computed(() => {
    return localStorage.getItem('language') == 'en';
  })
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)

  router = inject(Router);
   goBack(){
    this.router.navigate(['/'],{
      replaceUrl: true
    })
  }
}
