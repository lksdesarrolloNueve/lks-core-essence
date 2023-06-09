import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 5/12/2022
* @descripcion: Componente para la gestion de incp desde activos
*/
@Component({
    selector: 'modal-incp',
    moduleId: module.id,
    templateUrl: 'modal-incp.component.html'
})

export class ModalIncpComponent   {
  encabezado: string;
   /**
           * Constructor del componente 
           * @data --Envio de datos al modal dialogo
           */
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
          this.encabezado = data.titulo;
  }
       
}