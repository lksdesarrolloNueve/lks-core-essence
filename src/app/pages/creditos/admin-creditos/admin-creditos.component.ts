import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import * as moment from 'moment';
import { PermisosService } from "../../../shared/service/permisos.service";
import { globales } from "../../../../environments/globales.config";
import { generales } from "../../../../environments/generales.config";
import { formatCurrency, getCurrencySymbol } from "@angular/common";
import { MHipotecasCreditosComponent } from "../modal-creditos/hipotecas-creditos/m-hipotecas-creditos.component";
import { MPrendasCreditosComponent } from "../modal-creditos/prendas-creditos/m-prendas-creditos.component";
import { MSolicitudCreditosComponent } from "../modal-creditos/m-solicitud-creditos/m-solicitud-creditos.component";
import { DocumentosModalComponent } from "../../../pages/modales/documentos-modal/documentos-modal.component";
import { AdminAvalesComponent } from "../modal-creditos/avales-creditos/admin-avales.component";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { AmortizacionesComponent } from "../../../pages/modales/amortizaciones-modal/amortizaciones.component";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { LiquidaCreditosComponent } from "../modal-creditos/liquida-creditos/liquida-creditos.component";
import { ModalInversionesComponent } from "../modal-creditos/inversiones/inversiones.component";
import { ModalCredRenovadoComponent } from "../modal-creditos/credito-renovado/credito-renovado.component";


@Component({
    selector: 'admin-creditos',
    moduleId: module.id,
    templateUrl: 'admin-creditos.component.html',
    styleUrls: ['../../clientes/administracion-clientes/clientes.component.css']
})


/**
 * @autor: Victor Daniel Loza Cruz
 * @version: 1.0.0
 * @fecha: 18/11/2021
 * @descripcion: Componente para la gestion de Creditos
 */
export class AdminCreditosComponent implements OnInit {
    tabSeleccionada: number = 0;
    /**************** Variables globales para GEstion de Creditos */
    origen = '';
    vSolicitudID = 0;
    vCreditoID = 0;
    vCliente: any;
    sujetoID: number;
    psolicitud: any;
    autoTicks = false;
    invert = false;
    max = 100;
    min = 0;
    showTicks = true;
    step = .1;
    thumbLabel = true;
    value = 0;
    vertical = false;
    tickInterval = .1;
    nuevo = true;

    getSliderTickInterval(): number | 'auto' {
        if (this.showTicks) {
            return this.autoTicks ? 'auto' : this.tickInterval;
        }

        return 0;
    }


    //DECLARACIÓN DE FORMULARIO
    formAdminCreditos: UntypedFormGroup;
    //DECLARACIÓN DE COLUMNAS PARA GARANTIAS
    displayedColumnsEmpleo: string[] = ['Empresa', 'Jefe Directo', 'Empleo', 'Horario', "Estado",
        "Municipio", "Colonia", "Calle", "Número Exterior", "Número Interior", "C.P.", "Localidad", "Telefono"];
    //DECLARACIÓN DE COLUMNAS PARA GARANTIAS
    displayedColumnsGarantias: string[] = ['Numero', 'Garantia', 'Detalle', 'Acciones'];
    //DECLARACIÓN DE COLUMNAS PARA AVALADOS
    displayedColumnsAvalados: string[] = ['numeroCliente', 'nombre', 'referencia', 'monto', 'saldo', 'estadoCredito'];
    //DECLARACIÓN DE COLUMNAS PARA HISTORIAL CREDITICIO
    displayedColumnsHistorial: string[] = ['refCredito', 'fechaEntrega', 'fechaVencimiento', 'fechaUltimoPago', 'montoCredito',
        'saldoCredito', 'estadoCredito'];
    //DECLARACIÓN DE COLUMNAS PARA INGRESOS
    displayedColumnsIngresos: string[] = ['Descripción', 'Monto'];
    //DECLARACIÓN DE COLUMNAS PARA EGRESOS
    displayedColumnsEgresos: string[] = ['Descripción', 'Monto'];
    //DECLARACIÓN DE COLUMNAS PARA EVALUACION 5C´s
    displayedColumns5CS: string[] = ['Referencia', 'Monto', 'Caracter', 'Capital', 'CPago', 'Condicion', 'Colateral', 'Resultado', 'Dictamen']

    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    //DECLARACIÓN DE DATASOURCE
    dataSourceEmpleo: MatTableDataSource<any>;
    dataSourceAvalados: MatTableDataSource<any>;
    dataSopurceHistorial: MatTableDataSource<any>;
    dataSourceIngreso: MatTableDataSource<any>;
    dataSourceEgreso: MatTableDataSource<any>;
    dataSource5CS: MatTableDataSource<any>;

    //DECLARACIÓN DE PAGITANOR
    @ViewChild('paginatorEmpleo') paginatorEmpleo: MatPaginator;
    @ViewChild(MatSort) sortEmpleo: MatSort
    @ViewChild('paginatorHistorial') paginatorHistorial: MatPaginator;
    @ViewChild(MatSort) sortHistorial: MatSort;
    @ViewChild('paginatorAvalados') paginatorAvalados: MatPaginator;
    @ViewChild(MatSort) sortAvalados: MatSort;
    @ViewChild('paginatorIngresos') paginatorIngresos: MatPaginator;
    @ViewChild(MatSort) sortIngresos: MatSort;
    @ViewChild('paginatorEgresos') paginatorEgresos: MatPaginator;
    @ViewChild(MatSort) sortEgresos: MatSort;
    @ViewChild('paginatorIngresosAval1') paginatorIngresosAval1: MatPaginator;
    @ViewChild(MatSort) sortInfoIngresosAval1: MatSort;
    @ViewChild('paginatorEgresosAval1') paginatorEgresosAval1: MatPaginator;
    @ViewChild(MatSort) sortInfoEgresosAval1: MatSort;
    @ViewChild('paginatorIngresosAval2') paginatorIngresosAval2: MatPaginator;
    @ViewChild(MatSort) sortInfoIngresosAval2: MatSort;
    @ViewChild('paginatorEgresosAval2') paginatorEgresosAval2: MatPaginator;
    @ViewChild(MatSort) sortInfoEgresosAval2: MatSort;
    @ViewChild('paginatorEvaluacion') paginatorEvaluacion: MatPaginator;
    @ViewChild(MatSort) sortEvaluacion: MatSort;

    /*****************************************************
     * 
     * DECLARACIÓN DE VARIABLES PARA APARTADO PRINCIPAL, BUSQUEDA DE CLIENTE
     * 
     * ************************************************** */
    titulo: string = '';
    habilitar: boolean = false;
    /*****************************************************
     * 
     * DECLARACIÓN DE VARIABLES PARA APARTADO GENERALES
     * 
     * ************************************************** */
    txtFechaNacimiento: string = 'Fecha Nacimiento';
    listaDomCliente: any = [];
    listaAgenda: any = [];
    listaDomEmpresa: any = [];
    listaEmpleos: any = [];
    listaEmpleosDom: any = [];
    listaCuentasBancarias: any = [];
    cuentasBancariasManeja = "";
    listIngresos: any = [];
    listEgresos: any = [];
    comprobacionIngresos: any = [];
    comprobacionEgresos: any = [];
    /*****************************************************
     * 
     * DECLARACIÓN DE VARIABLES PARA APARTADO AVALES
     * 
     * ************************************************** */
    listaAvales: any = [];
    sumaPorcent: number = 0;
    noAval: number = 1;
    /*****************************************************
        * 
        * DECLARACIÓN DE VARIABLES PARA APARTADO AVALES
        * 
        * ************************************************** */
    listaInversion: any = [];
    /*****************************************************
     * 
     * DECLARACIÓN DE VARIABLES PARA APARTADO DE CRÉDITOS
     * 
     * ************************************************** */
    condicionPagoId: number;
    cvEstatusCre: string = "";
    opcionesTipoCredito: Observable<string[]>;
    listaClasificacion: any[] = [];
    listaCalificacionBuro: any[] = [];
    listaAmortizacion: any[] = [];
    listaPeriodo: any[] = [];
    listaCreditos: any[] = [];
    listaEstadoCred: any[] = [];
    listaFrecuenciaPago: any[] = [];
    vHipotecas = [];
    vPrendas = [];
    cvEstatusSol: string = "";
    selectedIdCiudad: number = 0;// Destino de recurso
    seleccionCd: number = 0;//controla la ciudad seleccionada
    opcionesCiudades: Observable<string[]>;
    selectedIdEstado: number = 0;
    idEstSel: number = 0;//controla el estado seleccionado
    controlCd: number = 0;//controla la asignacion de ciudad
    destinoID: number = 0;
    listaCiudadNac: any = [];
    opcionesEstado: Observable<string[]>;//creditos 
    listaEstados: any = [];



    /*****************************************************
    * 
    * DECLARACIÓN DE VARIABLES PARA APARTADO DE GARANTIAS
    * 
    * ************************************************** */
    opcionesTipoGarantias: Observable<string[]>;
    listInversiones: any[] = [];
    listHipoteca: any[] = [];
    listaTiposGarantias: any[] = [];
    tantos: number = 0;
    porcentaje: number = 0;
    montoGarLiquida: number = 0;
    /*****************************************************
    * 
    * DECLARACIÓN DE VARIABLES PARA APARTADO DE ANÁLISIS DE VIABILIDAD DE CRÉDITO
    * 
    * ************************************************** */
    totalIngreso: number = 0.0;
    totalEgreso: number = 0.0;
    liquidez: number = 0.0;
    pagoAmortizacion2do: number = 0.0;
    resultLiquidez: string = "";
    capPago: number = 0.0;
    resultCapPago: string = "";
    cantidad: any;
    dictamen: string = "";
    /*****************************************************
* 
* DECLARACIÓN DE VARIABLES PARA APARTADO DE DIGITALIZACION DOCS
* 
* ************************************************** */

    listaDocsGar: any = [];
    listaDocsGarDgt: any = [];

    listaGarAgregadas: any = [];

    //Nuevas Listas
    listaDocsHipoteca: any = []; // 80HA
    listaDocsPrendaria: any = []; // 80PA
    listaDocsGarantiaLiquida: any = []; // 80GL
    listaDocsGrupo: any = []; // 80GC
    listaDocsClientes: any = []; //80CS
    listaDocsInversion: any = []; //80IN
    listaDocsAval: any = []; // 80AL 


    //Listas Docs digitalizados    
    listaDocsCliDgt: any = [];
    listaDocsHipotecaDgt: any = [];
    listaDocsPrendariaDgt: any = [];
    listaDocsGarantiaLiquidaDgt: any = [];
    listaDocsInversionDgt: any = [];

    /*****************************************************
    * 
    * DECLARACIÓN DE VARIABLES PARA APARTADO DE AVALADOS
    * 
    * ************************************************** */
    listaAvalados: any = [];
    listaHistorialCred: any = [];
    listaComisiones: any = [];
    /**
     * Declaracion de variables y componetes para Aporbacion o negacion de credito
     */
    formAprobacion: UntypedFormGroup;
    formAutorizacion: UntypedFormGroup;
    habilitarTab: boolean = false;
    habilitarPrPago: boolean = true;
    habilitarToogleFuturo: boolean = false;
    readOnly: boolean = false;
    autorizar: boolean = false;
    btnCalendario: boolean = false;
    tipoAmortizacion: string = "";
    cuentaBanco: string = "";
    cuentaCaja: string = "";
    cobros: any = [];
    //Validaciones acorde al tipo de credito
    tipoCr: any = "";
    montoMin: number = 0;
    montoMax: number = 0;
    plazoMin: number = 0;
    plazoMax: number = 0;
    genero: string = "";

    //Credito Renovado Reestructurados
    credito_ren_res_id: number = 0;
    saldo_restante: number = 0;
    dias_mora: number = 0;
    listaCreditoRenueva: any = [];
    tasaInteres: number = 0;

    /**
     * Constructor de la clase AdminCreditosComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        public dialog: MatDialog) {
        this.formAdminCreditos = this.formBuilder.group({

            //CREACIÓN DE LOS COMPONENTES PRINCIPALES
            numSolicitud: new UntypedFormControl(''),
            referencia: new UntypedFormControl(''),
            fecha: new UntypedFormControl({ value: new Date(), disabled: false }),
            numeroCliente: new UntypedFormControl(''),
            nombre: new UntypedFormControl(''),

            //CREACIÓN DE LOS COMPONENTES DEL TAG "GENERALES"
            apellidos: new UntypedFormControl(''),
            nombres: new UntypedFormControl(''),
            razonSocial: new UntypedFormControl(''),
            fechaNacimiento: new UntypedFormControl(''),
            edad: new UntypedFormControl(''),
            curp: new UntypedFormControl(''),
            rfc: new UntypedFormControl(''),
            estado: new UntypedFormControl(''),
            municipio: new UntypedFormControl(''),
            colonia: new UntypedFormControl(''),
            calle: new UntypedFormControl(''),
            numExterior: new UntypedFormControl(''),
            numInterior: new UntypedFormControl(''),
            cp: new UntypedFormControl(''),
            localidad: new UntypedFormControl(''),
            telefono: new UntypedFormControl(''),
            cBancaria: new UntypedFormControl(''),
            //CREACIÓN DE LOS COMPONENTES DEL TAG "CRÉDITO"
            clasificacion: new UntypedFormControl({ value: '', disabled: this.readOnly }, [Validators.required]),
            tipoCredito: new UntypedFormControl({ value: '', disabled: this.readOnly }, { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            condicionPago: new UntypedFormControl(''),
            montoCredito: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            destinoRecurso: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            estadoDestino: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            finalidad: new UntypedFormControl(''),
            tasaMoratoria: new UntypedFormControl(''),
            tasaInteres: new UntypedFormControl({ value: '', disabled: this.readOnly }),
            periodo: new UntypedFormControl({ value: '', disabled: this.readOnly }, [Validators.required]),
            estadoCredito: new UntypedFormControl(''),
            noPagos: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            resultado: new UntypedFormControl({ value: new Date(), disabled: true }, [Validators.required]),
            entrega: new UntypedFormControl({ value: new Date(), disabled: true }, [Validators.required]),
            calificacionBuro: new UntypedFormControl({ value: '', disabled: this.readOnly }),
            consultaBuro: new UntypedFormControl({ value: new Date(), disabled: false }),
            noFolioSIC: new UntypedFormControl('', [Validators.pattern('[0-9]*\.?[0-9]*')]),
            primerPago: new UntypedFormControl({ value: new Date(), disabled: true }),
            ultimoPago: new UntypedFormControl({ value: new Date(), disabled: true }),
            observacionSolicitud: new UntypedFormControl(''),
            aplicaFuturo: new UntypedFormControl(false),
            //CREACIÓN DE LOS COMPONENTES DEL TAG "GARANTÍAS"
            tipoGarantia: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),

            //CREACIÓN DE LOS COMPONENTES DEL TAG "Análisis de Viabilidad de Crédito" / ANALISIS ACREDITADO
            ocupacionA: new UntypedFormControl(''),
            fIngresos: new UntypedFormControl(''),
            liquidez: new UntypedFormControl(''),
            capPago: new UntypedFormControl(''),
        });
        //FORMULARIO APORBACION DE CREDITO
        this.formAprobacion = this.formBuilder.group({
            montoS: new UntypedFormControl(''),
            fechaP: new UntypedFormControl(new Date().toLocaleDateString()),
            usuario: new UntypedFormControl(''),
            cargo: new UntypedFormControl(''),
            estSol: new UntypedFormControl(''),
            montoAp: new UntypedFormControl(''),
            descripSol: new UntypedFormControl(''),
        });
        this.formAutorizacion = this.formBuilder.group({
            tipoCr: new UntypedFormControl(''),
            finalidad: new UntypedFormControl(''),
            estCred: new UntypedFormControl(''),
            montOtor: new UntypedFormControl(''),
            tasaN: new UntypedFormControl(''),
            tasaM: new UntypedFormControl(''),
            fechaOtor: new UntypedFormControl(new Date().toLocaleDateString()),
            usuarioA: new UntypedFormControl(''),
            noAmort: new UntypedFormControl(''),
            periodo: new UntypedFormControl(''),
            primerPago: new UntypedFormControl(''),
            vencimiento: new UntypedFormControl('')
        });
    }

    /**
     * metodo OnInit de la clase AdminCreditos para iniciar los metodos
     */
    ngOnInit() {
        //INICIO DE METODOS PARA CRÉDITOS
        this.spsClasificacion();
        this.spsCalificacionBuro();
        this.spsTipoCreditos();
        this.spsEstadoCredito();
        this.spsEstados();
    }


