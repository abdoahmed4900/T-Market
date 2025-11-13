import { Component, inject } from '@angular/core';
import { Seller } from '../../auth/user';
import { HomeService } from '../home.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-seller-home-component',
  imports: [AsyncPipe],
  templateUrl: './seller-home-component.html',
  styleUrl: './seller-home-component.scss'
})
export class SellerHomeComponent {
  user!: Observable<Seller>;

  homeSerivce = inject(HomeService);

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.user = this.homeSerivce.getUser();
  }
}
