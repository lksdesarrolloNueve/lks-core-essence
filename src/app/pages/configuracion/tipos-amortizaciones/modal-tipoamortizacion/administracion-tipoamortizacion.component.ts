import { Component, Inject, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";



/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 17/09/2021
 * @descripcion: Componente para la gestion de tipos amortizaciones
 */
@Component({
    selector: 'administracion-tipoamortizacion',
    moduleId: module.id,
    templateUrl: 'administracion-tipoamortizacion.component.html'
})

export class AdminTipoAmortizacionComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Tipo Amortizacion';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';
    formTipoAmortizacion: UntypedFormGroup;

    tipoamortizacionid: number;
    @BlockUI() blockUI: NgBlockUI;


    /**
         * Constructor del componente tipo amortizacion
         * @param data -- Componente para crear diálogos modales en Angular Material 
         * @param service  -- Instancia de acceso a datos
         */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        //validacion de campos requeridos
        this.formTipoAmortizacion = this.formBuilder.group({
            clave: new UntypedFormControl('', [Validators.required, Validators.maxLength(2)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            estatus: new UntypedFormControl('true')
        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.tipoamortizacionid = data.tipoamortizacion.tipoamortizacionId;
            this.formTipoAmortizacion.get('clave').setValue(data.tipoamortizacion.clave);
            this.formTipoAmortizacion.get('descripcion').setValue(data.tipoamortizacion.descripcion);
            this.formTipoAmortizacion.get('estatus').setValue(data.tipoamortizacion.estatus);
        }
    }


    /**
     * metodo ngOnInit de la clase 
     */
    ngOnInit() {
    }


    /**
     * Metodo para guardar tipos amortizaciones.
     * @returns notificacion de resultado
     */
    guardartipoamort() {
        if (this.formTipoAmortizacion.invalid) {
            this.validateAllFormFields(this.formTipoAmortizacion);
            return;

        }
        const data = {
            "tipoamortizacionId": 0,
            "descripcion": this.formTipoAmortizacion.get('descripcion').value,
            "estatus": this.formTipoAmortizacion.get('estatus').value,
            "clave":this.formTipoAmortizacion.get('clave').value
        };
        this.blockUI.start('Guardando ...');
        this.service.registrarBYID(data, 1, 'crudTipoAmortizacion').subscribe(
            result => {
                if (result[0][0] === '0') {
                    //se manada llamar el metodo limpiar 
                    this.formTipoAmortizacion.reset();
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
     * Metodo para editar informacion de tipos amortizaciones.
     */
    EditarTipoAmort() {
        if (this.formTipoAmortizacion.invalid) {
            this.validateAllFormFields(this.formTipoAmortizacion);
            return;

        }

        //se setean los datos en el array
        const data = {
            "tipoamortizacionId": this.tipoamortizacionid,
            "descripcion": this.formTipoAmortizacion.get('descripcion').value,
            "estatus": this.formTipoAmortizacion.get('estatus').value,
            "clave":this.formTipoAmortizacion.get('clave').value
        };
        this.blockUI.start('Editando ...');
        //se manda llamar el metodo registrarBYID para actualizar
       this.service.registrarBYID(data, 2, 'crudTipoAmortizacion').subscribe(
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
        'clave':[{type:'required',message:'Campo requerido.'},
                 { type: 'maxlength', message: 'Campo máximo 2 caracteres.' }],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 250 caracteres.' }
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

