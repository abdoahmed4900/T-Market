import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';

export const routes: Routes = [
    {path: '',redirectTo: 'home', pathMatch: 'full' },
    {path: 'home',component: HomeComponent},
    // {path: 'login',},
    // {path: 'register',},
    // {path: 'dashboard',},
    // {path: 'profile',},
    // {path : 'product/:id',},
    // {path : 'category/:id',},
    // {path: '**',redirectTo: 'home' }
];
