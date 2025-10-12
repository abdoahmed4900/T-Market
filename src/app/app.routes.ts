import { LoginComponent } from './features/auth/login/login';
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { RegisterComponent } from './features/auth/register/register';
import { ResetPassword } from './features/auth/reset-password/reset-password';

export const routes: Routes = [
    {path: '',redirectTo: 'home', pathMatch: 'full' },
    {path: 'home',component: HomeComponent},
    {path: 'login',component: LoginComponent},
    {path: 'register',component: RegisterComponent},
    {path: 'reset-password',component: ResetPassword},
    // {path: 'dashboard',},
    // {path: 'profile',},
    // {path : 'product/:id',},
    // {path : 'category/:id',},
    // {path: '**',redirectTo: 'home' }
];
