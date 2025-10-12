import { CanActivateFn } from '@angular/router';

export const sellerGuard: CanActivateFn = (route, state) => {
  let user = localStorage.getItem('user') as any;
  if (user) {
    if(user['role'] == 'seller'){
        return true;
    }
    return false;
  }
  return false;
};
