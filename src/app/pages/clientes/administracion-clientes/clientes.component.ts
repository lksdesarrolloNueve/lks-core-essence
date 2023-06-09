import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { debounceTime, map, startWith } from "rxjs/operators";
import { CombosClienteService, GestionGenericaService } from "../../../shared/service/gestion";
import { environment } from '../../../../environments/environment';
import { globales } from '../../../../environments/globales.config';
import { MatAccordion } from "@angular/material/expansion";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { BuscarEmpresaComponent } from "../../../pages/modales/empresa-modal/buscar-empresa.component";
import { MatStepper } from "@angular/material/stepper";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { DocumentosModalComponent } from "../../../../app/pages/modales/documentos-modal/documentos-modal.component";
import { DomSanitizer } from "@angular/platform-browser";
import { PermisosService } from "../../../shared/service/permisos.service";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { EncryptDataService } from "../../../shared/service/encryptdata";
import { SolicitudModalComponent } from "../../../pages/modales/solicitud-modal/solicitud-modal.component";
import { ModalSolicitudSucursalComponent } from "../solicitudes/modal-solicitud/modal-solicitud-sucursal.component";
import { ModalPldComponent } from "./modal-pld/modal-pld.component";
import Swal from 'sweetalert2';
import * as moment from "moment";



@Component({
    selector: 'clientes',
    moduleId: module.id,
    templateUrl: 'clientes.component.html',
    styleUrls: ['clientes.component.css']

})
/**
 * @autor: Jasmin Santana, Guillermo Juarez
 * @version: 1.0.0
 * @fecha: 25/10/2021
 * @descripcion: Componente para la gestion de clientes
 */
export class ClientesAComponent implements OnInit {
    @ViewChild(MatAccordion) accordion: MatAccordion;
    @ViewChild('stepper') stepper: MatStepper;
    //Declaracion de variables y componentes

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;





    @BlockUI() blockUI: NgBlockUI;
    CurrentDate = new Date();
    btnAddContact: string = "Agregar  contacto";
    nombreTab: string = "Datos Generales";
    //Forms
    formEncabezado: UntypedFormGroup;
    formDatosG: UntypedFormGroup;//Datos generales del cliente
    formDomicilioCl: UntypedFormGroup;//Domicilios del cliente
    formPerfilTransacional: UntypedFormGroup;//Perfil transaccional del cliente
    formReferencias: UntypedFormGroup;//Datos generales Referencia
    formDomicilioRefe: UntypedFormGroup;//Domicilio referencia
    formEmpleoCl: UntypedFormGroup;
    formEmpleo: UntypedFormGroup;//Empleo referencia
    formAgendaCliente: UntypedFormGroup; //Formulario para la gestion de agenda de cliente


    actEmpresarial = new UntypedFormControl(false,);
    //Controls encabezado
    today = new Date();
    parentescoRef: any = "";
    sumaPorcent: number = 0;
    //Combos
    listaGenero: any = [];
    listaJerarquia: any = [];
    listaIdentificacion: any = [];
    listaCalidadExt: any = [];
    listaParentesco: any = [];
    listaTipoReferencia: any = [];
    listaEstCivil: any = [];
    listaTiempoArraigo: any = [];
    listaContrato: any = [];
    /**combos PERFIL */
    listaNivelEscolar: any = [];
    listaRegimenMatrimonial: any = [];
    listaTipoVivienda: any = [];
    listaActividadRealiza: any = [];
    listaMedioDifusion: any = [];
    listaVinculosA: any = [];
    listaTipoBien: any = [];
    listaTipoServicio: any = [];
    listaManejoCtas: any = [];
    listaFinalidadCta: any = [];
    listaTipoIngreso: any = [];
    listaTipoPlazo: any = [];
    listaTipoEgreso: any = [];
    listaOrigenIngresos: any = [];

    //Termina combos
    //empresa
    listaEmpresa: any = [];
    opcionesEmpresa: Observable<string[]>;
    opcionesEmpresaCL: Observable<string[]>;
    //arreglos
    listAddAgenCl: any = [];//Agenda cliente
    listAddDom: any = [];// Domicilios cliente
    nacionalidadPLD: string = "";
    estadoBuro: string = "";
    ciudadId: number = 0;
    //listaAddDomRef: any = [];//Se usa en caso de q sea el mismo domicilio
    listAddEmp: any = [];//empleo cliente mostrar front
    inicioLabor: string = "";
    //listAddEmpCl: any = [];//lista empleos cliente para back
    listAddReferencias: any = [];//refencias del cliente
    listAddSerivicios: any = [];
    listAddVinculos: any = [];
    listAddFcuenta: any = [];
    listAddMcuenta: any = [];
    listRefEncontrada: any = [];
    //IDs a ocupar
    solicitudID: number = 0;
    perfilID: number = 0;
    sujetoID: number = 0;
    identificaionID: number = 0;
    agendaID: number = 0;
    clienteID: number = 0;
    domID: number = 0;
    bienesID: number = 0;
    empleoID: number = 0;
    identificacionID = 0;
    refenciaID: number = 0;
    sujetoIDR: number = 0;
    agendaIDR: number = 0;
    identificacionIDR: number = 0;
    domIDR: number = 0;
    empleoIDR: number = 0;
    extranjeroID: number = 0;
    moralID: number = 0;
    empresaID: number = 0;
    detalleEmId: number = 0;
    personaJuridica: string = '55PF';//Saber si es persona Fisica  o Extranjera 
    docCodificadoID: number = 0;


    //Declaracion Listas Perfil Transaccional
    opcionesComprobante = [];
    cuentaCEmpleo = false; // combo para seleccionar si cuenta con empleo el cliente.
    empleoReferenciaCtrl = new UntypedFormControl('', [Validators.required]);
    actvRealiza = true; // Combo para seleccionar actividad realiza (Desempleo).
    ocultarFormEmpleoCl: boolean = true;
    comprobacionIngresos = new UntypedFormControl('', [Validators.required]);
    origenIngreso = new UntypedFormControl('', { validators: [Validators.required] });
    tipoPlazo = new UntypedFormControl('', { validators: [Validators.required] });

    //Ingresos-Egresos
    listAddIngreso: any = [];
    formIngresos: UntypedFormGroup;
    listAddEgreso: any = [];
    formEgresos: UntypedFormGroup;

    //Lista Bienes
    mostrarEscritura = false;
    mostrarAuto = false;
    mostrarOtroBien = false;
    formBienes: UntypedFormGroup;
    listAddBienes: any = [];

    //Fin Declaracion Perfil Transaccional

    /**Mostrar/Ocultar */
    extranjero: boolean = false;
    domtbl: boolean = false;
    agentbl: boolean = false;
    refetbl: boolean = false;
    empltbl: boolean = false;//mostrar tbl empleos cliente
    mismoDomicilio: boolean = false;//saber si la referencia cuenta con el mismo domicilio
    /** Controles Nacionalidad de nacimiento**/
    listaNac: any = [];//listaNacionalidad nacimiento
    nacionalidadId: number = 0;
    opcionesNac: Observable<string[]>;// Nacimiento
    opcionesNacRe: Observable<string[]>;//Nacionalidad nacimiento referencia
    /** Controles Nacionalidad de domicilio**/
    opcionesNacionalidad: Observable<string[]>;//Domicilio    
    opcionesNacionalidadRefe: Observable<string[]>;//Nacionalidad dom referencia

    /** Controles Estados **/
    listaEstadosNac: any;
    opcionesEstadoNac: Observable<string[]>;//Nacimiento
    opcionesEstadoNacRe: Observable<string[]>;//Estado nac referencia
    /** Controles estado de domicilio**/
    opcionesEstado: Observable<string[]>;//Domicilio
    opcionesEstadoR: Observable<string[]>;//estado domicilio referencia
    //estado seleccionado
    selectedIdEstadoNac: number = 0;
    selectedIdEstado: number = 0;
    idEstSel: number = 0;//controla el estado seleccionado
    seleccionEstNacRe: number = 0;//estado nacimento referencia
    seleccionEstadoRefe: number = 0;//estado referencia  

    /** Controles Ciudad **/
    listaCiudadNac: any = [];
    opcionesCiudadesNac: Observable<string[]>;
    opcionesCiudadesRe: Observable<string[]>;//ciudad refencia
    /** Controles ciudad de domicilio**/
    opcionesCiudades: Observable<string[]>;
    opcionesCiudadesDomRe: Observable<string[]>;//ciudad refencia
    controlCd: number = 0;//controla la asignacion de ciudad
    selectedIdCiudad: number = 0;//domicilio Cliente
    selectedIdCiudadR: number = 0;//domicilio REFEENCIA
    seleccionCd: number = 0;//controla la ciudad seleccionada

    /** Controles Colonia **/
    listaColonias: any = [];
    opcionesColonias: Observable<string[]>;//domicilio cliente
    opcionesColoniasR: Observable<string[]>;//domicilio REFE
    selectedIdLocalidad: number = 0;//listaColoniaCiudad recibe 2° parametro

    /** Controles Tiempo Arraigo **/
    arraigoGeneralId: any;
    //Ocupaciones SINCO
    listaSINCO: any = [];
    opcionesSINCO: Observable<string[]>;
    opcionesSINCOCL: Observable<string[]>;//empleo cliente
    opcionesProfesion: Observable<string[]>;
    titulo: string = '';
    accion: number = 0;
    //Digitalizacion Form
    listaDocTipoSocios: any = []; // lista para digitalizacion
    listaTipoSocios: any = []; // lista para digitalizacion
    formDigitalizacion: UntypedFormGroup;//Digitalizacion
    listaDocAgregados: any = []; // lista para digitalizacion
    public previsualizacion: string;
    //Correo 
    correoCli = '';
    isLoadingResults: boolean = false;
    isResultado: boolean = false;
    listaEmisor = [];
    listaEmisorCorreo = [];
    /**Control de tabs para la actualizacion */
    datoGeneralTab: boolean = false;
    domicilioTab: boolean = false;
    perfilTab: boolean = false;
    perfilInfTab: boolean = false;
    perfilIngTab: boolean = false;
    perfilEmpTab: boolean = false;
    refeTab: boolean = false;
    digitaTab: boolean = false;
    btnActualizar: boolean = false;
    tabIndex: number = 0;
    soActId: number = 0;
    pocion: number = 0;
    bandera: boolean = false;
    //reporte
    listaPersonal: any = [];
    listaLaboral: any = [];
    listaBeneficiario: any = [];
    listaRefenciaPersonal:any = [];
    nomCiudad: string = '';
    nomEstado: string = '';
    nomLocalidad: string = '';
    nomTiempoA: string = '';
    nomSucursal: string = '';
    constructor(private servicePermisos: PermisosService, private serviceCombo: CombosClienteService, private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, public dialog: MatDialog, private encripta: EncryptDataService, private sanitizer: DomSanitizer) {
        //encabezado com 
        this.formEncabezado = this.formBuilder.group(
            {
                numCliente: new UntypedFormControl(0),
                cliente: new UntypedFormControl(),
                perfilRiesgo: new UntypedFormControl(),
                fechSolicitud: new UntypedFormControl(this.today.toLocaleDateString()),
                numSolicitud: new UntypedFormControl(0),
                tipoCliente: new UntypedFormControl(),
                estatusAct: new UntypedFormControl()
            });
        //Validaciones del formulario 
        this.formDatosG = this.formBuilder.group(
            {
                apeP: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
                apeM: new UntypedFormControl('',),
                nombres: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
                fechaN: new UntypedFormControl('', [Validators.required]),
                edad: new UntypedFormControl('0',),
                genero: new UntypedFormControl('', [Validators.required]),
                rfc: new UntypedFormControl(''),
                nacionalidadNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                entFedeNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                curp: new UntypedFormControl('', [Validators.pattern(/^[A-Z]{4}\d{6}[H,M][A-Z]{5}[A-Z0-9]{2}$/)]),
                mpNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                extranjero: new UntypedFormControl(false),
                tipoI: new UntypedFormControl('', [Validators.required]),
                claveIde: new UntypedFormControl('', [Validators.required]),
                vigenciaIde: new UntypedFormControl(new Date()),
                calidad: new UntypedFormControl('',),
                pasaporte: new UntypedFormControl(''),
                permiso: new UntypedFormControl('')
            });
        this.formDomicilioCl = this.formBuilder.group({
            calle: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle1: new UntypedFormControl('', [Validators.maxLength(150)]),
            entreCalle2: new UntypedFormControl('', [Validators.maxLength(150)]),
            referencia: new UntypedFormControl('', [Validators.maxLength(250)]),
            numeroExterior: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            numeroInterior: new UntypedFormControl('',),
            estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            localidad: new UntypedFormControl({ value: '', disabled: true }),
            catColonia: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catNacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            latitud: new UntypedFormControl('',),
            longitud: new UntypedFormControl('',),
            resExtranjera: new UntypedFormControl(false),
            tiempoArraigo: new UntypedFormControl('', [Validators.required]),
            jerarquia: new UntypedFormControl('', [Validators.required]),
            cp: new UntypedFormControl('',)

        });
        //perfil Transaccional
        this.formPerfilTransacional = this.formBuilder.group({
            actividadRealiza: new UntypedFormControl('', [Validators.required]),
            tipoServicio: new UntypedFormControl('', { validators: [Validators.required] }),
            manejaCuentas: new UntypedFormControl(''),
            finalidadesCuenta: new UntypedFormControl('', { validators: [Validators.required] }),
            numDependientes: new UntypedFormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern('[0-9]*')]),
            estado_civil: new UntypedFormControl('', { validators: [Validators.required] }),
            regimenMatrimonial: new UntypedFormControl('', { validators: [Validators.required] }),
            nivelEstudios: new UntypedFormControl('', { validators: [Validators.required] }),
            tipoVivienda: new UntypedFormControl('', { validators: [Validators.required] }),
            medioEntero: new UntypedFormControl(''),
            periodicidadMovimientos: new UntypedFormControl('', { validators: [Validators.required] }),
            profesion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            montoAproxAhorrar: new UntypedFormControl('', [Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            montoAproxRetirar: new UntypedFormControl('', [Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            numeroOperacion: new UntypedFormControl('', [Validators.maxLength(2), Validators.pattern('[0-9]*')]),
            vinculosAdicionales: new UntypedFormControl('',)


        });
        //Forms ingresos
        this.formIngresos = this.formBuilder.group({

            ingreso: new UntypedFormControl('', [Validators.required]),
            monto_ingreso: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')])
        });
        //form Egresos
        this.formEgresos = this.formBuilder.group({
            tipo_egreso: new UntypedFormControl('', [Validators.required]),
            monto_egreso: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')])
        });
        //form para Bienes
        this.formBienes = this.formBuilder.group({
            bienesMateriales: new UntypedFormControl('',),
            valor_aprox: new UntypedFormControl('',),
            num_escritura_factura: new UntypedFormControl('',),
            modelo: new UntypedFormControl('',),
            marca: new UntypedFormControl('',),
            otrobien: new UntypedFormControl('',)
        });
        this.formEmpleoCl = this.formBuilder.group({
            razonsocialCl: new UntypedFormControl('',),
            entradaCl: new UntypedFormControl('',),
            salidaCl: new UntypedFormControl('',),
            rfcEmpresaCl: new UntypedFormControl('',),
            contratoEmCl: new UntypedFormControl('', [Validators.required]),
            inicioLaborar: new UntypedFormControl('', [Validators.required]),
            ocupacionCl: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            descripcion: new UntypedFormControl('',),
            empresaTCl: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            repEmpresa: new UntypedFormControl('',),
            jerarquiaEmpCl: new UntypedFormControl('', [Validators.required])

        });

        this.formReferencias = this.formBuilder.group({
            tpReferencia: new UntypedFormControl('', [Validators.required]),
            apePre: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
            apeMre: new UntypedFormControl('',),
            nombresRe: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
            fechaNre: new UntypedFormControl('', [Validators.required]),
            edadRe: new UntypedFormControl('0',),
            generoRe: new UntypedFormControl('', [Validators.required]),
            rfcRe: new UntypedFormControl(''),
            nacionalidadNacRef: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            entFedeNacRe: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            curpRe: new UntypedFormControl('', Validators.pattern(/^[A-Z]{4}\d{6}[H,M][A-Z]{5}[A-Z0-9]{2}$/)),
            mpNacRe: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            celRe: new UntypedFormControl('', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]),
            emailRe: new UntypedFormControl('', { validators: [Validators.pattern('^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+)+((\.)[a-z]{2,})+$')] }),
            tipoIRe: new UntypedFormControl('', [Validators.required]),
            claveIdeRe: new UntypedFormControl('', [Validators.required]),
            vigenciaIdeRe: new UntypedFormControl(new Date()),
            civil: new UntypedFormControl('', [Validators.required]),
            parentesco: new UntypedFormControl('', [Validators.required]),
            porcentaje: new UntypedFormControl('', [Validators.required, Validators.maxLength(3), Validators.pattern('[0-9]*')])
        });
        this.formDomicilioRefe = this.formBuilder.group({
            calleR: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle1R: new UntypedFormControl('', [Validators.maxLength(150)]),
            entreCalle2R: new UntypedFormControl('', [Validators.maxLength(150)]),
            referenciaR: new UntypedFormControl('', [Validators.maxLength(250)]),
            numeroExteriorR: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            numeroInteriorR: new UntypedFormControl('',),
            estadoR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudadR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            localidadR: new UntypedFormControl({ value: '', disabled: true }),
            coloniaR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            nacionalidadRef: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            latitudR: new UntypedFormControl('',),
            longitudR: new UntypedFormControl('',),
            resExtranjeraR: new UntypedFormControl(false),
            tiempoArraigoR: new UntypedFormControl('', [Validators.required]),
            jerarquiaR: new UntypedFormControl('', [Validators.required]),
            cpRef: new UntypedFormControl('',)
        });
        this.formEmpleo = this.formBuilder.group({
            razonSocial: new UntypedFormControl('',),
            entrada: new UntypedFormControl(''),
            salida: new UntypedFormControl(''),
            rfcEmpresa: new UntypedFormControl(''),
            contratoEm: new UntypedFormControl('', [Validators.required]),
            inicioLabor: new UntypedFormControl('', [Validators.required]),
            ocupacion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            descripcion: new UntypedFormControl('',),
            empresaT: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            repreEmpresa: new UntypedFormControl('')
        });
        this.formDigitalizacion = this.formBuilder.group({
            tipoSocio: new UntypedFormControl('', [Validators.required])

        });

        this.formAgendaCliente = this.formBuilder.group({
            tel: new UntypedFormControl('', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]),
            tipoCont: new UntypedFormControl('',),
            email: new UntypedFormControl('', { validators: [Validators.pattern('^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+)+((\.)[a-z]{2,})+$')] }),

        });
        //LocalStorage 
        if (localStorage.getItem('generales')) {
        //JSON.parse(localStorage.getItem('generales'));
    
  }
    }

    /**
    * Metodo OnInit de la clase
    */
    ngOnInit() {
        this.opcionesComprobante = [
            { id: true, desc: 'Si' },
            { id: false, desc: 'No' }];
        this.spsNacionalidadNac();
        this.spsOcupacionesSINCO();
        this.spsEmpresas();
        this.spsDatosCorreo();
    }
    //Use ngDoCheck cuando desee capturar cambios que Angular no haría de otra manera.
    //ngDoCheck(){
    /*    ngAfterViewChecked(){

        this.cargaCombos();
      }*/

    cargaCombos() {
        this.listaGenero = this.serviceCombo.listaGenero;
        this.listaTiempoArraigo = this.serviceCombo.listaTiempoArraigo;
        this.listaJerarquia = this.serviceCombo.listaJerarquia;
        this.listaIdentificacion = this.serviceCombo.listaIdentificacion;
        this.listaCalidadExt = this.serviceCombo.listaCalidadExt;
        this.listaTipoReferencia = this.serviceCombo.listaTipoReferencia;
        this.listaParentesco = this.serviceCombo.listaParentesco;
        this.listaEstCivil = this.serviceCombo.listaEstCivil;
        this.listaContrato = this.serviceCombo.listaContrato;
        //Perfil Transaccional
        this.listaNivelEscolar = this.serviceCombo.listaNivelEscolar;
        this.listaRegimenMatrimonial = this.serviceCombo.listaRegimenMatrimonial;
        this.listaTipoVivienda = this.serviceCombo.listaTipoVivienda;
        this.listaActividadRealiza = this.serviceCombo.listaActividadRealiza;
        this.listaTipoPlazo = this.serviceCombo.listaTipoPlazo;
        this.listaMedioDifusion = this.serviceCombo.listaMedioDifusion;
        this.listaVinculosA = this.serviceCombo.listaVinculosA;
        this.listaTipoBien = this.serviceCombo.listaTipoBien;
        this.listaTipoServicio = this.serviceCombo.listaTipoServicio;
        this.listaManejoCtas = this.serviceCombo.listaManejoCtas;
        this.listaFinalidadCta = this.serviceCombo.listaFinalidadCta;
        this.listaTipoIngreso = this.serviceCombo.listaTipoIngreso;
        this.listaTipoEgreso = this.serviceCombo.listaTipoEgreso;
        this.listaOrigenIngresos = this.serviceCombo.listaOrigenIngresos;
        this.listaTipoSocios = this.serviceCombo.listaTipoSocios;
    }

