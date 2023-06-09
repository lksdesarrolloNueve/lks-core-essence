import { Component, Inject, OnInit } from "@angular/core";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'administracion-nacionalidades',
    moduleId: module.id,
    templateUrl: 'administracion-nacionalidades.component.html'
})

export class AdministracionNacionalidadesComponent implements OnInit {
    //Declaracion de variables
    titulo = 'Nacionalidad';
    encabezado: string;
    accion: number;
    formNacionalidad: UntypedFormGroup;
    nacionid: number;
    @BlockUI() blockUI: NgBlockUI;//loader

    /**
         * Constructor del componente nacionalidades
         * @param service 
         */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones Formulario
        this.formNacionalidad = this.formBuilder.group({
            nacion: new UntypedFormControl('', Validators.required),
            pais: new UntypedFormControl('', Validators.required),
            cvesit: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(5)]),
            tipo: new UntypedFormControl('', [Validators.pattern("^[0-9]*$"), Validators.maxLength(5)]),
            codigopld: new UntypedFormControl('', [Validators.required, Validators.minLength(2), Validators.pattern("^[a-zA-Z]+$")]),
            estatus: new UntypedFormControl('true')
        });
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.nacionid = data.nacionalidad.nacionalidadid;
            this.formNacionalidad.get('nacion').setValue(data.nacionalidad.nacion);
            this.formNacionalidad.get('pais').setValue(data.nacionalidad.pais);
            this.formNacionalidad.get('cvesit').setValue(data.nacionalidad.clavesit);
            this.formNacionalidad.get('tipo').setValue(data.nacionalidad.tipo);
            this.formNacionalidad.get('codigopld').setValue(data.nacionalidad.clavesit);
            this.formNacionalidad.get('estatus').setValue(data.nacionalidad.estatus);
        }
    }
    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

    }
    /**
     * Metodo para guardar los datos de nacionalidad
     */
    guardarNacionalidad() {
        if (this.formNacionalidad.invalid) {
            this.validateAllFormFields(this.formNacionalidad);
            return;
        }
        var tipo;
        //se valida campo tipo si no se captura se pasa valor 0 
        if (this.formNacionalidad.get('tipo').value === 0 || this.formNacionalidad.get('tipo').value < 0 || this.formNacionalidad.get('tipo').value === null) {
            tipo = 0;
        } else {//se toma el valor ingresado  y se valida la longitud
            tipo = this.formNacionalidad.get('tipo').value;
        }

        //areglo que contiene los datos a guardar
        const data = {
            "nacionalidadid": '0',
            "nacion": this.formNacionalidad.get('nacion').value,
            "pais": this.formNacionalidad.get('pais').value,
            "clavesit": this.formNacionalidad.get('cvesit').value,
            "tipo": tipo,
            "codigopld": this.formNacionalidad.get('codigopld').value,
            "estatus": this.formNacionalidad.get('estatus').value
        };
        //uso del metodo para guardar en base de datos
        this.service.registrarBYID(data, 1, 'crudCatNacionalidad').subscribe(resultado => {
            this.blockUI.start('Guardando ...');
            if (resultado[0][0] === '0') {//exito
                //Uso de metodo limpiarCampos para volver a guardar
                this.limpiarCampos();
                //Se cierra el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error    
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para actualizar los datos de nacionalidad
     */
    actualizarNacionalidad() {
        if (this.formNacionalidad.invalid) {
            this.validateAllFormFields(this.formNacionalidad);
            return;
        }
        var tipo;
        //se valida campo tipo si no se captura se pasa valor 0 
        if (this.formNacionalidad.get('tipo').value === 0 || this.formNacionalidad.get('tipo').value < 0 || this.formNacionalidad.get('tipo').value === null) {
            tipo = 0;
        } else {//se toma el valor ingresado  y se valida la longitud
            tipo = this.formNacionalidad.get('tipo').value;
        }

        //areglo que contiene los datos actualizar
        const data = {
            "nacionalidadid": this.nacionid,
            "nacion": this.formNacionalidad.get('nacion').value,
            "pais": this.formNacionalidad.get('pais').value,
            "clavesit": this.formNacionalidad.get('cvesit').value,
            "tipo": tipo,
            "codigopld": this.formNacionalidad.get('codigopld').value,
            "estatus": this.formNacionalidad.get('estatus').value
        };
        //se manda llamar el metodo
        this.blockUI.start('Actualizando ...');
        this.service.registrarBYID(data, 2, 'crudCatNacionalidad').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito  
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error   
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo limpiarCampos
     * Vacia los campos cada vez  que se guarda una Nacionalidad
     */
    limpiarCampos() {
        this.formNacionalidad.get('nacion').setValue('');
        this.formNacionalidad.get('pais').setValue('');
        this.formNacionalidad.get('cvesit').setValue('');
        this.formNacionalidad.get('tipo').setValue('');
        this.formNacionalidad.get('codigopld').setValue('');
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

 
      //Arreglo de mensajes a mostrar al validar formulario
      validaciones = {
        'cvesit': [
            { type: 'required', message: ' Clave SIT requerida.' },
            { type: 'pattern', message: 'Solo números máximo 5 dígitos.' },
        ],
        'nacion': [
            { type: 'required', message: 'Descripción requerida.' }
        ],
        'pais': [
            { type: 'required', message: 'Nombre país requerido.' }
        ],
        'tipo': [
            { type: 'maxLength', message: 'Máximo 5 dígitos.' },
            { type: 'pattern', message: 'Solo números máximo 5 dígitos' }
        ],
        'codigopld': [
            { type: 'required', message: 'Código PLD requerido.' },
            { type: 'pattern', message: 'Solo letras de 2 carácteres.' },
            { type: 'minLength', message: 'Mínimo 2 carácteres.' },
        ]
       
    }
}

