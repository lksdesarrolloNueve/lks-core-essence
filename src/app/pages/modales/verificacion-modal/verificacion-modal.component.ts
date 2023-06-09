import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 24/09/2021
* @descripcion: Componente para la gestion de venta modal
*/
@Component({
    selector: 'verificacion-modal',
    moduleId: module.id,
    templateUrl: 'verificacion-modal.component.html'
})

export class verificacionModalComponent {
    encabezado: string;
    cuerpo:any;



/**
 * Constructor
 */
    constructor( @Inject(MAT_DIALOG_DATA) public data: any) { 
        this.encabezado = data.titulo;
        this.cuerpo=data.body;
    }
   
}