import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import { PermisosService } from "../../../shared/service/permisos.service";

/**
* @autor: Horacio Abraham Picón Galván.
* @version: 1.0.0
* @fecha: 09/12/2021
* @descripcion: Componente busqueda de movimientos.
*/
@Component({
    selector: 'buscar-movimiento',
    moduleId: module.id,
    templateUrl: 'buscar-movimiento.component.html',
    styleUrls: ['buscar-movimiento.component.css']
})

export class BuscarMovimientoComponent implements OnInit {

    //Id de usuario 
    vUsuarioId = this.servicePermisos.usuario.id;

    //Tabla
    displayedColumns: string[] = ['claveMovimiento', 'fechaHora', 'concepto', 'descripcion', 'monto', 'estatus'];
    dataSourceMovimientos: MatTableDataSource<any>;
    listaMovimientos = null;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    totalRows = 0;
    pageSize = 10;
    currentPage = 0;
    pageSizeOptions: number[] = [10, 25, 100];


    dataBusqueda: any;

    isLoadingResults = true;
    isResultado = false;


    //ucursal por id
    SucursalPorId = [];

    /*Controles sucursales*/
    listaSucursales: any = [];
    listaSucursalesFiltradas: any = [];
    listaSucursalesOri: any;
    opcionesSucursal: Observable<string[]>;

    //Tipo de cuenta por sucursal
    tipoCuentaPorSucursal: any = [];
    listaTipoCuentaOri: any = [];

    //Formulario. 
    formMovBancario: UntypedFormGroup;

    /*Controles cuenta bancaria*/
    listaCuentaBanco: any = [];
    opcionesCuentaBancOri: Observable<string[]>;


    cuentaOrigenVisible: boolean = false;

    /*Controles tipo cuenta*/
    //Formulario. 
    formBuscarMov: UntypedFormGroup;

    //Formulario. 
    range: UntypedFormGroup;



