import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import globales from '../../../../../environments/globales.config';
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'admin-cartera',
    moduleId: module.id,
    templateUrl: 'admin-cartera.component.html'
})
export class AdminCarteraComponent {

    //Declaracion de variables
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    listaTipoCartera: any = [];
    formCartera: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase
     * @param data - Gestion de los datos desde el padre
     * @param formBuilder - Gestion de formularios
     * @param service - Service para el acceso a datos
     */
    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService) {

        this.listaTipoCartera = [];

        for (let cartera of data.listaTipoCartera) {
            if (cartera.cveGeneral.trim() !== data.credito.cveCartera.trim()) {
                this.listaTipoCartera.push(cartera);
            }
        }

        this.formCartera = this.formBuilder.group({
            newCartera: new UntypedFormControl('', [Validators.required]),
            cliente: new UntypedFormControl(data.credito.nombreCliente),
            referencia: new UntypedFormControl(data.credito.referencia),
            cartera: new UntypedFormControl(data.credito.tipoCartera)
        })
    }

    /**
     * Metodo para actualizar el tipo de cartera por crédito
     */
    spuCartera() {

        if (this.formCartera.invalid) {
            this.validateAllFormFields(this.formCartera);
            return;
        }

        if (this.formCartera.get('newCartera').value.cveGeneral === this.data.credito.cveCartera) {
            this.service.showNotification('top', 'right', 3, 'El crédito ya tiene ese tipo de cartera.');
            return;
        }

        let path = this.formCartera.get('newCartera').value.cveGeneral + "/" + this.formCartera.get('referencia').value;

        this.blockUI.start('Procesando petición...');
        this.service.actualizar(path, '', 'spuClasificacionCredito').subscribe(response => {
            this.blockUI.stop();
            if (response[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, response[0][1]);
            } else {
                this.service.showNotification('top', 'right', 3, response[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


    }



    /** Lista de validaciones*/
    validacion_msj = {
        'newCartera': [
            { type: 'required', message: 'Campo requerido.' }
        ]

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


}