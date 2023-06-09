import { Component, Inject, OnInit } from "@angular/core";
import { ThemePalette } from "@angular/material/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";


@Component({
    selector: 'administracion-calidadextranjeros',
    moduleId: module.id,
    templateUrl: 'administracion-calidadextranjero.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 09/09/2021
 * @descripcion: Componente para la gestion de calidades extranjeros
 */

export class AdminCalidadExtranjeroComponent implements OnInit {
    titulo = 'Calidad Extranjero';
    encabezado: string;
    accion: number;

    color: ThemePalette = 'primary';

    formCalidadExtranjero: UntypedFormGroup;
  
    isChecked = true;
    calidadid : number;


    /**
     * 
     * @param service service para el acceso de datos 
     */
     constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

           //validacion de campos requeridos
           this.formCalidadExtranjero = this.formBuilder.group({
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            estatus: new UntypedFormControl('true')
        });

        if(this.accion === 2){
            this.calidadid = data.extranjero.calidadid;
            this.formCalidadExtranjero.get('descripcion').setValue(data.extranjero.descripcion);
            this.formCalidadExtranjero.get('estatus').setValue(data.extranjero.estatus);
        }
    }


    /**
     * metodo ngOnInit de la clase 
     */
    ngOnInit() {
    }

    guardarcalidad() {
        if (this.formCalidadExtranjero.invalid) {
            this.validateAllFormFields(this.formCalidadExtranjero);
            return;

        }
      
        const data = {
            "calidadid": 0,
            "descripcion":  this.formCalidadExtranjero.get('descripcion').value,
            "estatus": this.formCalidadExtranjero.get('estatus').value
        };
        this.service.registrarBYID(data, 1, 'crudCalidadesExtranjeros').subscribe(
            result => {
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.service.showNotification('top', 'right', 4, error.error+'<br>'+error.trace);
            }
        );

    }

    Editarcalidad() {
        if (this.formCalidadExtranjero.invalid) {
            this.validateAllFormFields(this.formCalidadExtranjero);
            return;

        }
      
        const data = {
            "calidadid":this.calidadid,
            "descripcion":  this.formCalidadExtranjero.get('descripcion').value,
            "estatus": this.formCalidadExtranjero.get('estatus').value
        };
        this.service.registrarBYID(data, 2, 'crudCalidadesExtranjeros').subscribe(
            result => {
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.service.showNotification('top', 'right', 4, error.error+'<br>'+error.trace);
            }
        );

    }

        /** 
         * Validaciones de los campos del formulario.
         * Se crean los mensajes de validación.
        */
         validaciones = {
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

