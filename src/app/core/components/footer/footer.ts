import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { WebsiteTitle } from '../../../shared/components/website-title/website-title';

@Component({
  selector: 'app-footer',
  imports: [WebsiteTitle,TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
