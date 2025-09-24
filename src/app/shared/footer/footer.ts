import { Component } from '@angular/core';
import { WebsiteTitle } from "../website-title/website-title";

@Component({
  selector: 'app-footer',
  imports: [WebsiteTitle],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

}
