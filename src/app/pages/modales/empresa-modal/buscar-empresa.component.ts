import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 10/11/2021
* @descripcion: Componente para la gestion de empresas
*/
@Component({
    selector: 'buscar-empresa',
    moduleId: module.id,
    templateUrl: 'buscar-empresa.component.html'
})

export class BuscarEmpresaComponent   {
  encabezado: string;
   /**
           * Constructor del componente 
           * @data --Envio de datos al modal dialogo
           */
    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
          this.encabezado = data.titulo;
  }
       
}