import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { PermisosService } from "../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AdminGrupoComponent } from "../../../pages/clientes/grupos/modal-grupos/admin-grupos.component";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { globales } from "../../../../environments/globales.config";
import { generales } from "../../../../environments/generales.config";
import { formatCurrency, getCurrencySymbol } from "@angular/common";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { ModalPerfilComponent } from "./modal-perfil/modal-perfil.component";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
    selector: 'admin-grupales',
    moduleId: module.id,
    templateUrl: 'admin-grupales.component.html'
})
export class AdminCreditosGrupalesComponent implements OnInit {

    //Declaracion de variables
    formCredito: UntypedFormGroup;

    listaGrupos: any = [];
    listaCreditos: any = [];
    listaFrecuenciaPago: any = [];
    listaPeriodo: any = [];
    listaEstados: any = [];
    listaCiudadNac: any = [];
    listaCalificacionBuro: any = [];
    listaDocsGrupo = []; // 80GC
    listaDocs = []; //80CS

    listaDocsGrupoDgt = [];
    listaDocsCliente = [];

    opcionesGrupo: Observable<string[]>;
    grupos = new UntypedFormControl();
    lblNombreGrupo: any = "";

    urlSafe: SafeResourceUrl;
    urlDocCliente: SafeResourceUrl;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    opcionesCredito: Observable<string[]>;
    opcionesEstado: Observable<string[]>;//creditos 
    opcionesCiudades: Observable<string[]>;

    readOnly: boolean = false;

    //Variables para detalle credito
    cantidad: any;
    montoMin: number = 0;
    montoMax: number = 0;
    plazoMin: number = 0;
    plazoMax: number = 0;
    selectedIdEstado: number = 0;
    idEstSel: number = 0;//controla el estado seleccionado
    controlCd: number = 0;//controla la asignacion de ciudad
    destinoID: number = 0;
    selectedIdCiudad: number = 0;// Destino de recurso
    seleccionCd: number = 0;//controla la ciudad seleccionada

    //Inicio valores tasaInteres
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
    tasaInteres: number = 0;

    getSliderTickInterval(): number | 'auto' {
        if (this.showTicks) {
            return this.autoTicks ? 'auto' : this.tickInterval;
        }

        return 0;
    }
    //Fin valores tasa

    @BlockUI() blockUI: NgBlockUI;

    //Manejo de variables para lista Integrantes
    listaIntegrantesGrupo: any = [];

    @ViewChild('paginatorIntegrantes') paginatorIntegrantes: MatPaginator;
    @ViewChild('sortIntegrantes') sortIntegrantes: MatSort;

    dataSourceIntegrantes: MatTableDataSource<any>;
    displayedColumnsIntegrantes: string[] =
        ['numero_cliente', 'nombre_completo', 'edad', 'domicilio', 'profesion',
            'estatus_cliente', 'tipo_socio', 'tipointegrante', 'nombre_suc', 'acciones'];

    //Tabla para valores de credito
    @ViewChild('paginatorValores') paginatorValores: MatPaginator;
    @ViewChild('sortValores') sortValores: MatSort;

    dataSourceValores: MatTableDataSource<any>;
    displayedColumnsValores: string[] =
        ['numero_cliente', 'nombre_completo', 'edad', 'domicilio', 'tipointegrante', 'monto', 'buro'];

    //Tabla del Perfil(Ingresos, Egresos)
    @ViewChild('paginatorPerfil') paginatorPerfil: MatPaginator;
    @ViewChild('sortPerfil') sortPerfil: MatSort;

    dataSourcePerfil: MatTableDataSource<any>;
    displayedColumnsPerfil: string[] =
        ['numero_cliente', 'nombre_completo', 'ingresos', 'egresos', 'disponible', 'capacidad', 'liquidez'];


    //5CS 
    dictamen: string = "";
    displayedColumns5CS: string[] = ['Referencia', 'Monto', 'Caracter', 'Capital', 'CPago', 'Condicion', 'Colateral', 'Resultado', 'Dictamen'];
    dataSource5CS: MatTableDataSource<any>;
    @ViewChild('paginatorEvaluacion') paginatorEvaluacion: MatPaginator;
    @ViewChild(MatSort, {static: true}) sortEvaluacion: MatSort;

