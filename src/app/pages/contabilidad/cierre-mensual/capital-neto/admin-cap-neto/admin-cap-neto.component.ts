import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../../shared/service/gestion";


@Component({
    selector: 'admin-cap-neto',
    moduleId: module.id,
    templateUrl: 'admin-cap-neto.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 25/07/2022
 * @descripcion: Componente para la gestion de capital neto
 */

export class AdminCapNetoComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    asignaDocumentoID: number = 0;
    @BlockUI() blockUI: NgBlockUI;
    listaTipoDocumento: any;
    tipoDocumentoControl = new UntypedFormControl('', [Validators.required])
    sucursalesControl = new UntypedFormControl('', [Validators.required])
    formPeriodo: UntypedFormGroup;
    seleccionado: boolean;
    allSelected: boolean;
    filteredSucursales: Observable<string[]>;
    listSucursales: any[];
    sucursales = new UntypedFormControl([]);
    listaAgregaSucursales: any[] = [];
    arrayIdsSuc: any[] = [];
    listaPeriodo = [];
    listaSucursalesSeleccionadas = [];
    vAnio: any;
    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;

    // validaciones de los campos necesarios
    validaciones = {
        'ejercicio': [
            { type: 'required', message: 'Campo requerido para registro.' },
            { type: 'maxlength', message: 'Campo maximo 4 numeros.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'mes': [
            { type: 'required', message: 'Campo requerido para registro.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],

        'porcentaje': [
            { type: 'required', message: 'Campo requerido para cálculo.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }

        ],
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra.' }
        ],

    }

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.titulo = data.titulo + ' Capital Neto';
        this.accion = data.accion;
        this.vAnio = new Date().getFullYear();
        this.formPeriodo = this.formBuilder.group({
            ejercicio: new UntypedFormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern('[0-9]*')]),
            mes: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            porcentaje: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            sucursal: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),

        });


        //Se obtienen los valores para poder pintarlos en el modal.
        if (this.accion === 2) {

            this.asignaDocumentoID = data.capneto.capitalId
            this.formPeriodo.get('ejercicio').setValue(data.capneto.ejercicio);
            this.formPeriodo.get('mes').setValue(data.capneto.periodo);
            this.formPeriodo.get('sucursal').setValue(data.capneto.sucursal);
            this.formPeriodo.get('porcentaje').setValue(data.capneto.porcetajeCalculo);
        }
    }

    /**
     * Metodo que abre un modal para la gestion de valores cap neto
     */

    ngOnInit() {
        this.spsPeriodos();
        this.spsListaSucursales();
    }

    /**
        * Metodo que lista de valores de capital neto
        */
    spsPeriodos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.vAnio, 'listaCapNeto').subscribe(data => {
            this.blockUI.stop();
            this.listaPeriodo = data;
        }, error => {

        });
    }
    /**
         * Obtener sucursales
         */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.opcionesSucursales = this.formPeriodo.get('sucursal').valueChanges.pipe(
            startWith(''),
            map(value => this._filterSucursales(value))
        );

        this.blockUI.stop();

    }

    /**
    * Filtra la categoria de sucursales
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursales(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));

    }

    /**
     * Muestra la descripcion de la sucursal
     * @param option --muestra el nombre de la sucursal seleccionada
     * @returns --nombre de la sucursal
     */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
     * Metodo para generar capital neto provisional
     * @returns notificacion de resultado
     */
    crudPeriodo() {

        this.formPeriodo.get('sucursal').setValidators([Validators.required]);
        this.formPeriodo.get('sucursal').updateValueAndValidity();

        if (this.formPeriodo.invalid) {
            this.validateAllFormFields(this.formPeriodo);
            return;

        }

        const data = {
            "datos": [
                0,
                this.formPeriodo.get('mes').value,
                this.formPeriodo.get('ejercicio').value,
                this.formPeriodo.get('porcentaje').value,
                this.formPeriodo.get('sucursal').value.sucursalid
            ],
            "accion": 1
        };

        this.blockUI.start('Guardando ...');
        this.service.registrar(data, 'crudCapitalNeto').subscribe(
            result => {
                if (result[0][0] === '0') {
                    //se manada llamar el metodo limpiar 
                    this.formPeriodo.reset();
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * metodo para capital neto de forma consolidada
     * 
     */
    generaCapNetoGlobal() {

        this.formPeriodo.get('sucursal').setValidators([]);
        this.formPeriodo.get('sucursal').updateValueAndValidity();

        if (this.formPeriodo.invalid) {
            this.validateAllFormFields(this.formPeriodo);
            return;

        }
        this.blockUI.start('Guardando ...');
        let path =this.formPeriodo.get('ejercicio').value+'/'+this.formPeriodo.get('mes').value
        +'/'+this.formPeriodo.get('porcentaje').value;
        this.service.registrarBYParametro(path,'generaCapNetoGlobal').subscribe(
            result => {
                if (result[0][0] === '0') {
                    //se manada llamar el metodo limpiar 
                    this.formPeriodo.reset();
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * Metodo para editar/actualizar los valores de capital neto.
     */
    editarPeriodo() {
        this.formPeriodo.get('sucursal').setValidators([Validators.required]);
        this.formPeriodo.get('sucursal').updateValueAndValidity();
        
        if (this.formPeriodo.invalid) {
            this.validateAllFormFields(this.formPeriodo);
            return;

        }
        //se setean los datos en el api
        const data = {
            "datos": [
                this.asignaDocumentoID,
                this.formPeriodo.get('mes').value,
                this.formPeriodo.get('ejercicio').value,
                this.formPeriodo.get('porcentaje').value,
                this.formPeriodo.get('sucursal').value.sucursalid
            ],
            "accion": 2
        };
        this.blockUI.start('Editando ...');
        //se manda llamar el metodo registrar para actualizar
        this.service.registrar(data, 'crudCapitalNeto').subscribe(
            result => {
                //se detiene el loader
                this.blockUI.stop();
                if (result[0][0] === '0') {//exito
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {//error
                    //se detiene el loader
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier asigna de FormGroup
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
     * Valida que el texto ingresado pertenezca a la lista
     * @returns mensaje de error.
     */
    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }


}