import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { UserViewService } from './user-view.service';

@Injectable({
    providedIn: 'root'
})
export class UserResolver implements Resolve<any> {
    constructor(private userService: UserViewService) {}

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        const userId = route.paramMap.get('id');
        return this.userService.fetchUserData(userId); 
    }
}
