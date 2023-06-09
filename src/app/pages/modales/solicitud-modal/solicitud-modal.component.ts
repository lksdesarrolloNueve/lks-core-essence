import { Component, Inject } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 08/06/2022
* @descripcion: Componente para la gestion de venta modal
*/
@Component({
    selector: 'solicitud-modal',
    moduleId: module.id,
    templateUrl: 'solicitud-modal.component.html'
})

export class SolicitudModalComponent {
    //Declaracion de componetes 
    @BlockUI() blockUI: NgBlockUI;
    encabezado: string = '';
    cuerpo: any;
    etiqueta: string = '';
    dato = new UntypedFormControl('', [Validators.required]);


    /**
     * Constructor
     */
    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogo: MatDialogRef<SolicitudModalComponent>, private service: GestionGenericaService) {
        this.encabezado = data.titulo;
        this.cuerpo = data.body;
        this.etiqueta = data.etiqueta;

    }
    /**Metodo que regresa el valor ingresado a la caja de texto */
    buscar() {
        if (this.dato.invalid) {
            if (this.dato instanceof UntypedFormControl) {
                this.dato.markAsTouched({ onlySelf: true });
            }
            this.service.showNotification('top', 'right', 3, "No sea ingresado " + this.etiqueta);
            this.blockUI.stop();
            return;
        }
        this.dialogo.close(this.dato.value);
    }

}