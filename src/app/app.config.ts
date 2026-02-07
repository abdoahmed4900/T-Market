import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp, getApps } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => {
      return getApps().length ? getApps()[0] : initializeApp(environment.firebase);
    }),
    provideTranslateService(
      {
        lang: localStorage.getItem('language') || 'ar',
        fallbackLang: 'en',
        loader: provideTranslateHttpLoader({
          prefix: '/i18n/',
          suffix: '.json',
        }),
      }
    ),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideHttpClient(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: false,
      registrationStrategy: 'registerImmediately',
    }),
  ]
};
