import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    api_token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2E5YTA4MGM0Yjk2YzAwMTY3MzgyZjQiLCJ0aW1lIjoiMTY3MjM3OTE5NzQ4OCIsInVzZXJyb2xlIjo0LCJpYXQiOjE2NzIzNzkxOTd9.olw47Y5kQ94-8MN7tS5b3Iumee8z4roWo9hQB-rMq74";

    constructor(public http: HttpClient) { }

    public getRequest(url, params = {}) {
        return this.http.get(url, { params }).pipe(
            map(res => {
                return res;
            }),
            catchError(err => {
                return this.handleError(err);
            })
        );
    }

    public postRequest(url, params) {
        const headers = {
            'content-type': 'application/json',
            'Authorization': this.api_token
        }
        return this.http.post(url, params, { 'headers': headers }).pipe(
            map(res => {
                return res;
            }),
            catchError(err => {
                return this.handleError(err);
            })
        );
    }

    public handleError(error: HttpErrorResponse) {
        return throwError(error);
    }
}
