import { Component, Inject, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";



/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 13/09/2021
 * @descripcion: Componente para la gestion de finalidades creditos
 */
@Component({
    selector: 'administracion-finalidadcredito',
    moduleId: module.id,
    templateUrl: 'administracion-finalidadcredito.component.html'
})

export class AdminFinalidadCreditoComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Finalidad Credito';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';
    descripcion = new UntypedFormControl();
    clavefinalidad = new UntypedFormControl();
    isChecked = true;
    finalidadid: number;
    formFinalidadCred: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;


    /**
         * Constructor del componente Finalidades
         * @param data -- Componente para crear diálogos modales en Angular Material 
         * @param service  -- Instancia de acceso a datos
         */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        //validacion de campos requeridos
        this.formFinalidadCred = this.formBuilder.group({
            clavefinalidad: new UntypedFormControl('', [Validators.required, Validators.maxLength(5)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            estatus: new UntypedFormControl('true')
        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.finalidadid = data.finalidadcre.finalidadId;
            this.formFinalidadCred.get('clavefinalidad').setValue(data.finalidadcre.cveFinalidad);
            this.formFinalidadCred.get('descripcion').setValue(data.finalidadcre.descripcion);
            this.formFinalidadCred.get('estatus').setValue(data.finalidadcre.estatus)
        }
    }

    /**
     * metodo ngOnInit de la clase 
     */
    ngOnInit() {
    }

    /**
     * Método para limpiar los campos.
     */
    limpiarCampos() {
        this.clavefinalidad.setValue(null);
        this.descripcion.setValue(null);
        this.isChecked = true;
    };

    /**
     * Metodo para guardar Finalidades creditos.
     * @returns notificacion de resultado
     */
    guardarfinalidad() {
        if (this.formFinalidadCred.invalid) {
            this.validateAllFormFields(this.formFinalidadCred);
            return;

        }
        const data = {
            "finalidadId": 0,
            "cveFinalidad": this.formFinalidadCred.get('clavefinalidad').value,
            "descripcion":  this.formFinalidadCred.get('descripcion').value,
            "estatus": this.formFinalidadCred.get('estatus').value
        };
        this.blockUI.start('Guardando ...');
        this.service.registrarBYID(data, 1, 'crudFinalidadCredito').subscribe(
            result => {
                if (result[0][0] === '0') {
                    //se manada llamar el metodo limpiar 
                    this.limpiarCampos();
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * Metodo para editar informacion de finalidades creditos.
     */
    Editarfinalidad() {
        if (this.formFinalidadCred.invalid) {
            this.validateAllFormFields(this.formFinalidadCred);
            return;

        }

        //se setean los datos en el array
        const data = {
            "finalidadId": this.finalidadid,
            "cveFinalidad": this.formFinalidadCred.get('clavefinalidad').value,
            "descripcion":  this.formFinalidadCred.get('descripcion').value,
            "estatus": this.formFinalidadCred.get('estatus').value
        };
        this.blockUI.start('Editando ...');
        //se manda llamar el metodo registrarBYID para actualizar
        this.service.registrarBYID(data, 2, 'crudFinalidadCredito').subscribe(
            result => {
                //se detiene el loader
                this.blockUI.stop();
                if (result[0][0] === '0') {//exito
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {//error
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }
        /** 
         * Validaciones de los campos del formulario.
         * Se crean los mensajes de validación.
        */
         validaciones = {
            'clavefinalidad': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'maxlength', message: 'Campo maximo 5 caracteres.' }
            ],
            'descripcion': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'maxlength', message: 'Campo maximo 250 caracteres.' }
            ],
          
        };

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

