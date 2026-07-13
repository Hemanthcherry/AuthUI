import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { EmployeesHomeComponent } from './components/employees-home/employees-home';
import { ProfileHomeComponent } from './components/profile-home/profile-home';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', 
    loadComponent : () => import('./components/login/login').then(m => m.LoginComponent) },
  { path: 'register', 
    loadComponent : () => import('./components/register/register').then(m => m.RegisterComponent) },
  { path: 'employees', 
    loadComponent : () => import('./components/employees-home/employees-home').then(m => m.EmployeesHomeComponent), canActivate: [authGuard] },
  { path: 'me', 
    loadComponent : () => import('./components/profile-home/profile-home').then(m => m.ProfileHomeComponent), canActivate: [authGuard] },
  {
    path: '**',
    redirectTo: '/login'
  }
];
