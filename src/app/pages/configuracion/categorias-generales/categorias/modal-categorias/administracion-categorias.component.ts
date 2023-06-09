import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 17/09/2021
* @descripcion: Componente para la gestion de categorias
*/
@Component({
    selector: 'administracion-categorias',
    moduleId: module.id,
    templateUrl: 'administracion-categorias.component.html'
})

export class AdministracionCategoriasComponent{
    //Declaracion de variables y componentes
    titulo = 'Categoria';
    encabezado: string;
    accion: number;
    today = new Date();
    formCategoria: UntypedFormGroup;

    categoriaId: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {

        //Validaciones Formulario
        this.formCategoria = this.formBuilder.group({
            estatus: new UntypedFormControl('true'),
            descripcion: new UntypedFormControl('',Validators.required),
            fecha: new UntypedFormControl({ value: this.today.toLocaleDateString(), disabled: true }),
            clave: new UntypedFormControl('', [Validators.required, Validators.minLength(4),Validators.pattern("^([0-9]{2,2})+([a-zA-Z]{2,2})+$")])
        });
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.categoriaId = data.categoria.categoriaId;
            this.formCategoria.get('clave').setValue(data.categoria.cveCategoria);
            this.formCategoria.get('descripcion').setValue(data.categoria.descripcion);
            this.formCategoria.get('fecha').setValue(data.categoria.fechaAlta);
            this.formCategoria.get('estatus').setValue(data.categoria.estatus);
        }
    }

    /**
     * Metodo para limpiar los campos a guardar.
     */
    limpiarCampos() {
        this.categoriaId = 0;
        this.formCategoria.get('clave').setValue('');
        this.formCategoria.get('descripcion').setValue('');
    }

    /**
         * Metodo para guardar los datos de garantias
         */
    guardarCategoria() {
        //Se valida que no esten vacios los datos    
        if (this.formCategoria.invalid) {
            this.validateAllFormFields(this.formCategoria);
            this.service.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }

        //areglo que contiene los datos a guardar
        const data = {
            "categoriaId": 0,
            "fecha": this.formCategoria.get('fecha').value,
            "cveCategoria": this.formCategoria.get('clave').value,
            "descripcion": this.formCategoria.get('descripcion').value,
            "estatus": this.formCategoria.get('estatus').value
        };

        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudCategoria').subscribe(resultado => {
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
         * Metodo para actualizar los datos de garantia
         */
    actualizarCategoria() {
        //Se valida que no esten vacios los datos
        if (this.formCategoria.invalid) {
            this.validateAllFormFields(this.formCategoria);
            this.service.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "categoriaId": this.categoriaId,
            "fecha": this.formCategoria.get('fecha').value,
            "cveCategoria": this.formCategoria.get('clave').value,
            "descripcion": this.formCategoria.get('descripcion').value,
            "estatus": this.formCategoria.get('estatus').value
        };

        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudCategoria').subscribe(resultado => {
            this.blockUI.start('Actualizando ...');
            if (resultado[0][0] === '0') {//exito
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
        'clave': [
            { type: 'required', message: ' Clave categoría requerida.' },
            { type: 'pattern', message: 'Dos números,Dos letras; Ejemplo: 03JA' },
            { type: 'minLength', message: 'Minímo 4 carácteres.' }
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' }
        ]
    }
}