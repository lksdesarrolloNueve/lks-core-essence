import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { PermisosService } from '../../../../shared/service/permisos.service';
import { Observable } from 'rxjs';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { map, startWith } from "rxjs/operators";
import { environment } from '../../../../../environments/environment';
import { BuscarClientesComponent } from "../../../modales/clientes-modal/buscar-clientes.component";
import { CurrencyPipe, formatCurrency, getCurrencySymbol } from '@angular/common';
import { verificacionModalComponent } from "../../../modales/verificacion-modal/verificacion-modal.component";
import globales from '../../../../../environments/globales.config';


////Constantes//////
//Tipo movimiento.
const cDeposito = environment.tesoreria.deposito;// 001 'Depostio' = 'I'
const cRetiro = environment.tesoreria.retiro;// 002 'Retiro'   =  'E'
const cTraspasoO = environment.tesoreria.traspasoO;// 003 'Traspaso a otra cuenta' = 'D'
const cRetiroCh = environment.tesoreria.retiroCh;// 004 'Retiro cheque' = 'E'
const cTraspasoD = environment.tesoreria.traspasoD;// 005 'Traspaso de la cuenta' = 'D'
const cPagoCred = environment.tesoreria.pagoCredito; // cuenta de pago de creditos

//Origen
const cOrigenMov = environment.generales.origenMov;// "51EL" Origen movimiento

//Constate forma depago
const cFormaTrans = environment.tesoreria.formaTrans;// Transferencia

@Component({
    selector: 'modal-caja-movimiento',
    moduleId: module.id,
    templateUrl: 'modal-caja-movimiento.component.html',
    styleUrls: ['modal-caja-movimiento.component.css']
})


/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 
 * @descripcion: Componente para la gestion de modales de apoyo para cajas.
 */
export class ModalCajaMovComponent implements OnInit {

    @BlockUI() blockUI: NgBlockUI;

    //Opción vistamodal
    accion = 0;
    titulo = null;

    //Clave sucursal sesión.
    vCveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;

    //Tabla transacciones(cobros)
    displayedColumnsHMov: string[] = ['fecha', 'cveMovimiento', 'descTipoMov', 'operacionTMov', 'monto', 'estatus'];
    dataSourceHMov: MatTableDataSource<any>;
    listaHMov = [];
    listaCobrosCredito: any = [];
    cobroID: number = 0;
    isLoadingResults: boolean = false;
    isResultado: boolean = false;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    //Tipo depósito
    listaTiposCuenta: any;
    opcionesTiposCuenta: Observable<string[]>;

    //Formulario
    formAuxiliar: UntypedFormGroup;

    //Tipo movimiento
    tipoMovimiento = null;
    operacion = null;

    //Comisión
    aplicaComision = false;
    montoComision: number = 0.00;

    //Montos
    montoMin: any;
    montoMax: any;
    boolMontoMin = false;
    boolMontoMax = false;

    //Saldo
    boolSaldoMin = false;
    saldoMinimo: number = 0.00;
    saldoCuenta: number = 0.00;

    //Monto máximo retiro.
    boolMontoMaxRetiro = false;
    montoMaxRetiro: number = 0.00;


    //Lista movimientos cuenta.
    listaMovCuenta: any;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.enteMayuscula;

    //Clientes
    cveClienteDestino: any;

    //Listas cuentas
    listaCuentasOrigen: any;
    listaCuentasDestino: any;


    //variables para Saldos de Credito
    cveCredito: any;
    //clave pago credito
    cvePagoCredito = null;
    fechaConsulta: string;
    creditoID: BigInteger;
    montoCredito: number = 0.00;
    saldoCredito: number = 0.00;
    tasaInicial: number = 0.00;
    tasaInteres: number = 0.00;
    amortizaciones: number = 0;
    montoVencido: number = 0.00;
    diasInteres: number = 0;
    capital: number = 0.00;
    interesCredito: number = 0.00;
    moratorioCredito: number = 0.00;
    ivaCredito: number = 0.00;
    totalCredito: number = 0.00;
    totalLiquida: number = 0.00;
    capitalrestante: number = 0.00;
    creditoClienteId: any;
    listaCreditoCliente: any;
    creditoClienteControl = new UntypedFormControl('', [Validators.required]);
    saldopagocreControl = new UntypedFormControl('', [Validators.required])
    //mensaje
    mensajeDialog: any;
    listaMovTransacciones = [];
    //Totales
    totalDep: number = 0;
    totalRet: number = 0;
    total: number = 0;
    vCveCaja: any;

