import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjExODgiLCJvcmdJZCI6Ijg5IiwidGltZXpvbmUiOiJBc2lhL0Jhbmdrb2siLCJ0b2tlblR5cGUiOiJsb2dpbiIsInVzZXJUeXBlIjoiQkFDS0VORF9VU0VSIiwiaWF0IjoxNzU0MzcwMTI2LCJleHAiOjE3NTQ0MTMzMjZ9.UIfH0ZKOt7IfcVNIhLIjLvRlmRI4EgfOm9h2ELryjLA';

    constructor(private http: HttpClient) {
    }

    getList(apiUrl: string, currentPage: number = 1, limit = 10, search = '', filters?: object, sortFilter?: object): Observable<any> {
        const body = { ...filters, ...sortFilter };

        if(this.token) {
            return this.http.post(`${apiUrl}?current_page=${currentPage}&per_page=${limit}&search=${search}`, body, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        }

        return this.http.post(`${apiUrl}?current_page=${currentPage}&per_page=${limit}&search=${search}`, body);
    }
}
