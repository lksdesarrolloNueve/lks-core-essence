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
    selector: 'administracion-principal',
    moduleId: module.id,
    templateUrl: 'administracion-principal.component.html'
})

export class AdministracionPrincipalComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Grupo Principal';
    encabezado: string;
    accion: number;
    listaDivision: any;
    formPrincipal: UntypedFormGroup;
    isChecked = true;
    principalId: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones del formulario 
        this.formPrincipal = this.formBuilder.group(
            {
                cvePrincipal: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(2)]),
                descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
                division: new UntypedFormControl('', [Validators.required]),
                estatus: new UntypedFormControl(true),
            })
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        //Actualizar
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.principalId = data.grupo.grupoId;
            this.formPrincipal.get('descripcion').setValue(data.grupo.descripcion);
            this.formPrincipal.get('cvePrincipal').setValue(data.grupo.cveGrupo);
            this.formPrincipal.get('estatus').setValue(data.grupo.estatus);
            this.formPrincipal.get('division').setValue(data.grupo.division.divisionId);
        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsDivision();
    }

    /**
     * Lista las divisiones activas
     */
    spsDivision() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaDivision').subscribe(data => {
            this.blockUI.stop();
            this.listaDivision = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
       * Metodo para guardar los datos de grupo principal
       */
    guardarGrupo() {
        if (this.formPrincipal.invalid) {
            this.validateAllFormFields(this.formPrincipal);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "grupoId": '0',
            "cveGrupo": this.formPrincipal.get('cvePrincipal').value,
            "descripcion": this.formPrincipal.get('descripcion').value,
            "estatus": this.formPrincipal.get('estatus').value,
            "division": {
                "divisionId": this.formPrincipal.get('division').value
            },

        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudGrupo').subscribe(resultado => {
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
          * Metodo para actualizar los datos de grupo principal
          */
    actualizarGrupo() {
        if (this.formPrincipal.invalid) {
            this.validateAllFormFields(this.formPrincipal);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "grupoId": this.principalId,
            "cveGrupo": this.formPrincipal.get('cvePrincipal').value,
            "descripcion": this.formPrincipal.get('descripcion').value,
            "estatus": this.formPrincipal.get('estatus').value,
            "division": {
                "divisionId": this.formPrincipal.get('division').value
            }
        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudGrupo').subscribe(resultado => {
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
     * Limpiar el formulario formPrincipal
     */
    limpiarCampos() {
        this.formPrincipal.get('cvePrincipal').setValue('');
        this.formPrincipal.get('descripcion').setValue('');
        this.formPrincipal.get('division').setValue('');
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
        'cvePrincipal': [
            { type: 'required', message: ' Clave Grupo Principal requerida.' },
            { type: 'pattern', message: 'Solo números de 2 dígitos.' },
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' }
        ],
        'division': [
            { type: 'required', message: 'División requerida.' }
        ]

    }
}