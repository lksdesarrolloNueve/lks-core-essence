import { Component, OnInit } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { BuscarClientesComponent } from "../../../../app/pages/modales/clientes-modal/buscar-clientes.component";
import { AdministracionMovimientoComponent } from "./admin-movimiento/admin-movimiento.component";
import { MatTableDataSource } from "@angular/material/table";
import { ModalCajaMovComponent } from "./modal-caja-movimiento/modal-caja-movimiento.component";
import { environment } from '../../../../environments/environment';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { AuthService } from '../../../auth/service/auth.service';
import { globales } from "../../../../environments/globales.config";
import { Router } from "@angular/router";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { ModalCerrarCajaComponent } from "../cajas-sucursal/modal-cerrar-caja/modal-cerrar-caja.component";
import { AngularFirestore } from "@angular/fire/firestore";
import * as moment from "moment";
import { formatCurrency, getCurrencySymbol } from "@angular/common";
import { listaModalComponent } from "../../../pages/modales/lista-modal/lista-modal.component";
import { CrudInversionComponent } from "../../../pages/inversiones/inversion/m-inversion/m-inversion.component";
import { TitleService } from "../../../shared/navbar/title-service.service";
import { FiresbaseService } from "../../../shared/service/service-firebase/firebase.service";
import { NotificacionesCajaModalComponent } from "../../../pages/modales/notificaciones-caja-modal/notificaciones-caja.component";
import { ModalTrBovedaComponent } from "./modal-traspaso-boveda/modal-traspaso-boveda.component";
import { ModalGastosCajaComponent } from "./modal-gastos-caja/modal-gastos.caja.component";
import { SpeiComponent } from "../spei/spei.component";
import generales from "../../../../environments/generales.config";
import { TAEComponent } from "../punto-de-venta/tae/tae.component";
import { ServiciosMTCComponent } from "../punto-de-venta/servicios/servicios.component";
import { ReferenciaMTCComponent } from "../punto-de-venta/referencia/referencia-mtc.component";
import Swal from "sweetalert2";
import { PermisosService } from '../../../shared/service/permisos.service';


////Constantes//////
//Tipo movimiento.
const cDeposito = environment.tesoreria.deposito;// 001 'Depostio' = 'I'
const cRetiro = environment.tesoreria.retiro;// 002 'Retiro'   =  'E'
const cFoto = environment.globales.cveFoto;
const cFirma = environment.globales.cveFirma;

@Component({
    selector: 'caja-movimientos',
    moduleId: module.id,
    templateUrl: 'caja-movimientos.component.html',
    styleUrls: ['caja-movimientos.component.css'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({ height: '0px', minHeight: '0' })),
            state('expanded', style({ height: '*' })),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
    ]
})


/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 2.0.0
 * @fecha: 20/01/2022
 * @descripcion: Componente para la gestión de cajas.
 */
export class CajaMovimientosComponent implements OnInit {

    //Icon de notificaciones
    hidden = false;

    //Tabla Saldo cuentas
    displayedColumns: string[] = ['no', 'cveMovimiento', 'descMovimiento', 'saldo'];
    dataSourceCuentas: MatTableDataSource<any>;
    listaMovCuenta = [];
    isLoadingResults: boolean = false;
    isResultado: boolean = false;

    //Tabla Créditos cliente.
    displayedColumnsCred: string[] = ['no', 'refCredito', 'fechaUltimoPago', 'montoCredito', 'saldoCredito'];
    dataSourceCred: MatTableDataSource<any>;
    listaCredCliente = [];
    isLoadingResultsCre: boolean = false;
    isResultadoCre: boolean = false;

    //Tabla transacciones(cobros)
    displayedColumnsTrans: string[] = ['no', 'operacion', 'cveMovimiento', 'descMovimiento', 'monto', 'acciones'];
    dataSourceTransacciones: MatTableDataSource<any>;
    listaMovTransacciones = [];

    //Tabla hija transacciones(cobros)
    isotopeColumnsToDisplay = ['Movimiento', 'Monto'];
    expandedElement: any | null;

    //ListaAvisos
    listaAvisos: any = [];
    lista: any = [];
    cl: any = [];
    numCliemte: string = "";

    //ListaNotBloqueoCliente
    listaBloqueos: any = [];
    listaBloqueosInv: any = [];
    listaNotBloqueo: any = [];
    listaNotBloqueoInv: any = [];

    estatusCliente: boolean = false;

    /**
     * Declaracion de variables y controles
     */
    @BlockUI() blockUI: NgBlockUI;
    formCaja: UntypedFormGroup;
    nomCliente: string = "";
    listaAgenda: any[] = [];
    claveCaja: string;
    cveCuentaCaja: string;
    nombreCaja: string;
    datosCaja: any;
    listaSesiones: any;
    fecha: any;

    cveCliente = null;
    refCredito = null;

