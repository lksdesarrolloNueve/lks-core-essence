import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GestionGenericaService } from '../../shared/service/gestion';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, merge, OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'clientes',
    moduleId: module.id,
    templateUrl: 'clientes.component.html'
})

export class ClientesComponent implements OnInit {

    active = 1;
    activePerfil = 1;
    model: NgbDateStruct;
    showDomicilios = false;
    tieneEmpleo = false;

    //Declaracion de Listas
    listEstados: any[];
    listGenero: any[];
    listPaises: any[];
    listCiudadCli: any[];

    listCiudadEmp: any[];
    listColEmp: any[];

    listNacionalidad: any[];
    listTipoVialidad: any[];
    listArraigo: any[];
    listEstadoCivil: any[];
    listRegimen: any[];
    listNivelAcademico: any[];
    listTipoVivienda: any[];
    listFrecuencia: any[];
    listMedio: any[];
    listFinalidad: any[];
    listTipoReferencias: any[];
    listCiudadDom: any[];
    listColDom: any[];
    listAddDom: any[];
    listTipoCliente: any[];
    listaEmpresas: any[];
    listOcupaciones: any[];

    //Listas Egresos e Ingresos
    listTiposIngresos: any[];
    listTiposEgresos: any[];
    formIngresos: UntypedFormGroup;
    formEgresos: UntypedFormGroup;


    listAddIngreso: any[];
    listAddEgreso: any[];
    listAddEmpleo: any[];




    //Declaracion de Formularios y FomsControl
    clienteForm: UntypedFormGroup;
    domicilioCliente: UntypedFormGroup;
    perfilForm: UntypedFormGroup;


    formEmpresa: UntypedFormGroup;
    formEmpleo : UntypedFormGroup;

    inputEstados = new UntypedFormControl();
    ciudadDom = new UntypedFormControl();
    coloniaDom = new UntypedFormControl();
    trabaja = new UntypedFormControl();


    timeEntrada = {hour: 13, minute: 30};
    timeSalida = {hour: 13, minute: 30};
    HEntrada = true;
    HSalida = true;
  




    //Instancia Estados
    @ViewChild('instance', { static: true }) instance: NgbTypeahead;
    focus$ = new Subject<string>();
    click$ = new Subject<string>();

    //Instancia Paises
    @ViewChild('instancePaises', { static: true }) instancePaises: NgbTypeahead;
    focusPaisesCli$ = new Subject<string>();
    clickPaisesCli$ = new Subject<string>();

    //Instancia NAcionalidad
    @ViewChild('instanceNacionalidadCli', { static: true }) instanceNacionalidadCli: NgbTypeahead;
    focusNacionalidadCli$ = new Subject<string>();
    clickNacionalidadCli$ = new Subject<string>();

    //Instancia NAcionalidad
    @ViewChild('instanceEstadosCli', { static: true }) instanceEstadosCli: NgbTypeahead;
    focusEstadosCli$ = new Subject<string>();
    clickEstadosCli$ = new Subject<string>();

    //Instancia Ciudad Cli
    @ViewChild('instanceCiudadCli', { static: true }) instanceCiudadCli: NgbTypeahead;
    focusCiudadCli$ = new Subject<string>();
    clickCiudadCli$ = new Subject<string>();

    //Combos Empresas
    @ViewChild('instanceEstadosEmp', { static: true }) instanceEstadosEmp: NgbTypeahead;
    focusEstadosEmp$ = new Subject<string>();
    clickEstadosEmp$ = new Subject<string>();

    @ViewChild('instanceCiudadEmp', { static: true }) instanceCiudadEmp: NgbTypeahead;
    focusCiudadEmp$ = new Subject<string>();
    clickCiudadEmp$ = new Subject<string>();

    @ViewChild('instanceColEmp', { static: true }) instanceColEmp: NgbTypeahead;
    focusColEmp$ = new Subject<string>();
    clickColEmp$ = new Subject<string>();

    //Fin Combos Empresas


