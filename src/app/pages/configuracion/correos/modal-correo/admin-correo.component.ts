import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { categorias } from "../../../../../environments/categorias.config";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Observable } from "rxjs";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { map, startWith } from "rxjs/operators";
import { EncryptDataService } from "../../../../shared/service/encryptdata";


/**
 * @autor: Fatima Bolaños Duran
 * version: 1.0.
 * @fecha: 28/01/2022
 * @description: componente para la gestion de medios de notificación de correos
 * 
 */

@Component({

    selector: 'admin-correo',
    moduleId: module.id,
    templateUrl: 'admin-correo.component.html',
})

export class AdminCorreoComponent implements OnInit {

    // Declaracion de variables y Componentes
    titulo: string;
    accion: number;
    correoId: number = 0;

    formCorreo: UntypedFormGroup;

    listaTipoNot = [];
    listaSucursales = [];

    //Variables Chips Sucursales
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    listaLimpiaSucursales = [];
    filteredSucursales: Observable<string[]>;
    @ViewChild('sucursalInput') sucursalInput: ElementRef<HTMLInputElement>;

    @BlockUI() blockUI: NgBlockUI;

    // Fin de depreciaciones de variables
/**
 * Constructor  de la clase Admin interface
 * @param data  --Recibe los datos  del padre
 * @param service  -- Instancia de acceso a datos
 * @param formBuilder  -- Instancia  de construcion de formulario
 * @param encripta  -- Service para la encriptacion de datos
 */

    constructor(
        public dialogRef: MatDialogRef<AdminCorreoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private encripta : EncryptDataService
    ) {
        this.titulo = data.titulo;
        this.accion = data.accion;

        this.formCorreo = this.formBuilder.group({
            cveCorreo: new UntypedFormControl(''),
            correo: new UntypedFormControl('', [Validators.required]),
            usuario: new UntypedFormControl('', [Validators.required]),
            contrasenia: new UntypedFormControl('', [Validators.required]),
            servidor: new UntypedFormControl('', [Validators.required]),
            puerto: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            notificaciones: new UntypedFormControl('', [Validators.required]),
            sucursales: new UntypedFormControl(''),
            estatus: new UntypedFormControl(true)
        });

        if (this.accion === 2) {
            this.correoId = data.datos.correoID;
            this.formCorreo.get('cveCorreo').setValue(data.datos.cveCorreo);
            this.formCorreo.get('correo').setValue(data.datos.email);
            if(data.datos.usuario){
                this.formCorreo.get('usuario').setValue(this.encripta.desencriptar(data.datos.usuario));
            }

            if(data.datos.contasena){
                this.formCorreo.get('contrasenia').setValue(this.encripta.desencriptar(data.datos.contasena));
            }
            this.formCorreo.get('servidor').setValue(data.datos.servidor);
            this.formCorreo.get('puerto').setValue(data.datos.puerto);
            this.formCorreo.get('estatus').setValue(data.datos.estatus);
        }
    }

    /**
   * Metodo onInit de la clase CorreosComponent
   * */
    ngOnInit() {
        this.spsTiposNotificaciones();
        this.spsSucurales();
    }

    /**
     * Metodo que consulta los tipos de notificaciones
     */
    spsTiposNotificaciones() {
        this.blockUI.start('Cargando datos....');
        this.service.getListByID(categorias.catTipoNotificaciones, 'listaGeneralCategoria').subscribe(result => {
            this.listaTipoNot = result;

            if (this.accion === 2) {
                let not = JSON.parse(this.data.datos.notificaciones);
                let notSelec = this.listaTipoNot.find(n => n.generalesId === not[0].generales_id);
                this.formCorreo.get('notificaciones').setValue(notSelec);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
   * Metodo para cargar en tabla las sucursales
   */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(result => {
            this.blockUI.stop();
            this.listaSucursales = result;
            this.filteredSucursales = this.formCorreo.get('sucursales').valueChanges.pipe(
                startWith(null),
                map((sucursal: string | null) => sucursal ? this._filter(sucursal) : this.listaSucursales.slice()));

            if (this.accion === 2) {
                if(this.data.datos.sucursales){
                    for (let sucursal of JSON.parse(this.data.datos.sucursales)) {
                        let suc = this.listaSucursales.find(s => s.sucursalid === sucursal.sucursalid);
    
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
     * Inicio Gestion Sucursales Chips
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
            this.formCorreo.get('sucursales').setValue(null);
        }
    }

    private _filter(value: any): any[] {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaSucursales.filter(sucursal => sucursal.nombreSucursal.toLowerCase().includes(filterValue));
    }
    /**
     * Fin Chips
     */


    /**
    * Metodo  tipo CRUD para guardar y editar los  correos
    * */
    crudCorreos() {
        if (this.formCorreo.invalid) {
            this.validateAllFormFields(this.formCorreo);
            return;
        }

        let usuario = this.encripta.encriptar(this.formCorreo.get('usuario').value);
        let contrasenia = this.encripta.encriptar(this.formCorreo.get('contrasenia').value);

        if (this.listaLimpiaSucursales.length <= 0) {
            this.service.showNotification('top', 'right', 3, 'Selecione al menos una sucursal');
            return;
        }

        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }

        let idsSucursales = [];

        for (let sucursal of this.listaLimpiaSucursales) {
            idsSucursales.push(sucursal.sucursalid);
        }

        let jsonCorreo = {

            "datos": [
                this.correoId,
                this.formCorreo.get('correo').value,
                usuario,
                contrasenia,
                this.formCorreo.get('servidor').value,
                this.formCorreo.get('puerto').value,
                this.formCorreo.get('notificaciones').value.generalesId,
                this.formCorreo.get('estatus').value,
            ],
            sucursales: idsSucursales,
            accion: this.accion

        };
        this.service.registrar(jsonCorreo, 'crudCorreos').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if(this.accion === 1){
                        this.formCorreo.reset();
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
     * Lista  de validaciones del formulario 
     */

    listaValidaciones = {
        "correo": [
            { type: 'required', message: 'Campo requerido.' },

        ],
        "usuario": [
            { type: 'required', message: 'Campo requerido.' },
        ],
        "contrasenia": [
            { type: 'required', message: 'Campo requerido.' },
        ],
        "servidor": [
            { type: 'required', message: 'Campo requerido.' },
        ],
        "puerto": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo  se aceptan enteros' }
        ],
        "notificaciones": [
            { type: 'required', message: 'Campo requerido.' },
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