import { ElementRef, Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { MatSelect } from "@angular/material/select";
import { MatSelectionListChange } from "@angular/material/list";
import { verificacionModalComponent } from '../../../pages/modales/verificacion-modal/verificacion-modal.component';
import FuzzySearch from 'fuzzy-search';
import { environment } from '../../../../environments/environment';
import { globales } from "../../../../environments/globales.config";
import { MatTableDataSource } from "@angular/material/table";
import { categorias } from "../../../../environments/categorias.config";
import { generales } from "../../../../environments/generales.config";


@Component({
    selector: 'creditos',
    moduleId: module.id,
    templateUrl: 'creditos.component.html'
})

/**
 * @autor:Luis Rolando Guerrero Calzada
 * version: 1.0.
 * @fecha: 18/10/2021
 * @description: componente para la gestion del creditos
 * 
 */

export class CreditosComponent implements OnInit {


    //Inicio Autocomplete Componentes Cuentas Bancarias
    listaCuentaBancaria: any[];
    filteredCuentasBancarias: Observable<string[]>;
    //autocomplete para movs Caja 
    listaMovCuentaCaja: any;
    filteredMovCaja: Observable<string[]>;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    //Declaracion de variables y controles
    listaCreditos = []
    listaTDocumentos = []
    listaActivos = []
    listaPasivos = []
    listaResultado = []
    listaOrden = []
    listaExpedientes = []

    listaCuentasContablesActivo = []
    listaCuentasContablesPasivo = []
    listaCuentasContablesResultado = []
    listaCuentasContablesOrden = []

    listaActivosSeleccionados = []
    listaGarantiasSeleccionados = []
    listaDocumentosSeleccionados = []
    listaPasivosSeleccionados = []
    listaResultadoSeleccionados = []
    listaOrdenSeleccionados = []
    creditoID: number
    editar = false

    consultaSicAplicaB = false
    solicitudSobreprestamoAplicaB = false
    edadPermitidaAplicaB = false
    aplicaUdis = false
    mora = false

    listaCuentasCamposIntermedia = []
    listaGarantiasIntermedia = []
    listaFrecuenciasIntermedia = []
    listaDocumentosIntermedia = []
    listaSucursalesIntermedia = []

    //Nuevas Listas
    listaGeneros = [];
    listaMonedas = [];
    listaFondos = [];
    listaTiposCalculo = [];
    listaComisiones = [];
    listaCuentasComisiones = [];
    listaComisionesAgregadas = [];

    showPPrueba = false;

    opcionesFondos: Observable<string[]>;
    opcionesCuentas: Observable<string[]>;

    rangoPrueba: UntypedFormGroup;
    formComisiones: UntypedFormGroup;


    //finalidad
    listaFinalidades = []

    //mercado
    listaMercado = []
    mercadoControl = new UntypedFormControl('', [Validators.required]);

    //calculo
    listaCalculo = []
    tCalculoContol = new UntypedFormControl('', [Validators.required]);

    //amortizaciones
    listaAmortizaciones = []
    tAmortizacionControl = new UntypedFormControl('', [Validators.required]);

    //condicion pago
    listaCondicionPago = []
    condicionPagoControl = new UntypedFormControl('', [Validators.required]);

    //Garantias
    listaGarantias = []
    listaAplica = []
    listaLimpiaGarantias: any[] = [];

    nombreCredito = ""

    /**
     * Filtros
     */
    searcher: any;
    public searchText: string;
    public result: [];


    //Frecuencias
    listaFrecuencia = []
    listaLimpiaFrecuencia: any[] = [];
    @ViewChild('frecuenciaInput') frecuenciaInput: ElementRef<HTMLInputElement>;
    //Variables Chips frecuencia pagos
    frecuenciapagos = new UntypedFormControl();
    sucursales = new UntypedFormControl();
    removableF = true;
    selectableF = true;

    separatorKeysCodesF: number[] = [ENTER, COMMA];
    filteredFrecuenciasP: Observable<string[]>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    formCreditos: UntypedFormGroup;

    listaSucursales = []
    allSelected = false
    @ViewChild('mySel') skillSel: MatSelect;

    //Eric Cambios a Cuentas Bancarias por Sucursales
    listaSucursalesBancos = [];

    displayedColumns: string[] = ['sucursal', 'cuenta', 'seleccionada'];
    dataSourceCuentas: MatTableDataSource<any>;

    //DECLARACIÓN DE PAGITANOR
    @ViewChild('paginatorCuentas') paginatorCuentas: MatPaginator;
    @ViewChild(MatSort) sortCuentas: MatSort

    //Adecuaciones Eric
    formExpediente: UntypedFormGroup;


    /**
     * Validaciones 
     */

    validacionesPeriodoPruebas = {
        'start': [
            { type: 'matStartDateInvalid', message: 'Fecha incio erronea.' },
            { type: 'required', message: 'Fecha inicial requerida.' }
        ],
        'end': [
            { type: 'matEndDateInvalid', message: 'Fecha final erronea.' },
            { type: 'required', message: 'Fecha final requerida.' }
        ]
    };

    validacionesComisiones = {
        'cuenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otro.' }
        ],
        'tipoComision': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'tipoCalculo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'valor': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ]
    };


    validaciones = {
        'cveCredito': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 4.' },
        ],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 254.' },
        ],
        'tasaInteresMoratorio': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'finalidadId': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'mercadoId': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'calculoInteresID': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'tipoAmortizacionId': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'condicionPagoId': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'plazoMaximo': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'plazoMinimo': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'montoMaximo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'montoMinimo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'calificacionCredito': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'consultaSicNumero': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'solicitudSobreprestamoNum': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'edadPermitidaMin': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'edadPermitidaMax': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'autorizacionAutomaticaUdisNumero': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'otorgamientoCreditoMinDm': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'otorgamientoCreditoManDm': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'tantos': [
            {
                type: 'required', message: 'Campo requerido.'
            }
        ],
        'porcentaje': [
            {
                type: 'required', message: 'Campo requerido.'
            }
        ],
        'limiteInferior': [
            {
                type: 'required', message: 'Campo requerido.'
            }
        ],
        'limiteSuperior': [
            {
                type: 'required', message: 'Campo requerido.'
            }
        ],
        'generos': [
            {
                type: 'required', message: 'Campo requerido.'
            }
        ],
        'moneda': [
            {
                type: 'required', message: 'Campo requerido.'
            }
        ],
        'fondo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El fondo no pertenece a la lista, elija otro.' }
        ],
        'gracia': [
            {
                type: 'required', message: 'Campo requerido.'
            },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'asignaciones': [
            {
                type: 'required', message: 'Campo requerido.'
            },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'refinanciamientos': [
            {
                type: 'required', message: 'Campo requerido.'
            },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'reprogramaciones': [
            {
                type: 'required', message: 'Campo requerido.'
            },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'montoTasaMaximo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'montoTasaMinimo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],

        'cuentabancaria': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Cuenta Bancaria no pertenece a la lista, elija otra.' }
        ],

        'tipoCuenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Movimiento Caja no pertenece a la lista, elija otro.' }
        ],
        'diasAVencido': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ]


    }

    validacionesExpediente = {
        'documento': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'expediente': [
            { type: 'required', message: 'Campo requerido.' },
        ]
    }


    /**
    * constructor de la clase ISR
    * @param service - service para el acceso de datos
    */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog,
        private formbuilder: UntypedFormBuilder) {
        this.formCreditos = this.formbuilder.group({
            cveCredito: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(254)]),
            estatus: new UntypedFormControl(true),
            // tasaInteresNormal: new FormControl('', [Validators.required]),
            tasaInteresMoratorio: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            aplicaIVA: new UntypedFormControl(false),
            finalidadId: new UntypedFormControl('', [Validators.required]),
            mercadoId: new UntypedFormControl('', [Validators.required]),
            calculoInteresID: new UntypedFormControl('', [Validators.required]),
            creditoEmpleadoAplica: new UntypedFormControl(false),
            tipoAmortizacionId: new UntypedFormControl('', [Validators.required]),
            condicionPagoId: new UntypedFormControl('', [Validators.required]),
            plazoMaximo: new UntypedFormControl('', [Validators.required]),
            plazoMinimo: new UntypedFormControl('', [Validators.required]),
            montoMaximo: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            montoMinimo: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            //frecuenciaPago: new FormControl(''),

            consultaSicNumero: new UntypedFormControl({ value: '', disabled: true }),
            consultaSicAplica: new UntypedFormControl(false),
            solicitudSobreprestamoAplica: new UntypedFormControl(false),
            solicitudSobreprestamoNum: new UntypedFormControl({ value: '', disabled: true }),
            edadPermitidaAplica: new UntypedFormControl(false),
            edadPermitidaMin: new UntypedFormControl({ value: '', disabled: true }),
            edadPermitidaMax: new UntypedFormControl({ value: '', disabled: true }),
            autorizacionAutomaticaUdisAplica: new UntypedFormControl(false),
            autorizacionAutomaticaUdisNumero: new UntypedFormControl({ value: '', disabled: true }),
            otorgamientoCreditoAplica: new UntypedFormControl(false),
            otorgamientoCreditoMinDm: new UntypedFormControl({ value: '', disabled: true }),
            otorgamientoCreditoManDm: new UntypedFormControl({ value: '', disabled: true }),
            antiguedadRequerida: new UntypedFormControl(false),
            calificacionCredito: new UntypedFormControl('', [Validators.required]),
            campoActivo: new UntypedFormControl(''),
            cuentaCampoActivo: new UntypedFormControl(''),

            campoPasivo: new UntypedFormControl(''),
            cuentaCampoPasivo: new UntypedFormControl(''),

            campoResultado: new UntypedFormControl(''),
            cuentaCampoResultado: new UntypedFormControl(''),

            campoOrden: new UntypedFormControl(''),
            cuentaCampoOrden: new UntypedFormControl(''),


            aplicageneralesId: new UntypedFormControl(''),
            garantiasId: new UntypedFormControl(''),
            tantos: new UntypedFormControl({ value: '', disabled: true }),
            porcentaje: new UntypedFormControl({ value: '', disabled: true }),
            limiteInferior: new UntypedFormControl({ value: '', disabled: true }),
            limiteSuperior: new UntypedFormControl({ value: '', disabled: true }),

            //Nuevas adecuaciones
            generos: new UntypedFormControl('', [Validators.required]),
            moneda: new UntypedFormControl('', [Validators.required]),
            fondo: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            gracia: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            asignaciones: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            refinanciamientos: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            reprogramaciones: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            aplicaGrupos: new UntypedFormControl(false),
            aplicaPagoFuturo: new UntypedFormControl(false),
            aplicaPPrueba: new UntypedFormControl(false),
            montoTasaMaximo: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            montoTasaMinimo: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            //cuentabancaria: new FormControl('', { validators: [Validators.required, this.autocompleteObjectValidator()] }),
            cuentabancaria: new UntypedFormControl(''),
            tipoCuenta: new UntypedFormControl('', { validators: [Validators.required, this.autocompleteObjectValidator()] }),
            diasAVencido: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')])

        });

        this.rangoPrueba = this.formbuilder.group({
            start: new UntypedFormControl('', [Validators.required]),
            end: new UntypedFormControl('', [Validators.required]),
        });

        this.formComisiones = this.formbuilder.group({
            cuenta: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            tipoComision: new UntypedFormControl('', [Validators.required]),
            tipoCalculo: new UntypedFormControl('', [Validators.required]),
            valor: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')])
        });

        this.formExpediente = this.formbuilder.group({
            documento: new UntypedFormControl('', [Validators.required]),
            expediente: new UntypedFormControl('', [Validators.required])
        })

        this.formCreditos.get('aplicageneralesId').valueChanges.subscribe((dataLis: any) => {
            if (dataLis !== "" && dataLis !== null) {
                let objeto = this.listaAplica.find((res: any) => {
                    return res.generalesId === dataLis
                })
                if (objeto.cveGeneral !== generales.cveNAplica) {
                    if (objeto.cveGeneral === generales.cveAPorcentaje) {
                        this.formCreditos.controls['porcentaje'].enable();
                        this.formCreditos.controls['porcentaje'].setValidators([Validators.required]);

                        this.formCreditos.controls['tantos'].disable();
                        this.formCreditos.controls['limiteInferior'].disable();
                        this.formCreditos.controls['limiteSuperior'].disable();

                    }
                    if (objeto.cveGeneral === generales.cveATantos) {
                        this.formCreditos.controls['tantos'].enable();
                        this.formCreditos.controls['tantos'].setValidators([Validators.required]);

                        this.formCreditos.controls['porcentaje'].disable();
                        this.formCreditos.controls['limiteInferior'].disable();
                        this.formCreditos.controls['limiteSuperior'].disable();
                    }
                    if (objeto.cveGeneral === generales.cveARango) {
                        this.formCreditos.controls['limiteInferior'].enable();
                        this.formCreditos.controls['limiteInferior'].setValidators([Validators.required]);
                        this.formCreditos.controls['limiteSuperior'].enable();
                        this.formCreditos.controls['limiteSuperior'].setValidators([Validators.required]);

                        this.formCreditos.controls['porcentaje'].disable();
                        this.formCreditos.controls['tantos'].disable();
                    }

                } else {
                    this.formCreditos.controls['limiteInferior'].clearValidators();
                    this.formCreditos.controls['limiteSuperior'].clearValidators();
                    this.formCreditos.controls['porcentaje'].clearValidators();
                    this.formCreditos.controls['tantos'].clearValidators();

                    this.formCreditos.controls['porcentaje'].disable();
                    this.formCreditos.controls['tantos'].disable();
                    this.formCreditos.controls['limiteInferior'].disable();
                    this.formCreditos.controls['limiteSuperior'].disable();
                }
                this.formCreditos.controls['tantos'].updateValueAndValidity();
                this.formCreditos.controls['porcentaje'].updateValueAndValidity();
                this.formCreditos.controls['limiteSuperior'].updateValueAndValidity();
                this.formCreditos.controls['limiteInferior'].updateValueAndValidity();
            }
        })


        this.formCreditos.get('consultaSicAplica').valueChanges.subscribe((data: any) => {
            if (data === true) {
                this.formCreditos.controls['consultaSicNumero'].setValidators([Validators.required]);
                this.formCreditos.controls['consultaSicNumero'].enable();

            } else {
                this.formCreditos.controls['consultaSicNumero'].clearValidators();
                this.formCreditos.controls['consultaSicNumero'].disable();

            }
            this.formCreditos.controls['consultaSicNumero'].updateValueAndValidity();
        })
        this.formCreditos.get('solicitudSobreprestamoAplica').valueChanges.subscribe((data: any) => {
            if (data === true) {
                this.formCreditos.controls['solicitudSobreprestamoNum'].setValidators([Validators.required]);
                this.formCreditos.controls['solicitudSobreprestamoNum'].enable();

            } else {
                this.formCreditos.controls['solicitudSobreprestamoNum'].clearValidators();
                this.formCreditos.controls['solicitudSobreprestamoNum'].disable();

            }
            this.formCreditos.controls['solicitudSobreprestamoNum'].updateValueAndValidity();
        })


        this.formCreditos.get('edadPermitidaAplica').valueChanges.subscribe((data: any) => {
            if (data === true) {
                this.formCreditos.controls['edadPermitidaMin'].setValidators([Validators.required]);
                this.formCreditos.controls['edadPermitidaMax'].setValidators([Validators.required]);
                this.formCreditos.controls['edadPermitidaMin'].enable();
                this.formCreditos.controls['edadPermitidaMax'].enable();

            } else {
                this.formCreditos.controls['edadPermitidaMin'].clearValidators();
                this.formCreditos.controls['edadPermitidaMax'].clearValidators();
                this.formCreditos.controls['edadPermitidaMin'].disable();
                this.formCreditos.controls['edadPermitidaMax'].disable();
            }
            this.formCreditos.controls['edadPermitidaMin'].updateValueAndValidity();
            this.formCreditos.controls['edadPermitidaMax'].updateValueAndValidity();
        })
        this.formCreditos.get('autorizacionAutomaticaUdisAplica').valueChanges.subscribe((data: any) => {
            if (data === true) {
                this.formCreditos.controls['autorizacionAutomaticaUdisNumero'].setValidators([Validators.required]);
                this.formCreditos.controls['autorizacionAutomaticaUdisNumero'].enable();
            } else {
                this.formCreditos.controls['autorizacionAutomaticaUdisNumero'].clearValidators();
                this.formCreditos.controls['autorizacionAutomaticaUdisNumero'].disable();

            }
            this.formCreditos.controls['autorizacionAutomaticaUdisNumero'].updateValueAndValidity();
        })
        this.formCreditos.get('otorgamientoCreditoAplica').valueChanges.subscribe((data: any) => {
            if (data === true) {
                this.formCreditos.controls['otorgamientoCreditoMinDm'].setValidators([Validators.required]);
                this.formCreditos.controls['otorgamientoCreditoManDm'].setValidators([Validators.required]);
                this.formCreditos.controls['otorgamientoCreditoMinDm'].enable();
                this.formCreditos.controls['otorgamientoCreditoManDm'].enable();


            } else {
                this.formCreditos.controls['otorgamientoCreditoMinDm'].clearValidators();
                this.formCreditos.controls['otorgamientoCreditoManDm'].clearValidators();
                this.formCreditos.controls['otorgamientoCreditoMinDm'].disable();
                this.formCreditos.controls['otorgamientoCreditoManDm'].disable();
            }
            this.formCreditos.controls['otorgamientoCreditoMinDm'].updateValueAndValidity();
            this.formCreditos.controls['otorgamientoCreditoManDm'].updateValueAndValidity();
        })
    }
    /**
     * Metodo OnInit de la clase creditos
     */
    ngOnInit() {
        this.spslistaFinalidades();
        this.spslistaMercado();
        this.spslistaTipoCalculo();
        this.spslistaTipoAmortizacion();
        this.spslistaCondicionesP();
        this.spslistaGarantias();
        this.spslistaFrecuencias();
        this.spslistaActivos();
        this.spslistaPasivos();
        this.spslistaResultado();
        this.spslistaOrden();
        this.spslistaCuentasContables();
        this.spslistaTiposDeDocumentos();
        this.spslistaAplica();
        this.spsListarSucursales();
        this.spslistaGeneros();
        this.spsMonedas();
        this.spsFondos();
        this.spsComisiones();
        this.spsTipoCalculo();
        this.spsCuentasBancarias();
        this.spsMovCuentaCaja();
        this.spsExpedientes();
        this.spslistaCreditos();
    }


    //habilitar y deshabilitar metodos

    cambioConsultaSicAplica(evento) {
        this.consultaSicAplicaB = evento.checked
    }
    cambioSolicitudSobreprestamoAplica(evento) {
        this.solicitudSobreprestamoAplicaB = evento.checked

    }

    cambioEdadPermitidaAplicaB(evento) {
        this.edadPermitidaAplicaB = evento.checked
    }
    cambioAplicaUdios(evento) {
        this.aplicaUdis = evento.checked
    }
    cambioMora(evento) {
        this.mora = evento.checked
    }
    /**
   * Metodo que lista los registros de Creditos
   */
    spslistaCreditos() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(1, 'listarCreditos').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCreditos = data;

                this.searcher = new FuzzySearch(this.listaCreditos, ['cveCredito', 'descripcion'], {
                    caseSensitive: false,
                });
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }
    /**
       * Metodo que lista los registros de tipos de documentos
       */
    spslistaTiposDeDocumentos() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(2, 'listaTipoDocumento').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaTDocumentos = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    /**
     * Metodo que agrega expedientes por credito
     */
    addDocumento() {

        if (this.formExpediente.invalid) {
            this.validateAllFormFields(this.formExpediente);
            return;
        }


        if ((this.formExpediente.get('expediente').value.cveGeneral !== generales.expClientes)
            && (this.formExpediente.get('expediente').value.cveGeneral !== '80GC')
        ) {
            if (this.listaGarantiasSeleccionados.length === 0) {
                this.service.showNotification('top', 'right', 3, 'No se han agregado garantías');
                return;
            } else {

                let duplicado = this.listaDocumentosSeleccionados.find(i => i.tipodocumento_id === this.formExpediente.get('documento').value.tipoDocumentoID &&
                    i.expediente_id === this.formExpediente.get('expediente').value.generalesId);

                if (!this.vacio(duplicado)) {
                    this.service.showNotification('top', 'right', 5, 'Ya se encuentra el documento y el expediente agregados.');
                    return;
                } else {
                    let cveExpediente = this.formExpediente.get('expediente').value.cveGeneral;

                    switch (cveExpediente) {
                        case '80HA':
                            let expH = this.listaGarantiasSeleccionados.find(e => e.descripcion.cveGarantia.trim() === globales.cveGarHipa);
                            if (this.vacio(expH)) {
                                this.service.showNotification('top', 'right', 3, 'Necesitas agregar una garantía Hipotecaria.');
                                return;
                            }
                            break;

                        case '80PA':

                            let expP = this.listaGarantiasSeleccionados.find(e => e.descripcion.cveGarantia.trim() === globales.cveGarPrenda);
                            if (this.vacio(expP)) {
                                this.service.showNotification('top', 'right', 3, 'Necesitas agregar una garantía Prendaría.');
                                return;
                            }

                            break;

                        case '80GL':

                            let expG = this.listaGarantiasSeleccionados.find(e => e.descripcion.cveGarantia.trim() === globales.cveGarLiq);
                            if (this.vacio(expG)) {
                                this.service.showNotification('top', 'right', 3, 'Necesitas agregar una garantía Garantía Liquida.');
                                return;
                            }

                            break;

                        case '80AL':

                            let expA = this.listaGarantiasSeleccionados.find(e => e.descripcion.cveGarantia.trim() === globales.cveGarAval);
                            if (this.vacio(expA)) {
                                this.service.showNotification('top', 'right', 3, 'Necesitas agregar una garantía Aval.');
                                return;
                            }

                            break;

                        case '80IN':

                            let expI = this.listaGarantiasSeleccionados.find(e => e.descripcion.cveGarantia.trim() === globales.cveGarInversion);
                            if (this.vacio(expI)) {
                                this.service.showNotification('top', 'right', 3, 'Necesitas agregar una garantía Inversión.');
                                return;
                            }

                            break;

                    }
                }
            }
        }

        this.listaDocumentosSeleccionados.push({
            tipodocumento_id: this.formExpediente.get('documento').value.tipoDocumentoID,
            nombreDoc: this.formExpediente.get('documento').value.nombreDoc,
            expediente_id: this.formExpediente.get('expediente').value.generalesId,
            descripcion: this.formExpediente.get('expediente').value.descripcion
        });


    }


    /**
     * Metodo que lista las finalidades
     */
    spslistaFinalidades() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(2, 'listaFinalidadCredito').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaFinalidades = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
    * Metodo que lista los mercados
    */
    spslistaMercado() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID('09MC', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaMercado = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
    * Metodo que lista los tipo de calculo
    */
    spslistaTipoCalculo() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID('11TC', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCalculo = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
     * Metodo que lista los tipos de Generos
     */
    spslistaGeneros() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(environment.categorias.catGenero, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaGeneros = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }


    /**
 * Metodo para obtener la lista de monedas
 */
    spsMonedas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaMonedas').subscribe(data => {
            this.blockUI.stop();
            this.listaMonedas = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
* Metodo para obtener la lista de monedas
*/
    spsFondos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaTipoFondos').subscribe(data => {
            this.blockUI.stop();
            this.listaFondos = data;
            this.opcionesFondos = this.formCreditos.get('fondo').valueChanges.pipe(
                startWith(''),
                map(value => this._filterFondo(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
    * Filta los fondos
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterFondo(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaFondos.filter(fondo => fondo.descripcion.toLowerCase().includes(filterValue)
            || fondo.cvetfondo.toLowerCase().includes(filterValue)
        );
    }

    /**
    * Muestra la descripcion y clave de fondo
    * @param fondo --cuenta seleccionada
    * @returns -- cuenta
    */
    displayFondo(fondo: any): any {
        return fondo ? fondo.cvetfondo + ' / ' + fondo.descripcion.trim() : undefined;
    }

    aplicaPrueba(event: any) {

        if (event === true) {
            this.showPPrueba = true;
        } else {
            this.showPPrueba = false;
        }
    }


    /**
* Metodo que lista las comisiones
*/
    spsComisiones() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(environment.categorias.catComisionesCre, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaComisiones = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    /**
     * Metodo que lista los tipos de calculo para las comisiones
     */
    spsTipoCalculo() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(environment.categorias.catCalComisiones, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaTiposCalculo = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    /**
   * Metodo que lista las amortizaciones
   */
    spslistaTipoAmortizacion() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(2, 'listaTipoAmortizacion').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaAmortizaciones = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }


    /**
   * Metodo que lista condiciones de pago
   */
    spslistaCondicionesP() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID('12CP', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCondicionPago = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
   * Metodo que lista condiciones de pago
   */
    spslistaGarantias() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(1, 'listaGarantia').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaGarantias = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
    * Metodo que lista los aplica
    */
    spslistaAplica() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID('01AP', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaAplica = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
    * Metodo que lista los aplica
    */
    spsExpedientes() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(categorias.catExpedientes, 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaExpedientes = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
   * Metodo que lista condiciones de pago
   */
    spslistaFrecuencias() {
        this.blockUI.start('Cargando ...')
        this.service.getListByID(2, 'listaTipoPlazo').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaFrecuencia = data;
                this.filteredFrecuenciasP = this.frecuenciapagos.valueChanges.pipe(
                    startWith(null),
                    map((frecuencia: string | null) => frecuencia ? this._filterFrecuencia(frecuencia) : this.listaFrecuencia.slice()));

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });


    }

    /**
   * Metodo que lista los activos
   */
    spslistaActivos() {
        this.service.getListByID('13AC', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.listaActivos = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
    * Metodo que lista los pasivos
    */
    spslistaPasivos() {
        this.service.getListByID('13PA', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.listaPasivos = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
   * Metodo que lista los resultado
   */
    spslistaResultado() {
        this.service.getListByID('14RS', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.listaResultado = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
    * Metodo que lista de orden
    */
    spslistaOrden() {
        this.service.getListByID('15OR', 'listaGeneralCategoria').subscribe(
            (data: any) => {
                this.listaOrden = data;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
   * Metodo que lista las cuentas contables AFECTABLES
   */
    spslistaCuentasContables() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCuentasContables').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCuentasContablesActivo = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');
                this.listaCuentasComisiones = this.listaCuentasContablesActivo;
                this.listaCuentasContablesPasivo = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');
                this.listaCuentasContablesResultado = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');
                this.listaCuentasContablesOrden = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');

                this.opcionesCuentas = this.formComisiones.get('cuenta').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCuenta(value))
                );

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }



    /**
    * Filta los fondos
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuenta(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentasComisiones.filter(cuenta => cuenta.cuenta.toLowerCase().includes(filterValue)
            || cuenta.nombre.toLowerCase().includes(filterValue)
        );
    }

    /**
    * Muestra la descripcion y clave de cuenta
    * @param cuenta --cuenta seleccionada
    * @returns -- cuenta
    */
    displayCuenta(cuenta: any): any {
        return cuenta ? cuenta.cuenta + ' / ' + cuenta.nombre.trim() : undefined;
    }


    /**
     * Metodo para agregar datos a la lista de activos
     */
    agregarActivo() {
        let campo: any
        campo = this.formCreditos.get('campoActivo').value
        let cuenta: any
        cuenta = this.formCreditos.get('cuentaCampoActivo').value

        if ((campo !== '' && campo !== null && campo != undefined) &&
            (cuenta !== '' && cuenta !== null && cuenta != undefined)) {

            if (this.listaActivosSeleccionados.length <= 0) {
                this.formCreditos.get('campoActivo').setValue('');
                this.formCreditos.get('cuentaCampoActivo').setValue('');
                let cuentaCampo = {
                    cuentaC: cuenta,
                    campoC: campo,
                }
                this.listaActivosSeleccionados.push(cuentaCampo)
            } else {
                let indice = this.listaActivosSeleccionados.findIndex(i => i.campoC.descripcion === campo.descripcion)
                let indiceDos = this.listaActivosSeleccionados.findIndex(i2 => i2.cuentaC.cuentaid === cuenta.cuentaid)

                //if (indice === -1 && indiceDos === -1) {

                    let cuentaCampo = {
                        cuentaC: cuenta,
                        campoC: campo,
                    }
                    this.listaActivosSeleccionados.push(cuentaCampo)
                    this.formCreditos.get('campoActivo').setValue('');
                    this.formCreditos.get('cuentaCampoActivo').setValue('');
                
                /*
                } else {
                    this.service.showNotification('top', 'right', 1, "La cuenta o el campo ya se encuentran registrados")
                }*/
            }
        }
    }

    /***
     * metodo para remover datos de la lista de activos
     */

    eliminar(valor: any) {
        let index = this.listaActivosSeleccionados.findIndex(res => res.campoC.descripcion === valor.campoC.descripcion)
        this.listaActivosSeleccionados.splice(index, 1)
    }

    /**
    * Metodo para agregar datos a la lista de activos
    */
    agregarGarantias() {
        let tipoGarantia = this.formCreditos.get('garantiasId').value
        let aplica = this.formCreditos.get('aplicageneralesId').value
        let tantos = this.formCreditos.get('tantos').value
        let porcentaje = this.formCreditos.get('porcentaje').value
        let limiteInferior = this.formCreditos.get('limiteInferior').value
        let limiteSuperior = this.formCreditos.get('limiteSuperior').value

        if ((tipoGarantia !== '' && tipoGarantia !== null && tipoGarantia != undefined) &&
            (aplica !== '' && aplica !== null && aplica != undefined)) {

            //aqui se validan los campos  que son obligatorios segun el aplica
            this.formCreditos.get('garantiasId').setValue('')
            this.formCreditos.get('aplicageneralesId').setValue('')
            this.formCreditos.get('tantos').setValue('')
            this.formCreditos.get('porcentaje').setValue('')
            this.formCreditos.get('limiteInferior').setValue('')
            this.formCreditos.get('limiteSuperior').setValue('')

            let descripcion = this.listaGarantias.find((res: any) => { if (res.garantiaId === tipoGarantia) { return res.descripcion } else { return null } })
            let descripcionAplica = this.listaAplica.find((res: any) => { if (res.generalesId === aplica) { return res.descripcion } else { return null } })
            if (descripcionAplica.descripcion === "Rango") {
                if (limiteInferior === "" || limiteSuperior === "")
                    return
            }
            if (descripcionAplica.descripcion === "Porcentaje") {
                if (porcentaje === "")
                    return
            }
            if (descripcionAplica.descripcion === "Tantos") {
                if (tantos === "")
                    return
            }
            if (this.listaGarantiasSeleccionados.length <= 0) {
                let objeto = {
                    tipoGarantia,
                    aplica,
                    tantos,
                    porcentaje,
                    limiteInferior,
                    limiteSuperior,
                    descripcion,
                    descripcionAplica
                }
                this.listaGarantiasSeleccionados.push(objeto)
                this.limpiarValidacionesGarantias()

            } else {
                let indice = this.listaGarantiasSeleccionados.findIndex(i => i.tipoGarantia === tipoGarantia)

                if (indice === -1) {
                    let objeto = {
                        tipoGarantia,
                        aplica,
                        tantos,
                        porcentaje,
                        limiteInferior,
                        limiteSuperior,
                        descripcion,
                        descripcionAplica
                    }
                    this.formCreditos.get('garantiasId').setValue('')
                    this.formCreditos.get('aplicageneralesId').setValue('')
                    this.formCreditos.get('tantos').setValue('')
                    this.formCreditos.get('porcentaje').setValue('')
                    this.formCreditos.get('limiteInferior').setValue('')
                    this.formCreditos.get('limiteSuperior').setValue('')
                    this.listaGarantiasSeleccionados.push(objeto)
                    this.limpiarValidacionesGarantias()

                } else {
                    //se actualiza
                    this.listaGarantiasSeleccionados.forEach(element => {
                        if (element.tipoGarantia === tipoGarantia) {
                            element.tipoGarantia = tipoGarantia
                            element.aplica = aplica
                            element.tantos = tantos
                            element.porcentaje = porcentaje
                            element.limiteInferior = limiteInferior
                            element.limiteSuperior = limiteSuperior
                            element.descripcion = descripcion
                            element.descripcionAplica = descripcionAplica
                        }
                    });

                    this.limpiarValidacionesGarantias()
                    this.service.showNotification('top', 'right', 1, "La garantía ya se encuentran registrada, solo se actualizaron sus valores")
                }
            }
        }
    }

    // metodo para consualtar cuentas bancarias 
    spsCuentasBancarias() {
        this.blockUI.start('Cargando datos...');
        let path = '?sucursalId=' + 0 + '&' + 'tipoCuenta=' + '';
        this.service.getListByID(path, 'listaCuentaBancariaID').subscribe(data => {
            this.blockUI.stop();
            this.listaCuentaBancaria = data;
            this.filteredCuentasBancarias = this.formCreditos.get('cuentabancaria').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaB(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
* Filtra la forma de pago
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterCuentaB(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentaBancaria.filter(option => option.claveCuenta.toLowerCase().includes(filterValue) + option.descripcionCuenta.toLowerCase().includes(filterValue),);
    }

    /**
    * Muestra la descripcion de la cuenta Bancaria
    * @param option --cuentabancaria seleccionada
    * @returns --nombre de la cuenta bancaria
    */
    displayFnCuentaB(option: any): any {
        return option ? option.claveCuenta.trim() + " / " + option.descripcionCuenta.trim() : undefined;
    }


    // Metodo para consultar movimientos de cajas
    spsMovCuentaCaja() {
        this.blockUI.start('Cargando datos...');
        let path = "NULL" + '/' + 2;
        this.service.getListByID(path, 'listaMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaMovCuentaCaja = data;
            this.filteredMovCaja = this.formCreditos.get('tipoCuenta').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCajaMov(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
  * Filtra la forma de pago
  * @param value --texto de entrada
  * @returns la opcion u opciones que coincidan con la busqueda
  */
    private _filterCajaMov(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaMovCuentaCaja.filter(option => option.cveMovCaja.toLowerCase().includes(filterValue) + option.nombreMovimiento.toLowerCase().includes(filterValue),);
    }

    /**
    * Muestra la descripcion del movimiento caja
    * @param option --movimiento caja  seleccionada
    * @returns --nombre del movimiento caja
    */
    displayFnMovCaja(option: any): any {
        return option ? option.cveMovCaja + "/" + option.nombreMovimiento : undefined;
    }


    limpiarValidacionesGarantias() {
        this.formCreditos.controls['porcentaje'].clearValidators();
        this.formCreditos.controls['porcentaje'].disable();
        this.formCreditos.controls['tantos'].disable();
        this.formCreditos.controls['tantos'].clearValidators();
        this.formCreditos.controls['limiteInferior'].disable();
        this.formCreditos.controls['limiteSuperior'].clearValidators();
        this.formCreditos.controls['limiteInferior'].clearValidators();
        this.formCreditos.controls['limiteSuperior'].disable();

        this.formCreditos.controls['tantos'].updateValueAndValidity();
        this.formCreditos.controls['porcentaje'].updateValueAndValidity();
        this.formCreditos.controls['limiteSuperior'].updateValueAndValidity();
        this.formCreditos.controls['limiteInferior'].updateValueAndValidity();
    }
    /***
        * metodo para remover datos de la lista de garantias
        */

    eliminarGarantias(valor: any) {
        let index = this.listaGarantiasSeleccionados.findIndex(res => res.tipoGarantia === valor.tipoGarantia);
        this.listaGarantiasSeleccionados.splice(index, 1)
    }


    /***
    * metodo para remover datos de la lista de activos tipodocumento_id
    */

    eliminarDocumento(valor: any) {

        let index = this.listaDocumentosSeleccionados.findIndex(res => res.tipodocumento_id === valor.tipodocumento_id && res.expediente_id === valor.expediente_id);
        this.listaDocumentosSeleccionados.splice(index, 1)
    }

    /***
     * metodo para remover datos de la lista de pasivos
     */

    eliminarPasivo(valor: any) {
        let index = this.listaPasivosSeleccionados.findIndex(res => res.campoC.descripcion === valor.campoC.descripcion)
        this.listaPasivosSeleccionados.splice(index, 1)
    }

    /**
   * Metodo para agregar datos a la lista de activos
   */
    agregarPasivo() {
        let campo: any
        campo = this.formCreditos.get('campoPasivo').value
        let cuenta: any
        cuenta = this.formCreditos.get('cuentaCampoPasivo').value

        if ((campo !== '' && campo !== null && campo != undefined) &&
            (cuenta !== '' && cuenta !== null && cuenta != undefined)) {

            if (this.listaPasivosSeleccionados.length <= 0) {
                this.formCreditos.get('campoPasivo').setValue('');
                this.formCreditos.get('cuentaCampoPasivo').setValue('');
                let cuentaCampo = {
                    cuentaC: cuenta,
                    campoC: campo,
                }
                this.listaPasivosSeleccionados.push(cuentaCampo)
            } else {
                let indice = this.listaPasivosSeleccionados.findIndex(i => i.campoC.descripcion === campo.descripcion)
                let indiceDos = this.listaPasivosSeleccionados.findIndex(i2 => i2.cuentaC.cuentaid === cuenta.cuentaid)
                //if (indice === -1 && indiceDos === -1) {
                    let cuentaCampo = {
                        cuentaC: cuenta,
                        campoC: campo,
                    }
                    this.listaPasivosSeleccionados.push(cuentaCampo)
                    this.formCreditos.get('campoPasivo').setValue('');
                    this.formCreditos.get('cuentaCampoPasivo').setValue('');
               /* } else {
                    this.service.showNotification('top', 'right', 1, "La cuenta o el campo ya se encuentran registrados")

                }*/
            }
        }
    }


    /***
   * metodo para remover datos de la lista de pasivos
   */

    eliminarResultado(valor: any) {
        let index = this.listaResultadoSeleccionados.findIndex(res => res.campoC.descripcion === valor.campoC.descripcion)
        this.listaResultadoSeleccionados.splice(index, 1)
    }

    /**
   * Metodo para agregar datos a la lista de activos
   */
    agregarResultado() {
        let campo: any
        campo = this.formCreditos.get('campoResultado').value
        let cuenta: any
        cuenta = this.formCreditos.get('cuentaCampoResultado').value

        if ((campo !== '' && campo !== null && campo != undefined) &&
            (cuenta !== '' && cuenta !== null && cuenta != undefined)) {

            if (this.listaResultadoSeleccionados.length <= 0) {
                this.formCreditos.get('campoResultado').setValue('');
                this.formCreditos.get('cuentaCampoResultado').setValue('');
                let cuentaCampo = {
                    cuentaC: cuenta,
                    campoC: campo,
                }
                this.listaResultadoSeleccionados.push(cuentaCampo)
            } else {
                let indice = this.listaResultadoSeleccionados.findIndex(i => i.campoC.descripcion === campo.descripcion)
                let indiceDos = this.listaResultadoSeleccionados.findIndex(i2 => i2.cuentaC.cuentaid === cuenta.cuentaid)
                //if (indice === -1 && indiceDos === -1) {
                    let cuentaCampo = {
                        cuentaC: cuenta,
                        campoC: campo,
                    }
                    this.listaResultadoSeleccionados.push(cuentaCampo)
                    this.formCreditos.get('campoResultado').setValue('');
                    this.formCreditos.get('cuentaCampoResultado').setValue('');
               /* } else {
                    this.service.showNotification('top', 'right', 1, "La cuenta o el campo ya se encuentran registrados")

                }*/
            }
        }
    }

    /***
  * metodo para remover datos de la lista de pasivos
  */

    eliminarOrden(valor: any) {
        let index = this.listaOrdenSeleccionados.findIndex(res => res.campoC.descripcion === valor.campoC.descripcion)
        this.listaOrdenSeleccionados.splice(index, 1)
    }

    /**
   * Metodo para agregar datos a la lista de activos
   */
    agregarOrden() {
        let campo: any
        campo = this.formCreditos.get('campoOrden').value
        let cuenta: any
        cuenta = this.formCreditos.get('cuentaCampoOrden').value

        if ((campo !== '' && campo !== null && campo != undefined) &&
            (cuenta !== '' && cuenta !== null && cuenta != undefined)) {

            if (this.listaOrdenSeleccionados.length <= 0) {
                this.formCreditos.get('campoOrden').setValue('');
                this.formCreditos.get('cuentaCampoOrden').setValue('');
                let cuentaCampo = {
                    cuentaC: cuenta,
                    campoC: campo,
                }
                this.listaOrdenSeleccionados.push(cuentaCampo)
            } else {
                let indice = this.listaOrdenSeleccionados.findIndex(i => i.campoC.descripcion === campo.descripcion)
                let indiceDos = this.listaOrdenSeleccionados.findIndex(i2 => i2.cuentaC.cuentaid === cuenta.cuentaid)
                //if (indice === -1 && indiceDos === -1) {
                    let cuentaCampo = {
                        cuentaC: cuenta,
                        campoC: campo,
                    }
                    this.listaOrdenSeleccionados.push(cuentaCampo)
                    this.formCreditos.get('campoOrden').setValue('');
                    this.formCreditos.get('cuentaCampoOrden').setValue('');
                /*} else {
                    this.service.showNotification('top', 'right', 1, "La cuenta o el campo ya se encuentran registrados")

                }*/
            }
        }


    }

    /**
   * Metodo para se ejecuta cuando se selecciona un credito, para recuperar los datos de credito
   */
    agregarGarantiasCreditoSeleccionado(valor: any) {
        let tipoGarantia = valor.garantia_id
        let aplica = valor.aplica_generales_id
        let tantos = valor.tantos
        let porcentaje = valor.porcentaje
        let limiteInferior = valor.limite_inferior
        let limiteSuperior = valor.limite_superior

        if ((tipoGarantia !== '' && tipoGarantia !== null && tipoGarantia !== undefined) &&
            (aplica !== '' && aplica !== null && aplica !== undefined)) {

            //aqui se validan los campos  que son obligatorios segun el aplica
            this.formCreditos.get('garantiasId').setValue('')
            this.formCreditos.get('aplicageneralesId').setValue('')
            this.formCreditos.get('tantos').setValue('')
            this.formCreditos.get('porcentaje').setValue('')
            this.formCreditos.get('limiteInferior').setValue('')
            this.formCreditos.get('limiteSuperior').setValue('')

            let descripcion = this.listaGarantias.find((res: any) => { if (res.garantiaId === tipoGarantia) { return res.descripcion } else { return null } })
            let descripcionAplica = this.listaAplica.find((res: any) => { if (res.generalesId === aplica) { return res.descripcion } else { return null } })
            if (descripcionAplica.descripcion === "Rango") {
                if (limiteInferior === "" || limiteSuperior === "")
                    return
            }
            if (descripcionAplica.descripcion === "Porcentaje") {
                if (porcentaje === "")
                    return
            }
            if (descripcionAplica.descripcion === "Tantos") {
                if (tantos === "")
                    return
            }
            if (this.listaGarantiasSeleccionados.length <= 0) {
                let objeto = {
                    tipoGarantia,
                    aplica,
                    tantos,
                    porcentaje,
                    limiteInferior,
                    limiteSuperior,
                    descripcion,
                    descripcionAplica
                }
                this.listaGarantiasSeleccionados.push(objeto)
                this.limpiarValidacionesGarantias()

            } else {
                let indice = this.listaGarantiasSeleccionados.findIndex(i => i.tipoGarantia === tipoGarantia)
                if (indice === -1) {
                    let objeto = {
                        tipoGarantia,
                        aplica,
                        tantos,
                        porcentaje,
                        limiteInferior,
                        limiteSuperior,
                        descripcion,
                        descripcionAplica
                    }
                    this.formCreditos.get('garantiasId').setValue('')
                    this.formCreditos.get('aplicageneralesId').setValue('')
                    this.formCreditos.get('tantos').setValue('')
                    this.formCreditos.get('porcentaje').setValue('')
                    this.formCreditos.get('limiteInferior').setValue('')
                    this.formCreditos.get('limiteSuperior').setValue('')
                    this.listaGarantiasSeleccionados.push(objeto)
                    this.limpiarValidacionesGarantias()

                } else {
                    //se actualiza
                    this.listaGarantiasSeleccionados.forEach(element => {
                        if (element.tipoGarantia === tipoGarantia) {
                            element.tipoGarantia = tipoGarantia
                            element.aplica = aplica
                            element.tantos = tantos
                            element.porcentaje = porcentaje
                            element.limiteInferior = limiteInferior
                            element.limiteSuperior = limiteSuperior
                            element.descripcion = descripcion
                            element.descripcionAplica = descripcionAplica
                        }
                    });

                    this.limpiarValidacionesGarantias()
                    this.service.showNotification('top', 'right', 1, "La garantía ya se encuentran registrada, solo se actualizaron sus valores")
                }
            }
        }
    }


    /**metodo que muestra el registro seleccionado de la lista  */
    registroSeleccionado(credito: any) {

        this.blockUI.start('Cargando ...')
        this.nuevo()
        this.editar = true
        this.creditoID = credito.creditoId
        this.nombreCredito = "" + credito.cveCredito + " / " + credito.descripcion;

        this.formCreditos.get('cveCredito').setValue(credito.cveCredito);
        this.formCreditos.get('descripcion').setValue(credito.descripcion);
        this.formCreditos.get('estatus').setValue(credito.estatus);
        this.formCreditos.get('tasaInteresMoratorio').setValue(credito.tasaInteresMoratorio);
        this.formCreditos.get('aplicaIVA').setValue(credito.aplicaIVA);
        this.formCreditos.get('finalidadId').setValue(credito.finalidadId);
        this.formCreditos.get('mercadoId').setValue(credito.mercadoId);
        this.formCreditos.get('calculoInteresID').setValue(credito.calculoInteresID);

        this.formCreditos.get('creditoEmpleadoAplica').setValue(credito.extenciones.extencionCatalogoCreditos.creditoEmpleadoAplica);
        this.formCreditos.get('tipoAmortizacionId').setValue(credito.extenciones.extencionCatalogoCreditos.tipoAmortizacionId);
        this.formCreditos.get('condicionPagoId').setValue(credito.extenciones.extencionCatalogoCreditos.condicionPagoId);
        this.formCreditos.get('plazoMaximo').setValue(credito.extenciones.extencionCatalogoCreditos.plazoMaximo);
        this.formCreditos.get('plazoMinimo').setValue(credito.extenciones.extencionCatalogoCreditos.plazoMinimo);
        this.formCreditos.get('montoMaximo').setValue(credito.extenciones.extencionCatalogoCreditos.montoMaximo);
        this.formCreditos.get('montoMinimo').setValue(credito.extenciones.extencionCatalogoCreditos.montoMinimo);
        this.formCreditos.get('consultaSicNumero').setValue(credito.extenciones.extencionCatalogoCreditos.consultaSicNumero);
        this.consultaSicAplicaB = credito.extenciones.extencionCatalogoCreditos.consultaSicAplica
        this.formCreditos.get('consultaSicAplica').setValue(credito.extenciones.extencionCatalogoCreditos.consultaSicAplica);
        this.formCreditos.get('solicitudSobreprestamoAplica').setValue(credito.extenciones.extencionCatalogoCreditos.solicitudSobreprestamoAplica);
        this.solicitudSobreprestamoAplicaB = credito.extenciones.extencionCatalogoCreditos.solicitudSobreprestamoAplica
        this.formCreditos.get('solicitudSobreprestamoNum').setValue(credito.extenciones.extencionCatalogoCreditosDos.solicitudSobreprestamoNum);
        this.formCreditos.get('edadPermitidaAplica').setValue(credito.extenciones.extencionCatalogoCreditosDos.edadPermitidaAplica);
        this.edadPermitidaAplicaB = credito.extenciones.extencionCatalogoCreditosDos.edadPermitidaAplica
        this.formCreditos.get('edadPermitidaMin').setValue(credito.extenciones.extencionCatalogoCreditosDos.edadPermitidaMin);
        this.formCreditos.get('edadPermitidaMax').setValue(credito.extenciones.extencionCatalogoCreditosDos.edadPermitidaMax);
        this.formCreditos.get('autorizacionAutomaticaUdisAplica').setValue(credito.extenciones.extencionCatalogoCreditosDos.autorizacionAutomaticaUdisAplica);
        this.formCreditos.get('autorizacionAutomaticaUdisNumero').setValue(credito.extenciones.extencionCatalogoCreditosDos.autorizacionAutomaticaUdisNumero);
        this.aplicaUdis = credito.extenciones.extencionCatalogoCreditosDos.autorizacionAutomaticaUdisAplica
        this.formCreditos.get('otorgamientoCreditoAplica').setValue(credito.extenciones.extencionCatalogoCreditosTres.otorgamientoCreditoAplica);
        this.mora = credito.extenciones.extencionCatalogoCreditosTres.otorgamientoCreditoAplica
        this.formCreditos.get('otorgamientoCreditoMinDm').setValue(credito.extenciones.extencionCatalogoCreditosTres.otorgamientoCreditoMinDm);
        this.formCreditos.get('otorgamientoCreditoManDm').setValue(credito.extenciones.extencionCatalogoCreditosTres.otorgamientoCreditoManDm);
        this.formCreditos.get('antiguedadRequerida').setValue(credito.extenciones.extencionCatalogoCreditosTres.antiguedadRequerida);
        this.formCreditos.get('calificacionCredito').setValue(credito.extenciones.extencionCatalogoCreditosTres.calificacionCredito);

        if (credito.extenciones.extencionCatalogoCreditosTres.garantias !== "")
            this.listaGarantiasIntermedia = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.garantias)
        if (credito.extenciones.extencionCatalogoCreditosTres.frecuenciaPagos !== "")
            this.listaFrecuenciasIntermedia = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.frecuenciaPagos)
        if (credito.extenciones.extencionCatalogoCreditosTres.cuentasCampos !== "")
            this.listaCuentasCamposIntermedia = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.cuentasCampos)
        if (credito.extenciones.extencionCatalogoCreditosTres.documentos !== "")
            this.listaDocumentosIntermedia = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.documentos)
        if (credito.extenciones.extencionCatalogoCreditosTres.sucursales !== "")
            this.listaSucursalesIntermedia = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.sucursales)

        this.formCreditos.get('gracia').setValue(credito.extenciones.extCatCreCuatro.diasGracia);
        this.formCreditos.get('asignaciones').setValue(credito.extenciones.extCatCreCuatro.maxAsignaciones);
        this.formCreditos.get('refinanciamientos').setValue(credito.extenciones.extCatCreCuatro.noRefinanciamientos);
        this.formCreditos.get('reprogramaciones').setValue(credito.extenciones.extCatCreCuatro.noReprogramaciones);
        this.formCreditos.get('aplicaGrupos').setValue(credito.extenciones.extCatCreCuatro.aplicaGrupos);
        this.formCreditos.get('aplicaPagoFuturo').setValue(credito.extenciones.extCatCreCuatro.pagoFuturo);
        this.formCreditos.get('aplicaPPrueba').setValue(credito.extenciones.extCatCreCuatro.aplicaTemporizador);

        let vfondo = JSON.parse(credito.extenciones.extCatCreCuatro.fondo);
        this.formCreditos.get('fondo').setValue(vfondo[0]);

        this.formCreditos.get('diasAVencido').setValue(credito.extenciones.extCatCreCuatro.diasaVencido);

        let vmoneda = JSON.parse(credito.extenciones.extCatCreCuatro.moneda);
        let monIndex = this.listaMonedas.findIndex(x => x.monedaId == vmoneda[0].moneda_id);
        this.formCreditos.get('moneda').setValue(this.listaMonedas[monIndex]);

        let vgeneros = JSON.parse(credito.extenciones.extCatCreCinco.generos);
        let listGen = [];
        for (let genItem of vgeneros) {
            let generoIndex = this.listaGeneros.find(x => x.generalesId == genItem.generales_id);
            listGen.push(generoIndex);
        }
        this.formCreditos.get('generos').setValue(listGen);

        let tasasIntervalo = JSON.parse(credito.extenciones.extCatCreCinco.rangoInteresNormal);
        this.formCreditos.get('montoTasaMaximo').setValue(tasasIntervalo[0].tasa_final);
        this.formCreditos.get('montoTasaMinimo').setValue(tasasIntervalo[0].tasa_inicial);

        let vcomisiones = JSON.parse(credito.extenciones.extCatCreCinco.comisiones);
        if (vcomisiones !== null) {
            this.listaComisionesAgregadas = [];
            for (let comisionItem of vcomisiones) {
                this.listaComisionesAgregadas.push([comisionItem.comision_cre_id,
                comisionItem.cuenta_id,
                comisionItem.descripcion_id,
                comisionItem.tipo_calculo_id,
                comisionItem.valor,
                comisionItem.tipoComision,
                comisionItem.cuenta,
                comisionItem.tipoCalculo]);
            }
        }

        this.rangoPrueba.reset();
        let vtempo = JSON.parse(credito.extenciones.extCatCreCinco.temporizador);
        if (!this.vacio(vtempo)) {
            this.rangoPrueba.get('start').setValue(vtempo[0].fecha_inicio + 'T00:00:00');
            this.rangoPrueba.get('end').setValue(vtempo[0].fecha_fin + 'T00:00:00');
        }
        /* this.listaDocumentosIntermedia.forEach(respiuesta => {
             this.selectDocumentoDeCreditoSeleccionado(respiuesta.tipodocumento_id)
             this.formCreditos.get('clienteA').setValue(respiuesta.cliente);
             this.formCreditos.get('avalA').setValue(respiuesta.aval);
 
         })*/


        if (!this.vacio(credito.extenciones.extencionCatalogoCreditosTres.documentos)) {
            let docs = JSON.parse(credito.extenciones.extencionCatalogoCreditosTres.documentos);
            this.listaDocumentosSeleccionados = docs;
        }

        this.listaSucursalesIntermedia.forEach(sucu => {
            let index = this.listaSucursales.findIndex((lista: any) => { return lista.sucursalid === sucu.sucursalid })
            if (index !== -1) {
                this.listaSucursales[index].seleccionado = true;
            }
        })

        //ERic
        this.listaSucursales.forEach(sucb => {
            if (sucb.seleccionado === true) {
                this.listaSucursalesBancos.push(sucb);
            }
        })

        this.listaSucursalesIntermedia.forEach(sucu => {
            let cta = this.listaCuentaBancaria.find(c => c.cuentaBancariaID === sucu.cuenta_bancaria_id)
            let fila = this.listaSucursalesBancos.find(item => item.sucursalid === sucu.sucursalid);
            if (fila) {
                fila.cuentaID = cta.cuentaBancariaID;
                fila.cta_descripcion = cta.descripcionCuenta
            }
        })



        this.listaGarantiasIntermedia.forEach((res: any) => {
            this.agregarGarantiasCreditoSeleccionado(res)
        })
        this.listaFrecuenciasIntermedia.forEach((res: any) => {
            let frecuenciaSeleccionada = this.listaFrecuencia.find((f) => { return f.tipoPlazoId === res.tipo_plazo_id })
            this.listaLimpiaFrecuencia.push(frecuenciaSeleccionada)
        })

        setTimeout( () =>  this.listaCuentasCamposIntermedia.forEach((res: any) => {
            let campoA = this.listaActivos.find((a) => { return a.generalesId === res.generales_id })
            this.formCreditos.get('campoActivo').setValue(campoA);
            let cuentaA = this.listaCuentasContablesActivo.find((a) => { return a.cuentaid === res.cuenta_id })

            //ERic
            /*let campoCuentaB = this.listaCuentaBancaria.find((a) => { return a.cuentaBancariaID === res.cuenta_bancaria_id })
            this.formCreditos.get('cuentabancaria').setValue(campoCuentaB);*/


            let campoMovCaja = this.listaMovCuentaCaja.find((a) => { return a.catMovimientoCajaID === res.cat_movimiento_caja_id })
            this.formCreditos.get('tipoCuenta').setValue(campoMovCaja);


            this.formCreditos.get('cuentaCampoActivo').setValue(cuentaA);
            this.agregarActivo()
            this.formCreditos.get('campoActivo').setValue('');
            this.formCreditos.get('cuentaCampoActivo').setValue('');

            let campoP = this.listaPasivos.find((a) => { return a.generalesId === res.generales_id })
            this.formCreditos.get('campoPasivo').setValue(campoP)
            let cuentaP = this.listaCuentasContablesPasivo.find((a) => { return a.cuentaid === res.cuenta_id })
            this.formCreditos.get('cuentaCampoPasivo').setValue(cuentaP)
            this.agregarPasivo()
            this.formCreditos.get('campoPasivo').setValue('')
            this.formCreditos.get('cuentaCampoPasivo').setValue('')


            let campoR = this.listaResultado.find((a) => { return a.generalesId === res.generales_id })
            this.formCreditos.get('campoResultado').setValue(campoR)
            let cuentaR = this.listaCuentasContablesResultado.find((a) => { return a.cuentaid === res.cuenta_id })
            this.formCreditos.get('cuentaCampoResultado').setValue(cuentaR)
            this.agregarResultado()
            this.formCreditos.get('campoResultado').setValue('')
            this.formCreditos.get('cuentaCampoResultado').setValue('')

            let campoO = this.listaOrden.find((a) => { return a.generalesId === res.generales_id })
            this.formCreditos.get('campoOrden').setValue(campoO)
            let cuentaO = this.listaCuentasContablesOrden.find((a) => { return a.cuentaid === res.cuenta_id })
            this.formCreditos.get('cuentaCampoOrden').setValue(cuentaO)
            this.agregarOrden()
            this.formCreditos.get('campoOrden').setValue('')
            this.formCreditos.get('cuentaCampoOrden').setValue('')


        }))
        this.blockUI.stop()

    }

    /**metodo que limpia el formulario  */
    nuevo() {
        this.editar = false
        this.allSelected = true
        this.toggleAllSelection()
        this.creditoID = 0


        this.listaLimpiaGarantias = []
        this.listaLimpiaFrecuencia = []
        this.listaActivosSeleccionados = []
        this.listaPasivosSeleccionados = []
        this.listaResultadoSeleccionados = []
        this.listaOrdenSeleccionados = []
        this.listaDocumentosSeleccionados = []
        this.listaGarantiasSeleccionados = []

        this.listaComisionesAgregadas = [];

        this.formComisiones.reset();
        this.formCreditos.reset();
        this.rangoPrueba.reset();


    }

    //metodo que valida algunos campos de rango

    /**metodo para guardar/actualizar */
    guardar(accion) {
        let datos;
        //Se valida el formulario

        if (this.formCreditos.invalid) {

            this.validateAllFormFields(this.formCreditos);
            return;
        }
        if (this.listaLimpiaFrecuencia.length <= 0) {
            this.service.showNotification('top', 'right', 3, "La frecuencia de pago es requeria.")
            return;
        }
        if (this.formCreditos.get('aplicaPPrueba').value === true) {
            if (this.rangoPrueba.invalid) {
                this.validateAllFormFields(this.rangoPrueba);
                return;
            }
        }

        let plazoMinimo = this.formCreditos.get('plazoMinimo').value
        let plazoMaximo = this.formCreditos.get('plazoMaximo').value
        if (plazoMinimo > plazoMaximo) {
            this.service.showNotification('top', 'right', 3, "El plazo mínimo no puede ser mayor al plazo máximo.")
            this.blockUI.stop()
            return;
        }

        let montoMinimo = this.formCreditos.get('montoMinimo').value
        let montoMaximo = this.formCreditos.get('montoMaximo').value
        if (Number(montoMinimo) > Number(montoMaximo)) {
            this.service.showNotification('top', 'right', 3, "El monto mínimo del crédito no puede ser mayor al monto máximo.")
            this.blockUI.stop()
            return;
        }

        let montoTasaMimino = this.formCreditos.get('montoTasaMinimo').value
        let montoTasaMaximo = this.formCreditos.get('montoTasaMaximo').value
        if (Number(montoTasaMimino) > Number(montoTasaMaximo)) {
            this.service.showNotification('top', 'right', 3, "El monto mínimo de la tasa de interes no puede ser mayor al monto máximo.")
            this.blockUI.stop()
            return;
        }

        let edadPermitidaMin = this.formCreditos.get('edadPermitidaMin').value
        let edadPermitidaMax = this.formCreditos.get('edadPermitidaMax').value
        if (edadPermitidaMin > edadPermitidaMax) {
            this.service.showNotification('top', 'right', 3, "La edad permitida mínima no puede ser mayor a la edad máxima.")
            this.blockUI.stop()
            return;
        }

        let otorgamientoCreditoMinDm = this.formCreditos.get('otorgamientoCreditoMinDm').value
        let otorgamientoCreditoManDm = this.formCreditos.get('otorgamientoCreditoManDm').value

        if (otorgamientoCreditoMinDm > otorgamientoCreditoManDm) {
            this.service.showNotification('top', 'right', 3, "Los días de otorgamiento mínimos no pueden ser mayores a los días de otorgamiento máximo.")
            this.blockUI.stop()
            return;
        }
        
        if (this.listaSucursalesBancos.length <= 0) {
            this.service.showNotification('top', 'right', 3, "Falta agregar Sucursales.");
            return;
        } else {
            for (let c of this.listaSucursalesBancos) {
                if (c.cuentaID === 0) {
                    this.service.showNotification('top', 'right', 3, "Falta agregar Cuenta Bancaría a Sucursal "+c.nombreSucursal+".");
                    return;
                }
            }
        }


        if (accion === 1) {
            this.blockUI.start('Guardando ...')
            //se guarda 

            let documentos = ""

            this.listaDocumentosSeleccionados.forEach((documentoRes: any) => {
                if (documentos === "") {
                    documentos = documentos + '{' + documentoRes.tipodocumento_id + ',' + documentoRes.expediente_id + '}';
                } else {
                    documentos = documentos + ',' + '{' + documentoRes.tipodocumento_id + ',' + documentoRes.expediente_id + '}';
                }
            })

            let documentoFinal = ""
            if (documentos === "") {
                documentoFinal = '{' + 0 + '}'
            } else {
                documentoFinal = '{' + documentos + '}'
            }

            let cadena = ""
            this.listaActivosSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'

                }
            })
            this.listaPasivosSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                }
            })
            this.listaResultadoSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                }
            })
            this.listaOrdenSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                }
            })


            if (cadena === "") {
                cadena = '{' + 0 + '}'
            }
            let cadenaFinal = '{' + cadena + '}'

            let garantiasCadena = ""
            this.listaGarantiasSeleccionados.forEach(element => {
                if (garantiasCadena === "") {

                    if (element.tantos === "")
                        element.tantos = 0
                    if (element.porcentaje === "")
                        element.porcentaje = 0
                    if (element.limiteInferior === "")
                        element.limiteInferior = 0
                    if (element.limiteSuperior === "")
                        element.limiteSuperior = 0

                    garantiasCadena =
                        '{' + element.tipoGarantia + ',' + element.aplica + ',' + element.tantos + ',' + element.porcentaje + ',' + element.limiteInferior + ',' + element.limiteSuperior + '}'

                } else {
                    if (element.tantos === "")
                        element.tantos = 0
                    if (element.porcentaje === "")
                        element.porcentaje = 0
                    if (element.limiteInferior === "")
                        element.limiteInferior = 0
                    if (element.limiteSuperior === "")
                        element.limiteSuperior = 0
                    garantiasCadena = garantiasCadena + ',' + '{' + element.tipoGarantia + ',' + element.aplica + ',' + element.tantos + ',' + element.porcentaje + ',' + element.limiteInferior + ',' + element.limiteSuperior + '}'
                }
            });
            if (garantiasCadena === "") {
                garantiasCadena = '{' + 0 + '}'
            }
            let garantiasCadenaFinal = '{' + garantiasCadena + '}'

            let FPCadena = ""
            this.listaLimpiaFrecuencia.forEach(element => {
                if (FPCadena === "") {
                    FPCadena = FPCadena + '{' + element.tipoPlazoId + '}'
                } else {
                    FPCadena = FPCadena + ',' + '{' + element.tipoPlazoId + '}'
                }
            });
            if (FPCadena === "") {
                FPCadena = '{' + 0 + '}'
            }
            let fCadenaFinal = '{' + FPCadena + '}'

            if (this.formCreditos.get('consultaSicNumero').value === "" || this.formCreditos.get('consultaSicNumero').value === null) {
                this.formCreditos.get('consultaSicNumero').setValue(0)
            }
            if (this.formCreditos.get('solicitudSobreprestamoNum').value === "" || this.formCreditos.get('solicitudSobreprestamoNum').value === null) {
                this.formCreditos.get('solicitudSobreprestamoNum').setValue(0)
            }
            if (this.formCreditos.get('edadPermitidaMin').value === "" || this.formCreditos.get('edadPermitidaMin').value === null) {
                this.formCreditos.get('edadPermitidaMin').setValue(0)
            }
            if (this.formCreditos.get('edadPermitidaMax').value === "" || this.formCreditos.get('edadPermitidaMax').value === null) {
                this.formCreditos.get('edadPermitidaMax').setValue(0)
            }
            if (this.formCreditos.get('autorizacionAutomaticaUdisNumero').value === "" || this.formCreditos.get('autorizacionAutomaticaUdisNumero').value === null) {
                this.formCreditos.get('autorizacionAutomaticaUdisNumero').setValue(0)
            }
            if (this.formCreditos.get('otorgamientoCreditoMinDm').value === "" || this.formCreditos.get('otorgamientoCreditoMinDm').value === null) {
                this.formCreditos.get('otorgamientoCreditoMinDm').setValue(0)
            }
            if (this.formCreditos.get('otorgamientoCreditoManDm').value === "" || this.formCreditos.get('otorgamientoCreditoManDm').value === null) {
                this.formCreditos.get('otorgamientoCreditoManDm').setValue(0)
            }


            let sucursalesCadena = ""
            this.listaSucursalesBancos.forEach(element => {
                if (sucursalesCadena === "") {
                    sucursalesCadena = '{' + element.sucursalid + ',' + element.cuentaID + '}';

                } else {
                    sucursalesCadena = sucursalesCadena + ',' + '{' + element.sucursalid + ',' + element.cuentaID + '}';
                }
            });
            /* Eric
            this.listaSucursales.forEach(element => {
                if (sucursalesCadena === "") {
                    if (element.seleccionado === true) {
                        sucursalesCadena = '{' + element.sucursalid + '}';
                    }
                } else {
                    if (element.seleccionado === true) {
                        sucursalesCadena = sucursalesCadena + ',' + '{' + element.sucursalid + '}';
                    }
                }
            });*/

            let sucursalesFinalCadena = ""
            if (sucursalesCadena === "") {
                sucursalesFinalCadena = '{' + 0 + '}'
            } else {
                sucursalesFinalCadena = '{' + sucursalesCadena + '}'
            }

            let arrayGeneros = [];
            for (let i of this.formCreditos.get('generos').value) {
                arrayGeneros.push(i.generalesId)
            }
            datos = {
                "detCatCre": {
                    "creditoId": 0,
                    "cveCredito": this.formCreditos.get('cveCredito').value,
                    "estatus": this.formCreditos.get('estatus').value,
                    "descripcion": this.formCreditos.get('descripcion').value,
                    "tasaInteresMoratorio": this.formCreditos.get('tasaInteresMoratorio').value,
                    "aplicaIVA": this.formCreditos.get('aplicaIVA').value,
                    "finalidadId": this.formCreditos.get('finalidadId').value,
                    "mercadoId": this.formCreditos.get('mercadoId').value,
                    "calculoInteresID": this.formCreditos.get('calculoInteresID').value,
                    "extenciones": {
                        "extencionCatalogoCreditos": {
                            "creditoEmpleadoAplica": this.formCreditos.get('creditoEmpleadoAplica').value,
                            "tipoAmortizacionId": this.formCreditos.get('tipoAmortizacionId').value,
                            "condicionPagoId": this.formCreditos.get('condicionPagoId').value,
                            "plazoMaximo": this.formCreditos.get('plazoMaximo').value,
                            "plazoMinimo": this.formCreditos.get('plazoMinimo').value,
                            "montoMaximo": this.formCreditos.get('montoMaximo').value,
                            "montoMinimo": this.formCreditos.get('montoMinimo').value,

                            "consultaSicNumero": this.formCreditos.get('consultaSicNumero').value,
                            "consultaSicAplica": this.formCreditos.get('consultaSicAplica').value,
                            "solicitudSobreprestamoAplica": this.formCreditos.get('solicitudSobreprestamoAplica').value,
                        },
                        "extencionCatalogoCreditosDos": {
                            "solicitudSobreprestamoNum": this.formCreditos.get('solicitudSobreprestamoNum').value,
                            "edadPermitidaAplica": this.formCreditos.get('edadPermitidaAplica').value,
                            "edadPermitidaMin": this.formCreditos.get('edadPermitidaMin').value,
                            "edadPermitidaMax": this.formCreditos.get('edadPermitidaMax').value,
                            "autorizacionAutomaticaUdisAplica": this.formCreditos.get('autorizacionAutomaticaUdisAplica').value,
                            "autorizacionAutomaticaUdisNumero": this.formCreditos.get('autorizacionAutomaticaUdisNumero').value,
                        },
                        "extencionCatalogoCreditosTres": {
                            "otorgamientoCreditoAplica": this.formCreditos.get('otorgamientoCreditoAplica').value,
                            "otorgamientoCreditoMinDm": this.formCreditos.get('otorgamientoCreditoMinDm').value,
                            "otorgamientoCreditoManDm": this.formCreditos.get('otorgamientoCreditoManDm').value,
                            "calificacionCredito": this.formCreditos.get('calificacionCredito').value,
                            "antiguedadRequerida": this.formCreditos.get('antiguedadRequerida').value,
                            "cuentasCampos": cadenaFinal,
                            "garantias": garantiasCadenaFinal,
                            "frecuenciaPagos": fCadenaFinal,
                            "documentos": documentoFinal,
                            "sucursales": sucursalesFinalCadena,

                        },
                        "extCatCreCuatro": {},
                        "extCatCreCinco": {}
                    }

                },
                "extDetCatCre": [
                    this.formCreditos.get('gracia').value,
                    this.formCreditos.get('aplicaPagoFuturo').value,
                    this.formCreditos.get('asignaciones').value,
                    this.formCreditos.get('refinanciamientos').value,
                    this.formCreditos.get('reprogramaciones').value,
                    this.formCreditos.get('aplicaGrupos').value,
                    this.formCreditos.get('aplicaPPrueba').value,
                    this.formCreditos.get('moneda').value.monedaId,
                    this.formCreditos.get('fondo').value.tipofondoid,
                    this.formCreditos.get('diasAVencido').value
                ],
                "tasas": [
                    this.formCreditos.get('montoTasaMinimo').value,
                    this.formCreditos.get('montoTasaMaximo').value,
                    0,
                    //this.formCreditos.get('cuentabancaria').value.cuentaBancariaID,
                    this.formCreditos.get('tipoCuenta').value.catMovimientoCajaID

                ],
                "temporizador": [
                    this.rangoPrueba.get('start').value,
                    this.rangoPrueba.get('end').value
                ],
                "generos": arrayGeneros,
                "comisiones": this.listaComisionesAgregadas,
                "accion": accion

            }

        } else {
            this.blockUI.start('Editando ...')
            // se actualiza
            let documentos = ""

            this.listaDocumentosSeleccionados.forEach((documentoRes: any) => {
                if (documentos === "") {
                    documentos = documentos + '{' + documentoRes.tipodocumento_id + ',' + documentoRes.expediente_id + '}';
                } else {
                    documentos = documentos + ',' + '{' + documentoRes.tipodocumento_id + ',' + documentoRes.expediente_id + '}';
                }
            })
            let documentoFinal = ""
            if (documentos === "") {
                documentoFinal = '{' + 0 + '}'
            } else {
                documentoFinal = '{' + documentos + '}'
            }
            let cadena = ""
            this.listaActivosSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'

                }
            })
            this.listaPasivosSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                }
            })
            this.listaResultadoSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                }
            })
            this.listaOrdenSeleccionados.forEach((res: any) => {
                if (cadena === "") {
                    cadena = cadena + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                } else {
                    cadena = cadena + ',' + '{' + res.cuentaC.cuentaid + ',' + res.campoC.generalesId + '}'
                }
            })
            if (cadena === "") {
                cadena = '{' + 0 + '}'
            }
            let cadenaFinal = '{' + cadena + '}'



            let garantiasCadena = ""
            this.listaGarantiasSeleccionados.forEach(element => {
                if (garantiasCadena === "") {

                    if (element.tantos === "")
                        element.tantos = 0
                    if (element.porcentaje === "")
                        element.porcentaje = 0
                    if (element.limiteInferior === "")
                        element.limiteInferior = 0
                    if (element.limiteSuperior === "")
                        element.limiteSuperior = 0

                    garantiasCadena =
                        '{' + element.tipoGarantia + ',' + element.aplica + ',' + element.tantos + ',' + element.porcentaje + ',' + element.limiteInferior + ',' + element.limiteSuperior + '}'

                } else {
                    if (element.tantos === "")
                        element.tantos = 0
                    if (element.porcentaje === "")
                        element.porcentaje = 0
                    if (element.limiteInferior === "")
                        element.limiteInferior = 0
                    if (element.limiteSuperior === "")
                        element.limiteSuperior = 0
                    garantiasCadena = garantiasCadena + ',' + '{' + element.tipoGarantia + ',' + element.aplica + ',' + element.tantos + ',' + element.porcentaje + ',' + element.limiteInferior + ',' + element.limiteSuperior + '}'
                }
            });
            if (garantiasCadena === "") {
                garantiasCadena = '{' + 0 + '}'
            }
            let garantiasCadenaFinal = '{' + garantiasCadena + '}'

            let FPCadena = ""
            this.listaLimpiaFrecuencia.forEach(element => {
                if (FPCadena === "") {
                    FPCadena = FPCadena + '{' + element.tipoPlazoId + '}'
                } else {
                    FPCadena = FPCadena + ',' + '{' + element.tipoPlazoId + '}'
                }
            });
            if (FPCadena === "") {
                FPCadena = '{' + 0 + '}'
            }
            let fCadenaFinal = '{' + FPCadena + '}'

            if (this.formCreditos.get('consultaSicNumero').value === "" || this.formCreditos.get('consultaSicNumero').value === null) {
                this.formCreditos.get('consultaSicNumero').setValue(0)
            }
            if (this.formCreditos.get('solicitudSobreprestamoNum').value === "" || this.formCreditos.get('solicitudSobreprestamoNum').value === null) {
                this.formCreditos.get('solicitudSobreprestamoNum').setValue(0)
            }
            if (this.formCreditos.get('edadPermitidaMin').value === "" || this.formCreditos.get('edadPermitidaMin').value === null) {
                this.formCreditos.get('edadPermitidaMin').setValue(0)
            }
            if (this.formCreditos.get('edadPermitidaMax').value === "" || this.formCreditos.get('edadPermitidaMax').value === null) {
                this.formCreditos.get('edadPermitidaMax').setValue(0)
            }
            if (this.formCreditos.get('autorizacionAutomaticaUdisNumero').value === "" || this.formCreditos.get('autorizacionAutomaticaUdisNumero').value === null) {
                this.formCreditos.get('autorizacionAutomaticaUdisNumero').setValue(0)
            }
            if (this.formCreditos.get('otorgamientoCreditoMinDm').value === "" || this.formCreditos.get('otorgamientoCreditoMinDm').value === null) {
                this.formCreditos.get('otorgamientoCreditoMinDm').setValue(0)
            }
            if (this.formCreditos.get('otorgamientoCreditoManDm').value === "" || this.formCreditos.get('otorgamientoCreditoManDm').value === null) {
                this.formCreditos.get('otorgamientoCreditoManDm').setValue(0)
            }

            let sucursalesCadena = ""
            this.listaSucursalesBancos.forEach(element => {
                if (sucursalesCadena === "") {
                    sucursalesCadena = '{' + element.sucursalid + ',' + element.cuentaID + '}';

                } else {
                    sucursalesCadena = sucursalesCadena + ',' + '{' + element.sucursalid + ',' + element.cuentaID + '}';
                }
            });
            /* Eric
            this.listaSucursales.forEach(element => {
                if (sucursalesCadena === "") {
                    if (element.seleccionado === true) {
                        sucursalesCadena = '{' + element.sucursalid + '}';
                    }
                } else {
                    if (element.seleccionado === true) {
                        sucursalesCadena = sucursalesCadena + ',' + '{' + element.sucursalid + '}';
                    }
                }
            });*/
            let sucursalesFinalCadena = ""
            if (sucursalesCadena === "") {
                sucursalesFinalCadena = '{' + 0 + '}'
            } else {
                sucursalesFinalCadena = '{' + sucursalesCadena + '}'
            }

            let arrayGeneros = [];
            for (let i of this.formCreditos.get('generos').value) {
                arrayGeneros.push(i.generalesId)
            }

            datos = {
                "detCatCre": {
                    "creditoId": this.creditoID,
                    "cveCredito": this.formCreditos.get('cveCredito').value,
                    "estatus": this.formCreditos.get('estatus').value,
                    "descripcion": this.formCreditos.get('descripcion').value,
                    //"tasaInteresNormal": this.formCreditos.get('tasaInteresNormal').value,
                    "tasaInteresMoratorio": this.formCreditos.get('tasaInteresMoratorio').value,
                    "aplicaIVA": this.formCreditos.get('aplicaIVA').value,
                    "finalidadId": this.formCreditos.get('finalidadId').value,
                    "mercadoId": this.formCreditos.get('mercadoId').value,
                    "calculoInteresID": this.formCreditos.get('calculoInteresID').value,
                    "extenciones": {
                        "extencionCatalogoCreditos": {
                            "creditoEmpleadoAplica": this.formCreditos.get('creditoEmpleadoAplica').value,
                            "tipoAmortizacionId": this.formCreditos.get('tipoAmortizacionId').value,
                            "condicionPagoId": this.formCreditos.get('condicionPagoId').value,
                            "plazoMaximo": this.formCreditos.get('plazoMaximo').value,
                            "plazoMinimo": this.formCreditos.get('plazoMinimo').value,
                            "montoMaximo": this.formCreditos.get('montoMaximo').value,
                            "montoMinimo": this.formCreditos.get('montoMinimo').value,
                            "consultaSicNumero": this.formCreditos.get('consultaSicNumero').value,
                            "consultaSicAplica": this.formCreditos.get('consultaSicAplica').value,
                            "solicitudSobreprestamoAplica": this.formCreditos.get('solicitudSobreprestamoAplica').value,
                        },
                        "extencionCatalogoCreditosDos": {
                            "solicitudSobreprestamoNum": this.formCreditos.get('solicitudSobreprestamoNum').value,
                            "edadPermitidaAplica": this.formCreditos.get('edadPermitidaAplica').value,
                            "edadPermitidaMin": this.formCreditos.get('edadPermitidaMin').value,
                            "edadPermitidaMax": this.formCreditos.get('edadPermitidaMax').value,
                            "autorizacionAutomaticaUdisAplica": this.formCreditos.get('autorizacionAutomaticaUdisAplica').value,
                            "autorizacionAutomaticaUdisNumero": this.formCreditos.get('autorizacionAutomaticaUdisNumero').value,
                        },
                        "extencionCatalogoCreditosTres": {
                            "otorgamientoCreditoAplica": this.formCreditos.get('otorgamientoCreditoAplica').value,
                            "otorgamientoCreditoMinDm": this.formCreditos.get('otorgamientoCreditoMinDm').value,
                            "otorgamientoCreditoManDm": this.formCreditos.get('otorgamientoCreditoManDm').value,
                            "calificacionCredito": this.formCreditos.get('calificacionCredito').value,
                            "antiguedadRequerida": this.formCreditos.get('antiguedadRequerida').value,
                            "cuentasCampos": cadenaFinal,
                            "garantias": garantiasCadenaFinal,
                            "frecuenciaPagos": fCadenaFinal,
                            "documentos": documentoFinal,
                            "sucursales": sucursalesFinalCadena,
                        },
                        "extCatCreCuatro": {},
                        "extCatCreCinco": {}
                    }
                },
                "extDetCatCre": [
                    this.formCreditos.get('gracia').value,
                    this.formCreditos.get('aplicaPagoFuturo').value,
                    this.formCreditos.get('asignaciones').value,
                    this.formCreditos.get('refinanciamientos').value,
                    this.formCreditos.get('reprogramaciones').value,
                    this.formCreditos.get('aplicaGrupos').value,
                    this.formCreditos.get('aplicaPPrueba').value,
                    this.formCreditos.get('moneda').value.monedaId,
                    this.formCreditos.get('fondo').value.tipofondoid,
                    this.formCreditos.get('diasAVencido').value
                ],
                "tasas": [
                    this.formCreditos.get('montoTasaMinimo').value,
                    this.formCreditos.get('montoTasaMaximo').value,
                    0,
                    //this.formCreditos.get('cuentabancaria').value.cuentaBancariaID,
                    this.formCreditos.get('tipoCuenta').value.catMovimientoCajaID
                ],
                "temporizador": [
                    this.rangoPrueba.get('start').value,
                    this.rangoPrueba.get('end').value
                ],
                "generos": arrayGeneros,
                "comisiones": this.listaComisionesAgregadas,
                "accion": accion
            }
        }

        this.service.registrar(datos, 'crudCreditos')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (accion !== 2) {
                        this.formCreditos.reset();
                        this.nuevo()
                    }
                    this.spslistaCreditos()
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            })
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
 * Muestra la descripcion de la finalidad 
 * @param option --finalidad seleccionada
 * @returns -- finalidad
 */
    displayFn(option: any): any {
        return option ? option.descripcion : undefined;
    }




    /***
   * Filter para frecuencia
   */
    private _filterFrecuencia(value: any): any[] {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaFrecuencia.filter(frecuencia => frecuencia.descripcion.toLowerCase().includes(filterValue));
    }


    /**
     * remove frecuencia pago
     */
    removeFPago(fruit: string): void {
        const index = this.listaLimpiaFrecuencia.indexOf(fruit);

        if (index >= 0) {
            this.listaLimpiaFrecuencia.splice(index, 1);
        }
    }

    /**
     * Metodo que se ejecuta al seleccionar una frecuencia de pago
     * @param event 
     */
    selectedF(event: MatAutocompleteSelectedEvent): void {

        const index = this.listaLimpiaFrecuencia.indexOf(event.option.value);


        if (index < 0) {
            this.listaLimpiaFrecuencia.push(event.option.value);
            this.frecuenciaInput.nativeElement.value = '';
            this.frecuenciapagos.setValue(null);
        } else {
            this.frecuenciaInput.nativeElement.value = '';
            this.frecuenciapagos.setValue(null);
        }

    }

    //Eric metodo para listar las sucursales
    spsListarSucursales() {
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data
            this.listaSucursales.forEach(data => {
                data.seleccionado = false;
                data.cuentaID = 0;
                data.cta_descripcion = ''
            })
        })
    }

    //Eric metodo para sucursales seleccionadas 
    sucursalSeleccionada(event: MatSelectionListChange) {
        if (event.options[0].value !== 0) {
            this.listaSucursales.forEach(lista => {

                if (lista.sucursalid === event.options[0].value.sucursalid) {
                    lista.seleccionado = event.options[0].selected;
                    if (event.options[0].selected === true) {
                        this.listaSucursalesBancos.push(lista);
                    } else {
                        let index = this.listaSucursalesBancos.findIndex(s => s.sucursalid === lista.sucursalid);

                        this.listaSucursalesBancos.splice(index, 1);

                        let suc = this.listaSucursales.find(s => s.sucursalid === lista.sucursalid);
                        if (suc) {
                            suc.cuentaID = 0;
                            suc.cta_descripcion = '';
                        }
                    }
                }
                this.dataSourceCuentas = new MatTableDataSource(this.listaSucursalesBancos);
                setTimeout(() => this.dataSourceCuentas.paginator = this.paginatorCuentas);
                this.dataSourceCuentas.sort = this.sortCuentas;
            })
        } else {
            event.options[0].selected = !this.allSelected
        }

    }

    //Eric 
    toggleAllSelection() {
        this.allSelected = !this.allSelected;
        if (this.allSelected) {
            this.listaSucursales.forEach(lista => {
                lista.seleccionado = true;
            });
            this.listaSucursalesBancos = this.listaSucursales;
            this.dataSourceCuentas = new MatTableDataSource(this.listaSucursalesBancos);
            setTimeout(() => this.dataSourceCuentas.paginator = this.paginatorCuentas);
            this.dataSourceCuentas.sort = this.sortCuentas;
        } else {
            this.listaSucursales.forEach(lista => {
                lista.seleccionado = false;
            });
            this.listaSucursalesBancos = [];
            this.dataSourceCuentas = new MatTableDataSource(this.listaSucursalesBancos);
            setTimeout(() => this.dataSourceCuentas.paginator = this.paginatorCuentas);
            this.dataSourceCuentas.sort = this.sortCuentas;
        }

    }

    /**
     * Metodo que asigana cuenta a sucursal
     * @param option - Opciona a setear
     * @param sucursal - Sucursal a asignar
     */
    setCuentaBancaria(option: any, sucursal: any) {

        let fila = this.listaSucursalesBancos.find(item => item.sucursalid === sucursal.sucursalid);

        if (fila) {
            fila.cuentaID = option.cuentaBancariaID;
            fila.cta_descripcion = option.descripcionCuenta
        }

        this.service.showNotification('top', 'right', 2, 'La cuenta bancaria se agrego correctamentea a la sucursal ' + sucursal.nombreSucursal + '.');



    }


    mostrarGarantia(seleccionado) {
        this.formCreditos.get('garantiasId').setValue(seleccionado.tipoGarantia)
        this.formCreditos.get('aplicageneralesId').setValue(seleccionado.aplica)
        this.formCreditos.get('tantos').setValue(seleccionado.tantos)
        this.formCreditos.get('porcentaje').setValue(seleccionado.porcentaje)
        this.formCreditos.get('limiteInferior').setValue(seleccionado.limiteInferior)
        this.formCreditos.get('limiteSuperior').setValue(seleccionado.limiteSuperior)
    }



    activarDesactivarCredito(event) {

        let encabezado
        let body
        if (event.checked === true) {
            encabezado = "Catálogo Créditos";
            body = '¿Esta seguro de dar de alta el Crédito?';
        } else {
            encabezado = "Catálogo Créditos";
            body = '¿Esta seguro de dar de baja el Crédito?';
        }

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 1) {//aceptar y va a Activar
                this.formCreditos.get('estatus').setValue(!event.checked);
            } else {
                this.formCreditos.get('estatus').setValue(event.checked);

            }
        });

    }


    /**
   * Metodo para filtrar creditos
   * 
   */

    buscarCredito() {
        this.result = this.searcher.search(this.searchText);
        this.listaCreditos = this.result;
    }


    /**
     * Metodo que agrega las comisiones a una lista
     */
    agregarComision() {
        let comisionId = 0;

        if (this.formComisiones.invalid) {
            this.validateAllFormFields(this.formComisiones);
            return;

        }

        let index = this.listaComisionesAgregadas.findIndex(res => res[2] === this.formComisiones.get('tipoComision').value.generalesId)

        if (index !== -1) {
            comisionId = this.listaComisionesAgregadas[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo la comisión.');
            this.listaComisionesAgregadas.splice(index, 1);
        }

        this.listaComisionesAgregadas.push([comisionId,
            this.formComisiones.get('cuenta').value.cuentaid,
            this.formComisiones.get('tipoComision').value.generalesId,
            this.formComisiones.get('tipoCalculo').value.generalesId,
            this.formComisiones.get('valor').value,
            this.formComisiones.get('tipoComision').value.descripcion,
            this.formComisiones.get('cuenta').value.nombre,
            this.formComisiones.get('tipoCalculo').value.descripcion]);

        this.formComisiones.reset();
    }

    /**
     * Metodo que elimina comisiones
     * @param detalleComision - comision a eliminar
     */
    eliminarComision(comision) {
        let index = this.listaComisionesAgregadas.findIndex(res => res[2] === comision[2])
        this.listaComisionesAgregadas.splice(index, 1)
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

}