import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { verificacionModalComponent } from '../../../../../../app/pages/modales/verificacion-modal/verificacion-modal.component';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from "../../../../../shared/service/gestion";

@Component({
    selector: 'admin-roles',
    moduleId: module.id,
    templateUrl: 'admin-roles.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 23/11/2021
 * @descripcion: Componente para la Administración de Roles
 */
export class AdministracionRolesComponent implements OnInit {

    //Declaracion de variables, constantes, listas 
    formRoles: UntypedFormGroup;
    listaRoles = [];

    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase AdministracionRolesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog) {

        // Creamos las validaciones de los campos.
        this.formRoles = this.formBuilder.group({
            id: new UntypedFormControl(''),
            containerId: new UntypedFormControl(''),
            name: new UntypedFormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3)])
        });

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsRoles();
    }

    /**
     * Metodo que consulta los roles que existen
     */
    spsRoles() {
        this.blockUI.start('Cargando datos...');
        this.service.getList('crudRol').subscribe(data => {
            this.listaRoles = [];
            data.forEach(result => {
                if(result.name !== "offline_access" && result.name !== "default-roles-lks-core" && result.name !== "uma_authorization"){
                    let rol = {
                        "id": result.id,
                        "name": result.name,
                        "composite": result.composite,
                        "clientRole": result.clientRole,
                        "containerId": result.containerId
                    }
                    this.listaRoles.push(rol)
                }
            });

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo que guarda y edita sujetos
     */
    agregarRol() {

        // Validación del form
        if (this.formRoles.invalid) {
            this.validateAllFormFields(this.formRoles);
            return;
        }
        /**
         * Se estructura y se setean los datos al JSON
         */
        const data = {
            "name": this.formRoles.get('name').value,
            "composite": false,
            "clientRole": true,
            "containerId": "lks-core"
        }
        this.blockUI.start("Guardando ...");

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
        */
        this.service.registrar(data, 'crudRol').subscribe(result => {
            this.nuevoRol();
            this.spsRoles();
            this.service.showNotification('top', 'right', 2, 'Rol creado con exito.');
            // Desbloqueamos pantalla
            this.blockUI.stop();
        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.errorMessage);
        }
        );
    }

    /**
     * Metodo que muestra la informacion en el form
     * @param rol Objeto
     */
    mostrarRol(rol: any) {
        this.formRoles.get('id').setValue(rol.id);
        this.formRoles.get('containerId').setValue(rol.containerId);
        this.formRoles.get('name').setValue(rol.name);
    }

    /**
     * Metodo para eliminar un rol
     * @param rol Objeto
     */
    eliminarRol(rol: any) {
        this.blockUI.start("Eliminando ...");

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
        */
        this.service.eliminar(rol.name, 'crudRol').subscribe(result => {
            this.spsRoles();
            // Desbloqueamos pantalla
            this.blockUI.stop();
        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.errorMessage);
        }
        );
    }

    /** 
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
    */
    validaciones = {
        'name': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
            { type: 'minlength', message: 'Campo minimo 3 dígitos.' }
        ]
    };

    /**
     * Metodo que resetea el formulario y limpia variables
     */
    nuevoRol() {
        // Reseteamos el formulario
        this.formRoles.reset();
    }

    /**
     * Abrir ventana modal de confirmacion para eliminar el rol
    * */
    abrirAdvertencia(rol: any) {
        var encabezado = "";
        var body = "";
        encabezado = "Rol";
        body = '¿Esta seguro de eliminar el Rol?';

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {
                this.eliminarRol(rol);
            }
        });
    }

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);             //{3}
            if (control instanceof UntypedFormControl) {             //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
            }
        });
    }

}