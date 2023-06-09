import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Router } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { globales } from "../../../../../environments/globales.config";
import { generales } from "../../../../../environments/generales.config";
import { categorias } from "../../../../../environments/categorias.config";
import { MatTableDataSource } from "@angular/material/table";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { formatCurrency, getCurrencySymbol } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { DocumentosModalComponent } from "../../../../pages/modales/documentos-modal/documentos-modal.component";
import * as moment from "moment";
import { AmortizacionesComponent } from "../../../../pages/modales/amortizaciones-modal/amortizaciones.component";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";


@Component({
    selector: 'solicitudes-aprobadas',
    moduleId: module.id,
    templateUrl: 'solicitudes-aprobadas.component.html',
    styleUrls: ['../../../clientes/administracion-clientes/clientes.component.css']
})


/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 09/02/2022
 * @descripcion: Componente para la gestion de solicitudes de credito
 */
export class SolicitudesAprobadas implements OnInit {
    //Declracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;
    //Habilitar o deshabilitar boton
    btnStatus: boolean = false;
    formAdminCreditos: UntypedFormGroup;
    formAprobacion: UntypedFormGroup;
    solicitud: any;//informacion de la solicitud aprobar


    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    /********
     * Apartado de generales
     * *******/
    listaClientes: any = [];
    personalidad: any;
    sujetoID: number = 0;
    listaDomCliente: any = [];
    listaAgenda: any = [];
    listaEmpleos: any = [];
    listaCuentasBancarias: any = [];
    cuentasBancariasManeja = "";
    listaEmpleosDom: any = [];
    listaDomEmpresa: any = [];
    /**Combos */
    listaCreditos: any = [];
    listaClasificacion: any = [];
    listaCalificacionBuro: any = [];
    listaFrecuenciaPago: any = [];
    listaEstSolicitud: any = [];
    listaComisiones: any = [];
    listaDocsCliDgt: any = [];
    listaDocsGarDgt: any = [];

    //Listas Docs digitalizados    
    listaDocsHipotecaDgt: any = [];
    listaDocsPrendariaDgt: any = [];
    listaDocsGarantiaLiquidaDgt: any = [];
    listaDocsInversionDgt: any = [];

    montoA: string = '0';
    cargo: boolean = false;
    /**Apartado creditos */
    listaTiposGarantias: any = [];
    vCreditoID: number = 0;
    detalleCr: any = [];
    montoGarLiquida: number = 0;
    listaEstados: any = [];
    listaCiudadNac: any = [];

    /**Apartado de garantias */
    listaAvales: any = [];
    vHipotecas: any = [];
    vPrendas: any = [];
    /**apartado de analisis de credito */
    resultCapPago: string = "";
    totalIngreso: number = 0.0;
    totalEgreso: number = 0.0;
    liquidez: number = 0.0;
    pagoAmortizacion2do: number = 0.0;
    resultLiquidez: string = "";
    capPago: number = 0.0;
    listIngresos: any[];
    listEgresos: any[];
    comprobacionIngresos: any[];
    comprobacionEgresos: any[];
    dictamen: string = "";
    /***Para generar la tabla de amortizaciones */

    pclavecredito: string = "";
    pmonto: number = 0.0;
    ptasa: number = 0;
    pplazo: number = 0;
    amortizaciones: number = 0;
    ptipoamortizacion: string = "";
    paplicaiva: boolean = false;
    pfechaotorga: string = "";
    aplicapfuturo: boolean = false;
    pprimerpago: string = "";
    listaAmortizaciones: any = [];

