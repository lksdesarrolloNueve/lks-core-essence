import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog} from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatSlideToggleChange } from "@angular/material/slide-toggle";
import { MatSelectionListChange } from "@angular/material/list";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { globales } from '../../../../environments/globales.config';

@Component({
    selector: 'movimientos-caja',
    moduleId: module.id,
    templateUrl: 'movimientos-caja.component.html'
})


/**
 * @autor: Victor Daniel Loza Cruz
 * @version: 1.0.0
 * @fecha: 18/10/2021
 * @descripcion: Componente para la gestion de Movimientos Caja
 */
export class MovimientosCajaComponent implements OnInit {

    /**
     * Declaracion de variables y controles
     */
    @BlockUI() blockUI: NgBlockUI;
    opcionesMovCajas: Observable<string[]>;
    opcionesCDepositos: Observable<string[]>;
    opcionesCRetiros: Observable<string[]>;
    opcionesCIVA: Observable<string[]>;
    opcionesCOrdenAcreedor: Observable<string[]>;
    opcionesCOrdenDeudor: Observable<string[]>;
    opcionesCIDE: Observable<string[]>;
    opcionesCGastoInteres: Observable<string[]>;
    opcionesCPasivoInteres: Observable<string[]>;
    opcionesCISR: Observable<string[]>;
    opcionesCProvisionISR: Observable<string[]>;
    opcionesCComision: Observable<string[]>;
    filteredSucursales: Observable<string[]>;
    filteredTipoSocios: Observable<string[]>;

    filteredFormaPagos: Observable<string[]>;

    dataSourceMovimientoCajas: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    listSucursales: any[];
    listaMovCaja: any[];
    listaCuentasContables: any[];
    listaTipoSocios: any[];
    listaAgregaTipoSocios: any[] = [];
    listaFormaPagos: any[];
    listaAgregaFormaPagos: any[] = [];
    listaAgregaSucursales: any[] = [];
    arrayIdsFP: any[] = [];
    arrayIdsTS: any[] = [];
    arrayIdsFPR: any[] = [];
    arrayIdsTSR: any[] = [];
    arrayIdsSuc: any[] = [];

    listaEliminadosTipoSocios: any[] = [];
    listaEliminadosFormaPagos: any[] = [];

    movimientoCajaID: number = 0;
    cveMovCaja: string = "";
    movimientoCaja: any;

    formListaMovimientoCaja: UntypedFormGroup;
    tipoSocios = new UntypedFormControl('');
    formaPagos = new UntypedFormControl('');
    sucursales = new UntypedFormControl([]);

    opcion = 0;

    //Variables Chips formas de pago y tipos socios
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('tipoSociosInput') tipoSociosInput: ElementRef<HTMLInputElement>;
    @ViewChild('formaPagosInput') formaPagosInput: ElementRef<HTMLInputElement>;
    @ViewChild('sucursalesInput') sucursalesInput: ElementRef<HTMLInputElement>;

    //Variables para la validación del Slide-toggle
    isSlideCheckedUDIS: boolean = false;
    isSlideCheckedProcRec: boolean = false;
    isSlideCheckedIVA: boolean = false;
    isSlideCheckedComision: boolean = false;
    isSlideCheckedPagaInteres: boolean = false;
    isSlideCheckedIDE: boolean = false;
    isSlideCheckedPagaISR: boolean = false;
    isSlideCheckedOrden: boolean = false;

    //Botones boolean
    mostrarGuardar: boolean = true;
    mostrarEditar: boolean = false;

    seleccionado: boolean;
    allSelected: boolean;
    showMovimientoCaja: boolean = false;


    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;

    public readonly listTestSucursal = new UntypedFormControl([]);

    /**
     * Constructor de la clase MovimientosCajaComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, private fomrBuilder: UntypedFormBuilder, public dialog: MatDialog) {

        this.listaAgregaTipoSocios = [];
        this.listaAgregaFormaPagos = [];
        this.listaEliminadosTipoSocios = [];
        this.listaEliminadosFormaPagos = [];
        this.listaAgregaSucursales = [];
        this.arrayIdsFPR = [];
        this.arrayIdsTSR = [];
        this.arrayIdsFP = [];
        this.arrayIdsTS = [];
        this.formListaMovimientoCaja = this.fomrBuilder.group({
            cveMovCaja: new UntypedFormControl('', [Validators.required, Validators.maxLength(6)]),
            nombreMovimiento: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            montoMinimo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            montoMaximo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            estatusMovCaja: new UntypedFormControl(true),
            saldoMinimo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            saldoPromInteres: new UntypedFormControl('', [Validators.pattern('[0-9]*\.?[0-9]*')]),
            tasaInteres: new UntypedFormControl('', [Validators.pattern('[0-9]*\.?[0-9]*')]),
            retieneISR: new UntypedFormControl(false),
            vistaEnSaldo: new UntypedFormControl(false),
            aceptaDepositos: new UntypedFormControl(false),
            aceptaRetiros: new UntypedFormControl(false),
            aplicaUdis: new UntypedFormControl(false),
            tutorSocioMenor: new UntypedFormControl(false),
            limiteUdis: new UntypedFormControl('', [Validators.pattern('[0-9]*\.?[0-9]*')]),
            aplicaProceRecursos: new UntypedFormControl(false),
            limiteProceRecursos: new UntypedFormControl('', [Validators.pattern('[0-9]*\.?[0-9]*')]),
            aplicaComision: new UntypedFormControl(false),
            saldoComision: new UntypedFormControl('', [Validators.pattern('[0-9]*\.?[0-9]*')]),
            aplicaIde: new UntypedFormControl(false),
            pagaInteres: new UntypedFormControl(false),
            aplicaIva: new UntypedFormControl(false),
            manejaCuentasOrden: new UntypedFormControl(false),
            diasInactivar: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            cuentaDeposito: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cuentaRetiro: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cuentaIva: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaOrdenAcreedor: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaOrdenDeudor: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaIDE: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaGastoInteres: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaPasivoInteres: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaISR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaProvisionISR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            cuentaComision: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),

        });

    }


    /**
     * metodo OnInit de la clase MovimientosCaja para iniciar las listas
     */
    ngOnInit() {
        this.spsMovimientosCaja();
        this.spsCuentasContables();
        this.spsTipoSocio();
        this.spsFormaPago();
        this.nuevoMovimientoCaja();
        this.activarSlideToggle();
        this.spsSucurales();
    }