    //Totales
    totalDep: number = 0;
    totalRet: number = 0;
    total: number = 0;

    listaDigitalizacion: any[] = [];
    urlSafeFoto: SafeResourceUrl;
    urlSafeFirma: SafeResourceUrl;

    //Validación cliente
    clienteMessage = 'Debe seleccionar un cliente.';

    //Validacion movimientos
    movimentosMessage = 'Agregue un movimiento para continuar.';

    //Variables para Inversiones
    private datosCliente: any;
    private tipoPersona: any;
    lblCliente: string = globales.ente;
    lblClientes: string = globales.entes;

    private tipoSocioId: any;
    tipoSocio: string = "";

    cobros: any = [];

    isParteSocial: boolean = false;

    //Clave sucursal sesión.
    vCveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;


    /**
     * Constructor de la clase CajaMovimientosComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder,
        public dialog: MatDialog,
        private authService: AuthService,
        private firestore: AngularFirestore,
        private router: Router,
        private idle: Idle,
        private servicePermisos: PermisosService,
        private sanitizer: DomSanitizer,
        private titleService: TitleService,
        private firebase: FiresbaseService) {

        this.formCaja = this.fomrBuilder.group({
            numCliente: new UntypedFormControl(''),
            telefono: new UntypedFormControl(''),
            correoElec: new UntypedFormControl(''),
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
            catProductoSucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            monto: new UntypedFormControl('', [Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')],)
        });

        const navigation = this.router.getCurrentNavigation();

        const estado = navigation.extras.state as {
            cajas: any,
            bd: any
        };

        this.datosCaja = estado.cajas;

        // Clave de la caja
        this.claveCaja = this.datosCaja.cve_caja;
        // Clave de la cuenta bancaria asociada a la caja
        this.cveCuentaCaja = this.datosCaja.cve_cuenta;
        // Nombre de la caja
        this.nombreCaja = this.datosCaja.descripcion;

        this.fecha = new Date();
        this.fecha = moment(new Date()).format('DD-MM-YYYY HH:mm:ss');
        this.timer();
    }


    /**
     * Funcion que detecta cuando el usuario permanece inactivo por 5 minutos,
     * pasado este tiempo lo devuelve a cajas-sucursal
     */
    timer() {
        this.idle.setIdle(globales.cajaTimeout);
        this.idle.setTimeout(10);
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        this.idle.onIdleEnd.subscribe(() => {
            this.resetTimer();
        });

        this.idle.onTimeout.subscribe(() => {
            this.authService.logout();
        });

        this.idle.onIdleStart.subscribe(() => {

            this.notificacion();
       
          });
    }

    notificacion(){
        Swal.fire({
            title: '¡Tu sessión esta por caducar?',
            text: "¿Deseas continuar?",
            icon: 'warning',
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Salir'
        }).then((result) => {
            if (result.isConfirmed) {
                this.resetTimer();
                return;
            }//fin confirmacion
            this.authService.logout();
        })
    }

    /**
     * Resetea timer
     */
    resetTimer() {
        this.idle.watch();
    }

