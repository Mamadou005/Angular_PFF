import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DocumentService {
    private minioUrl = 'http://localhost:8080/api/oss';
    private apiUrl = 'http://localhost:8080/api/rapport';

    constructor(private http: HttpClient) { }

    // Méthode pour sauvegarder un document modifié
    saveModifiedDocument(documentId: number, file: Blob, fileName: string): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('file', file, fileName);
        formData.append('documentId', documentId.toString());
    
        return this.http.post(`${this.minioUrl}/upload`, formData);
    }

    // Méthode pour sauvegarder des annotations
    saveAnnotations(documentId: number, xfdf: string): Observable<any> {
        const formData = new FormData();
        const xfdfBlob = new Blob([xfdf], { type: 'application/vnd.adobe.xfdf' });
        formData.append('annotations', xfdfBlob, `Annotations-${documentId}.xfdf`);
        return this.http.post(`${this.minioUrl}/annotations/${documentId}`, formData);
    }

    // Méthode privée pour mettre à jour l'URL du rapport
    private updateRapportUrl(documentId: number, fileUrl: string): Observable<any> {
        const body = {
            documentId,
            contenuUrl: fileUrl,
        };
        console.log("test url ",fileUrl)
        return this.http.put(`${this.apiUrl}/update/${documentId}`, body);
    }
}
