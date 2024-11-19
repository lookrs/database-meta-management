import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl: string = '/api/v1/';

  constructor(private http: HttpClient) {
  }

  // 通用的 GET 请求方法
  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(this.baseUrl + url, {params, headers});
  }

  // 通用的 POST 请求方法
  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(this.baseUrl + url, body, {headers});
  }
}
