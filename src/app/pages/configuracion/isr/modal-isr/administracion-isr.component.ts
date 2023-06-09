import { Component, inject, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";

/**
* @autor: Luis Rolando Guerrero Calzada
* @version: 1.0.0
* @fecha: 06/10/2021
* @descripcion: Componente para la gestion de isr
*/
@Component({
    selector: 'administracion-isr',
    moduleId: module.id,
    templateUrl: 'administracion-isr.component.html'
})

export class AdministracionIsrComponent implements OnInit {

    //Declaracion de variables y constantes
    titulo: string;
    accion: number;
    formISR: UntypedFormGroup;
    isrID: number = 0;
    @BlockUI() blockUI: NgBlockUI;

    //validacion de campos
    validaciones = {
        'cve_isr': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 4.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'fecha': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'salarios_min': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' }
        ],
        'dias_elevo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' }

        ],
        'valor_uma': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números decimales.' }

        ],
        'excento': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números decimales.' }

        ],
        'tasa': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números decimales.' }

        ],

    }

    /**
    * constructor de la clase ISR
    * @param service - service para el acceso de datos
    */
    constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.titulo = data.titulo + " ISR";
        this.accion = data.accion;

        this.formISR = this.formbuilder.group({
            cve_isr: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            estatus: new UntypedFormControl(true),
            fecha: new UntypedFormControl('', [Validators.required]),
            salarios_min: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            dias_elevo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            valor_uma: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            excento: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]),
            tasa: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]),
        });

        if (this.accion === 2) {
            this.isrID = data.isr.isrID
            this.formISR.get('cve_isr').setValue(data.isr.cveIsr)
            this.formISR.get('estatus').setValue(data.isr.estatus)
            this.formISR.get('fecha').setValue(data.isr.fecha)
            this.formISR.get('salarios_min').setValue(data.isr.salarioMin)
            this.formISR.get('dias_elevo').setValue(data.isr.diasElevo)
            this.formISR.get('valor_uma').setValue(data.isr.valorUma)
            this.formISR.get('excento').setValue(data.isr.excento)
            this.formISR.get('tasa').setValue(data.isr.tasa)

        }
    }


    ngOnInit() { }

    /**
     * Metodo que guarda y edita ISR
     * 
     */
    crudISR(form: any) {

        if (this.formISR.invalid) {
            this.validateAllFormFields(this.formISR);
            return;
        }

        const data = {
            isrID: this.isrID,
            cveIsr: form.cve_isr,
            estatus: form.estatus,
            fecha: form.fecha,
            salarioMin: form.salarios_min,
            diasElevo: form.dias_elevo,
            valorUma: form.valor_uma,
            excento: form.excento,
            tasa: form.tasa
        }

        if (this.accion === 2) {
            this.blockUI.start('Editando ...')
        } else {
            this.blockUI.start('Guardando ...')
        }


        this.service.registrarBYID(data, this.accion, 'crudISR')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (this.accion !== 2) {
                        this.formISR.reset();
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            })
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