import { Component, OnInit, Inject, ViewChild, ElementRef } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { categorias } from "../../../../../environments/categorias.config";
import { Observable } from "rxjs";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { map, startWith } from "rxjs/operators";
import { EncryptDataService } from "../../../../shared/service/encryptdata";

/**
* @autor: María Guadalupe Santana Olalde
* @version: 1.0.0
* @fecha: 28/01/2022
* @descripción: Componente para la gestión de medios de
* notificación por SMS
*/
@Component({
    selector: 'admin-sms',
    moduleId: module.id,
    templateUrl: 'admin-sms.component.html'

})

export class AdminSMSComponent implements OnInit {

    //Declaración de variables y componentes
    titulo: string;
    accion: number;
    smsID: number = 0;

    formSMS: UntypedFormGroup;

    listaTipoNot = [];
    listSucursales = [];

    //Variables Chips Sucursales
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    listaLimpiaSucursales = [];
    filteredSucursales: Observable<string[]>;
    @ViewChild('sucursalInput') sucursalInput: ElementRef<HTMLInputElement>;

    @BlockUI() blockUI: NgBlockUI;
    /**
    * Fin de la declaracion de variables
    */

    /**
     * Constructor de la clase admin
     * @param data - Recibe datos del padre
     * @param service - Instancia de acceso a datos
     * @param formBuilder - Instancia de construcción dek formulario
     * @param cifrar - Service para la enciptación de datos
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private cifrar: EncryptDataService
    ) {
        this.titulo = data.titulo;
        this.accion = data.accion;

        this.formSMS = this.formBuilder.group({

            cveSms: new UntypedFormControl(''),
            numero: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            lada: new UntypedFormControl(''),
            usuario: new UntypedFormControl(''),
            contrasenia: new UntypedFormControl(''),
            servidor: new UntypedFormControl(''),
            puerto: new UntypedFormControl(''),
            notificacion: new UntypedFormControl('', [Validators.required]),
            sucursales: new UntypedFormControl(''),
            estatus: new UntypedFormControl(true)
        });

        if (this.accion === 2) {
            this.smsID = data.datos.smsID;
            this.formSMS.get('cveSms').setValue(data.datos.cveSms);
            this.formSMS.get('numero').setValue(data.datos.numero);
            this.formSMS.get('lada').setValue(data.datos.lada);

            if(data.datos.usuario){
                this.formSMS.get('usuario').setValue(this.cifrar.desencriptar(data.datos.usuario));
            }

            if(data.datos.contrasenia){
                this.formSMS.get('contrasenia').setValue(this.cifrar.desencriptar(data.datos.contrasenia));
            }
            
            this.formSMS.get('servidor').setValue(data.datos.servidor);
            this.formSMS.get('puerto').setValue(data.datos.puerto);
            this.formSMS.get('estatus').setValue(data.datos.estatus);

        }
    }

    /**
     * Método OnInit de la clase AdminSmsComponent
     */
    ngOnInit() {
        this.spsTiposNotificaciones();
        this.spsSucursales();
    }

    /**
     * Método que consulta los tipos de notificaciones
     */
    spsTiposNotificaciones() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(categorias.catTipoNotificaciones, 'listaGeneralCategoria').subscribe(data => {

            this.listaTipoNot = data;

            if (this.accion === 2) {
                let not = JSON.parse(this.data.datos.notificaciones);
                let notSelect = this.listaTipoNot.find(n => n.generalesId === not[0].generales_id);
                this.formSMS.get('notificacion').setValue(notSelect);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
     * Método para cargar la lista de sucursales activas
     */
    spsSucursales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(result => {
            this.blockUI.stop();
            this.listSucursales = result;
            this.filteredSucursales = this.formSMS.get('sucursales').valueChanges.pipe(
                startWith(null),
                map((sucursal: string | null) => sucursal ? this._filter(sucursal) : this.listSucursales.slice()));

            if (this.accion === 2) {
                if(this.data.datos.sucursales){
                    for (let sucursal of JSON.parse(this.data.datos.sucursales)) {
                        let suc = this.listSucursales.find(s => s.sucursalid === sucursal.sucursalid);
                        if (suc !== undefined) {
                            this.listaLimpiaSucursales.push(suc);
                        }
                    }
                }

            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Inicio Gestión Sucursales Chips
     */
    remove(sucursal: string): void {
        const index = this.listaLimpiaSucursales.indexOf(sucursal);

        if (index >= 0) {
            this.listaLimpiaSucursales.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {

        const index = this.listaLimpiaSucursales.indexOf(event.option.value);


        if (index < 0) {
            this.listaLimpiaSucursales.push(event.option.value);
            this.sucursalInput.nativeElement.value = '';
            this.formSMS.get('sucursales').setValue(null);
        }

    }

    private _filter(value: any): any[] {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listSucursales.filter(sucursal => sucursal.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * Fin Chips
     */

    /**
     * Método tipo crud para guardar y editar los datos de SMS
     */
    crudSMS() {

        if (this.formSMS.invalid) {
            this.validateAllFormFields(this.formSMS);
            return;
        }

        if(this.formSMS.get('puerto').value !== '' 
        || this.formSMS.get('servidor').value !== ''){

            this.formSMS.get('puerto').setValidators([Validators.required, Validators.pattern('[0-9]*')]);
            this.formSMS.get('puerto').updateValueAndValidity();

            this.formSMS.get('servidor').setValidators([Validators.required, Validators.pattern('[0-9]*')]);
            this.formSMS.get('servidor').updateValueAndValidity();
        }

        if (this.listaLimpiaSucursales.length <= 0) {
            this.service.showNotification('top', 'right', 3, 'Seleccione al menos una sucursal.');
            return;
        }


        let usuario = this.cifrar.encriptar(this.formSMS.get('usuario').value);
        let contrasenia = this.cifrar.encriptar(this.formSMS.get('contrasenia').value);
        
        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }

        //sucursalid
        let idsSucursales = [];

        for (let sucursal of this.listaLimpiaSucursales) {
            idsSucursales.push(sucursal.sucursalid);
        }

        let jsonSMS = {
            datos: [
                this.smsID,
                this.formSMS.get('numero').value,
                this.formSMS.get('lada').value,
                usuario,
                contrasenia,
                this.formSMS.get('servidor').value,
                this.formSMS.get('puerto').value,
                this.formSMS.get('notificacion').value.generalesId,
                this.formSMS.get('estatus').value
            ],
            sucursales: idsSucursales,
            accion: this.accion
        };

        this.service.registrar(jsonSMS, 'crudSMS').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (result[0][0] === 1) {
                        this.formSMS.reset();
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
    }

    /**
     * Lista de validaciones del formulario SMS
     */
    listaValidaciones = {
        "numero": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan enteros' }
        ],
        "puerto": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan enteros.' }
        ],
        "servidor": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "notificacion": [
            { type: 'required', message: 'Campo requerido.' }
        ]
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