    /**
     * Init
     */
    ngOnInit(): void {
        //Se inicializa la foto y firma como vacia.
        this.urlSafeFoto = this.sanitizer.bypassSecurityTrustResourceUrl('');
        this.urlSafeFirma = this.sanitizer.bypassSecurityTrustResourceUrl('');
        // Se reinicia el timer que cierra la sesion por inactividad
        this.resetTimer();
        // Se asigna como titulo del navbar el nombre de la caja actual
        this.titleService.setTitulo(this.nombreCaja);
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


    /******************MÉTODOS FUNCIONANDO**************************************************/
    /**
     * Metodo para abrir ventana modal buscar cliente
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialog(data: any) {

        //Limpia pantalla
        this.limpiaGeneral();

        let titulo: any;
        let accion: any;


        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {//clientes
            titulo = "Lista clientes";
            accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                disableClose: true,
                width: '100%',
                data: {
                    titulo: titulo,
                    accion: accion,
                    cliente: data
                }
            });

            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                this.isParteSocial = false;
                if (result && result !== 1) {

                    this.datosCliente = result.datosCl;
                    this.tipoPersona = result.tipoPersona;
                    this.tipoSocioId = this.datosCliente.tipo_socioid;
                    this.estatusCliente = result.datosCl.estatus;
                    console.log('estatus inicial result',result)
                    this.llenarDatosCliente(result.datosCl);
                    this.spsBloqueoClientes(null, null);

                }

            });

        }

    }

    /**
     * Metodo para abrir ventana modal auxiliar
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialogAuxiliar(data: any, accion: any) {

        //Valida cliente
        if (this.validaCliente()) {
            return;
        }

        let titulo: any;

        //Asigna titulo
        titulo = this.titulosModalAux(accion);

        let referenciaCredito = null;

        if (accion == 6) {
            referenciaCredito = data.refCredito;
        }

        //se abre el modal
        const dialogRef = this.dialog.open(ModalCajaMovComponent, {
            width: '100%',
            disableClose: true,
            data: {
                titulo: titulo,
                accion: accion,
                data: data,
                cveCliente: this.cveCliente,
                cveCaja: this.claveCaja,
                nombreCliente: this.nomCliente,
                tipoSocio: this.tipoSocioId,
                listaMovCuenta: this.listaMovCuenta,
                refCredito: referenciaCredito,
                listaCobrosCred: this.cobros,
                totalCaja: this.total
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (result) {

                //Valida solo cuando es traspaso.
                if (result == 5) {
                    this.spsCargaCuentasSaldo(this.cveCliente);
                    this.limpiaTotalesMov();
                    return;
                }

                //Evalua los movimientos seleccionados.
                this.evaluaMovimientos(result);

            }

        });

    }

    /**
     * Evalua movientos despues de seleccionar y cerrar modal.
     */
    evaluaMovimientos(result: any) {

        let producto: any;
        let desglose: any;
        let desgloseAdd: any = [];

        //Se agrega el monto del pago
        desglose = {
            Movimiento: result.tipoCuenta.nombreMov,
            Monto: result.monto
        };

        desgloseAdd.push(desglose);

        //Agrega la comisión
        if (result.aplicaComision) {
            desglose = {
                Movimiento: 'Comisión',
                Monto: result.comision
            };

            desgloseAdd.push(desglose);
        }


        producto = {
            "cveTipoMov": result.cveTipoMovimiento,
            "cveMovimiento": result.tipoCuenta.cveMovCaja,
            "descMovimiento": result.tipoCuenta.nombreMov,
            "monto": result.total,
            "operacion": result.operacion,
            "cveCredito": result.cveCredito,
            "cobrosID": result.cobrosID,
            "desglose": desgloseAdd
        }

        //valida movimiento existente
        let index = this.listaMovTransacciones.findIndex(res => res.cveMovimiento === result.tipoCuenta.cveMovCaja &&
            res.operacion === result.operacion);

        //Update movimiento
        if (index > -1) {

            //Reemplaza el producto.
            for (let i = 0; i < this.listaMovTransacciones.length; i++) {

                if (this.listaMovTransacciones[i].cveMovimiento === result.tipoCuenta.cveMovCaja &&
                    this.listaMovTransacciones[i].operacion === result.operacion) {
                    this.listaMovTransacciones[i] = producto;
                }

            }

            //Movimiento nuevo
        } else {

            this.listaMovTransacciones.push(producto);

        }

        //Calcula totales
        this.calculaTotales();

        this.dataSourceTransacciones = new MatTableDataSource(this.listaMovTransacciones);

    }

    /**
     * Metodo para calcular toales de movimientos
     */
    calculaTotales() {

        //Totales
        this.totalDep = 0;
        this.totalRet = 0;
        this.total = 0;

        ////////Evalua totales
        for (let listaMov of this.listaMovTransacciones) {

            if (listaMov.cveTipoMov === cDeposito) {

                this.totalDep = this.totalDep + listaMov.monto;

            } else if (listaMov.cveTipoMov === cRetiro) {

                this.totalRet = this.totalRet + listaMov.monto;

            }
        }

        //Total
        this.total = this.totalDep - this.totalRet;
    }

    /**
     * Metodo para asignar titulos al auxiliar
     *
     * @param accion 
     * @returns Retorna el titulo del modal.
     */
    titulosModalAux(accion: any) {
        let titulo: any;

        //Evalua el título
        if (accion === 1) {
            titulo = "Historial de movimientos";
        } else if (accion === 2) {
            titulo = "Depósitos";
        } else if (accion === 3) {
            titulo = "Retiros";
        } else if (accion === 4) {
            titulo = 'Pagos';
        } else if (accion === 5) {
            titulo = 'Traspasos';
        } else if (accion === 6) {
            titulo = 'Crédito';
        }

        return titulo;

    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialogPago(data: any) {

        //Valida movimientos
        if (this.validaMovimientos()) {
            return;
        }

        let titulo: any;
        let accion: any;

        //Datos pra SMS y Email.
        //let numerolada = '+52' + this.formCaja.get('telefono').value;
        let numerolada = this.formCaja.get('telefono').value;
        let correoCliente = this.formCaja.get('correoElec').value;


        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            titulo = "Pagos";
            accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(AdministracionMovimientoComponent, {
                width: '100%',
                disableClose: true,
                data: {
                    titulo: titulo,
                    accion: accion,
                    nomCliente: this.nomCliente,
                    cveCliente: this.cveCliente,
                    listaTransacciones: this.listaMovTransacciones,
                    totalDep: this.totalDep,
                    totalRet: this.totalRet,
                    total: this.total,
                    numerolada: numerolada,
                    correoCliente: correoCliente,
                    cveCaja: this.claveCaja,
                    cveCuentaCaja: this.cveCuentaCaja,
                    cajas: this.datosCaja
                }
            });


            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {


                if (result) {

                    //Carga los saldos de las cuentas cliente
                    this.spsCargaCuentasSaldo(this.cveCliente);
                    // carga pagos pendientes de credito(clave cliente)
                    this.spsPagoCredPendiente(this.cveCliente);
                    //Carga los créditos del cliente
                    this.spsCargaCreditosCli(this.cveCliente);
                    //Reset lista movimientos y totales.
                    this.limpiaTotalesMov();
                }

            });
        }
    }

