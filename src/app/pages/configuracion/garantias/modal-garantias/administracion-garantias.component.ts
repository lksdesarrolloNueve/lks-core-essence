import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 14/09/2021
* @descripcion: Componente para la gestion de gartantias
*/
@Component({
    selector: 'administracion-garantias',
    moduleId: module.id,
    templateUrl: 'administracion-garantias.component.html'
})

export class AdministracionGarantiasComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Garantía';
    encabezado: string;
    accion: number;
    formGarantia: UntypedFormGroup;
    listaGarantia: any;



    //Fin variables Chips formatos

    garantiaId: number =0;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente garantias
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, 
        @Inject(MAT_DIALOG_DATA) public data: any) {

        //Validaciones Formulario
        this.formGarantia = this.formBuilder.group({
            estatus: new UntypedFormControl('true'),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(200)]),
            cveGarantia: new UntypedFormControl('', [Validators.required, Validators.maxLength(5), Validators.minLength(2), Validators.pattern("^[a-zA-Z]+$")])
        });
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.garantiaId = data.garantia.garantiaId;
            this.formGarantia.get('descripcion').setValue(data.garantia.descripcion);
            this.formGarantia.get('cveGarantia').setValue(data.garantia.cveGarantia.trim());
            this.formGarantia.get('estatus').setValue(data.garantia.estatus);
        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsGarantias();
    }

    /**
     * Metodo para limpiar los campos a guardar.
     */
    limpiarCampos() {
        this.garantiaId = 0;
        this.formGarantia.get('descripcion').setValue('');
        this.formGarantia.get('cveGarantia').setValue('');
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




     /**
     * Metodo para listar los tipos de documentos y poder llamarlo dentro del combo 
     * en el modal principal.
     * @param general
     */
    spsGarantias() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaGarantia').subscribe(data => {
            this.blockUI.stop();
            this.listaGarantia = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

   

 /**
     * Metodo que guarda y edita tipo Documento
     */
  guardarGarantia(): void {
    /**
     * Validacion complementaria para la validacion de guardado de datos en el formulario formTipoDocumento
     */
    if (this.formGarantia.invalid) {
        this.validateAllFormFields(this.formGarantia);
        return;
    }


    this.blockUI.start('Guardando ...');
    /**
     * Se estructura y se setean los datos al JSON 
     */
    const data = {
        "garantiaId": 0,
        "cveGarantia": this.formGarantia.get('cveGarantia').value,
        "descripcion": this.formGarantia.get('descripcion').value,
        "estatus": this.formGarantia.get('estatus').value

    }
 
    this.service.registrarBYID(data, 1, 'crudGarantia').subscribe(
        result => {
            this.blockUI.stop();
            if (result[0][0] === '0') {
                this.spsGarantias();
                this.formGarantia.reset();
                this.service.showNotification('top', 'right', 2, result[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1])
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message)
        }
    )

}

/**
    * Metodo que guarda y edita tipo Documento
    */
 actualizarGarantia(elemento: any): void {

    /**
     * Validacion complementaria para la validacion de guardado de datos en el formulario formTipoDocumento
     */

    if (this.formGarantia.invalid) {
        this.validateAllFormFields(this.formGarantia);
        return;
    }
  
    this.blockUI.start('Editando ...');
    /**
     * Se estructura y se setean los datos al JSON 
     */
    const data = {
        "garantiaId": this.garantiaId,
        "cveGarantia": this.formGarantia.get('cveGarantia').value,
        "descripcion": this.formGarantia.get('descripcion').value,
        "estatus": this.formGarantia.get('estatus').value

    }

    this.service.registrarBYID(data, 2, 'crudGarantia').subscribe(
        result => {
            this.blockUI.stop();
            if (result[0][0] === '0') {
                this.spsGarantias();
                this.service.showNotification('top', 'right', 2, result[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1])
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message)
        }
    )

}

    //Arreglo de mensajes a mostrar al validar formulario
    validaciones = {
        'cveGarantia': [
            { type: 'required', message: ' Clave garantía requerida, minímo 2 carácteres.' },
            { type: 'pattern', message: 'Solo letras de máximo 5 carácteres, minímo 2.' },
            { type: 'minLength', message: 'Minímo 2 carácteres.' }
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' }
        ]
       
    }
}