    //Instancia Ciudad Cli
    @ViewChild('instanceVialidad', { static: true }) instanceVialidad: NgbTypeahead;
    focusVialidad$ = new Subject<string>();
    clickVialidad$ = new Subject<string>();

    //Instancia Vialdiad Empleo
    @ViewChild('instanceVialidadEmp', { static: true }) instanceVialidadEmp: NgbTypeahead;
    focusVialidadEmp$ = new Subject<string>();
    clickVialidadEmp$ = new Subject<string>();

    //Vialidad domicilio Referencia
    @ViewChild('instanceVialidadRef', { static: true }) instanceVialidadRef: NgbTypeahead;
    focusVialidadRef$ = new Subject<string>();
    clickVialidadRef$ = new Subject<string>();


    //Vialidad ciudad dom
    @ViewChild('instanceCityDom', { static: true }) instanceCityDom: NgbTypeahead;
    focusCityDom$ = new Subject<string>();
    clickCityDom$ = new Subject<string>();

    //Vialidad ciudad dom
    @ViewChild('instanceColDom', { static: true }) instanceColDom: NgbTypeahead;
    focusColDom$ = new Subject<string>();
    clickColDom$ = new Subject<string>();

    //Buscador Empresas
    @ViewChild('instanceEmpresa', { static: true }) instanceEmpresa: NgbTypeahead;
    focusEmpresa$ = new Subject<string>();
    clickEmpresa$ = new Subject<string>();

     //Buscador Ocupaciones
     @ViewChild('instanceOcupacion', { static: true }) instanceOcupacion: NgbTypeahead;
     focusOcupacion$ = new Subject<string>();
     clickOcupacion$ = new Subject<string>();

