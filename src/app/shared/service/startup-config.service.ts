/**
 * Clase service para generica para obtener la configuracion de las URL 
 * a donde seran redireccionadas las peticiones
 * 
 */
 import { Injectable } from '@angular/core';
 import { HttpClient } from '@angular/common/http';
 import { environment } from '../../../environments/environment';
 
 
 @Injectable()
 export class StartupConfigService {
     /**
      * Objeto que almacenara la configuracion
      */
     private configuration: Object;
 
     /**
      * Constructor de la clase
      * @param http - Cliente http
      */
     constructor(private http: HttpClient) {
     }
 
     /**
      * Metodo para obtener la url mendiante una llave
      * 
      * @param key - parametro que indica el elemento a obtener de la
      * configuracion
      */
     public getValue(key: string) {
         return this.getConfig()[key];
     }
 
     /**
      * Obtiene la instancia de la configuracion
      */
     public getConfig() {
         return this.configuration;
     }
 
     /**
      * Metodo para realizar la carga del archivo de rutas donde
      * se encuentran configuradas las URL
      */
     public load(): Promise<boolean> {
         return new Promise((resolve, reject) => {
             this.http.get(environment.config).subscribe((json) => {
                 //Se cargan los valores del json a una varible para almacenamiento en memoria
                 this.configuration = json;
                 resolve(true);
             });
         });
     }
 }