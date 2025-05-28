import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {
    }

    getList(apiUrl: string, currentPage: number = 1, limit = 10, search = '', filters?: object, sortFilter?: object): Observable<any> {
        const body = { ...filters, ...sortFilter };
        return this.http.get(`${apiUrl}?current_page=${currentPage}&per_page=${limit}&search=${search}`, body)
    }
}