    /**
* Metodo para listar los ESTADOS
* 
*/
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            this.opcionesEstado = this.formAdminCreditos.get('estadoDestino').valueChanges.pipe(
                startWith(''),
                map(value => this.filterEstado(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
* Filta la categoria
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private filterEstado(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEstados.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
    }

    /**
     * Gestion de solicitudes de creditos
     * @param accion 1 Guardar 2 Editar
     */
    gestionCredito(accion: number) {
        if (this.formAdminCreditos.invalid) {
            this.validateAllFormFields(this.formAdminCreditos);
            return this.service.showNotification('top', 'right', 3, "Completa los datos requeridos.");
        }
        if (this.vCliente.cvpersona == generales.personalidadM && this.tipoCr.mercadoId == 110) {
            return this.service.showNotification('top', 'right', 3, "El tipo de crédito solo es para clientes fisicos");

        } else if (this.vCliente.cvpersona == generales.personalidadF && this.tipoCr.mercadoId == 111) {
            return this.service.showNotification('top', 'right', 3, "El tipo de crédito solo es para clientes morales");
        }
        if (this.resultLiquidez == globales.menorPagoLiquidez) {
            return this.service.showNotification('top', 'right', 3, 'Sin Liquidez, hacer adecuaciones al monto o plazo del Crédito.');
        }

        if (this.resultCapPago == globales.capPagoMuyBaja || this.resultCapPago == globales.capPagoBaja) {
            return this.service.showNotification('top', 'right', 3, 'Sin Capacidad de Pago, hacer adecuaciones al monto, plazo o Tipo de Crédito.');
        }
        if (this.formAdminCreditos.get('clasificacion').value.cveClasificacion != generales.clasificacionCredNuevo) {
            if (this.value < this.tasaInteres) {
                return this.service.showNotification('top', 'right', 3, 'La tasa de interes debe ser igual o mayor a ' + this.tasaInteres);

            }
        }

        if (this.listaAmortizacion.length === 0) {
            return this.service.showNotification('top', 'right', 3, 'Falta generar la lista de amortizaciones.');
        }

        if (this.listaTiposGarantias.length > 0) {

            for (let gar of this.listaTiposGarantias) {

                if (gar.cve_garantia.trim() === globales.cveGarHipa) {
                    if (this.vHipotecas.length === 0) {
                        return this.service.showNotification('top', 'right', 3, 'Falta agregar la Garantía Hipotecaría.');
                    }
                }

                if (gar.cve_garantia.trim() === globales.cveGarPrenda) {
                    if (this.vPrendas.length === 0) {
                        return this.service.showNotification('top', 'right', 3, 'Falta agregar la Garantía Prendaría.');
                    }
                }

                if (gar.cve_garantia.trim() === globales.cveGarLiq) {
                    if (this.montoGarLiquida === 0) {
                        return this.service.showNotification('top', 'right', 3, 'Falta agregar la Garantía Liquida.');
                    }
                }

                if (gar.cve_garantia.trim() === globales.cveGarInversion) {
                    if (this.listaInversion.length === 0) {
                        return this.service.showNotification('top', 'right', 3, 'Falta agregar la Garantía Inversión.');
                    }
                }

                if (this.vCreditoID > 0) {
                    if (gar.cve_garantia.trim() === globales.cveGarAval) {
                        if (this.listaAvales.length === 0) {
                            return this.service.showNotification('top', 'right', 3, 'Falta agregar la Garantía Aval.');
                        }
                    }
                }

            }

        }

        this.listaDocsGarDgt = [];

        if (this.listaDocsClientes.length > 0) {
            if (this.listaDocsClientes.length !== this.listaDocsCliDgt.length) {
                this.service.showNotification('top', 'right', 3, 'Faltan documentos de Cliente por Digitalizar.');
                return;
            }
        }

        if (this.listaDocsHipoteca.length > 0) {
            if (this.listaDocsHipoteca.length === this.listaDocsHipotecaDgt.length) {
                for (let hip of this.listaDocsHipotecaDgt) {
                    this.listaDocsGarDgt.push(hip);
                }
            } else {
                this.service.showNotification('top', 'right', 3, 'Faltan documentos de Hipoteca por Digitalizar.');
                return;
            }
        }

        if (this.listaDocsPrendaria.length > 0) {
            if (this.listaDocsPrendaria.length === this.listaDocsPrendariaDgt.length) {
                for (let pre of this.listaDocsPrendariaDgt) {
                    this.listaDocsGarDgt.push(pre);
                }
            } else {
                this.service.showNotification('top', 'right', 3, 'Faltan documentos de Prenda por Digitalizar.');
                return;
            }
        }

        if (this.listaDocsGarantiaLiquida.length > 0) {
            if (this.listaDocsGarantiaLiquida.length === this.listaDocsGarantiaLiquidaDgt.length) {
                for (let liq of this.listaDocsGarantiaLiquidaDgt) {
                    this.listaDocsGarDgt.push(liq);
                }
            } else {
                this.service.showNotification('top', 'right', 3, 'Faltan documentos de Garantía Liquida por Digitalizar.');
                return;
            }
        }

        if (this.listaDocsInversion.length > 0) {
            if (this.listaDocsInversion.length === this.listaDocsInversionDgt.length) {
                for (let inv of this.listaDocsInversionDgt) {
                    this.listaDocsGarDgt.push(inv);
                }
            } else {
                this.service.showNotification('top', 'right', 3, 'Faltan documentos de Inversión por Digitalizar.');
                return;
            }
        }



        this.blockUI.start('Guardando...');
        let calBuro = null;
        if (!this.vacio(this.formAdminCreditos.get('calificacionBuro').value)) {
            calBuro = this.formAdminCreditos.get('calificacionBuro').value.generalesId;
        }


        let jsonCredito = {
            "solCredito": [
                this.vSolicitudID,
                this.formAdminCreditos.get('resultado').value,
                this.formAdminCreditos.get('entrega').value,
                this.formAdminCreditos.get('observacionSolicitud').value,
                calBuro,
                this.formAdminCreditos.get('consultaBuro').value,
                this.formAdminCreditos.get('noFolioSIC').value,
                this.servicePermisos.sucursalSeleccionada.sucursalid,
                this.formAdminCreditos.get('destinoRecurso').value.ciudaId
            ],
            "credito": [
                this.vCreditoID,
                this.vCliente.cliente_id,
                this.formAdminCreditos.get('tipoCredito').value.creditoId,
                this.formAdminCreditos.get('montoCredito').value,
                this.formAdminCreditos.get('montoCredito').value,
                this.value,
                this.formAdminCreditos.get('tasaMoratoria').value,
                this.psolicitud.estadoCredId,
                this.formAdminCreditos.get('clasificacion').value.clasificacionID,
                this.formAdminCreditos.get('tipoCredito').value.extenciones.extencionCatalogoCreditos.tipoAmortizacionId,
                this.formAdminCreditos.get('ultimoPago').value,
                this.formAdminCreditos.get('primerPago').value,
                this.formAdminCreditos.get('ultimoPago').value,
                this.formAdminCreditos.get('periodo').value.tipoPlazoId,
                this.montoGarLiquida,//monto de la garantía
                this.servicePermisos.usuario.id,
                this.vCliente.sujeto_cl,
                this.formAdminCreditos.get('noPagos').value,
                this.formAdminCreditos.get('aplicaFuturo').value,
                this.credito_ren_res_id,
                this.saldo_restante,
                this.dias_mora
            ],
            "hipoteca": this.vHipotecas,
            "prenda": this.vPrendas,
            "digDeudor": this.listaDocsCliDgt,
            "digGarantias": this.listaDocsGarDgt,
            "gInversiones": this.listaInversion,
            "origen": generales.origenMov,
            "accion": accion
        };

        this.service.registrar(jsonCredito, 'crudSolCredito').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    //Se vacean las listas y formulario
                    this.limpiarAdministracion();
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );



    }

    /********************************************************************************************************************
     * 
     * BLOQUE PARA CREACIÓN DE METODOS GENERALES PARA EL PRINCIPAL, BUSQUEDA DE CLIENTE
     * 
     * ******************************************************************************************************************/

    /**
      * Metodo para abrir ventana modal para buscar al cliente
      * @param data -- Objecto o valor a condicionar
      */
    abrirDialogCliente(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        this.limpiarAdministracion();
        if (data === 0) {//clientes
            this.titulo = "Lista clientes";

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                disableClose: true,
                data: {
                    titulo: this.titulo,
                    cliente: data
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                if (result != 1) {
                    if (result.tipoPersona == 'F') {
                        this.habilitar = true;
                        this.llenarDatosCliente(result.datosCl, '');
                    } else {
                        //Moral
                        this.habilitar = true;
                        this.llenardatosMoral(result.datosCl, '');
                    }
                }

            });
        }

    }

    /********************************************************************************************************************
     * 
     * BLOQUE PARA CREACIÓN DE METODOS GENERALES PARA EL APARTADO DE GENERALES
     * 
     * ******************************************************************************************************************/

    /**
     * Metodo para llenar los campos de la información del cliente a SELECCIONADO
     */
    llenarDatosCliente(datos, detalle) {
        this.vCliente = datos;
        this.blockUI.start('Cargando datos...');
        this.sujetoID = datos.sujeto_cl;
        this.spsAvalados(this.sujetoID);
        this.spsHistorialCred(datos.numero_cliente);

        this.formAdminCreditos.get('numeroCliente').setValue(datos.numero_cliente);
        this.formAdminCreditos.get('nombre').setValue(datos.nombre_cl + ' ' + datos.paterno_cl + ' ' + datos.materno_cl);
        this.formAdminCreditos.get('apellidos').setValue(datos.paterno_cl + ' ' + datos.materno_cl);
        this.formAdminCreditos.get('nombres').setValue(datos.nombre_cl);
        this.txtFechaNacimiento = 'Fecha Nacimiento';
        this.formAdminCreditos.get('fechaNacimiento').setValue(datos.fecha_nacimiento);
        //Validar el genero al que se otorga el credito
        this.genero = datos.cve_generales;
        //CALCULAR LA EDAD DEL CLIENTE
        const convertAge = new Date(this.formAdminCreditos.get('fechaNacimiento').value);
        let timeDiff = Math.abs(Date.now() - convertAge.getTime());
        this.formAdminCreditos.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365) + ' años');
        this.formAdminCreditos.get('curp').setValue(datos.curp.trim());
        this.formAdminCreditos.get('rfc').setValue(datos.rfc.trim());

        // TRAE LA LISTA DE DOMICILIOS
        // Parceamos el domicilio a JSON y las guardamos en listaDomCliente   
        //filtra el resultado por el domicilio Principal
        this.listaDomCliente = JSON.parse(datos.domicilio_cl).filter((result) => result.num_dom.toUpperCase() === globales.principal.toUpperCase());

        //Valida que la lista no venga vacia para setear los datos al formulario
        if (!this.vacio(this.listaDomCliente)) {
            this.formAdminCreditos.get('estado').setValue(this.listaDomCliente[0].nombre_estado);
            this.formAdminCreditos.get('municipio').setValue(this.listaDomCliente[0].ciudad);
            this.formAdminCreditos.get('colonia').setValue(this.listaDomCliente[0].nombre_colonia);
            this.formAdminCreditos.get('calle').setValue(this.listaDomCliente[0].calle);
            this.formAdminCreditos.get('numExterior').setValue(this.listaDomCliente[0].numero_exterior);
            this.formAdminCreditos.get('cp').setValue(this.listaDomCliente[0].cp);
            this.formAdminCreditos.get('localidad').setValue(this.listaDomCliente[0].localidad);
            this.formAdminCreditos.get('numInterior').setValue(this.listaDomCliente[0].numero_interior);
        }
        // TRAE LA LISTA DE AGENDAS
        // Parceamos la agenda a JSON y las guardamos en listaAgenda
        //filtra el resultado por la agenda Principal
        this.listaAgenda = JSON.parse(datos.agendacl).filter((result) => result.descripcion === globales.principal);
        //Valida que la lista no venga vacia para setear los datos al formulario
        if (!this.vacio(this.listaAgenda)) {
            this.formAdminCreditos.get('telefono').setValue(this.listaAgenda[0].telefono);
        }