    /**
     * Metodo que muestra la información del cliente
     * @param objeto Cliente
     */
    llenarDatosCliente(objeto: any) {

        // carga pagos pendientes de credito por clave de cliente
        this.spsPagoCredPendiente(objeto.numero_cliente);

        //Carga los saldos de las cuentas cliente
        this.spsCargaCuentasSaldo(objeto.numero_cliente);

        //Carga los créditos del cliente
        this.spsCargaCreditosCli(objeto.numero_cliente);

        //Cargar avisos del cliente
        this.spsAvisos();

        if (objeto.tipo_socio === 'Socio Moral') {
            this.nomCliente = objeto.razon_social;

        } else {
            this.nomCliente = objeto.nombre_cl + " " + objeto.paterno_cl + " " + objeto.materno_cl;
        }

        this.tipoSocio = objeto.tipo_socio;
        this.listaAgenda = JSON.parse(objeto.agendacl);
        this.cveCliente = objeto.numero_cliente;
        this.formCaja.get('numCliente').setValue(objeto.numero_cliente);
        //Digitalización
        this.listaDigitalizacion = JSON.parse(objeto.digitalizacion);

        //Evalua documentos
        if (!this.vacio(this.listaDigitalizacion)) {
            for (let doc of this.listaDigitalizacion) {
                //Foto
                if (doc.cv_tipodoc.trim() === cFoto) {

                    this.urlSafeFoto = this.sanitizer.bypassSecurityTrustResourceUrl(doc.documentobase64);

                    //Firma
                } else if (doc.cv_tipodoc.trim() === cFirma) {

                    this.urlSafeFirma = this.sanitizer.bypassSecurityTrustResourceUrl(doc.documentobase64);

                }
            }
        }

        if (!this.vacio(this.listaAgenda)) {
            //Datos del cliente
            this.listaAgenda.forEach(result => {
                if (result.cvejerarquia === generales.principal) {
                    this.formCaja.get('telefono').setValue(result.telefono);
                    this.formCaja.get('correoElec').setValue(result.correo);
                }
            });
        }


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
                console.log(this.listaMovCuenta,'tamaño lista',this.listaMovCuenta.length);
                console.log(this.listaMovCuenta,'this.estatusCliente',this.estatusCliente);
                if (this.listaMovCuenta.length === 0 && this.estatusCliente === true) {
                    console.log('entre modal 1')
                    Swal.fire({
                        title: '¿Desea depositar Parte Social?',
                        text: "El Cliente no cuenta con Saldo en Parte Social.",
                        icon: 'warning',
                        allowOutsideClick: false,
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Agregar',
                        cancelButtonText: 'Salir'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            this.agregaParteSocial(null);
                        }//fin confirmacion
                    })
                    return;
                }

