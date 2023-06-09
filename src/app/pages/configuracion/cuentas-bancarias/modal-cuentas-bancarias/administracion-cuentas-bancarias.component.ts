import { Component, Inject, OnInit} from "@angular/core";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ThemePalette } from "@angular/material/core";

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 5/10/2021
 * @descripcion: Componente para la gestion de cuentas bancarias
 */
@Component({
    selector: 'administracion-cuentas-bancarias',
    moduleId: module.id,
    templateUrl: 'administracion-cuentas-bancarias.component.html'
})

export class AdminCuentaBComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Cuentas Bancarias';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';
    cuentabid: number;
    formCuentaBancaria: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;

    /**controles categoria*/
    opcionAsentamiento: Observable<string[]>;
    selectedIdAsen: number;
    listaAsentamiento: any;
    /**fin */

    /**controles banco sat */
    bancosat = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaBancoSat: any;
    opcionesBancoSat: Observable<string[]>;
    selectedIdBSat: number;
    /**fin */

    /**controles banco siti */
    bancositi = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaBancoSiti: any;
    opcionesBancoSiti: Observable<string[]>;
    selectedIdBSiti: number;
    /**fin */

    /**controles sucursal */
    sucursal = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaSucursal: any;
    opcionesSucursal: Observable<string[]>;
    selectedIdSuc: number;
    /**fin */

    /**controles sucursal */
    cuentaconta = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaCuentaC: any;
    opcionesCuentaC: Observable<string[]>;
    selectedIdCuentaC: number;
    /**fin */
    mostrar: boolean = false;

 
    /**
    * Constructor de la clase
    * @param service - Instancia de acceso a datos
    * @param data - Datos recibidos desde el padre
    */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        //validacion de campos requeridos
        this.formCuentaBancaria = this.formBuilder.group({
            cveCuenta: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            numCheque: new UntypedFormControl('', [Validators.pattern('[0-9]*')]),
            MontoMin: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            MontoMax: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            MontoExc: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            TipoCuenta : new UntypedFormControl('', [Validators.required]),
            BancoSat: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            BancoSiti: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            CuentaContable: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            Sucursal: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            estatus: new UntypedFormControl('true')
        });
        
    
        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.cuentabid = data.cuentab.cuentaBancariaID;
            this.formCuentaBancaria.get('cveCuenta').setValue(data.cuentab.claveCuenta);
            this.formCuentaBancaria.get('descripcion').setValue(data.cuentab.descripcionCuenta);
            this.formCuentaBancaria.get('numCheque').setValue(data.cuentab.chequeCuenta);
            this.formCuentaBancaria.get('MontoMin').setValue(data.cuentab.montoMinimo);
            this.formCuentaBancaria.get('MontoMax').setValue(data.cuentab.montoMaximo);
            this.formCuentaBancaria.get('MontoExc').setValue(data.cuentab.montoExcedente);
            this.formCuentaBancaria.get('TipoCuenta').setValue(data.cuentab.extencionCuentaBancaria.cuentaBanco);
            this.formCuentaBancaria.get('BancoSat').setValue(data.cuentab.extencionCuentaBancaria.bancoSat);
            this.formCuentaBancaria.get('BancoSiti').setValue(data.cuentab.extencionCuentaBancaria.bancoSiti);
            this.formCuentaBancaria.get('Sucursal').setValue(data.cuentab.extencionCuentaBancaria.sucursal);
            this.formCuentaBancaria.get('estatus').setValue(data.cuentab.estatus);
            this.selectedIdSuc = data.cuentab.extencionCuentaBancaria.sucursal.sucursalid;
            

            if (data.cuentab.extencionCuentaBancaria.cuentaBanco.cveGeneral === '07CN') {//07CN --Cuenta Banco
                this.mostrar = true;
            } else { this.mostrar = false; }
            

        }

    }