    /**Mostrar ocultar extranejo */
    esExtranjero(event) {
        if (event === true) {
            //mostrar campos extranjero
            this.extranjero = true;
        } else {
            //ocultar campos extranjero
            this.extranjero = false;
        }
    }
    /**
* Metodo para cambiar el nombre del tab acorde a donde este trabajando el usuario
* @param changeEvent contiene el elemento tab con sus propiedades
* */
    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        this.nombreTab = changeEvent.tab.textLabel;
        //Guardar Local

    }
    guardarLocal(){
        //localStorage.setItem('generales', JSON.stringify(this.storage));
    }
    /**
     * Metodo para abrir la pagina de verificar rfc o curp 
     * @param accion 1 Abre RFC, 2 CURP
     */
    pagina(accion: number) {
        if (accion == 1) {
            window.open('https://agsc.siat.sat.gob.mx/PTSC/ValidaRFC/index.jsf', "_blank");
        } else {
            window.open('https://www.gob.mx/curp/', "_blank");
        }

    }
    /**
     * Validar que la fecha de la curp y rfc sean iguales
     */
    validaCurpRfc(accion) {
        if (accion == 1) {
            let nacimiento = moment(this.formDatosG.get('fechaN').value).format('YYMMDD')
            let rfc = this.formDatosG.get('rfc').value.substring(4, 10);
            let curp = this.formDatosG.get('curp').value.substring(4, 10);
            if (nacimiento != rfc || nacimiento != curp) {
                this.service.showNotification('top', 'right', 3, "La fecha de nacimiento no corresponden con RFC o CURP.");
            }
            if (rfc != curp) {
                this.service.showNotification('top', 'right', 3, "Las fechas en RFC o CURP no corresponden.");
            }
            this.formatoRFC(this.formDatosG.get('rfc').value);

        } else if (accion == 2) {
            let nacimiento = moment(this.formReferencias.get('fechaNre').value).format('YYMMDD')
            let rfc = this.formReferencias.get('rfcRe').value.substring(4, 10);
            let curp = this.formReferencias.get('curpRe').value.substring(4, 10);
            if (nacimiento != rfc || nacimiento != curp) {
                this.service.showNotification('top', 'right', 3, "La fecha de nacimiento no corresponden con RFC o CURP.");
            }
            if (rfc != curp) {
                this.service.showNotification('top', 'right', 3, "Las fechas en RFC o CURP no corresponden.");
            }
            this.formatoRFC(this.formReferencias.get('rfcRe').value);
        }



    }
    /**Valida el formato del RFC sin y con homoclave */
    formatoRFC(rfc) {
        this.formDatosG.get('rfc').setValidators(null);
        this.formDatosG.get('rfc').updateValueAndValidity();
        this.formReferencias.get('rfcRe').setValidators(null);
        this.formReferencias.get('rfcRe').updateValueAndValidity();
        // Si el RFC tiene homoclave, verifica que sea válida
        if (rfc.length === 13) {
            this.formDatosG.get('rfc').setValidators(Validators.pattern(/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/));
            this.formDatosG.get('rfc').updateValueAndValidity();
            this.formReferencias.get('rfcRe').setValidators(Validators.pattern(/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/));
            this.formReferencias.get('rfcRe').updateValueAndValidity();

        } else {
            this.formDatosG.get('rfc').setValidators(Validators.pattern(/^[A-Z]{4}\d{6}$/));
            this.formDatosG.get('rfc').updateValueAndValidity();
            this.formReferencias.get('rfcRe').setValidators(Validators.pattern(/^[A-Z]{4}\d{6}$/));
            this.formReferencias.get('rfcRe').updateValueAndValidity();
        }
    }
    /**
     * Obtiene el perfil de riesgo de la persona que se registea o el cliente 
     * Accion 1 cuando se registra accion 2 cuando es cliente
     */
    spsPerfilRiesgo() {
        this.blockUI.start('Cargando datos...');
        let accion = 1;
        if (this.formEncabezado.get('numCliente').value != 0) {
            accion = 2;
        }
        if (this.vacio(this.formDatosG.get('nombres').value)) {
            this.service.showNotification('top', 'right', 3, 'Debes ingresar los datos a buscar.');
            this.blockUI.stop();
            return;
        }
        let datos = {
            "datos": [this.formEncabezado.get('numCliente').value,//No.cliente
            this.formDatosG.get('apeP').value,
            this.formDatosG.get('apeM').value,
            this.formDatosG.get('nombres').value,
            this.formPerfilTransacional.get('profesion').value==null?null:this.formPerfilTransacional.get('profesion').value.cveOcupacion,
            this.nacionalidadPLD,
            this.estadoBuro,
            this.ciudadId,
            this.inicioLabor,//fechaTrabajo
                "F" //tipo de persona
            ],
            "accion": accion
        }

        this.service.getListByObjet(datos, 'spsPerfilRiesgoFisico').subscribe(riesgof => {
            if (!this.vacio(riesgof)) {
                this.formEncabezado.get('perfilRiesgo').setValue(riesgof[0][1].toUpperCase().trim());
                if (riesgof[0][0] === '0') {
                    this.dialog.open(ModalPldComponent, {
                        data: {
                            titulo: "Perfil Riesgo",
                            perfil: riesgof[0][1],
                            contenido: riesgof[0][3],
                            color: 'green'
                        }
                    });
                } else {//Riesgo Alto
                    this.dialog.open(ModalPldComponent, {
                        data: {
                            titulo: "Perfil Riesgo",
                            perfil: riesgof[0][1],
                            contenido: riesgof[0][3],
                            color: 'red'
                        }
                    });
                }
            }


            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Listar nacionalidades activas para cliente y referencia
    * @param 2 nacionalidades activas
    */
    spsNacionalidadNac() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(2, 'listaNacionalidades').subscribe(data => {
            this.listaNac = data;
            this.opcionesNac = this.formDatosG.get('nacionalidadNac').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value))
            );
            //Nacionalidad domicilios
            this.opcionesNacionalidad = this.formDomicilioCl.get('catNacionalidad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterPais(value))
            );//Nacionalidad refencia
            this.opcionesNacRe = this.formReferencias.get('nacionalidadNacRef').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value))
            );
            //Nacionalidad domicilio referencia
            this.opcionesNacionalidadRefe = this.formDomicilioRefe.get('nacionalidadRef').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
