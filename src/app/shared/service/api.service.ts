/**
 * Clase service para generica para envio y recepcion de peticiones
 * que se generan a los ms
 * 
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { createHttpParams } from './http/http-params-builder';


@Injectable({
    providedIn: 'root'
})
export class ApiService {

    /**
     * Costructor de la clase 
     * 
     * @param http     - Objeto HTTP para peticiones 
     * @param httpFile - Objto para obtener un archivo de api rest
     */
    constructor(private http: HttpClient) { }

    /**
     * Metodo para manejo de errores en la peticion HTTP
     * @param error  - Error generado al realizar la peticion
     */
    private formatErrors(error: any) {
        return throwError(error.error);
    }

    /**
     * Metodo para la ejecucion de peticiones get para obtener informacion
     * 
     * @param path   - Url a la cual sera lanzada la peticion get
     * @param params - parametros que seran enviados en la peticion
     */
    get(path: string, params: any = {}): Observable<any> {
        //generacion de parametros en la url
        params = createHttpParams(params || {});
        return this.http.get(decodeURIComponent(`${path}`), { params })
            .pipe(catchError(this.formatErrors));
    }

    /**
    * Metodo para la ejecucion de peticiones put en actulizacion de informacion
    * 
    * @param path   - Url a la cual sera lanzada la peticion get
    * @param params - parametros que seran enviados en la peticion
    */
    put(path: string, body: Object = {}): Observable<any> {
        return this.http.put(`${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    /**
    * Metodo para la ejecucion de peticiones post para creacion de contenido
    * 
    * @param path   - Url a la cual sera lanzada la peticion get
    * @param params - parametros que seran enviados en la peticion
    */
    post(path: string, body: Object = {}): Observable<any> {
        return this.http.post(`${path}`, body)
            .pipe(catchError(this.formatErrors));
    }

    /**
    * Metodo para la ejecucion de peticiones delete
    * 
    * @param path   - Url a la cual sera lanzada la peticion get
    * @param params - parametros que seran enviados en la peticion
    */
    delete(path: string): Observable<any> {
        return this.http.delete(`${path}`)
            .pipe(catchError(this.formatErrors));
    }

    /**
    * Metodo para la ejecucion de peticiones delete
    * con objeto
    * @param path   - Url a la cual sera lanzada la peticion get
    * @param body - Objeto que seran enviados en la peticion
    */
    deleteConObjeto(path: string, body: Object = {}): Observable<any> {
        return this.http.delete(`${path}`, body).pipe(catchError(this.formatErrors));
    }


}