import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'modal-pld',
    moduleId: module.id,
    templateUrl: 'modal-pld.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 4/10/2022
 * @descripcion: Componente modal para los avisos PLD
 */
export class ModalPldComponent{
    //Declaracion de variables
    titulo: string='';
    perfil:string='';
    contenido: string='';
    color:string='green';

   /* * Constructor
    */
       constructor( @Inject(MAT_DIALOG_DATA) public data: any) { 
           this.titulo = data.titulo;
           this.perfil=data.perfil;
           this.contenido=data.contenido;
           this.color=data.color;

       }
}