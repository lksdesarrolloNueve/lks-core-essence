import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 11/08/2022
 * @descripcion: Servicio para cambiar el titulo del navbar
 */
@Injectable({
    providedIn: 'root'
})
export class TitleService {

    public tituloSubject = new Subject();

    constructor() { }


    public setTitulo(titulo: string) {
        this.tituloSubject.next(titulo);
    }

    public getTitulo(): Observable<any> {
        return this.tituloSubject.asObservable();
    }
}