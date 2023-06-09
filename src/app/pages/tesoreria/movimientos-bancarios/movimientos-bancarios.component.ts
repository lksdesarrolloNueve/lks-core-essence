import { Component, OnInit } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgForm, ValidatorFn, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { BuscarClientesComponent } from "../../modales/clientes-modal/buscar-clientes.component";
import { verificacionModalComponent } from "../../modales/verificacion-modal/verificacion-modal.component";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { MovCuentaCont } from "./modal-mov-cuenta-cont/mov-cuenta-cont.component";
import { BuscarMovimientoComponent } from "../../modales/movimiento-modal/buscar-movimiento.component";
import { PermisosService } from "../../../shared/service/permisos.service";
import { environment } from '../../../../environments/environment';
import { ErrorStateMatcher } from "@angular/material/core";
import { PolizaInversionComponent } from "./polizas-inversion/poliza-inversion.component";

////Constantes//////
//Tipo movimiento.
const cDeposito = environment.tesoreria.deposito;// 01 'Depostio' = 'I'
const cRetiro = environment.tesoreria.retiro;// 02 'Retiro'   =  'E'
const cTraspasoO = environment.tesoreria.traspasoO;// 50 'Traspaso a otra cuenta' = 'D'
const cRetiroCh = environment.tesoreria.retiroCh;// 51 'Retiro cheque' = 'E'
const cTraspasoD = environment.tesoreria.traspasoD;// 52 'Traspaso de la cuenta' = 'D'

//Tipo póliza
const cIngreso = environment.contabilidad.ingreso;//Ingreso
const cEgreso = environment.contabilidad.egreso;//Egreso
const cDiario = environment.contabilidad.diario;//Diario

//Tipo movimiento póliza
const cCargo = environment.contabilidad.cargo;
const cAbono = environment.contabilidad.abono;

//Constantes generales
const cClaseMov = environment.generales.claseMovBanco;//"50MB"; //Movimiento banco
const cOrigenMov = environment.generales.origenMov;//"51EL"; //Origen movimiento

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}

