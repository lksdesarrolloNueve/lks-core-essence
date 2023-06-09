import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { globales } from '../../../../../environments/globales.config';


@Component({
    selector: 'administracion-tipos-socios',
    moduleId: module.id,
    templateUrl: 'administracion-tipos-socios.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 09/09/2021
 * @descripcion: Componente para la gestion de tipo socios
 */

export class AdministracionTipoSociosComponent implements OnInit {

    titulo = 'Tipo Clientes';
    encabezado: string;
    accion: number;

    color: ThemePalette = 'primary';
    tiposocioid: number;

    formTipoSocio: UntypedFormGroup;

    /* 
    *Metodo para validar campos
    */
    validaciones = {
        'descripcion': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 30 dígitos' },
        ],
        'clavesocio': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 2 dígitos' },
        ],
    };



    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;


    /**
     * Constructor de la clase
     * @param service - Instancia de acceso a datos
     * @param data - Datos recibidos desde el padre
     */
    constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formTipoSocio = this.formbuilder.group({
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(30)]),
            clavesocio: new UntypedFormControl('', [Validators.required, Validators.maxLength(2)]),
            estatus: new UntypedFormControl(true)

        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.formTipoSocio.get('clavesocio').setValue(data.tiposocio.cveSocio);
            this.formTipoSocio.get('descripcion').setValue(data.tiposocio.descripcion);
            this.formTipoSocio.get('estatus').setValue(data.tiposocio.estatus);
            this.tiposocioid = data.tiposocio.tipoSocioid;

        }

    }

    /**
     * Metodo OnInit de la clase
     */

    ngOnInit() {

    }

    /**
    * Metodo para guardar tipo socios
    * @returns notificacion de resultado
    */
    guardartiposocio() {
        if (this.formTipoSocio.invalid) {
            this.validateAllFormFields(this.formTipoSocio);
            return;
        }

        this.blockUI.start('Guardando ...');
        const data = {
            "tipoSocioid": 0,
            "cveSocio": this.formTipoSocio.get('clavesocio').value,
            "descripcion": this.formTipoSocio.get('descripcion').value,
            "estatus": this.formTipoSocio.get('estatus').value

        };

        this.service.registrarBYID(data, 1, 'crudtipossocios').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formTipoSocio.reset();
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
     * Metodo para editar informacion detipo socios
     */
    editartiposocio() {
        if (this.formTipoSocio.invalid) {
            this.validateAllFormFields(this.formTipoSocio);
            this.service.showNotification('top', 'right', 3, 'Completa los campos del formulario');
            return;
        }

        this.blockUI.start('Editando...');
        const data = {
            "tipoSocioid": this.tiposocioid,
            "cveSocio": this.formTipoSocio.get('clavesocio').value,
            "descripcion": this.formTipoSocio.get('descripcion').value,
            "estatus": this.formTipoSocio.get('estatus').value

        };

        this.service.registrarBYID(data, 2, 'crudtipossocios').subscribe(
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