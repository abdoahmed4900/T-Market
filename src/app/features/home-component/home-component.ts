import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, ViewContainerRef, PLATFORM_ID, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-home-wrapper-component',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent implements OnInit {
  private vcr = inject(ViewContainerRef);
  private platform = inject(PLATFORM_ID);
  private askedForPush = false;
  swPush = inject(SwPush);
  http = inject(HttpClient);
  dialog = inject(MatDialog);


  async ngOnInit() {
    await this.createHomeComponent();
    console.log('service of push : ' +  this.swPush.isEnabled);    ;
    this.dialog.open(
      ConfirmDialog,
      {
        data: {
          confirmFunction: async () => {
            return this.subscribeToNotifications();
          },
          dialogTitle: "Do you want to subscribe to notifications?"
        }
      }
    )
  }
  

  private async createHomeComponent() {
    let role: string | null = null;
    if (isPlatformBrowser(this.platform)) {
      role = localStorage.getItem('role');
    }

    let cmp;
    console.log(role);

    if (role === 'buyer') {
      cmp = (await import('./buyer-home-component/home')).BuyerHomeComponent;
    } else if (role === 'seller') {
      cmp = (await import('./seller-home-component/seller-home-component')).SellerHomeComponent;
    } else {
    cmp = (await import('../admin/admin')).Admin;
    }

    const ref = this.vcr.createComponent(cmp);
  }

  async subscribeToNotifications() {

    console.log('subscribeToNotifications STARTED');

     const permission = await Notification.requestPermission();
     if (permission !== 'granted') return;


    const { publicKey } = await firstValueFrom(
      this.http.get<{ publicKey: string }>('http://localhost:4242/api/get-notification-key')
    );
    
    console.log('before ready promise');
    

    if(!this.swPush.isEnabled) {
      console.log('Service Worker is not enabled');
      return;
    }

    
     const sub = await this.swPush.requestSubscription({
      serverPublicKey: publicKey
    });

    console.log(sub.toJSON());
    

    console.log('Subscribed successfully');

    try {
      await firstValueFrom(
        this.http.post('http://localhost:4242/api/subscribe-to-notifications', {
         userId: 'TSYHNQpBWDX8lsGyl2CwNOLPfC12',
         deviceId: this.getDeviceId(),
         endpoint: sub.endpoint,
         keys: sub.toJSON().keys,
         userAgent: navigator.userAgent,
         deviceType: this.getDeviceType()
        })
      );
      console.log('subscription saved');
    } catch (e) {
      console.error('subscription failed', e);
    }

    try {
       await firstValueFrom(
         this.http.post('http://localhost:4242/api/send-notification', {
            message : 'Test Notification',
            userId : 'TSYHNQpBWDX8lsGyl2CwNOLPfC12'
         })
       );
       console.log('send notification called');
    } catch (e) {    
       console.error('send notification failed', e);
    }
    
     
    // await firstValueFrom(
    //    this.http.post('http://localhost:4242/api/subscribe-to-notifications', {
    //      userId: 'TSYHNQpBWDX8lsGyl2CwNOLPfC12',
    //      deviceId: this.getDeviceId(),
    //      endpoint: sub.endpoint,
    //      keys: sub.toJSON().keys,
    //      userAgent: navigator.userAgent,
    //      deviceType: this.getDeviceType()
    //    })
    // );

    // await firstValueFrom(
    //   this.http.post('http://localhost:4242/api/send-notification',{
    //     message : 'Test Notification',
    //     userId : 'TSYHNQpBWDX8lsGyl2CwNOLPfC12'
    //   })
    // );
    

    console.log('end of method');
    
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
