import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ThemePalette } from "@angular/material/core";




@Component({
    selector: 'administracion-fondos',
    moduleId: module.id,
    templateUrl: 'administracion-fondos.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 13/Enero/2021
 * @descripcion: AdministracionComponente para la gestion de fondos
 */

export class AdministracionFondos  {

    //Declaracion de variables
    titulo = 'Fondos';
    encabezado: string;
    accion: number;

    color: ThemePalette = 'primary';
    formTipoFondos: UntypedFormGroup;
    tipofondoid: number = 0;
    @BlockUI() blockUI: NgBlockUI;//loader

    validacionesFondo = {
        'descripcion':[
            { type: 'required', message:  'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño máximo es de 250 caracteres.' },
        ],
        'montolimite':[
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'El campo solo acepta números enteros.' }
        ]
    }

    /**
* constructor de la clase tipo plazo
* @param service - service para el acceso de datos
*/
    constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formTipoFondos = this.formbuilder.group({
            descripcion: new UntypedFormControl('',[Validators.required, Validators.maxLength(250)]),
            montolimite: new UntypedFormControl('',  [Validators.required, Validators.pattern('[0-9]*')]),
            estatus: new UntypedFormControl(true),
            cvetfondo : new UntypedFormControl('')

        });

        if (this.accion === 2) {
            this.tipofondoid = data.fondo.tipofondoid
            this.formTipoFondos.get('descripcion').setValue(data.fondo.descripcion)
            this.formTipoFondos.get('montolimite').setValue(data.fondo.montolimite)
            this.formTipoFondos.get('estatus').setValue(data.fondo.estatus)
            this.formTipoFondos.get('cvetfondo').setValue(data.fondo.cvetfondo)
  
        }
    }

   

    /**
     * Metodo que sirve para registrar fondos.
     * @returns Notificación de resultados.
     */
    guardarFondo() {
         
        if (this.formTipoFondos.invalid) {
            this.validateAllFormFields(this.formTipoFondos);
            return;
        }
        this.blockUI.start('Guardando ...');
        const data = {
            "tipofondoid": 0,
            "descripcion": this.formTipoFondos.get('descripcion').value,
            "montolimite": this.formTipoFondos.get('montolimite').value,
            "estatus": this.formTipoFondos.get('estatus').value

        };

        this.service.registrarBYID(data, 1, 'crudTipoFondos').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formTipoFondos.reset();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        )

    }

    /**
     * Método que sirve para editar fondos.
     * @returns Notificación de resultados
     */
    editarFondos() {

        if (this.formTipoFondos.invalid) {
            this.validateAllFormFields(this.formTipoFondos);
            return;
        }

        this.blockUI.start('Editando...');
        const data = {
            "tipofondoid": this.tipofondoid,
            "descripcion": this.formTipoFondos.get('descripcion').value,
            "montolimite": this.formTipoFondos.get('montolimite').value,
            "estatus": this.formTipoFondos.get('estatus').value

        };

        this.service.registrarBYID(data, 2, 'crudTipoFondos').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        )

    }
/*
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