    dataSourceTransacciones: MatTableDataSource<any>;

    //@ViewChild(CajaMovimientosComponent) cajaMov: CajaMovimientosComponent;
    /**
     * Constructor de la clase MovimientosCajaComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService,
        public dialog2: MatDialog,
        public dialog: MatDialogRef<ModalCajaMovComponent>,
        private servicePermisos: PermisosService,
        private fomrBuilder: UntypedFormBuilder,
        private currencyPipe: CurrencyPipe,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogConfirm: MatDialog) {

        this.accion = data.accion;
        this.titulo = data.titulo;

        this.listaMovCuenta = data.listaMovCuenta;
        this.cveCredito = data.refCredito;
        this.listaCobrosCredito = data.listaCobrosCred;
        this.vCveCaja = data.cveCaja;


        this.formAuxiliar = this.fomrBuilder.group({
            tipoCuenta: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            cantidad: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            saldoPrestamo: new UntypedFormControl(''),
            tasaInic: new UntypedFormControl(''),
            tasaInt: new UntypedFormControl(''),
            amortVencidas: new UntypedFormControl(''),
            montoVencidas: new UntypedFormControl(''),
            diasInt: new UntypedFormControl(''),
            capital: new UntypedFormControl(''),
            interes: new UntypedFormControl(''),
            moratorio: new UntypedFormControl(''),
            iva: new UntypedFormControl(''),
            total: new UntypedFormControl(''),
            saldoVista: new UntypedFormControl(''),
            saldoAhorro: new UntypedFormControl(''),
            monto: new UntypedFormControl('', [Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            clienteOrigen: new UntypedFormControl('', [Validators.required]),
            clienteDestino: new UntypedFormControl('', [Validators.required]),
            tipoCuentaOrigen: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            tipoCuentaDestino: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            cantidadOrigen: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            pagoCred: this.saldopagocreControl,

        });
    }


    /**
     * metodo OnInit de la clase MovimientosCaja para iniciar las listas
     */
    ngOnInit() {


        switch (this.data.accion) {
            case 1:
              this.spsCargaCuentasSaldoHist(this.data.cveCliente, this.data.data.cveMovimiento);
              break;
          
            case 2:
              this.spsListaTiposDepositos(this.vCveSucursal, this.data.cveCliente, 1);
              this.tipoMovimiento = cDeposito;
              this.operacion = '+';
              this.validatorsDepRet();
              break;
          
            case 3:
              this.spsListaTiposDepositos(this.vCveSucursal, this.data.cveCliente, 2);
              this.tipoMovimiento = cRetiro;
              this.operacion = '-';
              this.validatorsDepRet();
              break;
          
            case 4:
              this.spsListaTiposDepositos(this.vCveSucursal, this.data.cveCliente, 1);
              this.tipoMovimiento = cDeposito;
              this.cvePagoCredito = cPagoCred;
              this.operacion = '+';
              this.spsCreditoCliente();
              break;
          
            case 5:
              this.validatorTraspasos();
              this.spsCargaCuentasSaldoRet(this.data.cveCliente, 2);
              this.spsListaTiposDepositos(this.vCveSucursal, this.data.cveCliente, 1);
              this.formAuxiliar.get('clienteOrigen').setValue(this.data.nombreCliente);
              break;
          
            case 6:
              this.spsListaTiposDepositos(this.vCveSucursal, this.data.cveCliente, 1);
              this.tipoMovimiento = cDeposito;
              this.cvePagoCredito = cPagoCred;
              this.operacion = '+';
              this.spsSaldoCredito(this.cveCredito);
              break;
          
            default:
              // Handle any other case or provide a default action
              break;
          }
    


    }


