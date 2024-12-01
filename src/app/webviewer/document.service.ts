import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = 'http://localhost:8080/api/rapport';  

    constructor(private http: HttpClient) { }

    getDocumentUrl(id: number): Observable<string> {
        return this.http.get<string>(`${this.apiUrl}/documents/${id}`);
    }
}