    /**
     * Constructor de la clase
     * @param service - Gestion de acceso a datos
     * @param formBuilder - Gestion de formularios
     * @param servicePermisos - Permisos de acceso
     * @param dialog - Gestion de dialogos o modales
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        public dialog: MatDialog,
        private sanitizer: DomSanitizer) {

        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('');
        this.urlDocCliente = this.sanitizer.bypassSecurityTrustResourceUrl('');

        this.formCredito = this.formBuilder.group({
            credito: new UntypedFormControl({ value: '', disabled: this.readOnly }, { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            condicionPago: new UntypedFormControl(''),
            finalidad: new UntypedFormControl(''),
            montoCredito: new UntypedFormControl(''),
            //montoCredito: new FormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            tasaInteres: new UntypedFormControl({ value: '', disabled: this.readOnly }),
            tasaMoratoria: new UntypedFormControl(''),
            periodo: new UntypedFormControl({ value: '', disabled: this.readOnly }, [Validators.required]),
            noPagos: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            estadoDestino: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            destinoRecurso: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            calificacionBuro: new UntypedFormControl({ value: '', disabled: this.readOnly })
        });

    }

    /**
     * Metodo de inicio de la clase
     */
    ngOnInit() {
        this.spsGrupos();
        this.spsTipoCreditos();
        this.spsEstados();
        this.spsCalificacionBuro();
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
     * Metodo que lista grupos
     */
    spsGrupos() {
        this.blockUI.start();
        this.service.getListByID(this.servicePermisos.sucursalSeleccionada.cveSucursal + "/2", 'listaGrupos').subscribe(data => {
            this.blockUI.stop();
            this.listaGrupos = data;
            // Se setean los creditos para el autocomplete
            this.opcionesGrupo = this.grupos.valueChanges.pipe(
                startWith(''),
                map(value => this._filterGrupo(value)));
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }

    /**
    * Filtra el grupo
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterGrupo(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaGrupos.filter(option => option.nombreGrupo.toLowerCase().trim().includes(filterValue));
    }

    /**
     * Muestra la descripcion del tipo de Credito
     * @param option --tipo credito seleccionado
     * @returns -- tipo credito
     */
    displayFnGrupos(option: any): any {
        return option ? option.nombreGrupo.trim() : undefined;
    }

    /**
     * Metodo que carga o muestra la informacion del grupo
     * @param grupo - Informacion del grupo
     */
    cargarInformacion(grupo) {

        this.lblNombreGrupo = grupo.nombreGrupo;
        this.spsIntegrantesByCveGrupo(grupo.cveGrupo);
    }

    /**
     * Metodo que obtiene los integrantes por grupo
     * @param cveGrupo - Clave de Grupo a Filtrar
     */
    spsIntegrantesByCveGrupo(cveGrupo) {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(cveGrupo, 'spsGrupoClientes').subscribe(integrantes => {
            this.blockUI.stop();

            this.listaIntegrantesGrupo = integrantes;
    
            //Info general
            this.dataSourceIntegrantes = new MatTableDataSource(this.listaIntegrantesGrupo);
            setTimeout(() => this.dataSourceIntegrantes.paginator = this.paginatorIntegrantes);
            this.dataSourceIntegrantes.sort = this.sortIntegrantes;

            //Vista de credito
            this.dataSourceValores = new MatTableDataSource(this.listaIntegrantesGrupo);
            setTimeout(() => this.dataSourceValores.paginator = this.paginatorValores);
            this.dataSourceValores.sort = this.sortValores;

            //Vista Ingresos
            this.dataSourcePerfil = new MatTableDataSource(this.listaIntegrantesGrupo);
            setTimeout(() => this.dataSourcePerfil.paginator = this.paginatorPerfil);
            this.dataSourcePerfil.sort = this.sortPerfil;


        }, error => {
            // se declara la lista para mostrar la información en vacia
            this.listaIntegrantesGrupo = [];
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }


    /***
    * Metodo para remover datos de la lista de Integrante Grupo
    * @param integrante - Integrante a remover
    */
    eliminarParticipante(integrante: any) {

        const dialogIntegrantes = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: 'Omitir Integrante de Grupo',
                body: '¿Esta seguro de realizar el proceso?'
            }
        });

        //Cerrar ventana
        dialogIntegrantes.afterClosed().subscribe(result => {

            if (result === 0) {
                let index = this.listaIntegrantesGrupo.findIndex(res => res.numero_cliente === integrante.numero_cliente);
                this.listaIntegrantesGrupo.splice(index, 1);
                //Info general
                this.dataSourceIntegrantes = new MatTableDataSource(this.listaIntegrantesGrupo);
                setTimeout(() => this.dataSourceIntegrantes.paginator = this.paginatorIntegrantes);
                this.dataSourceIntegrantes.sort = this.sortIntegrantes;

                //Vista de credito
                this.dataSourceValores = new MatTableDataSource(this.listaIntegrantesGrupo);
                setTimeout(() => this.dataSourceValores.paginator = this.paginatorValores);
                this.dataSourceValores.sort = this.sortValores;

                //Vista Ingresos
                this.dataSourcePerfil = new MatTableDataSource(this.listaIntegrantesGrupo);
                setTimeout(() => this.dataSourcePerfil.paginator = this.paginatorPerfil);
                this.dataSourcePerfil.sort = this.sortPerfil;

                this.listaDocsCliente = [];
                this.urlDocCliente = this.sanitizer.bypassSecurityTrustResourceUrl('');
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

            this.blockUI.stop();

            if (data) {
                for (let credito of data) {
                    if (credito.extenciones.extCatCreCuatro.aplicaGrupos === true) {
                        this.listaCreditos.push(credito);
                    }
                }

                // Se setean los creditos para el autocomplete
                this.opcionesCredito = this.formCredito.get('credito').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCredito(value)));
            }
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
    private _filterCredito(value: any): any[] {
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
    displayFnCredito(option: any): any {
        return option ? option.descripcion.trim() : undefined;
    }

    /**
     * Carga la informacion princial del credito
     * @param credito - Informaacion del credito
     */
    cargarInformacionCredito(credito) {

        this.spsCondicionesPago(credito);
        this.spslistaFinalidades(credito);
        this.formCredito.get('tasaMoratoria').setValue(credito.tasaInteresMoratorio);
        this.spsPeriodo(credito);

        //OBTENCION DE INFOMACION PARA VALIDAR EL MONTO
        this.montoMin = credito.extenciones.extencionCatalogoCreditos.montoMinimo;
        this.montoMax = credito.extenciones.extencionCatalogoCreditos.montoMaximo;

        let tasasIntervalo = JSON.parse(credito.extenciones.extCatCreCinco.rangoInteresNormal);
        this.max = tasasIntervalo[0].tasa_final;
        this.min = tasasIntervalo[0].tasa_inicial;

        //Metodos Digitalizacion
        this.setDocADigitalizar(credito);
        this.readOnly = true;

    }

    /** Gets the total cost of all transactions. */
    getTotalIngresos() {
        return this.listaIntegrantesGrupo.map(t => t.total_ingresos).reduce((acc, value) => acc + value, 0);
    }

    /** Gets the total cost of all transactions. */
    getTotalEgresos() {
        return this.listaIntegrantesGrupo.map(t => t.total_egresos).reduce((acc, value) => acc + value, 0);
    }

    /**
    * Metodo que lista condiciones de pago
    */
    spsCondicionesPago(tCredito) {
        this.service.getListByID(generales.condicionPagoCred, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                let descripcion = data.find((result) => { if (result.generalesId === tCredito.extenciones.extencionCatalogoCreditos.condicionPagoId) { return result } });
                this.formCredito.get('condicionPago').setValue(descripcion.descripcion);
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
                this.formCredito.get('finalidad').setValue(finalidades.descripcion);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
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
    * Metodo para listar los ESTADOS
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            this.opcionesEstado = this.formCredito.get('estadoDestino').valueChanges.pipe(
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
    * Muestra la descripcion del estado
    * @param option --estado seleccionado
    * @returns --nombre del estado 
    */
    mostrarEstado(option: any): any {
        return option ? option.nombreEstado : undefined;
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
    * Metodo que lista ciudades por Estado ID fitlrado, para referencias y clientes
    */
    spsCiudadNac() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.idEstSel, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadNac = data;
            this.opcionesCiudades = this.formCredito.get('destinoRecurso').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudadNac(value))
            );
            if (this.controlCd === 1) {
                let fCiudad = this.listaCiudadNac.find(c => c.ciudaId === this.destinoID);
                this.formCredito.get('destinoRecurso').setValue(fCiudad);
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
    * Metodo para filtrar por ciudad ID las localidades
    @param event ciudad seleccionda
    */
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.seleccionCd = this.selectedIdCiudad;
    }

    showPerfil(cliente: any) {

        this.dialog.open(ModalPerfilComponent, {
            width: '100%',
            data: {
                ingresos: JSON.parse(cliente.ingresos),
                egresos: JSON.parse(cliente.egresos),
                nombre: cliente.nombre_completo
            }
        });
    }

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
            //this.validarParametrosCr();
        } else {
            this.service.showNotification('top', 'right', 3, 'El monto de crédito debe estar entre ' + this.montoMin + ' y ' + this.montoMax);
        }

    }

    /**
     * Metodo que agrega la calificacion por socio
     * @param seleccion - Fila a modificar
     * @param elemento - Valor 
     */
    selectCalificacion(seleccion: any, elemento: any) {

        let fila = this.listaIntegrantesGrupo.find(item => item.numero_cliente === elemento.numero_cliente);

        if (fila) {
            fila.idCalificacion = seleccion.value.generalesId;
        }

    }

    /**
     * Metodo que permite agregar el monto de credito por socio
     * @param elemento - Elemento a agregar Monto
     */
    agregarMonto(elemento: any) { // without type info
        let inputMonto = (<HTMLInputElement>document.getElementById('' + elemento.numero_cliente)).value;

        if (!this.vacio(inputMonto)) {

            if (parseFloat(inputMonto) >= this.montoMin && parseFloat(inputMonto) <= this.montoMax) {
                this.service.showNotification('top', 'right', 2,
                    'Se agrego el Monto: ' + inputMonto + ' al Cliente: ' + elemento.numero_cliente);
                let fila = this.listaIntegrantesGrupo.find(item => item.numero_cliente === elemento.numero_cliente);

                if (fila) {
                    fila.monto = Number(inputMonto);
                }
            } else {
                this.service.showNotification('top', 'right', 3, 'El monto de crédito debe estar entre ' + this.montoMin + ' y ' + this.montoMax);
            }
        } else {
            this.service.showNotification('top', 'right', 3,
                'Monto vacio para el Cliente: ' + elemento.numero_cliente);
        }

    }

    /**
    * Metodo que setea una lista para subir documentos por credito
    * @param credito - credito con los documentos que se pueden digitalizar
    */
    setDocADigitalizar(credito) {
        if (!this.vacio(credito.extenciones.extencionCatalogoCreditosTres.documentos)) {
            let listaDocs = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.documentos);
            this.listaDocsGrupo = []; // 80GC
            this.listaDocs = []; //80CS
            if (listaDocs.length > 0) {
                for (let doc of listaDocs) {
                    if (doc.cve_expediente === generales.expClientes) {
                        this.listaDocs.push(doc);
                        this.listaDocs.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);



                        for (let fila of this.listaIntegrantesGrupo) {
                            fila.docs = this.listaDocs;
                        }

                        /*  for (let cli of this.listaIntegrantesGrupo) {
                             for (let docc of this.listaDocsClientes) {
                                 docc.numero_cliente = cli.numero_cliente;
                             }
                         }*/

                    }
                    if (doc.cve_expediente === generales.expGrupo) {
                        this.listaDocsGrupo.push(doc);
                        this.listaDocsGrupo.sort((a, b) => (a.descripcion > b.descripcion) ? 1 : -1);
                    }
                }
            }
        }
    }


    setDocsCliente(cliente: any) {


        this.listaDocsCliente = [];
        this.urlDocCliente = this.sanitizer.bypassSecurityTrustResourceUrl('');

        let listaD = [];

        for (let doc of cliente.docs) {

            listaD.push({
                "documentocredito_id": doc.documentocredito_id,
                "tipodocumento_id": doc.tipodocumento_id,
                "credito_id": doc.credito_id,
                "expediente_id": doc.expediente_id,
                "expediente": doc.expediente,
                "cve_expediente": doc.cve_expediente,
                "descripcion": doc.descripcion,
                "limiteMB": doc.limiteMB,
                "formatos": doc.formatos,
                "numero_cliente": cliente.numero_cliente,
                "doc": doc?.doc
            });

        }

        cliente.docs = listaD;
        this.listaDocsCliente = listaD;

    }

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


        this.extraerBase64(archivoCapturado).then((imagen: any) => {

            let previsualizacion = imagen.base;
            this.urlDocCliente = this.sanitizer.bypassSecurityTrustResourceUrl(previsualizacion);

            let findDoc = this.listaDocsCliente.find(doc => doc.documentocredito_id === documento.documentocredito_id && doc.numero_cliente === documento.numero_cliente);

            if (findDoc) {
                findDoc.doc = previsualizacion;
            }

            let findCliente = this.listaIntegrantesGrupo.find(cli => cli.numero_cliente === documento.numero_cliente);

            if (findCliente) {
                findCliente.docs = this.listaDocsCliente;
            }

        });


    }

    verDocCliente(documento: any) {
        this.urlDocCliente = this.sanitizer.bypassSecurityTrustResourceUrl(documento.doc);
    }

    /**
    * Metodo para subir archivo 
    * @param archivo - Documento a codificar 
    * @param documento - Documento a setear en la lista
    */
    subirArchivoGrupo(archivo, documento) {

        let limite = documento.limiteMB;


        let archivoCapturado = archivo.target.files[0];

        if ((archivo.target.files[0].size * 0.000001) > limite) {
            return this.service.showNotification('top', 'right', 3, 'El limite maximo es ' + limite + ' MB');
        }

        let index = this.listaDocsGrupoDgt.findIndex(x => x[1] === documento.tipodocumento_id);

        if (index >= 0) {

            this.listaDocsGrupoDgt.splice(index, 1);

        }


        this.extraerBase64(archivoCapturado).then((imagen: any) => {

            let previsualizacion = imagen.base;
            this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(previsualizacion);
            this.listaDocsGrupoDgt.push([
                previsualizacion,
                documento.tipodocumento_id,
                documento.descripcion
            ]);
            this.listaDocsGrupoDgt.sort((a, b) => (a[2] > b[2]) ? 1 : -1);

        });
    }

    /**
     * Metodo para ver documentos
     * @param documento 
     */
    verDocumento(documento: any) {
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(documento[0]);
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

    //validacion de campos 
    validaciones = {
        'credito': [
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
        'estadoDestino': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El estado no existe.' }],
        'calificacionBuro': [{ type: 'required', message: 'Calificación buro requerida.' }],
        'destinoRecurso': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La ciudad no existe.' }]
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
    * Metodo que valida si va vacio.
    * @param value 
    * @returns 
    */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }


    /**
    * Metodo que lista a evaluacion cinco de creditos
    * @param cliente - Cliente a buscar
    */
    spsEvaluacionCinco(cliente) {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(cliente.numero_cliente, 'spsEvaluacionCinco').subscribe(data => {
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
                setTimeout(() =>this.dataSource5CS.paginator = this.paginatorEvaluacion);
                this.dataSource5CS.sort = this.sortEvaluacion;
            }



            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }



    /**
 * Metodo para buscar un cliente
 *  persona_juridica_id
 
 
 
     buscarCliente() {
        let path: any;
       path = this.filtro.value + ' /' + this.personalidad.value.cveGeneral+ '/' + 1;
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(path, 'listaClientes').subscribe(data => {
            this.dataSourceCliente = new MatTableDataSource(data);
            this.dataSourceCliente.paginator = this.paginator;
            this.dataSourceCliente.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
 
 */


}