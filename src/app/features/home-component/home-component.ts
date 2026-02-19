import { CommonModule } from '@angular/common';
import { Component, inject, PLATFORM_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SellerHomeComponent } from "./seller-home-component/seller-home-component";
import { BuyerHomeComponent } from "./buyer-home-component/home";
import { AdminComponent } from "../admin/admin";
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home-wrapper-component',
  imports: [CommonModule, SellerHomeComponent, BuyerHomeComponent, AdminComponent],
  standalone: true,
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss',
})
export class HomeComponent implements OnInit {
  private platform = inject(PLATFORM_ID);
  authService = inject(AuthService);
  // swPush = inject(SwPush);
  dialog = inject(MatDialog);
  role = this.authService.userRole;


  async ngOnInit() {
    // console.log('service of push : ' +  this.swPush.isEnabled);    ;
    // this.dialog.open(
    //   ConfirmDialog,
    //   {
    //     data: {
    //       confirmFunction: async () => {
    //         return this.subscribeToNotifications();
    //       },
    //       dialogTitle: "Do you want to subscribe to notifications?"
    //     }
    //   }
    // );

    // this.swPush.messages.subscribe((message : {
    //   actions?: {
    //    action: string;
    //    title: string;
    //   }[],
    //   title?: string,
    //   body?: string,
    //   icon?: string,
    //   badge?: string,
    //   vibrate?: number[],
    //   data?: {
    //     dateOfArrival: number;
    //     url?: string;
    //     primaryKey?: number;
    //     [key: string]: any;
    //   },
    // }) => {
    //   console.log('Received push message: ', message);
    //   self.window.addEventListener('push', (event) => {
    //     let e = event as PushEvent;
    //     console.log('Push event received: ', e);
    //     // e.waitUntil(
    //     //   self.regi
    //     // )
    //   })
    // });
  }
  

  async subscribeToNotifications() {

    // console.log('subscribeToNotifications STARTED');

    //  const permission = await Notification.requestPermission();
    //  if (permission !== 'granted') return;


    // const { publicKey } = await firstValueFrom(
    //   this.http.get<{ publicKey: string }>('http://localhost:4242/api/get-notification-key')
    // );
    
    // console.log('before ready promise');
    // console.log(publicKey);
    

    // if(!this.swPush.isEnabled) {
    //   console.log('Service Worker is not enabled');
    //   return;
    // }

    
    //  const sub = await this.swPush.requestSubscription({
    //   serverPublicKey: publicKey
    // });

    // console.log(sub.toJSON());
    

    // console.log('Subscribed successfully');

    // try {
    //   await firstValueFrom(
    //     this.http.post('http://localhost:4242/api/subscribe-to-notifications', {
    //      userId: 'TSYHNQpBWDX8lsGyl2CwNOLPfC12',
    //      deviceId: this.getDeviceId(),
    //      endpoint: sub.endpoint,
    //      keys: sub.toJSON().keys,
    //      userAgent: navigator.userAgent,
    //      deviceType: this.getDeviceType()
    //     })
    //   );
    //   console.log('subscription saved');
    // } catch (e) {
    //   console.error('subscription failed', e);
    // }

    // try {
    //    await firstValueFrom(
    //      this.http.post('http://localhost:4242/api/send-notification', {
    //         message : 'Test Notification',
    //         userId : 'TSYHNQpBWDX8lsGyl2CwNOLPfC12'
    //      })
    //    );
    //    console.log('send notification called');
    // } catch (e) {    
    //    console.error('send notification failed', e);
    // }
    
     
    // // await firstValueFrom(
    // //    this.http.post('http://localhost:4242/api/subscribe-to-notifications', {
    // //      userId: 'TSYHNQpBWDX8lsGyl2CwNOLPfC12',
    // //      deviceId: this.getDeviceId(),
    // //      endpoint: sub.endpoint,
    // //      keys: sub.toJSON().keys,
    // //      userAgent: navigator.userAgent,
    // //      deviceType: this.getDeviceType()
    // //    })
    // // );

    // // await firstValueFrom(
    // //   this.http.post('http://localhost:4242/api/send-notification',{
    // //     message : 'Test Notification',
    // //     userId : 'TSYHNQpBWDX8lsGyl2CwNOLPfC12'
    // //   })
    // // );
    

    // console.log('end of method');
    
  }

  getDeviceType(): string {
    const ua = navigator.userAgent;

    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
  }  

  getDeviceId(): string {
     let id = localStorage.getItem("deviceId");
     if (!id) {
       id = crypto.randomUUID();
       localStorage.setItem("deviceId", id);
     }
     return id;
  }  
}
