import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

/**
* @autor: Guillermo Juárez Jaramillo
* @version: 1.0.0
* @fecha: 19/11/2021
* @descripcion: Componente para la gestion
*/
@Component({
    selector: 'documentos-modal',
    moduleId: module.id,
    templateUrl: 'documentos-modal.component.html'
})

export class DocumentosModalComponent {
    encabezado: string;
    cuerpo:any;

    urlSafe: SafeResourceUrl;
    url : string;



    /**
     * Constructor
     */
    constructor( @Inject(MAT_DIALOG_DATA) public data: any, private sanitizer: DomSanitizer) { 
        this.encabezado = data.titulo+': '+data.nombre;

        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(data.documentos[0]);

    }
   
}