import { Component, Inject, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";



/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 21/09/2021
 * @descripcion: Componente para la gestion de dias inhabiles
 */
 @Component({
    selector: 'administracion-diainhabil',
    moduleId: module.id,
    templateUrl: 'administracion-diainhabil.component.html'
})

export class AdminDiaInhabilComponent implements OnInit {
     //Declaracion de variables y componentes
    titulo = 'Dia Inhabil';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';



    formDiaInhabil: UntypedFormGroup;
    diaid: number;

    @BlockUI() blockUI: NgBlockUI;


    /**
         * Constructor del componente dia inhabil
         * @param data -- Componente para crear diálogos modales en Angular Material 
         * @param service  -- Instancia de acceso a datos
         */
     constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

         //validacion de campos requeridos
         this.formDiaInhabil= this.formBuilder.group({
            fecha: new UntypedFormControl('', [Validators.required]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            estatus: new UntypedFormControl('true'),
            aplinver: new UntypedFormControl(false),
            aplicred: new UntypedFormControl(false),
        });

        //Si la accion es 2 seteamos los datos para editar
        if(this.accion === 2){
            this.diaid = data.diainhabil.diainhabilid;
            this.formDiaInhabil.get('fecha').setValue(data.diainhabil.fecha);
            this.formDiaInhabil.get('descripcion').setValue(data.diainhabil.descripcion);
            this.formDiaInhabil.get('aplinver').setValue(data.diainhabil.apliinversion)
            this.formDiaInhabil.get('aplicred').setValue(data.diainhabil.aplicredito)
            this.formDiaInhabil.get('estatus').setValue(data.diainhabil.estatus)
        }
    }


    /**
     * metodo ngOnInit de la clase 
     */
    ngOnInit() {
    }

    /**
     * Metodo para guardar dias inhabiles.
     * @returns notificacion de resultado
     */
    guardardia() {
        if (this.formDiaInhabil.invalid) {
            this.validateAllFormFields(this.formDiaInhabil);
            return;

        }
 
        const data = {
            "diainhabilid": 0,
            "fecha": this.formDiaInhabil.get('fecha').value,
            "descripcion":  this.formDiaInhabil.get('descripcion').value,
            "apliinversion": this.formDiaInhabil.get('aplinver').value,
            "aplicredito": this.formDiaInhabil.get('aplicred').value,
            "estatus": this.formDiaInhabil.get('estatus').value
        };

        this.blockUI.start('Guardando ...');
        this.service.registrarBYID(data, 1, 'crudDiaInhabil').subscribe(
            result => {
                if (result[0][0] === '0') {
                         //se manada llamar el metodo limpiar 
                         this.formDiaInhabil.reset();
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
                this.service.showNotification('top', 'right', 4, error.error+'<br>'+error.trace);
            }
        );

    }

    /**
     * Metodo para editar informacion de tipos amortizaciones.
     */
    EditarDia() {
        if (this.formDiaInhabil.invalid) {
            this.validateAllFormFields(this.formDiaInhabil);
            return;

        }

        //se setean los datos en el array
        const data = {
            "diainhabilid": this.diaid,
            "fecha": this.formDiaInhabil.get('fecha').value,
            "descripcion":  this.formDiaInhabil.get('descripcion').value,
            "apliinversion": this.formDiaInhabil.get('aplinver').value,
            "aplicredito": this.formDiaInhabil.get('aplicred').value,
            "estatus": this.formDiaInhabil.get('estatus').value
        };
        this.blockUI.start('Editando ...');
        //se manda llamar el metodo registrarBYID para actualizar
        this.service.registrarBYID(data, 2, 'crudDiaInhabil').subscribe(
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
                this.service.showNotification('top', 'right', 4, error.error+'<br>'+error.trace);
            }
        );

    }
     /** 
         * Validaciones de los campos del formulario.
         * Se crean los mensajes de validación.
        */
      validaciones = {
        'fecha': [
            { type: 'required', message: 'Campo requerido, selecciona una fecha' },
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

