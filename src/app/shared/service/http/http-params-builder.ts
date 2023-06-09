/**
 * Funcion global para generacion de parametros 
 * para peticiones get mediante HttParams. 
 * 
 * Se utiliza la notacion: ?param1=1&param2=2
 * 
 */
 import { HttpParams } from '@angular/common/http';

 export function createHttpParams(params: {}): HttpParams {
     let httpParams: HttpParams = new HttpParams();
     Object.keys(params).forEach(param => {
         //Se verifica que se tenga un valor incluido 0
         if (params[param] || params[param] === 0) { 
 
             //Se verifica si es instancia de un array
             if (params[param] instanceof Array) {
                 //Se iteran los parametros del array
                 params[param].forEach(value => {
                     httpParams = httpParams.append(param, value);
                 });
             } else {
                 //si no es array se hace el append al httParams
                 httpParams = httpParams.append(param, params[param]);
             }
         }
     });
     
     //Retorno de prametros
     return httpParams;
 }