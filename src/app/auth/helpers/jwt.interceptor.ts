import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import {AuthenticationService} from "../service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(private _authenticationService: AuthenticationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const currentUser = this._authenticationService.currentUserValue;
    const isLoggedIn = currentUser && currentUser.token;
    const isApiUrl = request.url.startsWith(environment.apiUrl);
    const token = currentUser?.token;

    if (isLoggedIn && isApiUrl) {
      if (token) {
        // Ajouter l'en-tête d'authentification Bearer si le token est valide
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        console.error('Token non trouvé dans localStorage');
      }
    } else {
      console.log('Non connecté ou URL non API');
    }

    return next.handle(request);
  }
}
