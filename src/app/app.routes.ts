import { LoginComponent } from './features/auth/login/login';
import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { RegisterComponent } from './features/auth/register/register';
import { ResetPassword } from './features/auth/reset-password/reset-password';
import { ProductDetails } from './shared/product-details/product-details';
import { Categories } from './features/categories/categories';
import { CartComponent } from './features/cart/cart';

export const routes: Routes = [
    {path: '',redirectTo: 'home', pathMatch: 'full' },
    {path: 'home',component: HomeComponent},
    {path: 'shop',component: Categories},
    {path: 'login',component: LoginComponent},
    {path: 'register',component: RegisterComponent},
    {path: 'reset-password',component: ResetPassword},
    {path: 'product/:id',component: ProductDetails},
    {path: 'cart',component: CartComponent},
    // {path: 'dashboard',},
    // {path: 'profile',},
    // {path : 'product/:id',},
    // {path : 'category/:id',},
    {path: '**',redirectTo: 'home' }
];