    /**
     * activa los interruptores en el formulario
     */
    activarSlideToggle() {
        this.formListaMovimientoCaja.get('estatusMovCaja').setValue(true);
        this.formListaMovimientoCaja.get('vistaEnSaldo').setValue(false);
        this.formListaMovimientoCaja.get('aceptaDepositos').setValue(false);
        this.formListaMovimientoCaja.get('aceptaRetiros').setValue(false);
        this.formListaMovimientoCaja.get('retieneISR').setValue(false);
        this.formListaMovimientoCaja.get('aplicaUdis').setValue(false);
        this.formListaMovimientoCaja.get('tutorSocioMenor').setValue(false);
        this.formListaMovimientoCaja.get('aplicaProceRecursos').setValue(false);
        this.formListaMovimientoCaja.get('aplicaComision').setValue(false);
        this.formListaMovimientoCaja.get('aplicaIde').setValue(false);
        this.formListaMovimientoCaja.get('pagaInteres').setValue(false);
        this.formListaMovimientoCaja.get('aplicaIva').setValue(false);
        this.formListaMovimientoCaja.get('manejaCuentasOrden').setValue(false);
    }



    /**
     * Metodo que consulta los Movimientos Cajas
     */
    spsMovimientosCaja() {

        this.blockUI.start('Cargando datos...');
        let path = "NULL" + '/' + 1;
        this.service.getListByID(path, 'listaMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaMovCaja = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Metodo que consulta las Formas de Pago del Movimiento Cajas
     */
    spsFPagoMovCaja(elemento: any) {

        this.blockUI.start('Cargando datos...');
        let path = elemento + '/' + 1;
        this.service.getListByID(path, 'listaFormaPagoMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaAgregaFormaPagos = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Metodo que consulta los Tipos de Socios del Movimiento Cajas
     */
    spsTSocioMovCaja(elemento: any) {

        this.blockUI.start('Cargando datos...');
        let path = elemento + '/' + 1;
        this.service.getListByID(path, 'listaTipoSocioMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaAgregaTipoSocios = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }


    /**
     * Metodo que consulta las sucursales del Movimiento Cajas
     */
    spsSucursalesMovCaja(elemento: any) {

        this.blockUI.start('Cargando datos...');
        let path = elemento.trim();
        this.service.getListByID(path, 'listaSucursalMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaAgregaSucursales = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    updateSucursal(event: MatSelectionListChange) {

        /** 
         * opcion = 0 Nuevo registro
         * opcion = 1 Registro a editar
         * Se verifica si la opcion es 0 para agregarle a mi 
         * lista listaAgregaSucursales las sucursales de listSucursales 
         * para trabajar sobre ella, ya sea seleccionar o deseleccionar una sucursal
         * valida si el valor = 0, es porque ha seleccionado todas las sucursales
        */
        if (this.opcion === 0 || this.listaAgregaSucursales.length === 0) {
            this.listaAgregaSucursales = this.listSucursales;
        }


        /** 
         * Recorremos la lista listaAgregaSucursales 
         * para seleccionar o deseleccionar la sucursal
        */
        for (let x of this.listaAgregaSucursales) {
            /** Si el id de la sucursal que manda el evento es igual a la de la lista lista
             * Realiza la accion 
             * Si el valor = 0 pone todas las sucursales en true o false
             * Si el valor != 0 pone la sucursal en especifico en true o false
             */
            
            if (event.options[0].value != -1) {
                if (x.sucursalid === event.options[0].value.sucursalid) {
                    x.seleccionado = event.options[0].selected;
                }
            } else {
                x.seleccionado = event.options[0].selected;
            }

        }

    }

    /**
     * Filtrado de  Movimientos Cajas por clave
     */
    spsMovimientosCajaByCveMov(elemento: any, nombre: any) {
        this.opcion = 1;
        this.mostrarEditar = true;
        this.mostrarGuardar = false;
        this.showMovimientoCaja = true;
        this.movimientoCaja = elemento +' / '+ nombre;
        this.blockUI.start('Cargando datos...');
        let path = elemento + '/' + 4;
        this.spsFPagoMovCaja(elemento);
        this.spsTSocioMovCaja(elemento);
        this.spsSucursalesMovCaja(elemento);
        this.service.getListByID(path, 'listaMovCaja').subscribe(
            data => {
                this.blockUI.stop();

                this.movimientoCajaID = data[0].catMovimientoCajaID;
                this.formListaMovimientoCaja.get('cveMovCaja').setValue(data[0].cveMovCaja);
                this.formListaMovimientoCaja.get('nombreMovimiento').setValue(data[0].nombreMovimiento);
                this.formListaMovimientoCaja.get('montoMinimo').setValue(data[0].montoMinimo);
                this.formListaMovimientoCaja.get('montoMaximo').setValue(data[0].montoMaximo);
                this.formListaMovimientoCaja.get('estatusMovCaja').setValue(data[0].estatusMovCaja);
                this.formListaMovimientoCaja.get('vistaEnSaldo').setValue(data[0].exMovCaja.vistaEnSaldo);
                this.formListaMovimientoCaja.get('aceptaDepositos').setValue(data[0].exMovCaja.aceptaDepositos);
                this.formListaMovimientoCaja.get('aceptaRetiros').setValue(data[0].exMovCaja.aceptaRetiros);
                this.formListaMovimientoCaja.get('aplicaProceRecursos').setValue(data[0].ex2MovCaja.aplicaProceRecursos);
                this.formListaMovimientoCaja.get('limiteProceRecursos').setValue(data[0].ex2MovCaja.limiteProceRecursos);
                this.formListaMovimientoCaja.get('saldoMinimo').setValue(data[0].exMovCaja.saldoMinimo);
                this.formListaMovimientoCaja.get('diasInactivar').setValue(data[0].ex2MovCaja.diasInactivar);
                this.formListaMovimientoCaja.get('aplicaUdis').setValue(data[0].exMovCaja.aplicaUdis);
                this.formListaMovimientoCaja.get('limiteUdis').setValue(data[0].exMovCaja.limiteUdis);
                this.formListaMovimientoCaja.get('tutorSocioMenor').setValue(data[0].exMovCaja.tutorSocioMenor);
                this.formListaMovimientoCaja.get('cuentaDeposito').setValue(data[0].exMovCajaCuentCont.cuentaDeposito);
                this.formListaMovimientoCaja.get('cuentaRetiro').setValue(data[0].exMovCajaCuentCont.cuentaRetiro);
                this.formListaMovimientoCaja.get('aplicaIva').setValue(data[0].ex2MovCaja.aplicaIva);
                this.formListaMovimientoCaja.get('cuentaIva').setValue(data[0].exMovCajaCuentCont.cuentaIva);
                this.formListaMovimientoCaja.get('aplicaComision').setValue(data[0].ex2MovCaja.aplicaComision);
                this.formListaMovimientoCaja.get('saldoComision').setValue(data[0].ex2MovCaja.saldoComision);
                this.formListaMovimientoCaja.get('cuentaComision').setValue(data[0].ex2MovCajaCuentCont.cuentaComision);
                this.formListaMovimientoCaja.get('tasaInteres').setValue(data[0].exMovCaja.tasaInteres);
                this.formListaMovimientoCaja.get('saldoPromInteres').setValue(data[0].exMovCaja.saldoPromInteres);
                this.formListaMovimientoCaja.get('pagaInteres').setValue(data[0].ex2MovCaja.pagaInteres);
                this.formListaMovimientoCaja.get('cuentaPasivoInteres').setValue(data[0].exMovCajaCuentCont.cuentaPasivoInteres);
                this.formListaMovimientoCaja.get('cuentaGastoInteres').setValue(data[0].exMovCajaCuentCont.cuentaGastoInteres);
                this.formListaMovimientoCaja.get('aplicaIde').setValue(data[0].ex2MovCaja.aplicaIde);
                this.formListaMovimientoCaja.get('cuentaIDE').setValue(data[0].exMovCajaCuentCont.cuentaIDE);
                this.formListaMovimientoCaja.get('retieneISR').setValue(data[0].exMovCaja.retieneISR);
                this.formListaMovimientoCaja.get('cuentaISR').setValue(data[0].exMovCajaCuentCont.cuentaISR);
                this.formListaMovimientoCaja.get('cuentaProvisionISR').setValue(data[0].exMovCajaCuentCont.cuentaProvisionISR);
                this.formListaMovimientoCaja.get('manejaCuentasOrden').setValue(data[0].ex2MovCaja.manejaCuentasOrden);
                this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').setValue(data[0].exMovCajaCuentCont.cuentaOrdenAcreedor);
                this.formListaMovimientoCaja.get('cuentaOrdenDeudor').setValue(data[0].exMovCajaCuentCont.cuentaOrdenDeudor);

                //Pasa el valor de los interruptores
                this.isSlideCheckedUDIS = data[0].exMovCaja.aplicaUdis;
                this.isSlideCheckedProcRec = data[0].ex2MovCaja.aplicaProceRecursos;
                this.isSlideCheckedIVA = data[0].ex2MovCaja.aplicaIva;
                this.isSlideCheckedComision = data[0].ex2MovCaja.aplicaComision;
                this.isSlideCheckedPagaInteres = data[0].ex2MovCaja.pagaInteres;
                this.isSlideCheckedIDE = data[0].ex2MovCaja.aplicaIde;
                this.isSlideCheckedPagaISR = data[0].exMovCaja.retieneISR;
                this.isSlideCheckedOrden = data[0].ex2MovCaja.manejaCuentasOrden;

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * Metodo que consulta las cuentas contables
     */
    spsCuentasContables() {

        this.blockUI.start('Cargando datos...');

        // Consumo de api para obtener las cuentas contables
        this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
            this.blockUI.stop();
            //obtiene las cuentas contables filtrandolas por afectables
            this.listaCuentasContables = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');// && result.extencionCuentaContable.rubro.descripcion === 'ACTIVO');

            // Se setean las cuentas contables para cada campo de la vista
            this.opcionesCDepositos = this.formListaMovimientoCaja.get('cuentaDeposito').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCRetiros = this.formListaMovimientoCaja.get('cuentaRetiro').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCIVA = this.formListaMovimientoCaja.get('cuentaIva').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCOrdenAcreedor = this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCOrdenDeudor = this.formListaMovimientoCaja.get('cuentaOrdenDeudor').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCIDE = this.formListaMovimientoCaja.get('cuentaIDE').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCGastoInteres = this.formListaMovimientoCaja.get('cuentaGastoInteres').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCPasivoInteres = this.formListaMovimientoCaja.get('cuentaPasivoInteres').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCISR = this.formListaMovimientoCaja.get('cuentaISR').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCProvisionISR = this.formListaMovimientoCaja.get('cuentaProvisionISR').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCComision = this.formListaMovimientoCaja.get('cuentaComision').valueChanges.
                pipe(startWith(''), map(value => this._filterCuenta(value)));

        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
    * Metodo para cargar los tipos de socios que existen
    */
    spsTipoSocio() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaTipoSocio').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoSocios = data;
            this.filteredTipoSocios = this.tipoSocios.valueChanges.pipe(
                startWith(null),
                map((tipoSocio: string | null) => tipoSocio ? this._filterTipoSocio(tipoSocio) : this.listaTipoSocios.slice()));

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
    * Metodo para cargar las formas de pagos que existen
    */
    spsFormaPago() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaFormasPago').subscribe(dataFPago => {
            this.blockUI.stop();
            this.listaFormaPagos = dataFPago;
            this.filteredFormaPagos = this.formaPagos.valueChanges.pipe(
                startWith(null),
                map((formaPago: string | null) => formaPago ? this._filterFormaPago(formaPago) : this.listaFormaPagos.slice()));

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
    * Metodo para obtener la lista sucursales
    */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(dataSuc => {

            this.blockUI.stop();

            // se declara la lista para mostrar la información en vacia
            this.listSucursales = [];


            dataSuc.forEach(result => {
                let jsonLineal = {
                    "sucursalid": result.sucursalid,
                    "cveSucursal": result.cveSucursal,
                    "nombreSucursal": result.nombreSucursal,
                    "seleccionado": false,
                }
                this.listSucursales.push(jsonLineal)
            });

            this.filteredSucursales = this.sucursales.valueChanges.pipe(
                startWith(null),
                map((sucursales: string | null) => sucursales ? this._filterSucursal(sucursales) : this.listSucursales.slice()));


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo para guardar un movimiento caja
     */
    guardarMovimientoCaja(): void {

        //valida los campos del formulario
        if (this.formListaMovimientoCaja.invalid) {
            this.validateAllFormFields(this.formListaMovimientoCaja);
            return;
        }

        // se validan los datos si van en null y les setea un 0
        let cuentaIva: any

        if (!this.formListaMovimientoCaja.get('cuentaIva').value) {
            cuentaIva = { "cuentaid": "0" }

        } else {
            cuentaIva = this.formListaMovimientoCaja.get('cuentaIva').value
        }

        let cuentaOrdenAcreedor: any

        if (!this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').value) {
            cuentaOrdenAcreedor = { "cuentaid": "0" }
        } else {
            cuentaOrdenAcreedor = this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').value
        }

        let cuentaOrdenDeudor: any

        if (!this.formListaMovimientoCaja.get('cuentaOrdenDeudor').value) {
            cuentaOrdenDeudor = { "cuentaid": "0" }
        } else {
            cuentaOrdenDeudor = this.formListaMovimientoCaja.get('cuentaOrdenDeudor').value
        }
        let cuentaIDE: any

        if (!this.formListaMovimientoCaja.get('cuentaIDE').value) {
            cuentaIDE = { "cuentaid": "0" }
        } else {
            cuentaIDE = this.formListaMovimientoCaja.get('cuentaIDE').value
        }

        let cuentaGastoInteres: any

        if (!this.formListaMovimientoCaja.get('cuentaGastoInteres').value) {
            cuentaGastoInteres = { "cuentaid": "0" }
        } else {
            cuentaGastoInteres = this.formListaMovimientoCaja.get('cuentaGastoInteres').value
        }

        let cuentaPasivoInteres: any

        if (!this.formListaMovimientoCaja.get('cuentaPasivoInteres').value) {
            cuentaPasivoInteres = { "cuentaid": "0" }
        } else {
            cuentaPasivoInteres = this.formListaMovimientoCaja.get('cuentaPasivoInteres').value
        }

        let cuentaISR: any

        if (!this.formListaMovimientoCaja.get('cuentaISR').value) {
            cuentaISR = { "cuentaid": "0" }
        } else {
            cuentaISR = this.formListaMovimientoCaja.get('cuentaISR').value
        }

        let cuentaProvisionISR: any

        if (!this.formListaMovimientoCaja.get('cuentaProvisionISR').value) {
            cuentaProvisionISR = { "cuentaid": "0" }
        } else {
            cuentaProvisionISR = this.formListaMovimientoCaja.get('cuentaProvisionISR').value
        }

        let cuentaComision: any

        if (!this.formListaMovimientoCaja.get('cuentaComision').value) {
            cuentaComision = { "cuentaid": "0" }
        } else {
            cuentaComision = this.formListaMovimientoCaja.get('cuentaComision').value
        }

        let limiteProceRecursos = 0;

        if (!this.formListaMovimientoCaja.get('limiteProceRecursos').value) {
            limiteProceRecursos;
        } else {
            limiteProceRecursos = this.formListaMovimientoCaja.get('limiteProceRecursos').value
        }

        let limiteUdis = 0;

        if (!this.formListaMovimientoCaja.get('limiteUdis').value) {
            limiteUdis;
        } else {
            limiteUdis = this.formListaMovimientoCaja.get('limiteUdis').value
        }

        let saldoComision = 0;

        if (!this.formListaMovimientoCaja.get('saldoComision').value) {
            saldoComision;
        } else {
            saldoComision = this.formListaMovimientoCaja.get('saldoComision').value
        }

        let saldoPromInteres = 0;

        if (!this.formListaMovimientoCaja.get('saldoPromInteres').value) {
            saldoPromInteres;
        } else {
            saldoPromInteres = this.formListaMovimientoCaja.get('saldoPromInteres').value
        }

        let tasaInteres = 0;

        if (!this.formListaMovimientoCaja.get('tasaInteres').value) {
            tasaInteres;
        } else {
            tasaInteres = this.formListaMovimientoCaja.get('tasaInteres').value
        }

        //recorre las listas agregando los ID del tipo socio
        for (let idsTS of this.listaAgregaTipoSocios) {
            this.arrayIdsTS.push(idsTS.tipoSocioid);
        }

        //recorre las listas agregando los ID de la forma de pago
        for (let idsFP of this.listaAgregaFormaPagos) {
            this.arrayIdsFP.push(idsFP.fpagoid);
        }

        //recorre las listas agregando los ID de la sucursales y el seleccionado
        for (let x of this.listaAgregaSucursales) {
            this.arrayIdsSuc.push([x.sucursalid, x.seleccionado])
        }

        // valida si el arreglo va vacio setea 0
        if (this.arrayIdsTS.length === 0) {
            this.arrayIdsTS.push('0');
        }

        // valida si el arreglo va vacio setea 0
        if (this.arrayIdsFP.length === 0) {
            this.arrayIdsFP.push('0');
        }

        // valida si el arreglo va vacio setea 0
        if (this.arrayIdsSuc.length === 0) {
            this.arrayIdsSuc.push('0');
        }

        //valida que el monto míimo no sea mayo al monto máximo
        if (this.formListaMovimientoCaja.get('montoMinimo').value > this.formListaMovimientoCaja.get('montoMaximo').value) {
            this.service.showNotification('top', 'right', 4, "El Monto Mínimo no debe ser mayor al Monto Máximo");
            return;
        }

        //valida que el saldo míimo no sea mayo al monto máximo
        if (this.formListaMovimientoCaja.get('saldoMinimo').value > this.formListaMovimientoCaja.get('montoMaximo').value) {
            this.service.showNotification('top', 'right', 4, "El Saldo Mínimo no debe ser mayor al Monto Máximo");
            return;
        }

        this.blockUI.start('Guardando ...');

        const dataMov = {
            "movCajas": {
                "catMovimientoCajaID": 0,
                "cveMovCaja": this.formListaMovimientoCaja.get('cveMovCaja').value,
                "nombreMovimiento": this.formListaMovimientoCaja.get('nombreMovimiento').value,
                "montoMinimo": this.formListaMovimientoCaja.get('montoMinimo').value,
                "montoMaximo": this.formListaMovimientoCaja.get('montoMaximo').value,
                "estatusMovCaja": this.formListaMovimientoCaja.get('estatusMovCaja').value,
                "exMovCaja": {
                    "saldoMinimo": this.formListaMovimientoCaja.get('saldoMinimo').value,
                    "saldoPromInteres": saldoPromInteres,
                    "tasaInteres": tasaInteres,
                    "retieneISR": this.formListaMovimientoCaja.get('retieneISR').value,
                    "vistaEnSaldo": this.formListaMovimientoCaja.get('vistaEnSaldo').value,
                    "aceptaDepositos": this.formListaMovimientoCaja.get('aceptaDepositos').value,
                    "aceptaRetiros": this.formListaMovimientoCaja.get('aceptaRetiros').value,
                    "aplicaUdis": this.formListaMovimientoCaja.get('aplicaUdis').value,
                    "tutorSocioMenor": this.formListaMovimientoCaja.get('tutorSocioMenor').value,
                    "limiteUdis": limiteUdis
                },
                "ex2MovCaja": {
                    "aplicaProceRecursos": this.formListaMovimientoCaja.get('aplicaProceRecursos').value,
                    "limiteProceRecursos": limiteProceRecursos,
                    "aplicaComision": this.formListaMovimientoCaja.get('aplicaComision').value,
                    "saldoComision": saldoComision,
                    "aplicaIde": this.formListaMovimientoCaja.get('aplicaIde').value,
                    "pagaInteres": this.formListaMovimientoCaja.get('pagaInteres').value,
                    "aplicaIva": this.formListaMovimientoCaja.get('aplicaIva').value,
                    "manejaCuentasOrden": this.formListaMovimientoCaja.get('manejaCuentasOrden').value,
                    "diasInactivar": this.formListaMovimientoCaja.get('diasInactivar').value
                },
                "exMovCajaCuentCont": {
                    "cuentaDeposito": this.formListaMovimientoCaja.get('cuentaDeposito').value,
                    "cuentaRetiro": this.formListaMovimientoCaja.get('cuentaRetiro').value,
                    "cuentaIva": cuentaIva,
                    "cuentaOrdenAcreedor": cuentaOrdenAcreedor,
                    "cuentaOrdenDeudor": cuentaOrdenDeudor,
                    "cuentaIDE": cuentaIDE,
                    "cuentaGastoInteres": cuentaGastoInteres,
                    "cuentaPasivoInteres": cuentaPasivoInteres,
                    "cuentaISR": cuentaISR,
                    "cuentaProvisionISR": cuentaProvisionISR
                },
                "ex2MovCajaCuentCont": {
                    "cuentaComision": cuentaComision
                }
            },
            "formaPago": this.arrayIdsFP,
            "tipoSocio": this.arrayIdsTS,
            "sucursal": this.arrayIdsSuc,
            "formaPagoDelete": this.arrayIdsFPR,
            "tipoSocioDelete": this.arrayIdsTSR,
            "accion": 1

        };

        this.service.registrar(dataMov, 'crudMovCaja').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.spsMovimientosCaja();
                    this.formListaMovimientoCaja.reset();
                    this.nuevoMovimientoCaja();
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                //limipia los arreglos en caso de que truene la compilación
                this.arrayIdsFPR = [];
                this.arrayIdsTSR = [];
                this.arrayIdsFP = [];
                this.arrayIdsTS = [];
                this.arrayIdsSuc = [];
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }

    /**
     * Metodo para editar un movimiento caja
     */
    editarMovimientoCaja(): void {
        //valida los campos del formulario
        if (this.formListaMovimientoCaja.invalid) {

            this.validateAllFormFields(this.formListaMovimientoCaja);
            return;
        }

        // se validan los datos si van en null y les setea un 0
        let cuentaIva: any

        if (!this.formListaMovimientoCaja.get('cuentaIva').value) {
            cuentaIva = { "cuentaid": "0" }

        } else {
            cuentaIva = this.formListaMovimientoCaja.get('cuentaIva').value
        }

        let cuentaOrdenAcreedor: any

        if (!this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').value) {
            cuentaOrdenAcreedor = { "cuentaid": "0" }
        } else {
            cuentaOrdenAcreedor = this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').value
        }

        let cuentaOrdenDeudor: any

        if (!this.formListaMovimientoCaja.get('cuentaOrdenDeudor').value) {
            cuentaOrdenDeudor = { "cuentaid": "0" }
        } else {
            cuentaOrdenDeudor = this.formListaMovimientoCaja.get('cuentaOrdenDeudor').value
        }
        let cuentaIDE: any

        if (!this.formListaMovimientoCaja.get('cuentaIDE').value) {
            cuentaIDE = { "cuentaid": "0" }
        } else {
            cuentaIDE = this.formListaMovimientoCaja.get('cuentaIDE').value
        }

        let cuentaGastoInteres: any

        if (!this.formListaMovimientoCaja.get('cuentaGastoInteres').value) {
            cuentaGastoInteres = { "cuentaid": "0" }
        } else {
            cuentaGastoInteres = this.formListaMovimientoCaja.get('cuentaGastoInteres').value
        }

        let cuentaPasivoInteres: any

        if (!this.formListaMovimientoCaja.get('cuentaPasivoInteres').value) {
            cuentaPasivoInteres = { "cuentaid": "0" }
        } else {
            cuentaPasivoInteres = this.formListaMovimientoCaja.get('cuentaPasivoInteres').value
        }

        let cuentaISR: any

        if (!this.formListaMovimientoCaja.get('cuentaISR').value) {
            cuentaISR = { "cuentaid": "0" }
        } else {
            cuentaISR = this.formListaMovimientoCaja.get('cuentaISR').value
        }

        let cuentaProvisionISR: any

        if (!this.formListaMovimientoCaja.get('cuentaProvisionISR').value) {
            cuentaProvisionISR = { "cuentaid": "0" }
        } else {
            cuentaProvisionISR = this.formListaMovimientoCaja.get('cuentaProvisionISR').value
        }

        let cuentaComision: any

        if (!this.formListaMovimientoCaja.get('cuentaComision').value) {
            cuentaComision = { "cuentaid": "0" }
        } else {
            cuentaComision = this.formListaMovimientoCaja.get('cuentaComision').value
        }

        let limiteProceRecursos = 0;

        if (!this.formListaMovimientoCaja.get('limiteProceRecursos').value) {
            limiteProceRecursos;
        } else {
            limiteProceRecursos = this.formListaMovimientoCaja.get('limiteProceRecursos').value
        }

        let limiteUdis = 0;

        if (!this.formListaMovimientoCaja.get('limiteUdis').value) {
            limiteUdis;
        } else {
            limiteUdis = this.formListaMovimientoCaja.get('limiteUdis').value
        }

        let saldoComision = 0;

        if (!this.formListaMovimientoCaja.get('saldoComision').value) {
            saldoComision;
        } else {
            saldoComision = this.formListaMovimientoCaja.get('saldoComision').value
        }

        let saldoPromInteres = 0;

        if (!this.formListaMovimientoCaja.get('saldoPromInteres').value) {
            saldoPromInteres;
        } else {
            saldoPromInteres = this.formListaMovimientoCaja.get('saldoPromInteres').value
        }

        let tasaInteres = 0;

        if (!this.formListaMovimientoCaja.get('tasaInteres').value) {
            tasaInteres;
        } else {
            tasaInteres = this.formListaMovimientoCaja.get('tasaInteres').value
        }

        //recorre las listas agregando los ID del tipo socio
        for (let idsTS of this.listaAgregaTipoSocios) {
            this.arrayIdsTS.push(idsTS.tipoSocioid);
        }

        //recorre las listas agregando los ID de la forma de pago
        for (let idsFP of this.listaAgregaFormaPagos) {
            this.arrayIdsFP.push(idsFP.fpagoid);
        }

        //recorre las listas agregando los ID de la sucursales y el seleccionado
        for (let x of this.listaAgregaSucursales) {
            this.arrayIdsSuc.push([x.sucursalid, x.seleccionado])
        }

        //recorre las listas agregando los ID del tipo socio que seran eliminados
        for (let idsTSR of this.listaEliminadosTipoSocios) {
            this.arrayIdsTSR.push(idsTSR.tipoSocioid);
        }

        //recorre las listas agregando los ID de la forma de pago que seran eliminados 
        for (let idsFPR of this.listaEliminadosFormaPagos) {
            this.arrayIdsFPR.push(idsFPR.fpagoid);
        }

        // valida si viene vacio el arreglo, le concatena un 0
        if (this.arrayIdsTSR.length == 0) {
            this.arrayIdsTSR.push(0);
        }

        // valida si viene vacio el arreglo, le concatena un 0
        if (this.arrayIdsFPR.length == 0) {
            this.arrayIdsFPR.push(0);
        }

        //valida si el arreglo esta vacio setea 0
        if (this.arrayIdsTS.length === 0) {
            this.arrayIdsTS.push('0');
        }

        //valida si el arreglo esta vacio setea 0
        if (this.arrayIdsFP.length === 0) {
            this.arrayIdsFP.push('0');
        }

        // valida si el arreglo va vacio setea 0
        if (this.arrayIdsSuc.length === 0) {
            this.arrayIdsSuc.push('0');
        }

        //valida que el monto míimo no sea mayo al monto máximo
        if (this.formListaMovimientoCaja.get('montoMinimo').value > this.formListaMovimientoCaja.get('montoMaximo').value) {
            this.service.showNotification('top', 'right', 4, "El Monto Mínimo no debe ser mayor al Monto Máximo");
            return;
        }

        //valida que el saldo míimo no sea mayo al monto máximo
        if (this.formListaMovimientoCaja.get('saldoMinimo').value > this.formListaMovimientoCaja.get('montoMaximo').value) {
            this.service.showNotification('top', 'right', 4, "El Saldo Mínimo no debe ser mayor al Monto Máximo");
            return;
        }

        this.blockUI.start('Editando ...');

        const dataMovC = {
            "movCajas": {
                "catMovimientoCajaID": this.movimientoCajaID,
                "cveMovCaja": this.formListaMovimientoCaja.get('cveMovCaja').value,
                "nombreMovimiento": this.formListaMovimientoCaja.get('nombreMovimiento').value,
                "montoMinimo": this.formListaMovimientoCaja.get('montoMinimo').value,
                "montoMaximo": this.formListaMovimientoCaja.get('montoMaximo').value,
                "estatusMovCaja": this.formListaMovimientoCaja.get('estatusMovCaja').value,
                "exMovCaja": {
                    "saldoMinimo": this.formListaMovimientoCaja.get('saldoMinimo').value,
                    "saldoPromInteres": saldoPromInteres,
                    "tasaInteres": tasaInteres,
                    "retieneISR": this.formListaMovimientoCaja.get('retieneISR').value,
                    "vistaEnSaldo": this.formListaMovimientoCaja.get('vistaEnSaldo').value,
                    "aceptaDepositos": this.formListaMovimientoCaja.get('aceptaDepositos').value,
                    "aceptaRetiros": this.formListaMovimientoCaja.get('aceptaRetiros').value,
                    "aplicaUdis": this.formListaMovimientoCaja.get('aplicaUdis').value,
                    "tutorSocioMenor": this.formListaMovimientoCaja.get('tutorSocioMenor').value,
                    "limiteUdis": limiteUdis
                },
                "ex2MovCaja": {
                    "aplicaProceRecursos": this.formListaMovimientoCaja.get('aplicaProceRecursos').value,
                    "limiteProceRecursos": limiteProceRecursos,
                    "aplicaComision": this.formListaMovimientoCaja.get('aplicaComision').value,
                    "saldoComision": saldoComision,
                    "aplicaIde": this.formListaMovimientoCaja.get('aplicaIde').value,
                    "pagaInteres": this.formListaMovimientoCaja.get('pagaInteres').value,
                    "aplicaIva": this.formListaMovimientoCaja.get('aplicaIva').value,
                    "manejaCuentasOrden": this.formListaMovimientoCaja.get('manejaCuentasOrden').value,
                    "diasInactivar": this.formListaMovimientoCaja.get('diasInactivar').value
                },
                "exMovCajaCuentCont": {
                    "cuentaDeposito": this.formListaMovimientoCaja.get('cuentaDeposito').value,
                    "cuentaRetiro": this.formListaMovimientoCaja.get('cuentaRetiro').value,
                    "cuentaIva": cuentaIva,
                    "cuentaOrdenAcreedor": cuentaOrdenAcreedor,
                    "cuentaOrdenDeudor": cuentaOrdenDeudor,
                    "cuentaIDE": cuentaIDE,
                    "cuentaGastoInteres": cuentaGastoInteres,
                    "cuentaPasivoInteres": cuentaPasivoInteres,
                    "cuentaISR": cuentaISR,
                    "cuentaProvisionISR": cuentaProvisionISR
                },
                "ex2MovCajaCuentCont": {
                    "cuentaComision": cuentaComision
                }
            },
            "formaPago": this.arrayIdsFP,
            "tipoSocio": this.arrayIdsTS,
            "sucursal": this.arrayIdsSuc,
            "formaPagoDelete": this.arrayIdsFPR,
            "tipoSocioDelete": this.arrayIdsTSR,
            "accion": 2
        };
        this.service.registrar(dataMovC, 'crudMovCaja').subscribe(
            resultEditar => {

                this.blockUI.stop();
                if (resultEditar[0][0] === '0') {
                    this.spsMovimientosCaja();
                    this.formListaMovimientoCaja.reset();
                    this.nuevoMovimientoCaja();
                    this.service.showNotification('top', 'right', 2, resultEditar[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, resultEditar[0][1]);
                }

            }, errorEditar => {
                this.blockUI.stop();
                //limpia los arreglos en caso de que truene
                this.arrayIdsFPR = [];
                this.arrayIdsTSR = [];
                this.arrayIdsFP = [];
                this.arrayIdsTS = [];
                this.arrayIdsSuc = [];
                this.service.showNotification('top', 'right', 4, errorEditar.Message);
            }
        );

    }

    /**
     * Carga todos los combos y resetea el form
     */
    nuevoMovimientoCaja() {
        this.formListaMovimientoCaja.reset();
        this.spsCuentasContables();
        this.spsTipoSocio();
        this.spsFormaPago();
        this.spsMovimientosCaja();
        this.spsSucurales();
        this.listaAgregaTipoSocios = [];
        this.listaAgregaFormaPagos = [];
        this.listaAgregaSucursales = [];
        this.listaEliminadosTipoSocios = [];
        this.listaEliminadosFormaPagos = [];
        this.arrayIdsFPR = [];
        this.arrayIdsTSR = [];
        this.arrayIdsFP = [];
        this.arrayIdsTS = [];
        this.arrayIdsSuc = [];
        this.formListaMovimientoCaja.get('estatusMovCaja').setValue(true);
        this.isSlideCheckedUDIS = false;
        this.isSlideCheckedProcRec = false;
        this.isSlideCheckedIVA = false;
        this.isSlideCheckedComision = false;
        this.isSlideCheckedPagaInteres = false;
        this.isSlideCheckedIDE = false;
        this.isSlideCheckedPagaISR = false;
        this.isSlideCheckedOrden = false;
        this.mostrarEditar = false;
        this.mostrarGuardar = true;
        this.opcion = 0;
        this.seleccionado = false;
        this.allSelected = false;
        this.showMovimientoCaja = false;

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

    /**
    * Filtra la cuenta contable
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuenta(value: any): any[] {

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
     * filtra el tipo de socio
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterTipoSocio(value: any): any[] {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaTipoSocios.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * filtra la forma de pago
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterFormaPago(value: any): any[] {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaFormaPagos.filter(option => option.nombrefpago.toLowerCase().includes(filterValue));
    }

    /**
    * Filtra la Sucursal
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursal(value: any): any {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * Muestra la descripcion de la cuenta contable para Deposito
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnDepositos(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Retiro
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnRetiros(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para IVA
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnIVA(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Orden Acreedor
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnOrdenAcreedor(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Orden Deudor
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnOrdenDeudor(option: any): any {
        return option ? option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para IDE
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnIDE(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Gasto Interes
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnGastoInteres(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Pasivo Interes
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnPasivoInteres(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para ISR
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnISR(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Provision ISR
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnProvisionISR(option: any): any {
        return option ?  option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Cuenta Comision
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
    displayFnCuentaComision(option: any): any {
        return option ? option.nombre : undefined;
    }

    /**
     * Inicio Gestion Forma Pagos para remover de la selección
     */
    removeFPago(formaPagos: string): void {
        const index = this.listaAgregaFormaPagos.indexOf(formaPagos);
        if (index >= 0) {
            this.listaEliminadosFormaPagos = this.listaAgregaFormaPagos.splice(index, 1);
        }

    }

    /**
     * agrega nuevas formas de pagos a la lista
     * @param event 
     */
    selectedFormaPago(event: MatAutocompleteSelectedEvent): void {
        const index = this.listaAgregaFormaPagos.indexOf(event.option.value);
        const index2 = this.listaEliminadosFormaPagos.indexOf(event.option.value);

        //agrega el elemento a la lista
        if (index < 0) {
            this.listaAgregaFormaPagos.push(event.option.value);
            this.formaPagosInput.nativeElement.value = '';
            this.formaPagos.setValue(null);
        }
        //Valida si la forma de pago es eliminado, lo elimina de la lista 
        if (index2 < 0) {
            this.listaEliminadosFormaPagos.splice(index2, 1);
        }

    }

    /**
    * Inicio Gestion Tipos Socios para remover de la selección
    */
    removeTSocio(tipoSocios: string): void {
        const index = this.listaAgregaTipoSocios.indexOf(tipoSocios);
        if (index >= 0) {
            this.listaEliminadosTipoSocios = this.listaAgregaTipoSocios.splice(index, 1);
        }
    }

    /**
     * agrega nuevos tipos de socios a la lista
     * @param event 
     */
    selectedTipoSocio(event: MatAutocompleteSelectedEvent): void {

        const index = this.listaAgregaTipoSocios.indexOf(event.option.value);
        const index2 = this.listaEliminadosTipoSocios.indexOf(event.option.value);

        //agrega el elemento a la lista
        if (index < 0) {
            this.listaAgregaTipoSocios.push(event.option.value);
            this.tipoSociosInput.nativeElement.value = '';
            this.tipoSocios.setValue(null);
        }
        //Valida si el tipo de socio es eliminado, lo elimina de la lista 
        if (index2 < 0) {
            this.listaEliminadosTipoSocios.splice(index2, 1);
        }

    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle UDIS
     */
    toggleChangesUDIS($event: MatSlideToggleChange) {
        this.isSlideCheckedUDIS = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedUDIS) {
            this.formListaMovimientoCaja.get('limiteUdis').setValidators([Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('limiteUdis').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('limiteUdis').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('limiteUdis').updateValueAndValidity();

        }
    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle Procedencian Recursos
     */
    toggleChangesProcRec($event: MatSlideToggleChange) {
        this.isSlideCheckedProcRec = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedProcRec) {
            this.formListaMovimientoCaja.get('limiteProceRecursos').setValidators([Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('limiteProceRecursos').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('limiteProceRecursos').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('limiteProceRecursos').updateValueAndValidity();

        }
    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle IVA
     */
    toggleChangesIVA($event: MatSlideToggleChange) {
        this.isSlideCheckedIVA = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedIVA) {
            this.formListaMovimientoCaja.get('cuentaIva').setValidators(this.autocompleteObjectValidator())
            this.formListaMovimientoCaja.get('cuentaIva').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaIva').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaIva').updateValueAndValidity();

        }
    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle Comision
     */
    toggleChangesComision($event: MatSlideToggleChange) {
        this.isSlideCheckedComision = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedComision) {
            this.formListaMovimientoCaja.get('saldoComision').setValidators([Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('saldoComision').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('saldoComision').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('saldoComision').updateValueAndValidity();

        }

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedComision) {
            this.formListaMovimientoCaja.get('cuentaComision').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaComision').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaComision').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaComision').updateValueAndValidity();

        }
    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle Paga Interes
     */
    toggleChangesPagaInteres($event: MatSlideToggleChange) {
        this.isSlideCheckedPagaInteres = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedPagaInteres) {
            this.formListaMovimientoCaja.get('tasaInteres').setValidators([Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('tasaInteres').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('tasaInteres').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('tasaInteres').updateValueAndValidity();
        }

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedPagaInteres) {
            this.formListaMovimientoCaja.get('saldoPromInteres').setValidators([Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('saldoPromInteres').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('saldoPromInteres').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')])
            this.formListaMovimientoCaja.get('saldoPromInteres').updateValueAndValidity();
        }

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedPagaInteres) {
            this.formListaMovimientoCaja.get('cuentaPasivoInteres').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaPasivoInteres').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaPasivoInteres').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaPasivoInteres').updateValueAndValidity();
        }

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedPagaInteres) {
            this.formListaMovimientoCaja.get('cuentaGastoInteres').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaGastoInteres').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaGastoInteres').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaGastoInteres').updateValueAndValidity();
        }
    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle IDE
     */
    toggleChangesIDE($event: MatSlideToggleChange) {
        this.isSlideCheckedIDE = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedIDE) {
            this.formListaMovimientoCaja.get('cuentaIDE').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaIDE').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaIDE').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaIDE').updateValueAndValidity();
        }

    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle Paga ISR
     */
    toggleChangesPagaISR($event: MatSlideToggleChange) {
        this.isSlideCheckedPagaISR = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedPagaISR) {
            this.formListaMovimientoCaja.get('cuentaISR').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaISR').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaISR').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaISR').updateValueAndValidity();
        }

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedPagaISR) {
            this.formListaMovimientoCaja.get('cuentaProvisionISR').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaProvisionISR').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaProvisionISR').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaProvisionISR').updateValueAndValidity();
        }
    }

    /**
     * 
     * @param $event Valida el evento del slide-toggle Orden
     */
    toggleChangesOrden($event: MatSlideToggleChange) {
        this.isSlideCheckedOrden = $event.checked;

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedOrden) {
            this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaOrdenAcreedor').updateValueAndValidity();
        }

        //valida si el slide-toggle es activado habilita las validaciones del formulario, si no deshabilita las validaciones
        if (this.isSlideCheckedOrden) {
            this.formListaMovimientoCaja.get('cuentaOrdenDeudor').setValidators([Validators.required, this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaOrdenDeudor').updateValueAndValidity();
        } else {
            this.formListaMovimientoCaja.get('cuentaOrdenDeudor').setValidators([this.autocompleteObjectValidator()])
            this.formListaMovimientoCaja.get('cuentaOrdenDeudor').updateValueAndValidity();
        }
    }

    /**
     * Metodo que selecciona o deselecciona todas las sucursales
     */
    toggleAllSelection() {
        this.allSelected = !this.allSelected;  // to control select-unselect

        if (this.allSelected) {
            this.listSucursales.forEach(lista => {
                lista.seleccionado = true;
            })
        } else {
            this.listSucursales.forEach(lista => {
                lista.seleccionado = false;
            })
        }
    }

   
    /**
  * Abrir ventana modal de confirmacion para dar de baja o alta el movimiento caja
  * @param event estatus del movimiento
  * */
    abrirAdvertencia(event:any) {
        const estatus= event.checked;
        var encabezado = "";
        var body = "";
        if (event.checked === true) {
            encabezado = "Movimiento Caja";
            body = '¿Esta seguro de dar de alta el Movimiento Caja?';
        } else {
            encabezado = "Movimiento Caja";
            body = '¿Esta seguro de dar de baja el Movimiento Caja?';
        }

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 1) {//aceptar y va a Activar
                if(estatus){
                    this.formListaMovimientoCaja.get('estatusMovCaja').setValue(false); 
                }else{
                    this.formListaMovimientoCaja.get('estatusMovCaja').setValue(true);
                }
                
            }
        });
    }

    /**
    * Bloque de Validaciones
    */
    validaciones = {
        'cveMovCaja': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 6 dígitos.' }
        ],
        'nombreMovimiento': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' }
        ],
        'montoMinimo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'montoMaximo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'saldoMinimo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'diasInactivar': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'saldoComision': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'tasaInteres': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'saldoPromInteres': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'limiteUdis': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'cuentaDeposito': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Deposito no pertenece a la lista, elija otra.' }
        ],
        'cuentaRetiro': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Retiro no pertenece a la lista, elija otra.' }
        ],
        'limiteProceRecursos': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'cuentaIva': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta IVA retenido no pertenece a la lista, elija otra.' }
        ],
        'cuentaComision': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Comisión no pertenece a la lista, elija otra.' }
        ],
        'cuentaPasivoInteres': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Pasivo Interes no pertenece a la lista, elija otra.' }
        ],
        'cuentaGastoInteres': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Gasto Interes no pertenece a la lista, elija otra.' }
        ],
        'cuentaIDE': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta IDE no pertenece a la lista, elija otra.' }
        ],
        'cuentaISR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta ISR no pertenece a la lista, elija otra.' }
        ],
        'cuentaProvisionISR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Provision ISR no pertenece a la lista, elija otra.' }
        ],
        'cuentaOrdenAcreedor': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Orden Acreedor no pertenece a la lista, elija otra.' }
        ],
        'cuentaOrdenDeudor': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta Orden Deudor no pertenece a la lista, elija otra.' }
        ]

    };

}