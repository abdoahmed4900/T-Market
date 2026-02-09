import { Component } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  imports: [WebsiteTitle,TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
