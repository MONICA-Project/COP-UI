import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // console.log(request.url, request.url.includes('zones'));
        if (!request.url.includes('login')) {
            let stored = JSON.parse(localStorage.getItem("logged_in"));
            request = request.clone({
                setHeaders: {
                    Authorization: stored.token
                }
            });
            // console.log('Intercepting!', request); 
        }
        return next.handle(request);
    }
}