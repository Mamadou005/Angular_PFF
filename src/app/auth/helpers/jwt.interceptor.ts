import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token'); // Récupérer le token depuis localStorage
    console.log('Token récupéré :', token); // Ajouter un log pour vérifier si le token est récupéré
    const isLoggedIn = token != null; // Vérifier si le token existe
    const isApiUrl = request.url.startsWith(environment.apiUrl); // Vérifier si l'URL est l'API

    if (isLoggedIn && isApiUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` 
        }
      });
    }

    return next.handle(request);
  }
}
