import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";




@Component({
    selector: 'administracion-cajas',
    moduleId: module.id,
    templateUrl: 'administracion-cajas.component.html'
})
/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 04/10/2021
 * @descripcion: AdministracionComponente para la gestion de cajas
 */

export class AdministracionCajasComponent implements OnInit {

    //Declaracion de variables
    titulo = 'Caja';
    encabezado: string;
    accion: number;
    selectedId: number;

    @BlockUI() blockUI: NgBlockUI;//loader

    //Inicio Autocomplete Componentes
    listSucursales: any[];
    listaCuentaBancaria: any[];
    filteredSucursales: Observable<string[]>;
    filteredCuentasBancarias: Observable<string[]>;

    formCaja: UntypedFormGroup;
    cajaid: number = 0;
    //Fin autocompletador

    //Cuentas faltante y restante
    listaCuentasContables = [];
    filteredCtaSobrante: Observable<string[]>;
    filteredCtaFaltante: Observable<string[]>;

    /* 
   *Metodo para validar campos
   */
    validaciones = {
        'cvecaja': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 5 dígitos' },
        ],
        'descripcion': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 255 dígitos' },
        ],
        'sucursal': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra.' }
        ],
        'cuentabancaria': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta bancaria no pertenece a la lista, elija otra.' }
        ],
        'saldoCierre': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'El campo solo acepta números enteros o con decimales.' }
        ],
        'sobrante': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra.' }
        ],
        'faltante': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra.' }
        ],
    };

    /**
    * Constructor del componente cajas
    * @param service 
    */
    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formCaja = this.fomrBuilder.group({
            cvecaja: new UntypedFormControl('', [Validators.required, Validators.maxLength(5)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            sucursal: new UntypedFormControl('', { validators: [Validators.required, this.autocompleteObjectValidator()] }),
            cuentabancaria: new UntypedFormControl('', { validators: [Validators.required, this.autocompleteObjectValidator()] }),
            estatus: new UntypedFormControl(true),
            saldoCierre: new UntypedFormControl('', { validators: [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')] }),
            sobrante: new UntypedFormControl('', { validators: [Validators.required, this.autocompleteObjectValidator()] }),
            faltante: new UntypedFormControl('', { validators: [Validators.required, this.autocompleteObjectValidator()] })
        });

        if (this.accion === 2) {

            //se pasan los datos de la tabla al formulario
            this.selectedId = data.caja.sucursal.sucursalid;
            this.spsCuentasBancarias();
            this.cajaid = data.caja.cajaid;
            this.formCaja.get('cvecaja').setValue(data.caja.cvecaja);
            this.formCaja.get('descripcion').setValue(data.caja.descripcion);
            this.formCaja.get('sucursal').setValue(data.caja.sucursal);
            this.formCaja.get('cuentabancaria').setValue(data.caja.cuentabancaria);
            this.formCaja.get('estatus').setValue(data.caja.estatus);
            this.formCaja.get('saldoCierre').setValue(data.caja.saldoCierre);

        }

    }



    /**
     * Metodo ngOnInit de la clase
     */
    ngOnInit() {
        this.spsSucurales();
        this.spsCuentasContables();

    }

    /**
    * Metodo para guardar los datos de las cajas
    */
    crudCaja() {
        if (this.formCaja.invalid) {
            this.validateAllFormFields(this.formCaja);
            return;
        }

        if (this.accion === 1) {
            this.blockUI.start('Guardando ...');
        } else {
            this.blockUI.start('Editando ...');
        }

        const data = {
            "cajaid": this.cajaid,
            "cvecaja": this.formCaja.get('cvecaja').value,
            "descripcion": this.formCaja.get('descripcion').value,
            "estatus": this.formCaja.get('estatus').value,
            "sucursal": this.formCaja.get('sucursal').value,
            "cuentabancaria": this.formCaja.get('cuentabancaria').value,
            "saldoCierre": this.formCaja.get('saldoCierre').value,
            "cuentaSobranteID":this.formCaja.get('sobrante').value.cuentaid,
            "cuentaFaltanteID":this.formCaja.get('faltante').value.cuentaid
        };
        this.service.registrarBYID(data,this.accion, 'crudCaja').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    
                    if (this.accion === 1) {
                        this.formCaja.reset();
                    }

                    this.service.showNotification('top', 'right', 2, result[0][1]);

                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {

                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }



    /**
    * Metodo para obtener la lista sucursales
    */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1, 'listaSucursales').subscribe(data => {

            this.blockUI.stop();
            this.listSucursales = data;
            this.filteredSucursales = this.formCaja.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    spsCuentasBancarias() {
        this.blockUI.start('Cargando datos...');
        let path = '?sucursalId=' + this.selectedId + '&' + 'tipoCuenta=' + '07CC';
        this.service.getListByID(path, 'listaCuentaBancariaID').subscribe(data => {
            this.blockUI.stop();
            this.listaCuentaBancaria = data;
            this.filteredCuentasBancarias = this.formCaja.get('cuentabancaria').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaB(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    seleccionSucursal(event) {
        this.selectedId = event.option.value.sucursalid
        this.formCaja.get('cuentabancaria').setValue('');
        this.spsCuentasBancarias();
    }

    /**
    * Filtra la forma de pago
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
    * Filtra la forma de pago
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaB(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentaBancaria.filter(option => option.descripcionCuenta.toLowerCase().includes(filterValue),);
    }


    /**
    * Muestra la descripcion de la sucursal
    * @param option --sucursal seleccionada
    * @returns --nombre de la sucursal
    */
    displayFn(option: any): any {
        return option ? option.nombreSucursal.trim() : undefined;
    }

    /**
    * Muestra la descripcion de la cuenta Bancaria
    * @param option --cuentabancaria seleccionada
    * @returns --nombre de la cuenta bancaria
    */
    displayFnCuentaB(option: any): any {
        return option ? option.claveCuenta.trim() + ' / ' + option.descripcionCuenta.trim() : undefined;
    }

    /**
     * Metodo que consulta las cuentas contables
     */
    spsCuentasContables() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
            this.blockUI.stop();


            this.listaCuentasContables = data;

            this.filteredCtaSobrante = this.formCaja.get('sobrante').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSobrante(value))
            );

            this.filteredCtaFaltante = this.formCaja.get('faltante').valueChanges.pipe(
                startWith(''),
                map(value => this._filterFaltante(value))
            );

            if (this.accion === 2) {
                let ctaSobrante = JSON.parse(this.data.caja.sobrante);
                if (ctaSobrante) {
                    for (let sob of ctaSobrante) {
                        let findSob = this.listaCuentasContables.find(c => c.cuentaid === sob.cuenta_id);
                        if(findSob){
                            this.formCaja.get('sobrante').setValue(findSob);
                        }
                        
                    }
                }

                let ctaFaltante = JSON.parse(this.data.caja.faltante);
                if (ctaFaltante) {
                    for (let falt of ctaFaltante) {
                        let findFal = this.listaCuentasContables.find(c => c.cuentaid === falt.cuenta_id);
                        if(findFal){
                            this.formCaja.get('faltante').setValue(findFal);
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
    * Filtra la cuenta contable
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSobrante(value: any): any[] {

        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentasContables.filter(option => option.cuenta.toLowerCase().includes(filterValue)
            || option.nombre.toLowerCase().includes(filterValue));
    }


    /**
     * Muestra la descripcion de la cuenta 
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnSobrante(option: any): any {
        return option ? option.cuenta.trim() + ' / ' + option.nombre.trim() : undefined;
    }


    /**
    * Filtra la cuenta contable
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterFaltante(value: any): any[] {

        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentasContables.filter(option => option.cuenta.toLowerCase().includes(filterValue)
            || option.nombre.toLowerCase().includes(filterValue));
    }


    /**
     * Muestra la descripcion de la cuenta 
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnFaltante(option: any): any {
        return option ? option.cuenta.trim() + ' / ' + option.nombre.trim() : undefined;
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

    /* Valida que el texto ingresado pertenezca a la lista 
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

