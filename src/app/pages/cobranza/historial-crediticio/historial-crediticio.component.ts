import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { BuscarClientesComponent } from '../../../pages/modales/clientes-modal/buscar-clientes.component';
import { globales } from "../../../../environments/globales.config";
import { MatDialog } from '@angular/material/dialog';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as moment from "moment";
import { ModalCajaMovComponent } from '../../../pages/cajas/caja-movimientos/modal-caja-movimiento/modal-caja-movimiento.component';

@Component({
    selector: 'historial-crediticio',
    moduleId: module.id,
    styleUrls: ['historial-crediticio.component.css'],
    templateUrl: 'historial-crediticio.component.html'
})

export class HistorialCrediticioComponent {

    //Declaracion de variables
    lblCliente: string = globales.ente;
    lblClientes: string = globales.entes;


    refCredito: string = "";

    promedioGeneral = 0;
    desGeneralCalificacion = "";

    numeroCliente = new UntypedFormControl('');
    nombre = new UntypedFormControl('');
    desCalificacion = new UntypedFormControl('');
    calificacion = new UntypedFormControl('');
    fechaCalculo = new UntypedFormControl('');

    //Tabla Saldo cuentas
    displayedColumns: string[] = ['no', 'cveMovimiento', 'descMovimiento', 'saldo'];
    dataSourceCuentas: MatTableDataSource<any>;
    listaMovCuenta = [];
    isLoadingResults: boolean = false;
    isResultado: boolean = false;


    //Tabla Créditos cliente.
    displayedColumnsCred: string[] = ['no', 'refCredito', 'fechaEntrega', 'fechaVencimiento',
        'estatus', 'calificacion', 'descCalificicacion'];
    dataSourceCred: MatTableDataSource<any>;
    listaCredCliente = [];
    isLoadingResultsCre: boolean = false;
    isResultadoCre: boolean = false;

    //TABLA Pagos
    displayedColumnsPagos: string[] = ['no', 'fechaPago', 'amortizacion',
        'estatus', 'dias', 'ultimoPago', 'calificacion', 'descCalificicacion'];
    dataSourcePagos: MatTableDataSource<any>;
    @ViewChild('paginator') paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    listaPagos = [];

    //TABLA Referencias
    displayedColumnsReferencias: string[] = ['no', 'nombre', 'parentesco',
        'porcentaje', 'domicilio', 'contacto'];
    dataSourceReferencias: MatTableDataSource<any>;
    @ViewChild('paginatorReferencias') paginatorReferencias: MatPaginator;
    @ViewChild(MatSort) sortReferencias: MatSort;

    //Formulario
    formDomicilio: UntypedFormGroup;

    editable = false;

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

    now = new Date();
    year = this.now.getFullYear();
    month = this.now.getMonth();
    day = this.now.getDay();
    minDate = new Date(this.year, this.month, this.day);
    maxDate = new Date(5000, 1, 31);


    @BlockUI() blockUI: NgBlockUI;

    constructor(private service: GestionGenericaService,
        private dialog: MatDialog,
        private fomrBuilder: UntypedFormBuilder) {

        this.formDomicilio = this.fomrBuilder.group({
            estado: new UntypedFormControl(''),
            municipio: new UntypedFormControl(''),
            colonia: new UntypedFormControl(''),
            calle: new UntypedFormControl(''),
            numExterior: new UntypedFormControl(''),
            numInterior: new UntypedFormControl(''),
            cp: new UntypedFormControl(''),
            localidad: new UntypedFormControl('')
        });

    }


    /**
  * Metodo para abrir ventana modal para buscar al cliente
  * @param data -- Objecto o valor a condicionar
  */
    abrirDialogCliente(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {//clientes
            let titulo = "Lista clientes";

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                data: {
                    titulo: titulo,
                    cliente: data
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {


                if (result != 1) {
                    if (result.tipoPersona == 'F') {
                        this.numeroCliente.setValue(result.datosCl.numero_cliente);
                        this.nombre.setValue(result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl);
                        this.getHistorialCrediticio(result.datosCl.numero_cliente);
                        this.spsCargaCuentasSaldo(result.datosCl.numero_cliente);
                        let listaDomCliente = JSON.parse(result.datosCl.domicilio_cl).filter((result) => result.num_dom === globales.principal);
                        this.setDomicilio(listaDomCliente);
                        let referencias = JSON.parse(result.datosCl.referencias);
                        this.setReferencias(referencias);
                    } else {
                        //Moral
                        this.numeroCliente.setValue(result.datosCl.numero_cliente);
                        this.nombre.setValue(result.datosCl.nombre_comercial);
                        this.getHistorialCrediticio(result.datosCl.numero_cliente);
                        this.spsCargaCuentasSaldo(result.datosCl.numero_cliente);

                        let listaDomMoral = JSON.parse(result.datosCl.domicilio_cl_moral).filter((result) => result.num_dom === globales.principal);
                        this.setDomicilio(listaDomMoral);

                        let referencias = JSON.parse(result.datosCl.referencias);
                        this.setReferencias(referencias);

                        // this.habilitar = true;
                        //this.llenardatosMoral(result.datosCl, '');
                    }
                }

            });
        }

    }