    constructor(private gestionService: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        private modalService: NgbModal) {
        this.listAddDom = [];
        this.listAddIngreso = [];
        this.listAddEgreso = [];
        this.listAddEmpleo= [];
        this.clienteForm = this.formBuilder.group({
            dateIngreso: new UntypedFormControl('', [Validators.required]),
            nombrecliente: new UntypedFormControl('', [Validators.required]),
            apaternocliente: new UntypedFormControl('', [Validators.required]),
            amaternocliente: new UntypedFormControl('', [Validators.required]),
            dateNacimiento: new UntypedFormControl('', [Validators.required]),
            generoCli: new UntypedFormControl('', [Validators.required]),
            paisNacimiento: new UntypedFormControl('', [Validators.required]),
            nacionalidadNacimiento: new UntypedFormControl('', [Validators.required]),
            edoNacimiento: new UntypedFormControl('', [Validators.required]),
            cidNacimiento: new UntypedFormControl('', [Validators.required]),
            curpCli: new UntypedFormControl('', [Validators.required]),
            rfcCli: new UntypedFormControl('', [Validators.required]),
            tipoCli: new UntypedFormControl('', [Validators.required]),
            celularCli: new UntypedFormControl('', [Validators.required])
        });

        this.domicilioCliente = this.formBuilder.group({
            edoDom: new UntypedFormControl('', [Validators.required]),
            viaDom: new UntypedFormControl('', [Validators.required]),
            nombreVialidadDom: new UntypedFormControl('', [Validators.required]),
            noIntDom: new UntypedFormControl(''),
            noExtDom: new UntypedFormControl('', [Validators.required]),
            arraigoDom: new UntypedFormControl('', [Validators.required]),
            entreCalleDom: new UntypedFormControl('', [Validators.required]),
            yCalleDom: new UntypedFormControl('', [Validators.required]),
            referenciaDom: new UntypedFormControl('', [Validators.required])
        });

        this.perfilForm = this.formBuilder.group({
            propietario: new UntypedFormControl('', [Validators.required]),
            edoCivil: new UntypedFormControl('', [Validators.required]),
            regimen: new UntypedFormControl('', [Validators.required]),
            nivelAcademico: new UntypedFormControl('', [Validators.required]),
            tipoVivienda: new UntypedFormControl('', [Validators.required]),
            periocidadIngresos: new UntypedFormControl('', [Validators.required]),
            periocidadMovimientos: new UntypedFormControl('', [Validators.required]),
            mxmes: new UntypedFormControl('', [Validators.required]),
            montoaproximadoahorro: new UntypedFormControl('', [Validators.required]),
            montoaproximadoretiro: new UntypedFormControl('', [Validators.required]),
            ndependientes: new UntypedFormControl('', [Validators.required]),
            comprobacion: new UntypedFormControl('', [Validators.required]),
            propositoCuenta: new UntypedFormControl('', [Validators.required]),
            medio: new UntypedFormControl('', [Validators.required]),


        });

        this.formIngresos = this.formBuilder.group({
            ingresoCtr: new UntypedFormControl('', [Validators.required]),
            montoIngreso: new UntypedFormControl('', [Validators.required])
        });

        this.formEgresos = this.formBuilder.group({
            egresoCtr: new UntypedFormControl('', [Validators.required]),
            montoEgreso: new UntypedFormControl('', [Validators.required])
        });


        this.formEmpresa = this.formBuilder.group({
            razon: new UntypedFormControl('', [Validators.required]),
            ncomercial: new UntypedFormControl('', [Validators.required]),
            rfc: new UntypedFormControl('', [Validators.required]),
            patron: new UntypedFormControl('', [Validators.required]),
            edoEmp: new UntypedFormControl('', [Validators.required]),
            ciudadid: new UntypedFormControl('', [Validators.required]),
            coloniaid: new UntypedFormControl('', [Validators.required]),
            viaEmp: new UntypedFormControl('', [Validators.required]),
            nombreVialidadDom: new UntypedFormControl('', [Validators.required]),
            noIntDom: new UntypedFormControl(''),
            noExtDom: new UntypedFormControl('', [Validators.required]),
            arraigoDom: new UntypedFormControl('', [Validators.required]),
            entreCalle1: new UntypedFormControl('', [Validators.required]),
            entreCalle2: new UntypedFormControl('', [Validators.required]),
            referencia: new UntypedFormControl('', [Validators.required]),
            telefono: new UntypedFormControl('')
        });

        this.formEmpleo  = this.formBuilder.group({
            empresa: new UntypedFormControl('', [Validators.required]),
            ocupacion: new UntypedFormControl('', [Validators.required]),
            fechaInicio : new UntypedFormControl('', [Validators.required]),
            hEntrada: new UntypedFormControl(''),
            hSalida: new UntypedFormControl(''),
            observaciones:new UntypedFormControl('')
        });

    }

    ngOnInit() {

        this.loadCatalogos();

    }

