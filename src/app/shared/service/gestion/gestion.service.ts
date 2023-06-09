import { Injectable } from "@angular/core";
import { ApiService } from '../api.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { StartupConfigService } from '../startup-config.service';
import Swal from 'sweetalert2'



@Injectable()
export class GestionGenericaService {


  /**
   * 
   * Constructor de la clase
   * @param api -Servicio de acceso
   * @param config -Configuracion de acceso al config
   */
  constructor(private api: ApiService, private config: StartupConfigService) {
  }

  /**
 * Metodo Generico que permite registar un objeto
 * @param data - Objeto a insertar 
 * @param metodo - Metodo por el cual se nombra al pathBase 
 */
  registrar(data: Object = {}, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.post(`${path}`, data).pipe(map(response => response));
  }

  /**
   * Metodo Generico que permite registar un objeto mediante ID
   * @param data - Objeto a insertar 
   * @param pathHeader - Composicion del path header
   * @param metodo - Metodo por el cual se nombra al pathBase 
   */
  registrarBYID(data: Object = {}, pathHeader: any, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.post(`${path}/${pathHeader}`, data).pipe(map(response => response));
  }
  /**
  * Metodo Generico que permite registar un objeto mediante ID
  * @param data - Objeto a insertar 
  * @param pathHeader - Composicion del path header
  * @param metodo - Metodo por el cual se nombra al pathBase 
  */
  registrarBYParametro(pathHeader: any, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.post(`${path}/${pathHeader}`).pipe(map(response => response));
  }

  /**
   * Metodo generico para consultar
   * @param metodo - Metodo por el cual se nombra al pathBase 
   */
  getList(metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.get(path).pipe(map(response => response));
  }

  /**
 * Metodo generico para consultar datos por medio de el filtro de un objeto tipo json
 * @param metodo - Metodo por el cual se nombra al pathBase 
 */
  getListByObjet(data: Object = {}, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.post(path, data).pipe(map(response => response));
  }



  /**
   * Metodo que retorna una consulta por filtros ID 
   * @param idRegistro - Id del registro a filtrar
   * @param metodo - PathBAse a consultar 
   */
  getListByID(idRegistro: any, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.get(`${path}/${idRegistro}`).pipe(map(response => response));
  }

  /**
* Metodo que retorna todas las consultas por medio de arrays IDS
* @param data - Id del registro a filtrar
* @param metodo - PathBAse a consultar 
*/
  getListByArregloIDs(data, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.get(`${path}/${data}`).pipe(map(response => response));
  }

  /**
     * Metodo Generico que permite eliminar un objeto por id
     * @param idRegistro - Id del registro a eliminar
     * @param metodo - Metodo por el cual se nombra al pathBase 
     */
  eliminar(idRegistro: any, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.delete(`${path}/${idRegistro}`).pipe(map(response => response));
  }

  /**
   * Metodo Generico que permite actualizar un objeto
   * @param data - Objeto a actualizar 
   * @param metodo - Metodo por el cual se nombra al pathBase 
   */
  actualizar(idRegistro: any, data: Object = {}, metodo: string): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.put(`${path}/${idRegistro}`, data).pipe(map(response => response));
  }

  /**
   * Metodo Generico que permite registar un objeto
   * @param data - Objeto a insertar 
   * @param metodo - Metodo por el cual se nombra al pathBase 
   * @param atributos - Atributos que se pasan por url 
   */
  registrarConAtributos(data: Object = {}, metodo: string, atributos: any): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.post(`${path}/${atributos}`, data).pipe(map(response => response));
  }

  /**
   * Metodo Generico que permite eliminar un objeto
   * @param idRegistro - Id del objeto
   * @param data - Objeto a actualizar 
   * @param metodo - Metodo por el cual se nombra al pathBase 
   */
  eliminarConObjeto(data: Object = {}, metodo: string, atributos: any,): Observable<any> {
    let path = this.config.getValue(metodo);
    return this.api.deleteConObjeto(`${path}/${atributos}`, data).pipe(map(response => response));
  }

  /**
   * 
   * @param from - VAlor default Top
   * @param align -Alineacion del mensaje
   * @param color - Tipo de mensaje 1.- Info, 2.-Exito, 3.-Advertencia, 4.- Error, 5.-Vista
   * @param message 
   */
  showNotification(from, align, color, message: string) {

    switch (color) {
      case 1:
        Swal.fire({
          icon: 'info',
          title: message
        })
        break;
      case 2:
        Swal.fire({
          title: message,
          icon: 'success'
        })
        break;
      case 3:
        Swal.fire({
          icon: 'warning',
          title: message
        })
        break;

      default:
        Swal.fire({
          icon: 'error',
          title: message ? 'Ocurrio un error no identificado.' : message
        })
        break;
    }
    
  }

}