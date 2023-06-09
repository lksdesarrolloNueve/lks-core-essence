import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../../shared/service/gestion";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 25/07/2022
* @descripcion: Componente para la gestion de Comprobantes 
*/
@Component({
    selector: 'modal-comprobante',
    moduleId: module.id,
    templateUrl: 'modal-comprobante.component.html'

})
export class ModalComprobanteComponent {
    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;
    CurrentDate: any;
    proveedor = new UntypedFormControl('');
    serie = new UntypedFormControl('');
    folio = new UntypedFormControl('');
    monto = new UntypedFormControl('', [Validators.required]);

    encabezado: string = "";
    informacion: any = [];

    /**
   * Constructor de la clase
   * @param service service para el acceso de datos 
   */

    constructor(private service: GestionGenericaService, private datePipe: DatePipe, @Inject(MAT_DIALOG_DATA) public data: any, private dialog: MatDialogRef<ModalComprobanteComponent>) {
        this.CurrentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
        this.encabezado = data.encabezado;
        this.proveedor.setValue(data.emisor.nombreProveedor);
        this.monto.setValue(data.monto);

    }
    
    /**Cierra el modal y devuelve la informacion de comprobante procesado */
    cargarComprobante() {
        this.blockUI.start('Cargando datos...');
        if (this.proveedor.invalid) {
            if (this.proveedor instanceof UntypedFormControl) {
                this.proveedor.markAsTouched({ onlySelf: true });
            }
            return this.blockUI.stop();
        }
        if (this.monto.invalid) {
            if (this.monto instanceof UntypedFormControl) {
                this.monto.markAsTouched({ onlySelf: true });
            }
            return this.blockUI.stop();
        }
        this.informacion.push({
            'serie': this.serie.value, 'folio': this.folio.value,
            'receptor': "", 'emisor': this.data.emisor.rfc,
            'monto': this.monto.value
        });
        this.blockUI.stop();
        //cerrar 
        this.dialog.close(this.informacion);
    }
    /**
    * Lista de validaciones 
    */
    validaciones = {
        "monto": [{ type: 'required', message: 'Campo requerido.' }]
    };
}