    /**
     * Desactiva validaciones para depositos y retiros.
     */
    validatorsDepRet() {

        //Cambian los validators    
        this.formAuxiliar.get('clienteOrigen').setValidators([]);
        this.formAuxiliar.get('clienteOrigen').updateValueAndValidity();
        this.formAuxiliar.get('clienteDestino').setValidators([]);
        this.formAuxiliar.get('clienteDestino').updateValueAndValidity();
        this.formAuxiliar.get('tipoCuentaOrigen').setValidators([]);
        this.formAuxiliar.get('tipoCuentaOrigen').updateValueAndValidity();
        this.formAuxiliar.get('tipoCuentaDestino').setValidators([]);
        this.formAuxiliar.get('tipoCuentaDestino').updateValueAndValidity();
        this.formAuxiliar.get('cantidadOrigen').setValidators([]);
        this.formAuxiliar.get('cantidadOrigen').updateValueAndValidity();
        this.formAuxiliar.get('pagoCred').setValidators([]);
        this.formAuxiliar.get('pagoCred').updateValueAndValidity();

    }

    //Desactiva validaciones para traspasos.
    validatorTraspasos() {
        //Cambian los validators    
        this.formAuxiliar.get('tipoCuenta').setValidators([]);
        this.formAuxiliar.get('tipoCuenta').updateValueAndValidity();
        this.formAuxiliar.get('cantidad').setValidators([]);
        this.formAuxiliar.get('cantidad').updateValueAndValidity();
        this.formAuxiliar.get('monto').setValidators([]);
        this.formAuxiliar.get('monto').updateValueAndValidity();
        this.formAuxiliar.get('pagoCred').setValidators([]);
        this.formAuxiliar.get('pagoCred').updateValueAndValidity();


    }

    /**
     * Carga historial de los movimientos del cliente. por cuenta
     * @param cveCliente 
     */
    spsCargaCuentasSaldoHist(cveCliente: any, cveMovimiento: any) {

        this.isLoadingResults = true;
        this.isResultado = false;

        const ids = cveCliente + "/" + cveMovimiento + "/" + 1;


        this.service.getListByArregloIDs(ids, 'listHistorialMovCuentaCli').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;

                this.listaHMov = data;
                this.dataSourceHMov = new MatTableDataSource(this.listaHMov);
                this.dataSourceHMov.paginator = this.paginator;
                this.dataSourceHMov.sort = this.sort;

                this.isLoadingResults = false;

            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }


    /**
     * Metodo para filtrar historial movimientos.
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceHMov.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceHMov.paginator) {
            this.dataSourceHMov.paginator.firstPage();
        }
    }


    ///////////////////////////////////////////////////////////////////////////////////
    /**
     * Metodo para tipos depositos
     * 
     */
    spsListaTiposDepositos(cveSucursal: any, cveCliente: any, accion: any) {
        this.blockUI.start('Cargando datos...');

        const ids = cveSucursal + "/" + cveCliente + "/" + accion;

        this.service.getListByArregloIDs(ids, 'listTipoMovDR').subscribe(data => {
            //Sucursales
            this.listaTiposCuenta = data;

            this.opcionesTiposCuenta = this.formAuxiliar.get('tipoCuenta').valueChanges.pipe(
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
     * Filtra tipos depositos
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
        this.formAuxiliar.get('cantidad').setValue('');
        return this.listaTiposCuenta.filter(option => option.nombreMov.toLowerCase().includes(filterValue));
    }

    /**
    * Muestra la descripcion del tipo depósito
    * @param option --Tipo depósito
    * @returns --nombre tipo depósito
    */
    displayTiposCuenta(option: any): any {
        return option ? option.cveMovCaja + "  /  " + option.nombreMov : undefined;
    }

    /**
     * Opcion seleccionada sucursal destino
     */
    opcionSeleccionadaTipoCuenta(evento: any) {
        //Reinicia valores
        this.formAuxiliar.get('cantidad').setValue('');
        this.formAuxiliar.get('cantidad').enable();
        this.boolMontoMin = false;
        this.boolMontoMax = false;
        this.boolMontoMaxRetiro = false;
        let claveMovCaja = evento.option.value.cveMovCaja;
        //Se obtienen los montos de las comisones o grantia a cobrar
        if (!this.vacio(this.listaCobrosCredito)) {
            for (let i of this.listaCobrosCredito) {

                if (!this.vacio(i.cve_garantia)) {
                    if (claveMovCaja.trim() == i.cve_garantia.trim()) {

                        this.formAuxiliar.get('cantidad').setValue(i.monto);
                        this.formAuxiliar.get('cantidad').disable();

                        this.cobroID = i.cobros_id;
                        this.cveCredito = i.referencia;
                    }
                } else {
                    if (claveMovCaja.trim() == 'CPRE') {
                        this.cobroID = i.cobros_id;
                        this.cveCredito = i.referencia;

                        this.formAuxiliar.get('cantidad').setValue(i.monto);
                        this.formAuxiliar.get('cantidad').disable();
                    }
                }
            }
        }

        //Comisión
        this.aplicaComision = this.formAuxiliar.get('tipoCuenta').value.extMovCajDR.aplicaComision;
        this.montoComision = this.formAuxiliar.get('tipoCuenta').value.extMovCajDR.saldoComision;

        //Saldo minimo
        this.saldoMinimo = this.formAuxiliar.get('tipoCuenta').value.extMovCajDR.saldoMinimo;
    }

    /**
     * Metodo que valida si va vacio.
     * @param value 
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    cambioTipoCuenta() {
        this.formAuxiliar.get('cantidad').setValue('');
    }
    /**
     * Agregar la cuenta contable con su detalles para
     */
    agregarMovimiento() {

        //Valida formulario
        if (this.formAuxiliar.invalid) {
            this.validateAllFormFields(this.formAuxiliar);
            return;
        }

        //Validaciones personalizadas 
        if (this.validacionesPersonalizadas()) {
            return;
        }

        let total: number;

        if (this.aplicaComision) {
            total = Number(this.formAuxiliar.get('cantidad').value) + this.montoComision;
        } else {
            total = Number(this.formAuxiliar.get('cantidad').value);
        }

        let data = {
            cveTipoMovimiento: this.tipoMovimiento,
            tipoCuenta: this.formAuxiliar.get('tipoCuenta').value,
            monto: Number(this.formAuxiliar.get('cantidad').value),
            aplicaComision: this.aplicaComision,
            comision: this.montoComision,
            total: total,
            operacion: this.operacion,
            cveCredito: this.cveCredito,
            cobrosID: this.cobroID,

        }

        this.dialog.close(data);

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
     * Validaciones personalizadas
     */
    validacionesPersonalizadas() {
        this.boolMontoMin = false;
        this.boolMontoMax = false;
        this.boolMontoMaxRetiro = false;

        this.montoMin = Number(this.formAuxiliar.get('tipoCuenta').value.montoMinimo);
        this.montoMax = Number(this.formAuxiliar.get('tipoCuenta').value.montoMaximo);

        //Valida monto mínimo
        if (Number(this.formAuxiliar.get('cantidad').value) < this.montoMin) {
            this.formAuxiliar.get('cantidad').setErrors({ montoMin: true });
            this.boolMontoMin = true;
            return true;
        }

        //Valida monto máximo.
        if (Number(this.formAuxiliar.get('cantidad').value) > this.montoMax) {
            this.formAuxiliar.get('cantidad').setErrors({ montoMax: true });
            this.boolMontoMax = true;
            return true;
        }

        //Validar Cantidad = 0;
        if (Number(this.formAuxiliar.get('cantidad').value) === 0) {
            this.formAuxiliar.controls['cantidad'].setErrors({ cantidadCero: true });
            return true;
        }


        //Valida solo retiros
        if (this.data.accion === 3) {

            //Obtenemos el saldo de la cuenta
            this.saldoCuenta = 0.00;

            for (let cuenta of this.listaMovCuenta) {

                if (cuenta.cveMovimiento === this.formAuxiliar.get('tipoCuenta').value.cveMovCaja) {
                    this.saldoCuenta = cuenta.saldo;
                }

            }

            //Obtenemos saldo despues de la operación.
            let saldoDespues = this.saldoCuenta - this.formAuxiliar.get('cantidad').value;

            //Monto máximo retiro
            this.montoMaxRetiro = this.saldoCuenta - this.saldoMinimo;

            //Validar saldo minimo de la cuenta.
            if (saldoDespues < this.saldoMinimo) {
                this.formAuxiliar.controls['cantidad'].setErrors({ saldoMinimo: true });
                this.boolMontoMaxRetiro = true;
                return true;
            }

        }

        return false;
    }


    /**
      * Validaciones personalizadas
      */
    validacionesPersonalizadasTraspasos() {

        this.boolMontoMin = false;
        this.boolMontoMax = false;
        this.boolMontoMaxRetiro = false;

        let cuentaOrigenCompleta: any;

        //obtenemos el tipo de movimiento cOrigenMov.
        for (let tipoCuenta of this.listaTiposCuenta) {

            if (tipoCuenta.cveMovCaja === this.formAuxiliar.get('tipoCuentaOrigen').value.cveMovimiento) {
                cuentaOrigenCompleta = tipoCuenta;
            }

        }

        this.montoMin = Number(cuentaOrigenCompleta.montoMinimo);
        this.montoMax = Number(cuentaOrigenCompleta.montoMaximo);
        this.saldoMinimo = Number(cuentaOrigenCompleta.extMovCajDR.saldoMinimo);

        //Valida monto mínimo
        if (Number(this.formAuxiliar.get('cantidadOrigen').value) < this.montoMin) {
            this.formAuxiliar.get('cantidadOrigen').setErrors({ montoMin: true });
            this.boolMontoMin = true;
            return true;
        }

        //Valida monto máximo.
        if (Number(this.formAuxiliar.get('cantidadOrigen').value) > this.montoMax) {
            this.formAuxiliar.get('cantidadOrigen').setErrors({ montoMax: true });
            this.boolMontoMax = true;
            return true;
        }

        //Validar Cantidad = 0;
        if (Number(this.formAuxiliar.get('cantidadOrigen').value) === 0) {
            this.formAuxiliar.controls['cantidadOrigen'].setErrors({ cantidadCero: true });
            return true;
        }

        //Valida cuenta destino igual a cuenta origen.
        if (this.formAuxiliar.get('tipoCuentaOrigen').value.cveMovimiento ===
            this.formAuxiliar.get('tipoCuentaDestino').value.cveMovimiento &&
            this.data.cveCliente === this.cveClienteDestino) {

            this.formAuxiliar.controls['tipoCuentaDestino'].setErrors({ cuentaIgual: true });
            return true;
        }

        //Obtenemos el saldo de la cuenta
        this.saldoCuenta = 0.00;

        this.saldoCuenta = this.formAuxiliar.get('tipoCuentaOrigen').value.saldo;

        //Obtenemos saldo despues de la operación.
        let saldoDespues = this.saldoCuenta - this.formAuxiliar.get('cantidadOrigen').value;

        //Monto máximo retiro
        this.montoMaxRetiro = this.saldoCuenta - this.saldoMinimo;

        //Validar saldo minimo de la cuenta.
        if (saldoDespues < this.saldoMinimo) {
            this.formAuxiliar.controls['cantidadOrigen'].setErrors({ saldoMinimo: true });
            this.boolMontoMaxRetiro = true;
            return true;
        }

        //Validar parametros cuenta destino
        let cuentaDestinoCompleta: any;

        //obtenemos el tipo de movimiento cOrigenMov.
        for (let tipoCuentaDest of this.listaTiposCuenta) {

            if (tipoCuentaDest.cveMovCaja === this.formAuxiliar.get('tipoCuentaDestino').value.cveMovimiento) {
                cuentaDestinoCompleta = tipoCuentaDest;
            }

        }

        this.montoMin = Number(cuentaDestinoCompleta.montoMinimo);
        this.montoMax = Number(cuentaDestinoCompleta.montoMaximo);

        //Valida monto mínimo
        if (Number(this.formAuxiliar.get('cantidadOrigen').value) < this.montoMin) {
            this.formAuxiliar.get('cantidadOrigen').setErrors({ montoMinDest: true });
            this.boolMontoMin = true;
            return true;
        }

        //Valida monto máximo.
        if (Number(this.formAuxiliar.get('cantidadOrigen').value) > this.montoMax) {
            this.formAuxiliar.get('cantidadOrigen').setErrors({ montoMaxDest: true });
            this.boolMontoMax = true;
            return true;
        }


        return false;
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialogDestino() {

        let titulo = "Lista clientes";
        let accion = 1;

        //se abre el modal
        const dialogRef = this.dialog2.open(BuscarClientesComponent, {
            // height: '500px',
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                cliente: 0
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (!this.vacio(result) && result !== 1) {
                //Asignamos los datos del cliente.
                this.cveClienteDestino = result.datosCl.numero_cliente;

                this.formAuxiliar.get('clienteDestino').setValue(result.datosCl.nombre_cl + ' ' +
                    result.datosCl.paterno_cl + ' ' +
                    result.datosCl.materno_cl);

                this.spsCargaCuentasSaldoRet(this.cveClienteDestino, 3)
            }

        });

    }

    /**
     * Metodo para gurdar la transacción de traspaso.
     * 
     */
    guardarTransaccionTraspaso() {

        //Valida formulario
        if (this.formAuxiliar.invalid) {
            this.validateAllFormFields(this.formAuxiliar);
            return;
        }


        //Validaciones personalizadas
        if (this.validacionesPersonalizadasTraspasos()) {
            return;
        }


        //Carga mensajes.
        this.mensajesDialog();

        this.abrirAdvertencia();//Guardar

    }

    /**
     * Método para procesar el traspaso a terceros. 
     */
    procesaTraspaso() {

        this.blockUI.start('Cargando datos...');


        const data = {
            "usuario": this.vUsuarioId,
            "cveSucursal": this.vCveSucursal,
            "cveCaja": this.data.cveCaja,
            "movimientos": [[cFormaTrans,             //--> forma pago
                cTraspasoO,                   //--> tipo movimiento origen
                this.formAuxiliar.get('tipoCuentaOrigen').value.cveMovimiento, //--> mov caja origen
                this.data.cveCliente,   //--> cve cliente origen
                this.cveClienteDestino,  //--> cve cliente destino
                cTraspasoD,                   //--> tipo movimiento destino
                this.formAuxiliar.get('tipoCuentaDestino').value.cveMovimiento, //--> cve mov caja destino
                cOrigenMov,              //--> cve origen movimiento
                Number(this.formAuxiliar.get('cantidadOrigen').value)//--> monto  transaccion
            ]]
        }


        this.service.registrar(data, 'traspasoTercero').subscribe(
            result => {

                this.blockUI.stop();

                // No se pudo procesar el traspaso
                if (result[0] === 1) {
                    this.service.showNotification('top', 'right', 4, result[1]);
                    return;
                }

                this.service.showNotification('top', 'right', 2, result[0]);

                //!!!!!!!!!!!!!!!!!!!!!!!!!!!CONTEMPLAR CONFIGURAR EN CAT. MOVIMIENTOS EN CAJA SI ENVIA SMS Y EMAIL.
                //Enviar notificaciones.
                //this.enviaNotificacionSMS(); // Se manda llamar metodo para envio de sms
                //this.EnvioNotiEmail(); // se manda llamar metodo para envio de email


                this.dialog.close(5);

            }, error => {

                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.error);
            }
        );

    }



    /**
     * Mensajes para dialog movimientos.
     */
    mensajesDialog() {
        this.mensajeDialog = null;


        this.mensajeDialog = "Traspasa " + this.formAuxiliar.get('clienteOrigen').value + ' ' +
            this.currencyPipe.transform(this.formAuxiliar.get("cantidadOrigen")?.value, 'MXN') +
            " de la cuenta " +
            this.formAuxiliar.get('tipoCuentaOrigen').value.cveMovimiento + ' a '
            + this.formAuxiliar.get('clienteDestino').value + ' ' +
            " a la cuenta " +
            this.formAuxiliar.get('tipoCuentaDestino').value.cveMovimiento + '.';

    }

    /**
     * Abrir ventana modal de confirmacion
     * @param element datos categoria
     * @param accion 0:Guardar, 1:Modificar
     * */
    abrirAdvertencia() {
        var encabezado = "";
        var body = "";


        encabezado = "Guardar movimiento.";
        body = this.mensajeDialog;

        const dialogRef = this.dialog2.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar y guardar

                this.procesaTraspaso();

            }
        });

    }

    // metodo para consultar los saldos de cuenta bancaria
    spsSaldoCredito(cveCredito: string) {
        this.isLoadingResults = true;
        this.isResultado = false;
        this.fechaConsulta = new Date().toLocaleDateString();
        let fechaFinal = this.fechaConsulta.replace(/\//g, '-');
        let path = cveCredito + '/' + "";

        this.service.getListByID(cveCredito, 'listaSaldoCredito').subscribe(
            data => {
                //MUESTRA LA TABLA
                this.creditoID = data[0].creditoID;
                this.montoCredito = data[0].monto;
                this.saldoCredito = data[0].saldoRestante;
                this.tasaInicial = data[0].tasaInicial;
                this.tasaInteres = data[0].tasaInteres;
                this.amortizaciones = data[0].amortizaciones;
                this.montoVencido = data[0].montoVencido;
                this.diasInteres = data[0].diasInteres;
                this.capital = data[0].capital;
                this.interesCredito = data[0].interes;
                this.moratorioCredito = data[0].interesMoratorio,
                    this.ivaCredito = data[0].iva;
                this.totalCredito = data[0].total;
                this.totalLiquida = data[0].totalLiquida;
                this.formAuxiliar.get('pagoCred').setValue(this.totalCredito);
                this.nuevoValor = this.totalCredito;
                this.isLoadingResults = false;
            }, errorSaldo => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, errorSaldo);
            }
        )

    }

