import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from '../../../../shared/service/gestion';

@Component({
    selector: 'admin-bovedas',
    moduleId: module.id,
    templateUrl: 'admin-bovedas.component.html'
})


/**
* @autor: Victor Daniel Loza Cruz
* @version: 1.0.0
* @fecha: 06/10/2021
* @descripcion: Componente  Admin para la gestion de bovedas
*/
export class AdminBovedaComponent implements OnInit {

    // Declaracion de variables y controladores
    titulo: string;
    accion: number;
    bovedaID: number = 0;
    selectedId: number;

    formBoveda: UntypedFormGroup;
    formControl = new UntypedFormControl();

    dataSourceCuentasBancarias: MatTableDataSource<any>;
    @BlockUI() blockUI: NgBlockUI;

    //Variables AutoComplete listaCuentasBancarias
    opcionesCuentasbancarias: Observable<string[]>;
    filteredSucursales: Observable<string[]>;
    listaCuentasBancarias = [];
    listSucursales: any = [];

    //Variables Chips CAJAS
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];
    @ViewChild('cajaInput') cajaInput: ElementRef<HTMLInputElement>;

    listaCajas: any = [];
    opcionesCajas: Observable<string[]>;

    listaLimpiaCajas: any = [];

    //validacion de campos 
    validaciones = {
        'clave': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Máximo 4 caracteres.' }],
        'descripcion': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Máximo 255 caracteres.' }],
        'catCuentaBancaria': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Cuenta Bancaria no pertenece a la lista, elija otra.' }],
        'catSucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Sucursal no pertenece a la lista, elija otra.' }],
        'cajas': [
            { type: 'invalidAutocompleteObject', message: 'La Caja no pertenece a la lista, elija otra.' }]
    };

    /*
    *Deshabilita opsiones en la vista
    */
    estatusCuenta = new UntypedFormControl({ value: '', disabled: true });

    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.titulo = data.titulo + " bovedas";
        this.accion = data.accion;

        this.formBoveda = this.formBuilder.group({
            clave: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            estatus: new UntypedFormControl(true),
            catCuentaBancaria: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catSucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cajas: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] })
        });

        this.formBoveda.get('catCuentaBancaria').disable();
        this.formControl.disable();

        if (this.accion === 2) {

            this.bovedaID = data.bovedas.bovedaId
            //se pasan los datos de la tabla al formulario
            this.selectedId = data.bovedas.catSucursal.sucursalid;
            this.spsCuentasBancarias();
            this.formBoveda.get('clave').setValue(data.bovedas.clave);
            this.formBoveda.get('descripcion').setValue(data.bovedas.descripcion);
            this.formBoveda.get('estatus').setValue(data.bovedas.estatus);
            this.formBoveda.get('catCuentaBancaria').setValue(data.bovedas.catCuentaBancaria);
            this.formBoveda.get('catSucursal').setValue(data.bovedas.catSucursal);
            this.spsCajas(data.bovedas.catSucursal);


        }
    }

    ngOnInit() {
        this.spsSucurales(); //iniciamos la lista de sucursales
    }

    /**
    * Metodo que guarda y edita bovedas
    */
    crudBoveda() {

        //Validando los datos de entrada
        if (this.formBoveda.invalid) {
            this.validateAllFormFields(this.formBoveda);
            //this.service.showNotification('top', 'right', 3, 'Completa los campos del formulario');
            return;
        }

        let cajas = [];

        if (this.listaLimpiaCajas.length > 0) {
            for (let caja of this.listaLimpiaCajas) {
                cajas.push(caja.cajaid)
            }
        }


        //Conformando el JSON
        const data = {
            boveda: {
                "bovedaId": this.bovedaID,
                "clave": this.formBoveda.get('clave').value,
                "descripcion": this.formBoveda.get('descripcion').value,
                "estatus": this.formBoveda.get('estatus').value,
                "catCuentaBancaria": this.formBoveda.get('catCuentaBancaria').value,
                "catSucursal": this.formBoveda.get('catSucursal').value
            },
            cajas: cajas,
            accion: this.accion

        };

        if (this.accion === 2) {
            this.blockUI.start('Editando...'); //Se inicia el loader
        } else {
            this.blockUI.start('Guardando...'); //Se inicia el loader

        }

        this.service.registrar(data, 'crudBoveda').subscribe(
            result => {
           
                this.blockUI.stop(); //se cierra el loader
                if (result[0][0] === '0') {
                    if (this.accion !== 2) {
                        this.formBoveda.reset(); //para recetear los valores del form
                        this.listaLimpiaCajas = [];
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => {
                this.blockUI.stop(); //se cierra el loader
                this.service.showNotification('top', 'right', 4, error.Message);
            }

        );
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
    * Metodo para obtener la lista sucursales
    */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {

            this.blockUI.stop();
            this.listSucursales = data;
            this.filteredSucursales = this.formBoveda.get('catSucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo que lista Cuentas Bancarias y realiza el autocomplete
     */
    spsCuentasBancarias() {
        this.blockUI.start('Cargando datos...');
        let path = '?sucursalId=' + this.selectedId + '&' + 'tipoCuenta=' + '07CB';
        this.service.getListByID(path, 'listaCuentaBancariaID').subscribe(data => {
            this.blockUI.stop();
            this.listaCuentasBancarias = data;
            this.opcionesCuentasbancarias = this.formBoveda.get('catCuentaBancaria').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaBancaria(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }

    seleccionSucursal(sucursal: any) {
        this.selectedId = sucursal.sucursalid
        this.formBoveda.get('catCuentaBancaria').setValue('');
        this.spsCuentasBancarias(); //iniciamos la lista de cuentas bancarias
        this.spsCajas(sucursal);
        this.formControl.enable();
        this.formBoveda.get('catCuentaBancaria').enable();
    }

    /**
    * Filtra la categoria de cuentas bancarias
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaBancaria(value: any): any[] {

        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentasBancarias.filter(option => option.claveCuenta.toLowerCase().includes(filterValue)
            || option.descripcionCuenta.toLowerCase().includes(filterValue));
    }

    /**
    * Filtra la Sucursal
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursal(value: any): any {

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
    * Muestra la descripcion de la cuenta 
    * @param option --cuenta seleccionada
    * @returns -- cuenta
    *  option.claveCuenta   -- se checa en la api de cuentas Bancarias como esta el dato 
    */
    displayFnCuentasBancarias(option: any): any {
        return option ? option.claveCuenta + ' / ' + option.descripcionCuenta : undefined;
    }

    /**
    * Muestra la descripcion de la sucursal
    * @param option --sucursal seleccionada
    * @returns --nombre de la sucursal
    */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
    * Metodo que consulta cajas por sucursal
    */
    spsCajas(sucursal: any) {
        let path: any;
        path = sucursal.cveSucursal + '/' + 1
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(path, 'listaCajasBySucursal').subscribe(data => {
            this.blockUI.stop();
          
            this.listaCajas = data;

            this.opcionesCajas = this.formBoveda.get('cajas').valueChanges.pipe(
                startWith(null),
                map((sucursal: string | null) => sucursal ? this._filterCajas(sucursal) : this.listaCajas.slice()));

            if (this.accion === 2) {

                let jsonCajas = JSON.parse(this.data.bovedas.cajas);
                if (jsonCajas) {
                    for (let cj of jsonCajas) {
                        let findCaja = this.listaCajas.find(c => c.cajaid === cj.caja_id);
                        this.listaLimpiaCajas.push(findCaja);
                    }
                }
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    private _filterCajas(value: any): any[] {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCajas.filter(caja => caja.descripcion.toLowerCase().includes(filterValue));
    }

    /**
   * Inicio Gestion Cajas Chips
   */


    remove(fruit: string): void {
        const index = this.listaLimpiaCajas.indexOf(fruit);

        if (index >= 0) {
            this.listaLimpiaCajas.splice(index, 1);
        }
    }

    selected(caja: any): void {

        const index = this.listaLimpiaCajas.indexOf(caja);


        if (index < 0) {
            this.listaLimpiaCajas.push(caja);
            this.cajaInput.nativeElement.value = '';
            this.formBoveda.get('cajas').setValue(null);
        }

    }

    /**
    * Valida que el texto ingresado pertenezca a un subramas
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