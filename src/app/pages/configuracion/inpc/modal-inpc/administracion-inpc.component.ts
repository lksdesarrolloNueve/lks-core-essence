import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'administracion-inpc',
    moduleId: module.id,
    templateUrl: 'administracion-inpc.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 06/10/2021
 * @descripcion: Componente para la Administracion de INPC
 */
export class AdministracionInpcComponent implements OnInit {

    //Declaracion de variables y constantes
    titulo: String;
    accion: number;
    inpcId: number = 0;
    formINPC: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;



    /**
     * Validacion para los campos
     */
    validaciones = {
        'cvinpc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 4.' },
        ],
        'fecha': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'inpcD': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo cantidades numéricas.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }

    /**
     * Constructor para la clase INPC
     * @param service -- Servoce para el acceso de datos
     */

    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.titulo = data.titulo + ' INPC';
        this.accion = data.accion;

        this.formINPC = this.formBuilder.group({
            cvinpc: new UntypedFormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9]{1,4}'), Validators.maxLength(4)]),
            fecha: new UntypedFormControl('', [Validators.required]),
            inpcD: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]),
            estatus: new UntypedFormControl(true)
        });

        if (this.accion === 2) {
            this.inpcId = data.inpc.inpcid;
            this.formINPC.get('cvinpc').setValue(data.inpc.cvinpc);
            let fecha = data.inpc.fecha.replaceAll('-','/');
            this.formINPC.get('fecha').setValue(new Date(fecha));
            this.formINPC.get('inpcD').setValue(data.inpc.inpcD);
            this.formINPC.get('estatus').setValue(data.inpc.estatus);
        }
    }

    /**
     * Metodo OnInit de la clase INPC
     */
    ngOnInit() {

        // this.spslistaInpc();
    }



    /**
* Metodo que guarda y edita el INPC
*/

    crudINPC() {
        if (this.formINPC.invalid) {
            this.validateAllFormFields(this.formINPC)
           // this.service.showNotification('top', 'right', 3, 'Completa los campos del formulario')
            return;
        }

        /**
         * llenado de datos al momento de consultar por ID
         */
        const data = {
            "cvinpc": this.formINPC.get('cvinpc').value,
            "inpcid": this.inpcId,
            "fecha": this.formINPC.get('fecha').value,
            "inpcD": this.formINPC.get('inpcD').value,
            "estatus": this.formINPC.get('estatus').value
        };

    
        if (this.accion === 2) {
            this.blockUI.start('Editando...');
           
        } else {
            this.blockUI.start('Guardando...');
        }
        this.service.registrarBYID(data, this.accion, 'crudINPC').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    if(this.accion !== 2){
                        this.formINPC.reset();
                    }

                    
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {

                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.message)


            }
        );

    }


    /**
         * Valida Cada atributo del formulario
         * @param formGroup - Recibe cualquier tipo de FormGroup
         */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);             //{3}
            if (control instanceof UntypedFormControl) {             //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
            }
        });
    }
}