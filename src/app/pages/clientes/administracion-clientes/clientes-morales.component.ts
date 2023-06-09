import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { PermisosService } from "../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CombosClienteService, GestionGenericaService } from "../../../shared/service/gestion";
import { environment } from '../../../../environments/environment';
import { MatDialog } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { DocumentosModalComponent } from "../../../pages/modales/documentos-modal/documentos-modal.component";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { MatStepper } from "@angular/material/stepper";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { BuscarEmpresaComponent } from "../../../pages/modales/empresa-modal/buscar-empresa.component";
import { globales } from '../../../../environments/globales.config';
import { SolicitudModalComponent } from "../../../pages/modales/solicitud-modal/solicitud-modal.component";
import { ModalPldComponent } from "./modal-pld/modal-pld.component";
import * as moment from "moment";

@Component({
    selector: 'clientes-morales',
    moduleId: module.id,
    templateUrl: 'clientes-morales.component.html',
    styleUrls: ['clientes.component.css']

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 10/12/2021
 * @descripcion: Componente para la gestion de clientes Morales
 */
export class ClientesMComponent implements OnInit {
    //@ViewChild(EmpresaComponent) empresas: EmpresaComponent;
    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild('stepper') stepper: MatStepper;


    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;


    nombreTab: string = 'Cliente Moral';
    formPerfilTransacional: UntypedFormGroup;
    formEncabezado: UntypedFormGroup;
    formReferencias: UntypedFormGroup;
    formDomicilioRefe: UntypedFormGroup;
    formEmpleo: UntypedFormGroup;
    empleoReferenciaCtrl = new UntypedFormControl('');
    today = new Date();
    //listas combos
    listaManejoCtas: any = [];
    listaFinalidadCta: any = [];
    listaMedioDifusion: any = [];
    listaTipoPlazo: any = [];
    listaVinculosA: any = [];
    listaTipoIngreso: any = [];
    listaTipoEgreso: any = [];
    listaScian: any = [];
    opcionesScian: Observable<string[]>;
    listaEmpresa: any = [];
    opcionesEmpresa: Observable<string[]>;
    opcionesEmpresaCL: Observable<string[]>;
    opcionesComprobante = [{ id: true, desc: 'Si' },
    { id: false, desc: 'No' }];
    //combos refencias 
    listaTipoReferencia: any = [];
    listaGenero: any = [];
    listaNacionNac: any = [];
    opcionesNac: Observable<string[]>;
    opcionesNacionalidad: Observable<string[]>;
    nacionalidadId: number = 0;
    listaEstadosNac: any = [];
    opcionesEstadoNac: Observable<string[]>;
    opcionesEstados: Observable<string[]>
    estadoSeleccionado: number = 0;
    listaCiudadNac: any = [];
    opcionesCiudades: Observable<string[]>;
    opcionesCiudadesDomRe: Observable<string[]>;
    ciudadSeleccionada: number = 0;
    selectedIdLocalidad: number = 0;
    opcionesColonias: Observable<string[]>;
    listaColonias: any = [];
    listaParentesco: any = [];
    listaEstCivil: any = [];
    listaIdentificacion: any = [];
    listaTiempoArraigo: any = [];
    listaJerarquia: any = [];
    listaEmpresaEm: any = [];
    opcionesEmpresaEm: Observable<string[]>;
    listaSINCO: any = [];
    opcionesSINCO: Observable<string[]>;
    listaContrato: any = [];
    //listas ingresos egresos
    listAddIngreso: any = [];
    listAddEgreso: any = [];
    listAddReferencias: any = [];//refencias del cliente Moral
    listAddVinculos: any = [];
    listAddFcuenta: any = [];
    listAddMcuenta: any = [];
    //Lista digitalizacion clientes morales
    listaTipoSocios: any = [];
    listaDocTipoSocios: any = [];
    listaDocAgregados: any = []; // lista para digitalizacion
    public previsualizacion: string;
    //IDs a ocupar
    solicitudID: number = 0;
    perfilID: number = 0;
    identificaionID: number = 0;
    agendaID: number = 0;
    clienteID: number = 0;
    domID: number = 0;
    empleoID: number = 0;
    identificacionID = 0;
    refenciaID: number = 0;
    moralID: number = 0;
    personaJuridica: string = '55PM';//Moral Saber si es persona Fisica= 362 o Extranjera =364
    docCodificadoID: number = 0;
    sujetoID = 0;
    parentescoRef: any = "";
    sumaPorcent: number = 0;
    listRefEncontrada: any = [];
    cuentaCEmpleo = false; // combo para seleccionar si cuenta con empleo el cliente.
    nomComercial = new UntypedFormControl('');
    rSocial = new UntypedFormControl('');
    rfcEm = new UntypedFormControl('');
    repreEmp = new UntypedFormControl('');
    clienteMoralID = new UntypedFormControl('', [Validators.required]);

    /**Control de tabs para la actualizacion */
    datoGeneralTab: boolean = false;
    perfilTab: boolean = false;
    refeTab: boolean = false;
    digitaTab: boolean = false;
    btnActualizar: boolean = false;
    tabIndex: number = 0;
    soActId: number = 0;
    /**PLD */
    nacionalidadPLD: number = 0;
    estadoBuro: number = 0;
    ciudadId: number = 0;

    constructor(private serviceCombo: CombosClienteService, private service: GestionGenericaService, private servicePermisos: PermisosService, private formBuilder: UntypedFormBuilder, public dialog: MatDialog, private sanitizer: DomSanitizer) {
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

        this.formPerfilTransacional = this.formBuilder.group({
            manejaCuentas: new UntypedFormControl('',),
            finalidadesCuenta: new UntypedFormControl('', [Validators.required]),
            medioEntero: new UntypedFormControl('', [Validators.required]),
            periodicidadMovimientos: new UntypedFormControl('', [Validators.required]),
            actividadscian: new UntypedFormControl('', [Validators.required]),
            montoAproxAhorrar: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            numeroOperacion: new UntypedFormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern('[0-9]*')]),
            vinculosAdicionales: new UntypedFormControl('',),
            comprobacionIngresos: new UntypedFormControl('', [Validators.required]),
            ingreso: new UntypedFormControl('', [Validators.required]),
            monto_ingreso: new UntypedFormControl('0', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            tipo_egreso: new UntypedFormControl('', [Validators.required]),
            monto_egreso: new UntypedFormControl('0', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            fechConst: new UntypedFormControl('', [Validators.required]),
            noActa: new UntypedFormControl(''),
            noFolio: new UntypedFormControl(''),
            regPublico: new UntypedFormControl(''),
            porcentajeAcc: new UntypedFormControl('', Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')),
            activos: new UntypedFormControl(''),
            efirma: new UntypedFormControl('')
        });
        this.formReferencias = this.formBuilder.group({
            tpReferencia: new UntypedFormControl('', [Validators.required]),
            apePre: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
            apeMre: new UntypedFormControl(''),
            nombresRe: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
            fechaNre: new UntypedFormControl('', [Validators.required]),
            edadRe: new UntypedFormControl('0'),
            generoRe: new UntypedFormControl('', [Validators.required]),
            rfcRe: new UntypedFormControl('', Validators.pattern(/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/)),
            nacionalidadNacRef: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            entFedeNacRe: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            curpRe: new UntypedFormControl('', Validators.pattern(/^[A-Z]{4}\d{6}[H,M][A-Z]{5}[A-Z0-9]{2}$/)),
            mpNacRe: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            celRe: new UntypedFormControl('', [Validators.required, Validators.maxLength(10), Validators.pattern('[0-9]*')]),
            emailRe: new UntypedFormControl(''),
            tipoIRe: new UntypedFormControl('', [Validators.required]),
            claveIdeRe: new UntypedFormControl('', [Validators.required]),
            vigenciaIdeRe: new UntypedFormControl('', [Validators.required]),
            civil: new UntypedFormControl('', [Validators.required]),
            parentesco: new UntypedFormControl('', [Validators.required]),
            porcentaje: new UntypedFormControl('', [Validators.required, Validators.maxLength(3), Validators.pattern('[0-9]*')])

        });
        this.formDomicilioRefe = this.formBuilder.group({
            calleR: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle1R: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle2R: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            referenciaR: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            numeroExteriorR: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            numeroInteriorR: new UntypedFormControl(''),
            estadoR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudadR: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            localidadR: new UntypedFormControl('',),
            coloniaR: new UntypedFormControl(''),
            nacionalidadRef: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            latitudR: new UntypedFormControl('',),
            longitudR: new UntypedFormControl('',),
            resExtranjeraR: new UntypedFormControl(false),
            tiempoArraigoR: new UntypedFormControl('', [Validators.required]),
            jerarquiaR: new UntypedFormControl('',),
            cpRef: new UntypedFormControl('',)
        });

        this.formEmpleo = this.formBuilder.group({
            razonSocial: new UntypedFormControl(''),
            entrada: new UntypedFormControl('', Validators.required),
            salida: new UntypedFormControl('', Validators.required),
            rfcEmpresa: new UntypedFormControl(''),
            contratoEm: new UntypedFormControl('', [Validators.required]),
            inicioLabor: new UntypedFormControl('', [Validators.required]),
            ocupacion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            descripcion: new UntypedFormControl(''),
            empresaT: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            repreEmpresa: new UntypedFormControl('')
        });
    }


    /**
  * Metodo OnInit de la clase
  */
    ngOnInit() {
        this.spsOcupacionesSCIAN();
        this.spsMorales();
        this.spsNacionalidadNac();
        //this.spsEstadoNac();
        this.spsEmpresasEm();
        this.spsOcupacionesSINCO();
        this.buscaDocumentos();
    }
    /**
* Metodo para invocar la lista de combos 
* 0 empresa, 1 perfil
* */
    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        this.nombreTab = changeEvent.tab.textLabel;
        //changeEvent.index == 1

    }
    /**
     * Cargar las lista de los combos
     */
    cargarCombos() {

        this.listaManejoCtas = this.serviceCombo.listaManejoCtas;
        this.listaFinalidadCta = this.serviceCombo.listaFinalidadCta;
        this.listaMedioDifusion = this.serviceCombo.listaMedioDifusion;
        this.listaTipoPlazo = this.serviceCombo.listaTipoPlazo;
        this.listaVinculosA = this.serviceCombo.listaVinculosA;
        this.listaTipoIngreso = this.serviceCombo.listaTipoIngreso;
        this.listaTipoEgreso = this.serviceCombo.listaTipoEgreso;
        this.listaTipoReferencia = this.serviceCombo.listaTipoReferencia;
        let relacion = [];
        for (let refMoral of this.listaTipoReferencia) {
            //representante legal y personal
            if (refMoral.cveGeneral == '31RP' || refMoral.cveGeneral == '31FE') {
                relacion.push(refMoral);
            }

        } this.listaTipoReferencia = relacion;
        this.listaGenero = this.serviceCombo.listaGenero;
        this.listaParentesco = this.serviceCombo.listaParentesco;
        this.listaEstCivil = this.serviceCombo.listaEstCivil;
        this.listaIdentificacion = this.serviceCombo.listaIdentificacion;
        this.listaTiempoArraigo = this.serviceCombo.listaTiempoArraigo;
        this.listaJerarquia = this.serviceCombo.listaJerarquia;
        let principal = this.listaJerarquia.find(j => j.cveGeneral == environment.generales.principal);
        this.formDomicilioRefe.get('jerarquiaR').setValue(principal);
        this.listaContrato = this.serviceCombo.listaContrato;
        this.listaTipoSocios = this.serviceCombo.listaTipoSocios;
    }
    /**
  * Listar OCUPACIONES SCIAN 
  */
    spsOcupacionesSCIAN() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaClaseActividades').subscribe(data => {
            this.listaScian = data;
            this.opcionesScian = this.formPerfilTransacional.get('actividadscian').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSCIAN(value))

            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Muestra la descripcion de la ocupacion
    * @param option --ocupacion scian seleccionada
    * @returns --nombre de la ocupacion scian
    */
    mostrarOcupacion(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filtra las ocupaciones SCIAN
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSCIAN(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaScian.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
    /**
     * Metodo para conocer en base a la actividad el riesgo de la persona
     */
    seleccionScian(scian) {
        this.spsPerfilRiesgo();
    }
    /**
 * Listar empresas MORAL  para cliente y referencia
 * @param '02EM' clave de empresa moral
 */
    spsMorales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('02EM', 'listaTipoEmpresa').subscribe(data => {
            this.listaEmpresa = data;
            this.opcionesEmpresa = this.clienteMoralID.valueChanges.pipe(
                startWith(''),
                map(value => this._filterMoral(value))
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
    mostrarEmpresaCl(option: any): any {
        return option ? option.nombreComercial : undefined;
    }

    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterMoral(value: any): any {

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
    /**
     * Metodo para agregar ingresos y montos
     */
    addListIngreso() {
        if (this.formPerfilTransacional.get("ingreso")?.value != null && this.formPerfilTransacional.get("monto_ingreso")?.value > 0) {
            this.listAddIngreso.push([this.formPerfilTransacional.get("ingreso")?.value.generalesId,
            this.formPerfilTransacional.get("ingreso")?.value.descripcion,
            this.formPerfilTransacional.get("monto_ingreso")?.value]
            );
        }
        //Limpiar campos
        this.formPerfilTransacional.get("monto_ingreso").setValue('0');

    }

    /**
     * Metodo para quitar un ingreso insertado
     */
    quitarIngreso(index) {
        this.listAddIngreso.splice(index, 1);
    }
    /**
     * Metodo para editar Ingresos
     * @param index 
     */
    editarIngreso(index) {
        let tipoIngr = this.listaTipoIngreso.find(o => o.generalesId === this.listAddIngreso[index][0]);
        this.formPerfilTransacional.get("ingreso").setValue(tipoIngr);
        this.formPerfilTransacional.get("monto_ingreso").setValue(this.listAddIngreso[index][2]);
        this.listAddIngreso.splice(index, 1);

    }
    /**
     * Metodo para agregar Egresos y montos
     */
    addListEgreso() {
        if (this.formPerfilTransacional.get("tipo_egreso")?.value != null && this.formPerfilTransacional.get("monto_egreso")?.value > 0) {
            this.listAddEgreso.push(
                [this.formPerfilTransacional.get("tipo_egreso")?.value.generalesId,
                this.formPerfilTransacional.get("tipo_egreso")?.value.descripcion,
                this.formPerfilTransacional.get("monto_egreso")?.value]
            );
        }
        //Limpiar campos
        this.formPerfilTransacional.get("monto_egreso").setValue('0');

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
        this.formPerfilTransacional.get("tipo_egreso").setValue(tipoEgre);
        this.formPerfilTransacional.get("monto_egreso").setValue(this.listAddEgreso[index][2]);
        this.listAddEgreso.splice(index, 1);

    }
    /**
       * Listar nacionalidades activas para cliente y referencia
       * @param 2 nacionalidades activas
       */
    spsNacionalidadNac() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(2, 'listaNacionalidades').subscribe(data => {
            this.listaNacionNac = data;

            this.opcionesNac = this.formReferencias.get('nacionalidadNacRef').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value))
            );
            this.opcionesNacionalidad = this.formDomicilioRefe.get('nacionalidadRef').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value)))
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
        return this.listaNacionNac.filter(option => option.nacion.toLowerCase().includes(filterValue));
    }
    /**
   * Metodo para saber que nacionalidad fue seleccionada
   * @param opcion nacionalidad id selecciona
   * @param accion numero de combo a cargar
   */

    opcionSeleccionadaNacionalidad(opcion, accion) {
        if (opcion.option.value.codigopld != "MX") {
            if (accion === 2) {
                this.service.showNotification('top', 'right', 2, 'Se ha seleccionado un país diferente a México.');
            }
        }
        this.nacionalidadId = opcion.option.value.nacionalidadid;
        //cargar estados 
        this.spsEstadoNac(accion);
    }
    /**
    * Listar los estados activos para clientes y referencias
    */
    spsEstadoNac(accion: number) {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        let path = this.nacionalidadId + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hya datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                if (accion == 1) {
                    this.opcionesEstadoNac = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterEstadoNac(value))
                    );
                } else if (accion == 2) {
                    this.opcionesEstados = this.formDomicilioRefe.get('estadoR').valueChanges.pipe(
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
        this.estadoSeleccionado = event.option.value.estadoid;
        this.spsCiudadNac();
        //Generar CURP y RFC  
        this.generarCurp();
    }
    /**
        * Metodo que lista ciudades por Estado ID fitlrado, para referencias y clientes
        */

    spsCiudadNac() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.estadoSeleccionado, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            this.opcionesCiudadesDomRe = this.formDomicilioRefe.get('ciudadR').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );


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
    * Metodo para filtrar por ciudad ID las localidades
      @param event ciudad seleccionda referencia
    */
    opcionSelecCiudadR(event) {
        this.ciudadSeleccionada = event.option.value.ciudaId;
        this.spsColonias();
    }
    /** 
       * Método que consulta y lista colonias por ciudadId o LocalidadID
       */
    spsColonias() {
        this.blockUI.start('Cargando datos...');
        let path: any;
        path = this.ciudadSeleccionada + '/' + this.selectedIdLocalidad;
        this.service.getListByID(path, 'listaColoniaCiudad').subscribe(data => {
            this.blockUI.stop();
            this.listaColonias = data;

            this.opcionesColonias = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
                startWith(''),
                map(value => this._filterColonias(value))
            );
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
        this.formDomicilioRefe.get('localidadR').setValue(nomLocalidad);
        this.formDomicilioRefe.get('cpRef').setValue(event.option.value.codP);

    }
    /**
* Listar empresas  para referencia
* @param '01EE', 'listaTipoEmpresa' clave de empresa empleadora
*/
    spsEmpresasEm() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaEmpresa').subscribe(data => {
            this.listaEmpresaEm = data;

            this.opcionesEmpresaEm = this.formEmpleo.get('empresaT').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEmpresaEm(value))
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
    private _filterEmpresaEm(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEmpresaEm.filter(option => option.nombreComercial.toLowerCase().includes(filterValue));
    }
    /**
     * Metodo para obtener los datos del  empresa moral
     * @param clMoral datos de la empresa moral 
     */
    seleccionClMoral(clMoral) {
        this.nomComercial.setValue(clMoral.option.value.nombreComercial);
        this.rSocial.setValue(clMoral.option.value.razonSocial);
        this.rfcEm.setValue(clMoral.option.value.rfc);
        this.repreEmp.setValue(clMoral.option.value.representante);
        //Llamar perfil riesgo
        for (let i of JSON.parse(clMoral.option.value.domicilios)) {
            if (i.cveDomicilio == environment.generales.principal) {//01DP
                this.nacionalidadPLD = i.codigopld;
                this.estadoBuro = i.cveEstBuro;
                this.ciudadId = i.ciudad_id;
            }
            this.spsPerfilRiesgo();
        }

    }
    /**
     * Metodo para obtener los datos de la empresa de trabajo
     * @param empresa 
     */
    opcionEmpresaRefe(empresa) {
        this.formEmpleo.get('razonSocial').setValue(empresa.option.value.razonSocial);
        this.formEmpleo.get('rfcEmpresa').setValue(empresa.option.value.rfc);
        this.formEmpleo.get('repreEmpresa').setValue(empresa.option.value.representante);
    }
    /**
* Listar OCUPACIONES SINCO GUILLE LO TIENE COMO COMBO
*/
    spsOcupacionesSINCO() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(2, 'listaOcupacionesSinco').subscribe(data => {
            this.listaSINCO = data;
            this.opcionesSINCO = this.formEmpleo.get('ocupacion').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSINCO(value))
            );
            this.blockUI.stop();
            this.cargarCombos();
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
    mostrarSINCO(option: any): any {
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
        return this.listaSINCO.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
    /*Metodo para calcular edad del cliente */
    calcularEdad() {
        const convertAge = new Date(moment(this.formReferencias.get('fechaNre').value).format('YYYY-MM-DD'));
        let timeDiff = Math.abs(Date.now() - convertAge.getTime());

        this.formReferencias.get('edadRe').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        this.buscarSujeto();
    }
    /**
     * Valida la coincidencia de fechas.
     */
    validaCurpRfc() {
        let nacimiento = moment(this.formReferencias.get('fechaNre').value).format('YYMMDD')
        let rfc = this.formReferencias.get('rfcRe').value.substring(4, 10);
        let curp = this.formReferencias.get('curpRe').value.substring(4, 10);
        if (nacimiento != rfc || nacimiento != curp) {
            this.service.showNotification('top', 'right', 3, "La fecha de nacimiento no corresponden con RFC o CURP.");
        }
        if (rfc != curp) {
            this.service.showNotification('top', 'right', 3, "Las fechas en RFC o CURP no corresponden.");
        }
    }
    /**
     * Genera la curp y RFC
     */
    generarCurp() {
        if (!this.vacio(this.formReferencias.get('nombresRe').value) &&
            !this.vacio(this.formReferencias.get('fechaNre').value) &&
            !this.vacio(this.formReferencias.get('entFedeNacRe').value) &&
            !this.vacio(this.formReferencias.get('apePre').value) &&
            !this.vacio(this.formReferencias.get('generoRe').value)) {
            let sexo = this.formReferencias.get('generoRe').value.descripcion.toUpperCase();
            let municipio = this.formReferencias.get('entFedeNacRe').value.nombre_estado.toUpperCase();
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

    /**Metodo para buscar un sujeto registrado que coincida con el q se va a registrar 
     * @param sujeto para ser refencia
    */
    buscarSujeto() {
        this.blockUI.start('Cargando datos...');
        let sujeto = {};
        sujeto = {
            "nombres": this.formReferencias.get('nombresRe').value,
            "apellidoPaterno": this.formReferencias.get('apePre').value,
            "apellidoMaterno": this.formReferencias.get('apeMre').value,
            "fechaNacimiento": this.formReferencias.get('fechaNre').value,
        }

        this.service.getListByObjet(sujeto, 'buscarSujeto').subscribe(data => {
            if (data[0].referencias != null) {
                this.listRefEncontrada = JSON.parse(data[0].referencias);
                var encabezado = "Se encontraron datos de la persona a registrar como referencia.";
                var body = "¿Deseas cargar su información?";

                this.abrirAdvertencia(encabezado, body, "sujeto");

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
        });

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
        let datos = {
            "datos": [this.formEncabezado.get('numCliente').value,//No.cliente
            this.rSocial.value,
            this.rfcEm.value,
            this.nomComercial.value,
            this.formPerfilTransacional.get('actividadscian').value.cActividadId,// id
            this.nacionalidadPLD,
            this.estadoBuro,
            this.ciudadId,
            this.formPerfilTransacional.get('fechConst').value, //fechaContitucion
                "M" //tipo de persona
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
* Abrir ventana modal de confirmacion para el domicilio y los datos de un sujeto registrado
@param encabezado titulo para la venta modal
@param body cuerpo de la venta modal
@param accion acorde a lo que  va a mostrar la venta modal
* */
    abrirAdvertencia(encabezado, body, accion: string) {
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0 && accion == 'sujeto') {//aceptar
                this.sujetoAReferencia();
            }
        });
    }
    sujetoAReferencia() {
        let findGenero = this.listaGenero.find(i => i.descripcion === this.listRefEncontrada[0].genero);
        let findCivil = this.listaEstCivil.find(i => i.descripcion === this.listRefEncontrada[0].civil);
        let findNacionalidadNac = this.listaNacionNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad);
        let findEstadoNac = this.listaEstadosNac.find(i => i.nombreEstado === this.listRefEncontrada[0].nombre_estado);
        let findTipoIdent = this.listaIdentificacion.find(i => i.descripcion === this.listRefEncontrada[0].tipo_ident);
        //llenar campos de datos generales del sujeto encontrado
        this.sujetoID = this.listRefEncontrada[0].sujeto_id;
        this.formReferencias.get('nombresRe').setValue(this.listRefEncontrada[0].nombres);
        this.formReferencias.get('apePre').setValue(this.listRefEncontrada[0].apellido_paterno);
        this.formReferencias.get('apeMre').setValue(this.listRefEncontrada[0].apellido_materno);
        this.formReferencias.get('fechaNre').setValue(this.listRefEncontrada[0].fecha_nacimiento + 'T00:00:00');
        this.formReferencias.get('generoRe').setValue(findGenero);
        this.formReferencias.get('nacionalidadNacRef').setValue(findNacionalidadNac);
        this.formReferencias.get('rfcRe').setValue(this.listRefEncontrada[0].rfc);
        this.formReferencias.get('curpRe').setValue(this.listRefEncontrada[0].curp);
        this.formReferencias.get('civil').setValue(findCivil);
        this.formReferencias.get('entFedeNacRe').setValue(findEstadoNac);
        this.service.getListByID(this.listRefEncontrada[0].estado_id, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listRefEncontrada[0].ciudad_id);
            this.formReferencias.get("mpNacRe").setValue(ciudad);

        });
        this.identificacionID = this.listRefEncontrada[0].identificacion_id;
        this.formReferencias.get('claveIdeRe').setValue(this.listRefEncontrada[0].num_identificacion);
        this.formReferencias.get('vigenciaIdeRe').setValue(this.listRefEncontrada[0].vigencia + 'T00:00:00');
        this.formReferencias.get('tipoIRe').setValue(findTipoIdent);
        //llenar lista agenda con los datos a editar   
        this.agendaID = this.listRefEncontrada[0].agenda_id;
        if (this.agendaID > 0) {
            this.formReferencias.get('celRe').setValue(this.listRefEncontrada[0].telefono.trim());
            this.formReferencias.get('emailRe').setValue(this.listRefEncontrada[0].correo);
        }
        //Domicilios
        let findNacionalidadDom = this.listaNacionNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad_dom);
        let findEstadoDom = this.listaEstadosNac.find(i => i.nombreEstado === this.listRefEncontrada[0].estado_dom);
        let findTiempoArra = this.listaTiempoArraigo.find(i => i.descripcion === this.listRefEncontrada[0].tiempo_arraigo);
        let findJerarquia = this.listaJerarquia.find(i => i.descripcion === this.listRefEncontrada[0].jerarquia);
        this.domID = this.listRefEncontrada[0].domicilio_id;
        if (this.domID > 0) {
            this.formDomicilioRefe.get("calleR")?.setValue(this.listRefEncontrada[0].calle);
            this.formDomicilioRefe.get("numeroExteriorR").setValue(this.listRefEncontrada[0].numero_exterior);
            this.formDomicilioRefe.get("numeroInteriorR").setValue(this.listRefEncontrada[0].numero_interior);
            this.formDomicilioRefe.get("entreCalle1R").setValue(this.listRefEncontrada[0].entre_calle_1);
            this.formDomicilioRefe.get("entreCalle2R").setValue(this.listRefEncontrada[0].entre_calle_2);
            this.formDomicilioRefe.get("referenciaR").setValue(this.listRefEncontrada[0].referencia);
            this.formDomicilioRefe.get("nacionalidadRef").setValue(findNacionalidadDom);
            this.formDomicilioRefe.get("estadoR").setValue(findEstadoDom);
            this.formDomicilioRefe.get("cpRef").setValue(this.listRefEncontrada[0].codigo_postal);
            this.service.getListByID(this.listRefEncontrada[0].estado_id, 'listaCiudadEstado').subscribe(data => {
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
            this.empleoID = this.listRefEncontrada[0].empleo_id;
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

    /**Metodo para agregar la relacion del cliente moral a la lista */
    agregarRelacion() {
        let jerarquia = this.listaJerarquia.find(t => t.cveGeneral === environment.generales.principal);
        this.parentescoRef = this.formReferencias.get("parentesco")?.value;
        if (this.cuentaCEmpleo) {
            if (this.formEmpleo.invalid) {
                this.validateAllFormFields(this.formEmpleo);
                this.service.showNotification('top', 'right', 3, "Completa la infomación del empleo.");
                this.blockUI.stop();
                return;
            }
        }
        this.listAddReferencias.push([this.refenciaID,//0
        this.formReferencias.get('tpReferencia')?.value.generalesId,//1
        this.formReferencias.get("parentesco")?.value.generalesId,//2
        this.formReferencias.get("porcentaje")?.value,//3
        this.sujetoID,//4
        this.formReferencias.get("nombresRe")?.value,//5
        this.formReferencias.get("apePre")?.value,//6
        this.formReferencias.get("apeMre")?.value,//7
        moment(this.formReferencias.get("fechaNre")?.value).format('YYYY-MM-DD'),//8
        this.formReferencias.get("generoRe")?.value.generalesId,//9
        this.formReferencias.get("nacionalidadNacRef")?.value.nacionalidadid,//10
        this.formReferencias.get("rfcRe")?.value,//11
        this.formReferencias.get("curpRe")?.value,//12
        this.formReferencias.get("civil")?.value.generalesId,//13
        this.formReferencias.get("entFedeNacRe")?.value.estadoid,//14
        this.formReferencias.get("mpNacRe")?.value.ciudaId,//15
        this.domID,//16 domicilios 
        this.formDomicilioRefe.get("calleR")?.value,//17
        this.formDomicilioRefe.get("numeroExteriorR")?.value,//18
        this.formDomicilioRefe.get("numeroInteriorR")?.value,//19
        this.formDomicilioRefe.get("entreCalle1R")?.value,//20
        this.formDomicilioRefe.get("entreCalle2R")?.value,//21
        this.formDomicilioRefe.get("referenciaR")?.value,//22
        this.formDomicilioRefe.get("coloniaR")?.value.coloniaID,//23
        this.formDomicilioRefe.get("nacionalidadRef")?.value.nacionalidadid,//24
        this.formDomicilioRefe.get("resExtranjeraR")?.value,//25
        this.formDomicilioRefe.get("latitudR")?.value,//26
        this.formDomicilioRefe.get("longitudR")?.value,//27
        this.formDomicilioRefe.get("tiempoArraigoR")?.value.generalesId,//28
        this.formDomicilioRefe.get("jerarquiaR")?.value.generalesId,//29
        this.formDomicilioRefe.get("cpRef")?.value,//30
        this.empleoID,//31 empleo 
        this.formEmpleo.get("ocupacion")?.value.ocupacionId,//32
        this.formEmpleo.get("descripcion")?.value,//33
        this.formEmpleo.get("inicioLabor")?.value,//34
        this.formEmpleo.get("entrada")?.value,//35
        this.formEmpleo.get("salida")?.value,//36
        jerarquia.generalesId,//37 numero de trabajo principal 
        this.formEmpleo.get('empresaT')?.value.empresaId,//38
        this.formEmpleo.get("contratoEm")?.value.generalesId,//39
        this.agendaID,//40
        this.formReferencias.get("celRe")?.value,//41
        this.formReferencias.get("emailRe")?.value,//42
        jerarquia.generalesId,//43tipo contacto principal refencia
        this.identificacionID,//44id identificacion
        this.formReferencias.get("claveIdeRe").value,//45
        this.formReferencias.get("vigenciaIdeRe").value,//46
        this.formReferencias.get("tipoIRe").value.generalesId,//47
        this.formDomicilioRefe.get("estadoR")?.value.estadoid,//48
        this.formDomicilioRefe.get("ciudadR")?.value.ciudaId,    //49   
            false//50
        ]);
        //limpiar formulario 
        this.formReferencias.reset();
        this.formDomicilioRefe.reset();
        this.formEmpleo.reset();
        this.stepper.reset();
        for (let ref of this.listAddReferencias) {
            this.sumaPorcent = this.sumaPorcent + parseInt(ref[3]);
        }
        if (this.sumaPorcent < 100) {
            this.service.showNotification('top', 'right', 3, "El porcentaje debe ser igual a 100%.");
        }

    }
    /**
    * Digitalizacion clientes morales
    */
    //Digitalaizacion

    /**
     * Metodo para hacer busqueda de documentos para clientes morales.
     */
    buscaDocumentos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.globales.cveSocioMoral, 'listaDocTipoSocios').subscribe(data => {
            this.listaDocTipoSocios = data;
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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
                this.previsualizacion,
                documentos.tipoDocumentoID.tipoDocumentoID,
                documentos.tipoDocumentoID.nombreDoc, this.docCodificadoID,
                this.servicePermisos.usuario.id
            ]);
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
     * Metodo para abrir dialogo
     * @param documento 
     */
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
    /**
* Metodo para abrir ventana modal agregar Empresa
*
*/
    agregarEmpresa() {
        let titulo = "Agregar empresa";

        //se abre el modal
        const dialogRef = this.dialog.open(BuscarEmpresaComponent, {
            // height: '500px',
            width: '60%',
            data: {
                titulo: titulo
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            //cargar lista empresa para autocomplete
            this.spsMorales();
            this.spsEmpresasEm();
        });
    }
    /**
 * Metodo para abrir ventana modal busqueda de cliente
 * @param ventana -- 0 Cliente 1 Referencia
 */
    buscarCl(ventana) {
        this.cargarCombos();
        if (ventana === 0) {//clientes
            let titulo = "Busqueda clientes";
            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                // height: '500px',
                width: '50%',
                data: {
                    titulo: titulo
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(clMoral => {
                if (clMoral.tipoPersona == 'M') {

                    this.llenarDatosMoral(clMoral.datosCl, ventana);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un Cliente Moral.');
                }
            });
        } else if (ventana === 1) {//cliente para refe
            let titulo = "Busqueda clientes para referencia.";
            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                // height: '500px',
                width: '50%',
                data: {
                    titulo: titulo
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(clMoralR => {
                if (clMoralR.tipoPersona == 'F') {//NO esta vacio Aceptar llenar datos
                    this.llenarDatosMoral(clMoralR.datosCl, ventana);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un Cliente Físico.');
                }
            });
        }

    }
    /**
     * Guardar, Actualizar cliente
     */
    crudCliente(accion) {
        this.blockUI.start('Cargando datos...');
        if (this.clienteMoralID.invalid) {
            if (this.clienteMoralID instanceof UntypedFormControl) {
                this.clienteMoralID.markAsTouched({ onlySelf: true });
            }
            this.service.showNotification('top', 'right', 3, "Selecciona un cliente moral a registrar.");
            this.blockUI.stop();
            return;
        }
        if (this.formPerfilTransacional.invalid) {
            this.validateAllFormFields(this.formPerfilTransacional);
            this.service.showNotification('top', 'right', 3, "Completa la información de Perfil Transaccional.");
            this.blockUI.stop();
            return;
        }
        if (this.listAddReferencias.length <= 0) {
            this.service.showNotification('top', 'right', 3, "Debes agregar una referencia.");
            this.blockUI.stop();
            return;
        }
        //Se recorren los vinculos solo para pasar el tipo de vinculo
        for (let vinc of this.formPerfilTransacional.get('vinculosAdicionales').value) {
            this.listAddVinculos.push([vinc.generalesId]);
        }
        //Se recorren los finalida cuenta solo para pasar el tipo de finalidad
        for (let fcuenta of this.formPerfilTransacional.get('finalidadesCuenta').value) {
            this.listAddFcuenta.push([fcuenta.generalesId]);
        }
        //Se recorren los manejos de cuenta solo para pasar el tipo de manejo
        for (let mcuenta of this.formPerfilTransacional.get('manejaCuentas').value) {
            this.listAddMcuenta.push([mcuenta.generalesId]);
        }
        this.sumaPorcent = 0;
        for (let ref of this.listAddReferencias) {
            this.sumaPorcent = this.sumaPorcent + parseInt(ref[3]);
        }
        if (this.sumaPorcent < 100) {
            this.service.showNotification('top', 'right', 3, "El porcentaje debe ser igual a 100%, registra otra referencia.");
            this.blockUI.stop();
            return;
        }

        let socioMoral = this.listaTipoSocios.find(s => s.cveSocio === environment.globales.cveSocioMoral);
        let datosCliente = {
            "solicitud": {
                "solicitudId": this.solicitudID,
                "numSolicitud": this.formEncabezado.get('numSolicitud').value,
                "fechaSolicitud": this.formEncabezado.get('fechSolicitud').value,
                "periodicidadMovimientosId": this.formPerfilTransacional.get('periodicidadMovimientos').value,
                "medioEnteroId": this.formPerfilTransacional.get('medioEntero').value,
                "comprobacionIngresos": this.formPerfilTransacional.get('comprobacionIngresos').value.id,
                "montoAproxAhorrar": this.formPerfilTransacional.get('montoAproxAhorrar').value,
                "montoAproxRetirar": 0,
                "numeroOperacion": this.formPerfilTransacional.get('numeroOperacion').value
            },
            "perfil": {
                "perfilId": this.perfilID,
                "nivelEstudiosId": { "generalesId": 0 },
                "regimenMatrimonialId": { "generalesId": 0 },
                "ocupacionId": { "ocupacionId": null },
                "activiadadEconomicaId": this.formPerfilTransacional.get('actividadscian').value,
                "tipoViviendaId": { "generalesId": 0 },
                "tipoPlazoId": { "tipoPlazoId": 0 },//periodo ingresos
                "numDependientes": 0,
                "actividadRealizaId": { "generalesId": 0 },
                "extPerfil": {
                    "personaActividadEmpresarial": false,
                    "origenIngresosId": { "generalesId": 0 },
                    "digitalizacion": this.listaDocAgregados
                }
            },
            "ingreso": this.listAddIngreso,
            "egreso": this.listAddEgreso,
            "finalidaC": this.listAddFcuenta,
            "manejoC": this.listAddMcuenta,
            "listaCliente": { "vinculos": this.listAddVinculos },
            "servicio": null,
            "bienMaterial": null,
            "extCliente": {
                "sujeto": null,
                "extSujeto": null,
                "identificacion": null,
                "agenda": null,
                "cliente": {
                    "clienteId": this.clienteID, "numeroCliente": this.formEncabezado.get('numCliente').value,
                    "fechaIngreso": this.formEncabezado.get('fechSolicitud').value,
                    "estatus": true,
                    "tipoSocioId": socioMoral,// this.formDigitalizacion.get('tipoSocio').value
                    "sucursalId": this.servicePermisos.sucursalSeleccionada,
                    "personalidadId": { "cveGeneral": this.personaJuridica }
                },
                "domicilio": null,
                "empleo": null,
                "refencia": this.listAddReferencias,
                "extranjero": {},
                "moral": {
                    "moralId": this.moralID,
                    "fechaConstitucion": moment(this.formPerfilTransacional.get('fechConst').value).format('YYYY-MM-DD'),
                    "empresaId": this.clienteMoralID.value,
                    "noActaConstitutiva": this.formPerfilTransacional.get('noActa').value,
                    "noFolioEscritura": this.formPerfilTransacional.get('noFolio').value,
                    "registroPublico": this.formPerfilTransacional.get('regPublico').value,
                    "porcentajeAcciones": this.formPerfilTransacional.get('porcentajeAcc').value == null ? 0 : this.formPerfilTransacional.get('porcentajeAcc').value,
                    "activos": this.formPerfilTransacional.get('activos').value,
                    "eFirma": this.formPerfilTransacional.get('efirma').value
                }
            }
        }
        return this.blockUI.stop();
        this.service.registrarBYID(datosCliente, accion, 'crudCliente').subscribe(result => {
            if (result[0][0] === '0') {
                this.limpiarForm();
                if (accion === 2) {
                    //API para marcar la solicitud como aplicada
                    this.crudSolActualizacion();
                }
                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        });


    }

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
     * Metodo para completar la informacion del cliente de
     * @param datosM todos los datos del cliente
     * @param ventana 0 Cliente, 1 Referencia
     */
    llenarDatosMoral(datosM, ventana) {
        if (ventana == 0) {
            this.limpiarForm();  //limpiar lista
            //Llenado de informacion
            this.datosCliente(datosM);
        } else if (ventana == 1) {//Llenar datos para refencia
            this.refCliente(datosM);
        }
    }
    /**
    * Metodo para llenar los campos con la informacion del cliente
    * @param datosM toda la informacion del cliente 
    */
    datosCliente(datosM) {
        this.clienteID = datosM.cliente_id;
        this.formEncabezado.get('numCliente').setValue(datosM.numero_cliente);
        this.formEncabezado.get('cliente').setValue(datosM.nombre_comercial);
        this.formEncabezado.get('perfilRiesgo').setValue('');//se calcula
        this.solicitudID = datosM.solicitud_id;
        this.formEncabezado.get('fechSolicitud').setValue(datosM.fecha_solicitud);
        this.formEncabezado.get('numSolicitud').setValue(datosM.num_solicitud);
        this.formEncabezado.get('tipoCliente').setValue(datosM.tipo_socio);
        let estatus;
        estatus = datosM.estatus ? 'Activo' : 'Inactivo';
        this.formEncabezado.get('estatusAct').setValue(estatus);
        this.perfilID = datosM.perfil_id;
        this.moralID = datosM.moral_id;
        let clienteMoral = this.listaEmpresa.find(e => e.empresaId === datosM.empresa_id);
        this.clienteMoralID.setValue(clienteMoral);
        this.nomComercial.setValue(clienteMoral.nombreComercial);
        this.rSocial.setValue(clienteMoral.razonSocial);
        this.rfcEm.setValue(clienteMoral.rfc);
        this.repreEmp.setValue(clienteMoral.representante);
        this.formPerfilTransacional.get('fechConst').setValue(datosM.fecha_constitucion + 'T00:00:00');
        this.formPerfilTransacional.get('noActa').setValue(datosM.no_acta_constitutiva);
        this.formPerfilTransacional.get('noFolio').setValue(datosM.no_folio_escritura);
        this.formPerfilTransacional.get('regPublico').setValue(datosM.registro_publico);
        this.formPerfilTransacional.get('porcentajeAcc').setValue(datosM.porcentaje_acciones);
        this.formPerfilTransacional.get('activos').setValue(datosM.activos);
        this.formPerfilTransacional.get('efirma').setValue(datosM.e_firma);
        let cuentasJSON = JSON.parse(datosM.maneja_cuentas);
        let finalidadJSON = JSON.parse(datosM.finalidad_cuenta);
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
        let medioE = this.listaMedioDifusion.find(v => v.generalesId === datosM.medio_id);
        this.formPerfilTransacional.get('manejaCuentas').setValue(cuentas);
        this.formPerfilTransacional.get('finalidadesCuenta').setValue(finalidad);
        this.formPerfilTransacional.get('medioEntero').setValue(medioE);
        let pMovimiento = this.listaTipoPlazo.find(v => v.tipoPlazoId === datosM.periodicidad_movimientos_id);
        this.formPerfilTransacional.get('periodicidadMovimientos').setValue(pMovimiento);
        let actScian = this.listaScian.find(l => l.cActividadId === datosM.c_actividad_id);
        this.formPerfilTransacional.get('actividadscian').setValue(actScian);
        let listaViJSON = JSON.parse(datosM.vinculos_adicionales);
        let vinculos = [];
        if (listaViJSON != null) {
            for (let vinc of listaViJSON) {
                let findVinculo = this.listaVinculosA.find(v => v.generalesId === vinc.tipo_vinculo);
                vinculos.push(findVinculo);
            }
        }
        this.formPerfilTransacional.get('vinculosAdicionales').setValue(vinculos);
        this.formPerfilTransacional.get('montoAproxAhorrar').setValue(datosM.monto_aprox_ahorrar);
        this.formPerfilTransacional.get('numeroOperacion').setValue(datosM.num_operacion);
        let comprobante = this.opcionesComprobante.find(v => v.id === datosM.comprobacion_ingresos);
        this.formPerfilTransacional.get('comprobacionIngresos').setValue(comprobante);
        let ingresoJSON = JSON.parse(datosM.ingresos);
        if (ingresoJSON != null) {
            let tipoIn;
            for (let ingreso of ingresoJSON) {
                this.listAddIngreso.push([
                    ingreso.tipo_id,
                    ingreso.ingreso,
                    ingreso.monto_ingreso
                ]);
                tipoIn = this.listaTipoIngreso.find(v => v.generalesId === ingreso.tipo_id);
            }

            this.formPerfilTransacional.get('ingreso').setValue(tipoIn);
            this.formPerfilTransacional.get('monto_ingreso').setValue('0');
        }
        this.spsPerfilRiesgo();
        this.datosClienteReferencia(datosM);
    }
    /**
   * Metodo para llenar los campos con la informacion del cliente
   * @param datosM toda la informacion del cliente 
   */
    datosClienteReferencia(datosM) {
        let egresoJSON = JSON.parse(datosM.egresos_cl);
        if (egresoJSON != null) {
            let tipoEg;
            for (let egreso of egresoJSON) {
                this.listAddEgreso.push([
                    egreso.tipo_egreso_id,
                    egreso.descripcion,
                    egreso.monto_egreso
                ]);
                tipoEg = this.listaTipoEgreso.find(v => v.generalesId === egreso.tipo_egreso_id);
            }
            this.formPerfilTransacional.get('tipo_egreso').setValue(tipoEg);
            this.formPerfilTransacional.get('monto_egreso').setValue('0');
        }
        /**Referencias */
        let referenciasJSON = JSON.parse(datosM.referencias);
        if (referenciasJSON != null) {
            if (referenciasJSON.length > 0) {
                for (let ref of referenciasJSON) {
                    let parentesco = { "generalesId": ref.parentesco_id, "descripcion": ref.parentesco };
                    this.parentescoRef = parentesco;
                    this.listAddReferencias.push([
                        ref.refencia_id,//0
                        ref.tipo_refencia_id,//1
                        ref.parentesco_id,//2
                        ref.porcentaje,//3
                        ref.sujeto_id,//4
                        ref.nombres_ref,//5
                        ref.aparteno_ref,//6
                        ref.amaterno_ref,//7
                        moment(ref.fecha_nacimiento_ref).format('YYYY-MM-DD'),//8
                        ref.genero_id,//9
                        ref.nacionalidadid,//10
                        ref.rfc_ref.trim(),//11
                        ref.curp_ref,//12
                        ref.estado_civil_id,//13
                        ref.estado_id,//14
                        ref.ciudad_id,//15
                        ref.dom_refe_id,//!6 domicilio
                        ref.calle_dom_ref,//17
                        ref.no_ext_ref.trim(),//18
                        ref.no_int_ref.trim(),//19
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
                        ref.empleo_id_ref,//31 empleo
                        ref.ocupacion_empl_ref_id,//32
                        ref.observacion_empl_ref,//33
                        ref.fechainicio_empl_ref,//34
                        ref.horario_desde_empl_ref,//35
                        ref.horario_hasta_empl_ref,//36
                        ref.numtrabajo_ref,//37
                        ref.empresa_ref,//38
                        ref.tipo_contrato_empl_ref_id,//39
                        ref.agenda_id,//40 agenda 
                        ref.telefono,//41
                        ref.correo,//42
                        ref.tipo_contacto,//43
                        ref.identificacion_id,//44IDENTIFICCION
                        ref.num_identificacion,//45
                        ref.vigencia,//46
                        ref.tipoidenid,//47
                        //estado ciudad domicilio referencia
                        ref.estadoid_ref,//48
                        ref.cd_id_dom//49   
                    ]);
                }
            }
        }
        if (datosM.digitalizacion != null) {
            let digitalizacionJSON = JSON.parse(datosM.digitalizacion);

            for (let doc of digitalizacionJSON) {
                this.docCodificadoID = doc.documentocodificado_id;
                this.listaDocAgregados.push([
                    doc.documentobase64,
                    doc.tipodocumento_id,
                    doc.nombredoc,
                    this.docCodificadoID
                ]);
            }

        }
        //preguntasr si va a modificar 
        this.verSolicitud();
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
                this.btnActualizar = true;
                this.perfilTab = false;
                this.datoGeneralTab = false;
                this.refeTab = false;
                this.digitaTab = false;
            }

        });
    }
    /**Modal para el igngreso del  numero de solicitud,para la actualizacion  */
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
                this.perfilTab = true;
                this.refeTab = true;
                this.digitaTab = true;
                this.btnActualizar = false;
                //modal para ver la solicitud
                this.spsSolicitudes(sol);
            } else {
                //desactibar boton de actualizar
                this.btnActualizar = true;
                this.perfilTab = false;
                this.datoGeneralTab = false;
                this.refeTab = false;
                this.digitaTab = false;
            }

        });
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
                        case environment.generales.perfilInfSecc:
                            this.tabIndex = 1;
                            this.perfilTab = false;
                            break;
                        case environment.generales.refeSecc:
                            this.tabIndex = 2;
                            this.refeTab = false;
                            break;
                        case environment.generales.digitaSecc:
                            this.tabIndex = 3;
                            this.digitaTab = false;
                            break;
                        default:


                    }
                }

            } else {
                this.btnActualizar = true;
                this.perfilTab = false;
                this.datoGeneralTab = false;
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
   * Metodo para llenar los campos con la informacion del cliente a ser referencia
   * @param datosM toda la informacion del cliente moral
   */
    refCliente(datosM) {
        this.blockUI.start('Cargando datos...');
        this.sujetoID = datosM.sujeto_cl;
        this.formReferencias.get("nombresRe").setValue(datosM.nombre_cl);
        this.formReferencias.get("apePre").setValue(datosM.paterno_cl);
        this.formReferencias.get("apeMre").setValue(datosM.materno_cl);
        const convertirEdad = new Date(datosM.fecha_nacimiento);
        let timeDiff = Math.abs(Date.now() - convertirEdad.getTime());
        this.formReferencias.get('edadRe').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        this.formReferencias.get("fechaNre").setValue(datosM.fecha_nacimiento + 'T00:00:00');
        let genero = this.listaGenero.find(t => t.generalesId === datosM.generales_id);
        this.formReferencias.get("generoRe").setValue(genero);
        let nacionalidad = this.listaNacionNac.find(t => t.nacionalidadid === datosM.nacionalidadid);
        this.formReferencias.get("nacionalidadNacRef").setValue(nacionalidad);
        this.formReferencias.get("rfcRe").setValue(datosM.rfc);
        this.formReferencias.get("curpRe").setValue(datosM.curp);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === datosM.ecivil_id);
        this.formReferencias.get("civil").setValue(estCivil);
        let estado = this.listaEstadosNac.find(es => es.estadoid === datosM.estado_id);
        this.formReferencias.get("entFedeNacRe").setValue(estado);
        let path = nacionalidad.nacionalidadid + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNac = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estadoN = this.listaEstadosNac.find(v => v.estadoid === datosM.estado_id);
            this.formReferencias.get('entFedeNacRe').setValue(estadoN);
        });
        this.service.getListByID(datosM.estado_id, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesNac = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === datosM.cd_nac);
            this.formReferencias.get('mpNacRe').setValue(ciudad);
        });
        //Identificacion
        this.identificacionID = datosM.identificacion_id;//id 
        if (this.identificacionID > 0) {
            this.formReferencias.get("claveIdeRe").setValue(datosM.num_identificacion.trim());
            this.formReferencias.get("vigenciaIdeRe").setValue(datosM.vigencia);
            let tipoIdent = this.listaIdentificacion.find(t => t.generalesId === datosM.tipoidenid);
            this.formReferencias.get("tipoIRe").setValue(tipoIdent);
        }
        if (datosM.domicilio_cl != null) {
            let domicilioClJson = JSON.parse(datosM.domicilio_cl);
            for (let domicilio of domicilioClJson) {
                if (domicilio.cvnumdom == environment.generales.principal) {
                    this.domID = domicilio.domicilio_id;
                    this.formDomicilioRefe.get("calleR").setValue(domicilio.calle);
                    this.formDomicilioRefe.get("numeroExteriorR").setValue(domicilio.numero_exterior);
                    this.formDomicilioRefe.get("numeroInteriorR").setValue(domicilio.numero_interior);
                    this.formDomicilioRefe.get("entreCalle1R").setValue(domicilio.entre_calle_1);
                    this.formDomicilioRefe.get("entreCalle2R").setValue(domicilio.entre_calle_2);
                    this.formDomicilioRefe.get("referenciaR").setValue(domicilio.referencia);
                    let nacionalidadDR = this.listaNacionNac.find(t => t.nacionalidadid === domicilio.nacionalidadid);
                    this.formDomicilioRefe.get("nacionalidadRef").setValue(nacionalidadDR);
                    let estadoD = this.listaEstadosNac.find(t => t.estadoid === domicilio.estado_id);
                    this.formDomicilioRefe.get("estadoR").setValue(estadoD);
                    this.service.getListByID(domicilio.nacionalidadid+'/2', 'spsEstadosNacionalidad').subscribe(data => {
                        if (!this.vacio(data)) {//no hay datos vacios
                            this.listaEstadosNac = JSON.parse(data[0]);
                            this.opcionesEstados = this.formDomicilioRefe.get('estadoR').valueChanges.pipe(
                        startWith(''),
                        map(value => this._filterEstadoNac(value))
                    );
                        }
                        let estadoN = this.listaEstadosNac.find(v => v.estadoid === domicilio.estado_id);
                        this.formDomicilioRefe.get('estadoR').setValue(estadoN);
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
                        let path: any;
                        path = domicilio.ciudad_id + '/' + this.selectedIdLocalidad;
                        this.service.getListByID(path, 'listaColoniaCiudad').subscribe(colC => {
                            this.listaColonias = colC;
                            this.opcionesColonias = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
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
        this.refClienteEmpleo(datosM);
    }
    /**
  * Metodo para llenar los campos con la informacion del cliente a ser referencia
  * @param datosM toda la informacion del cliente moral
  */
    refClienteEmpleo(datosM) {
        if (datosM.agendacl != null) {
            let agendaJSON = JSON.parse(datosM.agendacl);
            for (let cont of agendaJSON) {
                if (cont.cvejerarquia == environment.generales.principal) {
                    this.agendaID = cont.agenda_id;
                    this.formReferencias.get("celRe").setValue(cont.telefono.trim());
                    this.formReferencias.get("emailRe").setValue(cont.correo);
                }
            }
        }
        let cuentaEmpleo;
        if (datosM.empleos_cl != null) {
            let empleoJSON = JSON.parse(datosM.empleos_cl);
            cuentaEmpleo = this.opcionesComprobante.find(v => v.id === true);
            this.cuentaCEmpleo = true;
            for (let empleo of empleoJSON) {
                if (empleo.cve_generales == environment.generales.principal) {
                    this.empleoReferenciaCtrl.setValue(cuentaEmpleo);
                    this.empleoID = empleo.empleo_id;
                    let ocupacionEm = this.listaSINCO.find(o => o.ocupacionId === empleo.ocupacion_id);
                    this.formEmpleo.get("ocupacion").setValue(ocupacionEm);
                    this.formEmpleo.get("descripcion").setValue(empleo.observacion);
                    this.formEmpleo.get("inicioLabor").setValue(empleo.fechainicio);
                    this.formEmpleo.get("entrada").setValue(empleo.horario_desde);
                    this.formEmpleo.get("salida").setValue(empleo.horario_hasta);
                    let empresa = this.listaEmpresaEm.find(o => o.empresaId === empleo.empresa_id);
                    this.formEmpleo.get('empresaT').setValue(empresa);
                    this.formEmpleo.get('razonSocial').setValue(empresa.razonSocial);
                    this.formEmpleo.get('rfcEmpresa').setValue(empresa.rfc);
                    this.formEmpleo.get('repreEmpresa').setValue(empresa.representante);
                    let contrato = this.listaContrato.find(o => o.generalesId === empleo.contrato_id);
                    this.formEmpleo.get("contratoEm").setValue(contrato);
                }
            }
        }
    }
    /**Metodo para quitar un contacto de agenda */
    eliminarRelacion(index) {
        //llamar advertencia
        this.listAddReferencias.splice(index, 1);
    }
    editarRelacion(index) {
        this.blockUI.start('Cargando datos...');

        this.refenciaID = this.listAddReferencias[index][0];
        let tpRef = this.listaTipoReferencia.find(t => t.generalesId === this.listAddReferencias[index][1]);
        this.formReferencias.get('tpReferencia').setValue(tpRef);
        let tpParen = this.listaParentesco.find(p => p.generalesId === this.listAddReferencias[index][2]);
        this.formReferencias.get("parentesco").setValue(tpParen);
        this.formReferencias.get("porcentaje").setValue(this.listAddReferencias[index][3]);
        this.sujetoID = this.listAddReferencias[index][4];
        this.formReferencias.get("nombresRe").setValue(this.listAddReferencias[index][5]);
        this.formReferencias.get("apePre").setValue(this.listAddReferencias[index][6]);
        this.formReferencias.get("apeMre").setValue(this.listAddReferencias[index][7]);
        const convertirEdad = new Date(this.listAddReferencias[index][8]);
        let timeDiff = Math.abs(Date.now() - convertirEdad.getTime());
        this.formReferencias.get('edadRe').setValue(Math.floor((timeDiff / (1000 * 3600 * 24)) / 365));
        this.formReferencias.get("fechaNre").setValue(this.listAddReferencias[index][8] + 'T00:00:00');
        let genero = this.listaGenero.find(t => t.generalesId === this.listAddReferencias[index][9]);
        this.formReferencias.get("generoRe").setValue(genero);
        let nacionalidad = this.listaNacionNac.find(t => t.nacionalidadid === this.listAddReferencias[index][10]);
        this.formReferencias.get("nacionalidadNacRef").setValue(nacionalidad);
        this.formReferencias.get("rfcRe").setValue(this.listAddReferencias[index][11]);
        this.formReferencias.get("curpRe").setValue(this.listAddReferencias[index][12]);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === this.listAddReferencias[index][13]);
        this.formReferencias.get("civil").setValue(estCivil);
        let path = this.listAddReferencias[index][10] + '/2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstadoNac = this.formReferencias.get('entFedeNacRe').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEstadoNac(value))
                );
            }
            let estado = this.listaEstadosNac.find(es => es.estadoid === this.listAddReferencias[index][14]);
            this.formReferencias.get("entFedeNacRe").setValue(estado);

        });
        this.service.getListByID(this.listAddReferencias[index][14], 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formReferencias.get('mpNacRe').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listAddReferencias[index][15]);
            this.formReferencias.get("mpNacRe").setValue(ciudad);
        });
        //Identificacion
        this.identificacionID = this.listAddReferencias[index][44];//id 
        if (!this.vacio(this.listAddReferencias[index][45])) {
            this.formReferencias.get("claveIdeRe").setValue(this.listAddReferencias[index][45].trim());
            this.formReferencias.get("vigenciaIdeRe").setValue(this.listAddReferencias[index][46]);
            let tipoIdent = this.listaIdentificacion.find(t => t.generalesId === this.listAddReferencias[index][47]);
            this.formReferencias.get("tipoIRe").setValue(tipoIdent);
        }

        //Domicilio
        this.domID = this.listAddReferencias[index][16];
        this.formDomicilioRefe.get("calleR").setValue(this.listAddReferencias[index][17]);
        this.formDomicilioRefe.get("numeroExteriorR").setValue(this.listAddReferencias[index][18]);
        this.formDomicilioRefe.get("numeroInteriorR").setValue(this.listAddReferencias[index][19]);
        this.formDomicilioRefe.get("entreCalle1R").setValue(this.listAddReferencias[index][20]);
        this.formDomicilioRefe.get("entreCalle2R").setValue(this.listAddReferencias[index][21]);
        this.formDomicilioRefe.get("referenciaR").setValue(this.listAddReferencias[index][22]);
        let nacionalidadDR = this.listaNacionNac.find(t => t.nacionalidadid === this.listAddReferencias[index][24]);
        this.formDomicilioRefe.get("nacionalidadRef").setValue(nacionalidadDR);
        let pathDom = this.listAddReferencias[index][24] + '/2';
        this.service.getListByID(pathDom, 'spsEstadosNacionalidad').subscribe(data => {
            if (!this.vacio(data)) {//no hay datos vacios
                this.listaEstadosNac = JSON.parse(data[0]);
                this.opcionesEstados = this.formDomicilioRefe.get('estadoR').valueChanges.pipe(
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
            this.service.getListByID(path, 'listaColoniaCiudad').subscribe(colonias => {
                this.listaColonias = colonias;
                this.opcionesColonias = this.formDomicilioRefe.get('coloniaR').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterColonias(value))
                );
                //las colonias se cargan des pues de estado ciudad
                let colonia = this.listaColonias.find(t => t.coloniaID === this.listAddReferencias[index][23]);
                this.formDomicilioRefe.get("coloniaR").setValue(colonia);
                this.formDomicilioRefe.get('localidadR').setValue(colonia.localidad.nombreLocalidad);
                //se limpia la lista
                this.listAddReferencias.splice(index, 1);
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
            this.agendaID = this.listAddReferencias[index][40];
            this.formReferencias.get("celRe").setValue(this.listAddReferencias[index][41].trim());
            this.formReferencias.get("emailRe").setValue(this.listAddReferencias[index][42]);
        }
        //empleo
        let cuentaEmpleo;
        if (!this.vacio(this.listAddReferencias[index][32])) {
            cuentaEmpleo = this.opcionesComprobante.find(v => v.id === true);
            this.cuentaCEmpleo = true;
            this.empleoReferenciaCtrl.setValue(cuentaEmpleo);
            this.empleoID = this.listAddReferencias[index][31];
            let ocupacionEm = this.listaSINCO.find(o => o.ocupacionId === this.listAddReferencias[index][32]);
            this.formEmpleo.get("ocupacion").setValue(ocupacionEm);
            this.formEmpleo.get("descripcion").setValue(this.listAddReferencias[index][33]);
            this.formEmpleo.get("inicioLabor").setValue(this.listAddReferencias[index][34]);
            this.formEmpleo.get("entrada").setValue(this.listAddReferencias[index][35]);
            this.formEmpleo.get("salida").setValue(this.listAddReferencias[index][36]);
            //numero de trabajo principal 311, 37 let opcionEm = this.listaJerarquia.find(o => o.generalesId ===  this.listAddReferencias[index][37]);
            let empresa = this.listaEmpresaEm.find(o => o.empresaId === this.listAddReferencias[index][38]);
            this.formEmpleo.get('empresaT').setValue(empresa);
            this.formEmpleo.get('razonSocial').setValue(empresa.razonSocial);
            this.formEmpleo.get('rfcEmpresa').setValue(empresa.rfc);
            this.formEmpleo.get('repreEmpresa').setValue(empresa.representante);
            let contrato = this.listaContrato.find(o => o.generalesId === this.listAddReferencias[index][39]);
            this.formEmpleo.get("contratoEm").setValue(contrato);
        } else {
            cuentaEmpleo = this.opcionesComprobante.find(v => v.id === false);
            this.empleoReferenciaCtrl.setValue(cuentaEmpleo);
        }

    }
    /**Metodo para lismpiar listas y formularios al guardar o editar */
    limpiarForm() {
        //desactibar boton de actualizar
        this.btnActualizar = true;
        this.perfilTab = false;
        this.datoGeneralTab = false;
        this.refeTab = false;
        this.digitaTab = false;
        this.clienteMoralID.setValue('');
        this.nomComercial.setValue('');
        this.rSocial.setValue('');
        this.rfcEm.setValue('');
        this.repreEmp.setValue('');
        this.listAddIngreso = [];
        this.listAddEgreso = [];
        this.listAddReferencias = [];
        this.listaDocAgregados = [];
        this.formEncabezado.reset();
        this.formPerfilTransacional.reset();//Perfil transaccional del cliente
        this.formReferencias.reset();//Datos generales Referencia
        this.formDomicilioRefe.reset();//Domicilio referencia
        this.formEmpleo.reset();//empelo refenrecia
        this.stepper.reset();
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
     * Metodo que valida los datos vacios
     * @param value -valor a validar
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    /**
     * Metodo que contine todos los mensajes de las validaciones de los formularios
     */
    validacionesMorales = {
        //Referencias para datos generales referencias
        'clienteMoralID': [
            { type: 'required', message: 'Campo requerido.' }],
        'finalidadesCuenta': [
            { type: 'required', message: 'Campo requerido.' }],
        'medioEntero': [
            { type: 'required', message: 'Campo requerido.' }],
        'periodicidadMovimientos': [
            { type: 'required', message: 'Campo requerido.' }],
        'actividadscian': [
            { type: 'required', message: 'Campo requerido.' }],
        'montoAproxAhorrar': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Acepta números decimales.' }],
        'numeroOperacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' },
            { type: 'maxlength', message: 'Campo máximo 2 carácteres.' }],
        'comprobacionIngresos': [
            { type: 'required', message: 'Campo requerido.' }],
        'ingreso': [
            { type: 'required', message: 'Campo requerido.' }],
        'monto_ingreso': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'pattern', message: 'Acepta números decimales.' }],
        'tipo_egreso': [
            { type: 'required', message: 'Campo requerido.' }],
        'porcentajeAcc': [{ type: 'pattern', message: 'Acepta números decimales.' }],
        'monto_egreso': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'pattern', message: 'Acepta números decimales.' }],
        'fechConst': [
            { type: 'required', message: 'Campo requerido.' }],
        'curpRe': [{ type: 'pattern', message: 'No cumple con la estructura VECJ880326XXX.' }],
        'rfcRe': [{ type: 'pattern', message: 'No cumple con la estructura VECJ880326HGTNRSXX.' }],

        //Validaciones para referencias
        'tpReferencia': [
            { type: 'required', message: 'Campo requerido.' }],
        'apePre': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Máximo 50 carácteres' }],
        'nombresRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Máximo 100 carácteres.' }],
        'fechaNre': [
            { type: 'required', message: 'Campo requerido.' }],
        'generoRe': [
            { type: 'required', message: 'Campo requerido.' }],
        'nacionalidadNacRef': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no existe.' }],
        'entFedeNacRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Ent. Federativa no existe.' }],
        'mpNacRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El municipio no existe.' }],
        'celRe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' },
            { type: 'maxlength', message: 'Máximo 20 caracteres.' }],
        'tipoIRe': [
            { type: 'required', message: 'Campo requerido.' }],
        'claveIdeRe': [
            { type: 'required', message: 'Campo requerido.' },],
        'vigenciaIdeRe': [
            { type: 'required', message: 'Campo requerido.' }],
        'civil': [
            { type: 'required', message: 'Campo requerido.' }],
        'parentesco': [
            { type: 'required', message: 'Campo requerido.' }],
        'porcentaje': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Máximo 3 caracteres.' },
            { type: 'pattern', message: 'Solo números enteros.' }],

        //Validaciones para Domicilio referencias
        'nacionalidadRef': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no existe.' }],
        'estadoR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Estado no existe.' }],
        'ciudadR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Ciudad no existe.' }],
        'calleR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 150 carácteres.' }],
        'referenciaR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 250 carácteres.' }],
        'entreCalle1R': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 150 carácteres.' }],
        'entreCalle2R': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 150 carácteres.' }],
        'numeroExteriorR': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máx 20 carácteres.' }],
        'tiempoArraigoR': [
            { type: 'required', message: 'Campo requerido.' }],

        //Validaciones para empleo de la referencia del socios
        'empleoReferenciaCtrl': [
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
            { type: 'invalidAutocompleteObject', message: 'La Ocupación no existe.' }],
        'entrada': [
            { type: 'required', message: 'Campo requerido.' }],
        'salida': [
            { type: 'required', message: 'Campo requerido.' }],

    }
}