    /**
     * Metodo que obtiene el Historial Crediticio por cliente
     */
    getHistorialCrediticio(cliente) {
        this.isLoadingResultsCre = true;
        this.isResultadoCre = false;

        this.service.getListByID(cliente, 'historialCrediticio').subscribe(data => {

            this.isResultadoCre = data.length === 0;
            this.listaCredCliente = data;
            this.dataSourceCred = new MatTableDataSource(this.listaCredCliente);

            let sumaCalificacion = 0;
            let totalCreditos = 0;
            for (let credito of this.listaCredCliente) {
                if (credito.detalleCredito.cveEstadoCredito !== '008' && credito.detalleCredito.cveEstadoCredito !== '009') {
                    sumaCalificacion = sumaCalificacion + credito.detalleCredito.calificacion;
                    totalCreditos++;
                }
            }

            this.promedioGeneral = sumaCalificacion / totalCreditos;


            if (this.promedioGeneral === 10) {
                this.desGeneralCalificacion = "Excelente";
            } else if (this.promedioGeneral >= 9 && this.promedioGeneral < 10) {
                this.desGeneralCalificacion = "Muy Bueno";
            } else if (this.promedioGeneral >= 8 && this.promedioGeneral < 9) {
                this.desGeneralCalificacion = "Bueno";
            } else if (this.promedioGeneral >= 7 && this.promedioGeneral < 8) {
                this.desGeneralCalificacion = "Regular";
            } else if (this.promedioGeneral >= 6 && this.promedioGeneral < 7) {
                this.desGeneralCalificacion = "Malo";
            } else if (this.promedioGeneral < 6) {
                this.desGeneralCalificacion = "Pésimo";
            }

            this.desCalificacion.setValue(this.desGeneralCalificacion);
            this.calificacion.setValue(this.promedioGeneral);

            this.isLoadingResultsCre = false;

        }, error => {
            this.isLoadingResultsCre = false;
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
    * Carga los saldos de los movimientos del cliente.
    * @param cveCliente 
    */
    spsCargaCuentasSaldo(cveCliente: any) {

        this.isLoadingResults = true;
        this.isResultado = false;

        const ids = cveCliente + "/" + 1;

        this.service.getListByArregloIDs(ids, 'listaSaldoMovimientoByCliente').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;

                this.listaMovCuenta = data;
                this.dataSourceCuentas = new MatTableDataSource(this.listaMovCuenta);


                this.isLoadingResults = false;

            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }

    /**
     * Obtner Historial de pagos y pago actual de credito
     */
    getHistorial(credito: any) {
        this.refCredito = credito;
        this.getHistorialPagos(credito);
        this.getPagoCredito(credito, '');
    }

    /**
     * Metodo para obtener el Historial de Amortizaciones
     * @param credito - Credito a consultar los pagos
     */
    getHistorialPagos(credito: any) {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(credito.creditoID, 'historialPagos').subscribe(pagos => {

            this.blockUI.stop();
            this.listaPagos = pagos;
            this.dataSourcePagos = new MatTableDataSource(pagos);
            setTimeout(() => this.dataSourcePagos.paginator = this.paginator);
            this.dataSourcePagos.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo para obtener el pago
     * @param credito - Credito a obtener el pago
     */
    getPagoCredito(credito: any, fecha: string) {

        let path = credito.refCredito + '/' + fecha;
        this.service.getListByID(path, 'listaSaldoCredito').subscribe(
            pago => {

                this.montoCredito = pago[0].monto;
                this.saldoCredito = pago[0].saldoRestante;
                this.tasaInicial = pago[0].tasaInicial;
                this.tasaInteres = pago[0].tasaInteres;
                this.amortizaciones = pago[0].amortizaciones;
                this.montoVencido = pago[0].montoVencido;
                this.diasInteres = pago[0].diasInteres;
                this.capital = pago[0].capital;
                this.interesCredito = pago[0].interes;
                this.moratorioCredito = pago[0].interesMoratorio;
                this.ivaCredito = pago[0].iva;
                this.totalCredito = pago[0].total;
                this.totalLiquida = pago[0].totalLiquida;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }

    /**
     * Metodo para recalcular pago
     */
    calcularNuevoSaldo() {
        let fecha = moment(this.fechaCalculo.value).format('DD-MM-YYYY');
        this.getPagoCredito(this.refCredito, fecha);
    }

    /**
     * Metodo para setear los datos del docimicilio
     * @param domicilio - Domicilio principal a mostrar
     */
    setDomicilio(domicilio: any) {
        //Valida que la lista no venga vacia para setear los datos al formulario
        if (!this.vacio(domicilio)) {
            this.formDomicilio.get('estado').setValue(domicilio[0].nombre_estado);
            this.formDomicilio.get('municipio').setValue(domicilio[0].ciudad);
            this.formDomicilio.get('colonia').setValue(domicilio[0].nombre_colonia);
            this.formDomicilio.get('calle').setValue(domicilio[0].calle);
            this.formDomicilio.get('numExterior').setValue(domicilio[0].numero_exterior);
            this.formDomicilio.get('cp').setValue(domicilio[0].cp);
            this.formDomicilio.get('localidad').setValue(domicilio[0].localidad);
            this.formDomicilio.get('numInterior').setValue(domicilio[0].numero_interior);
        }
    }


    /**
     * Metodo para abrir ventana modal auxiliar
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialogAuxiliar(data: any, accion: any) {

        //Asigna titulo
        let titulo = "Historial de movimientos";

        //se abre el modal
        this.dialog.open(ModalCajaMovComponent, {
            data: {
                titulo: titulo,
                accion: accion,
                data: data,
                cveCliente: this.numeroCliente.value,
                nombreCliente: this.nombre.value,
                listaMovCuenta: this.listaMovCuenta,
                refCredito: null,
                listaCobrosCred: null
            }
        });

    }


    /**
     * Set referencias
     * @param referenicias - referencias a mostrar
     */
    setReferencias(referenicias: any) {
        this.dataSourceReferencias = new MatTableDataSource(referenicias);
        setTimeout(() => this.dataSourceReferencias.paginator = this.paginatorReferencias);
        this.dataSourceReferencias.sort = this.sortReferencias;
    }

    /**
     * Metodo que valida si va vacio.
     * @param value 
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

}
