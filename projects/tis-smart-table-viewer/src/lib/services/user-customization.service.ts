import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserCustomizationService {

    constructor(private http: HttpClient) {
    }

    getColumnsTemplates(listComponent: string): Observable<any> {
        return this.http.get(`/user-customization/get-columns-templates?listComponent=${listComponent}`);
    }

    addColumnsTemplate(body: any): Observable<any> {
        return this.http.post(`/user-customization/add-columns-template`, body);
    }

    updateColumnsTemplate(body: any): Observable<any> {
        return this.http.post(`/user-customization/update-columns-template`, body);
    }

    deleteColumnsTemplate(body: any): Observable<any> {
        return this.http.put(`/user-customization/delete-columns-template`, body);
    }

    getSelectedColumnsTemplate(listComponent: string): Observable<any> {
        return this.http.get(`/user-customization/get-selected-columns-template?listComponent=${listComponent}`);
    }

    updateSelectedColumnsTemplate(body: any): Observable<any> {
        return this.http.post(`/user-customization/update-selected-columns-template`, body);
    }

    addUserChartPreferences(body: any): Observable<any> {
        return this.http.post(`/user-customization/add-user-chart-preferences`, body);
    }

    getUserChartPreferenceDetails(companyId: number | string | null): Observable<any> {
        return this.http.get(`/user-customization/get-user-chart-preference-details/${companyId}`);
    }

    updateUserChartPreferences(id: number, body: any): Observable<any> {
        return this.http.put(`/user-customization/update-user-chart-preferences/${id}`, body);
    }
}