    /**
     * Agregar la cuenta contable con su detalles para
     */
    agregarPagoCredito() {

        let totalExtra: number;
        let mensajealerta = 'El pago minimo es de ' + formatCurrency(this.totalCredito, 'en-MXN', getCurrencySymbol('MXN', 'wide'));

        if (this.nuevoValor == 0 && this.totalCredito == 0) {
            this.service.showNotification('top', 'right', 4, 'no se pueden realizar operaciones de $0');
            return;
        }

        if (this.nuevoValor < this.totalCredito) {
            this.service.showNotification('top', 'right', 4, mensajealerta);
            return;
        }

        totalExtra = Number(this.formAuxiliar.get('pagoCred').value);

        let tipoMOv = this.listaTiposCuenta.find(i => i.cveMovCaja == this.cvePagoCredito)
        let data = {
            cveTipoMovimiento: this.tipoMovimiento,
            tipoCuenta: tipoMOv,
            monto: Number(totalExtra),
            aplicaComision: this.aplicaComision,
            comision: this.montoComision,
            total: totalExtra,
            operacion: this.operacion,
            cveCredito: this.cveCredito,
        }

        this.dialog.close(data);

    }

    /**
     * Agregar la cuenta contable con su detalles para
     */
    agregarPagoCreditoExtra() {
        if (this.creditoClienteControl.hasError('required')) {
            return 'Campo requerido.';
        }

        let totalExtra: number;

        let mensajealerta = 'El pago minimo es de ' + formatCurrency(this.totalCredito, 'en-MXN', getCurrencySymbol('MXN', 'wide'));

        if (this.nuevoValor < this.totalCredito) {
            this.service.showNotification('top', 'right', 4, mensajealerta);
            return;
        }
        totalExtra = Number(this.formAuxiliar.get('pagoCred').value);
        let tipoMOv = this.listaTiposCuenta.find(i => i.cveMovCaja == this.cvePagoCredito)
        let data = {
            cveTipoMovimiento: this.tipoMovimiento,
            tipoCuenta: tipoMOv,
            monto: totalExtra,
            aplicaComision: this.aplicaComision,
            comision: this.montoComision,
            total: totalExtra,
            operacion: this.operacion,
            cveCredito: this.cveCredito,
        }

        this.dialog.close(data);

    }


