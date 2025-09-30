import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserCustomizationService {
    private token = '';

    constructor(private http: HttpClient) {}

    getColumnsTemplates(url: string, listComponent: string): Observable<any> {
        if(this.token) {
            return this.http.get(`${url}?listComponent=${listComponent}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.get(`${url}?listComponent=${listComponent}`);
    }

    addColumnsTemplate(url: string, body: any): Observable<any> {
        if(this.token) {
            return this.http.post(`${url}`, body, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.post(url, body);
    }

    updateColumnsTemplate(url: string, body: any): Observable<any> {
        if(this.token) {
            return this.http.post(`${url}`, body, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.post(url, body);
    }

    deleteColumnsTemplate(url: string, body: any): Observable<any> {
        if(this.token) {
            return this.http.put(`${url}`, body, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.put(url, body);
    }

    getSelectedColumnsTemplate(url: string, listComponent: string): Observable<any> {
        if(this.token) {
            return this.http.get(`${url}?listComponent=${listComponent}`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.get(`${url}?listComponent=${listComponent}`);
    }

    updateSelectedColumnsTemplate(url: string, body: any): Observable<any> {
        if(this.token) {
            return this.http.post(`${url}`, body, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.post(url, body);
    }
}
