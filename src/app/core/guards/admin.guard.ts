import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  let token = localStorage.getItem('token') as any;
  if (token) {
    let role = localStorage.getItem('role') as any;
    if(role == 'admin'){
        return true;
    }
    return false;
  }
  return false;
};
