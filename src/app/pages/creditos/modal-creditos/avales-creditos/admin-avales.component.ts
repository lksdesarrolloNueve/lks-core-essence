import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, AbstractControl, ValidatorFn } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from '../../../../../environments/environment';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CombosClienteService, GestionGenericaService } from "../../../../shared/service/gestion";
import * as moment from 'moment';
import { PermisosService } from "../../../../shared/service/permisos.service";
import { BuscarClientesComponent } from "../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { BuscarEmpresaComponent } from "../../../../pages/modales/empresa-modal/buscar-empresa.component";
import { MatStepper } from "@angular/material/stepper";
import { MatAccordion } from "@angular/material/expansion";
import { generales } from "../../../../../environments/generales.config";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { DocumentosModalComponent } from "../../../../pages/modales/documentos-modal/documentos-modal.component";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";
import globales from "../../../../../environments/globales.config";
@Component({
    selector: 'admin-avales',
    moduleId: module.id,
    templateUrl: 'admin-avales.component.html'
})

/**
 * @autor: 
 * @version: 1.0.0
 * @fecha: 15/10/2021
 * @descripcion: Componente para la gestion de avales
 */

export class AdminAvalesComponent implements OnInit {
    nombreTab: string = 'Datos Generales';
    //Declaracion de variables
    titulo: string;
    accion: number;
    formIdentifiaciones: UntypedFormGroup;
    listaGenero: any = [];
    opcionesGenero: Observable<string[]>;
    listaEstadoCivil: any = [];
    opcionesEstadoCivil: Observable<string[]>;
    listaNacionalidad: any = [];
    opcionesNacionalidad: Observable<string[]>;
    listaEstados: any;
    opcionesEstado: Observable<string[]>;
    listaCiudadEstado: any[];
    opcionesCiudades: Observable<string[]>;
    listaTipoIdentificaciones: any[];
    opcionesIdentificaciones: Observable<string[]>;
    listaIdentificaciones = [];
    listaIdentificacionesSeleccionados = [];
    listaCalificacionBuro: any = [];
    selectedIdCiudad: number = 0;
    selectedIdEstado: number = 0;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatAccordion) accordion: MatAccordion;
    @ViewChild('stepper') stepper: MatStepper;

    today = new Date();
    //Forms
    formDatosG: UntypedFormGroup;//Datos generales 
    formDomicilioCl: UntypedFormGroup;//Domicilios del cliente
    formPerfilTransacional: UntypedFormGroup;//Perfil transaccional del cliente
    formEmpleoCl: UntypedFormGroup;
    actEmpresarial = new UntypedFormControl(false,);
    parentescoRef: any = "";
    //Combos
    listaJerarquia: any = [];
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
    listaTipoBien: any = [];
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
    listAddEmp: any = [];//empleo cliente mostrar front
    //listAddEmpCl: any = [];//lista empleos cliente para back    
    listRefEncontrada: any[];
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
    empresaID: number = 0;
    detalleEmId: number = 0;
    docCodificadoID: number = 0;
    avalID: number = 0;
    creditoID: number = 0;
    noAval: number = 0;

    //Declaracion Listas Perfil Transaccional
    opcionesComprobante = [];
    cuentaCEmpleo = false; // combo para seleccionar si cuenta con empleo el cliente.
    empleoReferenciaCtrl = new UntypedFormControl('', [Validators.required]);
    actvRealiza = true; // Combo para seleccionar actividad realiza (Desempleo).
    ocultarFormEmpleoCl: boolean = true;
    origenIngreso = new UntypedFormControl('', { validators: [Validators.required] });
    tipoPlazo = new UntypedFormControl('', { validators: [Validators.required] });

    //Ingresos-Egresos
    listAddIngreso: any[] = [];
    formIngresos: UntypedFormGroup;
    listAddEgreso: any[] = [];
    formEgresos: UntypedFormGroup;

    //Lista Bienes
    mostrarEscritura = false;
    mostrarAuto = false;
    mostrarOtroBien = false;
    formBienes: UntypedFormGroup;
    listAddBienes: any[] = [];

    //Fin Declaracion Perfil Transaccional
    /** Controles Nacionalidad de nacimiento**/
    listaNac: any[];//listaNacionalidad nacimiento
    opcionesNac: Observable<string[]>;// Nacimiento

    /** Controles Estados **/
    listaEstadosNac: any;
    opcionesEstadoNac: Observable<string[]>;//Nacimiento
    //estado seleccionado
    selectedIdEstadoNac: number = 0;
    idEstSel: number = 0;//controla el estado seleccionado

    /** Controles Ciudad **/
    listaCiudadNac: any[];
    opcionesCiudadesNac: Observable<string[]>;
    /** Controles ciudad de domicilio**/
    controlCd: number = 0;//controla la asignacion de ciudad
    seleccionCd: number = 0;//controla la ciudad seleccionada

    /** Controles Colonia **/
    listaColonias: any[];
    opcionesColonias: Observable<string[]>;//domicilio cliente
    selectedIdLocalidad: number = 0;//listaColoniaCiudad recibe 2° parametro

    /** Controles Tiempo Arraigo **/
    arraigoGeneralId: any;
    //Ocupaciones SINCO
    listaSINCO: any[];
    opcionesSINCO: Observable<string[]>;
    opcionesSINCOCL: Observable<string[]>;//empleo cliente
    opcionesProfesion: Observable<string[]>;

    //Digitalizacion Form
    listaDocsGar: any = []; // lista para digitalizacion
    listaTipoSocios: any = []; // lista para digitalizacion

    listaDocAgregados: any = []; // lista para digitalizacion
    public previsualizacion: string;
    //Arreglos para procesar informacion final
    arregloSujeto: any = [];
    arregloPerfil: any = [];
    arregloDetalle: any = [];

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private serviceCombo: CombosClienteService,
        private servicePermisos: PermisosService,
        public dialog: MatDialog,
        private dialogA: MatDialogRef<AdminAvalesComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.titulo = data.titulo;
        this.accion = data.accion;
        this.noAval = data.noAval;
        this.creditoID = data.credito;

        if(data.documentos.length > 0) {
            this.listaDocsGar = data.documentos;
        }


        //Validaciones del formulario 
        this.formDatosG = this.formBuilder.group(
            {
                apeP: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
                apeM: new UntypedFormControl('',),
                nombres: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
                fechaN: new UntypedFormControl('', [Validators.required]),
                genero: new UntypedFormControl('', [Validators.required]),
                rfc: new UntypedFormControl('',),
                nacionalidadNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                entFedeNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                curp: new UntypedFormControl('',),
                mpNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                tel: new UntypedFormControl('', [Validators.pattern("^[0-9]*$"), Validators.maxLength(10),Validators.required]),
                email: new UntypedFormControl('', { validators: [Validators.pattern('^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+)+((\.)[a-z]{2,})+$')] }),

            });
        this.formIdentifiaciones = this.formBuilder.group({
            tipoIdentificacion: new UntypedFormControl(),
            numIdentificacion: new UntypedFormControl('', [Validators.maxLength(20)]),
            vigencia: new UntypedFormControl({ value: new Date(), disabled: true }),
            estatus: new UntypedFormControl(true)

        });

        this.formDomicilioCl = this.formBuilder.group({
            calle: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle1: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle2: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            referencia: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            numeroExterior: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            numeroInterior: new UntypedFormControl('',),
            estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            localidad: new UntypedFormControl({ value: '', disabled: true }),
            catColonia: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
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
            numDependientes: new UntypedFormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern('[0-9]*')]),
            estado_civil: new UntypedFormControl('', { validators: [Validators.required] }),
            regimenMatrimonial: new UntypedFormControl('', { validators: [Validators.required] }),
            nivelEstudios: new UntypedFormControl('', { validators: [Validators.required] }),
            tipoVivienda: new UntypedFormControl('', { validators: [Validators.required] }),
            profesion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            porcentaje: new UntypedFormControl('', { validators: [Validators.required] }),
            parentesco: new UntypedFormControl('', { validators: [Validators.required] }),
            tiempoConocerlo: new UntypedFormControl('', { validators: [Validators.required] }),
            calBuro: new UntypedFormControl(''),
            consultaBuro: new UntypedFormControl({ value: '', disabled: true }, Validators.required),
            noFolioSIC: new UntypedFormControl(''),
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
            inicioLaborar: new UntypedFormControl({ value: '', disabled: true }, Validators.required),
            ocupacionCl: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            descripcion: new UntypedFormControl('',),
            empresaTCl: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            repEmpresa: new UntypedFormControl('',),
            jerarquiaEmpCl: new UntypedFormControl('', [Validators.required])

        });



    }


    ngOnInit() {
        this.spsNacionalidadNac();
        this.spsEstadoNac();
        this.spsOcupacionesSINCO();
        this.spsEmpresas();
        this.spsTipoIdentificacion();
        this.spsCalificacionBuro();
        //this.spsListaGarantiaById();
    }
    //Use ngDoCheck cuando desee capturar cambios que Angular no haría de otra manera.
    ngDoCheck() {
        this.cargarCombos();
    }
    /**
     * Se cargan las listas de todos los combos, al terminar de incializar los componetes
     */
    cargarCombos() {
        if (this.listaTipoSocios.length == 0) {
            this.listaGenero = this.serviceCombo.listaGenero;
            this.listaTiempoArraigo = this.serviceCombo.listaTiempoArraigo;
            this.listaJerarquia = this.serviceCombo.listaJerarquia;
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
            this.listaTipoBien = this.serviceCombo.listaTipoBien;
            this.listaTipoIngreso = this.serviceCombo.listaTipoIngreso;
            this.listaTipoEgreso = this.serviceCombo.listaTipoEgreso;
            this.listaOrigenIngresos = this.serviceCombo.listaOrigenIngresos;
            this.listaTipoSocios = this.serviceCombo.listaTipoSocios;
            if (this.accion == 2 && this.listaTipoSocios.length > 0) {
                this.consultarAval(this.creditoID, this.noAval);
            }
        }
    }
    /**
* Metodo para cambiar el nombre del tab acorde a donde este trabajando el usuario
* @param changeEvent contiene el elemento tab con sus propiedades
* */
    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        this.nombreTab = changeEvent.tab.textLabel;

    }
    /**
       * Metodo que lista el tipo identificacion
       */
    spsTipoIdentificacion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catIdentificacion, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoIdentificaciones = data;
            this.opcionesIdentificaciones = this.formIdentifiaciones.get('tipoIdentificacion').valueChanges.pipe(
                startWith(''),
                map(value => this._filterTD(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
          * Muestra la descripción del tipo documento
          * @param option --estado seleccionado
          * @returns --nombre del documento
          */
    displayFnTD(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filtra el documento
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterTD(value: any): any {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaTipoIdentificaciones.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
    /**
    * Metodo para agregar datos a la lista de identificaciones
    */
    agregarIdentificaciones() {
        let tipoIdentificacion = this.formIdentifiaciones.get('tipoIdentificacion').value;
        let numIdentificacion = this.formIdentifiaciones.get('numIdentificacion').value;
        let vigencia = moment(this.formIdentifiaciones.get('vigencia').value).format("yyyy-MM-DD");

        // Selecciona un tipo de identificacion.
        if ((tipoIdentificacion !== '' && tipoIdentificacion !== null && tipoIdentificacion != undefined)) {

            // Validamos los campos que son obligatorios
            if (numIdentificacion === "" || vigencia === "") {
                this.service.showNotification('top', 'right', 3, 'Llena los campos necesario.');
                return;
            }
            // Si la lista esta vacia, la agrega directo.
            let identificacionId = 0;
            if (this.listaIdentificacionesSeleccionados.length <= 0) {
                let objeto = [
                    identificacionId,
                    numIdentificacion,
                    vigencia,
                    tipoIdentificacion.generalesId,
                    tipoIdentificacion.descripcion
                ];
                this.listaIdentificacionesSeleccionados.push(objeto);
                this.formIdentifiaciones.get('tipoIdentificacion').setValue('');
                this.formIdentifiaciones.get('numIdentificacion').setValue('');
                this.formIdentifiaciones.get('vigencia').setValue(new Date());

            } else {
                this.actualizarIdentificacion();
            }
        }//tipo identificacion
    }
    /**Se actualizan los datos de la idnetificacion que se agrego */
    actualizarIdentificacion() {
        let tipoIdentificacion = this.formIdentifiaciones.get('tipoIdentificacion').value;
        let numIdentificacion = this.formIdentifiaciones.get('numIdentificacion').value;
        let vigencia = moment(this.formIdentifiaciones.get('vigencia').value).format("yyyy-MM-DD");
        let identificacionId = 0;
        // La lista no se encuentra vacia.
        // Buscamos en la lista si ya existe un registro con el tipoIdentificacion
        let indice = this.listaIdentificacionesSeleccionados.findIndex(i => i[3] === tipoIdentificacion.generalesId); //i.tipoIdentificacionId
        if (indice === -1) { // No existe
            // Se verifica que no exista una identificacion con la misma numIdentificacion
            let indice2 = this.listaIdentificacionesSeleccionados.findIndex(i => i[1] === numIdentificacion); //i.numIdentificacion
            if (indice2 === -1) { // No existe
                let objeto = [
                    identificacionId,
                    numIdentificacion,
                    vigencia,
                    tipoIdentificacion.generalesId,
                    tipoIdentificacion.descripcion
                ];
                this.formIdentifiaciones.get('tipoIdentificacion').setValue('');
                this.formIdentifiaciones.get('numIdentificacion').setValue('');
                this.formIdentifiaciones.get('vigencia').setValue(new Date());
                this.listaIdentificacionesSeleccionados.push(objeto);
            }
        } else { // Existe, se actualiza el tipo de identificacion
            // Se verifica que no exista una identificacion con la misma numIdentificacion
            let indice2 = this.listaIdentificacionesSeleccionados.findIndex(i => i[1] === numIdentificacion && i[3] !== tipoIdentificacion.generalesId); //i.numIdentificacion i.tipoIdentificacionId
            if (indice2 === -1) { // No existe
                // Recorremos la lista, al encontrarlo lo actualizamos.
                this.listaIdentificacionesSeleccionados.forEach(element => {
                    if (element[3] === tipoIdentificacion.generalesId) {
                        element[1] = numIdentificacion;
                        element[2] = vigencia;
                        element[4] = tipoIdentificacion.descripcion;
                    }
                });
                this.formIdentifiaciones.get('tipoIdentificacion').setValue('');
                this.formIdentifiaciones.get('numIdentificacion').setValue('');
                this.formIdentifiaciones.get('vigencia').setValue(new Date());
                this.service.showNotification('top', 'right', 1, "La identificación ya se encuentra registrada, solo se actualizaron sus valores.")
            } else { // Existe
                this.service.showNotification('top', 'right', 3, 'Ya existe la identificación: ' + numIdentificacion + '.');
                return;
            }
        }
    }
    /** 
     * Metodo para mostrar la identificacion
     * elemento[3] = tipoIdentificacion
     * elemento[1] = numIdentificacion
     * elemento[2] = vigencia
    */
    mostrarIdentificacion(elemento: any) {
        let tipoIdentificacionId: any
        //Busca la información de la lista original por el id
        tipoIdentificacionId = this.listaTipoIdentificaciones.find(x => x.generalesId === elemento[3]);
        this.formIdentifiaciones.get('tipoIdentificacion').setValue(tipoIdentificacionId);
        this.formIdentifiaciones.get('numIdentificacion').setValue(elemento[1]);
        this.formIdentifiaciones.get('vigencia').setValue(new Date(elemento[2] + 'T00:00:00'));
    }

    /**
     * Metodo para remover datos de la lista de identificaciones
     * valor[3] = tipoIdentificacion 
     * res[3] = tipoIdentificacion
    */
    eliminarIdentificaciones(valor: any) {
        let index = this.listaIdentificacionesSeleccionados.findIndex(res => res[3] === valor[3]);
        this.listaIdentificacionesSeleccionados.splice(index, 1);
    }


    /**
     * Metodo que resetea el formulario y limpia variables
     */
    nuevoRegistro() {
        // Reseteamos el formulario
        this.formIdentifiaciones.reset();
        this.listaIdentificaciones = [];
        this.listaIdentificacionesSeleccionados = [];
        this.formIdentifiaciones.get('estatus').setValue(true);
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
        return this.listaNac.filter(option => option.nacion.toLowerCase().includes(filterValue));
    }
    /**
    * Listar los estados activos para clientes y referencias
    */

    spsEstadoNac() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstadosNac = data;
            this.opcionesEstadoNac = this.formDatosG.get('entFedeNac').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEstadoNac(value))
            );//domicilio
            this.opcionesEstado = this.formDomicilioCl.get('estado').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEstadoNac(value))
            );//nacimiento
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
        return this.listaEstadosNac.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
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
        this.generarCurp();
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
        this.formDomicilioCl.get('localidad').setValue(nomLocalidad);

    }

    /**Metodo para guardar domicilios del cliente*/
    otroDomicilio() {
        if (this.formDomicilioCl.invalid) {
            this.validateAllFormFields(this.formDomicilioCl);
            this.blockUI.stop();
            return;
        }
        let index = this.listAddDom.findIndex(result => result[13] === this.formDomicilioCl.get("jerarquia")?.value.generalesId)

        if (index !== -1) {
            this.domID = this.listAddDom[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo el domicilio');
            this.listAddDom.splice(index, 1);
        }
        this.listAddDom.push([
            this.domID,
            this.formDomicilioCl.get("calle")?.value,
            this.formDomicilioCl.get("numeroExterior")?.value,
            this.formDomicilioCl.get("numeroInterior")?.value,
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
            /* ver sise usa up tthis.formDomicilioCl.get("jerarquia")?.value.cveGeneral,*/

        ]);
        //se limpia el formulario 
        this.formDomicilioCl.reset();
    }
    /**Elimina el registro de la lista de domicilios */
    quitarDomicilio(index) {
        //llamar advertencia
        this.listAddDom.splice(index, 1);
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
        let estado = this.listaEstadosNac.find(t => t.estadoid === this.listAddDom[index][16]);
        this.idEstSel = this.listAddDom[index][16];
        this.formDomicilioCl.get('estado').setValue(estado);
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
                //this.listAddDom.splice(index, 1);
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
    /**Metodo para identificar el tipo de refencia seleccionoado */
    cambioTipoRefe(dato) {
        if (environment.generales.estadoCivilCasado == this.formPerfilTransacional.get("estado_civil").value.cveGeneral
            && dato.value.cveGeneral != environment.generales.estadoCivilCasado) {
            this.service.showNotification('top', 'right', 3, "El cliente a indicado que se encuentra casado, registra su conyuge en refencias.");
        }
    }
    /**
   * Metodo para generar la CURP y RFC
   */
    generarCurp() {
        let sexo: any;
        let municipio: any;
        sexo = this.formDatosG.get('genero').value.descripcion.toUpperCase();
        municipio = this.formDatosG.get('entFedeNac').value.nombreEstado.toUpperCase();
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
        persona.fechaNacimiento = moment(this.formDatosG.get('fechaN').value).format("yyyy-MM-DD");
        persona.estado = municipio;
        let curpGenerada = environment.curp.generar(persona);
        //asignacion de datos
        this.formDatosG.get('curp').setValue(curpGenerada);
        this.formDatosG.get('rfc').setValue(curpGenerada.substring(0, 10));
    }

    /**Metodo para buscar un sujeto registrado que coincida con el q se va a registrar 
     * regresa los datos del sujeto que no es cliente
    */
    buscarSujeto() {
        this.blockUI.start('Cargando datos...');
        let sujeto = {
            "nombres": this.formDatosG.get('nombres').value,
            "apellidoPaterno": this.formDatosG.get('apeP').value,
            "apellidoMaterno": this.formDatosG.get('apeM').value,
            "fechaNacimiento": this.formDatosG.get('fechaN').value,
        }
        this.service.getListByObjet(sujeto, 'buscarSujeto').subscribe(data => {
            if (data[0].referencias != null) {
                this.listRefEncontrada = JSON.parse(data[0].referencias);
                var encabezado = "Se encontraron datos de la persona a registrar.";
                var body = "¿Deseas cargar su información?";
                this.abrirAdvertencia(encabezado, body);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
        });

    }
    /**
* Abrir ventana modal de confirmacion para el domicilio y los datos de un sujeto registrado
@param encabezado titulo para la venta modal
@param body cuerpo de la venta modal
@param accion acorde a lo que  va a mostrar la venta modal
* */
    abrirAdvertencia(encabezado, body) {
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar
                this.sujetoACliente();
            }
        });
    }
    /**
  * Listar OCUPACIONES SINCO 
  */
    spsOcupacionesSINCO() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(2, 'listaOcupacionesSinco').subscribe(data => {
            this.listaSINCO = data;
            this.opcionesProfesion = this.formPerfilTransacional.get('profesion').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSINCO(value))
            );
            this.opcionesSINCOCL = this.formEmpleoCl.get('ocupacionCl').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSINCO(value))
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
        return this.listaSINCO.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
    /**
   * Listar empresas empleadoras  para cliente y referencia
   */
    spsEmpresas() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID('01EE', 'listaTipoEmpresa').subscribe(data => {
            this.listaEmpresa = data;
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
    /**Datos de un cliente para ser aval 
     * @param datos informacion del cliente
    */
    clienteAval(datos: any) {
        this.accion = 1;
        this.clienteID = datos.cliente_id;
        //Datos Generales
        this.sujetoID = datos.sujeto_cl;
        this.formDatosG.get('apeP').setValue(datos.paterno_cl);
        this.formDatosG.get('apeM').setValue(datos.materno_cl);
        this.formDatosG.get('nombres').setValue(datos.nombre_cl);
        this.formDatosG.get('fechaN').setValue(datos.fecha_nacimiento + 'T00:00:00');
        let genero = this.listaGenero.find(v => v.generalesId === datos.generales_id);
        this.formDatosG.get('genero').setValue(genero);
        this.formDatosG.get('rfc').setValue(datos.rfc);
        let nacionalidad = this.listaNac.find(t => t.nacionalidadid === datos.nacionalidadid);
        this.formDatosG.get('nacionalidadNac').setValue(nacionalidad);
        let estado = this.listaEstadosNac.find(v => v.estadoid === datos.estado_id);
        this.formDatosG.get('entFedeNac').setValue(estado);
        this.formDatosG.get('curp').setValue(datos.curp);
        this.service.getListByID(datos.estado_id, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            let ciudad = this.listaCiudadNac.find(c => c.ciudaId === datos.cd_nac);
            this.formDatosG.get('mpNac').setValue(ciudad);
        });
        let agenda = JSON.parse(datos.agendacl);
        for (let i of agenda) {
            if (i.cvejerarquia == environment.generales.principal) {
                this.agendaID = i.agenda_id;
                this.formDatosG.get('tel').setValue(i.telefono.trim());
                this.formDatosG.get('email').setValue(i.correo);
            }
        }
        // listaIdentificaciones
        if (datos.identificacion_id > 0) {
            this.identificaionID = datos.identificacion_id;
            let tipoIdent = this.listaTipoIdentificaciones.find(t => t.generalesId === datos.tipoidenid);
            this.listaIdentificacionesSeleccionados.push([this.identificaionID, datos.num_identificacion.trim(),
            datos.vigencia, tipoIdent.generalesId, tipoIdent.descripcion]);

        }
        //Domicilio cliente a la lista
        let domicilio = JSON.parse(datos.domicilio_cl);
        for (let dom of domicilio) {
            //lista domicilio a guardar
            this.listAddDom.push([
                dom.domicilio_id,
                dom.calle,
                dom.numero_exterior.trim(),
                dom.numero_interior.trim(),
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
                dom.cp,//datos para combos
                dom.ciudad_id,
                dom.estado_id]);
        }
        //Bienes
        let bienMJSON = JSON.parse(datos.bienes_cl);
        if (bienMJSON != null) {
            for (let bien of bienMJSON) {
                let tipoB = this.listaTipoBien.find(b => b.generalesId === bien.tipo_bien_id);
                this.listAddBienes.push([
                    bien.bien_id, bien.tipo_bien_id,
                    bien.valor_aprox, bien.num_escritura_factura,
                    bien.modelo, bien.marca,
                    bien.otrobien,
                    tipoB.descripcion,
                    tipoB.cveGeneral]
                );
            }
        }
        //Perfil Transaccional
        this.perfilID = datos.perfil_id;
        let actRealiza = this.listaActividadRealiza.find(a => a.generalesId === datos.act_realizaid);
        this.formPerfilTransacional.get('actividadRealiza').setValue(actRealiza);
        this.formPerfilTransacional.get('numDependientes').setValue(datos.num_dependientes);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === datos.ecivil_id);
        let regMatr = this.listaRegimenMatrimonial.find(v => v.generalesId === datos.regimen_id);
        let nivEst = this.listaNivelEscolar.find(e => e.generalesId === datos.estudios_id);
        let tipoVivi = this.listaTipoVivienda.find(tv => tv.generalesId === datos.vivienda_id);
        let periodoIng = this.listaTipoPlazo.find(v => v.tipoPlazoId === datos.idtipoplazo);
        let profesion = this.listaSINCO.find(l => l.ocupacionId === datos.ocupacionid);
        this.formPerfilTransacional.get('estado_civil').setValue(estCivil);
        this.formPerfilTransacional.get('regimenMatrimonial').setValue(regMatr);
        this.formPerfilTransacional.get('nivelEstudios').setValue(nivEst);
        this.formPerfilTransacional.get('tipoVivienda').setValue(tipoVivi);
        this.formPerfilTransacional.get('profesion').setValue(profesion);
        this.tipoPlazo.setValue(periodoIng);
        this.formPerfilTransacional.get('porcentaje').setValue(datos.porcentaje);
        this.formPerfilTransacional.get('parentesco').setValue('');
        this.formPerfilTransacional.get('tiempoConocerlo').setValue('');
        this.formPerfilTransacional.get('calBuro').setValue('');
        let fechBuro='';
        if(!this.vacio(datos.fecha_consulta_buro)){
             fechBuro=datos.fecha_consulta_buro+ 'T00:00:00';
        }
        this.formPerfilTransacional.get('consultaBuro').setValue(fechBuro);
        this.formPerfilTransacional.get('noFolioSIC').setValue(datos.nofoliosic);
        let origen = this.listaOrigenIngresos.find(o => o.generalesId === datos.origen_id);
        this.origenIngreso.setValue(origen);
        //Ingresos Egresos
        let ingresoJSON = JSON.parse(datos.ingresos);
        if (ingresoJSON != null) {
            for (let ingreso of ingresoJSON) {
                let ingr = this.listaTipoIngreso.find(i => i.generalesId === ingreso.tipo_id);
                this.listAddIngreso.push([
                    ingreso.tipo_id, ingr.descripcion, ingreso.monto_ingreso
                ]);
            }
        }
        let egresoJSON = JSON.parse(datos.egresos_cl);
        if (egresoJSON != null) {
            for (let egreso of egresoJSON) {
                let egr = this.listaTipoEgreso.find(e => e.generalesId === egreso.tipo_egreso_id);
                this.listAddEgreso.push([
                    egreso.tipo_egreso_id, egr.descripcion, egreso.monto_egreso
                ]);
            }
        }
        this.clienteAvalEmpleo(datos);

    }
    /**
     * Extraccion de empleos del cliente a ser Aval
     * @param datos infomarmacion completa del cliente
     */
    clienteAvalEmpleo(datos: any) {
        //empleo 
        let empleoJSON = JSON.parse(datos.empleos_cl);
        if (empleoJSON != null) {
            for (let empleo of empleoJSON) {
                let empresa = this.listaEmpresa.find(e => e.empresaId === empleo.empresa_id);
                this.listAddEmp.push([
                    empleo.empleo_id,//0
                    empleo.ocupacion_id,//1
                    empleo.observacion,//2
                    empleo.fechainicio,//3
                    empleo.horario_desde,//4
                    empleo.horario_hasta,//5
                    empleo.numero_trabajo,//6
                    empleo.empresa_id,//7
                    empleo.contrato_id,//8
                    empresa.rfc,//9
                    empresa.razonSocial,
                    empresa.representante
                ]);
            }
            this.blockUI.stop();
        }
    }
    /**
     * Se carga informacion de un sujeto que va a ser Aval
     */
    sujetoACliente() {

        let findGenero = this.listaGenero.find(i => i.descripcion === this.listRefEncontrada[0].genero);
        let findCivil = this.listaEstCivil.find(i => i.descripcion === this.listRefEncontrada[0].civil);
        let findNacionalidadNac = this.listaNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad);
        let findEstadoNac = this.listaEstadosNac.find(i => i.nombreEstado === this.listRefEncontrada[0].nombre_estado);
        this.idEstSel = this.listRefEncontrada[0].estado_id;

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
        this.formDatosG.get('entFedeNac').setValue(findEstadoNac);
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudadesNac = this.formDatosG.get('mpNac').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            let ciudad = this.listaCiudadNac.find(t => t.ciudaId === this.listRefEncontrada[0].ciudad_id);
            this.formDatosG.get("mpNac").setValue(ciudad);

        });
        // listaIdentificaciones
        let identificaciones = JSON.parse(this.listRefEncontrada[0].identificaciones);
        if (identificaciones[0].identificacion_id > 0) {
            this.identificaionID = identificaciones[0].identificacion_id;
            let tipoIdent = this.listaTipoIdentificaciones.find(t => t.generalesId === identificaciones[0].tipo_id);
            this.listaIdentificacionesSeleccionados.push([
                this.identificaionID, identificaciones[0].num_identificacion.trim(),
                identificaciones[0].vigencia, tipoIdent.generalesId, tipoIdent.descripcion]);

        }
        if (this.listRefEncontrada[0].agenda_id > 0) {
            this.agendaID = this.listRefEncontrada[0].agenda_id;
            this.formDatosG.get("tel").setValue(this.listRefEncontrada[0].telefono.trim());
            this.formDatosG.get("email").setValue(this.listRefEncontrada[0].correo)
        }

        //Domicilios
        let findNacionalidadDom = this.listaNac.find(i => i.nacion === this.listRefEncontrada[0].nacionalidad_dom);
        let findEstadoDom = this.listaEstadosNac.find(i => i.nombreEstado === this.listRefEncontrada[0].estado_dom);
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
        this.formDomicilioCl.get("estado").setValue(findEstadoDom);
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
        this.formEmpleoCl.get("inicioLaborar").setValue(this.listRefEncontrada[0].fechainicio + 'T00:00:00');
        this.formEmpleoCl.get("entradaCl").setValue(this.listRefEncontrada[0].horario_desde);
        this.formEmpleoCl.get("salidaCl").setValue(this.listRefEncontrada[0].horario_hasta);
        let ocupacionEmpCl = this.listaSINCO.find(o => o.ocupacionId === this.listRefEncontrada[0].ocupacion_id);
        this.formEmpleoCl.get("ocupacionCl").setValue(ocupacionEmpCl);
        this.formEmpleoCl.get("descripcion").setValue(this.listRefEncontrada[0].observacion);
        this.formEmpleoCl.get("jerarquiaEmpCl").setValue(findJerarquia)
        this.service.showNotification('top', 'right', 3, 'Recuerda complementar la información .');
    }

    /**
     * Metodo para abrir ventana modal
     * @param ventana -- 1 Cliente  2 empresa
     */
    buscar(ventana) {
        let titulo = '';
        if (ventana === 1) {//clientes
            titulo = "Lista clientes";
            this.accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                // height: '500px',
                width: '50%',
                data: {
                    titulo: titulo,
                    accion: this.accion
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                if (result.tipoPersona == 'F') {
                    this.llenarDatosCliente(result.datosCl, ventana);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente Físico o Extranjero.');
                }
            });
        } else if (ventana === 2) {//empresas
            titulo = "Agregar empresas";
            this.accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarEmpresaComponent, {
                // height: '500px',
                width: '60%',
                data: {
                    titulo: titulo
                }
            });
            dialogRef.afterClosed().subscribe(result => {

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
        this.listaDocAgregados = [];
        this.formDatosG.reset();//Datos generales del cliente
        this.formDomicilioCl.reset();//Domicilios del cliente
        this.formPerfilTransacional.reset();//Perfil transaccional del cliente
        this.formEmpleoCl.reset();
    }
    /**
     * Regresa los datos del aval
     * @param credito id del credito 
     * @param noAval  no de aval a editar
     */
    consultarAval(credito, noAval) {

        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(credito + '/' + noAval, 'listaAval').subscribe(aval => {
            if(!this.vacio(aval)){
                let avalDatos = JSON.parse(aval);
                this.llenarDatosCliente(avalDatos[0], 0);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para llenar los campos de la información del cliente a Editar
     * @param datos toda la infoamción del clientes
     * @param ventana indica 1=Empresa,2=Refencia,0=Cliente
     */
    llenarDatosCliente(datos: any, ventana: any) {
        //Llenado de documentos
        if (datos.digitalizacion != null) {
            let digitalizacionJSON = JSON.parse(datos.digitalizacion);
            for (let doc of digitalizacionJSON) {
                this.docCodificadoID = doc.documentocodificado_id;
                this.listaDocAgregados.push([
                    doc.documentobase64,
                    this.docCodificadoID,
                    doc.tipodocumento_id,
                    doc.nombredoc,
                    this.servicePermisos.usuario.id
                ]);
            }
        }
        if (ventana == 0) {
            this.blockUI.start('Cargando datos...');
            this.datosCliente(datos);
        } else if (ventana == 1) {
            this.blockUI.start('Cargando datos...');
            this.clienteAval(datos);
        }

    }
    /**
     * Metodo para llenar los campos con la informacion del cliente
     * @param datos toda la informacion del cliente 
     */
    datosCliente(datos) {

        // this.clienteID = datos.cliente_id;
        //Datos Generales
        this.avalID = datos.aval_id;
        this.sujetoID = datos.sujeto_id;
        this.formDatosG.get('apeP').setValue(datos.apellido_paterno);
        this.formDatosG.get('apeM').setValue(datos.apellido_materno);
        this.formDatosG.get('nombres').setValue(datos.nombres);
        this.formDatosG.get('fechaN').setValue(datos.fecha_nacimiento + 'T00:00:00');
        let genero = this.listaGenero.find(v => v.generalesId === datos.genero_id);
        this.formDatosG.get('genero').setValue(genero);
        this.formDatosG.get('rfc').setValue(datos.rfc);
        let nacionalidad = this.listaNac.find(t => t.nacionalidadid === datos.nacionalidad_id);
        this.formDatosG.get('nacionalidadNac').setValue(nacionalidad);
        let estado = this.listaEstadosNac.find(v => v.estadoid === datos.pais_nac_id);
        this.formDatosG.get('entFedeNac').setValue(estado);
        this.formDatosG.get('curp').setValue(datos.curp);
        this.service.getListByID(datos.pais_nac_id, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            let ciudad = this.listaCiudadNac.find(c => c.ciudaId === datos.ciudad_nac_id);
            this.formDatosG.get('mpNac').setValue(ciudad);
        });
        if(!this.vacio(datos.agenda)){
        let agenda=JSON.parse(datos.agenda);
        this.agendaID = agenda[0].agenda_id;
        this.formDatosG.get('tel').setValue(agenda[0].telefono.trim());
        this.formDatosG.get('email').setValue(agenda[0].correo);
        }
        // Parceamos las identificaciones a JSON y las guardamos en listaIdentificaciones
        this.listaIdentificaciones = JSON.parse(datos.identificaciones);
        if (!this.vacio(this.listaIdentificaciones)) {
            // Recorremos la lista identificaciones para formar la matriz y guardarla en listaIdentificacionesSeleccionados
            this.listaIdentificaciones.forEach(element => {
                let findTipoIdent = this.listaTipoIdentificaciones.find(i => i.generalesId === element.tipo_identificacion_id);

                let objeto = [
                    element.identificacion_id,
                    element.num_identificacion,
                    element.vigencia,
                    element.tipo_identificacion_id,
                    findTipoIdent.descripcion
                ];
                this.listaIdentificacionesSeleccionados.push(objeto);
            });
        }
        this.blockUI.stop();
        this.datosAvalDom(datos);
    }
    /**
      * Metodo para llenar los campos con la informacion del cliente
      * @param datos toda la informacion del cliente 
      */
    datosAvalDom(datos) {
        //Domicilio cliente a la lista
        let domicilio = JSON.parse(datos.domicilios);
        for (let dom of domicilio) {
            //lista domicilio a guardar
            this.listAddDom.push([
                dom.domicilio_id,
                dom.calle,
                dom.numero_exterior.trim(),
                dom.numero_interior.trim(),
                dom.entre_calle_1,
                dom.entre_calle_2,
                dom.referencia,
                dom.colonia_id,
                dom.nacionalidad_id,
                dom.res_extrajera,
                dom.latitud.trim(),
                dom.longitud.trim(),
                dom.tiempo_arraigo,
                dom.numero_domicilio,
                dom.codigo_postal,//datos para combos
                dom.ciudad_id,
                dom.estado_id]);

        }
        //Bienes
        let bienMJSON = JSON.parse(datos.bienes_av);
        if (bienMJSON != null) {
            for (let bien of bienMJSON) {
                let tipoB = this.listaTipoBien.find(b => b.generalesId === bien.tipo_bien_id);
                this.listAddBienes.push([
                    bien.bien_id, bien.tipo_bien_id,
                    bien.valor_aprox, bien.num_escritura_factura,
                    bien.modelo, bien.marca,
                    bien.otrobien,
                    tipoB.descripcion,
                    tipoB.cveGeneral]
                );
            }
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

        let actRealiza = this.listaActividadRealiza.find(a => a.generalesId === datos.actividad_realiza_id);
        this.formPerfilTransacional.get('actividadRealiza').setValue(actRealiza);
        this.formPerfilTransacional.get('numDependientes').setValue(datos.num_dependientes);
        let estCivil = this.listaEstCivil.find(c => c.generalesId === datos.estado_civil_id);
        let regMatr = this.listaRegimenMatrimonial.find(v => v.generalesId === datos.regimen_matrimonial_id);
        let nivEst = this.listaNivelEscolar.find(e => e.generalesId === datos.nivel_estudios_id);
        let tipoVivi = this.listaTipoVivienda.find(tv => tv.generalesId === datos.tipo_vivienda_id);
        let periodoIng = this.listaTipoPlazo.find(v => v.tipoPlazoId === datos.tipo_plazo_id);
        let parentesco = this.listaParentesco.find(p => p.generalesId === datos.parentesco_id);
        let tconocerlo = this.listaTiempoArraigo.find(g => g.generalesId === datos.tiempo_conocerlo_id);
        let origen = this.listaOrigenIngresos.find(o => o.generalesId === datos.origen_ingresos_id);
        let cburo = this.listaCalificacionBuro.find(b => b.generalesId === datos.calificacion_buro_id);

        this.formPerfilTransacional.get('estado_civil').setValue(estCivil);
        this.formPerfilTransacional.get('regimenMatrimonial').setValue(regMatr);
        this.formPerfilTransacional.get('nivelEstudios').setValue(nivEst);
        this.formPerfilTransacional.get('tipoVivienda').setValue(tipoVivi);
        let profesion = this.listaSINCO.find(l => l.ocupacionId === datos.ocupacion_id);
        this.formPerfilTransacional.get('profesion').setValue(profesion);
        this.tipoPlazo.setValue(periodoIng);
        this.formPerfilTransacional.get('porcentaje').setValue(datos.porcentaje);
        this.formPerfilTransacional.get('parentesco').setValue(parentesco);
        this.formPerfilTransacional.get('tiempoConocerlo').setValue(tconocerlo);
        this.formPerfilTransacional.get('calBuro').setValue(cburo);
        this.formPerfilTransacional.get('consultaBuro').setValue(datos.fecha_consulta_buro + 'T00:00:00');
        this.formPerfilTransacional.get('noFolioSIC').setValue(datos.nofoliosic);
        this.origenIngreso.setValue(origen);
        //Ingresos Egresos 
        this.datosClienteIngEg(datos);
    }

    /**
   * Metodo para llenar los campos con la informacion del cliente
   * @param datos toda la informacion del cliente 
   */
    datosClienteIngEg(datos) {
        let ingresoJSON = JSON.parse(datos.ingresos_av);
        if (ingresoJSON != null) {
            for (let ingreso of ingresoJSON) {
                let ingr = this.listaTipoIngreso.find(i => i.generalesId === ingreso.tipo_ingreso_id);
                this.listAddIngreso.push([
                    ingreso.tipo_ingreso_id, ingr.descripcion, ingreso.monto
                ]);
            }
        }
        let egresoJSON = JSON.parse(datos.egresos_av);
        if (egresoJSON != null) {
            for (let egreso of egresoJSON) {
                let egr = this.listaTipoEgreso.find(e => e.generalesId === egreso.tipo_egreso_id);
                this.listAddEgreso.push([
                    egreso.tipo_egreso_id, egr.descripcion, egreso.monto
                ]);
            }
        }
        this.datosClienteEmpleo(datos);
    }
    /**
        * Metodo para llenar los campos con la informacion del cliente
        * @param datos toda la informacion del cliente 
        */
    datosClienteEmpleo(datos) {
        //Empleo cliente 
        let empleoJSON = JSON.parse(datos.empleos);

        if (empleoJSON != null) {
            for (let empleo of empleoJSON) {
                let empresa = this.listaEmpresa.find(e => e.empresaId === empleo.empresa_id);

                this.listAddEmp.push([
                    empleo.empleo_id,//0
                    empleo.ocupacion_id,//1
                    empleo.observacion,//2
                    empleo.fechainicio,//3
                    empleo.horario_desde,//4
                    empleo.horario_hasta,//5
                    empleo.numero_trabajo,//6
                    empleo.empresa_id,//7
                    empleo.tipo_contrato_id,//8
                    empresa.rfc,//9
                    empresa.razonSocial,
                    empresa.representante
                ]);
            }
        }

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
    /**Se valida y se pasan los valores del formEmpleoCl a la lista de empleos */
    otroEmpleoCl() {
        if (this.formEmpleoCl.invalid) {
            this.validateAllFormFields(this.formEmpleoCl);
            this.blockUI.stop();
            return;
        }
        let index = this.listAddEmp.findIndex(result => result[6] === this.formEmpleoCl.get('jerarquiaEmpCl')?.value.generalesId)

        if (index !== -1) {
            this.domID = this.listAddEmp[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo el empleo');
            this.listAddEmp.splice(index, 1);
        }
        this.listAddEmp.push([
            this.empleoID,
            this.formEmpleoCl.get('ocupacionCl')?.value.ocupacionId,
            this.formEmpleoCl.get('descripcion')?.value,
            moment(this.formEmpleoCl.get('inicioLaborar')?.value).format("yyyy-MM-DD"),
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
        this.formEmpleoCl.reset();
    }
    /**Metodo para eliminar un empleo de la lista*/
    quitarEmpleoCl(index) {
        //Llamar advertencia
        this.listAddEmp.splice(index, 1);
    }
    /**
     * Metodo para editra los datos del empleo
     * @param index 
     */
    editarEmpleoCl(index) {
        this.empleoID = this.listAddEmp[index][0];
        this.formEmpleoCl.get('inicioLaborar').setValue(this.listAddEmp[index][3] + 'T00:00:00');
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
    /**
* Metodo que lista los documetos por clave de garantia AV
*/
   /* spsListaGarantiaById() {
        this.service.getListByArregloIDs('AV/' + 1, 'listaGarantiaById').subscribe(
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

        this.blockUI.start('Subiendo archivo...');
        let index = this.listaDocAgregados.findIndex(x => x[2] === documentos.tipodocumento_id);
        if (index >= 0) {//Ya existe el documento
            this.docCodificadoID = this.listaDocAgregados[index][1];
            this.listaDocAgregados.splice(index, 1);
        } else {
            this.docCodificadoID = 0;
        }
        let archivoCapturado = archivo.target.files[0];
        this.extraerBase64(archivoCapturado).then((imagen: any) => {
            this.previsualizacion = imagen.base;
            this.listaDocAgregados.push([
                this.previsualizacion,
                this.docCodificadoID,
                documentos.tipodocumento_id,
                documentos.descripcion.trim(),
                this.servicePermisos.usuario.id
            ]);
        });

        this.blockUI.stop();

    }
    /**
     * Visualizar el documento agregado
     * @param documento 
     */
    mostrarDoc(documento) {
        let titulo = 'Documento';

        this.dialog.open(DocumentosModalComponent, {
            width: '40%',
            data: {
                titulo: titulo,
                nombre: documento[3],
                documentos: documento
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

    /**Crear arreglos y matrices  para guardar la infomacion del AVAL*/
    formarJsonAval() {
        this.blockUI.start('Cargando datos...');
        //validar
        if (this.formDatosG.invalid) {
            this.formDatosG.get('fechaN').updateValueAndValidity();
            this.validateAllFormFields(this.formDatosG);
            this.service.showNotification('top', 'right', 3, "Completa la información en Datos Generales.");
            this.blockUI.stop();
            return;
        }
        if (this.formPerfilTransacional.invalid) {
            this.validateAllFormFields(this.formPerfilTransacional);
            if (this.tipoPlazo instanceof UntypedFormControl) {
                this.tipoPlazo.markAsTouched({ onlySelf: true });
            }
            if (this.origenIngreso instanceof UntypedFormControl) {
                this.origenIngreso.markAsTouched({ onlySelf: true });
            }
            this.service.showNotification('top', 'right', 3, "Completa la información en Perfil Transaccional.");
            this.blockUI.stop();
            return;
        }
        if (this.listAddEmp.length === 0 && this.formPerfilTransacional.get('actividadRealiza').value.cveGeneral != "23DS") {
            this.service.showNotification('top', 'right', 3, "No se ha agregado un empleo.");
            this.blockUI.stop();
            return;
        }
        if (this.listAddDom.length === 0) {
            this.service.showNotification('top', 'right', 3, "No se ha agregado un domicilio.");
            this.blockUI.stop();
            return;
        }
        this.arregloSujeto.push(
            this.sujetoID,//1
            this.formDatosG.get('nombres').value,//2
            this.formDatosG.get('apeP').value,//3
            this.formDatosG.get('apeM').value,//4
            moment(this.formDatosG.get('fechaN').value).format("yyyy-MM-DD"),//5
            this.formDatosG.get('genero').value.generalesId,//6
            this.formDatosG.get('nacionalidadNac').value.nacionalidadid,//7
            this.formDatosG.get('rfc').value.trim(),//8
            this.formDatosG.get('curp').value,//9
            this.formPerfilTransacional.get('estado_civil').value.generalesId,//10
            this.formDatosG.get('entFedeNac').value.estadoid,//11 pais
            this.formDatosG.get('mpNac').value.ciudaId,//12cdNac
            true,//13 estatus
            this.servicePermisos.usuario.id,//14usuario,
            this.clienteID
        );

        /**Metodo para guardar agenda cliente */
        if (this.formDatosG.get("tel").value) {
            this.listAddAgenCl.push(
                this.agendaID,
                this.formDatosG.get("tel")?.value,
                this.formDatosG.get("email")?.value,
            );
        } else {
            this.service.showNotification('top', 'right', 3, "No se a agregado un número de teléfono.");

        }

        this.arregloPerfil.push(
            this.perfilID,//1
            this.formPerfilTransacional.get('nivelEstudios').value.generalesId,//2
            this.formPerfilTransacional.get('regimenMatrimonial').value.generalesId,//3
            this.formPerfilTransacional.get('profesion').value.ocupacionId,//4
            null,//5 actividadEconomica Moral
            this.formPerfilTransacional.get('tipoVivienda').value.generalesId,//6
            this.tipoPlazo.value.tipoPlazoId,//7periodo ingresos
            this.formPerfilTransacional.get('numDependientes').value,//8
            this.formPerfilTransacional.get('actividadRealiza').value.generalesId,//9
            this.actEmpresarial.value,//10 boolean
            this.origenIngreso.value.generalesId//11
        );

        //detalle avale
        let consBuro:any;
        if (!this.vacio(this.formPerfilTransacional.get('consultaBuro').value)) {
            consBuro = moment(this.formPerfilTransacional.get('consultaBuro').value).format("yyyy-MM-DD");
        }

        let tipoAvalSocio = false;
        if (this.clienteID > 0) {
            tipoAvalSocio = true;
        }

        this.arregloDetalle.push(
            this.avalID,
            this.creditoID,
            this.noAval,
            this.formPerfilTransacional.get('porcentaje').value,//4
            this.formPerfilTransacional.get('parentesco').value.generalesId,
            this.formPerfilTransacional.get('tiempoConocerlo').value.generalesId,
            this.formPerfilTransacional.get('calBuro').value.generalesId,//7
            consBuro,
            this.formPerfilTransacional.get('noFolioSIC').value,
            tipoAvalSocio
        );

        //Se forma el JSON para el CRUD de aval
        this.crudAval();

    }
    /**Guarda o actualiza la infomcaión de aval */
    crudAval() {
        let avales = {
            'sujeto': this.arregloSujeto,
            'agenda': this.listAddAgenCl,
            'identificaciones': this.listaIdentificacionesSeleccionados,
            'domicilios': this.listAddDom,
            'digitilizacionAval': this.listaDocAgregados,
            'extencionAval': {
                'perfil': this.arregloPerfil,
                'ingresos': this.listAddIngreso,
                'egresos': this.listAddEgreso,
                'empleo': this.listAddEmp,
                'bienes': this.listAddBienes,
                'detalle': this.arregloDetalle,
                'origen': '51EL'

            },
            'accion': this.accion
        }

        this.service.registrar(avales, 'crudAval').subscribe(result => {
            if (result[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
                this.dialogA.close(avales);
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        }
        );
    }

    //Inicia Validaciones Datos Generales del Clietes
    validacionesDatosG = {
        'nombres': [
            { type: 'required', message: 'Campo requerido máximo 100 carácteres.' }],
        'apeP': [
            { type: 'required', message: 'Campo requerido máximo 50 carácteres.' }],
        'fechaN': [
            { type: 'required', message: 'Campo requerido.' }],
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
        'claveIde': [{ type: 'required', message: 'Campo requerido*' }],
        'tel': [{ type: 'required', message: 'Campo requerido*' },
        { type: 'pattern', message: 'Solo números.' }],
        'email': [
            { type: 'pattern', message: 'El correo electrónico debe ser una dirección de correo electrónico válida' }
        ]
    }
    //Finaliza validaciones datos generales del cliente

    //Inicia Validaciones para domicilio del clientes
    validacionesDomCl = {
        'catNacionalidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no existe.' }],
        'estado': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no existe.' }],
        'ciudad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La ciudad no existe.' }],
        'catColonia': [
            { type: 'required', message: 'Campo requerido máximo 250 carácteres.' }],
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
        'profesion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La profesión no existe.' }],
        'tipoPlazo': [
            { type: 'required', message: 'Campo requerido.' }],
        'tiempoConocerlo': [{ type: 'required', message: 'Campo requerido.' }],
        'parentesco': [{ type: 'required', message: 'Campo requerido.' }],
        'porcentaje': [{ type: 'required', message: 'Campo requerido.' }],
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
    validaciones = {
        'numIdentificacion': [
            { type: 'maxlength', message: 'Campo maximo 20 dígitos.' }
        ],
        'tipoIdentificacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El tipo identificación no pertenece a la lista, elija otra.' }
        ]
    }
    /**
     * Metodo para borrar los datos del cliente al guardar o actualizar
     */
    vaciarInformacion() {
        this.formDatosG.reset();//Datos generales del cliente
        this.formDomicilioCl.reset();//Domicilios del cliente
        this.formPerfilTransacional.reset();//Perfil transaccional del cliente
        this.formEmpleoCl.reset();
        //limpiar listas
        this.listAddAgenCl = [];
        this.listAddDom = [];
        this.listAddBienes = [];
        this.listAddIngreso = [];
        this.listAddEgreso = [];
        this.listAddEmp = [];
        this.listaDocAgregados = [];
    }
}