    open(content) {
        this.modalService.open(content, { size: 'lg' }).result.then((result) => {
            // this.closeResult = `Closed with: ${result}`;
            console.log('guardar')
        }, (reason) => {
            console.log('cerrar')
            //  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }

    siguiente() {
        this.active = this.active + 1;
    }

    anterior() {
        this.active = this.active - 1;
    }

    loadCatalogos() {
        this.loadCatalogoNacionalidades();
        this.loadCatalogoEstados();
        this.loadCatalogoPaises();
        this.loadCatalogoGenero();
        this.loadCatalogoTipoVialidad();
        this.loadTiempoArraigo();
        this.loadCatalogoEstadoCivil();
        this.loadCatalogoRegimen();
        this.loadCatalogoNivelAcademico();
        this.loadCatalogoTipoVivienda();
        this.loadCatalogoFrecuencia();
        this.loadMedio();
        this.loadFinalidad();
        this.loadTipoReferencias();
        this.loadTiposIngresos();
        this.loadTiposEgresos();
        this.loadTipoCliente();
        this.loadListaAllEmpresas();
        this.loadListaAllOcupaciones();
    }

    toggleHEntrada() {
        this.HEntrada = !this.HEntrada;
    }

    toggleHSalida() {
        this.HSalida = !this.HSalida;
    }

    loadCatalogoGenero() {
        this.gestionService.getListByID(1, 'spscatgenerales').subscribe(
            response => {
                this.listGenero = response;
            }, error => {
                console.log(error);

            });
    }


    loadCatalogoEstadoCivil() {
        this.gestionService.getListByID(2, 'spscatgenerales').subscribe(
            response => {
                this.listEstadoCivil = response;
            }, error => {
                console.log(error);

            });
    }

    loadCatalogoTipoVivienda() {
        this.gestionService.getListByID(3, 'spscatgenerales').subscribe(
            response => {
                this.listTipoVivienda = response;
            }, error => {
                console.log(error);

            });
    }

    loadCatalogoFrecuencia() {
        this.gestionService.getListByID(4, 'spscatgenerales').subscribe(
            response => {
                this.listFrecuencia = response;
            }, error => {
                console.log(error);

            });
    }

    loadCatalogoRegimen() {
        this.gestionService.getListByID(5, 'spscatgenerales').subscribe(
            response => {
                this.listRegimen = response;
            }, error => {
                console.log(error);

            });
    }


    loadFinalidad() {
        this.gestionService.getListByID(6, 'spscatgenerales').subscribe(
            response => {
                this.listFinalidad = response;
            }, error => {
                console.log(error);

            });
    }

    loadCatalogoNivelAcademico() {
        this.gestionService.getListByID(7, 'spscatgenerales').subscribe(
            response => {
                this.listNivelAcademico = response;
            }, error => {
                console.log(error);

            });
    }

    loadTipoReferencias() {
        this.gestionService.getListByID(8, 'spscatgenerales').subscribe(
            response => {
                this.listTipoReferencias = response;
            }, error => {
                console.log(error);

            });

    }

    loadCatalogoTipoVialidad() {
        this.gestionService.getListByID(9, 'spscatgenerales').subscribe(
            response => {
                this.listTipoVialidad = response;
            }, error => {
                console.log(error);

            });
    }

    loadTiempoArraigo() {
        this.gestionService.getListByID(10, 'spscatgenerales').subscribe(
            response => {
                this.listArraigo = response;
            }, error => {
                console.log(error);

            });
    }

    loadMedio() {
        this.gestionService.getListByID(11, 'spscatgenerales').subscribe(
            response => {
                this.listMedio = response;
            }, error => {
                console.log(error);

            });
    }


    loadTiposIngresos() {
        this.gestionService.getListByID(12, 'spscatgenerales').subscribe(
            response => {
                this.listTiposIngresos = response;
            }, error => {
                console.log(error);

            });
    }

    loadTiposEgresos() {
        this.gestionService.getListByID(13, 'spscatgenerales').subscribe(
            response => {
                this.listTiposEgresos = response;
            }, error => {
                console.log(error);

            });
    }


    loadCatalogoPaises() {
        this.gestionService.getListByID(3, 'catalogoDomicilio').subscribe(
            response => {
                this.listPaises = response;
            }, error => {
                console.log(error);

            });
    }

    loadCatalogoEstados() {
        this.gestionService.getListByID(2, 'catalogoDomicilio').subscribe(
            response => {

                console.log('estados');
                console.log(response);
                console.log('fin estados');


                this.listEstados = response;


            }, error => {
                console.log(error);

            });
    }

    loadCatalogoNacionalidades() {
        this.gestionService.getListByID(1, 'catalogoDomicilio').subscribe(
            response => {

                this.listNacionalidad = response;

            }, error => {
                console.log(error);

            });
    }

    loadCatalogoCiudades(idEstado: number) {
        const ids = 1 + '/' + idEstado;
        this.gestionService.getListByArregloIDs(ids, 'catalogoDomicilioID').subscribe(
            response => {

                console.log(response);


            }, error => {
                console.log(error);

            });

    }

    loadCatalogoColonias(item) {
        const ids = 2 + '/' + item.item.id;
        this.gestionService.getListByArregloIDs(ids, 'catalogoDomicilioID').subscribe(
            response => {

                this.listColDom = response;


            }, error => {
                console.log(error);

            });

    }


    loadCatalogoColoniasEmp(item) {
        const ids = 2 + '/' + item.item.id;
        this.gestionService.getListByArregloIDs(ids, 'catalogoDomicilioID').subscribe(
            response => {

                this.listColEmp = response;


            }, error => {
                console.log(error);

            });

    }




    search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.click$.pipe(filter(() =>
            this.instance && !this.instance.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focus$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listEstados
                : this.listEstados.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatter = (x: { descripcion: string }) => x.descripcion;


    searchPaisesCli: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickPaisesCli$.pipe(filter(() =>
            this.instancePaises && !this.instancePaises.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusPaisesCli$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listPaises
                : this.listPaises.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterPaisesCli = (x: { descripcion: string }) => x.descripcion;


    searchNacionalidadCli: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickNacionalidadCli$.pipe(filter(() =>
            this.instanceNacionalidadCli && !this.instanceNacionalidadCli.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusNacionalidadCli$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listNacionalidad
                : this.listNacionalidad.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterNacionalidadCli = (x: { descripcion: string }) => x.descripcion;

    searchEstadosCli: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickEstadosCli$.pipe(filter(() =>
            this.instanceEstadosCli && !this.instanceEstadosCli.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusEstadosCli$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listEstados
                : this.listEstados.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterEstadosCli = (x: { descripcion: string }) => x.descripcion;



    loadCiudadNacimiento(item) {
        const ids = 1 + '/' + item.item.id;
        this.gestionService.getListByArregloIDs(ids, 'catalogoDomicilioID').subscribe(
            response => {

                this.listCiudadCli = response;


            }, error => {
                console.log(error);

            });
    }

    searchEstadosEmp: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickEstadosEmp$.pipe(filter(() =>
            this.instanceEstadosEmp && !this.instanceEstadosEmp.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusEstadosEmp$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listEstados
                : this.listEstados.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterEstadosEmp = (x: { descripcion: string }) => x.descripcion;

    loadCiudadEmp(item) {
        const ids = 1 + '/' + item.item.id;
        this.gestionService.getListByArregloIDs(ids, 'catalogoDomicilioID').subscribe(
            response => {

                this.listCiudadEmp = response;


            }, error => {
                console.log(error);

            });

    }


    loadCiudadDom(item) {

        const ids = 1 + '/' + item.item.id;
        this.gestionService.getListByArregloIDs(ids, 'catalogoDomicilioID').subscribe(
            response => {

                this.listCiudadDom = response;

            }, error => {
                console.log(error);

            });

    }

    searchCiudadCli: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickCiudadCli$.pipe(filter(() =>
            this.instanceCiudadCli && !this.instanceCiudadCli.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusCiudadCli$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listCiudadCli
                : this.listCiudadCli.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterCiudadCli = (x: { descripcion: string }) => x.descripcion;


    searchCiudadEmp: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickCiudadEmp$.pipe(filter(() =>
            this.instanceCiudadEmp && !this.instanceCiudadEmp.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusCiudadEmp$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listCiudadEmp
                : this.listCiudadEmp.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterCiudadEmp = (x: { descripcion: string }) => x.descripcion;

    searchVialidad: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickVialidad$.pipe(filter(() =>
            this.instanceVialidad && !this.instanceVialidad.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusVialidad$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listTipoVialidad
                : this.listTipoVialidad.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterVialidad = (x: { descripcion: string }) => x.descripcion;

    searchVialidadEmp: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickVialidadEmp$.pipe(filter(() =>
            this.instanceVialidadEmp && !this.instanceVialidadEmp.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusVialidadEmp$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listTipoVialidad
                : this.listTipoVialidad.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterVialidadEmp = (x: { descripcion: string }) => x.descripcion;


    searchVialidadRef: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickVialidadRef$.pipe(filter(() =>
            this.instanceVialidadRef && !this.instanceVialidadRef.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusVialidadRef$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listTipoVialidad
                : this.listTipoVialidad.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterVialidadRef = (x: { descripcion: string }) => x.descripcion;

    searchCityDom: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickCityDom$.pipe(filter(() =>
            this.instanceCityDom && !this.instanceCityDom.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusCityDom$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listCiudadDom
                : this.listCiudadDom.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterCityDom = (x: { descripcion: string }) => x.descripcion;


    searchColDom: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickColDom$.pipe(filter(() =>
            this.instanceColDom && !this.instanceColDom.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusColDom$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listColDom
                : this.listColDom.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterColDom = (x: { descripcion: string }) => x.descripcion;


    searchColEmp: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickColEmp$.pipe(filter(() =>
            this.instanceColEmp && !this.instanceColEmp.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusColEmp$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listColEmp
                : this.listColEmp.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterColEmp = (x: { descripcion: string }) => x.descripcion;

    validaCliente() {



        if (this.clienteForm.invalid) {
            this.validateAllFormFields(this.clienteForm);
            this.gestionService.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }
    }

    validaDomicilioCliente() {
        this.showDomicilios = true;

        if (this.domicilioCliente.invalid) {
            this.validateAllFormFields(this.domicilioCliente);
            this.gestionService.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }

        console.log(this.domicilioCliente.get("edoDom")?.value.descripcion);



        const listAll = this.listAddDom.push({
            "estado": this.domicilioCliente.get("edoDom")?.value,
            "ciudad": this.ciudadDom.value, "colonia": this.coloniaDom.value,
            "tipovialidad": this.domicilioCliente.get("viaDom")?.value,
            "nombreVialidad": this.domicilioCliente.get("nombreVialidadDom")?.value,
            "ninterior": this.domicilioCliente.get("noIntDom")?.value,
            "nexterior": this.domicilioCliente.get("noExtDom")?.value,
            "arraigo": this.domicilioCliente.get("arraigoDom")?.value,
            "entrecalle1": this.domicilioCliente.get("entreCalleDom")?.value,
            "entrecalle2": this.domicilioCliente.get("yCalleDom")?.value,
            "referencia": this.domicilioCliente.get("referenciaDom")?.value
        }
        );

        console.log(this.listAddDom);

    }


    validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);             //{3}
            if (control instanceof UntypedFormControl) {             //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
            }
        });
    }

    quitarDomicilio(index) {
        this.listAddDom.splice(index, 1);
    }

    validaPerfil() {
        if (this.perfilForm.invalid) {
            this.validateAllFormFields(this.perfilForm);
            this.gestionService.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }
    }

    activaComponentesEmpleo(item) {

        if (item === '1') {
            this.tieneEmpleo = true;
        } else {
            this.tieneEmpleo = false;
        }


    }


    addListIngreso() {

        let v_montoIngreso = this.formIngresos.get("montoIngreso")?.value;
        let v_elemento =this.formIngresos.get("ingresoCtr")?.value;

        this.listAddIngreso.push({
            "id":v_elemento,
            "descripcion": 'test',
            "monto": v_montoIngreso
        });


    }

    quitarIngreso(index) {
        this.listAddIngreso.splice(index, 1);
    }

    addListEgreso() {

        let v_montoEgreso = this.formEgresos.get("montoEgreso")?.value;
        let v_elemento = this.listTiposEgresos.find(element => element.id === parseInt(this.formEgresos.get("egresoCtr")?.value));

        this.listAddEgreso.push({
            "id": v_elemento.id,
            "descripcion": v_elemento.descripcion,
            "monto": v_montoEgreso
        });
    }

    quitarEgreso(index) {
        this.listAddEgreso.splice(index, 1);
    }

    loadTipoCliente() {
        this.gestionService.getList('catalogoTipoCliente').subscribe(
            response => {
                this.listTipoCliente = response;
            }, error => {
                console.log(error);

            });
    }

    guardarEmpresa() {

        

        if (this.formEmpresa.invalid) {
            this.gestionService.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }

      

      const data = {
            "empresaid": 0,
            "razonSocial": this.formEmpresa.get("razon")?.value,
            "rfc": this.formEmpresa.get("rfc")?.value,
            "nombreComercial": this.formEmpresa.get("ncomercial")?.value,
            "nombrePatron": this.formEmpresa.get("patron")?.value,
            "domicilio": {
                "domicilioid": 0,
                "calle": this.formEmpresa.get("nombreVialidadDom")?.value,
                "nexterior":this.formEmpresa.get("noExtDom")?.value,
                "ninterior":this.formEmpresa.get("noIntDom")?.value,
                "telefono": this.formEmpresa.get("telefono")?.value,
                "entreCalleUno": this.formEmpresa.get("entreCalle1")?.value,
                "entreCalleDos": this.formEmpresa.get("entreCalle2")?.value,
                "referencia": this.formEmpresa.get("referencia")?.value,
                "numerodomicilio": 1,
                "datosadinicionales": {
                    "tiempoarraigo": { "id": this.formEmpresa.get("arraigoDom")?.value, "descripcion": "" },
                    "tipovialida": { "id": this.formEmpresa.get("viaEmp")?.value.id, "descripcion": "" },
                    "colonia": { "id": this.formEmpresa.get("coloniaid")?.value.id, "descripcion": "" },
                    "ciudad": { "id": this.formEmpresa.get("ciudadid")?.value.id, "descripcion": "" },
                    "nacionalidad": { "id": 60, "descripcion": "" }
                }
            }
        }

        this.gestionService.registrar(data, "altaEmpresa").subscribe(
            response => {
              
               this.gestionService.showNotification('top', 'right', 2, response[0][1]);
               this. loadListaAllEmpresas();
               this.modalService.dismissAll();

            }, error => {
                this.gestionService.showNotification('top', 'right', 4,error);

            });


    }

    loadListaAllEmpresas() {
        this.listaEmpresas = [];
        this.gestionService.getList('listEmpresas').subscribe(
            response => {
                this.listaEmpresas = response;
            }, error => {
                console.log(error);

            });
    }

    searchEmpresa: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickEmpresa$.pipe(filter(() =>
            this.instanceEmpresa && !this.instanceEmpresa.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusEmpresa$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listaEmpresas
                : this.listaEmpresas.filter(v => v.razonSocial.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterEmpresa = (x: { razonSocial: string }) => x.razonSocial;


    loadListaAllOcupaciones() {
        this.gestionService.getList('ocupaciones').subscribe(
            response => {
                this.listOcupaciones = response;
            }, error => {
                console.log(error);

            });
    }

    searchOcupacion: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) => {
        const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
        const clicksWithClosedPopup$ = this.clickOcupacion$.pipe(filter(() =>
            this.instanceOcupacion && !this.instanceOcupacion.isPopupOpen())); //<---HERE
        const inputFocus$ = this.focusOcupacion$;

        return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
            map(term => (term === '' ? this.listOcupaciones
                : this.listOcupaciones.filter(v => v.descripcion.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
        );

    }

    formatterOcupacion = (x: { descripcion: string }) => x.descripcion;



    agregarEmpleo(){

        if (this.formEmpleo.invalid) {
            this.gestionService.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }

        
       
        this.listAddEmpleo.push({
            "empresaid" : this.formEmpleo.get("empresa")?.value.empresaid,
            "razonSocial" : this.formEmpleo.get("empresa")?.value.razonSocial,
            "fechaInicio" : this.formEmpleo.get("fechaInicio")?.value.day+'/'+this.formEmpleo.get("fechaInicio")?.value.month+'/'+this.formEmpleo.get("fechaInicio")?.value.year,
            "HEntrada": this.formEmpleo.get("hEntrada")?.value.hour+':'+this.formEmpleo.get("hEntrada")?.value.minute+':00',
            "HSalida": this.formEmpleo.get("hSalida")?.value.hour+':'+this.formEmpleo.get("hSalida")?.value.minute+':00',
            "observaciones" : this.formEmpleo.get("observaciones")?.value
        });

        console.log(this.listAddEmpleo);

        this.formEmpleo.reset();

    }


    quitarEmpleo(index){
        this.listAddEmpleo.splice(index, 1);
    }


}