    //DECLARACIÓN DE DATASOURCE
    dataSourceEmpleo: MatTableDataSource<any>;
    dataSopurceHistorial: MatTableDataSource<any>;
    dataSourceAvalados: MatTableDataSource<any>;
    dataSourceIngreso: MatTableDataSource<any>;
    dataSourceEgreso: MatTableDataSource<any>;
    dataSource5CS: MatTableDataSource<any>;
    //DECLARACIÓN DE COLUMNAS 
    displayedColumnsEmpleo: string[] = ['Empresa', 'Jefe Directo', 'Empleo', 'Horario', "Estado",
        "Municipio", "Colonia", "Calle", "Número Exterior", "Número Interior", "C.P.", "Localidad", "Telefono"];
    displayedColumnsHistorial: string[] = ['refCredito', 'fechaEntrega', 'fechaVencimiento', 'fechaUltimoPago', 'montoCredito',
        'saldoCredito', 'estadoCredito'];
    displayedColumnsAvalados: string[] = ['numeroCliente', 'nombre', 'referencia', 'monto', 'saldo', 'estadoCredito'];
    displayedColumnsIngresos: string[] = ['Descripción', 'Monto'];
    displayedColumnsEgresos: string[] = ['Descripción', 'Monto'];
    displayedColumns5CS: string[] = ['Referencia', 'Monto', 'Caracter', 'Capital', 'CPago', 'Condicion', 'Colateral', 'Resultado', 'Dictamen']


    //Paginacion
    @ViewChild('paginatorEmpleo') paginatorEmpleo: MatPaginator;
    @ViewChild(MatSort) sortEmpleo: MatSort;
    @ViewChild('paginatorHistorial') paginatorHistorial: MatPaginator;
    @ViewChild(MatSort) sortHistorial: MatSort;
    @ViewChild('paginatorAvalados') paginatorAvalados: MatPaginator;
    @ViewChild(MatSort) sortAvalados: MatSort;
    @ViewChild('paginatorIngresos') paginatorIngresos: MatPaginator;
    @ViewChild(MatSort) sortIngresos: MatSort;
    @ViewChild('paginatorEgresos') paginatorEgresos: MatPaginator;
    @ViewChild(MatSort) sortEgresos: MatSort;
    @ViewChild('paginatorEvaluacion') paginatorEvaluacion: MatPaginator;
    @ViewChild(MatSort) sortEvaluacion: MatSort;