* Muestra la descripcion de la nacionalidad
* @param option --pais seleccionada
* @returns --nombre del pais
*/
    mostrarPais(option: any): any {
        return option ? option.pais : undefined;
    }

    /**
* Filtra la categoria de nacionalidad
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterPais(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaNac.filter(option => option.pais.toLowerCase().includes(filterValue));
    }

    /**
    * Muestra la descripcion de la pais
    * @param option --pais seleccionada
    * @returns --nombre del paias
    */
    mostrarNac(option: any): any {
        return option ? option.nacion : undefined;
    }

    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterNac(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaNac.filter(option => option.nacion.toLowerCase().includes(filterValue));
    }
    /**
     * Metodo para saber que nacionalidad fue seleccionada
     * @param opcion nacionalidad id selecciona
     * @param accion numero de combo a cargar
     */

    opcionSeleccionadaNacionalidad(opcion, accion) {
        if (opcion.option.value.codigopld != "MX") {
            if (accion === 2 || accion === 4) {
                this.service.showNotification('top', 'right', 2, 'Se ha seleccionado un país diferente a México.');
            }
        }
        this.nacionalidadId = opcion.option.value.nacionalidadid;
        //cargar estados 
        this.spsEstadoNac(accion);
    }
    /**
    * Listar los estados activos para clientes y referencias
    * @param accion indica el autocomplete a cargar
    */
    spsEstadoNac(accion: number) {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        let path = this.nacionalidadId + '/2';
        this.listaEstadosNac = [];//se limpia la lista
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hya datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                if (accion == 1) {
                    this.opcionesEstadoNac = this.formDatosG.get('entFedeNac').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterEstadoNac(value))
                    );
                } else if (accion == 2) {
                    //domicilio
                    this.opcionesEstado = this.formDomicilioCl.get('estado').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterEstadoNac(value))
                    );
                } else if (accion == 3) {
                    //nacimiento
                    this.opcionesEstadoNacRe = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterEstadoNac(value))
                    );
                } else if (accion == 4) {
                    this.opcionesEstadoR = this.formDomicilioRefe.get('estadoR').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterEstadoNac(value))
                    );
                }
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
        return option ? option.nombre_estado : undefined;
    }
    /**
      * Filtra los estados
      * @param value --texto de entrada
      * @returns la opcion u opciones que coincidan con la busqueda
      */
    private _filterEstadoNac(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEstadosNac.filter(option => option.nombre_estado.toLowerCase().includes(filterValue));
    }
    /**
     * Metodo para optener el id del estado de nacimiento seleccionado
     * y filtrar Ciudades
     * @param event estado seleccionado
    */
    opcionSeleccionadaEstNac(event) {
        this.selectedIdEstadoNac = event.option.value.estadoid;
        this.idEstSel = this.selectedIdEstadoNac;
        this.controlCd = 1;
        this.spsCiudadNac();
        //Generar CURP y RFC
        this.generarCurp(1);
    }
    /**
     * Método para obtener el id del estado seleccionado
     * @param event  - Estado seleccioando a filtrar ciudades
     */
    opcionSeleccionadaE(event) {
        this.selectedIdEstado = event.option.value.estadoid;
        this.idEstSel = this.selectedIdEstado;
        this.controlCd = 2;
        this.spsCiudadNac();
    }
    /** Metodo para optener el id del estado de nacimiento de la refencia seleccionado
     * y filtrar Ciudades
     * @param event estado seleccionado
    */
    opcionSeleccionadaEstNacRe(event) {
        this.seleccionEstNacRe = event.option.value.estadoid;
        this.idEstSel = this.seleccionEstNacRe;
        this.controlCd = 3;
        this.spsCiudadNac();
        //Generar CURP y RFC
        this.generarCurp(2);
    }
    /**
    * Método para obtener el id del estado seleccionado
    * @param event  - Estado seleccioando a filtrar ciudades
    */
    opcionSeleccionadaER(event) {
        this.seleccionEstadoRefe = event.option.value.estadoid;
        this.idEstSel = this.seleccionEstadoRefe;
        this.controlCd = 4;
        this.spsCiudadNac();
    }
    /**
     * Metodo que lista ciudades por Estado ID fitlrado, para referencias y clientes
     */

    spsCiudadNac() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            if (this.controlCd == 1) {
                this.opcionesCiudadesNac = this.formDatosG.get('mpNac').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCiudadNac(value))
                );
            } else if (this.controlCd == 2) {
                this.opcionesCiudades = this.formDomicilioCl.get('ciudad').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCiudadNac(value))
                );

            } else if (this.controlCd == 3) {
                this.opcionesCiudadesRe = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCiudadNac(value))
                );
            } else if (this.controlCd == 4) {
                this.opcionesCiudadesDomRe = this.formDomicilioRefe.get('ciudadR').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCiudadNac(value))
                );
            }


            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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
    * Metodo para filtrar por ciudad ID las localidades
    @param event ciudad seleccionda
    */
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.seleccionCd = this.selectedIdCiudad;
        this.spsColonias();
    }
    /**
  * Metodo para filtrar por ciudad ID las localidades
    @param event ciudad seleccionda referencia
  */
    opcionSelecCiudadR(event) {
        this.selectedIdCiudadR = event.option.value.ciudaId;
        this.seleccionCd = this.selectedIdCiudadR;
        this.spsColonias();
    }

    /** 
         * Método que consulta y lista colonias por ciudadId o LocalidadID
         */
    spsColonias() {
        this.blockUI.start('Cargando datos...');
        let path: any;
        path = this.seleccionCd + '/' + this.selectedIdLocalidad;
        this.service.getListByID(path, 'listaColoniaCiudad').subscribe(data => {
            this.blockUI.stop();
            this.listaColonias = data;
            this.opcionesColonias = this.formDomicilioCl.get('catColonia').valueChanges.pipe(
                startWith(''),
                map(value => this._filterColonias(value))
            );
            if (this.selectedIdCiudadR > 0) {//referencia
                this.opcionesColoniasR = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterColonias(value))
                );
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }

    /**
    * Filtra la categoría de colonias
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterColonias(value: any): any[] {

        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaColonias.filter(option => option.nombrecolonia.toLowerCase().includes(filterValue));
    }

    /**
     * Muestra la descripción de la colonia 
     * @param option --colonia seleccionada
     * @returns -- colonia
     *  option.nombrecolonia 
     */
    displayFnColonias(option: any): any {
        return option ? option.nombrecolonia : undefined;
    }
    /**Metodo para obtener la Colonia seleccionada 
     * mostrar el nombre de la localidad
     * @param event Dato seleccionado
    */
    opcionSelecCol(event) {
        let nomLocalidad = event.option.value.localidad.nombreLocalidad;
        let cp = event.option.value.codP;
        if (this.selectedIdCiudadR == 0) {
            this.formDomicilioCl.get('localidad').setValue(nomLocalidad);
            this.formDomicilioCl.get('cp').setValue(cp);
        } else if (this.selectedIdCiudadR > 0) {
            this.formDomicilioRefe.get('localidadR').setValue(nomLocalidad);
            this.formDomicilioRefe.get('cpRef').setValue(cp);
        }
    }

    /**Metodo para guardar domicilios del cliente*/
    otroDomicilio() {
        if (this.formDomicilioCl.invalid) {
            this.validateAllFormFields(this.formDomicilioCl);
            this.blockUI.stop();
            return;
        }
        let index = this.listAddDom.findIndex(result => result[13] === this.formDomicilioCl.get('jerarquia').value.generalesId)

        if (index !== -1) {
            this.domID = this.listAddDom[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo el domicilio');
            this.listAddDom.splice(index, 1);
        }
       
        this.domtbl = true;
        this.listAddDom.push([
            this.domID,
            this.formDomicilioCl.get("calle")?.value,
            this.formDomicilioCl.get("numeroExterior")?.value.trim(),
            this.formDomicilioCl.get("numeroInterior").value === null ? '' : this.formDomicilioCl.get("numeroInterior").value.trim(),
            this.formDomicilioCl.get("entreCalle1")?.value,
            this.formDomicilioCl.get("entreCalle2")?.value,
            this.formDomicilioCl.get("referencia")?.value,
            this.formDomicilioCl.get("catColonia")?.value.coloniaID,
            this.formDomicilioCl.get("catNacionalidad")?.value.nacionalidadid,
            this.formDomicilioCl.get("resExtranjera")?.value,
            this.formDomicilioCl.get("latitud")?.value,
            this.formDomicilioCl.get("longitud")?.value,
            this.formDomicilioCl.get("tiempoArraigo")?.value.generalesId,
            this.formDomicilioCl.get("jerarquia")?.value.generalesId,
            this.formDomicilioCl.get('cp').value,
            this.formDomicilioCl.get("ciudad")?.value.ciudaId,
            this.formDomicilioCl.get("estado")?.value.estadoid,
            this.formDomicilioCl.get("jerarquia")?.value.descripcion,
            this.formDomicilioCl.get("jerarquia")?.value.cveGeneral

        ]);

        this.nacionalidadPLD = this.formDomicilioCl.get('catNacionalidad').value.codigopld;
        this.estadoBuro = this.formDomicilioCl.get('estado').value.cveEstadoBuro;
        this.ciudadId = this.formDomicilioCl.get("ciudad")?.value.ciudaId;
        //se limpia el formulario 
        this.formDomicilioCl.reset();
    }
    quitarDomicilio(index) {
        //llamar advertencia
        this.listAddDom.splice(index, 1);
        //ocultar si no hay domicilio
        if (this.listAddDom.length == 0) {
            this.domtbl = false;
        }
    }
    /**
    * Metodo para editar el domicilio del cliente
    * @param index 
    */
    editarDomicilio(index) {
        this.blockUI.start('Cargando datos...');
        //llenar campos a editar
        this.domID = this.listAddDom[index][0];
        this.formDomicilioCl.get('calle').setValue(this.listAddDom[index][1]);
        this.formDomicilioCl.get('numeroExterior').setValue(this.listAddDom[index][2]);
        this.formDomicilioCl.get('numeroInterior').setValue(this.listAddDom[index][3]);
        this.formDomicilioCl.get('entreCalle1').setValue(this.listAddDom[index][4]);
        this.formDomicilioCl.get('entreCalle2').setValue(this.listAddDom[index][5]);
        this.formDomicilioCl.get('referencia').setValue(this.listAddDom[index][6]);
        let nacionalidad = this.listaNac.find(t => t.nacionalidadid === this.listAddDom[index][8]);
        this.formDomicilioCl.get('catNacionalidad').setValue(nacionalidad);
        let path = this.listAddDom[index][8] + '/2';
        this.idEstSel = this.listAddDom[index][16];
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstado = this.formDomicilioCl.get('estado').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estado = this.listaEstadosNac.find(t => t.estadoid === this.listAddDom[index][16]);
            this.formDomicilioCl.get('estado').setValue(estado);
        });
        //Metodo de ciudad-estado se carga la lista
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formDomicilioCl.get('ciudad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listAddDom[index][15]);
            this.selectedIdCiudad = this.listAddDom[index][15];
            this.formDomicilioCl.get('ciudad').setValue(ciudad);
            //Localidad
            let path: any;
            path = this.selectedIdCiudad + '/' + this.selectedIdLocalidad;
            this.service.getListByID(path, 'listaColoniaCiudad').subscribe(colonias => {
                this.listaColonias = colonias;
                this.opcionesColonias = this.formDomicilioCl.get('catColonia').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterColonias(value))
                );
                //las colonias se cargan des pues de estado ciudad
                let colonia = this.listaColonias.find(t => t.coloniaID === this.listAddDom[index][7]);
                this.formDomicilioCl.get('catColonia').setValue(colonia);
                this.formDomicilioCl.get('localidad').setValue(colonia.localidad.nombreLocalidad);

                this.blockUI.stop();
            });
        });
        this.formDomicilioCl.get('resExtranjera').setValue(this.listAddDom[index][9]);
        this.formDomicilioCl.get('latitud').setValue(this.listAddDom[index][10]);
        this.formDomicilioCl.get('longitud').setValue(this.listAddDom[index][11]);
        let tiempoA = this.listaTiempoArraigo.find(t => t.generalesId === this.listAddDom[index][12]);
        this.formDomicilioCl.get('tiempoArraigo').setValue(tiempoA);
        let numDom = this.listaJerarquia.find(t => t.generalesId === this.listAddDom[index][13]);
        this.formDomicilioCl.get('jerarquia').setValue(numDom);
        this.formDomicilioCl.get('cp').setValue(this.listAddDom[index][14]);


    }
    /**Metodo para guardar agenda cliente */
    agregarAgenda() {
        /*this.formAgendaCliente.get('tel').setValidators([Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(10)]);
        this.formAgendaCliente.get('tel').updateValueAndValidity();

        this.formAgendaCliente.get('email').setValidators(null);
        this.formAgendaCliente.get('email').updateValueAndValidity();

        this.formAgendaCliente.get('tipoCont').setValidators(null);
        this.formAgendaCliente.get('tipoCont').updateValueAndValidity();*/


        if (this.formAgendaCliente.invalid) {
            this.validateAllFormFields(this.formAgendaCliente);
            return;
        }
        let index = this.listAddAgenCl.findIndex(res => res[3] === this.formAgendaCliente.get('tipoCont').value.generalesId)
        if (index !== -1) {
            this.agendaID = this.listAddAgenCl[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo el contacto');
            this.listAddAgenCl.splice(index, 1);
        }


        if (this.formAgendaCliente.get("tel").value) {
            this.agentbl = true;
            this.listAddAgenCl.push([
                this.agendaID,
                this.formAgendaCliente.get("tel")?.value,
                this.formAgendaCliente.get("email")?.value,
                this.formAgendaCliente.get("tipoCont")?.value.generalesId,
                this.formAgendaCliente.get("tipoCont")?.value.descripcion
            ]);
            //Se limpian las cajas de texto 
            this.agendaID = 0;//limpiamos 



            this.formAgendaCliente.reset();
            this.btnAddContact = "Agregar otro contacto";


        }
    }
    /**Metodo para quitar un contacto de agenda */
    quitarContacto(index) {
        //llamar advertencia
        this.listAddAgenCl.splice(index, 1);
        //ocultar si no hay contacto
        if (this.listAddAgenCl.length == 0) {
            this.agentbl = false;
        }
    }
    /**Metodo para editar un contacto de agenda */
    editarContacto(index) {
        //llenar campos a editar
        this.agendaID = this.listAddAgenCl[index][0];
        this.formAgendaCliente.get("tel").setValue(this.listAddAgenCl[index][1].trim());
        this.formAgendaCliente.get("email").setValue(this.listAddAgenCl[index][2]);
        let tipoCont = this.listaJerarquia.find(t => t.generalesId === this.listAddAgenCl[index][3]);
        this.formAgendaCliente.get("tipoCont").setValue(tipoCont);


    }
    /**Metodo para identificar el tipo de refencia seleccionoado */
    cambioTipoRefe(dato) {
        /*this.formReferencias.get('porcentaje').clearValidators();
        this.formReferencias.get('tipoIRe').clearValidators();
        this.formReferencias.get('claveIdeRe').clearValidators();
        this.formReferencias.get('porcentaje').updateValueAndValidity();
        this.formReferencias.get('tipoIRe').updateValueAndValidity();
        this.formReferencias.get('claveIdeRe').updateValueAndValidity();*/
        if (environment.generales.estadoCivilCasado == this.formPerfilTransacional.get("estado_civil").value.cveGeneral
            && dato.value.cveGeneral != environment.generales.estadoCivilCasado
            && environment.generales.cveTerceros === this.origenIngreso.value.cveGeneral) {
            this.service.showNotification('top', 'right', 3, "El cliente a indicado que se encuentra casado, registra su conyuge en refencias <br> y Propietario real");
        } else {
            if (environment.generales.cveTerceros === this.origenIngreso.value.cveGeneral && this.listAddReferencias.length < 0) {
                this.service.showNotification('top', 'right', 3, "Se requiere que seleciones un propietario real.");
            }
        }
        if (environment.generales.cveBeneficiario ===
            this.formReferencias.get("tpReferencia").value.cveGeneral
            || this.formReferencias.get("tpReferencia").value.cveGeneral == environment.generales.cvePresentantelegal
        ) {
            this.formReferencias.get('porcentaje').setValidators([Validators.required, Validators.maxLength(3), Validators.pattern('^[0-9]*$')]);
            this.formReferencias.get('porcentaje').updateValueAndValidity();
        }

        if (environment.generales.cveProvedorderecursos ===
            this.formReferencias.get("tpReferencia").value.cveGeneral
            || this.formReferencias.get("tpReferencia").value.cveGeneral == environment.generales.cvPropietarioreal
        ) {
            /*this.formReferencias.get('tipoIRe').setValidators([Validators.required]);
            this.formReferencias.get('tipoIRe').updateValueAndValidity();
            this.formReferencias.get('claveIdeRe').setValidators([Validators.required]);
            this.formReferencias.get('claveIdeRe').updateValueAndValidity();*/
        }

    }

    /**
     * Metodo para agregar refencias
     */
    agregarRefencia() {
        //combos Referencia Principal jerarquia Domicilio, empleo
        this.bandera = false;
        let jerarquia = this.listaJerarquia.find(t => t.cveGeneral === environment.generales.principal);
        this.parentescoRef = this.formReferencias.get("parentesco")?.value;
        this.refetbl = true;
        let ocupacion = 0, descripcion = '', inicioLab = '', entrada = '', salida = '', empresa = 0, contrato = 0;
        if (this.cuentaCEmpleo == false) {
            this.empleoIDR = null;
        } else {//valida que se llene los datos del empleo
            if (this.formEmpleo.invalid) {
                this.validateAllFormFields(this.formEmpleo);
                this.service.showNotification('top', 'right', 3, "Completa el empleo en refencias.");
                this.blockUI.stop();
                return;
            }
            ocupacion = this.formEmpleo.get("ocupacion")?.value.ocupacionId;//33
            descripcion = this.formEmpleo.get("descripcion")?.value;//34
            inicioLab = this.formEmpleo.get("inicioLabor")?.value;//35
            entrada = this.formEmpleo.get("entrada")?.value;//36
            salida = this.formEmpleo.get("salida")?.value;//37
            empresa = this.formEmpleo.get('empresaT')?.value.empresaId;//39
            contrato = this.formEmpleo.get("contratoEm")?.value.generalesId;//40
        }
        let index;
        if (this.refenciaID === 0) {
            index = this.listAddReferencias.findIndex(res => this.pocion === res[52]);
        } else {
            index = this.listAddReferencias.findIndex(res => this.refenciaID === res[0]);
        }
        if (index !== -1) {
            this.refenciaID = this.listAddReferencias[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo la referencia.');
            this.listAddReferencias.splice(index, 1);
        }
        this.listAddReferencias.push([this.refenciaID,//1
        this.formReferencias.get('tpReferencia')?.value.generalesId,//2
        this.formReferencias.get("parentesco")?.value.generalesId,//3
        this.formReferencias.get("porcentaje")?.value,//4
        this.sujetoIDR,//5
        this.formReferencias.get("nombresRe")?.value,//6
        this.formReferencias.get("apePre")?.value,//7
        this.formReferencias.get("apeMre")?.value,//8
        moment(this.formReferencias.get("fechaNre")?.value).format('YYYY-MM-DD'),//9
        this.formReferencias.get("generoRe")?.value.generalesId,//10
        this.formReferencias.get("nacionalidadNacRef")?.value.nacionalidadid,//11
        this.formReferencias.get("rfcRe")?.value,//12
        this.formReferencias.get("curpRe")?.value,//13
        this.formReferencias.get("civil")?.value.generalesId,//14
        this.formReferencias.get("entFedeNacRe")?.value.estadoid,//15
        this.formReferencias.get("mpNacRe")?.value.ciudaId,//16
        this.domIDR,//17 domicilio
        this.formDomicilioRefe.get("calleR")?.value,//18
        this.formDomicilioRefe.get("numeroExteriorR")?.value,//19
        this.formDomicilioRefe.get("numeroInteriorR")?.value,//20
        this.formDomicilioRefe.get("entreCalle1R")?.value,//21
        this.formDomicilioRefe.get("entreCalle2R")?.value,//22
        this.formDomicilioRefe.get("referenciaR")?.value,//23
        this.formDomicilioRefe.get("coloniaR")?.value.coloniaID,//24
        this.formDomicilioRefe.get("nacionalidadRef")?.value.nacionalidadid,//25
        this.formDomicilioRefe.get("resExtranjeraR")?.value,//26
        this.formDomicilioRefe.get("latitudR")?.value,//27
        this.formDomicilioRefe.get("longitudR")?.value,//28
        this.formDomicilioRefe.get("tiempoArraigoR")?.value.generalesId,//29
        this.formDomicilioRefe.get("jerarquiaR")?.value.generalesId,//30
        this.formDomicilioRefe.get("cpRef")?.value,//31        
        this.empleoIDR,//32 empleo 
            ocupacion,
            descripcion,
            inicioLab,
            entrada,
            salida,
        //numero de trabajo principal 
        jerarquia.generalesId,//38
            empresa,
            contrato,
        this.agendaIDR,//41 agenda
        this.formReferencias.get("celRe")?.value,//42
        this.formReferencias.get("emailRe")?.value,//43
        jerarquia.generalesId,//44 tipo contacto principal refencia
        //identificacion
        this.identificacionIDR,//45 id 
        this.formReferencias.get("claveIdeRe").value,//46
        moment(this.formReferencias.get("vigenciaIdeRe").value).format('YYYY-MM-DD'),//47
        this.formReferencias.get("tipoIRe").value.generalesId,//48
        //estado ciudad domicilio referencia
        this.formDomicilioRefe.get("estadoR")?.value.estadoid,//49
        this.formDomicilioRefe.get("ciudadR")?.value.ciudaId,    //50    
        this.mismoDomicilio,//51
        this.formReferencias.get('tpReferencia')?.value.cveGeneral, //52
        this.listAddReferencias.length + 1
        ]);
        //limpiar formualario
        this.formReferencias.reset();
        this.formDomicilioRefe.reset();
        this.formDomicilioRefe.get("resExtranjeraR").setValue(false);
        this.formEmpleo.reset();
        this.stepper.reset();
        this.sumaPorcent = 0;
        for (let ref of this.listAddReferencias) {
            this.sumaPorcent = this.sumaPorcent + parseInt(ref[3]);
        }
        if (this.sumaPorcent < 100) {
            this.service.showNotification('top', 'right', 3, "El porcentaje debe ser igual a 100%.");
        }
    }
    /**Metodo para quitar un contacto de agenda */
    eliminarReferecia(index) {
        //llamar advertencia
        this.listAddReferencias.splice(index, 1);
        //ocultar si no hay domicilio
        if (this.listAddReferencias.length == 0) {
            this.refetbl = false;
        }
    }
    /**
     * Confirma la edicon de datos
     * @param index posicion dela lista
     */
    confirmarEdicion(index) {
        if (this.bandera) {
            this.service.showNotification('top', 'right', 3, 'Tienes datos por ');
            Swal.fire({
                title: '¿Estas seguro de continuar?',
                text: "Tienes cambios sin agregar, se perderán al continuar.",
                icon: 'warning',
                allowOutsideClick: false,
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    //Accion a realizar si se acepta
                    this.editarReferecia(index);
                }//fin confirmacion
            })

        } else {
            this.bandera = true;
            this.editarReferecia(index);
        }
    }

    editarReferecia(index) {
        this.blockUI.start('Cargando datos...');
        this.pocion = this.listAddReferencias[index][52];
        this.refenciaID = this.listAddReferencias[index][0];
        let tpRef = this.listaTipoReferencia.find(t => t.generalesId === this.listAddReferencias[index][1]);
        this.formReferencias.get('tpReferencia').setValue(tpRef);
        let tpParen = this.listaParentesco.find(p => p.generalesId === this.listAddReferencias[index][2]);
        this.formReferencias.get("parentesco").setValue(tpParen);
        this.formReferencias.get("porcentaje").setValue(this.listAddReferencias[index][3]);
        this.sujetoIDR = this.listAddReferencias[index][4];
        this.formReferencias.get("nombresRe").setValue(this.listAddReferencias[index][5]);
        this.formReferencias.get("apePre").setValue(this.listAddReferencias[index][6]);
        this.formReferencias.get("apeMre").setValue(this.listAddReferencias[index][7]);
        const convertirEdad = new Date(this.listAddReferencias[index][8]);
        let timeDiff = Math.abs(Date.now() - convertirEdad.getTime());
        this.formReferencias.get('edadRe').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        this.formReferencias.get("fechaNre").setValue(this.listAddReferencias[index][8] + 'T00:00:00');
        let genero = this.listaGenero.find(t => t.generalesId === this.listAddReferencias[index][9]);
        this.formReferencias.get("generoRe").setValue(genero);
        let nacionalidad = this.listaNac.find(t => t.nacionalidadid === this.listAddReferencias[index][10]);
        this.formReferencias.get("nacionalidadNacRef").setValue(nacionalidad);
        this.formReferencias.get("rfcRe").setValue(this.listAddReferencias[index][11]);
        this.formReferencias.get("curpRe").setValue(this.listAddReferencias[index][12]);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === this.listAddReferencias[index][13]);
        this.formReferencias.get("civil").setValue(estCivil);
        let path = this.listAddReferencias[index][10] + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNacRe = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estado = this.listaEstadosNac.find(es => es.estadoid === this.listAddReferencias[index][14]);
            this.formReferencias.get("entFedeNacRe").setValue(estado);
        });
        //metel lista ciudad
        this.service.getListByID(this.listAddReferencias[index][14], 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesRe = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listAddReferencias[index][15]);
            this.formReferencias.get("mpNacRe").setValue(ciudad);
        });
        //Identificacion
        if (this.listAddReferencias[index][47] != null) {
            let tipoIdent = this.listaIdentificacion.find(t => t.generalesId === this.listAddReferencias[index][47]);
            this.identificacionIDR = this.listAddReferencias[index][44];//id 
            this.formReferencias.get("claveIdeRe").setValue(this.listAddReferencias[index][45].trim());
            this.formReferencias.get("vigenciaIdeRe").setValue(this.listAddReferencias[index][46] + 'T00:00:00');
            this.formReferencias.get("tipoIRe").setValue(tipoIdent);
        }

        //Domicilio
        this.domIDR = this.listAddReferencias[index][16];
        this.formDomicilioRefe.get("calleR").setValue(this.listAddReferencias[index][17]);
        this.formDomicilioRefe.get("numeroExteriorR").setValue(this.listAddReferencias[index][18]);
        this.formDomicilioRefe.get("numeroInteriorR").setValue(this.listAddReferencias[index][19]);
        this.formDomicilioRefe.get("entreCalle1R").setValue(this.listAddReferencias[index][20]);
        this.formDomicilioRefe.get("entreCalle2R").setValue(this.listAddReferencias[index][21]);
        this.formDomicilioRefe.get("referenciaR").setValue(this.listAddReferencias[index][22]);
        let nacionalidadDR = this.listaNac.find(t => t.nacionalidadid === this.listAddReferencias[index][24]);
        this.formDomicilioRefe.get("nacionalidadRef").setValue(nacionalidadDR);
        let pathDom = this.listAddReferencias[index][24] + '/2';
        this.service.getListByID(pathDom, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoR = this.formDomicilioRefe.get('estadoR').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estadoD = this.listaEstadosNac.find(t => t.estadoid === this.listAddReferencias[index][48]);
            this.formDomicilioRefe.get("estadoR").setValue(estadoD);
        });
        this.service.getListByID(this.listAddReferencias[index][48], 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesDomRe = this.formDomicilioRefe.get('ciudadR').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudadD = this.listaCiudadNac.find(t => t.ciudaId === this.listAddReferencias[index][49]);
            this.formDomicilioRefe.get("ciudadR").setValue(ciudadD);
            //Localidad
            let path: any;
            path = this.listAddReferencias[index][49] + '/' + this.selectedIdLocalidad;
            this.service.getListByID(path, 'listaColoniaCiudad').subscribe(listCol => {
                this.listaColonias = listCol;
                this.opcionesColoniasR = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterColonias(value))
                );
                //las colonias se cargan des pues de estado ciudad
                let colonia = this.listaColonias.find(t => t.coloniaID === this.listAddReferencias[index][23]);
                this.formDomicilioRefe.get("coloniaR").setValue(colonia);
                this.formDomicilioRefe.get('localidadR').setValue(colonia.localidad.nombreLocalidad);
                //this.listAddReferencias.splice(index, 1);
                this.blockUI.stop();
            });

        });
        this.formDomicilioRefe.get("resExtranjeraR").setValue(this.listAddReferencias[index][25]);
        this.formDomicilioRefe.get("latitudR").setValue(this.listAddReferencias[index][26]);
        this.formDomicilioRefe.get("longitudR").setValue(this.listAddReferencias[index][27]);
        let tarraigo = this.listaTiempoArraigo.find(t => t.generalesId === this.listAddReferencias[index][28]);
        this.formDomicilioRefe.get("tiempoArraigoR").setValue(tarraigo);
        let jerarquiaD = this.listaJerarquia.find(j => j.generalesId === this.listAddReferencias[index][29]);
        this.formDomicilioRefe.get("jerarquiaR").setValue(jerarquiaD);
        this.formDomicilioRefe.get("cpRef").setValue(this.listAddReferencias[index][30]);
        //agenda 
        if (this.listAddReferencias[index][40] != null) {
            this.agendaIDR = this.listAddReferencias[index][40];
            this.formReferencias.get("celRe").setValue(this.listAddReferencias[index][41].trim());
            this.formReferencias.get("emailRe").setValue(this.listAddReferencias[index][42]);
        }
        //empleo
        this.empleoIDR = this.listAddReferencias[index][31];
        let cuentaEmpleo;
        if (this.empleoIDR >= 0 && !this.vacio(this.empleoIDR)) {
            cuentaEmpleo = this.opcionesComprobante.find(v => v.id === true);
            this.cuentaCEmpleo = true;
            let ocupacionEm = this.listaSINCO.find(o => o.ocupacionId === this.listAddReferencias[index][32]);
            this.formEmpleo.get("ocupacion").setValue(ocupacionEm);
            this.formEmpleo.get("descripcion").setValue(this.listAddReferencias[index][33]);
            this.formEmpleo.get("inicioLabor").setValue(this.listAddReferencias[index][34]);
            this.formEmpleo.get("entrada").setValue(this.listAddReferencias[index][35]);
            this.formEmpleo.get("salida").setValue(this.listAddReferencias[index][36]);
            //numero de trabajo principal 311, 37 let opcionEm = this.listaJerarquia.find(o => o.generalesId ===  this.listAddReferencias[index][37]);
            let empresa = this.listaEmpresa.find(o => o.empresaId === this.listAddReferencias[index][38]);
            this.formEmpleo.get('empresaT').setValue(empresa);
            this.formEmpleo.get('razonSocial').setValue(empresa.razonSocial);
            this.formEmpleo.get('rfcEmpresa').setValue(empresa.rfc);
            this.formEmpleo.get('repreEmpresa').setValue(empresa.representante);
            let contrato = this.listaContrato.find(o => o.generalesId === this.listAddReferencias[index][39]);
            this.formEmpleo.get("contratoEm").setValue(contrato);
        } else {
            cuentaEmpleo = this.opcionesComprobante.find(v => v.id === false);
            this.cuentaCEmpleo = false;
        }
        this.empleoReferenciaCtrl.setValue(cuentaEmpleo);

    }

    /**
     * Metodo para generar la CURP y RFC
     */
    generarCurp(accion) {
        let sexo: any;
        let municipio: any;
        if (accion === 1) {
            if (!this.vacio(this.formDatosG.get('nombres').value) &&
                !this.vacio(this.formDatosG.get('fechaN').value) &&
                !this.vacio(this.formDatosG.get('entFedeNac').value) &&
                !this.vacio(this.formDatosG.get('apeP').value) &&
                !this.vacio(this.formDatosG.get('genero').value)) {
                sexo = this.formDatosG.get('genero').value.descripcion.toUpperCase();
                municipio = this.formDatosG.get('entFedeNac').value.nombre_estado.toUpperCase();
                if (sexo == 'FEMENINO') {
                    sexo = 'M';
                } else {
                    sexo = 'H';
                }
                //uso del JS para generar CURP
                let persona = environment.curp.getPersona();
                persona.nombre = this.formDatosG.get('nombres').value;
                persona.apellidoPaterno = this.formDatosG.get('apeP').value;
                persona.apellidoMaterno = this.formDatosG.get('apeM').value;
                persona.genero = sexo;
                persona.fechaNacimiento = moment(this.formDatosG.get('fechaN').value).format('YYYY-MM-DD');
                persona.estado = municipio;
                let curpGenerada = environment.curp.generar(persona);
                //asignacion de datos
                this.formDatosG.get('curp').setValue(curpGenerada);
                this.formDatosG.get('rfc').setValue(curpGenerada.substring(0, 10));
            }
        } else if (this.formReferencias.get('fechaNre').value) {
            if (!this.vacio(this.formReferencias.get('nombresRe').value) &&
                !this.vacio(this.formReferencias.get('fechaNre').value) &&
                !this.vacio(this.formReferencias.get('entFedeNacRe').value) &&
                !this.vacio(this.formReferencias.get('apePre').value) &&
                !this.vacio(this.formReferencias.get('generoRe').value)) {
                sexo = this.formReferencias.get('generoRe').value.descripcion.toUpperCase();
                municipio = this.formReferencias.get('entFedeNacRe').value.nombre_estado.toUpperCase();
                if (sexo == 'FEMENINO') {
                    sexo = 'M';
                } else {
                    sexo = 'H';
                }
                let persona = environment.curp.getPersona();
                persona.nombre = this.formReferencias.get('nombresRe').value;
                persona.apellidoPaterno = this.formReferencias.get('apePre').value;
                persona.apellidoMaterno = this.formReferencias.get('apeMre').value;
                persona.genero = sexo;
                persona.fechaNacimiento = moment(this.formReferencias.get('fechaNre').value).format('YYYY-MM-DD');
                persona.estado = municipio;
                let curpGenerada = environment.curp.generar(persona);
                this.formReferencias.get('curpRe').setValue(curpGenerada);
                this.formReferencias.get('rfcRe').setValue(curpGenerada.substring(0, 10));
            }
        }

    }
    /**
     * Permite calcular la edad atraves de la fecha ingresada
     * @param tipo 0 es sujeto a cliente 1 sujeto a refencia
     */
    calcularEdad(tipo) {
        if (tipo == 0) {
            this.buscarSujeto(0);
            const convertAge = new Date(this.formDatosG.get('fechaN').value);
            let timeDiff = Math.abs(Date.now() - convertAge.getTime());
            this.formDatosG.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        } else if (tipo == 1) {
            this.buscarSujeto(1);
            const convertAge = new Date(this.formReferencias.get('fechaNre').value);
            let timeDiff = Math.abs(Date.now() - convertAge.getTime());
            this.formReferencias.get('edadRe').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        }

    }

    /**Metodo para buscar un sujeto registrado que coincida con el q se va a registrar 
     * @param indicador 0 indica busqueda de sujeto para ser cliente 1 sujeto para ser refencia
    */
    buscarSujeto(indicador) {
        let sujeto = {};
        if (indicador == 0) {
            sujeto = {
                "nombres": this.formDatosG.get('nombres').value,
                "apellidoPaterno": this.formDatosG.get('apeP').value,
                "apellidoMaterno": this.formDatosG.get('apeM').value,
                "fechaNacimiento": this.formDatosG.get('fechaN').value,
            }
        } else {
            sujeto = {
                "nombres": this.formReferencias.get('nombresRe').value,
                "apellidoPaterno": this.formReferencias.get('apePre').value,
                "apellidoMaterno": this.formReferencias.get('apeMre').value,
                "fechaNacimiento": this.formReferencias.get('fechaNre').value,
            }
        }
        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(sujeto, 'buscarSujeto').subscribe(data => {
console.log(data);
            if (data[0].referencias != null) {
                this.listRefEncontrada = JSON.parse(data[0].referencias);
                var encabezado = "Se encontraron datos de la persona a registrar.";
                var body = "¿Deseas cargar su información?";

                if (indicador == 0) {
                    this.abrirAdvertencia(encabezado, body, "sujetoCl");
                } else {
                    this.abrirAdvertencia(encabezado, body, "sujeto");
                }
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
        });

    }
    /**
  * Listar OCUPACIONES SINCO 
  */
    spsOcupacionesSINCO() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(2, 'listaOcupacionesSinco').subscribe(data => {
            this.listaSINCO = data;
            this.opcionesSINCO = this.formEmpleo.get('ocupacion').valueChanges.pipe(
                startWith(''),
                debounceTime(200),
                map(value => this._filterSINCO(value))
            );
            this.opcionesProfesion = this.formPerfilTransacional.get('profesion').valueChanges.pipe(
                startWith(''),
                debounceTime(200),
                map(value => this._filterSINCO(value))
            );
            this.opcionesSINCOCL = this.formEmpleoCl.get('ocupacionCl').valueChanges.pipe(
                startWith(''),
                debounceTime(200),
                map(value => this._filterSINCO(value))
            );
            this.blockUI.stop();
            this.cargaCombos();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Muestra la descripcion de la nacionalidad
    * @param option --nacionalidad seleccionada
    * @returns --nombre de la nacionalidad
    */
    mostrarOcupacion(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSINCO(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSINCO.filter(option => 
            option.descripcion.toLowerCase().includes(filterValue)).slice(0, 30); // Mostrar solo los primeros 10 elementos;
    }
    /**
   * Listar empresas empleadoras  para cliente y referencia
   * Se cambia el listado a todas
   * '01EE', 'listaTipoEmpresa'
   */
    spsEmpresas() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaEmpresa').subscribe(data => {
            this.listaEmpresa = data;
            this.opcionesEmpresa = this.formEmpleo.get('empresaT').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEmpresa(value))
            );
            this.opcionesEmpresaCL = this.formEmpleoCl.get('empresaTCl').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEmpresa(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Muestra la descripcion de la nacionalidad
    * @param option --nacionalidad seleccionada
    * @returns --nombre de la nacionalidad
    */
    mostrarEmpresa(option: any): any {
        return option ? option.nombreComercial : undefined;
    }

    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterEmpresa(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEmpresa.filter(option => option.nombreComercial.toLowerCase().includes(filterValue));
    }
    /**Metodo para conocer la empresa selecciona y obtener su datos 
     * @param event Datos de la empresa
    */
    opcionEmpresa(event) {
        let razon = event.option.value.razonSocial;
        let rfc = event.option.value.rfc;
        let sujeto = event.option.value.representante;
        this.formEmpleo.get('razonSocial').setValue(razon);
        this.formEmpleo.get('rfcEmpresa').setValue(rfc);
        this.formEmpleo.get('repreEmpresa').setValue(sujeto);
    }
    /**Metodo para concer en que stepper esta para el cambio a domiilio 
     * @param event numero de pestaña en la que dio clic
    */
    cambioStepper(event) {
        let ventanaR = event.selectedIndex;
        if (this.clienteID == 0 && ventanaR == 1) {//Preguntar solo al agregar
            if (this.formDomicilioRefe.invalid) {
                var encabezado = "Domicilio";
                var body = "¿La referencia cuenta con el mismo domicilio del cliente?";
                //Preguntar tiene el mismo domicilios
                this.abrirAdvertencia(encabezado, body, "domicilio");
                ///return;
            }

        }
    }

    /**
* Abrir ventana modal de confirmacion para el domicilio y los datos de un sujeto registrado
@param encabezado titulo para la venta modal
@param body cuerpo de la venta modal
@param accion acorde a lo que  va a mostrar la venta modal
* */
    abrirAdvertencia(encabezado, body, accion: string) {
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            disableClose: true,
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0 && accion == 'domicilio') {//aceptar 
                if (!this.vacio(this.listAddDom)) {
                    //llenar campos de domiclio
                    this.llenarDomicilioR();
                    this.mismoDomicilio = true;//Si es mismo domicilio
                }
            } else if (result === 0 && accion == 'sujetoCl') {//aceptar
                this.sujetoACliente();
            } else if (result === 0 && accion == 'sujeto') {//aceptar
                this.sujetoAReferencia();
            }
        });
    }
    sujetoACliente() {
        let findGenero = this.listaGenero.find(i => i.descripcion === this.listRefEncontrada[0].genero);
        let findCivil = this.listaEstCivil.find(i => i.descripcion === this.listRefEncontrada[0].civil);
        let findNacionalidadNac = this.listaNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad);
        let path = this.listRefEncontrada[0].nacionalidadid + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNac = this.formDatosG.get('entFedeNac').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let findEstadoNac = this.listaEstadosNac.find(es => es.estadoid === this.listRefEncontrada[0].estado_id);
            this.formDatosG.get('entFedeNac').setValue(findEstadoNac);
        });
        this.idEstSel = this.listRefEncontrada[0].estado_id;
        let findTipoIdent = this.listaIdentificacion.find(i => i.descripcion === this.listRefEncontrada[0].tipo_ident);

        //llenar campos de datos generales del sujeto encontrado
        this.sujetoID = this.listRefEncontrada[0].sujeto_id;
        this.formDatosG.get('nombres').setValue(this.listRefEncontrada[0].nombres);
        this.formDatosG.get('apeP').setValue(this.listRefEncontrada[0].apellido_paterno);
        this.formDatosG.get('apeM').setValue(this.listRefEncontrada[0].apellido_materno);
        this.formDatosG.get('fechaN').setValue(this.listRefEncontrada[0].fecha_nacimiento + 'T00:00:00');
        this.formDatosG.get('genero').setValue(findGenero);
        this.formDatosG.get('nacionalidadNac').setValue(findNacionalidadNac);
        this.formDatosG.get('rfc').setValue(this.listRefEncontrada[0].rfc);
        this.formDatosG.get('curp').setValue(this.listRefEncontrada[0].curp);
        this.formPerfilTransacional.get('estado_civil').setValue(findCivil);
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesNac = this.formDatosG.get('mpNac').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listRefEncontrada[0].ciudad_id);
            this.formDatosG.get("mpNac").setValue(ciudad);

        });
        this.identificaionID = this.listRefEncontrada[0].identificacion_id;
        this.formDatosG.get('claveIde').setValue(this.listRefEncontrada[0].num_identificacion);
        this.formDatosG.get('vigenciaIde').setValue(this.listRefEncontrada[0].vigencia + 'T00:00:00');
        this.formDatosG.get('tipoI').setValue(findTipoIdent);
        this.formAgendaCliente.get("tel").setValue(this.listRefEncontrada[0].telefono);
        this.formAgendaCliente.get("email").setValue(this.listRefEncontrada[0].correo)
        //se asigna el tipo de contacto  principal al editar cliente
        let tipoCont = this.listaJerarquia.find(t => t.cveGeneral === environment.generales.principal);
        this.formAgendaCliente.get("tipoCont").setValue(tipoCont);
        //Domicilios
        let findNacionalidadDom = this.listaNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad_dom);
        let pathD = this.listRefEncontrada[0].nac_domid + '/2';
        this.service.getListByID(pathD, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstado = this.formDomicilioCl.get('estado').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let findEstadoDom = this.listaEstadosNac.find(es => es.estadoid === this.listRefEncontrada[0].estdom_id);
            this.formDomicilioCl.get("estado").setValue(findEstadoDom);
        });
        let findTiempoArra = this.listaTiempoArraigo.find(i => i.descripcion === this.listRefEncontrada[0].tiempo_arraigo);
        let findJerarquia = this.listaJerarquia.find(i => i.descripcion === this.listRefEncontrada[0].jerarquia);
        this.domID = this.listRefEncontrada[0].domicilio_id;
        this.formDomicilioCl.get("calle")?.setValue(this.listRefEncontrada[0].calle);
        this.formDomicilioCl.get("numeroExterior").setValue(this.listRefEncontrada[0].numero_exterior);
        this.formDomicilioCl.get("numeroInterior").setValue(this.listRefEncontrada[0].numero_interior);
        this.formDomicilioCl.get("entreCalle1").setValue(this.listRefEncontrada[0].entre_calle_1);
        this.formDomicilioCl.get("entreCalle2").setValue(this.listRefEncontrada[0].entre_calle_2);
        this.formDomicilioCl.get("referencia").setValue(this.listRefEncontrada[0].referencia);
        this.formDomicilioCl.get("cp").setValue(this.listRefEncontrada[0].codigo_postal);
        this.formDomicilioCl.get("catNacionalidad").setValue(findNacionalidadDom);
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formDomicilioCl.get('ciudad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudadDom = this.listaCiudadNac.find(t => t.ciudaId === this.listRefEncontrada[0].cddom_id);
            this.formDomicilioCl.get("ciudad").setValue(ciudadDom);
            //Localidad
            let path: any;
            path = this.listRefEncontrada[0].cddom_id + '/' + this.selectedIdLocalidad;
            this.service.getListByID(path, 'listaColoniaCiudad').subscribe(colonias => {
                this.listaColonias = colonias;
                this.opcionesColonias = this.formDomicilioCl.get('catColonia').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterColonias(value))
                );
                //las colonias se cargan des pues de estado ciudad
                let colonia = this.listaColonias.find(t => t.coloniaID === this.listRefEncontrada[0].colonia_id);
                this.formDomicilioCl.get("catColonia").setValue(colonia);
                this.formDomicilioCl.get("localidad").setValue(colonia.localidad.nombreLocalidad);
                this.blockUI.stop();
            });
        });
        this.formDomicilioCl.get("resExtranjera").setValue(this.listRefEncontrada[0].res_extrajera);
        this.formDomicilioCl.get("latitud").setValue(this.listRefEncontrada[0].latitud);
        this.formDomicilioCl.get("longitud").setValue(this.listRefEncontrada[0].longitud);
        this.formDomicilioCl.get("tiempoArraigo").setValue(findTiempoArra);
        this.formDomicilioCl.get("jerarquia").setValue(findJerarquia);
        //Empleo sujeto
        this.empleoReferenciaCtrl.setValue(true);
        let empresa = this.listaEmpresa.find(o => o.empresaId === this.listRefEncontrada[0].empresa_id);
        this.formEmpleoCl.get("empresaTCl").setValue(empresa);
        this.formEmpleoCl.get("razonsocialCl").setValue(this.listRefEncontrada[0].razon_social);
        this.formEmpleoCl.get("rfcEmpresaCl").setValue(this.listRefEncontrada[0].rfc_empr);
        this.formEmpleoCl.get("repEmpresa").setValue(this.listRefEncontrada[0].representante);
        let contrato = this.listaContrato.find(t => t.generalesId === this.listRefEncontrada[0].tipo_cont_id);
        this.formEmpleoCl.get("contratoEmCl").setValue(contrato);
        this.formEmpleoCl.get("inicioLaborar").setValue(this.listRefEncontrada[0].fechainicio);
        this.formEmpleoCl.get("entradaCl").setValue(this.listRefEncontrada[0].horario_desde);
        this.formEmpleoCl.get("salidaCl").setValue(this.listRefEncontrada[0].horario_hasta);
        let ocupacionEmpCl = this.listaSINCO.find(o => o.ocupacionId === this.listRefEncontrada[0].ocupacion_id);
        this.formEmpleoCl.get("ocupacionCl").setValue(ocupacionEmpCl);
        this.formEmpleoCl.get("descripcion").setValue(this.listRefEncontrada[0].observacion);
        this.formEmpleoCl.get("jerarquiaEmpCl").setValue(findJerarquia)
        this.service.showNotification('top', 'right', 3, 'Recuerda complementar la información .');
    }
    sujetoAReferencia() {
        let findGenero = this.listaGenero.find(i => i.descripcion === this.listRefEncontrada[0].genero);
        let findCivil = this.listaEstCivil.find(i => i.descripcion === this.listRefEncontrada[0].civil);
        let findNacionalidadNac = this.listaNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad);
        let path = this.listRefEncontrada[0].nacionalidadid + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNacRe = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let findEstadoNac = this.listaEstadosNac.find(es => es.estadoid === this.listRefEncontrada[0].estado_id);
            this.formReferencias.get('entFedeNacRe').setValue(findEstadoNac);
        });
        this.idEstSel = this.listRefEncontrada[0].estado_id;
        //llenar campos de datos generales del sujeto encontrado
        this.sujetoIDR = this.listRefEncontrada[0].sujeto_id;
        this.formReferencias.get('nombresRe').setValue(this.listRefEncontrada[0].nombres);
        this.formReferencias.get('apePre').setValue(this.listRefEncontrada[0].apellido_paterno);
        this.formReferencias.get('apeMre').setValue(this.listRefEncontrada[0].apellido_materno);
        this.formReferencias.get('fechaNre').setValue(this.listRefEncontrada[0].fecha_nacimiento + 'T00:00:00');
        this.formReferencias.get('generoRe').setValue(findGenero);
        this.formReferencias.get('nacionalidadNacRef').setValue(findNacionalidadNac);
        this.formReferencias.get('rfcRe').setValue(this.listRefEncontrada[0].rfc);
        this.formReferencias.get('curpRe').setValue(this.listRefEncontrada[0].curp);
        this.formReferencias.get('civil').setValue(findCivil);

        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesNac = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listRefEncontrada[0].ciudad_id);
            this.formReferencias.get("mpNacRe").setValue(ciudad);

        });
        if (!this.vacio(this.listRefEncontrada[0].identificaciones)) {
            let identificacion = JSON.parse(this.listRefEncontrada[0].identificaciones);
            let findTipoIdent = this.listaIdentificacion.find(i => i.descripcion === identificacion[0].tipo_ident);
            this.identificacionIDR = identificacion[0].identificacion_id;
            this.formReferencias.get('claveIdeRe').setValue(identificacion[0].num_identificacion);
            this.formReferencias.get('vigenciaIdeRe').setValue(identificacion[0].vigencia + 'T00:00:00');
            this.formReferencias.get('tipoIRe').setValue(findTipoIdent);
        }
        //llenar lista agenda con los datos a editar   
        this.agendaIDR = this.listRefEncontrada[0].agenda_id;
        if (!this.vacio(this.listRefEncontrada[0].telefono)) {
            this.formReferencias.get('celRe').setValue(this.listRefEncontrada[0].telefono.trim());
        }
        this.formReferencias.get('emailRe').setValue(this.listRefEncontrada[0].correo);
        //Domicilios
        let findNacionalidadDom = this.listaNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad_dom);
        let pathD = this.listRefEncontrada[0].nac_domid + '/2';
        this.service.getListByID(pathD, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoR = this.formDomicilioRefe.get("estadoR").valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let findEstadoDom = this.listaEstadosNac.find(es => es.estadoid === this.listRefEncontrada[0].estdom_id);
            this.formDomicilioRefe.get("estadoR").setValue(findEstadoDom);
        });
        this.idEstSel = this.listRefEncontrada[0].estdom_id;
        let findTiempoArra = this.listaTiempoArraigo.find(i => i.descripcion === this.listRefEncontrada[0].tiempo_arraigo);
        let findJerarquia = this.listaJerarquia.find(i => i.descripcion === this.listRefEncontrada[0].jerarquia);
        this.domIDR = this.listRefEncontrada[0].domicilio_id;
        if (this.domIDR > 0) {
            this.formDomicilioRefe.get("calleR")?.setValue(this.listRefEncontrada[0].calle);
            this.formDomicilioRefe.get("numeroExteriorR").setValue(this.listRefEncontrada[0].numero_exterior);
            this.formDomicilioRefe.get("numeroInteriorR").setValue(this.listRefEncontrada[0].numero_interior);
            this.formDomicilioRefe.get("entreCalle1R").setValue(this.listRefEncontrada[0].entre_calle_1);
            this.formDomicilioRefe.get("entreCalle2R").setValue(this.listRefEncontrada[0].entre_calle_2);
            this.formDomicilioRefe.get("referenciaR").setValue(this.listRefEncontrada[0].referencia);
            this.formDomicilioRefe.get("nacionalidadRef").setValue(findNacionalidadDom);
            this.formDomicilioRefe.get("cpRef").setValue(this.listRefEncontrada[0].codigo_postal);
            this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
                this.listaCiudadNac = data;
                this.opcionesCiudades = this.formDomicilioRefe.get('ciudadR').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCiudadNac(value))
                );
                let ciudadDom = this.listaCiudadNac.find(t => t.ciudaId === this.listRefEncontrada[0].cddom_id);
                this.formDomicilioRefe.get("ciudadR").setValue(ciudadDom);
                //Localidad
                let path: any;
                path = this.listRefEncontrada[0].cddom_id + '/' + this.selectedIdLocalidad;
                this.service.getListByID(path, 'listaColoniaCiudad').subscribe(colonias => {
                    this.listaColonias = colonias;
                    this.opcionesColonias = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterColonias(value))
                    );
                    //las colonias se cargan des pues de estado ciudad
                    let colonia = this.listaColonias.find(t => t.coloniaID === this.listRefEncontrada[0].colonia_id);
                    this.formDomicilioRefe.get("coloniaR").setValue(colonia);
                    this.formDomicilioRefe.get("localidadR").setValue(colonia.localidad.nombreLocalidad);
                    this.blockUI.stop();
                });
            });
            this.formDomicilioRefe.get("resExtranjeraR").setValue(this.listRefEncontrada[0].res_extrajera);
            this.formDomicilioRefe.get("latitudR").setValue(this.listRefEncontrada[0].latitud);
            this.formDomicilioRefe.get("longitudR").setValue(this.listRefEncontrada[0].longitud);
            this.formDomicilioRefe.get("tiempoArraigoR").setValue(findTiempoArra);
            this.formDomicilioRefe.get("jerarquiaR").setValue(findJerarquia);
        }
        //Empleo sujeto

        if (this.listRefEncontrada[0].empleo_id > 0) {
            this.empleoIDR = this.listRefEncontrada[0].empleo_id;
            this.cuentaCEmpleo = true; //mostrar campos
            let tieneEmpleo = this.opcionesComprobante.find(v => v.id === true);
            this.empleoReferenciaCtrl.setValue(tieneEmpleo);
            let empresa = this.listaEmpresa.find(o => o.empresaId === this.listRefEncontrada[0].empresa_id);
            this.formEmpleo.get("empresaT").setValue(empresa);
            this.formEmpleo.get("razonSocial").setValue(this.listRefEncontrada[0].razon_social);
            this.formEmpleo.get("rfcEmpresa").setValue(this.listRefEncontrada[0].rfc_empr);
            this.formEmpleo.get("repreEmpresa").setValue(this.listRefEncontrada[0].representante);
            let tipoCont = this.listaContrato.find(t => t.generalesId === this.listRefEncontrada[0].tipo_cont_id);
            this.formEmpleo.get("contratoEm").setValue(tipoCont);
            this.formEmpleo.get("inicioLabor").setValue(this.listRefEncontrada[0].fechainicio);
            this.formEmpleo.get("entrada").setValue(this.listRefEncontrada[0].horario_desde);
            this.formEmpleo.get("salida").setValue(this.listRefEncontrada[0].horario_hasta);
            let ocupacionEmpCl = this.listaSINCO.find(o => o.ocupacionId === this.listRefEncontrada[0].ocupacion_id);
            this.formEmpleo.get("ocupacion").setValue(ocupacionEmpCl);
            this.formEmpleo.get("descripcion").setValue(this.listRefEncontrada[0].observacion);
        }
        this.service.showNotification('top', 'right', 3, 'Recuerda complementar la información .');
    }

    /**
     * Metodo para llenar los campos de domicilio referencia si es igual a la de cliente
     */

    llenarDomicilioR() {
        this.blockUI.start('Cargando datos...');
        for (let dom of this.listAddDom) {
            if (dom[18] == "01DP") {
                this.formDomicilioRefe.get('calleR').setValue(dom[1]);
                this.formDomicilioRefe.get("numeroExteriorR").setValue(dom[2]);
                this.formDomicilioRefe.get("numeroInteriorR").setValue(dom[3]);
                this.formDomicilioRefe.get("entreCalle1R").setValue(dom[4]);
                this.formDomicilioRefe.get("entreCalle2R").setValue(dom[5]);
                this.formDomicilioRefe.get("referenciaR").setValue(dom[6]);
                let nacionalidad = this.listaNac.find(i => i.nacionalidadid === dom[8]);
                this.formDomicilioRefe.get("nacionalidadRef").setValue(nacionalidad);
                let estado = this.listaEstadosNac.find(t => t.estadoid === dom[16]);
                this.idEstSel = dom[16];
                this.formDomicilioRefe.get("estadoR").setValue(estado);
                //Metodo de ciudad-estado se carga la lista
                this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
                    this.listaCiudadNac = data;
                    this.opcionesCiudadesDomRe = this.formDomicilioRefe.get('ciudadR').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterCiudadNac(value))
                    );
                    let ciudad = this.listaCiudadNac.find(t => t.ciudaId === dom[15]);
                    this.selectedIdCiudad = dom[15];
                    this.formDomicilioRefe.get("ciudadR").setValue(ciudad);
                    //Localidad
                    let path: any;
                    path = this.selectedIdCiudad + '/' + this.selectedIdLocalidad;
                    this.service.getListByID(path, 'listaColoniaCiudad').subscribe(colC => {
                        this.listaColonias = colC;
                        this.opcionesColonias = this.formDomicilioCl.get('catColonia').valueChanges.pipe(
                            startWith(''),
                            map(value => this._filterColonias(value))
                        );
                        //las colonias se cargan des pues de estado ciudad
                        let colonia = this.listaColonias.find(t => t.coloniaID === dom[7]);
                        this.formDomicilioRefe.get("coloniaR").setValue(colonia);
                        this.formDomicilioRefe.get("localidadR").setValue(colonia.localidad.nombreLocalidad);
                        this.blockUI.stop();
                    });
                });
                this.formDomicilioRefe.get("resExtranjeraR").setValue(dom[9]);
                this.formDomicilioRefe.get("latitudR").setValue(dom[10]);
                this.formDomicilioRefe.get("longitudR").setValue(dom[11]);
                let tiempoArra = this.listaTiempoArraigo.find(i => i.generalesId === dom[12]);
                this.formDomicilioRefe.get("tiempoArraigoR").setValue(tiempoArra);
                let jerarquia = this.listaJerarquia.find(i => i.generalesId === dom[13]);
                this.formDomicilioRefe.get("jerarquiaR").setValue(jerarquia);
                this.formDomicilioRefe.get("cpRef").setValue(dom[14]);
            } else {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, 'No se a agregado un domicilio principal.');
                return;
            }
        }


    }
    /**
      * Metodo para abrir ventana modal
      * @param ventana -- 0 Cliente 1 Empresa 2 Refencia
      */
    abrirDialog(ventana) {
        this.cargaCombos();
        if (ventana === 0) {//clientes
            this.titulo = "Lista clientes";
            this.accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                disableClose: true,
                data: {
                    titulo: this.titulo,
                    accion: this.accion
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                if (result.tipoPersona == 'F') {
                    this.llenarDatosCliente(result.datosCl, ventana);
                } else {
                    //si no selecciono nada se habilitan tabs
                    this.datoGeneralTab = false;
                    this.domicilioTab = false;
                    this.perfilInfTab = false;
                    this.perfilIngTab = false;
                    this.perfilEmpTab = false;
                    this.refeTab = false;
                    this.digitaTab = false;
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente Físico o Extranjero.');
                }
            });
        } else if (ventana === 1) {//empresas
            this.titulo = "Agregar empresas";
            this.accion = 1;

            //se abre el modal
            this.dialog.open(BuscarEmpresaComponent, {
                data: {
                    titulo: this.titulo,
                    accion: this.accion,
                    empresa: ventana
                }
            });

        } else if (ventana === 2) {//Referencias
            this.titulo = "Clientes para referencias";
            this.accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                disableClose: true,
                data: {
                    titulo: this.titulo,
                    accion: this.accion
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(clienteRef => {
                if (clienteRef.tipoPersona == 'F') {
                    this.llenarDatosCliente(clienteRef.datosCl, ventana);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente Físico o Extranjero.');
                }
            });
        }

    }
    /**Metodo que limpia listas y 
     * formularios cada vez q se llena la infomación del ciente */
    limpiarDatos() {
        this.listAddAgenCl = [];
        this.listAddDom = [];
        this.listAddBienes = [];
        this.listAddIngreso = [];
        this.listAddEgreso = [];
        this.listAddEmp = [];
        this.listAddReferencias = [];
        this.listaDocAgregados = [];
        this.formDatosG.reset();//Datos generales del cliente
        this.formDomicilioCl.reset();//Domicilios del cliente
        this.formPerfilTransacional.reset();//Perfil transaccional del cliente
        this.formReferencias.reset();//Datos generales Referencia
        this.formDomicilioRefe.reset();//Domicilio referencia
        this.formDomicilioRefe.get("resExtranjeraR").setValue(false);
        this.formEmpleoCl.reset();
        this.formEmpleo.reset();//empelo refenrecia
    }
    /**
     * Metodo para llenar los campos de la información del cliente a Editar
     * @param datos toda la infoamción del clientes
     * @param ventana indica 1=Empresa,2=Refencia,0=Cliente
     */
    llenarDatosCliente(datos: any, ventana: any) {
        if (ventana == 0) {
            this.blockUI.start('Cargando datos...');
            //lista vacias cada vez q se llena datos y formularios
            this.limpiarDatos();
            //Llenado de informacion
            this.datosCliente(datos);
        } else if (ventana == 2) {

            this.datosReferencia(datos);
        }

    }
    /**
     * Metodo para llenar los campos con la informacion del cliente
     * @param datos toda la informacion del cliente 
     */
    datosCliente(datos) {
        this.clienteID = datos.cliente_id;
        this.formEncabezado.get('numCliente').setValue(datos.numero_cliente);
        this.formEncabezado.get('cliente').setValue(datos.paterno_cl + ' ' + datos.materno_cl + ' ' + datos.nombre_cl);
        this.formEncabezado.get('perfilRiesgo').setValue('');//se calcula
        this.solicitudID = datos.solicitud_id;
        this.formEncabezado.get('fechSolicitud').setValue(datos.fecha_solicitud);
        this.formEncabezado.get('numSolicitud').setValue(datos.num_solicitud);
        this.formEncabezado.get('tipoCliente').setValue(datos.tipo_socio);
        let estatus;
        estatus = datos.estatus ? 'Activo' : 'Inactivo';
        this.formEncabezado.get('estatusAct').setValue(estatus);
        //Datos Generales
        this.sujetoID = datos.sujeto_cl;
        this.formDatosG.get('apeP').setValue(datos.paterno_cl);
        this.formDatosG.get('apeM').setValue(datos.materno_cl);
        this.formDatosG.get('nombres').setValue(datos.nombre_cl);
        this.formDatosG.get('fechaN').setValue(datos.fecha_nacimiento + 'T00:00:00');
        const convertirEdad = new Date(datos.fecha_nacimiento);
        let timeDiff = Math.abs(Date.now() - convertirEdad.getTime());
        this.formDatosG.get('edad').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        let genero = this.listaGenero.find(v => v.generalesId === datos.generales_id);
        this.formDatosG.get('genero').setValue(genero);
        this.formDatosG.get('rfc').setValue(datos.rfc);
        let nacionalidad = this.listaNac.find(t => t.nacionalidadid === datos.nacionalidadid);
        this.formDatosG.get('nacionalidadNac').setValue(nacionalidad);
        let path = datos.nacionalidadid + '/2';

        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNac = this.formDatosG.get('entFedeNac').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estado = this.listaEstadosNac.find(v => v.estadoid === datos.estado_id);
            this.formDatosG.get('entFedeNac').setValue(estado);
        });
        this.formDatosG.get('curp').setValue(datos.curp);
        this.service.getListByID(datos.estado_id, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesNac = this.formDatosG.get('mpNac').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(c => c.ciudaId === datos.cd_nac);
            this.formDatosG.get('mpNac').setValue(ciudad);
            //Cargar datos para Solicitud Admision
            this.nomSucursal = datos.nombre_sucursal;
            this.datoSolcitudAdmision();
        });
        this.datosClienteContacto(datos);
        //Mostrar
        this.domtbl = true;
        this.agentbl = true;
        this.refetbl = true;
        this.empltbl = true;
    }
    /**
      * Metodo para llenar los campos con la informacion del cliente
      * @param datos toda la informacion del cliente 
      */
    datosClienteContacto(datos) {
        let agenda = JSON.parse(datos.agendacl);

        //llenar lista agenda con los datos a editar
        if (agenda != null) {
            for (let cont of agenda) {
                this.listAddAgenCl.push([
                    cont.agenda_id,
                    cont.telefono,
                    cont.correo,
                    cont.generales_id,
                    cont.descripcion]
                );

            }
            //se asigna el tipo de contacto  principal al editar cliente
            let tipoCont = this.listaJerarquia.find(t => t.cveGeneral === environment.generales.principal);
            this.formAgendaCliente.get("tipoCont").setValue(tipoCont);
        }
        let exExtranjero = false;
        if (datos.extranjero_id != null) {
            exExtranjero = true;
            //mostrar u ocultar 
            this.extranjero = true;
        }
        this.formDatosG.get('extranjero').setValue(exExtranjero);
        if (datos.identificacion_id > 0) {
            this.identificaionID = datos.identificacion_id;
            let tipoIdent = this.listaIdentificacion.find(t => t.generalesId === datos.tipoidenid);
            this.formDatosG.get('tipoI').setValue(tipoIdent);
            this.formDatosG.get('claveIde').setValue(datos.num_identificacion.trim());
            this.formDatosG.get('vigenciaIde').setValue(datos.vigencia + 'T00:00:00');
        }
        let calidad = this.listaCalidadExt.find(c => c.calidadid === datos.calidadid);
        this.formDatosG.get('calidad').setValue(calidad);
        this.formDatosG.get('pasaporte').setValue(datos.no_pasaporte);
        this.formDatosG.get('permiso').setValue(datos.no_permiso);
        //Domicilio cliente a la lista
        let domCl = JSON.parse(datos.domicilio_cl);

        for (let dom of domCl) {
            //lista domicilio a guardar
            this.listAddDom.push([
                dom.domicilio_id,
                dom.calle,
                dom.numero_exterior,
                dom.numero_interior,
                dom.entre_calle_1,
                dom.entre_calle_2,
                dom.referencia,
                dom.colonia_id,
                dom.nacionalidadid,
                dom.res_extrajera,
                dom.latitud.trim(),
                dom.longitud.trim(),
                dom.tiempo_arraigo_id,
                dom.num_domicilio_id,
                dom.cp.trim(),//datos para combos
                dom.ciudad_id,
                dom.estado_id,
                dom.num_dom
            ]);

        }
        this.datosClientePerfil(datos);
    }
    /**
     * Metodo para llenar los campos con la informacion del cliente
     * @param datos toda la informacion del cliente 
     */
    datosClientePerfil(datos) {
        //Perfil Transaccional
        this.perfilID = datos.perfil_id;
        let serviciosJSON = JSON.parse(datos.servicios_cl);
        let tipoSer = [];
        if (serviciosJSON != null) {
            for (let ser of serviciosJSON) {
                let findSerivicios = this.listaTipoServicio.find(a => a.generalesId === ser.tipo_servicio_id);
                tipoSer.push(findSerivicios);
            }
        }
        this.formPerfilTransacional.get('tipoServicio').setValue(tipoSer);
        let cuentasJSON = JSON.parse(datos.maneja_cuentas);
        let finalidadJSON = JSON.parse(datos.finalidad_cuenta);
        let cuentas = [];
        if (cuentasJSON != null) {
            for (let cuenta of cuentasJSON) {
                let findCuentas = this.listaManejoCtas.find(mc => mc.generalesId === cuenta.tipo_cuenta);
                cuentas.push(findCuentas);
            }
        }
        let finalidad = [];
        if (finalidadJSON != null) {
            for (let final of finalidadJSON) {
                let findFinaCue = this.listaFinalidadCta.find(fc => fc.generalesId === final.tipo_finalidad);
                finalidad.push(findFinaCue);
            }
        }
        let actRealiza = this.listaActividadRealiza.find(a => a.generalesId === datos.act_realizaid);
        this.formPerfilTransacional.get('actividadRealiza').setValue(actRealiza);
        this.formPerfilTransacional.get('manejaCuentas').setValue(cuentas);
        this.formPerfilTransacional.get('finalidadesCuenta').setValue(finalidad);
        this.formPerfilTransacional.get('numDependientes').setValue(datos.num_dependientes);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === datos.ecivil_id);
        let regMatr = this.listaRegimenMatrimonial.find(v => v.generalesId === datos.regimen_id);
        let nivEst = this.listaNivelEscolar.find(e => e.generalesId === datos.estudios_id);
        let tipoVivi = this.listaTipoVivienda.find(v => v.generalesId === datos.vivienda_id);
        let medioE = this.listaMedioDifusion.find(v => v.generalesId === datos.medio_id);
        let pMovimiento = this.listaTipoPlazo.find(v => v.tipoPlazoId === datos.pmovimientos_id);
        this.formPerfilTransacional.get('estado_civil').setValue(estCivil);
        this.formPerfilTransacional.get('regimenMatrimonial').setValue(regMatr);
        this.formPerfilTransacional.get('nivelEstudios').setValue(nivEst);
        this.formPerfilTransacional.get('tipoVivienda').setValue(tipoVivi);
        this.formPerfilTransacional.get('medioEntero').setValue(medioE);
        this.formPerfilTransacional.get('periodicidadMovimientos').setValue(pMovimiento);
        let profesion = this.listaSINCO.find(l => l.ocupacionId === datos.ocupacionid);
        this.formPerfilTransacional.get('profesion').setValue(profesion);
        this.formPerfilTransacional.get('montoAproxAhorrar').setValue(datos.monto_aprox_ahorrar);
        this.formPerfilTransacional.get('montoAproxRetirar').setValue(datos.monto_aprox_retirar);
        this.formPerfilTransacional.get('numeroOperacion').setValue(datos.num_operacion);
        let listaViJSON = JSON.parse(datos.vinculos_adicionales);
        let vinculos = [];
        if (listaViJSON != null) {
            for (let vinc of listaViJSON) {
                let findVinculo = this.listaVinculosA.find(v => v.generalesId === vinc.tipo_vinculo);
                vinculos.push(findVinculo);
            }
        }
        this.formPerfilTransacional.get('vinculosAdicionales').setValue(vinculos);
        //Bienes
        let bienMJSON = JSON.parse(datos.bienes_cl);
        if (bienMJSON != null) {
            for (let bien of bienMJSON) {
                this.listAddBienes.push([
                    bien.bien_id, bien.tipo_bien_id,
                    bien.valor_aprox, bien.num_escritura_factura,
                    bien.modelo, bien.marca,
                    bien.otrobien, bien.descripcion,
                    bien.cve_generales]
                );
            }
        } //Ingresos Egresos 
        let comprobante = this.opcionesComprobante.find(v => v.id === datos.comprobacion_ingresos);
        this.comprobacionIngresos.setValue(comprobante);
        let origenIng = this.listaOrigenIngresos.find(o => o.generalesId === datos.origen_id);
        this.origenIngreso.setValue(origenIng);
        let periodoIng = this.listaTipoPlazo.find(p => p.tipoPlazoId === datos.idtipoplazo);
        this.tipoPlazo.setValue(periodoIng);
        this.datosClienteIngEg(datos);
    }
    /**
     * Metodo para llenar los campos con la informacion del cliente
     * @param datos toda la informacion del cliente 
     */
    datosClienteEmpleo(datos) {
        //Empleo cliente 
        let empleoJSON = JSON.parse(datos.empleos_cl);
        if (empleoJSON != null) {
            for (let empleo of empleoJSON) {
                this.listAddEmp.push([
                    empleo.empleo_id,
                    empleo.ocupacion_id,
                    empleo.observacion,
                    empleo.fechainicio,
                    empleo.horario_desde,
                    empleo.horario_hasta,
                    empleo.numero_trabajo,
                    empleo.empresa_id,
                    empleo.contrato_id,
                    empleo.rfc,
                    empleo.razon_social,
                    empleo.representante
                ]);
            }
        }
        /**Referencias */
        let referenciasJSON = JSON.parse(datos.referencias);
        if (referenciasJSON != null) {
            if (referenciasJSON.length > 0) {
                for (let ref of referenciasJSON) {

                    let parentesco = { "generalesId": ref.parentesco_id, "descripcion": ref.parentesco };
                    this.parentescoRef = parentesco;
                    let empleoID = 0, ocupacion = 0, observaciones = '', fechaIn = '';
                    let horaIn = '', horaFin = '', numTrab = 0, empresa = 0, tipoC = 0;
                    if (!this.vacio(ref.empleos)) {
                        let jsonEmpl = JSON.parse(ref.empleos);
                        empleoID = jsonEmpl[0].empleo_id_ref;//31 empleo
                        ocupacion = jsonEmpl[0].ocupacion_empl_ref_id;//32
                        observaciones = jsonEmpl[0].observacion_empl_ref;//33
                        fechaIn = jsonEmpl[0].fechainicio_empl_ref;//34
                        horaIn = jsonEmpl[0].horario_desde_empl_ref;//35
                        horaFin = jsonEmpl[0].horario_hasta_empl_ref;//36
                        numTrab = jsonEmpl[0].numtrabajo_ref;//37
                        empresa = jsonEmpl[0].empresa_ref;//38
                        tipoC = jsonEmpl[0].tipo_contrato_empl_ref_id;//39
                    }
                    this.listAddReferencias.push([
                        ref.refencia_id,//0
                        ref.tipo_refencia_id,//1
                        ref.parentesco_id,//2
                        ref.porcentaje,//3
                        ref.sujeto_id,//4
                        ref.nombres_ref,//5
                        ref.aparteno_ref,//6
                        ref.amaterno_ref,//7
                        ref.fecha_nacimiento_ref,//8
                        ref.genero_id,//9
                        ref.nacionalidadid,//10
                        ref.rfc_ref.trim(),//11
                        ref.curp_ref,//12
                        ref.estado_civil_id,//13
                        ref.estado_id,//14
                        ref.ciudad_id,//15
                        ref.dom_refe_id,//16 domicilio
                        ref.calle_dom_ref,//17
                        ref.no_ext_ref.trim(),//18
                        ref.no_int_ref,//19
                        ref.entre_calle_1ref,//20
                        ref.entre_calle_2ref,//21
                        ref.referencia_dom_ref,//22
                        ref.coloniaid_ref,//23
                        ref.nacionalidad_dom_ref,//24
                        ref.res_extr_refe,//25
                        ref.latitud_dom_ref.trim(),//26
                        ref.longitud_dom_ref.trim(),//27
                        ref.tiempo_arraigo_id_ref,//28
                        ref.dom_jer_ref,//29
                        ref.cp_dom_ref.trim(),//30
                        empleoID,//31 empleo
                        ocupacion,//32
                        observaciones,//33
                        fechaIn,//34
                        horaIn,//35
                        horaFin,//36
                        numTrab,//37
                        empresa,//38
                        tipoC,//39
                        ref.agenda_id,//40 agenda 
                        ref.telefono,//41
                        ref.correo,//42
                        ref.tipo_contacto,//43
                        ref.identificacion_id,//44 IDENTIFICCION
                        ref.num_identificacion,//45
                        ref.vigencia,//46
                        ref.tipoidenid,//47 48 ref.identificacion,
                        ref.estadoid_ref,//49
                        ref.cd_id_dom,//50
                        this.mismoDomicilio,//51
                        ref.cve_generales
                    ]);
                }
            }
        }
        this.infoBeneficiario();//para reporte solicitud admision
        //DIGITALIZACION
        let tipoSocio = this.listaTipoSocios.find(s => s.tipoSocioid === datos.tipo_socioid);
        this.formDigitalizacion.get('tipoSocio').setValue(tipoSocio);
        //Se llena la lista de documentos q requiere
        this.service.getListByID(tipoSocio.cveSocio, 'listaDocTipoSocios').subscribe(docS => {
            this.listaDocTipoSocios = docS;
            this.blockUI.stop();
        });
        if (datos.digitalizacion != null) {
            let digitalizacionJSON = JSON.parse(datos.digitalizacion);
            for (let doc of digitalizacionJSON) {
                this.docCodificadoID = doc.documentocodificado_id;
                this.listaDocAgregados.push([
                    doc.documentobase64,
                    doc.tipodocumento_id,
                    doc.nombredoc,
                    this.docCodificadoID,
                    this.servicePermisos.usuario.id
                ]);
            }
        }
        //conocer el perfil de riesgo del cliente
        this.spsPerfilRiesgo();
        //Solicitud de Actualizacion
        //Abrir modal para saber si va actualizar o no 
        this.verSolicitud();
    }
    /**
     * Se llena la lista de Datos personales para generar el reporte
     */
    datoSolcitudAdmision() {
        this.listaLaboral = [];
        // Fecha de creación del registro
        let inicioLab = new Date();
        if(this.listAddEmp.length>0){
            inicioLab = new Date(this.listAddEmp[0][3]);
        
        // Fecha actual
        const fechaActual = new Date();
        // Años de antigüedad
        let antiguedadEnAnios = fechaActual.getFullYear() - inicioLab.getFullYear();
        let ocupacionEmpCl = this.listaSINCO.find(o => o.ocupacionId === this.listAddEmp[0][1]);
        let empresa = this.listaEmpresa.find(o => o.empresaId === this.listAddEmp[0][7]);
        if(!this.vacio(empresa)){
        let domEmpre = JSON.parse(empresa.domicilios);
        let ageEmpre = JSON.parse(empresa.agendas);

        this.listaLaboral.push(antiguedadEnAnios,
            ocupacionEmpCl.descripcion, empresa.nombreComercial,
            domEmpre[0].calle.trim() + ' No.' + domEmpre[0].numero_exterior.trim() + ' C.P.' + domEmpre[0].codigo_postal + '; Ciudad ' + domEmpre[0].ciudad
            + ', ' + domEmpre[0].nombre_estado,
            ageEmpre[0].telefono);
        }
    }
        //Domicilio cliente
        let tiempoA = this.listaTiempoArraigo.find(t => t.generalesId === this.listAddDom[0][12]);
        this.nomTiempoA = tiempoA==undefined?'':tiempoA.descripcion;
        let path = this.listAddDom[0][8] + '/2';
        let estado;
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                estado = this.listaEstadosNac.find(t => t.estadoid === this.listAddDom[0][16]);
            }
        });
        let ciudad;
        let colonia;
        this.service.getListByID(this.listAddDom[0][16], 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listAddDom[0][15]);
        });//Localidad
        let pathL: any;
        pathL = this.listAddDom[0][15] + '/' + this.selectedIdLocalidad;
        this.service.getListByID(pathL, 'listaColoniaCiudad').subscribe(colonias => {
            this.listaColonias = colonias;
            //las colonias se cargan des pues de estado ciudad
            colonia = this.listaColonias.find(t => t.coloniaID === this.listAddDom[0][7]);
            this.nomEstado = estado.nombre_estado;
            this.nomCiudad = ciudad.nombre;
            this.nomLocalidad = colonia.localidad.nombreLocalidad;
        });
    
    }

    /**
     * Datos del beneficiario
     */
    infoBeneficiario() {
        this.listaBeneficiario = [];
        this.listaRefenciaPersonal = [];
        console.log(this.listAddReferencias);
        for (let i of this.listAddReferencias) {
            let pathDom = i[24] + '/2';
            let estadoD;
            this.service.getListByID(pathDom, 'spsEstadosNacionalidad').subscribe(data => {
                if (!this.vacio(data)) {//no hay datos vacios
                    this.listaEstadosNac = JSON.parse(data[0]);
                }
                estadoD = this.listaEstadosNac.find(t => t.estadoid === i[48]);
            });
            this.service.getListByID(i[48], 'listaCiudadEstado').subscribe(data => {
                this.listaCiudadNac = data;
                let ciudadD = this.listaCiudadNac.find(t => t.ciudaId === i[49]);
                //Localidad
                let path: any;
                path = i[49] + '/' + this.selectedIdLocalidad;
                this.service.getListByID(path, 'listaColoniaCiudad').subscribe(listCol => {
                    this.listaColonias = listCol;

                    //las colonias se cargan des pues de estado ciudad
                    let colonia = this.listaColonias.find(t => t.coloniaID === i[23]);
                    this.formDomicilioRefe.get("coloniaR").setValue(colonia);
                    this.formDomicilioRefe.get('localidadR').setValue(colonia.localidad.nombreLocalidad);
                    //push
                    let tpParen = this.listaParentesco.find(p => p.generalesId === i[2]);
                    console.log(this.listaTipoReferencia);
                    let tipoRef=this.listaTipoReferencia.find(tR=>tR.generalesId===i[1]);
                    console.log(tipoRef);
                    if(tipoRef.cveGeneral==environment.generales.cveBeneficiario){
                        this.listaBeneficiario.push([tpParen.descripcion, i[3],
                            i[5], i[6],
                            i[7], i[41],
                            i[17] + ' No.' + i[18]
                            + ' Col.' + colonia.localidad.nombreLocalidad + ',Ciudad ' + ciudadD.nombre + ';' + estadoD.nombre_estado
                            ]);
                    }else{
                        this.listaRefenciaPersonal.push([tpParen.descripcion, i[3],
                            i[5], i[6],
                            i[7], i[41],
                            i[17] + ' No.' + i[18]
                            + ' Col.' + colonia.localidad.nombreLocalidad + ',Ciudad ' + ciudadD.nombre + ';' + estadoD.nombre_estado
                            ]);
                    }
                    
                  
                });

            });

        }
    }
    /**Abre modal para saber si va actualizar o no
    * @param elemnto Infoamcion de la solicitud 
   */
    verSolicitud() {
        //se abre el modal
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            disableClose: true,
            data: {
                titulo: "",
                body: "¿Quieres actualizar la información del cliente?"
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            //uno es cerrar
            if (result != 1) {
                //modal para ver la solicitud
                this.modalSolicitud();
            } else {
                //desactibar boton de actualizar
                this.tabIndex = 0;
                // para no generar solicitud this.btnActualizar = true;
                this.perfilTab = false;
                this.datoGeneralTab = false;
                this.domicilioTab = false;
                this.perfilInfTab = false;
                this.perfilIngTab = false;
                this.perfilEmpTab = false;
                this.refeTab = false;
                this.digitaTab = false;
            }

        });
    }
    modalSolicitud() {
        //se abre el modal
        const dialogRef = this.dialog.open(SolicitudModalComponent, {
            disableClose: true,
            data: {
                titulo: "Ingresa el número de solicitud",
                body: "para la actualización de datos.",
                etiqueta: "Número de solicitud"
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(sol => {

            if (sol != 1) {
                this.datoGeneralTab = true;
                this.domicilioTab = true;
                this.perfilTab = true;
                this.perfilInfTab = true;
                this.perfilIngTab = true;
                this.perfilEmpTab = true;
                this.refeTab = true;
                this.digitaTab = true;
                this.btnActualizar = false;
                //modal para ver la solicitud
                this.spsSolicitudes(sol);
            } else {
                //desactibar boton de actualizar
                 // para no generar solicitud this.btnActualizar = true;
                this.perfilTab = false;
                this.datoGeneralTab = false;
                this.domicilioTab = false;
                this.perfilInfTab = false;
                this.perfilIngTab = false;
                this.perfilEmpTab = false;
                this.refeTab = false;
                this.digitaTab = false;
            }

        });
    }
    /**Abre modal para crear una solicittud de cambio
   * 
  */
    solicitudCambio() {
        //se abre el modal
        this.dialog.open(ModalSolicitudSucursalComponent, {
            disableClose: true,
            width: '50%',
            data: {
                titulo: "Nueva solicitud",
                accion: 0
            }
        });
    }

    /**
   * Metodo para llenar los campos con la 
   * informacion del cliente
   * @param datos toda la informacion del cliente 
   */
    datosClienteIngEg(datos) {
        let ingresoJSON = JSON.parse(datos.ingresos);
        if (ingresoJSON != null) {
            for (let ingreso of ingresoJSON) {
                this.listAddIngreso.push([
                    ingreso.tipo_id, ingreso.ingreso, ingreso.monto_ingreso
                ]);
            }
        }
        let egresoJSON = JSON.parse(datos.egresos_cl);
        if (egresoJSON != null) {
            for (let egreso of egresoJSON) {
                this.listAddEgreso.push([
                    egreso.tipo_egreso_id, egreso.descripcion, egreso.monto_egreso
                ]);
            }
        }
        this.datosClienteEmpleo(datos);
    }
    /**Metodo para llenar los datos del cliente cuando va a ser una refencia 
     * @param datos informacion completa del cliente
    */
    datosReferencia(datos) {
        this.blockUI.start('Cargando datos...');
        this.sujetoIDR = datos.sujeto_cl;
        this.formReferencias.get("nombresRe").setValue(datos.nombre_cl);
        this.formReferencias.get("apePre").setValue(datos.paterno_cl);
        this.formReferencias.get("apeMre").setValue(datos.materno_cl);
        const convertirEdad = new Date(datos.fecha_nacimiento);
        let timeDiff = Math.abs(Date.now() - convertirEdad.getTime());
        this.formReferencias.get('edadRe').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        this.formReferencias.get("fechaNre").setValue(datos.fecha_nacimiento + 'T00:00:00');
        let genero = this.listaGenero.find(t => t.generalesId === datos.generales_id);
        this.formReferencias.get("generoRe").setValue(genero);
        let nacionalidad = this.listaNac.find(t => t.nacionalidadid === datos.nacionalidadid);
        this.formReferencias.get("nacionalidadNacRef").setValue(nacionalidad);
        this.formReferencias.get("rfcRe").setValue(datos.rfc);
        this.formReferencias.get("curpRe").setValue(datos.curp);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === datos.ecivil_id);
        this.formReferencias.get("civil").setValue(estCivil);
        let path = datos.nacionalidadid + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNacRe = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estado = this.listaEstadosNac.find(es => es.estadoid === datos.estado_id);
            this.formReferencias.get("entFedeNacRe").setValue(estado);
        });
        this.service.getListByID(datos.estado_id, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesRe = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === datos.cd_nac);
            this.formReferencias.get("mpNacRe").setValue(ciudad);
        });
        //Identificacion
        this.identificacionIDR = datos.identificacion_id;//id 
        if (this.identificacionIDR > 0) {
            this.formReferencias.get("claveIdeRe").setValue(datos.num_identificacion.trim());
            this.formReferencias.get("vigenciaIdeRe").setValue(datos.vigencia + 'T00:00:00');
            let tipoIdent = this.listaIdentificacion.find(t => t.generalesId === datos.tipoidenid);
            this.formReferencias.get("tipoIRe").setValue(tipoIdent);
        }
        this.datosRefrenciaDomicilio(datos);
    }
    /**
     * Llena la informacion del domiclio del cliente a ser refencia
     * @param datos Informacion completa del cliente
     */
    datosRefrenciaDomicilio(datos) {
        //Domicilio
        if (datos.domicilio_cl != null) {
            let domicilioClJson = JSON.parse(datos.domicilio_cl);
            for (let domicilio of domicilioClJson) {
                if (domicilio.cvnumdom == environment.generales.principal) {
                    this.domIDR = domicilio.domicilio_id;
                    this.formDomicilioRefe.get("calleR").setValue(domicilio.calle);
                    this.formDomicilioRefe.get("numeroExteriorR").setValue(domicilio.numero_exterior);
                    this.formDomicilioRefe.get("numeroInteriorR").setValue(domicilio.numero_interior);
                    this.formDomicilioRefe.get("entreCalle1R").setValue(domicilio.entre_calle_1);
                    this.formDomicilioRefe.get("entreCalle2R").setValue(domicilio.entre_calle_2);
                    this.formDomicilioRefe.get("referenciaR").setValue(domicilio.referencia);
                    let nacionalidadDR = this.listaNac.find(t => t.nacionalidadid === domicilio.nacionalidadid);
                    this.formDomicilioRefe.get("nacionalidadRef").setValue(nacionalidadDR);
                    let path = domicilio.nacionalidadid + '/2';

                    this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
                        if (!this.vacio(data)) {//no hay datos vacios
                            this.listaEstadosNac = JSON.parse(data[0]);
                            this.opcionesEstadoR = this.formDomicilioRefe.get('estadoR').valueChanges.pipe(
                                startWith(''),
                                map(value => this._filterEstadoNac(value))
                            );
                            let estadoD = this.listaEstadosNac.find(t => t.estadoid === domicilio.estado_id);
                            this.formDomicilioRefe.get("estadoR").setValue(estadoD);
                        }
                    });
                    this.service.getListByID(domicilio.estado_id, 'listaCiudadEstado').subscribe(data => {
                        this.listaCiudadNac = data;
                        this.opcionesCiudadesDomRe = this.formDomicilioRefe.get('ciudadR').valueChanges.pipe(
                            startWith(''),
                            map(value => this._filterCiudadNac(value))
                        );
                        let ciudadD = this.listaCiudadNac.find(t => t.ciudaId === domicilio.ciudad_id);
                        this.formDomicilioRefe.get("ciudadR").setValue(ciudadD);
                        //Localidad
                        let pathC: any;
                        pathC = domicilio.ciudad_id + '/' + this.selectedIdLocalidad;
                        this.service.getListByID(pathC, 'listaColoniaCiudad').subscribe(colC => {
                            this.listaColonias = colC;
                            this.opcionesColoniasR = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
                                startWith(''),
                                map(value => this._filterColonias(value))
                            );
                            //las colonias se cargan des pues de estado ciudad
                            let colonia = this.listaColonias.find(t => t.coloniaID === domicilio.colonia_id);
                            this.formDomicilioRefe.get("coloniaR").setValue(colonia);
                            this.formDomicilioRefe.get('localidadR').setValue(colonia.localidad.nombreLocalidad);
                            this.blockUI.stop();
                        });

                    });
                    this.formDomicilioRefe.get("resExtranjeraR").setValue(domicilio.res_extrajera);
                    this.formDomicilioRefe.get("latitudR").setValue(domicilio.latitud);
                    this.formDomicilioRefe.get("longitudR").setValue(domicilio.longitud);
                    let tarraigo = this.listaTiempoArraigo.find(t => t.generalesId === domicilio.tiempo_arraigo_id);
                    this.formDomicilioRefe.get("tiempoArraigoR").setValue(tarraigo);
                    let jerarquiaD = this.listaJerarquia.find(j => j.generalesId === domicilio.num_domicilio_id);
                    this.formDomicilioRefe.get("jerarquiaR").setValue(jerarquiaD);
                    this.formDomicilioRefe.get("cpRef").setValue(domicilio.cp);
                }
            }//for domicilio
        }
        this.datosReferenciaEmpleo(datos);
    }
    /**
     * Metodo para llenar los  campos con la información del cliente a ser referencia
     * @param datos  toda la informacion del cliente
     */
    datosReferenciaEmpleo(datos) {
        //empleo
        let cuentaEmpleo;
        if (datos.empleos_cl != null) {
            let empleoJSON = JSON.parse(datos.empleos_cl);
            cuentaEmpleo = this.opcionesComprobante.find(v => v.id === true);
            this.cuentaCEmpleo = true;
            for (let empleo of empleoJSON) {
                if (empleo.cve_generales == environment.generales.principal) {
                    this.empleoReferenciaCtrl.setValue(cuentaEmpleo);
                    this.empleoIDR = empleo.empleo_id;
                    let ocupacionEm = this.listaSINCO.find(o => o.ocupacionId === empleo.ocupacion_id);
                    this.formEmpleo.get("ocupacion").setValue(ocupacionEm);
                    this.formEmpleo.get("descripcion").setValue(empleo.observacion);
                    this.formEmpleo.get("inicioLabor").setValue(empleo.fechainicio);
                    this.formEmpleo.get("entrada").setValue(empleo.horario_desde);
                    this.formEmpleo.get("salida").setValue(empleo.horario_hasta); let empresa = this.listaEmpresa.find(o => o.empresaId === empleo.empresa_id);
                    this.formEmpleo.get('empresaT').setValue(empresa);
                    this.formEmpleo.get('razonSocial').setValue(empresa.razonSocial);
                    this.formEmpleo.get('rfcEmpresa').setValue(empresa.rfc);
                    this.formEmpleo.get('repreEmpresa').setValue(empresa.representante);
                    let contrato = this.listaContrato.find(o => o.generalesId === empleo.contrato_id);
                    this.formEmpleo.get("contratoEm").setValue(contrato);
                }
            }
        }
        this.datosReferenciaContacto(datos);
    }
    /**
     * Metodo para llenar los  campos con la información del cliente a ser referencia
     * @param datos  toda la informacion del cliente
     */
    datosReferenciaContacto(datos) {
        //agenda
        if (datos.agendacl != null) {
            let agendaJSON = JSON.parse(datos.agendacl);
            for (let cont of agendaJSON) {
                if (cont.cvejerarquia == environment.generales.principal) {
                    this.agendaIDR = cont.agenda_id;
                    if (this.agendaIDR > 0) {
                        this.formReferencias.get("celRe").setValue(cont.telefono.trim());
                        this.formReferencias.get("emailRe").setValue(cont.correo);
                    }
                }
            }
        }
    }
    /**
     * Metodo que lista las solicitudes de ACTUALIZACION de datos
     * @param datos cliente a buscar solicitudes pendiendientes de actualizacion
     * @accion 2 busca solicitudes pendientes
     */
    spsSolicitudes(numSol: string) {
        let arreglo = {
            "datos": [this.clienteID, numSol],
            "accion": 2
        };
        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(arreglo, 'spsSolicitudesActualiza').subscribe(data => {
            if (!this.vacio(data)) {
                let listaSolicitudesAct = JSON.parse(data);

                this.soActId = listaSolicitudesAct[0].solicitud_act_id;
                let mod = JSON.parse(listaSolicitudesAct[0].modulos);

                for (let seccion of mod) {

                    //desactivar tabs
                    switch (seccion.cve_generales) {
                        case environment.generales.datoGeneralSecc:
                            this.tabIndex = 0;
                            this.datoGeneralTab = false;
                            break;
                        case environment.generales.domicilioSecc:
                            this.tabIndex = 1;
                            this.domicilioTab = false;
                            break;
                        case environment.generales.perfilInfSecc:
                            this.tabIndex = 2;
                            this.perfilTab = false;
                            this.perfilInfTab = false;
                            break;
                        case environment.generales.perfilIngSecc:
                            this.tabIndex = 2;
                            this.perfilTab = false;
                            this.perfilIngTab = false;
                            break;
                        case environment.generales.perfilEmpSecc:
                            this.tabIndex = 2;
                            this.perfilTab = false;
                            this.perfilEmpTab = false;
                            break;
                        case environment.generales.refeSecc:
                            this.tabIndex = 3;
                            this.refeTab = false;
                            break;
                        case environment.generales.digitaSecc:
                            this.tabIndex = 4;
                            this.digitaTab = false;
                            break;
                        default:


                    }
                }

            } else {
                this.btnActualizar = true;
                this.perfilTab = false;
                this.datoGeneralTab = false;
                this.domicilioTab = false;
                this.perfilInfTab = false;
                this.perfilIngTab = false;
                this.perfilEmpTab = false;
                this.refeTab = false;
                this.digitaTab = false;
                this.service.showNotification('top', 'right', 3, "No existe la solicitud o <br> ya se aplicaron los cambios.");
            }
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**Api para modificar la solicitud de actulizacion */
    crudSolActualizacion() {
        let arreglo = {
            "solicitud": [this.soActId
            ],
            "modulo": [],
            "accion": 3
        };

        this.service.registrar(arreglo, 'crudSolActualizacionCl').subscribe(
            crudAut => {
                if (crudAut[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, crudAut[0][1]);
                }
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }
    /**
     * Guardar, Actualizar cliente
     */
    crudCliente(accion) {
        this.blockUI.start('Cargando datos...');
        if (this.formDatosG.invalid) {
            this.validateAllFormFields(this.formDatosG);
            this.service.showNotification('top', 'right', 3, "Completa la información en Datos Generales.");
            this.blockUI.stop();
            return;
        }
        if (this.listAddDom.length <= 0) {
            this.validateAllFormFields(this.formDomicilioCl);
            this.service.showNotification('top', 'right', 3, "Debes agregar una domicilio.");
            this.blockUI.stop();
            return;
        }
       /* if (this.listAddReferencias.length <= 0) {
            this.service.showNotification('top', 'right', 3, "Debes agregar una referencia.");
            this.blockUI.stop();
            return;
        }*/
        if (this.formPerfilTransacional.invalid) {
            this.validateAllFormFields(this.formPerfilTransacional);
            this.service.showNotification('top', 'right', 3, "No se ha completado el perfil transaccional.");
            this.blockUI.stop();
            return;
        }
        if (this.comprobacionIngresos.invalid ||
            this.origenIngreso.invalid ||
            this.tipoPlazo.invalid) {
            this.comprobacionIngresos.markAsTouched({ onlySelf: true });
            this.origenIngreso.markAsTouched({ onlySelf: true });
            this.tipoPlazo.markAsTouched({ onlySelf: true });
            this.service.showNotification('top', 'right', 3, "No se ha completado los ingresos egresos.");
            this.blockUI.stop();
            return;
        }

       /* if (this.formPerfilTransacional.get('actividadRealiza').value.cveGeneral != environment.generales.cveDesempleo && this.listAddEmp.length <= 0) {
            if (this.formEmpleoCl.invalid) {
                this.validateAllFormFields(this.formEmpleoCl);
                this.service.showNotification('top', 'right', 3, "No se ha completado el empleo del cliente.");
                this.blockUI.stop();
                return;
            }
        }*/
        if (this.formDigitalizacion.invalid) {
            this.validateAllFormFields(this.formDigitalizacion);
            this.service.showNotification('top', 'right', 3, "No se ha seleccionado el tipo de socio.");
            this.blockUI.stop();
            return;
        }
        /*this.sumaPorcent = 0;
        for (let ref of this.listAddReferencias) {
            this.sumaPorcent = this.sumaPorcent + parseInt(ref[3]);
        }
        if (this.sumaPorcent < 100 || this.sumaPorcent > 100) {
            this.service.showNotification('top', 'right', 3, "El porcentaje debe ser igual a 100%.");
            this.blockUI.stop();
            return;
        }

        let referenciaIndice = this.listAddReferencias.find(ref => ref[51] === environment.generales.cvPropietarioreal
            || ref[51] === environment.generales.cveProvedorderecursos);
        if (this.vacio(referenciaIndice) && environment.generales.cveTerceros === this.origenIngreso.value.cveGeneral) {
            this.service.showNotification('top', 'right', 3, "No se ha registado un propetario real o prevedor de recursos.");
            this.blockUI.stop();
            return;
        }*/

        /*if (this.listAddAgenCl.length === 0) {
            this.service.showNotification('top', 'right', 3, "Agrega al menos un  contacto del " + this.lblCliente + '.');
            this.blockUI.stop();
            return;
        } else {
            //Se quitan validaciones para agenda cliente
            this.formAgendaCliente.get('tel').setValidators(null);
            this.formAgendaCliente.get('tel').updateValueAndValidity();

            this.formAgendaCliente.get('email').setValidators(null);
            this.formAgendaCliente.get('email').updateValueAndValidity();

            this.formAgendaCliente.get('tipoCont').setValidators(null);
            this.formAgendaCliente.get('tipoCont').updateValueAndValidity();
        }
        for (let ag of this.listAddAgenCl) {
            this.correoCli = ag[2];//correo
        }*/

        let extranjero = {};
        if (this.formDatosG.get('extranjero').value === true) {
            this.personaJuridica = '55PE';//55PE CLIENTE EXTRANJERO
            extranjero = {
                "extranjeroId": 0,
                "clienteID": { "clienteId": this.clienteID },
                "calidadId": this.formDatosG.get('calidad').value,
                "noPasaporte": this.formDatosG.get('pasaporte').value,
                "noPermiso": this.formDatosG.get('permiso').value
            }
        }
        //VACIAR LISTAS
        this.listAddSerivicios = []; this.listAddVinculos = []; this.listAddFcuenta = []; this.listAddMcuenta = [];
        //Se recorren los servicios solo para pasar el tipo de serivicio
        for (let serv of this.formPerfilTransacional.get('tipoServicio').value) {
            this.listAddSerivicios.push([serv.generalesId]);
        }
        //Se recorren los vinculos solo para pasar el tipo de vinculo
        if (this.formPerfilTransacional.get('vinculosAdicionales').value != null) {
            for (let vinc of this.formPerfilTransacional.get('vinculosAdicionales').value) {
                this.listAddVinculos.push([vinc.generalesId]);
            }
        }
        //Se recorren los finalida cuenta solo para pasar el tipo de finalidad
        for (let fcuenta of this.formPerfilTransacional.get('finalidadesCuenta').value) {
            this.listAddFcuenta.push([fcuenta.generalesId]);
        }
        //Se recorren los manejos de cuenta solo para pasar el tipo de manejo
        if (this.formPerfilTransacional.get('manejaCuentas').value != null) {
            for (let mcuenta of this.formPerfilTransacional.get('manejaCuentas').value) {
                this.listAddMcuenta.push([mcuenta.generalesId]);
            }
        }
        let datosCliente = {
            "solicitud": {
                "solicitudId": this.solicitudID,
                "numSolicitud": this.formEncabezado.get('numSolicitud').value,
                "fechaSolicitud": this.formEncabezado.get('fechSolicitud').value,
                "periodicidadMovimientosId": this.formPerfilTransacional.get('periodicidadMovimientos').value,
                "medioEnteroId": this.formPerfilTransacional.get('medioEntero').value == '' ? null : this.formPerfilTransacional.get('medioEntero').value,
                "comprobacionIngresos": this.comprobacionIngresos.value.id,
                "montoAproxAhorrar": this.formPerfilTransacional.get('montoAproxAhorrar').value,
                "montoAproxRetirar": this.formPerfilTransacional.get('montoAproxRetirar').value,
                "numeroOperacion": this.formPerfilTransacional.get('numeroOperacion').value


            },
            "perfil": {
                "perfilId": this.perfilID,
                "nivelEstudiosId": this.formPerfilTransacional.get('nivelEstudios').value,
                "regimenMatrimonialId": this.formPerfilTransacional.get('regimenMatrimonial').value,
                "ocupacionId": this.formPerfilTransacional.get('profesion').value,
                "activiadadEconomicaId": { "cActividadId": null },
                "tipoViviendaId": this.formPerfilTransacional.get('tipoVivienda').value,
                "tipoPlazoId": this.tipoPlazo.value,//periodo ingresos
                "numDependientes": this.formPerfilTransacional.get('numDependientes').value,
                "actividadRealizaId": this.formPerfilTransacional.get('actividadRealiza').value,
                "extPerfil": {
                    "personaActividadEmpresarial": this.actEmpresarial.value,
                    "origenIngresosId": this.origenIngreso.value,
                    "digitalizacion": this.listaDocAgregados
                }
            },
            "ingreso": this.listAddIngreso,
            "egreso": this.listAddEgreso,
            "finalidaC": this.listAddFcuenta,
            "manejoC": this.listAddMcuenta,
            "listaCliente": { "vinculos": this.listAddVinculos },
            "servicio": this.listAddSerivicios,
            "bienMaterial": this.listAddBienes,
            "extCliente": {
                "sujeto": {
                    "sujetoId": this.sujetoID,
                    "nombres": this.formDatosG.get('nombres').value,
                    "apellidoPaterno": this.formDatosG.get('apeP').value,
                    "apellidoMaterno": this.formDatosG.get('apeM').value,
                    "fechaNacimiento": moment(this.formDatosG.get('fechaN').value).format('YYYY-MM-DD'),
                    "generoId": this.formDatosG.get('genero').value,
                    "nacionalidaId": this.formDatosG.get('nacionalidadNac').value,
                    "rfc": this.formDatosG.get('rfc').value.trim(),
                    "curp": this.formDatosG.get('curp').value,
                    "extSujeto": {
                        "estadoCivilId": this.formPerfilTransacional.get('estado_civil').value,
                        "paisNacId": { "estadoid": this.formDatosG.get('entFedeNac').value.estadoid },
                        "ciudadNacId": this.formDatosG.get('mpNac').value
                    }
                },
                "identificacion": {
                    "identificacionId": this.identificaionID,
                    "numIdentificacion": this.formDatosG.get('claveIde').value,
                    "vigencia": moment(this.formDatosG.get('vigenciaIde').value).format('YYYY-MM-DD'),
                    "tipoIdentificacionId": this.formDatosG.get('tipoI').value,
                },
                "agenda": this.listAddAgenCl,
                "cliente": {
                    "clienteId": this.clienteID, "numeroCliente": this.formEncabezado.get('numCliente').value,
                    "fechaIngreso": this.formEncabezado.get('fechSolicitud').value,
                    "estatus": true,
                    "tipoSocioId": this.formDigitalizacion.get('tipoSocio').value,// { "tipoSocioid": 16 },
                    "sucursalId": this.servicePermisos.sucursalSeleccionada,
                    "personalidadId": { "cveGeneral": this.personaJuridica }
                },
                "domicilio": this.listAddDom,
                "empleo": this.listAddEmp,
                "refencia": this.listAddReferencias,
                extranjero,
                "moral": {}
            }
        }
        console.log(datosCliente);
        this.service.registrarBYID(datosCliente, accion, 'crudCliente').subscribe(responseCrud => {
            this.blockUI.stop();
            if (responseCrud[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, responseCrud[0][1]);
                if (responseCrud[0][3] != '') {
                    this.service.showNotification('top', 'right', 3, responseCrud[0][3]);
                    let nombre = this.formDatosG.get('nombres').value + ' ' + this.formDatosG.get('apeP').value + ' ' + this.formDatosG.get('apeM').value;
                    //Notifica por correo operacion inusual
                    let cuerpoTbl: string = '';
                    cuerpoTbl = '<tr><td>' + this.formEncabezado.get('numCliente').value + ' ' + nombre + '</td>'
                        + '<td>' + this.today.toLocaleDateString() + '</td>'
                        + '<td>' + responseCrud[0][3] + '</td></tr>';
                    const data = {
                        "emisor": {
                            "correoID": 0,
                            "cveCorreo": this.listaEmisorCorreo[0].cveCorreo,
                            "numero": this.listaEmisorCorreo[0].numero,
                            "email": this.listaEmisorCorreo[0].email,
                            "usuario": this.encripta.desencriptar(this.listaEmisorCorreo[0].usuario),
                            "contasena": this.encripta.desencriptar(this.listaEmisorCorreo[0].contasena),
                            "servidor": this.listaEmisorCorreo[0].servidor,
                            "puerto": this.listaEmisorCorreo[0].puerto,
                            "tipoNotificacionId": "",
                            "estatus": true,
                            "notificaciones": "",
                            "sucursales": ""
                        },

                        "receptores": [this.correoCli],
                        "asunto": ' ¡¡¡OPERACION INUSUAL !!! ' + this.today.toLocaleDateString(),
                        "cuerpoMensaje": "<head> <style> table {"
                            + "          font-family: Arial, Helvetica, sans-serif;  border-collapse: collapse;"
                            + "          margin-left: auto;  margin-right: auto;}td, th {"
                            + "          padding: 1em;} "
                            + "        tr:nth-child(even){background-color: #f2f2f2;} th {"
                            + "          padding-top: 12px;     padding-bottom: 12px;   text-align: center;"
                            + "          background-color: rgb(32, 101, 210);  color: white;  }"
                            + "         </style>"
                            + "</head>" + "<body> <h1>¡¡¡OPERACION INUSUAL !!! " + this.today.toLocaleDateString() + " </h1>"
                            + "<table id=\"tabla\"> <tr> <th>Cliente</th> <th>Fecha</th>"
                            + "<th>Motivo</th> </tr> " + cuerpoTbl + " </table></body>"
                    }


                    //Se envia el correo de la operacion 
                    this.service.registrar(data, 'enviarCorreoHTML').subscribe();

                }
                if (accion === 2) {
                    //se actualizo un dato actualizar la soliitud de aplicada
                    this.crudSolActualizacion();
                }
                this.limpiarInformacion();
                this.blockUI.stop();
            } else {
                this.service.showNotification('top', 'right', 3, responseCrud[0][1]);
                this.blockUI.stop();
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        }
        );


    }

    /**Perfil transaccional */
    /**
         * Metodo para Seleccionar si cuenta con empleo. Opcion (Si-NO)y que muestre u oculte el formulario.
         * @param dato 
         */
    SeleccionEmpleo(dato) {
        if (dato.value.id === true) {
            this.cuentaCEmpleo = true;
        } else {
            this.cuentaCEmpleo = false;
        }

    }
    /**
     * Metodo de seleccion para la actividad que realiza el cliente
    */
    SeleccionActRealiza(dato) {
        if (dato.value.cveGeneral === '23DS') {
            this.ocultarFormEmpleoCl = false;
        } else {
            this.ocultarFormEmpleoCl = true;
        }
    }

    /**
         * Carga datos de emisor de correo
         * @param  
         */
    spsDatosCorreo() {

        this.isLoadingResults = true;
        this.isResultado = false;
        let cveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;
        const path = environment.globales.cveNotiSocio + "/" + cveSucursal;
        this.service.getListByArregloIDs(path, 'spsCorreosBYCves').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;

                this.listaEmisorCorreo = data;

                this.isLoadingResults = false;
            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'rigth', 4, error.Message);
            });

    }

    /**
     * Mostrar docuemntos del clientes
     * @param cveCli
     */
    mostrarDocumentos(dato) {
        let reporte = 'reporteAvisoPrivacidad'; //'reporteSocieconomico';
        let nombre = 'AVISO_DE_PRIVACIDAD';//'ESTUDIO_SOCIOECONOMICO';
        let numCl = this.formEncabezado.get('numCliente').value
        let calleNum = '';
        let num='';
        this.listaPersonal = [];
        if (dato === 1) {
            reporte = 'reporteSolicitudAdmision'
            nombre = 'SOLICITUD_ADMISION';
            num=this.listAddDom[0][2]==null ?'':this.listAddDom[0][2];
            calleNum = this.listAddDom[0][1] + ' No.' + num;
            this.listaPersonal.push(this.formEncabezado.get('numCliente').value, this.formEncabezado.get('fechSolicitud').value,
                this.formDatosG.get('apeP').value, this.formDatosG.get('apeM').value==null ?'':this.formDatosG.get('apeM').value,
                this.formDatosG.get('nombres').value, moment(this.formDatosG.get('fechaN').value).format('DD-MM-YYYY'),
                this.formDatosG.get('edad').value.toString(), this.formDatosG.get('genero').value.descripcion,
                this.formDatosG.get('rfc').value, this.formDatosG.get('curp').value,
                this.formDatosG.get('nacionalidadNac').value.nacion==null ?'':this.formDatosG.get('nacionalidadNac').value.nacion, this.formDatosG.get('entFedeNac').value==null ?'':this.formDatosG.get('entFedeNac').value.nombre_estado,
                this.formPerfilTransacional.get('estado_civil').value==null ?'':this.formPerfilTransacional.get('estado_civil').value.descripcion, 
                this.formPerfilTransacional.get('regimenMatrimonial').value.descripcion,
                this.formPerfilTransacional.get('nivelEstudios').value==null ?'':this.formPerfilTransacional.get('nivelEstudios').value.descripcion, 
                this.formPerfilTransacional.get('tipoVivienda').value==null ?'':this.formPerfilTransacional.get('tipoVivienda').value.descripcion,
                calleNum, this.nomLocalidad=='' ?'':this.nomLocalidad, this.nomCiudad==null ?'':this.nomCiudad, this.listAddDom[0][14],
                this.nomEstado==null ?'':this.nomEstado, this.listAddAgenCl.length ==0 ?'':this.listAddAgenCl[0][1], this.nomTiempoA, this.nomSucursal
            );
           
            let datosSol = {
                "datoPersonal": this.listaPersonal,
                "datoLaboral": this.listaLaboral,
                "beneficiario": this.listaBeneficiario,
                "referencia": this.listaRefenciaPersonal
            }
            this.service.getListByObjet(datosSol, reporte).subscribe(
                (data: any) => {
                    if (data[0] === '0') {
                        const linkSource = 'data:application/pdf;base64,' + data[2] + '\n';
                        const fileName = nombre + numCl + '.pdf';
                        const downloadLink = document.createElement("a");
                        downloadLink.href = linkSource;
                        downloadLink.download = fileName;
                        downloadLink.click();

                    } else {
                        this.service.showNotification('top', 'right', 4, data[1])
                    }

                }, error => {
                    this.service.showNotification('top', 'rigth', 4, error.Message);
                });

        } else {
//aviso privacidad
            this.service.getListByID(1,reporte).subscribe(
                (data: any) => {
                    if (data[0] === '0') {
                        const linkSource = 'data:application/pdf;base64,' + data[2] + '\n';
                        const fileName = nombre + numCl + '.pdf';
                        const downloadLink = document.createElement("a");
                        downloadLink.href = linkSource;
                        downloadLink.download = fileName;
                        downloadLink.click();

                    } else {
                        this.service.showNotification('top', 'right', 4, data[1])
                    }

                }, error => {
                    this.service.showNotification('top', 'rigth', 4, error.Message);
                });
        }

    }

    /**
    * Valida Cada atributo del formulario
    * @param formGroup - Recibe cualquier tipo de FormGroup
    */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);             //3
            if (control instanceof UntypedFormControl) {             //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //5
                this.validateAllFormFields(control);            //6
            }
        });
    }
    /**
     * Metodo para agregar ingresos y montos
     */
    addListIngreso() {
        if (this.formIngresos.get("ingreso")?.value != null && this.formIngresos.get("monto_ingreso")?.value > 0) {
            let montoIngreso = this.formIngresos.get("monto_ingreso")?.value;
            this.listAddIngreso.push(
                [this.formIngresos.get("ingreso")?.value.generalesId, this.formIngresos.get("ingreso")?.value.descripcion, montoIngreso]
            );
        }
        //Limpiar campos
        this.formIngresos.reset();
    }

    /**
     * Metodo para quitar un ingreso insertado
     * @param index elemento de la lista
     */
    quitarIngreso(index) {
        this.listAddIngreso.splice(index, 1);
    }
    /**
     * Metodo para editar Ingresos
     * @param index elemento de la lista
     */
    editarIngreso(index) {
        let tipoIngr = this.listaTipoIngreso.find(o => o.generalesId === this.listAddIngreso[index][0]);
        this.formIngresos.get("ingreso").setValue(tipoIngr);
        this.formIngresos.get("monto_ingreso").setValue(this.listAddIngreso[index][2]);
        this.listAddIngreso.splice(index, 1);

    }

    /**
     * Metodo para agregar Egresos y montos
     */
    addListEgreso() {
        if (this.formEgresos.get("tipo_egreso")?.value != null && this.formEgresos.get("monto_egreso")?.value > 0) {
            let montoEgreso = this.formEgresos.get("monto_egreso")?.value;
            this.listAddEgreso.push(
                [this.formEgresos.get("tipo_egreso")?.value.generalesId, this.formEgresos.get("tipo_egreso")?.value.descripcion, montoEgreso]
            );
        }
        //Limpiar campos
        this.formEgresos.reset();
    }
    /**
     * Metodo para quitar un egreso insertado
     */
    quitarEgreso(index) {
        this.listAddEgreso.splice(index, 1);
    }
    /**
 * Metodo para editar Ingresos
 * @param index 
 */
    editarEgreso(index) {
        let tipoEgre = this.listaTipoEgreso.find(o => o.generalesId === this.listAddEgreso[index][0]);
        this.formEgresos.get("tipo_egreso").setValue(tipoEgre);
        this.formEgresos.get("monto_egreso").setValue(this.listAddEgreso[index][2]);
        this.listAddEgreso.splice(index, 1);

    }
    tipoBienSeleccion(dato) {
        if (dato.value.cveGeneral === '33CS' || dato.value.cveGeneral === '33TR' || dato.value.cveGeneral === '33DP') {
            this.mostrarEscritura = true;
            this.mostrarAuto = false;
            this.mostrarOtroBien = false;
        }

        if (dato.value.cveGeneral === '33AU') {
            this.mostrarAuto = true;
            this.mostrarEscritura = false;
            this.mostrarOtroBien = false;
        }

        if (dato.value.cveGeneral === '33OT') {
            this.mostrarOtroBien = true;
            this.mostrarEscritura = false;
            this.mostrarAuto = false;
        }

    }

    /**
* Metodo para agregar Egresos y montos
*/
    addListBienes() {
        if (this.formBienes.get('bienesMateriales')?.value != '' && this.formBienes.get('bienesMateriales')?.value != null) {
            let tipoBienID = this.formBienes.get('bienesMateriales')?.value.generalesId;
            let valor_aprox = this.formBienes.get('valor_aprox')?.value;
            let num_escritura = this.formBienes.get('num_escritura_factura')?.value;
            let modelo = this.formBienes.get('modelo')?.value;
            let marca = this.formBienes.get('marca')?.value;
            let otrobien = this.formBienes.get('otrobien')?.value;
            let descripcion = this.formBienes.get('bienesMateriales')?.value.descripcion;
            let cveGeneral = this.formBienes.get('bienesMateriales')?.value.cveGeneral;
            this.listAddBienes.push(
                [this.bienesID, tipoBienID, valor_aprox, num_escritura, modelo, marca, otrobien, descripcion, cveGeneral]
            );
        }
        //se limpian los campos
        this.bienesID = 0;
        this.formBienes.reset();
    }
    /**
     * Metodo para quitar un egreso insertado
     */
    quitarBien(index) {
        this.listAddBienes.splice(index, 1);
    }
    /**Metodo para editar los bienes */
    editarBien(index) {

        this.bienesID = this.listAddBienes[index][0];
        let tipoB = this.listaTipoBien.find(p => p.generalesId === this.listAddBienes[index][1]);
        this.formBienes.get('bienesMateriales').setValue(tipoB);
        if (this.listAddBienes[index][8] === '33CS' || this.listAddBienes[index][8] === '33TR' || this.listAddBienes[index][8] === '33DP') {
            this.mostrarEscritura = true;
            this.mostrarAuto = false;
            this.mostrarOtroBien = false;
        }
        if (this.listAddBienes[index][8] === '33AU') {
            this.mostrarAuto = true;
            this.mostrarEscritura = false;
            this.mostrarOtroBien = false;
        }
        if (this.listAddBienes[index][8] === '33OT') {
            this.mostrarOtroBien = true;
            this.mostrarEscritura = false;
            this.mostrarAuto = false;
        }
        this.formBienes.get('valor_aprox').setValue(this.listAddBienes[index][2]);
        this.formBienes.get('num_escritura_factura').setValue(this.listAddBienes[index][3]);
        this.formBienes.get('modelo').setValue(this.listAddBienes[index][4]);
        this.formBienes.get('marca').setValue(this.listAddBienes[index][5]);
        this.formBienes.get('otrobien').setValue(this.listAddBienes[index][6]);
        this.listAddBienes.splice(index, 1);
    }
    otroEmpleoCl() {
        if (this.formEmpleoCl.invalid) {
            this.validateAllFormFields(this.formEmpleoCl);
            this.blockUI.stop();
            return;
        }
        this.empltbl = true;

        let index = this.listAddEmp.findIndex(res => res[6] === this.formEmpleoCl.get('jerarquiaEmpCl').value.generalesId)
        if (index !== -1) {
            this.empleoID = this.listAddEmp[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo el empleo.');
            this.listAddEmp.splice(index, 1);
        }
        this.listAddEmp.push([
            this.empleoID,
            this.formEmpleoCl.get('ocupacionCl')?.value.ocupacionId,
            this.formEmpleoCl.get('descripcion')?.value,
            this.formEmpleoCl.get('inicioLaborar')?.value,
            this.formEmpleoCl.get('entradaCl')?.value,
            this.formEmpleoCl.get('salidaCl')?.value,
            this.formEmpleoCl.get('jerarquiaEmpCl')?.value.generalesId,
            this.formEmpleoCl.get('empresaTCl')?.value.empresaId,
            this.formEmpleoCl.get('contratoEmCl')?.value.generalesId,
            this.formEmpleoCl.get('rfcEmpresaCl')?.value,
            this.formEmpleoCl.get('razonsocialCl')?.value,
            this.formEmpleoCl.get('repEmpresa')?.value
        ]);
        //Se limpia el formulario del empleoID
        this.empleoID = 0;
        this.inicioLabor = this.formEmpleoCl.get('inicioLaborar')?.value;
        this.formEmpleoCl.reset();
        this.spsPerfilRiesgo();
    }
    /**Metodo para eliminar un empleo de la lista*/
    quitarEmpleoCl(index) {
        //Llamar advertencia
        this.listAddEmp.splice(index, 1);
        //Ocultar si no hay empleo registrados 
        if (this.listAddEmp.length == 0) {
            this.empltbl = false;
        }
    }
    /**
     * Metodo para editra los datos del empleo
     * @param index 
     */
    editarEmpleoCl(index) {
        this.empleoID = this.listAddEmp[index][0];
        this.formEmpleoCl.get('inicioLaborar').setValue(this.listAddEmp[index][3]);
        this.formEmpleoCl.get('entradaCl').setValue(this.listAddEmp[index][4]);
        this.formEmpleoCl.get('salidaCl').setValue(this.listAddEmp[index][5]);
        let ocupacionEmpCl = this.listaSINCO.find(o => o.ocupacionId === this.listAddEmp[index][1]);
        this.formEmpleoCl.get('ocupacionCl').setValue(ocupacionEmpCl);
        this.formEmpleoCl.get('descripcion').setValue(this.listAddEmp[index][2]);
        let empresa = this.listaEmpresa.find(o => o.empresaId === this.listAddEmp[index][7]);
        this.formEmpleoCl.get('empresaTCl').setValue(empresa);
        this.formEmpleoCl.get('razonsocialCl').setValue(this.listAddEmp[index][10]);
        let contrato = this.listaContrato.find(o => o.generalesId === this.listAddEmp[index][8]);
        this.formEmpleoCl.get('contratoEmCl').setValue(contrato);
        this.formEmpleoCl.get('rfcEmpresaCl').setValue(this.listAddEmp[index][9]);
        this.formEmpleoCl.get('repEmpresa').setValue(this.listAddEmp[index][11]);
        let opcionEm = this.listaJerarquia.find(o => o.generalesId === this.listAddEmp[index][6]);
        this.formEmpleoCl.get('jerarquiaEmpCl').setValue(opcionEm);
        //this.listAddEmp.splice(index, 1);
    }
    /**Metodo para conocer la empresa selecciona y obtener su datos 
   * @param event Datos de la empresa
  */
    opcionEmpresaCliente(event) {
        let razon = event.option.value.razonSocial;
        let rfc = event.option.value.rfc;
        let sujeto = event.option.value.representante;
        this.formEmpleoCl.get('razonsocialCl').setValue(razon);
        this.formEmpleoCl.get('rfcEmpresaCl').setValue(rfc);
        this.formEmpleoCl.get('repEmpresa').setValue(sujeto);
    }

    /**
* Muestra la descripcion de la empresa del cliente
*/
    mostrarEmpresaCl(option: any): any {
        return option ? option.nombreComercial : undefined;
    }
    //Digitalaizacion
    buscaDocumentos(dato) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(dato.value.cveSocio, 'listaDocTipoSocios').subscribe(data => {
            this.listaDocTipoSocios = data;
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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
    /**
     * Metodo para subir archivo 
     * @param archivo 
     */
    subirArchivo(archivo, documentos) {

        let limite = documentos.tipoDocumentoID.limiteMB;

        let archivoCapturado = archivo.target.files[0];

        if ((archivo.target.files[0].size * 0.000001) > limite) {
            return this.service.showNotification('top', 'right', 3, 'El limite maximo es ' + limite + ' MB');
        }

        let index = this.listaDocAgregados.findIndex(x => x[1] === documentos.tipoDocumentoID.tipoDocumentoID);
        if (index >= 0) {//Ya existe el documento
            this.docCodificadoID = this.listaDocAgregados[index][3];
            this.listaDocAgregados.splice(index, 1);
        } else {
            this.docCodificadoID = 0;
        }

        this.extraerBase64(archivoCapturado).then((imagen: any) => {
            this.previsualizacion = imagen.base;
            this.listaDocAgregados.push([
                this.previsualizacion,///1
                documentos.tipoDocumentoID.tipoDocumentoID,//2
                documentos.tipoDocumentoID.nombreDoc.trim(), //3
                this.docCodificadoID,//4
                this.servicePermisos.usuario.id//5
            ]);
        });

    }


    /**
     * Metodo que valida los datos vacios
     * @param value -valor a validar
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
        try {
            // nno se usan const unsafeImg = window.URL.createObjectURL($event);
            //no se usan const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
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

    openDialogDoc(documento) {
        let titulo = 'Documento';

        this.dialog.open(DocumentosModalComponent, {
            width: '40%',
            data: {
                titulo: titulo,
                nombre: documento[2],
                documentos: documento
            }
        });
    }


    //Inicia Validaciones Datos Generales del Clietes
    validacionesDatosG = {
        'nombres': [
            { type: 'required', message: 'Campo requerido máximo 100 carácteres.' }],
        'apeP': [
            { type: 'required', message: 'Campo requerido máximo 50 carácteres.' }],
        'fechaN': [
            { type: 'required', message: 'Campo requerido.' }
        ],

        'genero': [
            { type: 'required', message: 'Campo requerido.' }],
        'nacionalidadNac': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no existe.' }],
        'entFedeNac': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La entidad no existe' }],
        'mpNac': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El municipio no existe' }],
        'tipoCont': [
            { type: 'required', message: 'Campo requerido elija tipo de contacto(Principal).' }],
        'tipoI': [
            { type: 'required', message: 'Campo requerido elija una identificación*' }
        ],
        'claveIde': [{ type: 'required', message: 'Campo requerido.' }],
        'email': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'El correo electrónico debe ser una dirección de correo electrónico válida' }
        ],
        'tel': [{ type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Solo números enteros.' },
        ],
        'rfc': [{ type: 'pattern', message: 'No cumple con la estructura.' },],
        'curp': [{ type: 'pattern', message: 'No cumple con la estructura VECJ880326HGTNRSXX.' },],


    }
    //Finaliza validaciones datos generales del cliente

    //Inicia Validaciones para domicilio del clientes
    validacionesDomCl = {
        'catNacionalidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Pais no existe.' }],
        'estado': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Estado no existe.' }],
        'ciudad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La ciudad no existe.' }],
        'catColonia': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Colonia no existe.' }],
        'calle': [
            { type: 'required', message: 'Campo requerido máximo 150 carácteres.' }],
        'entreCalle1': [
            { type: 'required', message: 'Campo requerido máximo 150 carácteres.' }],
        'entreCalle2': [
            { type: 'required', message: 'Campo requerido máximo 150 carácteres.' }],
        'referencia': [
            { type: 'required', message: 'Campo requerido máximo 250 carácteres.' }],
        'numeroExterior': [
            { type: 'required', message: 'Campo requeriro máximo 20 carácteres.' }],
        'tiempoArraigo': [
            { type: 'required', message: 'Campo requerido' }],
        'jerarquia': [
            { type: 'required', message: 'Campo requerido, elija tipo Dom.(Principal).' }
        ]


    }
    //Finaliza validaciones para  domicilio del cliente

    // Inicia Validaciones del perfil transaccional
    validacionesPerfil = {
        'actividadRealiza': [
            { type: 'required', message: 'Campo requerido.' }],
        'tipoServicio': [
            { type: 'required', message: 'Campo requerido, selecciona 1 o más.' }],
        'finalidadesCuenta': [
            { type: 'required', message: 'Campo requerido, selecciona 1 o más.' }],
        'numDependientes': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' },
            { type: 'maxlength', message: 'Campo máximo 2 carácteres.' }
        ],
        'estado_civil': [
            { type: 'required', message: 'Campo requerido.' }],
        'regimenMatrimonial': [
            { type: 'required', message: 'Campo requerido.' }],
        'nivelEstudios': [
            { type: 'required', message: 'Campo requerido.' }],
        'tipoVivienda': [
            { type: 'required', message: 'Campo requerido.' }],
        'medioEntero': [
            { type: 'required', message: 'Campo requerido.' }],
        'periodicidadMovimientos': [
            { type: 'required', message: 'Campo requerido.' }],
        'profesion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La profesión no existe.' }],
        'montoAproxAhorrar': [
            { type: 'required', message: 'Campo requeridio.' },
            { type: 'pattern', message: 'Acepta números decimales.' }],
        'montoAproxRetirar': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Acepta números decimales.' }],
        'numeroOperacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' },
            { type: 'maxlength', message: 'Campo máximo 2 carácteres.' }
        ],
        'vinculosAdicionales': [
            { type: 'required', message: 'Campo requerido, selecciona 1 o más.' }],
        'comprobacionIngresos': [
            { type: 'required', message: 'Campo requerido.' }],
        'tipoPlazo': [
            { type: 'required', message: 'Campo requerido.' }],
        'origenIngreso': [
            { type: 'required', message: 'Campo requerido.' }],
        'ingreso': [
            { type: 'required', message: 'Campo requerido.' }],
        'monto_ingreso': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'pattern', message: 'Acepta números decimales.' }],
        'tipo_egreso': [
            { type: 'required', message: 'Campo requerido.' }],
        'monto_egreso': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'pattern', message: 'Acepta números decimales.' }],

        //Validaciones empleo cliente
        'empresaTCl': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La profesión no existe.' }],
        'contratoEmCl': [
            { type: 'required', message: 'Campo requerido.' }],
        'inicioLaborar': [
            { type: 'required', message: 'Campo requerido.' }],
        'ocupacionCl': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La profesión no existe.' }],
        'jerarquiaEmpCl': [
            { type: 'required', message: 'Campo requerido, Selecciona (Principal).' }],
        'empleoReferenciaCtrl': [
            { type: 'required', message: 'Campo requerido.' }]

    }
    //Finaliza Validaciones Perfil Transaccional
    validacionesReferencias = {
        'tpReferencia': [
            { type: 'required', message: 'Campo requerido.' }],
        'apePre': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 50 carácteres.' }],
        'nombresRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 100 carácteres.' }],
        'fechaNre': [
            { type: 'required', message: 'Campo requerido.' }],
        'generoRe': [
            { type: 'required', message: 'Campo requerido.' }],
        'nacionalidadNacRef': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no existe.' }],
        'entFedeNacRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Entidad F. no existe.' }],
        'mpNacRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Municippio no existe.' }],
        'parentesco': [
            { type: 'required', message: 'Campo requerido.' }],
        'civil': [
            { type: 'required', message: 'Campo requerido.' }],
        'porcentaje': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 3 carácteres.' },
            { type: 'pattern', message: 'Solo números enteros.' }
        ],
        'rfcRe': [{ type: 'pattern', message: 'No cumple con la estructura.' }],
        'tipoIRe': [
            { type: 'required', message: 'Campo requerido.' }],
        'claveIdeRe': [
            { type: 'maxlength', message: 'Campo máximo 20 carácteres.' }],
        'emailRe': [
            { type: 'pattern', message: 'El correo electrónico debe ser una dirección de correo electrónico válida' }],

        //Validaciones para domicilio de la referencia
        'nacionalidadRef': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Pais no existe.' }],
        'estadoR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Estado no existe.' }],
        'ciudadR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Ciudad no existe.' }],
        'coloniaR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Colonia no existe.' }],
        'calleR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 carácteres.' }],
        'entreCalle1R': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 carácteres.' }],
        'entreCalle2R': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 carácteres.' }],
        'referenciaR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 250 carácteres.' }],
        'numeroExteriorR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 20carácteres.' }],
        'tiempoArraigoR': [
            { type: 'required', message: 'Campo requerido.' }],
        'jerarquiaR': [
            { type: 'required', message: 'Campo requerido, Seleccione (Principal).' },],
        'tipoSocio': [
            { type: 'required', message: 'Campo requerido.' }],
        'empresaT': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Empresa no existe.' }],
        'contratoEm': [
            { type: 'required', message: 'Campo requerido.' }],
        'inicioLabor': [
            { type: 'required', message: 'Campo requerido.' }],
        'ocupacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Ocupación no existe.' }]

    }
    /**
     * Metodo para borrar los datos del cliente al guardar o actualizar
     */
    vaciarInformacion() {

        Swal.fire({
            title: '¿Esta seguro?',
            text: "¡Se perderan los datos capturados!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                this.limpiarInformacion();
            }
        })

    }

    /**
     * Metodo para borrar los datos del cliente al guardar o actualizar
     */
    limpiarInformacion() {
        //encabezado 
        this.tabIndex = 0;
        this.formEncabezado.get('numCliente').setValue('');
        this.formEncabezado.get('cliente').setValue('');
        this.formEncabezado.get('perfilRiesgo').setValue('');
        this.formEncabezado.get('numSolicitud').setValue('');
        this.formEncabezado.get('tipoCliente').setValue('');
        this.formEncabezado.get('estatusAct').setValue('');
        this.formDatosG.reset();//Datos generales del cliente
        this.formDomicilioCl.reset();//Domicilios del cliente
        this.formPerfilTransacional.reset();//Perfil transaccional del cliente
        this.formReferencias.reset();//Datos generales Referencia
        this.formDomicilioRefe.reset();//Domicilio referencia
        this.formDomicilioRefe.get("resExtranjeraR").setValue(false);
        this.formEmpleoCl.reset();
        this.formEmpleo.reset();//empelo refenrecia
        this.formDigitalizacion.get('tipoSocio').setValue('');
        this.formAgendaCliente.reset();
        //limpiar listas
        this.listAddAgenCl = [];
        this.listAddDom = [];
        this.listAddBienes = [];
        this.listAddIngreso = [];
        this.listAddEgreso = [];
        this.listAddEmp = [];
        this.listAddReferencias = [];
        this.listaDocAgregados = [];
        //Ocultar lista
        this.agentbl = false;
        this.extranjero = false;
        this.domtbl = false;
        this.empltbl = false;
        this.refetbl = false;
        //regresar valores 
        this.solicitudID = 0;
        this.perfilID = 0;
        this.sujetoID = 0;
        this.identificaionID = 0;
        this.agendaID = 0;
        this.clienteID = 0;
        this.domID = 0;
        this.bienesID = 0;
        this.empleoID = 0;
        this.identificacionID = 0;
        this.refenciaID = 0;
        this.sujetoIDR = 0;
        this.agendaIDR = 0;
        this.identificacionIDR = 0;
        this.domIDR = 0;
        this.empleoIDR = 0;
        this.extranjeroID = 0;
        this.moralID = 0;
        this.empresaID = 0;
        this.detalleEmId = 0;
        this.personaJuridica = '55PF';
        this.docCodificadoID = 0;
        this.formEncabezado.get('numSolicitud').setValue(0);
        this.formEncabezado.get('numCliente').setValue(0);
        this.formDatosG.get('vigenciaIde').setValue(new Date());
        this.formReferencias.get('vigenciaIdeRe').setValue(new Date());

        //tabs
        this.datoGeneralTab = false;
        this.domicilioTab = false;
        this.perfilTab = false;
        this.perfilInfTab = false;
        this.perfilIngTab = false;
        this.perfilEmpTab = false;
        this.refeTab = false;
        this.digitaTab = false;
    }
}