        // TRAE LA LISTA DE EMPLEOS
        // Parceamos la agenda a JSON y las guardamos en listaEmpleos
        if (!this.vacio(datos.empleos_cl)) {
            this.listaEmpleos = JSON.parse(datos.empleos_cl);

            //TRAE LAS CUENTAS BANCARIAS QUE MANEJA EL CLIENTE
            // Parceamos la agenda a JSON y las guardamos en listaCuentasBancarias
            this.listaCuentasBancarias = JSON.parse(datos.maneja_cuentas);
            //Valida que la lista no venga vacia para setear los de la cuenta bancaria a cuentasBancariasManeja


            this.formAdminCreditos.get('ocupacionA').setValue(this.listaEmpleos[0].ocupacion);
            this.formAdminCreditos.get('fIngresos').setValue(this.listaEmpleos[0].observacion);

            this.cuentasBancariasManeja = ""
            if (this.listaCuentasBancarias.length > 0) {
                this.listaCuentasBancarias.forEach(cuentaBanc => {
                    if (this.cuentasBancariasManeja === "") {
                        this.cuentasBancariasManeja = this.cuentasBancariasManeja + cuentaBanc.cuenta;
                    } else {
                        this.cuentasBancariasManeja = this.cuentasBancariasManeja + '/' + cuentaBanc.cuenta;
                    }
                });
            }

            //MUESTRAS LAS CUENTAS BANCARIAS
            this.formAdminCreditos.get('cBancaria').setValue(this.cuentasBancariasManeja);

            //Valida que la lista no venga vacia para setear los datos a la tabla de empleos
            if (!this.vacio(this.listaEmpleos)) {

                // se declara la lista para mostrar la información en vacia
                this.listaEmpleosDom = []

                //Se crea forEach para agregar la información del JSON de forma lineal
                this.listaEmpleos.forEach(empleo => {
                    // TRAE LA LISTA DE DOMICILIO DE LA EMPRESA
                    // Parceamos la agenda a JSON y las guardamos en listaDomEmpresa
                    this.listaDomEmpresa = JSON.parse(datos.domicilio_emp).filter((result) => result.empresa_id === this.listaEmpleos[0].empresa_id);
                    //Hitera la información de empresa y construye el JSON para juntar la información del empleo y el domicilio de la empresa
                    this.listaDomEmpresa.forEach(domEmpresa => {
                        let jsonLineal = {
                            "empleo": {
                                "horario_desde": empleo.horario_desde,
                                "horario_hasta": empleo.horario_hasta,
                                "nombre_comercial": empleo.nombre_comercial,
                                "ocupacion": empleo.ocupacion,
                                "representante": empleo.representante,
                            }, "domicilioEmpresa": {
                                "calle_empresa": domEmpresa.calle_empresa,
                                "ciudad_emp": domEmpresa.ciudad_emp,
                                "cp_emp": domEmpresa.cp_emp,
                                "localidad_emp": domEmpresa.localidad_emp,
                                "nombre_col_emp": domEmpresa.nombre_col_emp,
                                "nombre_estado_emp": domEmpresa.nombre_estado_emp,
                                "num_ext_empresa": domEmpresa.num_ext_empresa,
                                "num_int_empresa": domEmpresa.num_int_empresa,
                                "telefono": domEmpresa.telefono
                            }

                        }
                        this.listaEmpleosDom.push(jsonLineal)
                    });
                });

                //CREAMOS  EL DATA SOURCE PARA EL EMPLEO
                this.dataSourceEmpleo = new MatTableDataSource(this.listaEmpleosDom);
                setTimeout(() => this.dataSourceEmpleo.paginator = this.paginatorEmpleo);
                this.dataSourceEmpleo.sort = this.sortEmpleo;
            }
        }
        // TRAE LA LISTA DE INGRESOS DEL CLIENTE
        // Parceamos los ingresos a JSON y las guardamos en listIngresos
        this.listIngresos = JSON.parse(datos.ingresos);

        // LISTA PARA HACER LA COMPROBACIÓN DE INGRESOS DE LA 5C,S
        this.comprobacionIngresos = this.listIngresos
        //Valida que la lista no venga vacia para setear los datos a la tabla de ingresos
        if (!this.vacio(this.listIngresos)) {
            this.listIngresos.forEach(ingresos => {

                this.totalIngreso = this.totalIngreso + parseFloat(ingresos.monto_ingreso);
            });
            //Setea el Total del Ingreso a la lista
            let totalI: any
            totalI = { "ingreso": "Total Ingreso", "monto_ingreso": this.totalIngreso };
            this.listIngresos.push(totalI)

            //CREAMOS  EL DATA SOURCE PARA EL INGRESOS
            this.dataSourceIngreso = new MatTableDataSource(this.listIngresos);
            this.dataSourceIngreso.paginator = this.paginatorIngresos;
            this.dataSourceIngreso.sort = this.sortIngresos;
        }
        // TRAE LA LISTA DE EGRESOS DEL CLIENTE
        // Parceamos los egresos a JSON y las guardamos en listEgresos
        this.listEgresos = JSON.parse(datos.egresos_cl)

        // LISTA PARA HACER LA COMPROBACIÓN DE EGRESOS DE LA 5C,S
        this.comprobacionEgresos = this.listEgresos
        //Valida que la lista no venga vacia para setear los datos a la tabla de egresos
        if (!this.vacio(this.listEgresos)) {
            this.listEgresos.forEach(egresos => {

                this.totalEgreso = this.totalEgreso + parseFloat(egresos.monto_egreso);

            });
            //Setea el Total del Egreso a la lista
            let totalE: any
            totalE = { "descripcion": "Total Egreso", "monto_egreso": this.totalEgreso };
            this.listEgresos.push(totalE)

            //CREAMOS  EL DATA SOURCE PARA EL EGRESOS
            this.dataSourceEgreso = new MatTableDataSource(this.listEgresos);
            this.dataSourceEgreso.paginator = this.paginatorEgresos;
            this.dataSourceEgreso.sort = this.sortEgresos;

        }

        //CALCULAR LA LIQUIDEZ DEL CLIENTE
        this.liquidez = this.totalIngreso - this.totalEgreso
        if (!this.vacio(detalle)) {
            this.verificarFecha(detalle);//se actualizan a la tabla de amortizaciones
        }