                if (this.listaMovCuenta.length > 0 && this.estatusCliente === true) {

                    let psocial = this.listaMovCuenta.find(c => c.cveMovimiento === '0001');
                    console.log('psocial ',psocial)
                    if(!this.vacio(psocial)){
                        this.isParteSocial = true;
                    }else{
                        Swal.fire({
                            title: '¿Desea depositar Parte Social?',
                            text: "El Cliente no cuenta con Saldo en Parte Social.",
                            icon: 'warning',
                            allowOutsideClick: false,
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Agregar',
                            cancelButtonText: 'Salir'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                this.agregaParteSocial(null);
                            }//fin confirmacion
                        })
                    }

                }



            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }

    /**
     * Carga los créditos por clave de cliente
     * @param cveCliente 
     */
    spsCargaCreditosCli(cveCliente: any) {

        this.isLoadingResultsCre = true;
        this.isResultadoCre = false;

        const ids = cveCliente + "/" + 2;


        this.service.getListByArregloIDs(ids, 'listaCredCliente').subscribe(
            (data: any) => {

                this.isResultadoCre = data.length === 0;

                this.listaCredCliente = data;
                this.dataSourceCred = new MatTableDataSource(this.listaCredCliente);


                this.isLoadingResultsCre = false;

            }, error => {
                this.isLoadingResultsCre = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
     * Método para consultar los avisos de Notificaciones por cliente
     */
    spsAvisos() {
        this.firestore.collection("avisos_socios", ref => ref.where('cve', '==', this.cveCliente).where('estatus', '==', true)
        ).snapshotChanges().subscribe((res) => {
            this.listaAvisos = [];
            this.lista = [];
            if (res.length > 0) {
                res.forEach((p: any) => {
                    this.listaAvisos.push({
                        id: p.payload.doc.id,
                        descripcion: p.payload.doc.data().descripcion,
                        cve: p.payload.doc.data().cve,
                        mensaje: p.payload.doc.data().aviso,
                        vigencia: p.payload.doc.data().vigencia,
                        sucursal: p.payload.doc.data().sucursal,
                        tiposocio: p.payload.doc.data().tiposocio,
                        descTipoSocio: p.payload.doc.data().descTipoSocio,
                        estatus: p.payload.doc.data().estatus
                    });

                })
            }
            for (let i of this.listaAvisos) {
                if (i.cve == this.cveCliente) {
                    this.lista.push(i);
                }
            }
            if (!this.vacio(this.lista)) {
                //Se informa que hay Notificaciones por cliente
                this.dialog.open(listaModalComponent, {
                    width: '40%',
                    disableClose: true,
                    data: {
                        titulo: "Aviso",
                        body: this.lista

                    }

                });
            }
        });
    }

    /**
     * Método que consulta toda la lista de clientes bloqueados
     * Firebase
     */
    spsBloqueoClienteF() {
        this.firebase.lista("bloqueo_clientes").subscribe((rest) => {
            this.listaBloqueos = [];
            this.listaNotBloqueo = [];
            rest.forEach((p: any) => {
                this.listaBloqueos.push({

                    mensaje: p.payload.doc.data().motivo

                });
            })
            for (let i of this.listaBloqueos) {
                if (i.cve == this.cveCliente) {
                    this.listaNotBloqueo.push(i);
                }
            }

            if (!this.vacio(this.listaNotBloqueo)) {
                //Se informa que hay Notificaciones por cliente
                this.dialog.open(listaModalComponent, {
                    width: '40%',
                    data: {
                        titulo: "Cliente Bloqueado",
                        body: this.listaNotBloqueo

                    }

                });
            }
        });
    }

    /**
     * Metodo que lista los clientes bloqueados 
     */
    spsBloqueoClientes(data: any, accion: any) {

        //Valida cliente
        if (this.validaCliente()) {
            return;
        }

        this.blockUI.start('Cargando datos...');

        let url = this.cveCliente + "/" + 4;

        this.service.getListByID(url, 'spsBloqueoClientes').subscribe(dataset => {

            this.listaNotBloqueo = [];
            this.listaBloqueos = [];

            this.blockUI.stop();

            if (!this.vacio(dataset)) {
                dataset.forEach(element => {
                    if (!this.vacio(element.motivo)) {
                        this.listaNotBloqueo.push({ "mensaje": JSON.parse(element.motivo).descripcion })
                    }
                });
            }

            if (!this.vacio(this.listaNotBloqueo)) {
                this.blockUI.stop;
                //Se informa que hay Notificaciones por cliente
                this.dialog.open(listaModalComponent, {
                    width: '40%',
                    data: {
                        titulo: "Cliente Bloqueado",
                        body: this.listaNotBloqueo

                    }

                });

            } else {

                if (accion !== null) {
                    if (this.isParteSocial === false) {
                        Swal.fire({
                            title: '¿Desea depositar Parte Social?',
                            text: "El Cliente no cuenta con Saldo en Parte Social.",
                            icon: 'warning',
                            allowOutsideClick: false,
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Agregar',
                            cancelButtonText: 'Salir'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                //Accion a realizar si se acepta
                                this.agregaParteSocial(null);
                            }//fin confirmacion
                        })
                        return;
                    }
                    this.abrirDialogAuxiliar(data, accion);
                }

            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método para listar clientes bloqueados en el movimiento de Inversión 
     */
    spsBloqueoClientesInversion(origen: any) {
        let url = this.cveCliente + "/" + 4;
        this.service.getListByID(url, 'spsBloqueoClientes').subscribe(dataset => {
            this.listaNotBloqueoInv = [];
            this.listaBloqueosInv = [];
            if (!this.vacio(dataset)) {
                this.listaBloqueosInv.push(JSON.parse(dataset[0].motivo));

                this.listaBloqueosInv.forEach(element => {
                    if (!this.vacio(element.descripcion)) {
                        this.listaNotBloqueoInv.push({ "mensaje": element.descripcion })
                    }
                });
            }
            if (!this.vacio(this.listaNotBloqueoInv)) {
                //Se informa que hay Notificaciones por cliente
                this.dialog.open(listaModalComponent, {
                    width: '40%',
                    data: {
                        titulo: "Cliente Bloqueado",
                        body: this.listaNotBloqueoInv

                    }

                });
            } else {
                if (this.isParteSocial === false) {
                    Swal.fire({
                        title: '¿Desea depositar Parte Social?',
                        text: "El Cliente no cuenta con Saldo en Parte Social.",
                        icon: 'warning',
                        allowOutsideClick: false,
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Agregar',
                        cancelButtonText: 'Salir'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            //Accion a realizar si se acepta
                            this.agregaParteSocial(null);
                        }//fin confirmacion
                    })
                    return;
                }
                this.abrirDialogInversion(origen);
            }
        })
    }

    /**
     * Método para notificaciones 1.Globales 2.Por cliente 3.Por sucursal
     */
    spsNotificacionesGlobales() {
        this.dialog.open(NotificacionesCajaModalComponent, {
            width: '40%',
            data: {
                cveCliente: this.cveCliente
            }
        });

    }

    //Visibilidad del toggle
    toggleBadgeVisibility() {
        this.hidden = !this.hidden;
    }

    /**
     * metodo para cargar pagos pendientes de credito
     * @param cveCliente 
     */
    spsPagoCredPendiente(cveCliente: any) {

        const ids = cveCliente + "/" + 1;

        this.service.getListByArregloIDs(ids, 'ListaCobroCreditoPendiente').subscribe(
            (data: any) => {

                this.blockUI.stop;

                if (!this.vacio(data)) {
                    this.cobros = JSON.parse(data[0].datos);
                    if (!this.vacio(this.cobros)) {

                        let pagos = [];
                        this.cobros.forEach(element => {
                            if (!this.vacio(element.garantia_id) && element.estatus == false) {//si la garntia no es null y no esta cobrada
                                pagos.push({ "mensaje": element.garantia + " " + formatCurrency(element.monto, 'en-US', getCurrencySymbol('MXN', 'wide')) + " " + element.referencia });
                            } else
                                if (!this.vacio(element.comision) && element.estatus == false) {
                                    pagos.push({ "mensaje": element.descripcion + " " + formatCurrency(element.monto, 'en-US', getCurrencySymbol('MXN', 'wide')) + " " + element.referencia + "\n " });

                                }

                        });
                        if (!this.vacio(pagos)) {
                            //Se informa que hay pagos a cubrir
                            this.dialog.open(listaModalComponent, {
                                disableClose: true,
                                width: '40%',
                                data: {
                                    titulo: "Pagos a cubrir",
                                    body: pagos
                                }
                            });
                        }
                    }
                }
            }, error => {
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
      * Metodo que valida si va vacio.
      * @param value 
      * @returns 
      */
    vacio(value: any) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    /**
     * Limpia el formulario general.
     */
    limpiaGeneral() {

        this.formCaja.reset();

        //Cuentas cliente
        this.listaMovCuenta = [];
        this.dataSourceCuentas = new MatTableDataSource(this.listaMovCuenta);

        //Créditos cliente
        this.listaCredCliente = [];
        this.dataSourceCred = new MatTableDataSource(this.listaCredCliente);


        this.cveCliente = null;
        this.nomCliente = null;
        this.tipoSocio = null;

        this.limpiaTotalesMov();

        //Foto
        this.urlSafeFoto = this.sanitizer.bypassSecurityTrustResourceUrl('');
        this.urlSafeFirma = this.sanitizer.bypassSecurityTrustResourceUrl('');

    }

    /**
     * Limpia movimientos y totales.
     */
    limpiaTotalesMov() {
        this.listaMovTransacciones = [];
        this.dataSourceTransacciones = new MatTableDataSource(this.listaMovTransacciones);

        //Totales
        this.totalDep = 0;
        this.totalRet = 0;
        this.total = 0;
    }


    /** 
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
     */
    validaciones = {
        'monto': [
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ]
    };

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {           //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);           //3
            if (control instanceof UntypedFormControl) {           //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {      //{5}
                this.validateAllFormFields(control);        //{6}
            }
        });
    }


    /**
     *  Valida cliente
     * @returns 
     */
    validaCliente() {

        //Valida cliente
        if (this.cveCliente === null) {
            this.service.showNotification('top', 'right', 3, this.clienteMessage);
            return true;
        }

        return false;

    }

    /**
     *  Valida movimientos
     * @returns 
     */
    validaMovimientos() {

        //Valida Movimientos
        if (this.listaMovTransacciones.length === 0) {
            this.service.showNotification('top', 'right', 3, this.movimentosMessage);
            return true;
        }

        return false;

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
                body: "Se eliminará el movimiento (" + elemento.descMovimiento + ") de la tabla."
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar
                this.eliminar(elemento);
            }
        });

    }

    /***
     * metodo para remover datos de la lista de activos
     */
    eliminar(valor: any) {
        let index = this.listaMovTransacciones.findIndex(res => res.cveMovimiento === valor.cveMovimiento);
        this.listaMovTransacciones.splice(index, 1);
        this.dataSourceTransacciones = new MatTableDataSource(this.listaMovTransacciones);

        //Caltula totales
        this.calculaTotales();
    }

    /**
     * Método para validar los mensajes.
     */
    public validacion_msj = {
        'sucursal': [
            { type: 'required', message: 'Sucursal origen requerida.' }
        ]

    }

    /**
     * Metodo para abrir el dialogo de cierre caja.
     */
    abrirDialogCierre() {

        this.dialog.open(ModalCerrarCajaComponent, {
            width: '70%',
            data: {
                cajas: this.datosCaja,
                depositos: this.totalDep,
                retiros: this.totalRet
            }
        });

    }

    /**
     * Metodo que abre el modal para inversiones
     * @param origen - inversion desde cajas
     */
    abrirDialogInversion(origen: any) {

        //Valida cliente
        if (this.validaCliente()) {
            return;
        }


        const inversion = this.dialog.open(CrudInversionComponent, {
            disableClose: true,
            data: {
                datosCliente: this.datosCliente,
                tipoPersona: this.tipoPersona,
                origen: origen,
                caja: this.datosCaja
            }
        });

        //Se usa para cuando cerramos
        inversion.afterClosed().subscribe(result => {
            //Carga los saldos de las cuentas cliente
            this.spsCargaCuentasSaldo(this.cveCliente);
            // carga pagos pendientes de credito(clave cliente)
            this.spsPagoCredPendiente(this.cveCliente);
            //Carga los créditos del cliente
            this.spsCargaCreditosCli(this.cveCliente);
            //Reset lista movimientos y totales.
            this.limpiaTotalesMov();
        });
    }


    /**
     * Metodo para abrir el dialogo de cierre caja.
     */
    abrirDialogTrBoveda() {

        this.dialog.open(ModalTrBovedaComponent, {
            width: '70%',
            data: {
                cajas: this.datosCaja
            }
        });

    }

    /**
     * Metodo para abrir el dialogo de gastos
     */
    abrirDialogGastos() {


        this.dialog.open(ModalGastosCajaComponent, {
            width: '70%',
            data: {
                cajas: this.datosCaja
            }
        });

    }

    /**
     * Metodo que abre el modal para SPei
     * @param origen - inversion desde cajas
     */
    abrirDialogSPEI() {

        //Valida cliente
        if (this.validaCliente()) {
            return;
        }


        this.dialog.open(SpeiComponent, {
            disableClose: true,
            width: '100%',
            data: {
                datosCliente: this.datosCliente,
                listaMovCuenta: this.listaMovCuenta,
                tipoPersona: this.tipoPersona
            }
        });
    }


    abrirDialogTAE() {
        const refTAE = this.dialog.open(TAEComponent, {
            disableClose: true,
            width: '100%'
        });
        //Se usa para cuando cerramos
        refTAE.afterClosed().subscribe(result => {

            if (!this.vacio(result)) {

                let producto: any;
                let desglose: any;
                let desgloseAdd: any = [];

                //Se agrega el monto del pago
                desglose = {
                    Movimiento: result.mov.nombreMovimiento,
                    Monto: result.recarga.montoRecarga.monto
                };

                desgloseAdd.push(desglose);

                let total: number;
                //Agrega la comisión
                if (result.mov.ex2MovCaja.aplicaComision) {
                    desglose = {
                        Movimiento: 'Comisión',
                        Monto: result.mov.ex2MovCaja.saldoComision
                    };
                    total = result.recarga.montoRecarga.monto + result.mov.ex2MovCaja.saldoComision
                    desgloseAdd.push(desglose);
                } else {
                    total = result.recarga.montoRecarga.monto;
                }


                producto = {
                    "cveTipoMov": "01",
                    "cveMovimiento": result.mov.cveMovCaja,
                    "descMovimiento": result.mov.nombreMovimiento,
                    "monto": total,
                    "operacion": "+",
                    "cveCredito": null,
                    "cobrosID": 0,
                    "desglose": desgloseAdd,
                    "servicio": result
                }

                //valida movimiento existente
                let index = this.listaMovTransacciones.findIndex(res => res.cveMovimiento === result.tipoCuenta.cveMovCaja &&
                    res.operacion === result.operacion);

                //Update movimiento
                if (index > -1) {

                    //Reemplaza el producto.
                    for (let i = 0; i < this.listaMovTransacciones.length; i++) {

                        if (this.listaMovTransacciones[i].cveMovimiento === result.tipoCuenta.cveMovCaja &&
                            this.listaMovTransacciones[i].operacion === result.operacion) {
                            this.listaMovTransacciones[i] = producto;
                        }

                    }

                    //Movimiento nuevo
                } else {

                    this.listaMovTransacciones.push(producto);

                }

                //Calcula totales
                this.calculaTotales();

                this.dataSourceTransacciones = new MatTableDataSource(this.listaMovTransacciones);

            } else {
                this.service.showNotification('top', 'right', 3, 'No se agrego movimiento.');
            }

        });
    }

    abrirDialogMTCServ() {
        const refTAE = this.dialog.open(ServiciosMTCComponent, {
            disableClose: true,
            width: '100%'
        });
        //Se usa para cuando cerramos
        refTAE.afterClosed().subscribe(result => {

            if (!this.vacio(result)) {

                let producto: any;
                let desglose: any;
                let desgloseAdd: any = [];

                //Se agrega el monto del pago
                desglose = {
                    Movimiento: result.mov.nombreMovimiento,
                    Monto: result.servicio.monto
                };

                desgloseAdd.push(desglose);

                let total: number;
                //Agrega la comisión
                if (result.mov.ex2MovCaja.aplicaComision) {
                    desglose = {
                        Movimiento: 'Comisión',
                        Monto: result.mov.ex2MovCaja.saldoComision
                    };
                    total = result.servicio.monto + result.mov.ex2MovCaja.saldoComision
                    desgloseAdd.push(desglose);
                } else {
                    total = result.servicio.monto;
                }

                producto = {
                    "cveTipoMov": "01",
                    "cveMovimiento": result.mov.cveMovCaja,
                    "descMovimiento": result.mov.nombreMovimiento,
                    "monto": total,
                    "operacion": "+",
                    "cveCredito": null,
                    "cobrosID": 0,
                    "desglose": desgloseAdd,
                    "servicio": result
                }

                //valida movimiento existente
                let index = this.listaMovTransacciones.findIndex(res => res.cveMovimiento === result.tipoCuenta.cveMovCaja &&
                    res.operacion === result.operacion);

                //Update movimiento
                if (index > -1) {

                    //Reemplaza el producto.
                    for (let i = 0; i < this.listaMovTransacciones.length; i++) {

                        if (this.listaMovTransacciones[i].cveMovimiento === result.tipoCuenta.cveMovCaja &&
                            this.listaMovTransacciones[i].operacion === result.operacion) {
                            this.listaMovTransacciones[i] = producto;
                        }

                    }

                    //Movimiento nuevo
                } else {

                    this.listaMovTransacciones.push(producto);

                }

                //Calcula totales
                this.calculaTotales();

                this.dataSourceTransacciones = new MatTableDataSource(this.listaMovTransacciones);

            } else {
                this.service.showNotification('top', 'right', 3, 'No se agrego movimiento.');
            }

        });

    }

    agregaParteSocial(datos: any) {


        this.blockUI.start('Cargando datos...');

        const ids = this.vCveSucursal + "/" + this.cveCliente + "/" + 3;

        this.service.getListByArregloIDs(ids, 'listTipoMovDR').subscribe(data => {
            this.blockUI.stop();
            //Sucursales
            let cuenta = data[0];

            console.log(cuenta);


            if(this.vacio(cuenta)){
                this.service.showNotification('top', 'right', 3, 'No existe Mov. Parte Social.');
                return;
            }
   
            let producto: any;
                let desglose: any;
                let desgloseAdd: any = [];

                //Se agrega el monto del pago
                desglose = {
                    Movimiento: cuenta.nombreMov,
                    Monto: cuenta.montoMinimo
                };

                desgloseAdd.push(desglose);

                let total: number;
                //Agrega la comisión
                if (cuenta.extMovCajDR.aplicaComision) {
                    desglose = {
                        Movimiento: 'Comisión',
                        Monto: cuenta.extMovCajDR.saldoComision
                    };
                    total = cuenta.montoMinimo + cuenta.extMovCajDR.saldoComision
                    desgloseAdd.push(desglose);
                } else {
                    total = cuenta.montoMinimo;
                }

                producto = {
                    "cveTipoMov": "01",
                    "cveMovimiento": cuenta.cveMovCaja,
                    "descMovimiento": cuenta.nombreMov,
                    "monto": total,
                    "operacion": "+",
                    "cveCredito": null,
                    "cobrosID": 0,
                    "desglose": desgloseAdd,
                    "servicio": ''
                }

                //valida movimiento existente
                let index = this.listaMovTransacciones.findIndex(res => res.cveMovimiento === cuenta.cveMovCaja &&
                    res.operacion === '+');

                //Update movimiento
                if (index > -1) {

                   
                    for (let i = 0; i < this.listaMovTransacciones.length; i++) {

                        if (this.listaMovTransacciones[i].cveMovimiento === cuenta.cveMovCaja &&
                            this.listaMovTransacciones[i].operacion === '+') {
                            this.listaMovTransacciones[i] = producto;
                        }

                    }

             
                } else {

                    this.listaMovTransacciones.push(producto);

                }

                //Calcula totales
                this.calculaTotales();

                this.dataSourceTransacciones = new MatTableDataSource(this.listaMovTransacciones);

            
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });


    }


    abrirDialogReferencia() {

        const referencia = this.dialog.open(ReferenciaMTCComponent, {
            disableClose: true,
            width: '100%'
        });
        //Se usa para cuando cerramos
        referencia.afterClosed().subscribe(result => {

        });

    }


}