/**
 * 
 * @param object1 --lista completa
 * @param object2 --lista del objeto
 * @returns lista 
 */
    comparaCuenta(object1: any, object2: any) {
        return object1 && object2 && object1.generalesId == object2.generalesId;
    }
    /**
     * Valida que el texto ingresado pertenezca a un estado
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

    /**
   * Metodo OnInit de la clase
   */
    ngOnInit() {
        this.spsCategoria();
        this.spsBancoSat();
        this.spsBancoSiti();
        this.spsSucursal();
        this.spsCuentaConta();
    }


    /**
    * Metodo para consultar categoria/tipo cuenta bancaria
    */
    spsCategoria() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID('07CB', 'listaGeneralCategoria').subscribe(data => {
            this.listaAsentamiento = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
* Muestra la descripcion de categoria
* @param option --categoria selecicionado
* @returns --descripcion del categoria
*/
    displayFnAsentamiento(option: any): any {
        return option ? option.descripcion : undefined;
    }
    /**


    /**
    * Filtra el estado
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterAsentamiento(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaAsentamiento.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }


    /**
    * Metodo para consultar estados
    */
    spsBancoSat() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaBancoSat').subscribe(data => {
            this.listaBancoSat = data;
            this.opcionesBancoSat = this.formCuentaBancaria.get('BancoSat').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
  * Muestra la descripcion del estado
  * @param option --estado seleccionado
  * @returns --nombre de estado
  */
    displayFn(option: any): any {
        return option ? option.nombreBanco : undefined;
    }


    /**
* Filtra el estado
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

        return this.listaBancoSat.filter(option => option.nombreBanco.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionada(event) {
        this.selectedIdBSat = event.option.value.bancosatId;
    }

    /**
    * Metodo para consultar estados
    */
    spsBancoSiti() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaBancoSiti').subscribe(data => {
            this.listaBancoSiti = data;
            this.opcionesBancoSiti = this.formCuentaBancaria.get('BancoSiti').valueChanges.pipe(
                startWith(''),
                map(value => this._filterBsiti(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
  * Muestra la descripcion del estado
  * @param option --estado seleccionado
  * @returns --nombre de estado
  */
    displayFnBsiti(option: any): any {
        return option ? option.nombreBanco : undefined;
    }


    /**
* Filtra el estado
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterBsiti(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaBancoSiti.filter(option => option.nombreBanco.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionadaBsiti(event) {
        this.selectedIdBSiti = event.option.value.bancositiId;
    }


    /**
    * Metodo para consultar estados
    */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursal = data;
            this.opcionesSucursal = this.formCuentaBancaria.get('Sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSuc(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
  * Muestra la descripcion del estado
  * @param option --estado seleccionado
  * @returns --nombre de estado
  */
    displayFnSuc(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
* Filtra el estado
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterSuc(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaSucursal.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionSuc(event) {
        this.selectedIdSuc = event.option.value.sucursalid;
    }


    /**
    * Metodo para consultar estados
    */
    spsCuentaConta() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(4, 'spsCuentasContables').subscribe(data => {
            this.listaCuentaC = data;

            this.opcionesCuentaC = this.formCuentaBancaria.get('CuentaContable').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaC(value))
            );
            
            //Set cuenta bancaria
            let cuentaC:any;
            if (this.accion === 2){
                cuentaC = this.listaCuentaC.filter((cuentaCC: any) => cuentaCC.cuentaid === 
                this.data.cuentab.extencionCuentaBancaria.cuentaContable.cuentaid);
                this.formCuentaBancaria.get('CuentaContable').setValue(cuentaC[0]);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
  * Muestra la descripcion del estado
  * @param option --estado seleccionado
  * @returns --nombre de estado
  */
    displayFnCuentaConta(option: any): any {
        return option ?  option.cuenta +' / '+option.nombre : undefined;
    }

/**
* Filtra el estado
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterCuentaC(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentaC.filter(option => option.cuenta.toLowerCase().includes(filterValue) || option.nombre.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionCuentaC(event) {
        this.selectedIdCuentaC = event.option.value.cuentaid;
    }

    /**
     * Metodo para guardar cuenta
     */
    guardarCuentaBancaria() {

        if (this.formCuentaBancaria.invalid) {
            this.validateAllFormFields(this.formCuentaBancaria);
            return;

        }

        let numcheque = 0;
        let idbancosat = 0;
        let idbancositi = 0;

        if (this.formCuentaBancaria.get('numCheque').value) {
            numcheque = this.formCuentaBancaria.get('numCheque').value;
        }

        if (this.formCuentaBancaria.get('BancoSat').value) {
            idbancosat = this.formCuentaBancaria.get('BancoSat').value.bancosatId;
        }
        if (this.formCuentaBancaria.get('BancoSiti').value) {
            idbancositi = this.formCuentaBancaria.get('BancoSiti').value.bancositiId;
        }
        this.blockUI.start('Guardando ...');
        const data = {
            "cuentaBancariaID": 0,
            "claveCuenta": this.formCuentaBancaria.get('cveCuenta').value,
            "descripcionCuenta": this.formCuentaBancaria.get('descripcion').value,
            "chequeCuenta": numcheque,
            "montoMinimo": this.formCuentaBancaria.get('MontoMin').value,
            "montoMaximo": this.formCuentaBancaria.get('MontoMax').value,
            "montoExcedente": this.formCuentaBancaria.get('MontoExc').value,
            "estatus": this.formCuentaBancaria.get('estatus').value,
            "extencionCuentaBancaria": {
                "cuentaBanco": this.formCuentaBancaria.get('TipoCuenta').value ,
                "bancoSat": { "bancosatId": idbancosat },
                "bancoSiti": { "bancositiId": idbancositi },
                "cuentaContable": this.formCuentaBancaria.get('CuentaContable').value,
                "sucursal": this.formCuentaBancaria.get('Sucursal').value,
            }

        }

        this.service.registrarBYID(data, 1, 'crudCuentaBancaria').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formCuentaBancaria.reset();
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );


    }

    /**
     * Metodo para editar la colonia
     */
    editarCuentaBancaria() {
        if (this.formCuentaBancaria.invalid) {
            this.validateAllFormFields(this.formCuentaBancaria);
            return;
        }

        let numcheque = 0;
        let idbancosat = 0;
        let idbancositi = 0;

        if (this.formCuentaBancaria.get('numCheque').value) {
            numcheque = this.formCuentaBancaria.get('numCheque').value;
        }

        if (this.formCuentaBancaria.get('BancoSat').value) {
            idbancosat = this.formCuentaBancaria.get('BancoSat').value.bancosatId;
        }
        if (this.formCuentaBancaria.get('BancoSiti').value) {
            idbancositi = this.formCuentaBancaria.get('BancoSiti').value.bancositiId;
        }


        this.blockUI.start('Editando ...');
        // se asignan los datos a actualizar/Editar
        const data = {
            
            "cuentaBancariaID": this.cuentabid,
            "claveCuenta": this.formCuentaBancaria.get('cveCuenta').value,
            "descripcionCuenta": this.formCuentaBancaria.get('descripcion').value,
            "chequeCuenta": numcheque,
            "montoMinimo": this.formCuentaBancaria.get('MontoMin').value,
            "montoMaximo": this.formCuentaBancaria.get('MontoMax').value,
            "montoExcedente": this.formCuentaBancaria.get('MontoExc').value,
            "estatus": this.formCuentaBancaria.get('estatus').value,
            "extencionCuentaBancaria": {
                "cuentaBanco": this.formCuentaBancaria.get('TipoCuenta').value,
                "bancoSat": { "bancosatId": idbancosat },
                "bancoSiti": { "bancositiId": idbancositi },
                "cuentaContable": this.formCuentaBancaria.get('CuentaContable').value,
                "sucursal": this.formCuentaBancaria.get('Sucursal').value,
            }

        };
        this.service.registrarBYID(data, 2, 'crudCuentaBancaria').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );
    }

    /** 
         * Validaciones de los campos del formulario.
         * Se crean los mensajes de validación.
        */
    validaciones = {
        'cveCuenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 20 dígitos.' }
        ],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 250 caracteres.' }
        ],
        'numCheque': [
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'TipoCuenta': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'MontoExc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' }
        ],
        'MontoMax': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'MontoMin': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' }
        ],
        'BancoSat': [
            { type: 'invalidAutocompleteObject', message: 'El banco sat no pertenece a la lista, elija otro.' }
        ],

        'BancoSiti': [
            { type: 'invalidAutocompleteObject', message: 'El banco siti no pertenece a la lista, elija otro.' }
        ],

        'CuentaContable': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra.' }
        ],

        'Sucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra.' }
        ],
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

    seleccionTCuenta(cve_generales) {
        if (cve_generales.value.cveGeneral === '07CN') {//07CN --Cuenta Banco
            this.mostrar = true;
            this.formCuentaBancaria.get('BancoSat').setValue("");
            this.formCuentaBancaria.get('BancoSiti').setValue("");
        } else { this.mostrar = false; 
            this.formCuentaBancaria.get('BancoSat').setValue("");
            this.formCuentaBancaria.get('BancoSiti').setValue("");
        }
    }
}