        //CARGA LAS GARANTIASthis.spsGarantias()
        this.blockUI.stop();
    }
    /**
     * Metodo para llenar los datos cuendo el cliente es moral */
    llenardatosMoral(datosM, detalle) {
        this.vCliente = datosM;
        //encabezado
        this.formAdminCreditos.get('numeroCliente').setValue(datosM.numero_cliente);
        this.formAdminCreditos.get('nombre').setValue(datosM.nombre_comercial);
        this.formAdminCreditos.get('nombres').setValue('');
        this.formAdminCreditos.get('apellidos').setValue('');
        this.formAdminCreditos.get('curp').setValue('');
        this.listaEmpleos = [];
        this.txtFechaNacimiento = 'Fecha Constitución';
        this.formAdminCreditos.get('fechaNacimiento').setValue(datosM.fecha_constitucion);
        this.formAdminCreditos.get('razonSocial').setValue(datosM.razon_social);

        //CALCULAR LA EDAD DEL CLIENTE
        const convertAge = new Date(this.formAdminCreditos.get('fechaNacimiento').value);
        let timeDiff = Math.abs(Date.now() - convertAge.getTime());
        this.formAdminCreditos.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365) + ' años');
        this.formAdminCreditos.get('rfc').setValue(datosM.rfc.trim());

        // TRAE LA LISTA DE DOMICILIOS
        // Parceamos el domicilio a JSON y las guardamos en listaDomCliente   
        //filtra el resultado por el domicilio Principal
        this.listaDomCliente = JSON.parse(datosM.domicilio_cl_moral).filter((result) => result.num_dom === globales.principal);

        //Valida que la lista no venga vacia para setear los datos al formulario
        if (!this.vacio(this.listaDomCliente)) {
            this.formAdminCreditos.get('estado').setValue(this.listaDomCliente[0].nombre_estado);
            this.formAdminCreditos.get('municipio').setValue(this.listaDomCliente[0].ciudad);
            this.formAdminCreditos.get('colonia').setValue(this.listaDomCliente[0].nombre_colonia);
            this.formAdminCreditos.get('calle').setValue(this.listaDomCliente[0].calle);
            this.formAdminCreditos.get('numExterior').setValue(this.listaDomCliente[0].numero_exterior);
            this.formAdminCreditos.get('cp').setValue(this.listaDomCliente[0].cp);
            this.formAdminCreditos.get('localidad').setValue(this.listaDomCliente[0].localidad);
            this.formAdminCreditos.get('numInterior').setValue(this.listaDomCliente[0].numero_interior);
        }
        // TRAE LA LISTA DE AGENDAS
        // Parceamos la agenda a JSON y las guardamos en listaAgenda
        //filtra el resultado por la agenda Principal
        this.listaAgenda = JSON.parse(datosM.agendacl).filter((result) => result.descripcion === globales.principal);
        //Valida que la lista no venga vacia para setear los datos al formulario
        if (!this.vacio(this.listaAgenda)) {
            this.formAdminCreditos.get('telefono').setValue(this.listaAgenda[0].telefono);
        }
        this.formAdminCreditos.get('ocupacionA').setValue(datosM.act_scian);
        this.formAdminCreditos.get('fIngresos').setValue(datosM.giro);

        //TRAE LAS CUENTAS BANCARIAS QUE MANEJA EL CLIENTE
        // Parceamos la agenda a JSON y las guardamos en listaCuentasBancarias
        this.listaCuentasBancarias = JSON.parse(datosM.maneja_cuentas);
        //Valida que la lista no venga vacia para setear los de la cuenta bancaria a cuentasBancariasManeja
        if (!this.vacio(this.listaCuentasBancarias)) {
            this.cuentasBancariasManeja = ""
            this.listaCuentasBancarias.forEach(cuentaBanco => {
                if (this.cuentasBancariasManeja === "") {
                    this.cuentasBancariasManeja = this.cuentasBancariasManeja + cuentaBanco.cuenta;
                } else {
                    this.cuentasBancariasManeja = this.cuentasBancariasManeja + '/' + cuentaBanco.cuenta;
                }
            });
            //MUESTRAS LAS CUENTAS BANCARIAS
            this.formAdminCreditos.get('cBancaria').setValue(this.cuentasBancariasManeja);
        }
        // TRAE LA LISTA DE INGRESOS DEL CLIENTE
        // Parceamos los ingresos a JSON y las guardamos en listIngresos
        this.listIngresos = JSON.parse(datosM.ingresos);
        // LISTA PARA HACER LA COMPROBACIÓN DE INGRESOS DE LA 5C,S
        this.comprobacionIngresos = this.listIngresos
        //Valida que la lista no venga vacia para setear los datos a la tabla de ingresos
        if (!this.vacio(this.listIngresos)) {
            this.listIngresos.forEach(ingresos => {
                this.totalIngreso = this.totalIngreso + parseFloat(ingresos.monto_ingreso);
            });
            //Setea el Total del Ingreso a la lista
            let totalI: any
            totalI = { "ingreso": "Total Ingreso", "monto_ingreso": this.totalIngreso };
            this.listIngresos.push(totalI)

            //CREAMOS  EL DATA SOURCE PARA EL INGRESOS
            this.dataSourceIngreso = new MatTableDataSource(this.listIngresos);
            this.dataSourceIngreso.paginator = this.paginatorIngresos;
            this.dataSourceIngreso.sort = this.sortIngresos;
        }

        // TRAE LA LISTA DE EGRESOS DEL CLIENTE
        // Parceamos los egresos a JSON y las guardamos en listEgresos
        this.listEgresos = JSON.parse(datosM.egresos_cl)

        // LISTA PARA HACER LA COMPROBACIÓN DE EGRESOS DE LA 5C,S
        this.comprobacionEgresos = this.listEgresos
        //Valida que la lista no venga vacia para setear los datos a la tabla de egresos
        if (!this.vacio(this.listEgresos)) {
            this.listEgresos.forEach(egresos => {
                this.totalEgreso = this.totalEgreso + parseFloat(egresos.monto_egreso);
            });
            //Setea el Total del Egreso a la lista
            let totalE: any
            totalE = { "descripcion": "Total Egreso", "monto_egreso": this.totalEgreso };
            this.listEgresos.push(totalE)

            //CREAMOS  EL DATA SOURCE PARA EL EGRESOS
            this.dataSourceEgreso = new MatTableDataSource(this.listEgresos);
            this.dataSourceEgreso.paginator = this.paginatorEgresos;
            this.dataSourceEgreso.sort = this.sortEgresos;

        }
        //CALCULAR LA LIQUIDEZ DEL CLIENTE
        this.liquidez = this.totalIngreso - this.totalEgreso;
        if (!this.vacio(detalle)) {
            this.verificarFecha(detalle);//se actualizan a la tabla de amortizaciones
        }
    }

    /********************************************************************************************************************
     * 
     * BLOQUE PARA CREACIÓN DE METODOS GENERALES PARA EL APARTADO DE CRÉDITOS 
     * 
     * ******************************************************************************************************************/

    /**
     * Metodo que consulta las clasificaciones de creditos
     */
    spsClasificacion() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsClasificacionCred').subscribe(data => {
            this.listaClasificacion = data;
            if (this.nuevo === true) {
                let esNuevo = this.listaClasificacion.find(c => c.cveClasificacion.trim() === globales.cveClaNuevo.trim());
                this.formAdminCreditos.get('clasificacion').setValue(esNuevo);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
     * Metodo que consulta las el Estado del Credito.
     */
    spsEstadoCredito() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaEstadoCred').subscribe(data => {
            this.listaEstadoCred = data;

            //SETEA EL ESTADO DEL CREDITO
            this.psolicitud = data.find(c => c.cveEstadoCred === generales.solicitudCredito);

            this.formAdminCreditos.get('estadoCredito').setValue(this.psolicitud.descripcion);
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }


    /**
   * Método para obtener el id del estado seleccionado
   * @param event  - Estado seleccioando a filtrar ciudades
   */
    opcionSeleccionadaE(event) {
        this.selectedIdEstado = event.option.value.estadoid;
        this.idEstSel = this.selectedIdEstado;
        this.spsCiudadNac();
    }

    /**
* Metodo para filtrar por ciudad ID las localidades
@param event ciudad seleccionda
*/
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.seleccionCd = this.selectedIdCiudad;
    }



    /**
    * Metodo que lista ciudades por Estado ID fitlrado, para referencias y clientes
    */

    spsCiudadNac() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formAdminCreditos.get('destinoRecurso').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            if (this.controlCd === 1) {
                let fCiudad = this.listaCiudadNac.find(c => c.ciudaId === this.destinoID);
                this.formAdminCreditos.get('destinoRecurso').setValue(fCiudad);
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
   * @returns --nombre del estado 
   */
    mostrarEstado(option: any): any {
        return option ? option.nombreEstado : undefined;
    }

    /**
   * Filtra la ciudad
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
    private _filterCiudadNac(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCiudadNac.filter(option => option.nombre.toLowerCase().includes(filterValue));
    }

    /**
      * Muestra la descripcion de la ciudad
      * @param option --ciudad seleccionada
      * @returns --nombre de ciudad
      */
    mostrarCd(option: any): any {
        return option ? option.nombre : undefined;
    }
    /**
     * Metodo que consulta las clasificaciones del buro de creditos
     */
    spsCalificacionBuro() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(generales.clasificacionBuroCred, 'listaGeneralCategoria').subscribe(data => {
            this.listaCalificacionBuro = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Metodo que consulta las amortizaciones
    */
    spsAmortizaciones() {
        //VALIDAR Q SE SELECCIONE PERIODO PLAZO CANTIDAD AMORTIZAR
        this.blockUI.start('Cargando datos...');
        if (this.formAdminCreditos.invalid) {
            this.validateAllFormFields(this.formAdminCreditos);
            this.service.showNotification('top', 'right', 3, "Completa la información del crédito.");
            this.blockUI.stop();
            return;
        }
        let tipoAmortizacion = '02'
        if (this.formAdminCreditos.get('tipoCredito').value.extenciones.extencionCatalogoCreditos.tipoAmortizacionId === 1) {
            tipoAmortizacion = '01';
        }
        let bodyAmortizacion = {
            "pclavecredito": this.formAdminCreditos.get('tipoCredito').value.cveCredito,
            "pmonto": this.formAdminCreditos.get('montoCredito').value,
            "ptasa": this.value,
            "pplazo": this.formAdminCreditos.get('periodo').value.dias,
            "amortizaciones": this.formAdminCreditos.get('noPagos').value,
            "ptipoamortizacion": tipoAmortizacion,
            "paplicaiva": this.formAdminCreditos.get('tipoCredito').value.aplicaIVA,
            "pfechaotorga": moment(this.formAdminCreditos.get('entrega').value).format("yyyy-MM-DD"),
            "aplicapfuturo": this.formAdminCreditos.get('aplicaFuturo').value,
            "pprimerpago": moment(this.formAdminCreditos.get('primerPago').value).format("yyyy-MM-DD"),
        }
        this.service.registrar(bodyAmortizacion, 'listaAmortizaciones').subscribe(data => {
            this.listaAmortizacion = data;
            this.modalTablaAMortizaciones();
            this.formAdminCreditos.get('primerPago').setValue(this.listaAmortizacion[0].fechapago + 'T00:00:00');
            this.formAdminCreditos.get('ultimoPago').setValue(this.listaAmortizacion[this.listaAmortizacion.length - 1].fechapago + 'T00:00:00');
            //En Tab Autorrizacion se pasan las fechas de primer y ultimo pago
            this.formAutorizacion.get('primerPago').setValue(moment(this.listaAmortizacion[0].fechapago).format("DD-MM-yyyy"));
            this.formAutorizacion.get('vencimiento').setValue(moment(this.listaAmortizacion[this.listaAmortizacion.length - 1].fechapago).format("DD-MM-yyyy"));
            this.calcularCapacidadPago();

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**
     * Metodo para culcular la capcidad e pago en base a las amortizaciones calculadas */
    calcularCapacidadPago() {
        //TOMAR EL 2DO PAGO DE LA TABLA DE AMORTIZACIONES
        if (this.listaAmortizacion.length > 0) {
            this.pagoAmortizacion2do = this.listaAmortizacion[1].pagototal;
        }
        if (this.liquidez > this.pagoAmortizacion2do) {
            this.resultLiquidez = globales.mayorPagoLiquidez
        } else if (this.liquidez === this.pagoAmortizacion2do) {
            this.resultLiquidez = globales.igualPagoLiquidez
        } else {
            this.resultLiquidez = globales.menorPagoLiquidez
        }

        //CALCULAR LA CAPACIDAD DE PAGO DEL CLIENTE
        this.capPago = (this.pagoAmortizacion2do / this.totalIngreso) * 100;
        if (this.capPago >= 1 && this.capPago < 16) {
            this.resultCapPago = globales.capPagoMuyAlta
        } else if (this.capPago >= 16 && this.capPago < 26) {
            this.resultCapPago = globales.capPagoAlta
        } else if (this.capPago >= 26 && this.capPago < 36) {
            this.resultCapPago = globales.capPagoMedia
        } else if (this.capPago >= 36 && this.capPago < 61) {
            this.resultCapPago = globales.capPagoBaja
        } else if (this.capPago > 61) {
            this.resultCapPago = globales.capPagoMuyBaja
        }
    }
    /**
     * Modal para mostrar la tabla de amortizaciones
     * Se le pasa la lista de amortizaciones
     */
    modalTablaAMortizaciones() {
        let parametrosAmort = {};
        this.dialog.open(AmortizacionesComponent, {
            data: {
                titulo: 'Tabla de amortizaciones',
                parametros: parametrosAmort,//vacio
                lista: this.listaAmortizacion//se pasa la lista de spsamortizaciones
            }
        });

    }
    /**
   * Metodo que lista los tipos de Creditos
   */
    spsTipoCreditos() {
        this.blockUI.start('Cargando ...');
        let id = this.servicePermisos.sucursalSeleccionada.sucursalid;
        this.service.getListByArregloIDs(id + '/' + 2, 'listaCreditosBySucursal').subscribe(data => {

            this.listaCreditos = data;
            // Se setean los creditos para el autocomplete
            this.opcionesTipoCredito = this.formAdminCreditos.get('tipoCredito').valueChanges.pipe(
                startWith(''),
                map(value => this._filterTipoCredito(value)));

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterTipoCredito(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCreditos.filter(option => option.cveCredito.toLowerCase().trim().includes(filterValue)
            || option.descripcion.toLowerCase().trim().includes(filterValue));
    }

    /**
     * Muestra la descripcion del tipo de Credito
     * @param option --tipo credito seleccionado
     * @returns -- tipo credito
     */
    displayFnTipoCredito(option: any): any {
        return option ? option.descripcion.trim() : undefined;
    }
    /**
     * Se obtiene el estatus del pago futuro al cambiar
     * @param event checked se conoce el estatus del toogle
     */
    filtroFuturo(event: any) {
        if (event.checked === false) {
            this.habilitarPrPago = true;
        } else {
            this.habilitarPrPago = false;
        }
    }

    /**
     * Metodo que carga la informacion de condiciones de pago, finaidades, tasas de interes
     * @param option objeto de tipo de creditos
     */
    cargarInformacion(option) {
        this.spsCondicionesPago(option);
        this.spslistaFinalidades(option);
        this.formAdminCreditos.get('tasaMoratoria').setValue(option.tasaInteresMoratorio);
        this.spsPeriodo(option);
        //OBTENCION DE INFOMACION PARA VALIDAR EL MONTO
        this.montoMin = option.extenciones.extencionCatalogoCreditos.montoMinimo;
        this.montoMax = option.extenciones.extencionCatalogoCreditos.montoMaximo;
        //Se pasa la informacion del credito para las validaciones.
        this.tipoCr = option;
        let tasasIntervalo = JSON.parse(option.extenciones.extCatCreCinco.rangoInteresNormal);
        this.max = tasasIntervalo[0].tasa_final;
        this.min = tasasIntervalo[0].tasa_inicial;
        //Aplica pago futuro 
        if (option.extenciones.extCatCreCuatro.pagoFuturo === true) {
            //toogle en false y habilitado
            this.habilitarToogleFuturo = false;
            this.formAdminCreditos.get('aplicaFuturo').setValue(false);
            //fecha primer pago se habilita 
            this.habilitarPrPago = false;
        } else {
            //fecha primer pago se deshabilita 
            this.habilitarPrPago = true;
            //deshabilitado
            this.habilitarToogleFuturo = true;
            this.formAdminCreditos.get('aplicaFuturo').setValue(false);
        }
        //INICIO DE METODOS PARA GARANTIAS
        this.spsTipoGarantia(option);
        //CalificacionCinco
        this.spsEvaluacionCinco();
        //Metodos Digitalizacion
        this.setDocADigitalizar(option);

        //Comisiones 
        this.listaComisiones = JSON.parse(option.extenciones.extCatCreCinco.comisiones);
        if (this.vCliente.cvpersona == generales.personalidadM && this.tipoCr.mercadoId == 110) {
            this.service.showNotification('top', 'right', 3, "El tipo de crédito solo es para clientes fisicos");

        } else if (this.vCliente.cvpersona == generales.personalidadF && this.tipoCr.mercadoId == 111) {
            this.service.showNotification('top', 'right', 3, "El tipo de crédito solo es para clientes morales");
        }
    }
    /**
     * Se Validadn los parametros del credito a otorgar
     * @param tipoCredito informacion del catalogo de creditos
     */
    validarParametrosCr() {
        //VALIDA LA CANTIDAD DE PAGOS QUE SE PUEDEN REALIZAR
        this.plazoMin = this.tipoCr.extenciones.extencionCatalogoCreditos.plazoMinimo;
        this.plazoMax = this.tipoCr.extenciones.extencionCatalogoCreditos.plazoMaximo;
        let noPagos = this.formAdminCreditos.get('noPagos').value;
        if (noPagos > 0) {
            let periodo = this.formAdminCreditos.get('periodo').value.dias;
            let pagosMax = Math.round(this.plazoMax / periodo);
            let pagosMin = Math.round(this.plazoMin / periodo);

            if (noPagos < pagosMin) {
                this.service.showNotification('top', 'right', 3, "El plazo mínimo debe ser mayor o igual a " + pagosMin + " pagos");
            } else if (noPagos > pagosMax) {
                this.service.showNotification('top', 'right', 3, "El plazo máximo debe ser menor o igual a " + pagosMax + " pagos.");

            }
        }
        //Validar Folio SIC 
        this.formAdminCreditos.get('noFolioSIC').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')]);
        this.formAdminCreditos.get('calificacionBuro').clearValidators();
        this.formAdminCreditos.get('consultaBuro').clearValidators();
        this.formAdminCreditos.get('noFolioSIC').updateValueAndValidity();
        this.formAdminCreditos.get('calificacionBuro').updateValueAndValidity();
        this.formAdminCreditos.get('consultaBuro').updateValueAndValidity();
        this.validarParametrosBuro();
        if (this.tipoCr.mercadoId == 110 && this.vCliente.cvpersona == generales.personalidadF) {//Personas fisicas 01PF
            //Validar Genero
            let listaGeneros = JSON.parse(this.tipoCr.extenciones.extCatCreCinco.generos);
            let genero = listaGeneros.find((g) => { return g.cve_generales === this.genero });
            if (this.vacio(genero)) {
                let datos = "";
                listaGeneros.forEach(element => {
                    datos += ', ' + element.descripcion;
                });
                this.service.showNotification('top', 'right', 3, "El tipo de crédito solo aplica al genero" + datos);
            }
            //Validar edad permitida
            if (this.tipoCr.extenciones.extencionCatalogoCreditosDos.edadPermitidaAplica == true) {
                let edad = this.formAdminCreditos.get('edad').value.replace('años', '');
                if (edad > this.tipoCr.extenciones.extencionCatalogoCreditosDos.edadPermitidaMax &&
                    edad < this.tipoCr.extenciones.extencionCatalogoCreditosDos.edadPermitidaMin) {
                    this.service.showNotification('top', 'right', 3, "La edad del cliente de estar entre " + this.tipoCr.extenciones.extencionCatalogoCreditosDos.edadPermitidaMin + "años y " + this.tipoCr.extenciones.extencionCatalogoCreditosDos.edadPermitidaMax);

                }
            }
        }

    }
    /**
     * Valida si es requerido la conuslta a buro de credito 
     */
    validarParametrosBuro() {
        if (this.tipoCr.extenciones.extencionCatalogoCreditos.consultaSicAplica == true) {
            if (this.formAdminCreditos.get('montoCredito').value >= this.tipoCr.extenciones.extencionCatalogoCreditos.consultaSicNumero) {
                //validar la consulta buro
                this.formAdminCreditos.get('noFolioSIC').setValidators([Validators.pattern('[0-9]*\.?[0-9]*'), Validators.required]);
                this.formAdminCreditos.get('calificacionBuro').setValidators([Validators.required]);
                this.formAdminCreditos.get('consultaBuro').setValidators([Validators.required]);

                this.formAdminCreditos.get('noFolioSIC').markAsTouched();
                this.formAdminCreditos.get('calificacionBuro').markAsTouched();
                this.formAdminCreditos.get('consultaBuro').markAsTouched();

                this.formAdminCreditos.get('noFolioSIC').updateValueAndValidity();
                this.formAdminCreditos.get('calificacionBuro').updateValueAndValidity();
                this.formAdminCreditos.get('consultaBuro').updateValueAndValidity();
            }
        }
    }
    /**
     * Metodo para cargar los plazos
     */
    spsPeriodo(option) {
        this.listaFrecuenciaPago = [];
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaTipoPlazo').subscribe(data => {
            this.listaPeriodo = data

            // Recorremos la lista listaPeriodo y el objeto option parceandolo a json
            // seleccionamos los que se encuentren en option.
            for (let x of this.listaPeriodo) {
                for (let i of JSON.parse(option.extenciones.extencionCatalogoCreditosTres.frecuenciaPagos)) {
                    if (x.tipoPlazoId === i.tipo_plazo_id) {
                        this.listaFrecuenciaPago.push(x);
                    }
                }
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
   * Metodo que lista condiciones de pago
   */
    spsCondicionesPago(tCredito) {
        this.service.getListByID(generales.condicionPagoCred, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                let descripcion = data.find((result) => { if (result.generalesId === tCredito.extenciones.extencionCatalogoCreditos.condicionPagoId) { return result } });
                this.formAdminCreditos.get('condicionPago').setValue(descripcion.descripcion);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }

    /**
     * Metodo que lista las finalidades
     */
    spslistaFinalidades(option) {
        this.service.getListByID(2, 'listaFinalidadCredito').subscribe(
            (data: any) => {
                let finalidades = data.find((result) => { if (result.finalidadId === option.finalidadId) { return result } });
                this.formAdminCreditos.get('finalidad').setValue(finalidades.descripcion);
                this.formAutorizacion.get('finalidad').setValue(finalidades.descripcion);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }

    /********************************************************************************************************************
     * 
     * BLOQUE PARA CREACIÓN DE METODOS GENERALES PARA EL APARTADO DE GARANTIAS
     * 
     * ******************************************************************************************************************/

    /**
   * Metodo que lista los tipos de garantias
    */
    spsTipoGarantia(option) {
        this.blockUI.start('Cargando ...')
        if (!this.vacio(option.extenciones.extencionCatalogoCreditosTres.garantias)) {
            this.listaTiposGarantias = JSON.parse(option.extenciones.extencionCatalogoCreditosTres.garantias);
        }
        this.opcionesTipoGarantias = this.formAdminCreditos.get('tipoGarantia').valueChanges.pipe(
            startWith(''),
            map(value => this._filterTipoGarantia(value)));
        this.blockUI.stop();

    }

    /**
    * Filtra el tipo de garantia
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterTipoGarantia(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaTiposGarantias.filter(option => option.descripcion.toLowerCase().trim().includes(filterValue));
    }

    /**
     * Muestra la descripcion del tipo de garantias
     * @param option --garantia seleccionada
     * @returns -- cuenta
     */
    displayFnTipoGarantia(option: any): any {
        return option ? option.descripcion.trim() : undefined;
    }


    /**
 * Metodo que abrira el modal de la garantia que se seleccione.
 */
    abrirTipoGarantia() {
        let tipoGarantia = this.formAdminCreditos.get('tipoGarantia').value;
        if (!this.vacio(tipoGarantia)) {
            if (globales.cveGarLiq === tipoGarantia.cve_garantia.trim()
                || globales.cveGarHipa === tipoGarantia.cve_garantia.trim()
                || globales.cveGarInversion === tipoGarantia.cve_garantia.trim()
                || globales.cveGarPrenda === tipoGarantia.cve_garantia.trim()
                || globales.cveGarAval === tipoGarantia.cve_garantia.trim()) {

                if (globales.cveGarHipa === tipoGarantia.cve_garantia.trim()) {
                    this.openDialogGaraHipo(1, tipoGarantia);
                }

                if (globales.cveGarPrenda === tipoGarantia.cve_garantia.trim()) {
                    this.openDialogGaraPrendaria(1, tipoGarantia);
                }
                if (globales.cveGarLiq === tipoGarantia.cve_garantia.trim()) {
                    this.openDialogGaraLiquida(1);
                }
                if (globales.cveGarInversion === tipoGarantia.cve_garantia.trim()) {
                    this.abrirModInversion(tipoGarantia.cve_garantia, 1);
                }
                this.garantiaAvales();
                //this.spsListaGarantiaById(tipoGarantia.cve_garantia);
            }
            this.formAdminCreditos.get('tipoGarantia').setValue('');
        }
    }
    /**
     * Ventana modal para el registro de avales 
     */
    garantiaAvales(): void {
        let tipoGarantia = this.formAdminCreditos.get('tipoGarantia').value;
        /**Garantia avales solo se abre hasta que el se guarde la solicitud */
        if (globales.cveGarAval === tipoGarantia.cve_garantia.trim() && this.vCreditoID == 0) {
            this.service.showNotification('top', 'right', 3, 'Guarda la solicitud de crédito, para agregar garantía aval.');
        } else if (globales.cveGarAval === tipoGarantia.cve_garantia.trim() && this.vCreditoID > 0) {
            this.abrirModAvales(tipoGarantia, 1);
        }
    }

    /**Ventana modal para registrar la garantia hipotecaria 
     * @param accion 1 Guardar 2 editar 
     * @param garantia datos de la garantia
    */
    openDialogGaraHipo(accion, garantia) {

        let titulo = 'Agregar Garantía Hipotecaría';
        let datosGarantia = garantia;
        let garantiaID = 0;
        if (accion !== 1) {
            titulo = 'Editar Garantía Hipotecaría';
            datosGarantia = garantia;
            //se compara el registro a eliminar
            let index = this.vHipotecas.findIndex(x => x[2] === garantia[2]);
            this.vHipotecas.splice(index, 1);
        } else {
            garantiaID = garantia.garantia_id;
        }
        const refMoGaran = this.dialog.open(MHipotecasCreditosComponent, {
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                detalle: datosGarantia
            }
        });

        refMoGaran.afterClosed().subscribe(result => {
            if (accion == 2) {
                garantiaID = result[8];
            }
            if (result.length > 0) {
                this.vHipotecas.push([result[0], result[1], result[2], result[3], result[4], result[5], result[6], result[7], garantiaID, garantia.cve_garantia, garantia.descripcion]);
            } else if (accion == 2 && result == 1) {
                //Actualizar y cerrar sin editar
                this.vHipotecas.push(datosGarantia);
            }
        });



    }

    /**Ventana modal para registrar la garantia prendaria 
     * @param accion 1 Guardar 2 editar 
     * @param garantia datos de la garantia
    */
    openDialogGaraPrendaria(accion, garantia) {
        let titulo = 'Agregar Garantía Prendaría';
        let datosGarantia = garantia;
        let garantiaID = 0;
        if (accion !== 1) {
            titulo = 'Editar Garantía Prendaría';
            datosGarantia = garantia;
            //se compara el registro a eliminar
            let index = this.vPrendas.findIndex(x => x[2] === garantia[2]);
            this.vPrendas.splice(index, 1);
        } else {
            garantiaID = garantia.garantia_id;
        }
        const refMoPren = this.dialog.open(MPrendasCreditosComponent, {
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                detalle: datosGarantia
            }
        });
        refMoPren.afterClosed().subscribe(result => {
            if (accion == 2) {
                garantiaID = result[5];
            }
            if (result.length > 0) {
                this.vPrendas.push([result[0], result[1], result[2], result[3], result[4],
                    garantiaID, garantia.cve_garantia, garantia.descripcion]);
            } else if (accion == 2 && result == 1) {
                //Se cerro la ventana hacer push de la garantia elimina
                this.vPrendas.push(datosGarantia);
            }
        });

    }
    /**Ventana modal para registrar la garantia liquida */

    openDialogGaraLiquida(accion) {
        let titulo = 'Garantía Liquida';
        let liq = this.listaTiposGarantias.find(g => g.cve_garantia.trim() === globales.cveGarLiq);
        this.tantos = liq.tantos;
        this.porcentaje = liq.porcentaje;
        let liquida = 0;
        if (this.tantos == 0) {
            liquida = this.porcentaje / 100;
        } else {
            switch (this.tantos) {
                case 0:
                    //Declaraciones ejecutadas cuando el resultado de expresión coincide con el valor0
                    liquida = 0.0;
                    break;
                case 1:
                    liquida = 1.0;
                    break;
                case 4:
                    liquida = 0.25;
                    break;
                case 6:
                    liquida = 0.1667;
                    break;
                case 8:
                    liquida = 0.1250;
                    break;
                case 10:
                    liquida = 0.10;
                    break;
                case 12:
                    liquida = 0.0833;
                    break;

                default:
                    liquida = 0.08;
                    break;
            }
        }
        let montoSol = this.formAdminCreditos.get('montoCredito').value
        const refMoPren = this.dialog.open(LiquidaCreditosComponent, {
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                montoS: montoSol,
                tantos: liquida
            }
        });
        refMoPren.afterClosed().subscribe(mliquida => {
            if (mliquida > 0) {
                this.montoGarLiquida = mliquida;
            } else {
                this.montoGarLiquida = 0;
            }
        });

    }
    /**
             *  Modal cuando la garantia es aval
             * @param garantia
             * @param accion 
             */
    abrirModAvales(garantia, accion) {
        let titulo = 'Guardar aval';
        let numAval;
        if (accion == 2) {
            titulo = 'Actualizar aval';
            numAval = garantia.extencionAval.detalle[2];
        } else {
            numAval = this.noAval + this.listaAvales.length;
        }
        const dialogoRef = this.dialog.open(AdminAvalesComponent, {
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                aval: garantia,
                credito: this.vCreditoID,
                noAval: numAval,
                documentos: this.listaDocsAval
            }
        });
        dialogoRef.afterClosed().subscribe(avales => {
            //Conusltar avales para refrescar la lista
            this.consultarAvales();

        });
    }
    /**
     * Modal para Grantia inversiones 
     * @param garantia 
     * @param accion 
     */
    abrirModInversion(garantia, accion) {
        let titulo = 'Seleccionar';

        const dialogoRef = this.dialog.open(ModalInversionesComponent, {
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                numCliente: this.formAdminCreditos.get('numeroCliente').value,
                listInv: this.listaInversion
            }
        });
        dialogoRef.afterClosed().subscribe(inversion => {
            if (inversion != 1) {
                this.listaInversion = inversion;
            }
        });
    }


    /**
   * Modal para Creditos Renovados
   * @param  
   * @param 
   */
    abrirModCreditoRenov() {
        let titulo = 'Seleccionar Crédito';
        if (this.formAdminCreditos.get('clasificacion').value.cveClasificacion.trim() != generales.clasificacionCredNuevo) {
            //El credito no esta vigente y pagado
            if (this.cvEstatusCre != generales.credVigente && this.cvEstatusCre != generales.credPagado) {
                const dialogoRef = this.dialog.open(ModalCredRenovadoComponent, {
                    disableClose: true,
                    data: {
                        titulo: titulo,
                        numCliente: this.formAdminCreditos.get('numeroCliente').value,
                        idRenovado: this.credito_ren_res_id,
                        clasificacion: this.formAdminCreditos.get('clasificacion').value.cveClasificacion.trim()
                    }
                });
                dialogoRef.afterClosed().subscribe(credito => {
                    if (credito != 1) {
                        this.listaCreditoRenueva = credito;
                        this.credito_ren_res_id = this.listaCreditoRenueva[0].creditoId;
                        this.saldo_restante = this.listaCreditoRenueva[0].extRenov.saldoCredito;
                        this.dias_mora = this.listaCreditoRenueva[0].diaMora;
                        let creditoR = this.listaCreditos.find(c => c.cveCredito.trim() === this.listaCreditoRenueva[0].cveCredito);
                        this.formAdminCreditos.get('tipoCredito').setValue(creditoR);
                        this.formAdminCreditos.get('tasaInteres').setValue(this.listaCreditoRenueva[0].extRenov.tasaNormal);
                        this.tasaInteres = this.listaCreditoRenueva[0].extRenov.tasaNormal;
                        //REESTRUCTURADO
                        if (this.formAdminCreditos.get('clasificacion').value.cveClasificacion.trim() == generales.clasificacionReestructura) {
                            let saldo = this.listaCreditoRenueva[0].extRenov.saldoCredito + this.listaCreditoRenueva[0].extRenov.interesNormal
                                + this.listaCreditoRenueva[0].extRenov.interesMora + this.listaCreditoRenueva[0].extRenov.iva;
                            this.formAdminCreditos.get('montoCredito').setValue(saldo);
                            this.formAdminCreditos.get('tasaMoratoria').setValue(this.listaCreditoRenueva[0].extRenov.tasaMoratoria);
                        }
                        this.cargarInformacion(creditoR);
                    }
                });
            }
        }
    }
    /**
         * Se obtiene informacion de la respuesta a la solicitud de credito
         *   
         */
    spsRespuestaSolicitud() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.vCreditoID, 'spsRespuestSolicitud').subscribe(resp => {
            if (!this.vacio(resp)) {
                let respuesta = JSON.parse(resp);
                //FECHA RESULTADO comite
                this.formAdminCreditos.get('resultado').setValue(respuesta[0].fecha + 'T00:00:00');
                this.formAprobacion.get('montoS').setValue(formatCurrency(respuesta[0].monto_solicitado, 'en-US', getCurrencySymbol('MXN', 'wide')));
                this.formAprobacion.get('fechaP').setValue(moment(respuesta[0].fecha).format("DD-MM-YYYY"));
                this.formAprobacion.get('usuario').setValue(respuesta[0].first_name + ' ' + respuesta[0].last_name);
                this.formAprobacion.get('cargo').setValue(respuesta[0].cargo);
                this.formAprobacion.get('estSol').setValue(respuesta[0].descripcion);
                this.formAprobacion.get('montoAp').setValue(formatCurrency(respuesta[0].monto_aprobado, 'en-US', getCurrencySymbol('MXN', 'wide')));
                this.formAprobacion.get('descripSol').setValue(respuesta[0].observacion);
                //Se revisa si el monto solicitado es menor al aprobado y el estatus del credito es diferente al 009 solicitud 
                if (respuesta[0].cve_generales != generales.solRechazada) {
                    if (this.cvEstatusCre != generales.credVigente && this.cvEstatusCre != generales.credPagado) {
                        if (respuesta[0].monto_aprobado < respuesta[0].monto_solicitado) {
                            //Se informa que se autoriza por menor monto
                            this.dialog.open(verificacionModalComponent, {
                                data: {
                                    titulo: "Se aprobó el crédito por un monto menor al solicitado",
                                    body: "Monto solicitado: " + formatCurrency(respuesta[0].monto_solicitado, 'en-US', getCurrencySymbol('MXN', 'wide')) +
                                        " Monto aprobado: " + formatCurrency(respuesta[0].monto_aprobado, 'en-US', getCurrencySymbol('MXN', 'wide'))
                                }
                            });
                        }
                    }
                }
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Regresa los datos del los avales
    * @param credito id del credito 
    */
    consultarAvales() {
        this.blockUI.start('Cargando datos...');
        this.listaAvales = [];
        this.service.getListByID(this.vCreditoID, 'listaAval').subscribe(aval => {
            if (!this.vacio(aval)) {
                let avales = JSON.parse(aval);
                for (let avalDatos of avales) {
                    let ingrAval = JSON.parse(avalDatos.ingresos_av);
                    let egrAval = JSON.parse(avalDatos.egresos_av);
                    let sumEg = 0;
                    let sumIn = 0;
                    for (let eg of egrAval) {
                        sumEg += eg.monto;
                    }
                    for (let ing of ingrAval) {
                        sumIn += ing.monto;
                    }
                    let resultLiq = sumIn - sumEg;

                    let liquidezAv = "";
                    if (resultLiq > this.pagoAmortizacion2do) {
                        liquidezAv = globales.mayorPagoLiquidez;
                    } else if (resultLiq == this.pagoAmortizacion2do) {
                        liquidezAv = globales.igualPagoLiquidez;
                    } else {
                        liquidezAv = globales.menorPagoLiquidez;
                    }
                    let resultCapacidad = (this.pagoAmortizacion2do / sumIn) * 100;
                    let capacidadPago = "";
                    if (resultCapacidad >= 1 && resultCapacidad <= 15) {
                        capacidadPago = globales.capPagoMuyAlta;
                    } else if (resultCapacidad >= 16 && resultCapacidad <= 25) {
                        capacidadPago = globales.capPagoAlta;
                    } else if (resultCapacidad >= 26 && resultCapacidad <= 35) {
                        capacidadPago = globales.capPagoMedia;
                    } else if (resultCapacidad >= 36 && resultCapacidad <= 60) {
                        capacidadPago = globales.capPagoBaja;
                    } else {
                        capacidadPago = globales.capPagoMuyBaja;
                    }
                    if (liquidezAv == globales.menorPagoLiquidez) {
                        this.service.showNotification('top', 'right', 3, 'Sin Liquidez, Cambiar Aval.');
                    }
                    if (capacidadPago == globales.capPagoMuyBaja || capacidadPago == globales.capPagoBaja) {
                        this.service.showNotification('top', 'right', 3, 'Sin Capacidad de Pago, Cambiar Aval.');
                    }
                    let arregloSujeto = [];
                    arregloSujeto.push(
                        avalDatos.sujeto_id,//1
                        avalDatos.nombres,//2
                        avalDatos.apellido_paterno,//3
                        avalDatos.apellido_materno,//4
                        avalDatos.fecha_nacimiento,//5
                        avalDatos.numero_cliente
                    );
                    let arregloDetalle = [];
                    arregloDetalle.push(
                        avalDatos.aval_id,
                        avalDatos.credito_id,
                        avalDatos.numero_aval,
                        avalDatos.porcentaje,//4
                        liquidezAv,
                        capacidadPago, sumEg, sumIn
                    );
                    //Se crea el JSON
                    let avalesJSON = {
                        'sujeto': arregloSujeto,
                        'extencionAval': {
                            'detalle': arregloDetalle
                        }
                    }
                    this.listaAvales.push(avalesJSON);
                }
                this.sumaPorcent = 0;
                for (let av of this.listaAvales) {
                    this.sumaPorcent = this.sumaPorcent + parseInt(av.extencionAval.detalle[3]);
                }
                if (this.sumaPorcent < 100 || this.sumaPorcent > 100) {
                    this.service.showNotification('top', 'right', 3, "Aval: El porcentaje debe ser igual a 100%.");

                }
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
    * Metodo que lista los documetos por clave de garantia
    */
    /* spsListaGarantiaById(cveGarantia) {
         this.service.getListByArregloIDs(cveGarantia + '/' + 1, 'listaGarantiaById').subscribe(
             (data: any) => {
                 for (let garantia of data) {
                     this.listaDocsGar.push(garantia);

                 }
             }, error => {
                 this.blockUI.stop();
                 this.service.showNotification('top', 'right', 4, error.Message);
             }
         );
     }*/

    /**
     * Metodo para la busqueda de solicitudes de creditos
     */
    buscarSolicitud() {
        //Se limpian y habilitan botnoes
        this.limpiarAdministracion();
        let filtro = '';

        filtro = this.formAdminCreditos.get('numSolicitud').value;

        const refMoSol = this.dialog.open(MSolicitudCreditosComponent, {
            disableClose: true,
            data: {
                titulo: 'Lista de Solicitudes de Creditos',
                accion: 1,
                filtro: filtro
            }
        });

        refMoSol.afterClosed().subscribe(resSol => {
            if (!this.vacio(resSol) && resSol !== 1) {
                this.detalleCredito(resSol);
            }

        });

    }


    /**
     * Metodo que obtendra el detalle del credito o 
     * solicitud y seteara los datos al formulario
     * @param solicitud infomacion de la solicitude de credito
     */
    detalleCredito(solicitud: any) {
        //Se resetean todas las variables
        this.listaDocsCliDgt = [];
        this.listaDocsClientes = [];
        this.listaDocsGar = [];
        this.listaDocsGarDgt = [];
        this.listaTiposGarantias = [];
        this.vHipotecas = [];
        this.vPrendas = [];
        this.credito_ren_res_id = solicitud.credito_ren_id;
        this.vSolicitudID = solicitud.solicitud_id;
        this.cvEstatusSol = solicitud.cve_comite;
        this.blockUI.start('Cargando ...');
        this.service.getListByID(solicitud.referencia, 'detalleCredito').subscribe(data => {
            if (!this.vacio(data)) {
                let parseJson = JSON.parse(data);
                let detalle = parseJson[0];
                this.vCreditoID = detalle.credito_id;
                //Inicio Seteo de Datos del Primer Car Primer Card
                this.formAdminCreditos.get('numSolicitud').setValue(detalle.num_solicitud);
                this.formAdminCreditos.get('referencia').setValue(detalle.referencia);
                this.formAdminCreditos.get('numeroCliente').setValue(detalle.numero_cliente);
                this.formAdminCreditos.get('nombre').setValue(detalle.nombre);
                //Fin Primer Card
                // Inicio Seteo de Datos del CLiente en Tab de Generales
                this.spsCliente(detalle);
                // Fin Generales
                //#### INICIO Tab Creditos
                let catCre = this.listaCreditos.find(c => c.creditoId === detalle.cat_credito_id);
                let cuentas: any;
                if (!this.vacio(catCre.extenciones.extencionCatalogoCreditosTres.cuentasCampos)) {
                    cuentas = JSON.parse(catCre.extenciones.extencionCatalogoCreditosTres.cuentasCampos);
                    this.cuentaBanco = cuentas[0].clave_cuenta;
                    this.cuentaCaja = cuentas[0].cve_mov_caja;
                }
                this.formAdminCreditos.get('tipoCredito').setValue(catCre);
                this.spsCondicionesPago(catCre);
                this.spslistaFinalidades(catCre);
                this.spsTipoGarantia(catCre);
                this.setDocADigitalizar(catCre);
                if (!this.vacio(catCre.extenciones.extCatCreCinco.comisiones)) {
                    this.listaComisiones = JSON.parse(catCre.extenciones.extCatCreCinco.comisiones);
                }
                let clasificacion = this.listaClasificacion.find(c => c.clasificacionID === detalle.clasificacion_id);
                this.formAdminCreditos.get('clasificacion').setValue(clasificacion);
                this.formAdminCreditos.get('montoCredito').setValue(detalle.monto_credito);

                let fEstado = this.listaEstados.find(e => e.estadoid === detalle.estado_id);
                this.formAdminCreditos.get('estadoDestino').setValue(fEstado);
                this.idEstSel = detalle.estado_id;
                this.destinoID = detalle.destino_recurso;
                this.controlCd = 1;
                this.spsCiudadNac();

                this.value = detalle.tasanormal;
                this.formAdminCreditos.get('noPagos').setValue(detalle.no_pagos);
                this.formAdminCreditos.get('noFolioSIC').setValue(detalle.nofoliosic === null ? '' : detalle.nofoliosic.trim());
                this.formAdminCreditos.get('tasaMoratoria').setValue(detalle.tasamoratoria);
                this.formAdminCreditos.get('estadoCredito').setValue(detalle.desc_estado_cred);
                let calificacion = this.listaCalificacionBuro.find(c => c.generalesId === detalle.calificacion_buro_id);
                this.formAdminCreditos.get('calificacionBuro').setValue(calificacion);
                this.formAdminCreditos.get('consultaBuro').setValue(detalle.fecha_consulta_buro + 'T00:00:00');
                this.formAdminCreditos.get('ultimoPago').setValue(detalle.fecha_ultimo_pago + 'T00:00:00');
                this.formAdminCreditos.get('primerPago').setValue(detalle.fecha_primer_pago + 'T00:00:00');
                this.formAdminCreditos.get('aplicaFuturo').setValue(detalle.pago_futuro);
                //aplica pago a futuro
                if (detalle.pago_futuro === "true") {
                    //fecha primer pago se habilita 
                    this.habilitarPrPago = false;
                } else {
                    //fecha primer pago se deshabilita 
                    this.habilitarPrPago = true;
                }
                this.formAdminCreditos.get('observacionSolicitud').setValue(detalle.observaciones);

                //Se pasa la clave del estado de credito para usarse en la respuestaSolicitud
                this.cvEstatusCre = detalle.cve_estado_cred;
                // Se obtiene el tipode amortizacion del credito
                let tipoAmort = JSON.parse(catCre.extenciones.extencionCatalogoCreditosTres.frecuenciaPagos);
                for (let tipo of tipoAmort) {
                    if (tipo.tipo_plazo_id === detalle.tipo_plazo_id) {
                        this.tipoAmortizacion = tipo.cve_amortizacion;
                    }
                }

                if (!this.vacio(detalle.cobros)) {//cobros no es null
                    this.cobros = JSON.parse(detalle.cobros);
                    let pagos = '';
                    this.cobros.forEach(element => {
                        if (!this.vacio(element.garantia_id) && element.estatus == false) {//si la garntia no es null y no esta cobrada
                            pagos += "" + element.garantia + " " + formatCurrency(element.monto, 'en-US', getCurrencySymbol('MXN', 'wide')) + " ";
                        } else
                            if (!this.vacio(element.comision) && element.estatus == false) {
                                pagos += " " + element.descripcion + " " + formatCurrency(element.monto, 'en-US', getCurrencySymbol('MXN', 'wide')) + "";

                            }

                    });
                    if (!this.vacio(pagos)) {
                        //Se informa que hay pagos a cubrir
                        this.dialog.open(verificacionModalComponent, {
                            data: {
                                titulo: "Pagos a cubrir",
                                body: pagos
                            }
                        });
                    }
                }
                //Estado de solicitud credito

                if (detalle.cve_estado_comite == generales.solAprobada) {
                    this.habilitarTab = true;//Se habilita TAB la aprobacion de solicitud y autorizacion 
                    this.autorizar = true;
                    //Si el credito ya esta pagado
                    if (detalle.cve_estado_cred == generales.credPagado) {
                        this.btnCalendario = true;
                    }
                    //CONSULTA LA RESPUESTA A LA SOLICITUD
                    this.spsRespuestaSolicitud();
                    //SE deshabilitan las opciones del credito
                    this.readOnly = true;
                    this.formAdminCreditos.get('clasificacion').disable();
                    this.formAdminCreditos.get('calificacionBuro').disable();
                    this.formAdminCreditos.get('periodo').disable();
                    this.formAdminCreditos.get('tasaInteres').disable();

                    //Se llena los datos de autorizacion 
                    this.formAutorizacion.get('tipoCr').setValue(catCre.descripcion);
                    this.formAutorizacion.get('estCred').setValue(detalle.desc_estado_cred);
                    this.formAutorizacion.get('montOtor').setValue(formatCurrency(detalle.monto_credito, 'en-US', getCurrencySymbol('MXN', 'wide')));
                    this.formAutorizacion.get('tasaN').setValue(detalle.tasanormal);
                    this.formAutorizacion.get('tasaM').setValue(catCre.tasaInteresMoratorio);
                    this.formAutorizacion.get('usuarioA').setValue(this.servicePermisos.usuario.firstName + ' ' + this.servicePermisos.usuario.lastName);
                    this.formAutorizacion.get('noAmort').setValue(detalle.no_pagos);

                    this.service.getListByID(1, 'listaTipoPlazo').subscribe(plazos => {
                        let frecuencia = plazos.find(f => f.tipoPlazoId === detalle.tipo_plazo_id);
                        this.formAutorizacion.get('periodo').setValue(frecuencia.descripcion);
                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message);
                    });
                } else if (this.cvEstatusSol === generales.solRechazada) {
                    //solo se edita no se puede autorizar
                    this.habilitarTab = true;//Se habilita TAB la aprobacion de solicitud y autorizacion 
                    //CONSULTA LA RESPUESTA A LA SOLICITUD
                    this.spsRespuestaSolicitud();
                }

                //#### FIN TAB CREDITOS


                //#### INICIO TAB DE GARANTIAS

                if (detalle.garantias_hipotecas !== null) {
                    let hipotecas = JSON.parse(detalle.garantias_hipotecas);
                    for (let hipo of hipotecas) {
                        let findHipoteca = this.listaTiposGarantias.find(f => f.garantia_id === hipo.garantia_id);
                        this.vHipotecas.push([hipo.garantia_hipoteca_id, hipo.no_escritura, hipo.folio,
                        hipo.fecha_registro, hipo.fecha_vencimiento, hipo.valor, hipo.fecha_valuacion,
                        hipo.grado_prelacion, hipo.garantia_id, findHipoteca.cve_garantia,
                        findHipoteca.descripcion]);
                    }

                }
                this.montoGarLiquida = detalle.monto_garantia_liquida;

                if (detalle.garantias_prendarias !== null) {
                    let prendas = JSON.parse(detalle.garantias_prendarias);
                    for (let dato of prendas) {
                        let findPrenda = this.listaTiposGarantias.find(f => f.garantia_id === dato.garantia_id);
                        this.vPrendas.push([dato.garantia_prendaria_id, dato.no_factura, dato.valor_prenda,
                        dato.fecha_endoso, dato.nombre_titular, dato.garantia_id, findPrenda.cve_garantia,
                        findPrenda.descripcion]);
                    }
                }
                //Garantia inversiones
                if (detalle.garantias_inversion !== null) {
                    let inversion = JSON.parse(detalle.garantias_inversion);
                    for (let inv of inversion) {
                        this.listaInversion.push([inv.inversion_id, inv.monto, inv.num_pagare])
                    }
                }

                this.consultarAvales();

                //#### FIN TAB GARANTIAS    

                this.spsEvaluacionCinco();

                //*****INICIO TAB DIGITALIZACION
                //Se recorre la lista de los archivos del deudor para mostrar en pantalla
                if (!this.vacio(JSON.parse(detalle.digitalizacion))) {
                    let digitalizacion = JSON.parse(detalle.digitalizacion);
                    for (let documento of digitalizacion) {
                        this.listaDocsCliDgt.push([
                            documento.documento,
                            documento.tipodocumento_id,
                            documento.nombredoc
                        ]);

                    }
                }

                //Se recorre la lista de todas las garantias 
                if (!this.vacio(JSON.parse(detalle.dig_garantias))) {
                    let digGarantias = JSON.parse(detalle.dig_garantias);


                    for (let docGar of digGarantias) {
                        if (docGar.cve_generales.trim() === generales.expHipoteca) {
                            this.listaDocsHipotecaDgt.push([
                                docGar.documento,
                                docGar.tipodocumento_id,
                                docGar.nombredoc,
                                docGar.expediente_id
                            ]);
                        }

                        if (docGar.cve_generales.trim() === generales.expPrendaria) {
                            this.listaDocsPrendariaDgt.push([
                                docGar.documento,
                                docGar.tipodocumento_id,
                                docGar.nombredoc,
                                docGar.expediente_id
                            ]);
                        }

                        if (docGar.cve_generales.trim() === generales.expGarantLiquida) {
                            this.listaDocsGarantiaLiquidaDgt.push([
                                docGar.documento,
                                docGar.tipodocumento_id,
                                docGar.nombredoc,
                                docGar.expediente_id
                            ]);
                        }

                        if (docGar.cve_generales.trim() === generales.expInversion) {
                            this.listaDocsInversionDgt.push([
                                docGar.documento,
                                docGar.tipodocumento_id,
                                docGar.nombredoc,
                                docGar.expediente_id
                            ]);
                        }
                    }
                    /*  for (let docGar of digGarantias) {
                          let garantia = this.listaTiposGarantias.find(g => g.garantia_id === docGar.garantia_id);
  
                          this.spsListaGarantiaById(garantia.cve_garantia);
  
                          this.listaDocsGarDgt.push([
                              docGar.documento,
                              docGar.tipodocumento_id,
                              docGar.nombredoc,
                              docGar.garantia_id //Es la garantia id
                          ]);
                      }*/
                }
                //*****FIN TAB DIGITALIZACION

                this.listaFrecuenciaPago = [];

                this.service.getListByID(1, 'listaTipoPlazo').subscribe(plazos => {
                    this.listaPeriodo = plazos;

                    // Recorremos la lista listaPeriodo y el objeto option parceandolo a json
                    // seleccionamos los que se encuentren en option.
                    for (let x of this.listaPeriodo) {
                        for (let i of JSON.parse(catCre.extenciones.extencionCatalogoCreditosTres.frecuenciaPagos)) {
                            if (x.tipoPlazoId === i.tipo_plazo_id) {
                                this.listaFrecuenciaPago.push(x);
                            }
                        }
                    }

                    let plazo = this.listaFrecuenciaPago.find(f => f.tipoPlazoId === detalle.tipo_plazo_id);
                    this.formAdminCreditos.get('periodo').setValue(plazo);
                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.Message);
                }
                );
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }
    /**
     * Revision de las fechas de entrega para actualizar tabla de amortizaciones 
     */
    verificarFecha(detalle) {


        if (this.cvEstatusSol != generales.solRechazada) {
            if (this.cvEstatusCre != generales.credVigente && detalle.cve_estado_cred != generales.credPagado) {
                if (detalle.fecha_entrega < moment(this.formAdminCreditos.get('fecha').value).format("YYYY-MM-DD")) {
                    this.modalAviso(detalle);
                } else {//mismo dia
                    //Se generar las amortizaciones
                    this.generarAmortizacion(detalle);
                    this.formAdminCreditos.get('resultado').setValue(new Date());
                    this.formAdminCreditos.get('entrega').setValue(new Date());
                }
            } else {//Ya esta autoizado 
                this.creditoAutorizado(detalle);
            }
        }
    }
    /**
     * Se notifica que hay que actualizar el calendario de pagos
     * @param detalle informacion del credito
     */
    modalAviso(detalle: any) {
        //Se informa la actualizacion de fechas
        const dialogFecha = this.dialog.open(verificacionModalComponent, {
            disableClose: true,
            data: {
                titulo: "La fecha de entrega es anterior a la fecha actual.",
                body: "Al actualizar la fecha de entrega, se genera el calendario de pagos nuevamente."
            }
        });
        dialogFecha.afterClosed().subscribe(respuesta => {
            //Fecha para autorizar credito
            this.formAutorizacion.get('fechaOtor').setValue(new Date().toLocaleString());
            //Cero es aceptar Uno Cancelar 
            if (respuesta === 0) {
                this.formAdminCreditos.get('entrega').setValue(new Date());
                //Se generar las amortizaciones
                this.generarAmortizacion(detalle);

            } else {
                if (detalle.cve_estado_comite !== generales.solAprobada) {
                    //Si no esta aprobada
                    this.formAdminCreditos.get('resultado').setValue(new Date());
                }
                this.formAdminCreditos.get('entrega').setValue(detalle.fecha_entrega + 'T00:00:00');

            }
        });
    }
    /**
     * Se llena la informacion del formulario autorizacion
     * @param detalle informacion del credito solicitado
     */
    creditoAutorizado(detalle) {
        //Se deshabilita el boton
        this.btnCalendario = true;
        this.habilitarToogleFuturo = true;
        this.formAdminCreditos.get('entrega').setValue(detalle.fecha_entrega + 'T00:00:00');
        this.formAutorizacion.get('fechaOtor').setValue(moment(detalle.fecha_entrega).format('DD-MM-YYYY'));
        this.formAdminCreditos.get('entrega').disable();
        this.formAutorizacion.get('primerPago').setValue(moment(detalle.fecha_primer_pago).format('DD-MM-YYYY'));
        this.formAutorizacion.get('vencimiento').setValue(moment(detalle.fecha_vencimiento).format('DD-MM-YYYY'));
        //Se toma el segundo pago para la evaluacion
        this.pagoAmortizacion2do = detalle.segundo_pago;
        //Se calcula la capacidad
        this.calcularCapacidadPago();
    }
    /**Al actualizar fechas se genra la tabla de amortizaciones automaticamente Sin abrir modal
     * @param detalle informacion del credito solicitado
     */
    generarAmortizacion(detalle) {
        let bodyAmortizacion = {
            "pclavecredito": this.formAdminCreditos.get('tipoCredito').value.cveCredito,
            "pmonto": this.formAdminCreditos.get('montoCredito').value,
            "ptasa": this.value,
            "pplazo": this.formAdminCreditos.get('periodo').value.dias,
            "amortizaciones": this.formAdminCreditos.get('noPagos').value,
            "ptipoamortizacion": this.tipoAmortizacion,
            "paplicaiva": this.formAdminCreditos.get('tipoCredito').value.aplicaIVA,
            "pfechaotorga": moment(this.formAdminCreditos.get('entrega').value).format("yyyy-MM-DD"),
            "aplicapfuturo": this.formAdminCreditos.get('aplicaFuturo').value,
            "pprimerpago": moment(this.formAdminCreditos.get('primerPago').value).format("yyyy-MM-DD"),
        }
        this.service.registrar(bodyAmortizacion, 'listaAmortizaciones').subscribe(data => {
            this.listaAmortizacion = data;
            //Se actualiza fecha primer pago y ultimo
            this.formAdminCreditos.get('primerPago').setValue(this.listaAmortizacion[0].fechapago + 'T00:00:00');
            this.formAdminCreditos.get('ultimoPago').setValue(this.listaAmortizacion[this.listaAmortizacion.length - 1].fechapago + 'T00:00:00');
            //En Tab Autorrizacion se pasan las fechas de primer y ultimo pago
            this.formAutorizacion.get('primerPago').setValue(moment(this.listaAmortizacion[0].fechapago).format('DD-MM-YYYY'));
            this.formAutorizacion.get('vencimiento').setValue(moment(this.listaAmortizacion[this.listaAmortizacion.length - 1].fechapago).format('DD-MM-YYYY'));
            this.calcularCapacidadPago();

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
        if (detalle.cve_estado_comite !== generales.solAprobada) {
            //Si no esta aprobada
            this.formAdminCreditos.get('resultado').setValue(new Date());
        }
        this.formAdminCreditos.get('entrega').setValue(new Date());
    }
    /**
 * Metodo para regresar de autorizacion a Solicitud
 * al autorizar credito
 * 0 solicitud, 2 autorizacion
 * */
    tabSeleccion(changeEvent: MatTabChangeEvent) {
        this.tabSeleccionada = changeEvent.index;
    }
    /*****************************************************
     * 
     * DECLARACIÓN DE METODOS PARA APARTADO DE DIGITALIZACION DOCS
     * 
     * ************************************************** */
    /**
     * Metodo para subir archivo 
     * @param archivo - Documento a codificar 
     * @param documento - Documento a setear en la lista
     */
    subirArchivoCliente(archivo, documento) {



        let limite = documento.limiteMB;


        let archivoCapturado = archivo.target.files[0];

        if ((archivo.target.files[0].size * 0.000001) > limite) {
            return this.service.showNotification('top', 'right', 3, 'El limite maximo es ' + limite + ' MB');
        }

        let index = this.listaDocsCliDgt.findIndex(x => x[1] === documento.tipodocumento_id);

        if (index >= 0) {

            this.listaDocsCliDgt.splice(index, 1);

        }



        this.extraerBase64(archivoCapturado).then((imagen: any) => {

            let previsualizacion = imagen.base;

            this.listaDocsCliDgt.push([
                previsualizacion,
                documento.tipodocumento_id,
                documento.descripcion
            ]);
            this.listaDocsCliDgt.sort((a, b) => (a[2] > b[2]) ? 1 : -1);

        });

    }

    /**
     * Metodo para subir archivo 
     * @param archivo - Documento a codificar 
     * @param documento - Documento a setear en la lista
     */
    subirArchivoGarantias(archivo, documento) {

        let limite = documento.limiteMB;

        let archivoCapturado = archivo.target.files[0];

        if ((archivo.target.files[0].size * 0.000001) > limite) {
            return this.service.showNotification('top', 'right', 3, 'El limite maximo es ' + limite + ' MB');
        }

        if (documento.cve_expediente === generales.expHipoteca) {
            let index = this.listaDocsHipotecaDgt.findIndex(x => x[1] === documento.tipodocumento_id);

            if (index >= 0) {

                this.listaDocsHipotecaDgt.splice(index, 1);

            }


            this.extraerBase64(archivoCapturado).then((imagen: any) => {

                let previsualizacion = imagen.base;

                this.listaDocsHipotecaDgt.push([
                    previsualizacion,
                    documento.tipodocumento_id,
                    documento.descripcion,
                    documento.expediente_id
                ]);
                this.listaDocsHipotecaDgt.sort((a, b) => (a[2] > b[2]) ? 1 : -1);

            });

        }

        if (documento.cve_expediente === generales.expPrendaria) {

            let index = this.listaDocsPrendariaDgt.findIndex(x => x[1] === documento.tipodocumento_id);

            if (index >= 0) {

                this.listaDocsPrendariaDgt.splice(index, 1);

            }


            this.extraerBase64(archivoCapturado).then((imagen: any) => {

                let previsualizacion = imagen.base;

                this.listaDocsPrendariaDgt.push([
                    previsualizacion,
                    documento.tipodocumento_id,
                    documento.descripcion,
                    documento.expediente_id
                ]);

                this.listaDocsPrendariaDgt.sort((a, b) => (a[2] > b[2]) ? 1 : -1);

            });

        }

        if (documento.cve_expediente === generales.expGarantLiquida) {
            let index = this.listaDocsGarantiaLiquidaDgt.findIndex(x => x[1] === documento.tipodocumento_id);

            if (index >= 0) {

                this.listaDocsGarantiaLiquidaDgt.splice(index, 1);

            }


            this.extraerBase64(archivoCapturado).then((imagen: any) => {

                let previsualizacion = imagen.base;

                this.listaDocsGarantiaLiquidaDgt.push([
                    previsualizacion,
                    documento.tipodocumento_id,
                    documento.descripcion,
                    documento.expediente_id
                ]);

                this.listaDocsGarantiaLiquidaDgt.sort((a, b) => (a[2] > b[2]) ? 1 : -1);

            });
        }


        if (documento.cve_expediente === generales.expInversion) {

            let index = this.listaDocsInversionDgt.findIndex(x => x[1] === documento.tipodocumento_id);

            if (index >= 0) {

                this.listaDocsInversionDgt.splice(index, 1);

            }


            this.extraerBase64(archivoCapturado).then((imagen: any) => {

                let previsualizacion = imagen.base;

                this.listaDocsInversionDgt.push([
                    previsualizacion,
                    documento.tipodocumento_id,
                    documento.descripcion,
                    documento.expediente_id
                ]);

                this.listaDocsInversionDgt.sort((a, b) => (a[2] > b[2]) ? 1 : -1);

            });
        }

    }

    /**
 * Metodo que setea una lista para subir documentos por credito
 * @param credito - credito con los documentos que se pueden digitalizar
 */
    setDocADigitalizar(credito) {
        if (!this.vacio(credito.extenciones.extencionCatalogoCreditosTres.documentos)) {
            let listaDocs = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.documentos);
            this.listaDocsHipoteca = []; // 80HA
            this.listaDocsPrendaria = []; // 80PA
            this.listaDocsGarantiaLiquida = []; // 80GL
            this.listaDocsAval = []; // 80AL 
            this.listaDocsGrupo = []; // 80GC
            this.listaDocsClientes = []; //80CS
            this.listaDocsInversion = []; //80IN
            if (listaDocs.length > 0) {
                for (let doc of listaDocs) {
                    if (doc.cve_expediente === generales.expClientes) {
                        this.listaDocsClientes.push(doc);
                        this.listaDocsClientes.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                    if (doc.cve_expediente === generales.expHipoteca) {
                        this.listaDocsHipoteca.push(doc);
                        this.listaDocsHipoteca.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                    if (doc.cve_expediente === generales.expPrendaria) {
                        this.listaDocsPrendaria.push(doc);
                        this.listaDocsPrendaria.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                    if (doc.cve_expediente === generales.expGarantLiquida) {
                        this.listaDocsGarantiaLiquida.push(doc);
                        this.listaDocsGarantiaLiquida.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                    if (doc.cve_expediente === generales.expInversion) {
                        this.listaDocsInversion.push(doc);
                        this.listaDocsInversion.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                    if (doc.cve_expediente === generales.expAval) {
                        this.listaDocsAval.push(doc);
                        this.listaDocsAval.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                }
            }
        }
    }

    /**
* Metodo para settear el formato de documentos permitidos
* @param documento 
* @returns 
*/
    acceptFormatos(documento): string {
        let formatos = JSON.parse(documento.formatos);
        let formatosLibres = '';
        for (let f of formatos) {
            formatosLibres += f.descripcion.toLowerCase() + ',';
        }

        return formatosLibres;
    }


    openDialogDoc(documento) {
        let titulo = 'Documento';

        this.dialog.open(DocumentosModalComponent, {
            width: "80%",
            height: "80%",
            data: {
                titulo: titulo,
                nombre: documento[2],
                documentos: documento
            }

        });
    }


    /**
 * Metodo para subir archivo de garantias
 * @param archivo - Documento a codificar 
 * @param documento - Documento a setear en la lista
 */
    subirArchivoGarantia(archivo, documento) {
        this.blockUI.start('Subiendo archivo...');
        let index = this.listaDocsGarDgt.findIndex(x => x[1] === documento.catTipoDocumento.tipoDocumentoID);

        if (index >= 0) {

            this.listaDocsGarDgt.splice(index, 1);

        }
        let archivoCapturado = archivo.target.files[0];
        this.extraerBase64(archivoCapturado).then((imagen: any) => {

            let previsualizacion = imagen.base;

            this.listaDocsGarDgt.push([
                previsualizacion,
                documento.catTipoDocumento.tipoDocumentoID,
                documento.catTipoDocumento.nombreDoc,
                documento.tipoDocumentoId //Es la garantia id
            ]);
            this.blockUI.stop();
        });

    }




    extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.readAsDataURL($event);
            reader.onload = () => {
                resolve({
                    base: reader.result
                });
            };
            reader.onerror = error => {
                resolve({
                    base: null
                });
            };
        } catch (e) {
            return null;
        }
    });
    /**Se indica que hay que generar la tabla de amortizaciones 
     nuevamente para actualizar las fechas de primer pago y ultimo */
    avisoAmortizacion() {
        this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: "La fecha de entrega a cambiado.",
                body: "Debes generar el calendario de pagos nuevamente."
            }
        });
    }
    /**Se autoriza el credito aprobado */
    autorizarCredito() {
        this.blockUI.start('Cargando datos...');
        let cobro = 0;
        if (!this.vacio(this.cobros)) {//validar que no deba un pago
            this.cobros.forEach(element => {
                if (!this.vacio(element.garantia_id) && element.estatus === false) {//si la garntia no es null y no esta cobrada
                    cobro = 1;
                    return this.service.showNotification('top', 'right', 3, 'No se ha pagado ' + element.garantia);;
                } else
                    if (!this.vacio(element.comision) && element.estatus === false) {
                        cobro = 1
                        return this.service.showNotification('top', 'right', 3, 'No se ha pagado ' + element.descripcion);;
                    }

            });
            if (cobro === 1) {
                this.blockUI.stop();
                return;
            }

        }
        //Validar que se actualizo la tbl de amortizaciones
        if (this.formAdminCreditos.get('entrega').value < moment(this.formAdminCreditos.get('fecha').value).format("YY-MM-DD")) {
            this.service.showNotification('top', 'right', 3, 'Debes actualizar la fecha de entrega.');
            return this.blockUI.stop();
        }
        if (this.vacio(this.formAutorizacion.get('primerPago').value) || this.vacio(this.formAutorizacion.get('vencimiento').value)) {
            this.service.showNotification('top', 'right', 3, 'Genera el calendario de pagos.');
            return this.blockUI.stop();
        }
        let dCredito = [];
        let dAmorticacion = [];
        dCredito.push(this.vCreditoID,
            this.formAutorizacion.get('primerPago').value,
            this.formAutorizacion.get('vencimiento').value,
            this.formAdminCreditos.get('montoCredito').value,
            moment(this.formAdminCreditos.get('resultado').value).format("yyyy-MM-DD"),
            this.servicePermisos.usuario.id,
            this.vSolicitudID,
            //Taspaso
            this.servicePermisos.sucursalSeleccionada.cveSucursal,
            this.formAdminCreditos.get('numeroCliente').value,
            '',
            this.cuentaCaja.trim(),
            this.credito_ren_res_id// credito a renovar o reestructurar
        );
        dAmorticacion.push(this.formAdminCreditos.get('tipoCredito').value.cveCredito,
            this.value,//tasa
            this.formAdminCreditos.get('periodo').value.dias,
            this.formAdminCreditos.get('noPagos').value,
            this.tipoAmortizacion,
            this.formAdminCreditos.get('tipoCredito').value.aplicaIVA,
            this.formAdminCreditos.get('aplicaFuturo').value,
            moment(this.formAdminCreditos.get('primerPago').value).format("yyyy-MM-DD")
        );
        let JsonAutorizar = {
            "credito": dCredito,
            "amortizacion": dAmorticacion
        };

        this.service.registrar(JsonAutorizar, 'crudAutorizacion').subscribe(respuesta => {
            if (respuesta[0][0] === '0') {
                //Se vacean las listas y formulario
                this.limpiarAdministracion();
                this.service.showNotification('top', 'right', 2, respuesta[0][1]);
            } else {
                this.service.showNotification('top', 'right', 3, respuesta[0][1]);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**Se limpia el formulario y los botones */
    limpiarAdministracion() {

        this.tabSeleccionada = 0;
        this.habilitar = false;//se deshabilitan componentes
        this.vCreditoID = 0;
        this.vSolicitudID = 0;
        this.liquidez = 0.0;
        this.resultLiquidez = "";
        //Se habilitan botones
        this.autorizar = false;
        this.habilitarTab = false;
        this.habilitarPrPago = true;
        this.habilitarToogleFuturo = false;
        this.readOnly = false;
        this.btnCalendario = false;
        //Se limpian listas
        this.formAdminCreditos.reset();
        this.listaHistorialCred = [];
        this.dataSopurceHistorial = new MatTableDataSource(this.listaHistorialCred);
        this.listaAvalados = [];
        this.dataSourceAvalados = new MatTableDataSource(this.listaAvalados);
        this.listIngresos = [];
        this.dataSourceIngreso = new MatTableDataSource(this.listIngresos);
        this.listEgresos = [];
        this.dataSourceEgreso = new MatTableDataSource(this.listEgresos);
        this.dataSource5CS = new MatTableDataSource();
        this.listaDocsCliDgt = [];
        this.listaDocsClientes = [];
        this.listaDocsGar = [];
        this.listaDocsGarDgt = [];
        this.listaTiposGarantias = [];
        this.listaAvales = [];
        this.vHipotecas = [];
        this.vPrendas = [];
        this.listaInversion = [];
        this.listaEmpleosDom = [];
        this.dataSourceEmpleo = new MatTableDataSource(this.listaEmpleosDom);
        this.listaComisiones = [];
        this.formAdminCreditos.get('fecha').setValue(new Date());
        this.formAdminCreditos.get('entrega').setValue(new Date());
        this.formAdminCreditos.get('resultado').setValue(new Date());
        this.formAdminCreditos.get('clasificacion').enable();
        this.formAdminCreditos.get('periodo').enable();
        this.formAdminCreditos.get('tasaInteres').enable();
        this.formAdminCreditos.get('entrega').enable();
        this.formAdminCreditos.get('calificacionBuro').enable();
        //Se quitan las validaciones agregadas acorde al tipo de credito
        this.formAdminCreditos.get('noFolioSIC').setValidators([Validators.pattern('[0-9]*\.?[0-9]*')]);
        this.formAdminCreditos.get('calificacionBuro').clearValidators();
        this.formAdminCreditos.get('consultaBuro').clearValidators();
        this.formAdminCreditos.get('noFolioSIC').updateValueAndValidity();
        this.formAdminCreditos.get('calificacionBuro').updateValueAndValidity();
        this.formAdminCreditos.get('consultaBuro').updateValueAndValidity();

        this.listaDocsCliDgt = [];
        this.listaDocsHipotecaDgt = [];
        this.listaDocsPrendariaDgt = [];
        this.listaDocsGarantiaLiquidaDgt = [];
        this.listaDocsInversionDgt = [];

        this.listaDocsHipoteca = []; // 80HA
        this.listaDocsPrendaria = []; // 80PA
        this.listaDocsGarantiaLiquida = []; // 80GL
        this.listaDocsAval = []; // 80AL 
        this.listaDocsGrupo = []; // 80GC
        this.listaDocsClientes = []; //80CS
        this.listaDocsInversion = []; //80IN
        //cargar comos y fechas
        this.ngOnInit();
        this.formAdminCreditos.get('resultado').setValue(new Date());
        this.formAdminCreditos.get('entrega').setValue(new Date());
        this.formAdminCreditos.get('consultaBuro').setValue(new Date());
        this.formAdminCreditos.get('primerPago').setValue(new Date());
        this.formAdminCreditos.get('ultimoPago').setValue(new Date());
    }
    /********************************************************************************************************************
     * 
     * BLOQUE DE VALIDACIONES
     * 
     * ******************************************************************************************************************/


    //validacion de campos 
    validaciones = {
        'clasificacion': [
            { type: 'required', message: 'Campo requerido.' }],
        'tipoCredito': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El crédito no pertenece a la lista, elija otro.' }
        ],
        'montoCredito': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'periodo': [
            { type: 'required', message: 'Campo requerido.' }],
        'noPagos': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'tipoGarantia': [
            { type: 'invalidAutocompleteObject', message: 'La garantía no pertenece a la lista, elija otra.' }
        ],
        'noFolioSIC': [{ type: 'pattern', message: 'Solo números enteros a 12 dígitos.' },
        { type: 'required', message: 'Folio SIC requerido.' }],
        'consultaBuro': [{ type: 'required', message: 'Fecha consulta buro requerida' }],
        'calificacionBuro': [{ type: 'required', message: 'Calificación buro requerida.' }],
        'estadoDestino': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El estado no existe.' }],
        'destinoRecurso': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La ciudad no existe.' }],


    };

    /********************************************************************************************************************
     * 
     * BLOQUE METODOS GENÉRICOS
     * 
     * ******************************************************************************************************************/

    updateValue(value: string) {
        let monto = parseFloat(value);
        //Validar monto a solicitar a corde al tipo de credito
        if (monto >= this.montoMin && monto <= this.montoMax) {
            if (Number.isNaN(monto)) {
                monto = parseFloat(value.substring(3).replace(",", ""));
            }
            this.cantidad = formatCurrency(monto, 'en-US', getCurrencySymbol('MXN', 'wide'));
            this.validarParametrosCr();
        } else {
            this.service.showNotification('top', 'right', 3, 'El monto de crédito debe estar entre ' + this.montoMin + ' y ' + this.montoMax);
        }

    }

    /**
     * Metodo que valida si va vacio.
     * @param value 
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
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
     * Metodo que busca la informacion general del cliente
     * @param numCliente - Numero del cliente a buscar
     */
    spsCliente(detalle: any) {
        this.habilitar = true;
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(detalle.numero_cliente + '/' + detalle.persona_juridica, 'listaClientesFM').subscribe(data => {
            if (data[0].personaFisica !== null && data[0].personaMoral === "") {
                if (data[0].personaFisica.length > 0) {
                    let fisico = JSON.parse(data[0].personaFisica);
                    this.llenarDatosCliente(fisico[0], detalle);
                }
            } else {
                if (data[0].personaMoral != null && data[0].personaMoral.length > 0) {
                    let moral = JSON.parse(data[0].personaMoral);
                    this.llenardatosMoral(moral[0], detalle);
                }

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
      * Metodo que lista las solicitudes de creditos
      * @param sujetoID - ID del sujeto a buscar
      */
    spsAvalados(sujetoID: any) {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(sujetoID, 'listaAvaladosById').subscribe(data => {
            this.listaAvalados = data
            this.dataSourceAvalados = new MatTableDataSource(this.listaAvalados);
            this.dataSourceAvalados.paginator = this.paginatorAvalados;
            this.dataSourceAvalados.sort = this.sortAvalados;

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
      * Metodo que lista las solicitudes de creditos
      * @param numeroCliente - Numero del socio/cliente a filtrar
      */
    spsHistorialCred(numeroCliente: any) {
        this.blockUI.start('Cargando datos...');
        let path = numeroCliente + '/' + 1;
        this.service.getListByID(path, 'listaHistorialCred').subscribe(data => {
            this.listaHistorialCred = data
            this.dataSopurceHistorial = new MatTableDataSource(this.listaHistorialCred);
            this.dataSopurceHistorial.paginator = this.paginatorHistorial;
            this.dataSopurceHistorial.sort = this.sortHistorial;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
          * Metodo que lista a evaluacion cinco de creditos
          * @param numeroCliente - Cliente a buscar
          */

    spsEvaluacionCinco() {
        let numeroCliente = this.formAdminCreditos.get('numeroCliente').value;
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(numeroCliente, 'spsEvaluacionCinco').subscribe(data => {
            if (!this.vacio(data)) {
                let evaluacion = JSON.parse(data);
                let total = evaluacion.reduce((acc, cinco,) => acc + (cinco.caracter_resultado + cinco.capital + cinco.capacidad_pago_resultado + cinco.condicion_resultado + cinco.colateral_resultado),
                    0);
                if (total >= 60) {
                    this.dictamen = 'Viable';
                } else {
                    this.dictamen = 'No Viable';
                }
                this.dataSource5CS = new MatTableDataSource(evaluacion);
                this.dataSource5CS.paginator = this.paginatorEvaluacion;
                this.dataSource5CS.sort = this.sortEvaluacion;
            }



            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

}

