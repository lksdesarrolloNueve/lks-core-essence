import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import * as moment from "moment";

@Component({
    selector: 'riesgo-mercado',
    moduleId: module.id,
    templateUrl: './riesgo-mercado.component.html'
})
export class RiesgoMercadoComponent {

    //Wait
    @BlockUI() blockUI: NgBlockUI;

    //Declaración de variables y componentes
    formRiesgoCredito: UntypedFormGroup;


    constructor(private service:
        GestionGenericaService, private formBuilder: UntypedFormBuilder
    ) {
        this.formRiesgoCredito = this.formBuilder.group({
            fecha: new UntypedFormControl('', { validators: [Validators.required] }),

        })
    }


    /**
     * Genera el reporte de mercado
     */
    generarReporte() {

        if (this.formRiesgoCredito.invalid) {
            this.validateAllFormFields(this.formRiesgoCredito);
            return;
        }

        let fecha = moment(this.formRiesgoCredito.get('fecha').value).format("YYYY-MM-DD");

        this.blockUI.start('Generando reporte...');

        this.service.getListByID(fecha, 'getReporteMercado').subscribe(matriz => {


            if (matriz[0] == '0') {
                const linkSource = 'data:application/pdf;base64,' + matriz[1] + '\n';
                const downloadLink = document.createElement("a");
                const fileName = 'REPORTE RIESGO DE MERCADO' + fecha + '.pdf';

                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();
            } else {
                this.service.showNotification('top', 'right', 3, matriz[1]);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        }
        );

    }

    /**
    * Valida Cada atributo del formulario
    * @param formGroup - Recibe cualquier tipo de FormGroup
    */
    validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof UntypedFormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    /**
     * Metodo para mostrar los mensajes de validaciones 
     */
    validaciones = {
        'fecha': [{ type: 'required', message: 'Campo requerido.' }]
    }

}