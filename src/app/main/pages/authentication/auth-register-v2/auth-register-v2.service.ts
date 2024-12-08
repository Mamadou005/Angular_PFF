import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthRegisterService {

    private apiUrl = 'http://localhost:8080/auth/signup';

    constructor(private http: HttpClient, private router: Router) { }

    registerUser(userData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, userData).pipe(
            tap(() => {
                this.router.navigate(['/list-utilisateur']);
            })
        );
    }
}