    /**
     * 
     * Constructor de la clase.
     */
    constructor(public dialogo: MatDialogRef<BuscarMovimientoComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        private servicePermisos: PermisosService,) {

        //validacion de campos requeridos
        this.formBuscarMov = this.formBuilder.group({
            cveMov: new UntypedFormControl('', [Validators.maxLength(250)]),
            sucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            tipoCuenta: new UntypedFormControl('', [Validators.required]),
            cuentaBancOri: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] })
        });

        this.range = this.formBuilder.group({
            start: new UntypedFormControl(new Date, [Validators.required]),
            end: new UntypedFormControl(new Date, [Validators.required]),
        });

    }
    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        //this.spsListaSucursales();
        this.spsCargaOrigen(this.vUsuarioId);

    }

    /**
     * Carga lista de movimientos.
     */
    spsListaMovimiento(dataEncabezado: any) {

        this.isLoadingResults = true;
        this.isResultado = false;

        this.service.getListByObjet(dataEncabezado, 'spsMovPagTsr').subscribe(data => {

            if(data === null){
                this.isResultado = true;
                this.isLoadingResults = false;
                return;
            }else if(data.length === 0){
                this.isResultado = true;
            }
           

            this.listaMovimientos = data;
            this.dataSourceMovimientos = new MatTableDataSource(this.listaMovimientos);
            this.dataSourceMovimientos.paginator = this.paginator;
            this.dataSourceMovimientos.sort = this.sort;

            if (data.length > 0) {

                setTimeout(() => {
                    this.paginator.pageIndex = this.currentPage;
                    this.paginator.length = Number(data[0].extMov2.totalReg);
                });

            }

            this.isLoadingResults = false;
        }, error => {

            this.isLoadingResults = false;
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }


    /**
     * Buscar movimiento
     */
    buscarMovimiento() {
        this.currentPage = 0;

        //VALIDAR FORMULARIO
        if (this.formBuscarMov.invalid) {
            this.validateAllFormFields(this.formBuscarMov);
            return;
        }

        //VALIDAR FORMULARIO
        if (this.range.invalid) {
            this.validateAllFormFields(this.range);
            return;
        }

        this.cargaDataBusqueda();
        this.cuentaOrigenVisible = true;
        this.spsListaMovimiento(this.dataBusqueda);
    }

    /**
     * Carga el objeto para la busqueda.
     */
    cargaDataBusqueda() {

        let cve: string;

        if (this.formBuscarMov.get('cveMov').value == "") {
            cve = null;
        } else {
            cve = this.formBuscarMov.get('cveMov').value;
        }

        let fechaIn = this.range.get('start').value.toLocaleDateString().replace(/\//g, '-');
        let fechaFin = this.range.get('end').value.toLocaleDateString().replace(/\//g, '-');

        this.dataBusqueda = {
            "cveMovimiento": cve,
            "cveCuentaBanco": this.formBuscarMov.get('cuentaBancOri').value.claveCuenta,
            "fechaInicial": fechaIn,
            "fechaFinal": fechaFin,
            "numPagina": this.currentPage,
            "tamPagina": this.pageSize
        };

    }

    /**
     * Cambiado de la página.
     * @param event 
     */
    pageChanged(event: PageEvent) {

        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;

        this.cargaDataBusqueda();

        this.spsListaMovimiento(this.dataBusqueda);
    }


    /**
     * Metodo para listar sucursales
     * 
     */
    spsListaSucursales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsSucursalesTsr').subscribe(data => {
            //Sucursales
            this.listaSucursales = data;
            this.spsSucursales();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para listar sucursales
     * 
     */
    spsSucursales() {

        //Sucursal Origen
        this.listaSucursalesOri = this.listaSucursalesFiltradas;

        this.opcionesSucursal = this.formBuscarMov.get('sucursal').valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value))
        );
    }

    /**
    * Muestra las sucursales ligadas al Id del usuario
    * @param idUsuario 
    */
    spsCargaOrigen(idUsuario: any) {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(idUsuario, 'listaSucursalUsuario').subscribe(data => {
            this.blockUI.stop();


            //Asignamos el data a la lista generica.
            this.tipoCuentaPorSucursal = data;

            let result = [];
            let map = new Map();

            for (let item of data) {
                if (!map.has(item.sucursal.nombreSucursal)) {
                    map.set(item.sucursal.nombreSucursal, true);    // set any value to Map
                    result.push({
                        "sucursalid": item.sucursal.sucursalid,
                        "nombreSucursal": item.sucursal.nombreSucursal,
                        "cveSucursal": item.sucursal.cveSucursal,
                    });
                }
            }

            //Sucursal Origen
            this.listaSucursalesFiltradas = result;
            this.spsSucursales();///se cargan otra ves

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Método que muestra los tipos de cuenta por sucursal que estan ligadas al Id del usuario
     * @param evento retorna la cve de la sucursal
     */
    spsCargaOrigenCuenta(evento: any) {

        let result = [];
        let map = new Map();

        for (let item of this.tipoCuentaPorSucursal) {
            if (!map.has(item.catGeneral.descripcion)
                && item.sucursal.cveSucursal == evento.option.value.cveSucursal) {
                map.set(item.catGeneral.descripcion, true);    // set any value to Map

                result.push({
                    id: item.catGeneral.descripcion,
                    name: item.catGeneral.descripcion,

                    "generalesId": item.catGeneral.generalesId,
                    "cveGeneral": item.catGeneral.cveGeneral,
                    "descripcion": item.catGeneral.descripcion

                });
            }
        }


        //Cuenta origen.
        this.listaTipoCuentaOri = result;

    }




    /**
     * Filtra la sucursal origen
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filter(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        this.limpiarCamposCuentaOrigen();
        return this.listaSucursalesOri.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
    * Muestra la descripcion de la sucursal
    * @param option --Sucursal
    * @returns --nombre sucursal
    */
    displaySucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
     * Opcion seleccionada sucursal
     */
    opcionSeleccionadaSucursal(evento: any) {
        this.spsCargaOrigenCuenta(evento);
        this.formBuscarMov.controls['tipoCuenta'].enable();
        this.formBuscarMov.controls['cuentaBancOri'].disable();

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Activa div de acuerdo al tipo de movimiento
     * @param event 
     */
    opcionSeleccionadaTipoCuenta(event: any) {

        this.formBuscarMov.controls['cuentaBancOri'].enable();
        this.formBuscarMov.get('cuentaBancOri').setValue('');

        let sucursalId = this.formBuscarMov.get('sucursal').value.sucursalid;
        this.spsCuentaBancariaOri(event.value.generalesId, sucursalId);

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
    * Metodo para listar cuenta bancaria origen
    * 
    */
    spsCuentaBancariaOri(idTipoCuenta: any, idSucursal: any) {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'spsCuentaBancariaTsr').subscribe(
            (data: any) => {

                let cuentasPermiso = this.tipoCuentaPorSucursal.filter((result: any) => result.catGeneral.generalesId === idTipoCuenta && result.sucursal.sucursalid === idSucursal);

                let ctaTemporal: any = [];
                this.listaCuentaBanco = [];
                let resultado: any = [];

                resultado = data;

                for (let ctaP of cuentasPermiso) {
                    ctaTemporal = resultado.filter((result: any) => result.cuentaBancariaID == ctaP.cuentaBnacaria.cuentaBancariaID);
                    this.listaCuentaBanco.push(ctaTemporal[0]);
                }


                this.opcionesCuentaBancOri = this.formBuscarMov.get('cuentaBancOri').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCuentaBanco(value))
                );

                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });
    }

    /**
    * Filtra la cuenta bancaria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaBanco(value: any): any[] {

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentaBanco.filter(cuentaBO => cuentaBO.claveCuenta.toLowerCase().includes(filterValue));
    }


    /**
     * Muestra clave cuenta banco
     * @param cuentaBanco --tipo cuenta seleccionada
     * @returns -- descripcion del tipo de cuenta
     */
    displayCuentaBancOri(cuentaBanco: any): any {
        return cuentaBanco ? cuentaBanco.claveCuenta : undefined;
    }

    /**
     * Cuenta origen bancaria seleccionada
     */
    opcionSeleccionadaCuenta(event) {
        //Limpia la tabla movimientos detalle
        this.limpiaTabla();
    }


    //////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * Limpia los campos del formulario cuenta bancaria origen.
     */
    limpiarCamposCuentaOrigen() {
        this.formBuscarMov.get('tipoCuenta').setValue('');
        this.formBuscarMov.get('cuentaBancOri').setValue('');

        this.bloqueaInputOri();
        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

    }

    /**
      * Método para bloquear los componentes del formulario.
      */
    bloqueaInputOri() {
        this.formBuscarMov.controls['tipoCuenta'].disable();
        this.formBuscarMov.controls['cuentaBancOri'].disable();
    }

    /**
     * Envia row
     * 
     */
    enviaRow(row: any) {

        this.dialogo.close(row);//retorna el registro elegido

    }


    /**
     * Limpiar la tabla
     */
    limpiaTabla() {

        this.cuentaOrigenVisible = false;

        this.listaMovimientos = [];
        this.dataSourceMovimientos = new MatTableDataSource(this.listaMovimientos);
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
     * Método para validar los mensajes.
     */
    public validacion_msj = {
        'sucursal': [
            { type: 'required', message: 'Sucursal origen requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal origen no pertenece a la lista, elija otra sucursal.' }
        ],
        'sucursalDest': [
            { type: 'required', message: 'Sucursal destino requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal destino no pertenece a la lista, elija otra sucursal.' }
        ],
        'cantidad': [
            { type: 'required', message: 'Cantidad requerida.' },
            { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' }
        ],
        'beneficiario': [
            { type: 'required', message: 'Benficiario requerido.' },
            { type: 'maxlength', message: 'El tamaño máximo es de 255 caracteres.' }
        ],
        'cveMov': [
            { type: 'maxlength', message: 'El tamaño máximo es de 255 caracteres.' }
        ],
        'tipoCuenta': [
            { type: 'required', message: 'Tipo cuenta requerido.' }
        ],
        'tipoCuentaDest': [
            { type: 'required', message: 'Tipo cuenta destino requerida.' }
        ],
        'cuentaBancOri': [
            { type: 'required', message: 'Cuenta requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta no pertenece a la lista, elija otra cuenta.' }
        ],
        'cuentaBancoDest': [
            { type: 'required', message: 'Cuenta destino requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta destino no pertenece a la lista, elija otra cuenta.' },
            { type: 'cuentaIgual', message: 'La cuenta origen no puede ser la misma que la cuenta destino.' }
        ],
        'start': [
            { type: 'matStartDateInvalid', message: 'Fecha incio erronea.' },
            { type: 'required', message: 'Fecha inicial requerida.' }
        ],
        'end': [
            { type: 'matEndDateInvalid', message: 'Fecha final erronea.' },
            { type: 'required', message: 'Fecha final requerida.' }
        ]
    }

}