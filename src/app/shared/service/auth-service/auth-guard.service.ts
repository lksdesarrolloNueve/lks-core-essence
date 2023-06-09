import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot,RouterStateSnapshot, UrlTree } from '@angular/router';

 
 
@Injectable()
export class AuthGuardService implements CanActivate {
 
    constructor(private router:Router ) {
 
    }
 
    canActivate(route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): boolean|UrlTree {

        const token = sessionStorage.getItem('AccessToken');
 
        if (!token) {
            this.router.navigate(["/login"]);
            return false;
 
        } 
 
        return true;
    }
 
}
 