    /**
     * Método para consultar los creditos por cliente
     * @param general
     */
    spsCreditoCliente() {
        let path = this.data.cveCliente + '/' + 2;
        this.service.getListByID(path, 'listaHistorialCred').subscribe(data => {
            this.listaCreditoCliente = data;

        }, error => {
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    nuevoValor: number = 0.0;

    cambioPago() {

        let valor = this.formAuxiliar.get('pagoCred').value;
        this.nuevoValor = valor;

    }
    /**
     * metodo para calcular nuevo saldo para pago de credito
     */
    calcularNuevoSaldo() {

        let saldopagocred = this.formAuxiliar.get('pagoCred').value;

        let mensajealerta = 'El pago minimo es de ' + formatCurrency(this.totalCredito, 'en-MXN', getCurrencySymbol('MXN', 'wide'));
        if (this.nuevoValor < this.totalCredito) {
            this.service.showNotification('top', 'right', 4, mensajealerta);
            return;
        }

        this.capitalrestante = (this.nuevoValor - this.interesCredito - this.ivaCredito);
    }

    abrirDialogAuxiliar(data: any, accion: any) {
        this.dialog.close(ModalCajaMovComponent);

        // Iguala a false para ocultar mensaje movimientos
        let titulo: any;

        //Asigna titulo
        titulo = "Pagos";

        let referenciaCredito = null;

        //se abre el modal
        const dialogRef2 = this.dialog2.open(ModalCajaMovComponent, {

            width: '1000px',
            data: {
                titulo: titulo,
                accion: accion,
                data: data,
                cveCliente: this.data.cveCliente,
                nombreCliente: 'this.nomCliente',
                listaMovCuenta: this.listaMovCuenta,
                refCredito: this.cveCredito,
                listaCobrosCred: ''
            }
        });

        //Se usa para cuando cerramos
        dialogRef2.afterClosed().subscribe(result => {

            if (result) {
                //this.cajaMov.evaluaMovimientos(result);
            }

        });

    }

    /** 
    * Activa div de acuerdo al tipo de movimiento
    * @param event 
    */
    opcionCreditoSelect(event) {

        //limpiar campos
        //this.cuentaBancOri.setValue('');
        //conuslta nuevos datos
        let claveCred = this.creditoClienteControl.value;
        this.spsSaldoCredito(claveCred);
    }


    /**
     * 
     * @param cveCliente 
     * @param accion 
     */
    spsCargaCuentasSaldoRet(cveCliente: any, accion: any) {
        this.isLoadingResults = true;
        const ids = cveCliente + "/" + accion;

        this.service.getListByArregloIDs(ids, 'listaSaldoMovimientoByCliente').subscribe(
            (data: any) => {

                this.isLoadingResults = false;

                if (accion === 2) {
                    this.listaCuentasOrigen = data;
                } else if (accion === 3) {
                    this.listaCuentasDestino = data;
                }

            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }



    /** 
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
     */
    validaciones = {
        'tipoCuenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El movimiento no pertenece a la lista, elija otro movimiento.' }
        ],
        'cantidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' },
            { type: 'montoMin', message: 'La cantidad es menor a la configurada para el movimiento' },
            { type: 'montoMax', message: 'La cantidad es mayor a la configurada para el movimiento' },
            { type: 'cantidadCero', message: 'La cantidad debe ser mayor a cero.' },
            { type: 'saldoMinimo', message: 'El monto máximo que puede retirar de esta cuenta es ' }
        ],
        'clienteOrigen': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'clienteDestino': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'tipoCuentaOrigen': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El tipo cuenta no pertenece a la lista, elija otra cuenta.' }
        ],
        'tipoCuentaDestino': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El tipo cuenta no pertenece a la lista, elija otra cuenta.' },
            { type: 'cuentaIgual', message: 'Elija un cuenta destino distinta a la cuenta origen.' }
        ],
        'cantidadOrigen': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' },
            { type: 'montoMin', message: 'La cantidad es menor a la configurada para el movimiento' },
            { type: 'montoMax', message: 'La cantidad es mayor a la configurada para el movimiento' },
            { type: 'cantidadCero', message: 'La cantidad debe ser mayor a cero.' },
            { type: 'saldoMinimo', message: 'El monto máximo que puede retirar de esta cuenta es ' },
            { type: 'montoMinDest', message: 'La cantidad es menor a la configurada para el movimiento destino' },
            { type: 'montoMaxDest', message: 'La cantidad es mayor a la configurada para el movimiento destino' },
        ]
    };


}
