import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

/**
* @autor: Juan Gerardo Rayas Mata
* @version: 1.0.0
* @fecha: 05/05/2022
* @descripcion: Componente que obtiene una lista para enviar alerta
*/
@Component({
    selector: 'lista-modal',
    moduleId: module.id,
    templateUrl: 'lista-modal.component.html'
})

export class listaModalComponent {
    encabezado: string;
    lista:any=[];

    llega:any=[];


/**
 * Constructor
 */
    constructor( @Inject(MAT_DIALOG_DATA) public data: any) { 
        this.encabezado = data.titulo;
/** 
this.llega=[{"nombre":'Deposito'},{ "nombre":'Comision'},{"nombre":'Comision'},{"nombre":'Comision'},{"nombre":'Comision'},
{"nombre":'Comision'},{"nombre":'Comision'},{"nombre":'Comision'},{"nombre":'Comision'
}];*/

        this.lista=data.body;
    }
   
}