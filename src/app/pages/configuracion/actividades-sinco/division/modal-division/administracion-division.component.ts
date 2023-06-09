import { Component, Inject, OnInit } from "@angular/core"
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { GestionGenericaService } from "../../../../../shared/service/gestion"
import { BlockUI, NgBlockUI } from "ng-block-ui"


/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 30/09/2021
* @descripcion: Componente para la gestion de division
*/
@Component({
    selector: 'administracion-division',
    moduleId: module.id,
    templateUrl: 'administracion-division.component.html'
})

export class AdministracionDivisionComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'División';
    encabezado: string;
    accion: number;
    listaClasificacion: any;
    formDivision: UntypedFormGroup;
    divisionId: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones Formulario
        this.formDivision = this.formBuilder.group(
            {
                cveDiv: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(1)]),
                descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
                clasificacion: new UntypedFormControl('', [Validators.required]),
                estatus: new UntypedFormControl(true),
            })
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        //Actualizar
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.divisionId = data.division.divisionId;
            this.formDivision.get('descripcion').setValue(data.division.descripcion);
            this.formDivision.get('cveDiv').setValue(data.division.cveDivision);
            this.formDivision.get('estatus').setValue(data.division.estatus);
            this.formDivision.get('clasificacion').setValue(data.division.clasificacion.generalesId);
        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsClasificacion();
    }
    /**
    * Lista las clasificaciones categoria 05CS
    */
    spsClasificacion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('05CS', 'listaGeneralCategoria').subscribe(data => {
            this.blockUI.stop();
            this.listaClasificacion = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
       * Metodo para guardar los datos de division
       */
    guardarDivision() {
        if (this.formDivision.invalid) {
            this.validateAllFormFields(this.formDivision);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "divisionId": '0',
            "cveDivision": this.formDivision.get('cveDiv').value,
            "descripcion": this.formDivision.get('descripcion').value,
            "estatus": this.formDivision.get('estatus').value,
            "clasificacion": {
                "generalesId": this.formDivision.get('clasificacion').value
            },

        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudDivision').subscribe(resultado => {
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
          * Metodo para actualizar los datos de division
          */
    actualizarDivision() {
        if (this.formDivision.invalid) {
            this.validateAllFormFields(this.formDivision);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "divisionId": this.divisionId,
            "cveDivision": this.formDivision.get('cveDiv').value,
            "descripcion": this.formDivision.get('descripcion').value,
            "estatus": this.formDivision.get('estatus').value,
            "clasificacion": {
                "generalesId": this.formDivision.get('clasificacion').value
            }
        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudDivision').subscribe(resultado => {
            this.blockUI.start('Actalizando ...');
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
     * Limpiar el formulario formDivision al guardar
     */
    limpiarCampos() {
        this.formDivision.get('descripcion').setValue('');
        this.formDivision.get('cveDiv').setValue('');
        this.formDivision.get('clasificacion').setValue('');
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
        'cveDiv': [
            { type: 'required', message: 'Clave División requerida.' },
            { type: 'pattern', message: 'Solo números.' },
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' }
        ],
        'clasificacion': [
            { type: 'required', message: 'Clasificación requerida.' }
        ]

    }

}