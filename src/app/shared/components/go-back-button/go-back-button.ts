import { Component, inject, signal } from '@angular/core';
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

  isLanguageEnglish = signal(localStorage.getItem('language') == 'en');
  icon = signal(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
  interval!:any;

  router = inject(Router);

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.interval = setInterval(() => {
        this.isLanguageEnglish.set(localStorage.getItem('language') == 'en');
        this.icon.set(this.isLanguageEnglish() ? faArrowLeft : faArrowRight)
    },100)
  }
   goBack(){
    this.router.navigate(['/'],{
      replaceUrl: true
    })
  }
}