@Component({
    selector: 'movimientos-bancarios',
    moduleId: module.id,
    templateUrl: 'movimientos-bancarios.component.html',
    styleUrls: ['movimientos-bancarios-component.css'],

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 16/11/2021
 * @descripcion: Componente para la gestion de movimientos bancarios.
 */
export class MovimientosBancariosComponent implements OnInit {

    matcher = new MyErrorStateMatcher();

    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;

    titulo = '';
    accion = 0;
    cuentaContable: any;

    //Formulario. 
    formMovBancario: UntypedFormGroup;

    //Mensaje dialog.
    mensajeDialog = null;

    //Tipo cuenta por sucursal 
    tipoCuentaPorSucursal = [];

    //Tipo cuenta por sucursal destino
    tipoCuentaPorSucursalDest = [];

    //Fecha
    fecha = new Date();
    CurrentDate: any;

    //Tabla
    displayedColumns: string[] = ['no', 'cuentaContable', 'concepto', 'ref', 'debe', 'haber', 'acciones'];
    dataSourceCuentas: MatTableDataSource<any>;
    listaCuentasContMov = null;
    saldo = 0;
    saldoDest = 0;
    clienteId = 0;
    tipoPoliza = null;

    //Wait
    @BlockUI() blockUI: NgBlockUI;

    /**Controles sucursales*/
    listaSucursalesOri: any;
    listaSucursalesFiltradas: any;
    opcionesSucursalOri: Observable<string[]>;

    listaSucursalesDest: any = [];
    listaSucursalesDestFiltradas: any;
    opcionesSucursalDest: Observable<string[]>;

    /**Controles tipo movimiento */
    listaTipoMovimiento: any;
    tipoMovimiento = new UntypedFormControl('', [Validators.required]);
    formaPago = new UntypedFormControl('', [Validators.required]);

    /**Listas matrices */
    listAddPoliza: any = [];//
    listAddMovPoliza: any = [];//
    listAddMovimientos: any = [];//

    /**Controles tipo cuenta*/
    listaTipoCuentaOri: any;
    listaTipoCuentaDest: any;

    /**Controles cuenta bancaria*/
    listaCuentaBancoOri: any = [];
    opcionesCuentaBancoOri: Observable<string[]>;
    listaCuentaBancoDest: any;
    opcionesCuentaBancoDest: Observable<string[]>;

    mostrar: boolean = false;

    //Forma de pagos 
    listaFormasPago: any[];

    //Boolean activa Formularios
    cuentaOrigenVisible: boolean = false;
    cuentaDestinoVisible: boolean = false;

    //Boolean botones.
    isDisabledButton: boolean = false;
    isDisabledButtonAM: boolean = false;
    isDisabledTransito: boolean = true;
    isEditVisible: boolean = false;
    isActivo: boolean = true;


    //Listas iniciales
    listaCuentasBancarias: any;
    listaSucursales: any;

    currencyString: string;

    //Controles update.
    polizaId: number = 0;
    movimientoId: number = 0;
    claveMovimiento: string = null;
    claseMovimiento: string = null;
    usuario: string = null;


    /**
     * Constructor del componente MovimientosBancariosComponent
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService,
                private servicePermisos: PermisosService,
                private formBuilder: UntypedFormBuilder, public dialog: MatDialog, private currencyPipe: CurrencyPipe,
                private datePipe: DatePipe) {

        this.CurrentDate = this.datePipe.transform(this.fecha, 'dd/MM/yyyy');

        //validacion de campos requeridos
        this.formMovBancario = this.formBuilder.group({
            sucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cuentaBancOri: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            sucursalDest: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cuentaBancoDest: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cantidad: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            beneficiario: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            concepto: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            tipoCuenta: new UntypedFormControl('', [Validators.required]),
            tipoCuentaDest: new UntypedFormControl('', [Validators.required]),
            transito: new UntypedFormControl(false)
        });

    }

    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsCargaCtasBancoActivas();
        this.spsCargaOrigen(this.vUsuarioId);
        this.spsTiposMovimientos();
        this.spsFormasPago();
        this.spsCuentaBancaria();
    }


    /**
     * Carga cuentas bancarias activas.
     */
    spsCargaCtasBancoActivas() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaCuentaBancaria').subscribe(
            data => {
                this.blockUI.stop();

                //Asignamos el data a la lista generica.
                this.tipoCuentaPorSucursalDest = data;

                let result = [];
                let map = new Map();

                for (let item of data) {
                    if (!map.has(item.extencionCuentaBancaria.sucursal.cveSucursal)) {
                        map.set(item.extencionCuentaBancaria.sucursal.cveSucursal, true);

                        result.push({
                            "sucursalid": item.extencionCuentaBancaria.sucursal.sucursalid,
                            "nombreSucursal": item.extencionCuentaBancaria.sucursal.nombreSucursal,
                            "cveSucursal": item.extencionCuentaBancaria.sucursal.cveSucursal
                        });
                    }
                }

                //Sucursal Origen
                this.listaSucursalesDestFiltradas = result;

            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

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
                if (!map.has(item.sucursal.cveSucursal)) {
                    map.set(item.sucursal.cveSucursal, true);

                    result.push({
                        "sucursalid": item.sucursal.sucursalid,
                        "nombreSucursal": item.sucursal.nombreSucursal,
                        "cveSucursal": item.sucursal.cveSucursal,
                        "ctaContableTraspaso": {
                            "cuentaContableId": item.sucursal.ctaContableTraspaso.cuentaContableId,
                            "cuenta": item.sucursal.ctaContableTraspaso.cuenta,
                            "nombre": item.sucursal.ctaContableTraspaso.nombre
                        }
                    });
                }
            }

            //Sucursal Origen
            this.listaSucursalesFiltradas = result;

            this.spsListaSucursales();

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
            if (!map.has(item.catGeneral.cveGeneral)
                && item.sucursal.cveSucursal == evento.option.value.cveSucursal) {
                map.set(item.catGeneral.cveGeneral, true);    // set any value to Map

                result.push({

                    "generalesId": item.catGeneral.generalesId,
                    "cveGeneral": item.catGeneral.cveGeneral,
                    "descripcion": item.catGeneral.descripcion,

                });
            }
        }

        //Cuenta origen.
        this.listaTipoCuentaOri = result;
    }

    /**
     * Método que muestra los tipos de cuenta por sucursal que estan ligadas al Id del usuario
     * @param evento retorna la cve de la sucursal
     */
    spsCargaDestinoCuenta(evento: any) {

        let result = [];
        let map = new Map();

        for (let item of this.tipoCuentaPorSucursalDest) {
            if (!map.has(item.extencionCuentaBancaria.cuentaBanco.cveGeneral)
                && item.extencionCuentaBancaria.sucursal.cveSucursal == evento.option.value.cveSucursal) {
                map.set(item.extencionCuentaBancaria.cuentaBanco.cveGeneral, true);    // set any value to Map

                result.push({

                    "generalesId": item.extencionCuentaBancaria.cuentaBanco.generalesId,
                    "cveGeneral": item.extencionCuentaBancaria.cuentaBanco.cveGeneral,
                    "descripcion": item.extencionCuentaBancaria.cuentaBanco.descripcion

                });
            }
        }

        //Cuenta destino.
        this.listaTipoCuentaDest = result;
    }

    /**
     * Lista los tipos movimientos bancarios
     */
    spsTiposMovimientos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsTiposMovimientosTsr').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoMovimiento = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Activa div de acuerdo al tipo de movimiento
     * @param event 
     */
    opcionSeleccionadaTMovimiento(event: any) {

        //limpia formulario
        this.limpiarFormGeneral();

        //Evalua el tipo de póliza
        this.asignTipoPoliza(event);

        //Retiro cheque en transito
        if (event.claveTipoMov == cRetiroCh) {
            this.isDisabledTransito = false;
        } else {
            this.isDisabledTransito = true;
        }

        //Evalua el tipo de movimiento para habilitar o deshabilitar componentes
        if (event.claveTipoMov == cDeposito || event.claveTipoMov == cRetiro || event.claveTipoMov == cRetiroCh) {
            this.cuentaOrigenVisible = true;
            this.cuentaDestinoVisible = false;
            //Activa botones detalle
            this.isDisabledButton = false;

            //Cambian los validators    
            this.formMovBancario.get('sucursalDest').setValidators([this.autocompleteObjectValidator()])
            this.formMovBancario.get('sucursalDest').updateValueAndValidity();
            this.formMovBancario.get('cuentaBancoDest').setValidators([this.autocompleteObjectValidator()])
            this.formMovBancario.get('cuentaBancoDest').updateValueAndValidity();
            this.formMovBancario.get('tipoCuentaDest').setValidators([]);
            this.formMovBancario.get('tipoCuentaDest').updateValueAndValidity();

        } else if (event.claveTipoMov == cTraspasoO || event.claveTipoMov == cTraspasoD) {
            this.cuentaOrigenVisible = true;
            this.cuentaDestinoVisible = true;

            //Activa botones detalle
            this.isDisabledButton = true;

            //Cambian los validators
            this.formMovBancario.get('sucursalDest').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formMovBancario.get('sucursalDest').updateValueAndValidity();
            this.formMovBancario.get('cuentaBancoDest').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formMovBancario.get('cuentaBancoDest').updateValueAndValidity();
            this.formMovBancario.get('tipoCuentaDest').setValidators([Validators.required])
            this.formMovBancario.get('tipoCuentaDest').updateValueAndValidity();

        }


    }

    /**
     * Evalua el tipo de poliza
     * @param data 
     */
    asignTipoPoliza(data: any) {
        if (data.claveTipoMov == cDeposito) {
            this.tipoPoliza = cIngreso;
        } else if (data.claveTipoMov == cRetiro || data.claveTipoMov == cRetiroCh || data.claveTipoMov == cTraspasoO) {
            this.tipoPoliza = cEgreso;
        }

    }


    //Método que retorna las formas de pago 
    spsFormasPago() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaFormasPago').subscribe(data => {

            this.listaFormasPago = data;

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

        let sucDestTemporal: any;

        for (let sucDest of this.listaSucursalesDestFiltradas) {

            sucDestTemporal = this.listaSucursales.filter((result: any) => result.sucursalid == sucDest.sucursalid);

            this.listaSucursalesDest.push(sucDestTemporal[0]);
        }

        this.opcionesSucursalOri = this.formMovBancario.get('sucursal').valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value))
        );

        this.opcionesSucursalDest = this.formMovBancario.get('sucursalDest').valueChanges.pipe(
            startWith(''),
            map(value => this._filterSucDest(value))
        );

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
     * Filtra la sucursal destino
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterSucDest(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        this.limpiarCamposCuentaDestino();
        return this.listaSucursalesDest.filter(option2 => option2.nombreSucursal.toLowerCase().includes(filterValue));
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
    * Muestra la descripcion de la sucursal
    * @param option --Sucursal destino
    * @returns --nombre sucursal destino
    */
    displaySucursalDest(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
     * Opcion seleccionada sucursal
     */
    opcionSeleccionadaSucursal(evento: any) {
        this.spsCargaOrigenCuenta(evento);
        this.formMovBancario.controls['tipoCuenta'].enable();
        this.formMovBancario.controls['cuentaBancOri'].disable();

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();
    }

    /**
     * Opcion seleccionada sucursal destino
     */
    opcionSeleccionadaSucursalDest(evento: any) {
        this.spsCargaDestinoCuenta(evento);
        this.formMovBancario.controls['tipoCuentaDest'].enable();
        this.formMovBancario.controls['cuentaBancoDest'].disable();

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Consulta tipos de cuenta
     */
    spsTiposCuenta() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID('07CB', 'spsGeneralesCatTsr').subscribe(data => {
            this.blockUI.stop();

            //Cuenta origen.
            this.listaTipoCuentaOri = data;

            //Cuenta destino
            this.listaTipoCuentaDest = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Activa div de acuerdo al tipo de movimiento
     * @param event 
     */
    opcionSeleccionadaTipoCuenta(event: any) {

        this.formMovBancario.controls['cuentaBancOri'].enable();
        this.formMovBancario.get('cuentaBancOri').setValue('');
        this.saldo = 0.00;

        let sucursalId = this.formMovBancario.get('sucursal').value.sucursalid;
        this.spsCuentaBancoOri(event.value.generalesId, sucursalId);

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

    }

    /**
     * Activa div de acuerdo al tipo de movimiento
     * @param event 
     */
    opcionSeleccionadaTipoCuentaDest(event: any) {

        this.formMovBancario.controls['cuentaBancoDest'].enable();
        this.formMovBancario.get('cuentaBancoDest').setValue('');
        this.saldoDest = 0.00;

        let sucursalId = this.formMovBancario.get('sucursalDest').value.sucursalid;
        this.spsCuentaBancoDest(event.value.generalesId, sucursalId);

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Busca cuenta bancarias.
     */
    spsCuentaBancaria() {
        this.service.getListByID(2, 'spsCuentaBancariaTsr').subscribe(
            (data: any) => {

                this.listaCuentasBancarias = data;

                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });
    }

    /**
     * Metodo para listar cuenta bancaria origen
     * 
     */
    spsCuentaBancoOri(idTipoCuenta: any, idSucursal: any) {

        let cuentasPermiso = this.tipoCuentaPorSucursal.filter((result: any) => result.catGeneral.generalesId === idTipoCuenta && result.sucursal.sucursalid === idSucursal);

        let ctaTemporal: any;

        this.listaCuentaBancoOri = [];

        for (let ctaP of cuentasPermiso) {
            ctaTemporal = this.listaCuentasBancarias.filter((result: any) => result.cuentaBancariaID == ctaP.cuentaBnacaria.cuentaBancariaID);
            this.listaCuentaBancoOri.push(ctaTemporal[0]);
        }

        this.opcionesCuentaBancoOri = this.formMovBancario.get('cuentaBancOri').valueChanges.pipe(
            startWith(''),
            map(value => this._filterCuentaBanco(value))
        );
    }
    

    /**
     * Metodo para listar cuenta bancaria origen
     * 
     */
    spsCuentaBancoDest(idTipoCuenta: any, idSucursal: any) {

        this.listaCuentaBancoDest = this.listaCuentasBancarias.filter((result: any) => result.tipoCuentaId === idTipoCuenta && result.sucursalId === idSucursal);

        this.opcionesCuentaBancoDest = this.formMovBancario.get('cuentaBancoDest').valueChanges.pipe(
            startWith(''),
            map(value => this._filterCuentaBancoDest(value))
        );
    }

    /**
    * Filtra la cuenta bancaria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaBanco(value: any): any[] {
        this.saldo = 0.00;
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
        return this.listaCuentaBancoOri.filter(cuentaBO => cuentaBO.claveCuenta.toLowerCase().includes(filterValue));
    }

    /**
    * Filtra la cuenta bancaria destino
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaBancoDest(value: any): any[] {
        this.saldoDest = 0.00;
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
        return this.listaCuentaBancoDest.filter(cuentaDest => cuentaDest.claveCuenta.toLowerCase().includes(filterValue));
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
        this.spsSaldoCuenta(event.option.value.claveCuenta);

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();
    }

    /**
     * Cuenta bancaria destino seleccionada
     */
    opcionSeleccionadaCuentaDest(event) {
        //Limpia la tabla movimientos detalle
        this.spsSaldoCuentaDest(event.option.value.claveCuenta);
        this.limpiaTabla();
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Obtiene saldo de la cuenta bancaria
     */
    spsSaldoCuenta(cveCuenta: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1+'/'+cveCuenta, 'spsSaldoCuentaTsr').subscribe(data => {

            this.blockUI.stop();

            this.saldo = data[0].saldo;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Obtiene saldo de la cuenta bancaria destiono
     */
    spsSaldoCuentaDest(cveCuenta: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1+'/'+cveCuenta, 'spsSaldoCuentaTsr').subscribe(data => {

            this.blockUI.stop();

            this.saldoDest = data[0].saldo;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Agregar detalle movimentos contables tabla.
     */
    public agregarDetalle() {

        this.validacionesPersonalizadas();


        if (this.formaPago.invalid) {
            this.formaPago.markAsTouched({ onlySelf: true });
            return;
        };

        if (this.formMovBancario.invalid) {
            this.validateAllFormFields(this.formMovBancario);
            return;
        }

        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

        //Activa botón agregar cuentas
        if (this.tipoMovimiento.value.claveTipoMov == cDeposito || this.tipoMovimiento.value.claveTipoMov == cRetiro ||
            this.tipoMovimiento.value.claveTipoMov == cRetiroCh) {

            this.isDisabledButtonAM = true;

        }

        //Movimiento 1
        let vMov1CuentaContId = this.formMovBancario.get('cuentaBancOri').value.cuentaContableId;
        let vMov1CuentaContable = this.formMovBancario.get('cuentaBancOri').value.cuentaContable;
        let vConcepto = this.formMovBancario.get("concepto")?.value;
        let cMov1ClaveTipo = null;
        let cMov1Debe: number = 0;
        let cMov1Haber: number = 0;

        //Movimiento 2
        let vMov2CuentaContId = 0;
        let vMov2CuentaContable = null;
        let cMov2ClaveTipo = null;
        let cMov2Debe: number = 0;
        let cMov2Haber: number = 0;

        //Validamos los movimientos en base al tipo
        if (this.tipoMovimiento.value.claveTipoMov == cDeposito) {

            //Debe
            cMov1ClaveTipo = cCargo;
            cMov1Debe = this.formMovBancario.get('cantidad').value;

        } else if (this.tipoMovimiento.value.claveTipoMov == cRetiro || this.tipoMovimiento.value.claveTipoMov == cRetiroCh) {

            //Haber
            cMov1ClaveTipo = cAbono;
            cMov1Haber = this.formMovBancario.get('cantidad').value;

        } else if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {

            vMov2CuentaContId = this.formMovBancario.get('sucursalDest').value.ctaContableTraspaso.cuentaContableId;
            vMov2CuentaContable = this.formMovBancario.get('sucursalDest').value.ctaContableTraspaso.cuenta;

            //Haber
            cMov1ClaveTipo = cAbono;
            cMov1Haber = this.formMovBancario.get('cantidad').value;

            //Debe
            cMov2ClaveTipo = cCargo;
            cMov2Debe = this.formMovBancario.get('cantidad').value;

        };

        //MOVIMIENTO POLIZA 1
        let cuenta1 = {
            "cuentaContableId": vMov1CuentaContId,
            "cuentaContable": vMov1CuentaContable,
            "ref": 'MOVIMIENTO 1',
            "concepto": vConcepto,
            "cveTipoMov": cMov1ClaveTipo,
            "debe": Number(cMov1Debe),
            "haber": Number(cMov1Haber)
        };

        this.listaCuentasContMov.push(cuenta1);

        //MOVIMIENTO POLIZA 2
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {
            let cuenta2 = {
                "cuentaContableId": vMov2CuentaContId,
                "cuentaContable": vMov2CuentaContable,
                "ref": 'MOVIMIENTO 2',
                "concepto": vConcepto,
                "cveTipoMov": cMov2ClaveTipo,
                "debe": Number(cMov2Debe),
                "haber": Number(cMov2Haber)
            }

            this.listaCuentasContMov.push(cuenta2);
        }

        this.dataSourceCuentas = new MatTableDataSource(this.listaCuentasContMov);

    }

    /***
     * metodo para remover datos de la lista de activos
     */
    eliminar(valor: any) {
        let index = this.listaCuentasContMov.findIndex(res => res.cuentaContable === valor.cuentaContable);
        this.listaCuentasContMov.splice(index, 1);
        this.dataSourceCuentas = new MatTableDataSource(this.listaCuentasContMov);
    }


    /**
     * Guardar movimiento en base al tipo
     * @returns notificacion de resultadO
     */
    public guardarMovimiento(accion: any) {
        this.blockUI.start('Cargando datos...');

        //Carga las listas para objeto.
        this.cargaListaMovimientos();

        //Agrega la póliza.
        const data = {
            "listPoliza": this.listAddPoliza,
            "listMovPoliza": this.listAddMovPoliza,
            "listMovTran": this.listAddMovimientos,
            "accion": accion
        };

        this.service.registrar(data, 'crudMovimientoTsr').subscribe(
            result => {

                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.limpiarFormGeneral();

                    //this.service.showNotification('top', 'right', 2, result[0][1] + ' '+result[0][4]);
                    //!!!Pendiente aprobación.
                    this.modalConfirmacion(result[0][1] + '. Clave del movimiento: ' + result[0][4]);

                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {

                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }

    /**
     * Carga los movimiento de la lista.
     */
    cargaListaMovimientos() {
        this.listAddPoliza = [];
        this.listAddMovPoliza = [];
        this.listAddMovimientos = [];



        //////////////////////////////// POLIZAS ////////////////////////////////////
        let poliza: any;

        //POLIZA 1
        poliza = {
            "polizaId": this.polizaId,
            "cvePoliza": null,
            "tipoPoliza": {
                "tipoPolizaId": null,
                "claveTipo": this.tipoPoliza,
                "descTipo": null,
                "estatusTipo": true
            },
            "conceptoPoliza": this.formMovBancario.get("concepto")?.value,
            "polFechaHora": null,
            "polSucursalCve": this.formMovBancario.get('sucursal').value.cveSucursal,
            "polUsuarioId": this.vUsuarioId,
            "polEstatus": true,
            "noMovimiento": 1
        };

        this.listAddPoliza.push(poliza);


        //POLIZA 2, APLICA SOLO EN TRASPASO.
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {

            poliza = {
                "polizaId": this.polizaId,
                "cvePoliza": null,
                "tipoPoliza": {
                    "tipoPolizaId": null,
                    "claveTipo": cIngreso,
                    "descTipo": null,
                    "estatusTipo": true
                },
                "conceptoPoliza": this.formMovBancario.get("concepto")?.value,
                "polFechaHora": null,
                "polSucursalCve": this.formMovBancario.get('sucursalDest').value.cveSucursal,
                "polUsuarioId": this.vUsuarioId,
                "polEstatus": true,
                "noMovimiento": 2
            };

            this.listAddPoliza.push(poliza);

        }

        ////////////////////////////////////////////////////////////////////////////     

        ////////////////////////////////MOVIMIENTOS POLIZA//////////////////////////
        let movPoliza: any;
        let concepto: any;
        let referencia: any;

        //MOVIMIENTOS POLIZA 1
        this.listaCuentasContMov.forEach((res: any) => {

            concepto = res.concepto;
            referencia = res.ref;

            movPoliza = {
                "movPolizaId": 0,
                "claveMov": null,
                "polizaId": 0,
                "descripcion": concepto,
                "referencia": referencia,
                "cuentaContCve": res.cuentaContable,//cuenta_id
                "tipoMovPoliza": {
                    "tipoMovPolId": null,
                    "claveTipoMovPol": res.cveTipoMov,
                    "descTipoMovPol": null,
                    "estatusTipoMovPol": true
                },
                "debe": res.debe,
                "haber": res.haber,
                "noMovimiento": 1
            };

            this.listAddMovPoliza.push(movPoliza);

        });

        //Movimientos poliza 2
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {


            movPoliza = {
                "movPolizaId": 0,
                "claveMov": null,
                "polizaId": 0,
                "descripcion": concepto,
                "referencia": referencia,
                "cuentaContCve": this.formMovBancario.get('cuentaBancoDest').value.cuentaContable,
                "tipoMovPoliza": {
                    "tipoMovPolId": null,
                    "claveTipoMovPol": cCargo,
                    "descTipoMovPol": null,
                    "estatusTipoMovPol": true
                },
                "debe": this.formMovBancario.get("cantidad")?.value,
                "haber": 0,
                "noMovimiento": 2
            };

            this.listAddMovPoliza.push(movPoliza);

            movPoliza = {
                "movPolizaId": 0,
                "claveMov": null,
                "polizaId": 0,
                "descripcion": concepto,
                "referencia": referencia,
                "cuentaContCve": this.formMovBancario.get('sucursal').value.ctaContableTraspaso.cuenta,
                "tipoMovPoliza": {
                    "tipoMovPolId": null,
                    "claveTipoMovPol": cAbono,
                    "descTipoMovPol": null,
                    "estatusTipoMovPol": true
                },
                "debe": 0,
                "haber": this.formMovBancario.get("cantidad")?.value,
                "noMovimiento": 2
            };

            this.listAddMovPoliza.push(movPoliza);

        }

        ////////////////////////////////MOVIMIENTOS/////////////////////////////////

        //Variable movimiento 1
        let vCuentaOrigenCve = null;
        let vCuentaDestinoCve = null;
        let vCveTipoMovimiento = null;
        let vConceptoMov = null;

        //Variable movimiento 2
        let vCuentaOrigenCveM2 = null;
        let vCuentaDestinoCveM2 = null;
        let vCveTipoMovM2 = null;
        let vConceptoMovM2 = null;

        //Movimiento 1
        vCuentaOrigenCve = this.formMovBancario.get('cuentaBancOri').value.claveCuenta;
        vConceptoMov = this.formMovBancario.get("concepto")?.value;
        vCveTipoMovimiento = this.tipoMovimiento.value.claveTipoMov;


        //Validamos los movimientos en base al tipo
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {
            //Movimiento 1
            vCuentaDestinoCve = this.formMovBancario.get('cuentaBancoDest').value.claveCuenta;

            //Movimiento 2
            vCuentaOrigenCveM2 = this.formMovBancario.get('cuentaBancoDest').value.claveCuenta;
            vCveTipoMovM2 = cDeposito;
            vConceptoMovM2 = "TRASPASO DE LA CUENTA " + this.formMovBancario.get("cuentaBancOri")?.value.claveCuenta;

        }

        //Movimiento 1
        let movOrigen = {
            "movimientoId": 0,
            "claveMovimiento": this.claveMovimiento,
            "sucursalCve": this.formMovBancario.get('sucursal').value.cveSucursal,
            "concepto": vConceptoMov,
            "clienteCve": this.clienteId,
            "ctaBancoOrigenCve": vCuentaOrigenCve,
            "ctaBancoDestinoCve": vCuentaDestinoCve,
            "creditoCve": null,
            "extMov1": {
                "poliza": {
                    "polizaId": 0,
                    "cvePoliza": null,
                    "tipoPoliza": {
                        "tipoPolizaId": null,
                        "claveTipo": null,
                        "descTipo": null,
                        "estatusTipo": true
                    }
                },
                "movCajaCve": null,
                "tipoMovimiento": {
                    "tipoMovimientoId": 0,
                    "claveTipoMov": vCveTipoMovimiento,
                    "descripcion": null,
                    "operacion": null,
                    "estatus": true
                },
                "cajaCve": null,
                "bovedaCve": null,
                "formaPago": {
                    "fpagoid": null,
                    "cvefpago": this.formaPago.value.cvefpago,
                    "nombrefpago": null
                },
                "fechaHora": null,
                "monto": this.formMovBancario.get("cantidad")?.value,
                "numeroCheque": null,
                "beneficiario": this.formMovBancario.get("beneficiario")?.value
            },
            "extMov2": {
                "claseMovimiento": {
                    "generalesId": null,
                    "cveGeneral": cClaseMov,
                    "descripcion": null,
                    "estatus": false,
                    "categoria": null
                },
                "usuarioId": this.vUsuarioId,
                "origenMov": {
                    "generalesId": null,
                    "cveGeneral": cOrigenMov,
                    "descripcion": null,
                    "estatus": false,
                    "categoria": null
                },
                "conciliado": false,
                "transito": this.formMovBancario.get('transito').value,
                "estatus": true,
                "movimientosPoliza": null,
                "noMovimiento": 1
            }
        };

        this.listAddMovimientos.push(movOrigen);

        //Movimiento 2
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {

            let movDestino = {
                "movimientoId": 0,
                "claveMovimiento": null,
                "sucursalCve": this.formMovBancario.get('sucursalDest').value.cveSucursal,
                "concepto": vConceptoMovM2,
                "clienteCve": this.clienteId,
                "ctaBancoOrigenCve": vCuentaOrigenCveM2,
                "ctaBancoDestinoCve": vCuentaDestinoCveM2,
                "creditoCve": null,
                "extMov1": {
                    "poliza": {
                        "polizaId": 0,
                        "cvePoliza": null,
                        "tipoPoliza": {
                            "tipoPolizaId": null,
                            "claveTipo": null,
                            "descTipo": null,
                            "estatusTipo": true
                        }
                    },
                    "movCajaCve": null,
                    "tipoMovimiento": {
                        "tipoMovimientoId": 0,
                        "claveTipoMov": vCveTipoMovM2,
                        "descripcion": null,
                        "operacion": null,
                        "estatus": true
                    },
                    "cajaCve": null,
                    "bovedaCve": null,
                    "formaPago": {
                        "fpagoid": 0,
                        "cvefpago": this.formaPago.value.cvefpago,
                        "nombrefpago": null
                    },
                    "fechaHora": null,
                    "monto": this.formMovBancario.get("cantidad")?.value,
                    "numeroCheque": null,
                    "beneficiario": this.formMovBancario.get("beneficiario")?.value
                },
                "extMov2": {
                    "claseMovimiento": {
                        "generalesId": null,
                        "cveGeneral": cClaseMov,
                        "descripcion": null,
                        "estatus": false,
                        "categoria": null
                    },
                    "usuarioId": this.vUsuarioId,
                    "origenMov": {
                        "generalesId": null,
                        "cveGeneral": cOrigenMov,
                        "descripcion": null,
                        "estatus": false,
                        "categoria": null
                    },
                    "conciliado": false,
                    "transito": this.formMovBancario.get('transito').value,
                    "estatus": true,
                    "movimientosPoliza": null,
                    "noMovimiento": 2
                }
            };

            this.listAddMovimientos.push(movDestino);
        }
    }

    ////////////////////////////BLOQUEO/////////////////////////
    /**
     * Método para bloquear los componentes del formulario.
     */
    bloqueaInputOri() {
        this.formMovBancario.controls['tipoCuenta'].disable();
        this.formMovBancario.controls['cuentaBancOri'].disable();
    }

    /**
     * Método para bloquear los componentes del formulario.
     */
    bloqueaInputDest() {
        this.formMovBancario.controls['tipoCuentaDest'].disable();
        this.formMovBancario.controls['cuentaBancoDest'].disable();
    }
    //////////////////////////// FIN BLOQUEO //////////////////


    ////////////////////////////BLOQUE LIMPIAR//////////////
    /**
     * Limpia los campos de todo el formulario
     */
    limpiarFormGeneral() {
        this.formMovBancario.reset();
        this.bloqueaInputOri();
        this.bloqueaInputDest();
        this.clienteId = 0;
        this.polizaId = 0;
        this.listAddPoliza = [];
        this.listAddMovPoliza = [];
        this.listAddMovimientos = [];
        this.isDisabledButtonAM = false;

        this.isEditVisible = false;
        this.isActivo = true;
        this.claveMovimiento = null;
        this.claseMovimiento = null;
        this.usuario = null;


        this.limpiaTabla();

        this.formMovBancario.controls['sucursal'].enable();
        this.formMovBancario.controls['sucursalDest'].enable();
        this.formMovBancario.controls['cantidad'].enable();
        this.formMovBancario.controls['concepto'].enable();
        this.formMovBancario.controls['beneficiario'].enable();
        this.formaPago.enable();

        this.CurrentDate = this.datePipe.transform(this.fecha, 'dd/MM/yyyy');

    }

    /**
     * Limpia cuando se teclea el cliente
     */
    limpiaCliente() {
        this.clienteId = 0;
    }

    /**
     * Limpia los campos del formulario cuenta bancaria origen.
     */
    limpiarCamposCuentaOrigen() {

        this.formMovBancario.get('tipoCuenta').setValue('');
        this.formMovBancario.get('cuentaBancOri').setValue('');
        this.saldo = 0.00;
        this.bloqueaInputOri();
        //Limpia la tabla movimientos detalle
        this.limpiaTabla();

    }

    /**
     * Limpia los campos del formulario cuenta bancaria destino.
     */
    limpiarCamposCuentaDestino() {
        this.formMovBancario.get('tipoCuentaDest').setValue('');
        this.formMovBancario.get('cuentaBancoDest').setValue('');
        this.saldoDest = 0.00;
        this.bloqueaInputDest();
    }

    /**
     * Limpia la tabla de movimientos
     * 
     */
    public limpiaTabla() {
        this.listaCuentasContMov = [];
        this.dataSourceCuentas = new MatTableDataSource(this.listaCuentasContMov);
        this.isDisabledButtonAM = false;
    }


    ////////////////////////////FIN BLOQUE LIMPIAR//////////////


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


    //////////////////////DIALOGS ////////////////////////////////////

    /**
     * Metodo para abrir ventana modal
     * 
     */
    abrirDialog() {

        let titulo = "Lista clientes";
        let accion = 1;

        //se abre el modal
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            // height: '500px',
            width: '600px',
            data: {
                titulo: titulo,
                accion: accion,
                cliente: 0
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (result.tipoPersona == 'F') {//NO esta vacio Aceptar llenar datos
                //Asignamos los datos del cliente.
                this.clienteId = result.datosCl.cliente_id;
                this.formMovBancario.get('beneficiario').setValue(result.datosCl.nombre_cl + ' ' +
                    result.datosCl.paterno_cl + ' ' +
                    result.datosCl.materno_cl);

            } else {
                //cancelar
                this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente Físico o extranjero.');
            }

        });

    }


    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     * @param accion --Lista con los datos del sectores
     */
    guardarEditarDialog(accion: number) {

        //VALIDAR FORMULARIO
        if (this.formMovBancario.invalid) {
            this.validateAllFormFields(this.formMovBancario);
            return;
        }


        if (this.formaPago.invalid) {

            this.formaPago.markAsTouched({ onlySelf: true });

            return;
        };

        this.validacionesPersonalizadas();

        //Validar los movimiento póliza
        if (this.listaCuentasContMov.length === 0) {
            this.service.showNotification('top', 'right', 3, "Agregue la tabla movimientos detalle.");
            return;

        }

        //Validar que el cargo se igual al habono.
        if ((this.getTotalDebe() - this.getTotalHaber()) != 0) {
            this.service.showNotification('top', 'right', 3, "El cargo es diferente al abono.");
            return;
        }

        //Carga mensajes.
        this.mensajesDialog(accion);

        this.abrirAdvertencia(accion);//Guardar

    }


    /**
     * Abrir ventana modal de confirmacion
     * @param accion 0:Guardar, 1:Modificar
     * */
    abrirAdvertencia(accion: number) {
        var encabezado = "";
        var body = "";
        if (accion === 1) {//Guardar movimiento.
            encabezado = "Guardar movimiento.";
            body = this.mensajeDialog;

        } else if (accion === 2) {//Modificar movimiento
            encabezado = "Modificar movimiento.";
            body = this.mensajeDialog;

        } else if (accion === 3) {
            encabezado = "Eliminar movimiento.";
            body = this.mensajeDialog;
        }

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar y guardar

                this.guardarMovimiento(accion);

            }
        });
    }


    /**
     * Abrir ventana modal de confirmación con la clave. !!!!Pendiente de aprobación
     * @param mensaje datos categoria
     * */
    modalConfirmacion(mensaje: any) {
        var encabezado = "Transacción exitosa.";

        this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: mensaje
            }
        });

    }


    /**
     * Mensajes para dialog movimientos.
     */
    mensajesDialog(accion: number) {
        this.mensajeDialog = null;


        if (accion === 1) {//Guardar
            if (this.tipoMovimiento.value.claveTipoMov == cDeposito) {
                this.mensajeDialog = "Deposita " +
                    this.currencyPipe.transform(this.formMovBancario.get("cantidad")?.value, 'MXN') +
                    " a la cuenta " +
                    this.formMovBancario.get("cuentaBancOri")?.value.claveCuenta + '.';

            } else if (this.tipoMovimiento.value.claveTipoMov == cRetiro) {
                this.mensajeDialog = "Retira " +
                    this.currencyPipe.transform(this.formMovBancario.get("cantidad")?.value, 'MXN') +
                    " de la cuenta " +
                    this.formMovBancario.get("cuentaBancOri")?.value.claveCuenta + '.';
            } else if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO) {
                this.mensajeDialog = "Traspaso " +
                    this.currencyPipe.transform(this.formMovBancario.get("cantidad")?.value, 'MXN') +
                    " de la cuenta " +
                    this.formMovBancario.get("cuentaBancOri")?.value.claveCuenta +
                    " a la cuenta " +
                    this.formMovBancario.get("cuentaBancoDest")?.value.claveCuenta + '.';

            } else if (this.tipoMovimiento.value.claveTipoMov == cRetiroCh) {
                this.mensajeDialog = "Retiro en cheque de " +
                    this.currencyPipe.transform(this.formMovBancario.get("cantidad")?.value, 'MXN') +
                    " de la cuenta " +
                    this.formMovBancario.get("cuentaBancOri")?.value.claveCuenta + '.';
            } else if (this.tipoMovimiento.value.claveTipoMov == cTraspasoD) {
                this.mensajeDialog = "Traspaso " +
                    this.currencyPipe.transform(this.formMovBancario.get("cantidad")?.value, 'MXN') +
                    " de la cuenta " +
                    this.formMovBancario.get("cuentaBancoDest")?.value.claveCuenta +
                    " a la cuenta " +
                    this.formMovBancario.get("cuentaBancOri")?.value.claveCuenta + '.';
            }

        } else if (accion === 2) {
            this.mensajeDialog = "El movimiento con clave " + this.claveMovimiento + " será actualizado."
        } else if (accion === 3) {
            this.mensajeDialog = "El movimiento con clave " + this.claveMovimiento + " será cancelado."

        }


    }

    /**
     * Abrir ventana modal de confirmacion
     * @param data datos categoria
     * */
    abrirCtasContDetalle(data: any): void {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "Registrar movimiento cuenta contable";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar movimiento cuenta contable";
        }


        const dialogRef = this.dialog.open(MovCuentaCont, {
            width: '600px',
            data: {
                titulo: this.titulo,
                accion: this.accion,
                listMov: this.listaCuentasContMov,
                movimiento: data
            }
        });


        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {


            if (result && this.accion === 1) {//Agregar
                let cuenta = {
                    "cuentaContableId": result.cuentaContableId,
                    "cuentaContable": result.cuentaContable,
                    "ref": result.ref,
                    "concepto": result.concepto,
                    "cveTipoMov": result.cveTipoMov,
                    "debe": Number(result.debe),
                    "haber": Number(result.haber)
                }

                this.listaCuentasContMov.push(cuenta);

            } else if (result) {//Modificar

                let cuenta = {
                    "cuentaContableId": result.cuentaContableId,
                    "cuentaContable": result.cuentaContable,
                    "ref": result.ref,
                    "concepto": result.concepto,
                    "cveTipoMov": result.cveTipoMov,
                    "debe": Number(result.debe),
                    "haber": Number(result.haber)
                }

                for (var i = 0; i < this.listaCuentasContMov.length; i++) {

                    if (this.listaCuentasContMov[i].cuentaContableId === result.cuentaContableId) {
                        this.listaCuentasContMov[i] = cuenta;
                    }

                }
            }

            this.dataSourceCuentas = new MatTableDataSource(this.listaCuentasContMov);

        });
    }

    /**
     * Abrir ventana modal de confirmacion
     * @param element datos categoria
     * @param accion 0:Guardar, 1:Modificar
     * */
    abrirAdvertenciaEliminar(elemento: any) {

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: "Eliminar movimiento.",
                body: "Se eliminará el registro " + elemento.cuentaContable + " de la tabla."
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar
                this.eliminar(elemento);
            }
        });
    }

    /**
     * Abrir ventana para busqueda de movimientos.
     * @param element datos categoria
     * @param accion 0 Buscar
     * */
    abrirBusquedaMov(data: any) {


        this.titulo = "Buscar movimiento";

        //Consulta los tipos de cuenta
        this.spsTiposCuenta();
        this.spsCuentaBancaria();

        const dialogRef = this.dialog.open(BuscarMovimientoComponent, {
            width: '1000px',
            data: {
                titulo: this.titulo,
                accion: this.accion
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {


            if (result) {



                //valida cuenta existente.
                let index = this.listaTipoMovimiento.filter(res => res.claveTipoMov === result.extMov1.tipoMovimiento.claveTipoMov);

                //Tipo movimientos.
                this.tipoMovimiento.setValue(index[0]);
                this.opcionSeleccionadaTMovimiento(index[0]);

                //Forma de pago
                let fPago = this.listaFormasPago.find(f => f.cvefpago === result.extMov1.formaPago.cvefpago);
                this.formaPago.setValue(fPago);

                //Sucursal origen
                let cuentaOriTempo: any;
                cuentaOriTempo = this.listaCuentasBancarias.filter((cuentaOr: any) => cuentaOr.claveCuenta == result.ctaBancoOrigenCve);

                let sucOrigen = this.listaSucursalesOri.filter((cuentaOr: any) => cuentaOr.sucursalid === cuentaOriTempo[0].sucursalId);
                this.formMovBancario.get('sucursal').setValue(sucOrigen[0]);

                //Sucursal destino
                let cuentaDestTempo: any;
                cuentaDestTempo = this.listaCuentasBancarias.filter((cuentaDest: any) => cuentaDest.claveCuenta == result.ctaBancoDestinoCve);

                let sucDest: any;

                //Seteo con retardo habilitar
                setTimeout(() => {

                    this.formMovBancario.controls['sucursal'].disable();
                    this.formMovBancario.controls['tipoCuenta'].disable();
                    this.formMovBancario.controls['cuentaBancOri'].disable();

                    this.formMovBancario.controls['sucursalDest'].disable();
                    this.formMovBancario.controls['tipoCuentaDest'].disable();
                    this.formMovBancario.controls['cuentaBancoDest'].disable();

                    this.formMovBancario.controls['cantidad'].disable();
                    this.formMovBancario.controls['concepto'].disable();
                    this.formMovBancario.controls['beneficiario'].disable();
                    this.formaPago.disable();


                }, 1);


                //Tipo cuenta origen.
                let tipoCuentaOriTemp: any;
                tipoCuentaOriTemp = this.listaTipoCuentaOri.filter((tipoCuentaOri: any) => tipoCuentaOri.generalesId === cuentaOriTempo[0].tipoCuentaId);

                //Tipo cuenta destino
                let tipoCuentaDestTemp: any;

                //Monto
                this.formMovBancario.get('cantidad').setValue(result.extMov1.monto);

                //Beneficiario
                this.clienteId = result.clienteId;
                this.formMovBancario.get('beneficiario').setValue(result.extMov1.beneficiario);

                //Concepto
                this.formMovBancario.get('concepto').setValue(result.concepto);

                //Set con retardo valores
                setTimeout(() => {

                    this.formMovBancario.get('tipoCuenta').setValue(tipoCuentaOriTemp[0]);
                    this.formMovBancario.get('cuentaBancOri').setValue(cuentaOriTempo[0]);
                    this.spsSaldoCuenta(cuentaOriTempo[0].claveCuenta);

                    this.isDisabledButtonAM = true;

                    //Movimiento transito.
                    if (result.extMov1.tipoMovimiento.claveTipoMov == cRetiroCh) {
                        this.formMovBancario.get('transito').setValue(result.extMov2.transito);
                    }

                    //Traspasos
                    if (result.extMov1.tipoMovimiento.claveTipoMov == cTraspasoO || result.extMov1.tipoMovimiento.claveTipoMov == cTraspasoD) {
                        sucDest = this.listaSucursalesDest.filter((cuentaDest: any) => cuentaDest.sucursalid === cuentaDestTempo[0].sucursalId);
                        tipoCuentaDestTemp = this.listaTipoCuentaDest.filter((tipoCuentaDes: any) => tipoCuentaDes.generalesId === cuentaDestTempo[0].tipoCuentaId);

                        this.formMovBancario.get('sucursalDest').setValue(sucDest[0]);
                        this.formMovBancario.get('tipoCuentaDest').setValue(tipoCuentaDestTemp[0]);
                        this.formMovBancario.get('cuentaBancoDest').setValue(cuentaDestTempo[0]);

                        this.spsSaldoCuentaDest(cuentaDestTempo[0].claveCuenta);


                        this.isDisabledButtonAM = false;

                    }


                    //Movimiento detalle.
                    let listaCuentasContMovTemp = JSON.parse(result.extMov2.movimientosPoliza);

                    listaCuentasContMovTemp.forEach((resp: any) => {

                        let cuenta = {
                            "cuentaContableId": resp.cuenta_id,
                            "cuentaContable": resp.cuenta,
                            "ref": resp.referencia,
                            "concepto": resp.descripcion,
                            "cveTipoMov": resp.clave_tipo,
                            "debe": Number(resp.debe),
                            "haber": Number(resp.haber)
                        }

                        this.listaCuentasContMov.push(cuenta);

                    })

                    this.dataSourceCuentas = new MatTableDataSource(this.listaCuentasContMov);



                }, 5);


                //Habilitar cancelar
                this.isEditVisible = true;

                //Datos generales
                this.polizaId = result.extMov1.poliza.polizaId;
                this.claveMovimiento = result.claveMovimiento;
                this.claseMovimiento = result.extMov2.claseMovimiento.descripcion;
                this.usuario = result.extMov2.usuarioNom;
                this.isActivo = result.extMov2.estatus;
                this.CurrentDate = result.extMov1.fechaHora;


            }
        });
    }
    /**
     * 
     * @param data Infomacion de la poliza
     */
    abrirPolizaInversion() {

        const dialogRef = this.dialog.open(PolizaInversionComponent, {
            //width: '1000px',
            disableClose: true,
            data: {
                concepto:this.formMovBancario.get("concepto").value,
                idPol: this.polizaId,
                cantidad: this.formMovBancario.get('cantidad').value,
                cveCuenta:this.formMovBancario.get('cuentaBancOri').value
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {

        });
    }
    ////////////////////// FIN DIALOGS ////////////////////////////////////

    /** Total debe. */
    getTotalDebe() {
        return this.listaCuentasContMov.map(t => t.debe).reduce((acc, value) => acc + value, 0);
    }

    /** Total haber. */
    getTotalHaber() {
        return this.listaCuentasContMov.map(t => t.haber).reduce((acc, value) => acc + value, 0);
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
     * Método para validaciones personalizadas.
     */
    public validacionesPersonalizadas() {

        //Cuenta bancaria origen igual a destino.
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO || this.tipoMovimiento.value.claveTipoMov == cTraspasoD) {

            if (this.formMovBancario.get('cuentaBancOri').value.cuentaBancariaID ===
                this.formMovBancario.get('cuentaBancoDest').value.cuentaBancariaID) {

                this.formMovBancario.controls['cuentaBancoDest'].setErrors({ cuentaIgual: true });

            }
        }

        //Validar saldo de la cuenta origen en retiro, traspasoO, retiro cheque
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoO ||
            this.tipoMovimiento.value.claveTipoMov == cRetiro ||
            this.tipoMovimiento.value.claveTipoMov == cRetiroCh) {

            if (this.saldo < this.formMovBancario.get('cantidad').value) {
                this.formMovBancario.controls['cantidad'].setErrors({ saldoInsuficiente: true });

            }

        }

        //Validar saldo de la cuenta origen en retiro, traspasoO, retiro cheque
        if (this.tipoMovimiento.value.claveTipoMov == cTraspasoD) {

            if (this.saldoDest < this.formMovBancario.get('cantidad').value) {
                this.formMovBancario.controls['cantidad'].setErrors({ saldoInsuficienteDestino: true });
            }

        }

        //Validar Cantidad = 0;
        if (Number(this.formMovBancario.get('cantidad').value) === 0) {
            this.formMovBancario.controls['cantidad'].setErrors({ cantidadCero: true });
        }


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
            { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' },
            { type: 'saldoInsuficiente', message: 'No cuenta con saldo suficiente para realizar la transacción.' },
            { type: 'saldoInsuficienteDestino', message: 'La cuenta destino no tiene saldo suficiente para realizar la transacción.' },
            { type: 'cantidadCero', message: 'La cantidad debe ser mayor a cero.' },
        ],
        'beneficiario': [
            { type: 'required', message: 'Benficiario requerido.' },
            { type: 'maxlength', message: 'El tamaño máximo es de 255 caracteres.' }
        ],
        'concepto': [
            { type: 'required', message: 'Concepto requerido.' },
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
        'formaPago': [
            { type: 'required', message: 'Forma pago requerida.' }
        ]
    }


}