    /**
        * Constructor de la clase AdminCreditosComponent
        * @param service  service para el acceso a datos
        */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, private route: Router, private servicePermisos: PermisosService, public dialog: MatDialog) {
        //Recibe los datos de la solicitud
        const datosSol = this.route.getCurrentNavigation();
        this.solicitud = datosSol.extras.state.solicitud;

        this.formAdminCreditos = this.formBuilder.group({
            //CREACIÓN DE LOS COMPONENTES PRINCIPALES
            numSolicitud: new UntypedFormControl(''),
            referencia: new UntypedFormControl(''),
            fecha: new UntypedFormControl({ value: new Date().toLocaleString("es-MX", {year: 'numeric', month: 'long', day: 'numeric' }), disabled: false }),
            numeroCliente: new UntypedFormControl(''),
            nombre: new UntypedFormControl(''),
            estaSolicitud: new UntypedFormControl(''),
            //CREACIÓN DE LOS COMPONENTES DEL TAG "GENERALES"
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
            clasificacion: new UntypedFormControl('',),
            tipoCredito: new UntypedFormControl('',),
            condicionPago: new UntypedFormControl(''),
            montoCredito: new UntypedFormControl('',),
            destinoRecurso: new UntypedFormControl(''),
            estadoDestino: new UntypedFormControl(''),
            finalidad: new UntypedFormControl(''),
            tasaMoratoria: new UntypedFormControl(''),
            tasaInteres: new UntypedFormControl(),
            periodo: new UntypedFormControl('',),
            estadoCredito: new UntypedFormControl(''),
            noPagos: new UntypedFormControl('',),
            resultado: new UntypedFormControl({ value: new Date(), disabled: false }, [Validators.required]),
            entrega: new UntypedFormControl({ value: new Date(), disabled: false }, [Validators.required]),
            calificacionBuro: new UntypedFormControl('',),
            primerPago: new UntypedFormControl({ value: new Date(), disabled: false }),
            consultaBuro: new UntypedFormControl({ value: new Date(), disabled: false }),
            ultimoPago: new UntypedFormControl({ value: new Date(), disabled: false }),
            noFolioSIC: new UntypedFormControl('',),
            observacionSolicitud: new UntypedFormControl(''),
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
            usuario: new UntypedFormControl(this.servicePermisos.usuario.firstName + ' ' + this.servicePermisos.usuario.lastName),
            cargo: new UntypedFormControl(''),
            estSol: new UntypedFormControl('', Validators.required),
            montoAp: new UntypedFormControl('', Validators.required),
            descripSol: new UntypedFormControl('', Validators.required),
        });

    }

    ngOnInit() {
        this.spsTipoCreditos();
        this.spsClasificacion();
        this.spsCalificacionBuro();
        this.spsEstatusSolicitud();
        this.spsUsuario();
        this.spsEstados();

    }
    /**
    * Regresa a la pantalla principal de solicitudes
    */
    regresar() {
        this.route.navigate(['solicitudes']);
    }
    /**
* Metodo que lista los tipos de Creditos
*/
    spsTipoCreditos() {
        this.blockUI.start('Cargando ...');
        let id = this.servicePermisos.sucursalSeleccionada.sucursalid;
        this.service.getListByArregloIDs(id + '/' + 2, 'listaCreditosBySucursal').subscribe(data => {
            this.listaCreditos = data;
            this.llenarSolicitud();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }
    /**
* Metodo que consulta las clasificaciones de creditos
*/
    spsClasificacion() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsClasificacionCred').subscribe(data => {
            this.listaClasificacion = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

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
 * Metodo que lista condiciones de pago por el tipo de credito
 * @param tipoCr
 */
    spsCondicionesPago(tipoCr) {
        this.service.getListByID(generales.condicionPagoCred, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                let descripcion = data.find((result) => {
                    if (result.generalesId === tipoCr.extenciones.extencionCatalogoCreditos.condicionPagoId) {
                        return result
                    }
                });
                this.formAdminCreditos.get('condicionPago').setValue(descripcion.descripcion);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }


    /**
    * Metodo para listar los estados
    * 
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo que lista ciudades por Estado ID fitlrado, para referencias y clientes
     */
    spsCiudadNac(estado, ciudad) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(estado, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;

            let fCiudad = this.listaCiudadNac.find(c => c.ciudaId === ciudad);
            this.formAdminCreditos.get('destinoRecurso').setValue(fCiudad.nombre);

            this.blockUI.stop();
        }, error => {

            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
 * Metodo que lista las finalidades
 * @param tipoCr tipo de credito
 */
    spslistaFinalidades(tipoCr) {
        this.service.getListByID(2, 'listaFinalidadCredito').subscribe(
            (data: any) => {
                let finalidades = data.find((result) => {
                    if (result.finalidadId === tipoCr.finalidadId) { return result }
                });
                this.formAdminCreditos.get('finalidad').setValue(finalidades.descripcion);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }
    /**
   * Metodo que consulta los Estados de la solicitud de credito
   */
    spsEstatusSolicitud() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(categorias.catEstusSol, 'listaGeneralCategoria').subscribe(data => {
            this.listaEstSolicitud = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**
     * Modal para mostrar la tabla de amortizaciones
     * Se le pasa los parametros para calcular las amortizaciones 
     * @param accion 1 Abrir modal, 2 Calcular amortizaciones
     */
    modalTablaAMortizaciones(accion: any) {
        let lista = [];
        let parametrosAmort = {
            "pclavecredito": this.pclavecredito,
            "pmonto": this.pmonto,
            "ptasa": this.ptasa,
            "pplazo": this.pplazo,
            "amortizaciones": this.amortizaciones,
            "ptipoamortizacion": this.ptipoamortizacion,
            "paplicaiva": this.paplicaiva,
            "pfechaotorga": this.pfechaotorga,
            "aplicapfuturo": this.aplicapfuturo,
            "pprimerpago": this.pprimerpago,
        }
        if (accion != 1) {
            //calcular amortizaciones
            this.spsAmortizaciones(parametrosAmort);
        } else {
            //abrir modal
            const dialogRef = this.dialog.open(AmortizacionesComponent, {
                width: '65%',
                data: {
                    titulo: 'Tabla de amortizaciones',
                    parametros: parametrosAmort,//se pasan los parametros
                    lista: lista//vacio
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                //retona la lista de amortizaciones a imprimir o cero de cerrar
            });
        }
    }
    /**
* Metodo que lista la tabla de amortizacion
*/
    spsAmortizaciones(parametros: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(parametros, 'listaAmortizaciones').subscribe(amortizacion => {
            this.listaAmortizaciones = amortizacion;
            this.formAdminCreditos.get('primerPago').setValue(this.listaAmortizaciones[0].fechapago + 'T00:00:00');
            this.formAdminCreditos.get('ultimoPago').setValue(this.listaAmortizaciones[this.listaAmortizaciones.length - 1].fechapago + 'T00:00:00');
            this.consultarAvales();
            this.calcularCapacidadPago();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message);
        });


    }
    /**
     * Se llena la inofmacion de la pantalla 
     * con los datos de la solicitud aprobar o cancelar
     */
    llenarSolicitud() {
        this.formAdminCreditos.get('numSolicitud').setValue(this.solicitud.num_solicitud);
        this.formAdminCreditos.get('referencia').setValue(this.solicitud.referencia);
        this.formAdminCreditos.get('numeroCliente').setValue(this.solicitud.numero_cliente);
        this.formAdminCreditos.get('nombre').setValue(this.solicitud.nombre);
        this.formAdminCreditos.get('estaSolicitud').setValue(this.solicitud.estado_comite);
        //Se resetean todas las variables
        this.listaTiposGarantias = [];
        this.vHipotecas = [];
        this.vPrendas = [];
        this.blockUI.start('Cargando ...');
        //CONSULTA DETALLE DE CREDITO
        this.service.getListByID(this.solicitud.referencia, 'detalleCredito').subscribe(detCredito => {
            let parseJson = JSON.parse(detCredito);
            let detalle = parseJson[0];
            this.detalleCr = detalle;
            //#### INICIO Tab Creditos
            //Ya esta autorizado
            this.vCreditoID = detalle.credito_id;
            let catCre = this.listaCreditos.find(c => c.creditoId === detalle.cat_credito_id);
            //Comisiones 
            if (!this.vacio(catCre.extenciones.extCatCreCinco.comisiones)) {
                this.listaComisiones = JSON.parse(catCre.extenciones.extCatCreCinco.comisiones);
            }
            this.formAdminCreditos.get('tipoCredito').setValue(catCre.descripcion);
            this.spsCondicionesPago(catCre);
            this.spslistaFinalidades(catCre);
            if (!this.vacio(catCre.extenciones.extencionCatalogoCreditosTres.garantias)) {
                this.listaTiposGarantias = JSON.parse(catCre.extenciones.extencionCatalogoCreditosTres.garantias);
            }
            this.service.getListByID(1, 'listaTipoPlazo').subscribe(plazos => {
                let frecuencia = plazos.find(f => f.tipoPlazoId === detalle.tipo_plazo_id);
                let tipoAmort = JSON.parse(catCre.extenciones.extencionCatalogoCreditosTres.frecuenciaPagos);
                for (let tipo of tipoAmort) {
                    if (tipo.tipo_plazo_id === detalle.tipo_plazo_id) {
                        this.ptipoamortizacion = tipo.cve_amortizacion;
                    }
                }
                //Amortizaciones
                this.pmonto = detalle.monto_credito
                this.ptasa = detalle.tasanormal;
                this.amortizaciones = detalle.no_pagos;
                this.pfechaotorga = detalle.fecha_resultado;
                this.pprimerpago = detalle.fecha_primer_pago;
                this.pclavecredito = catCre.cveCredito;
                this.paplicaiva = catCre.aplicaIVA;
                this.pplazo = frecuencia.dias;
                this.formAdminCreditos.get('periodo').setValue(frecuencia.descripcion);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
            );
            this.aplicapfuturo = detalle.pago_futuro;

            // Inicio Seteo de Datos del CLiente en Tab de Generales
            this.spsCliente();
            let clas = this.listaClasificacion.find(c => c.clasificacionID === detalle.clasificacion_id);
            this.formAdminCreditos.get('clasificacion').setValue(clas.descripcion);
            let monto = formatCurrency(detalle.monto_credito, 'en-US', getCurrencySymbol('MXN', 'wide'));
            this.formAdminCreditos.get('montoCredito').setValue(monto);
            let fEstado = this.listaEstados.find(e => e.estadoid === detalle.estado_id);
            this.formAdminCreditos.get('estadoDestino').setValue(fEstado.nombreEstado);
            this.spsCiudadNac(detalle.estado_id, detalle.destino_recurso);
            this.formAprobacion.get('montoS').setValue(monto);
            this.formAdminCreditos.get('noPagos').setValue(detalle.no_pagos);
            this.formAdminCreditos.get('noFolioSIC').setValue(detalle.nofoliosic);
            this.formAdminCreditos.get('tasaInteres').setValue(detalle.tasanormal);
            this.formAdminCreditos.get('tasaMoratoria').setValue(detalle.tasamoratoria);
            this.formAdminCreditos.get('estadoCredito').setValue(detalle.desc_estado_cred);
            let buro = this.listaCalificacionBuro.find(b => b.generalesId === detalle.calificacion_buro_id);
            if (buro != undefined) {
                this.formAdminCreditos.get('calificacionBuro').setValue(buro.descripcion);
            }
            this.formAdminCreditos.get('consultaBuro').setValue(detalle.fecha_consulta_buro + 'T00:00:00');
            this.formAdminCreditos.get('resultado').setValue(detalle.fecha_resultado + 'T00:00:00');
            this.formAdminCreditos.get('entrega').setValue(detalle.fecha_entrega + 'T00:00:00');
            this.formAdminCreditos.get('ultimoPago').setValue(detalle.fecha_ultimo_pago + 'T00:00:00');
            this.formAdminCreditos.get('primerPago').setValue(detalle.fecha_primer_pago + 'T00:00:00');
            this.formAdminCreditos.get('observacionSolicitud').setValue(detalle.observaciones);

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

            //#### FIN TAB GARANTIAS     
            //*****INICIO TAB DIGITALIZACION
            //Se recorre la lista de los archivos del deudor para mostrar en pantalla
            if (detalle.digitalizacion !== null) {
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
            /*if (detalle.dig_garantias !== null) {
                let digGarantias = JSON.parse(detalle.dig_garantias);
                for (let docGar of digGarantias) {
                    this.listaDocsGarDgt.push([
                        docGar.documento,
                        docGar.tipodocumento_id,
                        docGar.nombredoc,
                        docGar.garantia_id //Es la garantia id
                    ]);
                }
            }*/

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
            //*****FIN TAB DIGITALIZACION  | this.solicitud.cve_comite === generales.solRechazada
            if (generales.credVigente === detalle.cve_estado_cred) {
                //Se deshabiliata el boton 
                this.btnStatus = true;
            }
            if (!this.vacio(detalle.cobros)) {//cobros no es null
                let cobros = JSON.parse(detalle.cobros);
                let pagos = '';
                cobros.forEach(element => {

                    if (!this.vacio(element.garantia_id) && element.estatus == false) {//si la garntia no es null y no esta cobrada
                        pagos += element.garantia + " " + formatCurrency(element.monto, 'en-US', getCurrencySymbol('MXN', 'wide')) + "\n ";
                    } else
                        if (!this.vacio(element.comision) && element.estatus == false) {
                            pagos += " " + element.descripcion + " " + formatCurrency(element.monto, 'en-US', getCurrencySymbol('MXN', 'wide')) + "\n ";

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
            //CONSULTAR RESPUESTA SOLICITUD
            this.spsRespuestaSolicitud();
            this.spsEvaluacionCinco();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }
    /**
     * Se obtiene la informacion completa del cliente
     */
    spsCliente() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.solicitud.numero_cliente + '/' + this.solicitud.personalidadid, 'listaClientesFM').subscribe(data => {
            if (data[0].personaFisica !== null && data[0].personaMoral === "") {
                if (data[0].personaFisica.length > 0) {
                    this.listaClientes = JSON.parse(data[0].personaFisica);
                    this.personalidad = 'F';
                    //Se llena la infomración en el apartado de generales
                    this.llenarDatosCliente(this.listaClientes[0]);
                }
            } else {
                if (data[0].personaMoral != null && data[0].personaMoral.length > 0) {
                    this.listaClientes = JSON.parse(data[0].personaMoral);
                    this.personalidad = 'M';
                    //Se llena la infomración en el apartado de generales
                    this.llenarDatosClienteM(this.listaClientes[0]);
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
        this.service.getListByID(this.vCreditoID, 'listaAval').subscribe(avales => {
            if (!this.vacio(avales)) {
                //this.listaAvales 
                let aval = JSON.parse(avales);
                for (let avalDatos of aval) {
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

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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
                this.formAprobacion.get('fechaP').setValue(moment(respuesta[0].fecha).format("DD-MM-YYYY"));
                this.formAprobacion.get('usuario').setValue(respuesta[0].first_name + ' ' + respuesta[0].last_name);
                this.formAprobacion.get('cargo').setValue(respuesta[0].cargo);
                let estaSol = this.listaEstSolicitud.find(s => s.generalesId === respuesta[0].generales_id);
                this.formAprobacion.get('estSol').setValue(estaSol);
                this.formAprobacion.get('montoAp').setValue(respuesta[0].monto_aprobado);
                this.formAprobacion.get('descripSol').setValue(respuesta[0].observacion);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**Se abre modal para visualizar los documentos digitalizados */
    openDialogDoc(documento) {
        let titulo = 'Documento';

        this.dialog.open(DocumentosModalComponent, {
            width: '50%',
            height: '50%',
            data: {
                titulo: titulo,
                documentos: documento
            }

        });
    }
    /**
     * Metodo para llenar los campos de la información del cliente 
     */
    llenarDatosCliente(datos) {
        this.blockUI.start('Cargando datos...');
        this.sujetoID = datos.sujeto_cl;
        this.formAdminCreditos.get('fechaNacimiento').setValue(datos.fecha_nacimiento);
        this.formAdminCreditos.get('razonSocial').setValue('');
        //CALCULAR LA EDAD DEL CLIENTE
        const convertAge = new Date(this.formAdminCreditos.get('fechaNacimiento').value);
        let timeDiff = Math.abs(Date.now() - convertAge.getTime());
        this.formAdminCreditos.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365) + ' años');
        this.formAdminCreditos.get('curp').setValue(datos.curp.trim());
        this.formAdminCreditos.get('rfc').setValue(datos.rfc.trim());
        // TRAE LA LISTA DE DOMICILIOS
        //filtra el resultado por el domicilio Principal
        this.listaDomCliente = JSON.parse(datos.domicilio_cl).filter((result) => result.num_dom === globales.principal);

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
        //filtra el resultado por la agenda Principal
        this.listaAgenda = JSON.parse(datos.agendacl).filter((result) => result.descripcion === globales.principal);
        //Valida que la lista no venga vacia para setear los datos al formulario
        if (!this.vacio(this.listaAgenda)) {
            this.formAdminCreditos.get('telefono').setValue(this.listaAgenda[0].telefono);
        }
        //TRAE LAS CUENTAS BANCARIAS QUE MANEJA EL CLIENTE
        this.listaCuentasBancarias = JSON.parse(datos.maneja_cuentas);
        //Valida que la lista no venga vacia para setear los de la cuenta bancaria a cuentasBancariasManeja
        if (!this.vacio(this.listaCuentasBancarias)) {
            this.cuentasBancariasManeja = ""
            this.listaCuentasBancarias.forEach(cuentaBanc => {
                if (this.cuentasBancariasManeja === "") {
                    this.cuentasBancariasManeja = this.cuentasBancariasManeja + cuentaBanc.cuenta;
                } else {
                    this.cuentasBancariasManeja = this.cuentasBancariasManeja + '/' + cuentaBanc.cuenta;
                }
            });
            //MUESTRAS LAS CUENTAS BANCARIAS
            this.formAdminCreditos.get('cBancaria').setValue(this.cuentasBancariasManeja);

        }
        // TRAE LA LISTA DE EMPLEOS
        // Parceamos  a JSON y las guardamos en listaEmpleos
        if (!this.vacio(datos.empleos_cl)) {
            this.listaEmpleos = JSON.parse(datos.empleos_cl);
            //Valida que la lista no venga vacia para setear los datos a la tabla de empleos
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

            this.formAdminCreditos.get('ocupacionA').setValue(this.listaEmpleos[0].ocupacion);
            this.formAdminCreditos.get('fIngresos').setValue(this.listaEmpleos[0].observacion);
        }
        //CONSULTA HISTORIAL CREDITICIO 
        this.spsHistorialCred(datos.numero_cliente);
        //CONSULTA AVALADOS
        this.spsAvalados(this.sujetoID);
        // TRAE LA LISTA DE INGRESOS DEL CLIENTE
        this.listIngresos = JSON.parse(datos.ingresos);
        // LISTA PARA HACER LA COMPROBACIÓN DE INGRESOS DE LA 5C,S
        this.comprobacionIngresos = this.listIngresos
        // TRAE LA LISTA DE EGRESOS DEL CLIENTE
        this.listEgresos = JSON.parse(datos.egresos_cl)
        // LISTA PARA HACER LA COMPROBACIÓN DE EGRESOS DE LA 5C,S
        this.comprobacionEgresos = this.listEgresos
        //
        this.egresosIngresos();
        this.blockUI.stop();
    }
    /**LLenado de infromacion de un cliente moral
     * @param datosM informacion del cliente moral
    */
    llenarDatosClienteM(datosM) {
        //encabezado
        this.blockUI.start('Cargando datos...');
        this.sujetoID = 0;//no hay suejeto

        this.formAdminCreditos.get('numeroCliente').setValue(datosM.numero_cliente);
        this.formAdminCreditos.get('nombre').setValue(datosM.nombre_comercial);
        this.formAdminCreditos.get('curp').setValue('');
        this.listaEmpleos = [];
        this.formAdminCreditos.get('fechaNacimiento').setValue(datosM.fecha_constitucion);
        this.formAdminCreditos.get('razonSocial').setValue(datosM.razon_social);

        //CALCULAR LA EDAD DEL CLIENTE
        const convertAge = new Date(this.formAdminCreditos.get('fechaNacimiento').value);
        let timeDiff = Math.abs(Date.now() - convertAge.getTime());
        this.formAdminCreditos.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365) + ' años');
        this.formAdminCreditos.get('rfc').setValue(datosM.rfc.trim());

        // TRAE LA LISTA DE DOMICILIOS
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
            this.formAdminCreditos.get('telefono').setValue(this.listaAgenda[0].telefono.trim());
        }

        //TRAE LAS CUENTAS BANCARIAS QUE MANEJA EL CLIENTE
        // Parceamos la agenda a JSON y las guardamos en listaCuentasBancarias
        this.listaCuentasBancarias = JSON.parse(datosM.maneja_cuentas);
        //Valida que la lista no venga vacia para setear los de la cuenta bancaria a cuentasBancariasManeja
        if (!this.vacio(this.listaCuentasBancarias)) {

            this.formAdminCreditos.get('ocupacionA').setValue(datosM.act_scian);
            this.formAdminCreditos.get('fIngresos').setValue(datosM.giro);

            this.cuentasBancariasManeja = ""
            this.listaCuentasBancarias.forEach(cuentaBanco => {
                if (this.cuentasBancariasManeja === "") {
                    this.cuentasBancariasManeja = this.cuentasBancariasManeja + cuentaBanco.cuenta;
                } else {
                    this.cuentasBancariasManeja = this.cuentasBancariasManeja + '/' + cuentaBanco.cuenta;
                }
            });
        }

        //MUESTRAS LAS CUENTAS BANCARIAS
        this.formAdminCreditos.get('cBancaria').setValue(this.cuentasBancariasManeja);
        //CONSULTA HISTORIAL CREDITICIO 
        this.spsHistorialCred(datosM.numero_cliente);
        //CONSULTA AVALADOS
        this.spsAvalados(this.sujetoID);
        // TRAE LA LISTA DE INGRESOS DEL CLIENTE
        this.listIngresos = JSON.parse(datosM.ingresos);
        // LISTA PARA HACER LA COMPROBACIÓN DE INGRESOS DE LA 5C,S
        this.comprobacionIngresos = this.listIngresos
        // TRAE LA LISTA DE EGRESOS DEL CLIENTE
        this.listEgresos = JSON.parse(datosM.egresos_cl)
        // LISTA PARA HACER LA COMPROBACIÓN DE EGRESOS DE LA 5C,S
        this.comprobacionEgresos = this.listEgresos
        //
        this.egresosIngresos();
        this.blockUI.stop();
    }
    /**Calculo de  Ingreso y egresos */
    egresosIngresos() {

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
        if (!this.vacio(this.detalleCr)) {
            this.verificarFecha();//se actualizan a la tabla de amortizaciones
        }
    }
    /**METODO QUE PERMITE REVISAR LAS FECHAS de entrega */
    verificarFecha() {
        if (this.detalleCr.cve_estado_comite !== generales.solAprobada) {
            this.formAdminCreditos.get('entrega').setValue(new Date());
            this.formAdminCreditos.get('resultado').setValue(new Date());
            this.pfechaotorga = moment(this.formAdminCreditos.get('entrega').value).format("yyyy-MM-DD");
        }
        //Se generar las amortizaciones para obtener la segunda amortizacion y calucular ala capacidad e pago
        this.modalTablaAMortizaciones(2);

    }

    /**Metodo para culcular la capcidad e aogo en base a las amortizaciones calculadas */
    calcularCapacidadPago() {
        //TOMAR EL 2DO PAGO DE LA TABLA DE AMORTIZACIONES
        if (this.listaAmortizaciones.length > 0) {
            this.pagoAmortizacion2do = this.listaAmortizaciones[1].pagototal;
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
  * Metodo que lista las solicitudes de creditos
  * @param numeroCliente - Numero del socio/cliente a filtrar
  */
    spsHistorialCred(numeroCliente: any) {
        this.blockUI.start('Cargando datos...');
        let path = numeroCliente + '/' + 1;
        this.service.getListByID(path, 'listaHistorialCred').subscribe(data => {
            this.dataSopurceHistorial = new MatTableDataSource(data);
            this.dataSopurceHistorial.paginator = this.paginatorHistorial;
            this.dataSopurceHistorial.sort = this.sortHistorial;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
* Metodo que lista clientes de quien a sido aval
* @param sujetoID - ID del sujeto a buscar
*/
    spsAvalados(sujetoID: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(sujetoID, 'listaAvaladosById').subscribe(data => {
            this.dataSourceAvalados = new MatTableDataSource(data);
            this.dataSourceAvalados.paginator = this.paginatorAvalados;
            this.dataSourceAvalados.sort = this.sortAvalados;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**Obtiene el integrante de comite acorde al usuario loggeado */
    spsUsuario() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.servicePermisos.usuario.id + '/' + this.servicePermisos.sucursalSeleccionada.sucursalid, 'spsIntegranteComite').subscribe(data => {
            if (!this.vacio(data)) {
                let integrante = JSON.parse(data)
                this.cargo = true;
                this.formAprobacion.get('cargo').setValue(integrante[0].descripcion);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**Cambia valor numerico a tipo moneda */
    formatoMoneda(value: string) {
        let val = parseFloat(value);
        if (Number.isNaN(val)) {
            ///val = 0;
            val = parseFloat(value.substring(3).replace(",", ""));
        }
        this.montoA = formatCurrency(val, 'en-US', getCurrencySymbol('MXN', 'wide'));
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
    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    /**Envio de información de la solicitud a probar o rechazar por el comite de credito */
    crudAprobacion() {
        this.blockUI.start('Cargando datos...');
        if (this.formAprobacion.invalid) {
            this.validateAllFormFields(this.formAprobacion);
            this.service.showNotification('top', 'right', 3, 'No se ha llenado el formulario de aprobación o negación.');
            this.blockUI.stop();
            return;
        }
        let datosSolicitud = {
            "creditoID": this.vCreditoID,
            "estatusID": this.formAprobacion.get('estSol').value.generalesId,
            "observacion": this.formAprobacion.get('descripSol').value,
            "montoSolicitado": this.solicitud.monto_credito,
            "montoAprobado": this.formAprobacion.get('montoAp').value,
            "usuarioID": this.servicePermisos.usuario.id,
            "solicitudID": this.solicitud.solicitud_id

        }

        this.service.registrar(datosSolicitud, 'crudRespuestaCredito').subscribe(result => {
            if (result[0][0] === '0') {
                //refresca los comites y se limpian las listas y formularios        
                this.regresar();
                this.service.showNotification('top', 'right', 2, result[0][1]);
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
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
    //validacion de campos 
    validaciones = {
        'estSol': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'montoAp': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'descripSol': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };

}