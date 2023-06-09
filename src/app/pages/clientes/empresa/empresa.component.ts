import { Component, ElementRef, Inject, OnInit, Pipe, PipeTransform, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { GoogleMapsModule } from '@angular/google-maps';
import { environment } from '../../../../environments/environment';
import { MatDialog } from "@angular/material/dialog";
//import { AdminMapaComponent } from "./modal-mapa/admin-mapa.component";
import FuzzySearch from 'fuzzy-search';

@Component({
    selector: 'empresa',
    moduleId: module.id,
    templateUrl: 'empresa.component.html'
})


/**
 * @autor: Eduardo Romero Haro
 * @version: 1.0.0
 * @fecha: 
 * @descripcion: Componente para la gestion de Empresa
 */
export class EmpresaComponent implements OnInit {

    //Declaracion de variables
    titulo: string;
    accion: number;
    empresaId: number = 0;
    detalleEmpresaId: number = 0;
    domicilioID: number = 0;
    selectedId: number;
    @BlockUI() blockUI: NgBlockUI;
    formEmpresa: UntypedFormGroup;
    listaEmpresa: any[];
    listaAgenda = [];
    listaDomicilio = [];
    listaAgendaSeleccionadas = [];
    listaDomicilioSeleccionados = [];
    //isSlideCheckedEstatus: boolean = false;
    listaDomicilioArreglo = [];
    dataSourceDomicilio: MatTableDataSource<any>;
    listaMostrar = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    opcion: number = 0;
    panelOpenState = false;
    accionCrud: number = 1;
    mapa: GoogleMapsModule;
    vLongitudMarket: any;
    vLatitudMarket: any;
    public variables2: any = [];
    vRazonSocial: any;
    vTipoEmpresa: boolean = false;
    //filtrar empresas
    searcher: any;
    public searchText: string;
    public result: [];
    tipoEmpresa = new UntypedFormControl('');
    /**
     * VARIABLES DE DOMICILIO
     */
    /** Controles Nacionalidad**/
    selectedIdNacionalidad: number = 0;
    listaNacionalidad: any[];
    opcionesNacionalidad: Observable<string[]>;
    nacionalidadId: number;
    /** Fin Controles Nacionalidad */

    /** Controles Tiempo Arraigo **/
    arraigoGeneralId: any;
    listaTiempoArraigo: any;
    tiempoArraigoControl = new UntypedFormControl('')
    /** Fin Controles Tiempo Arraigo **/

    /** Controles Numero Domicilio **/
    numeroDomicilioGeneralId: any;
    listaNumeroDomicilio: any;
    numeroDomicilioControl = new UntypedFormControl('')
    /** Fin Controles Numero Domicilio **/

    /** Controles Colonia **/
    selectedIdColonia = 0;
    opcionesColonias: Observable<string[]>;
    listaColonias: any[];
    /** Fin Controles Colonia **/

    /** Controles Estados **/
    opcionesEstado: Observable<string[]>;
    listaEstados: any;
    selectedIdEstado: number = 0;
    /** Fin Controles Estados **/

    /** Controles Ciudad **/
    opcionesCiudades: Observable<string[]>;
    selectedIdCiudad: number = 0;
    listaCiudadEstado: any;
    ciudadID: number;
    /** Fin Control Ciudad **/

    /** Controles Localidad **/
    opcionesLocalidades: Observable<string[]>;
    selectedIdLocalidad: number = 0;
    listaLocalidad: any;
    /** Fin Control Localidad **/

    /** 
     * VARIABLES DE EMPRESA
    */
    /** Controles Tipo Empresa **/
    tipoEmpresaGeneralId: any;
    listaTipoEmpresa: any=[];
    tipoEmpresaControl = new UntypedFormControl('',Validators.required)
    /** Fin Controles Tipo Empresa **/

    /** Controles Tamano Empresa **/
    tamanioEmpresaGeneralId: any;
    listaTamanioEmpresa: any;
    tamanioEmpresaControl = new UntypedFormControl({ value: '' },[Validators.required])
    /** Fin Controles Tamano Empresa **/

    /** Controles Giro Empresa **/
    giroEmpresaGeneralId: any;
    listaGiroEmpresa: any;
    giroEmpresaControl = new UntypedFormControl({ value: ''},[Validators.required])
    /** Fin Controles Giro Empresa **/

    numeroAgendaControl = new UntypedFormControl('')


    dataSourceMovimientoCajas: MatTableDataSource<any>;
    showEmpresa: boolean = false;


    //Variables Chips formas de pago y tipos socios
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    @ViewChild('tipoSociosInput') tipoSociosInput: ElementRef<HTMLInputElement>;
    @ViewChild('formaPagosInput') formaPagosInput: ElementRef<HTMLInputElement>;




    //Botones boolean
    /*: boolean = true;
    mostrarEditar: boolean = false;*/


    /**
     * Constructor de la clase MovimientosCajaComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog, private fomrBuilder: UntypedFormBuilder) {



        this.formEmpresa = this.fomrBuilder.group({

            //Validators Empresa
            clave: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            razonSocial: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            rfc: new UntypedFormControl('', [Validators.required, Validators.maxLength(13), Validators.pattern('[A-Z,Ñ,&]{3,4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z,0-9]?[A-Z,0-9]?[0-9,A-Z]')]),
            representante: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            nombreComercial: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            estatus: new UntypedFormControl(true, [Validators.required]),

            //Validators Detalle Empresa
            tipoEmpresa: this.tipoEmpresaControl,
            cif: new UntypedFormControl({ value: ''}, [Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('[0-9]*')]),
            nif: new UntypedFormControl({ value: ''}, [Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('[0-9]*')]),
            numeroEmpleados: new UntypedFormControl({ value: '' }, [Validators.required, Validators.minLength(1), Validators.pattern('[0-9]*')]),
            tamanioEmpresa: this.tamanioEmpresaControl,
            giroEmpresa: this.giroEmpresaControl,
            capitalAportado: new UntypedFormControl({ value: ''}, [Validators.required, Validators.minLength(1), Validators.pattern('[0-9]*')]),



            //Validators domicilio
            calle: new UntypedFormControl('', [Validators.maxLength(150)]),
            numeroExterior: new UntypedFormControl('', [Validators.maxLength(20)]),
            estadoH: new UntypedFormControl(''),
            numeroInterior: new UntypedFormControl('', [Validators.maxLength(20)]),
            entreCalle1: new UntypedFormControl('', [Validators.maxLength(150)]),
            entreCalle2: new UntypedFormControl('', [Validators.maxLength(150)]),
            referencia: new UntypedFormControl('', [Validators.maxLength(250)]),
            latitud: new UntypedFormControl('', [Validators.maxLength(13)]),
            longitud: new UntypedFormControl('', [Validators.maxLength(13)]),
            resExtranjera: new UntypedFormControl(false),
            tiempoArraigo: this.tiempoArraigoControl,
            estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            ciudad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            localidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            catColonia: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            catNacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            numeroDomicilio: this.numeroDomicilioControl,
            codigoPostal: new UntypedFormControl(''),

            //Validaciones Domicilio
            correoElectronico: new UntypedFormControl('', [Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9!#$%&'_+-]([\.]?[a-zA-Z0-9!#$%&'_+-])+@[a-zA-Z0-9]([^@&%$\/()=?¿!.,:;]|\d)+[a-zA-Z0-9][\.][a-zA-Z]{2,4}([\.][a-zA-Z]{2})?")]),
            telefono: new UntypedFormControl('', [Validators.maxLength(10), Validators.minLength(10), Validators.pattern('[0-9]*')]),
            numeroAgenda: this.numeroAgendaControl,

        });

    }

    center: google.maps.LatLngLiteral = { lat: 21.159556, lng: -100.932345 };
    zoom = 4;
    markerOptions: google.maps.MarkerOptions = { draggable: true };
    markerPositions: google.maps.LatLngLiteral[] = [];


    ngOnInit() {
        this.nuevaEmpresa();
        this.spsTiempoArraigo();
        this.spsTipoEmpresa();
        this.spsTamanioEmpresa();
        this.spsGiroEmpresa();
        this.spsEstados();
        this.spsNacionalidad();
        this.spsEmpresas();
        this.spsNumeroDomicilio();

    }

    /**
     * Metodo para editar una emrpresa
     */
    editarEmpresa(): void {
        if (this.accion === 2) {
            this.blockUI.start('Editando ...');
            this.accionCrud = 2;
        } else {
            this.blockUI.start('Agregando ...');
            this.accionCrud = 1;
            this.empresaId = 0;
            this.detalleEmpresaId = 0;
        }
        if(this.formEmpresa.invalid){
            this.validateAllFormFields(this.formEmpresa);
            this.service.showNotification('top', 'right', 3, "Completa la información de la empresa.");
            this.blockUI.stop();
            return;
        }
        if(this.listaDomicilioSeleccionados.length<=0){
                this.service.showNotification('top', 'right', 3, "Debes agregar una domicilio.");
                this.blockUI.stop();
                return; 
            }
            if(this.listaAgendaSeleccionadas.length<=0){
                this.service.showNotification('top', 'right', 3, "Agrega un contacto.");
                this.blockUI.stop();
                return; 
            }
        const data = {
            "empresaId": this.empresaId,
            "clave": this.formEmpresa.get('clave').value,
            "razonSocial": this.formEmpresa.get('razonSocial').value,
            "rfc": this.formEmpresa.get('rfc').value,
            "representante": this.formEmpresa.get('representante').value,
            "nombreComercial": this.formEmpresa.get('nombreComercial').value,
            "estatus": this.formEmpresa.get('estatus').value,
            "catGeneralTipoEmpresa": {
                "generalesId": this.formEmpresa.get('tipoEmpresa').value.generalesId
            },
            "detalleEmpresa": {
                "detalleEmpresaId": this.detalleEmpresaId,  //data.detalleEmpresa.detalleEmpresaId,
                "catEmpresa": {
                    "empresaId": this.empresaId,
                },
                "cif": this.formEmpresa.get('cif').value == null ? 0 : this.formEmpresa.get('cif').value,
                "nif": this.formEmpresa.get('nif').value == null ? 0 : this.formEmpresa.get('nif').value,
                "numeroEmpleados": this.formEmpresa.get('numeroEmpleados').value,
                "catGeneralTamEmpresa": {
                    "generalesId": this.formEmpresa.get('tamanioEmpresa').value
                },
                "catGeneralGiroEmpresa": {
                    "generalesId": this.formEmpresa.get('giroEmpresa').value
                },
                "capitalAportado": this.formEmpresa.get('capitalAportado').value,
            },
            "matrizDomicilios": this.listaDomicilioSeleccionados,
            "matrizAgendas": this.listaAgendaSeleccionadas
        };
        console.log(data)

        /**
        * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
        * de acuerdo al tipo de accion al que pertenezca.
        */

        this.service.registrarBYID(data, this.accionCrud, 'crudEmpresa').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.detalleEmpresaId = 0;
                    this.empresaId = 0;
                    this.vRazonSocial = "";
                    this.accion = 1;
                    this.listaAgenda = [];
                    this.listaDomicilio = [];
                    this.listaAgendaSeleccionadas = [];
                    this.listaDomicilioSeleccionados = [];
                    this.formEmpresa.reset();
                    this.spsEmpresas();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.message)
            }
        )
    }


    /**
    * Filtrado de  Empresas por clave
    */
    spsEmpresaByCve(elemento: any) {
        this.accion = 2;
        this.listaAgendaSeleccionadas = [];
        this.listaDomicilioSeleccionados = [];
        this.showEmpresa = true;
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(elemento, 'listaEmpresaById').subscribe(
            data => {
                console.log(data);
                this.blockUI.stop();
                this.empresaId = data[0].empresaId;
                //Datos Empresa
                this.formEmpresa.get('clave').setValue(data[0]?.clave);
                this.formEmpresa.get('razonSocial').setValue(data[0]?.razonSocial.trim());
                this.formEmpresa.get('rfc').setValue(data[0]?.rfc.trim());
                this.formEmpresa.get('representante').setValue(data[0]?.representante.trim());
                this.formEmpresa.get('nombreComercial').setValue(data[0]?.nombreComercial.trim());
                this.formEmpresa.get('estatus').setValue(data[0]?.estatus);
                this.vRazonSocial = data[0].razonSocial;

                //Datos Detalle Empresa generalesId
                let tipoEm = this.listaTipoEmpresa.find(t => t.generalesId === data[0].catGeneralTipoEmpresa.generalesId);
                this.formEmpresa.get('tipoEmpresa').setValue(tipoEm);
                this.formEmpresa.get('cif').setValue(data[0]?.detalleEmpresa.cif);
                this.formEmpresa.get('nif').setValue(data[0]?.detalleEmpresa.nif);
                this.formEmpresa.get('numeroEmpleados').setValue(data[0]?.detalleEmpresa.numeroEmpleados);
                this.formEmpresa.get('tamanioEmpresa').setValue(data[0]?.detalleEmpresa.catGeneralTamEmpresa.generalesId);
                this.formEmpresa.get('giroEmpresa').setValue(data[0]?.detalleEmpresa.catGeneralGiroEmpresa.generalesId);
                this.formEmpresa.get('capitalAportado').setValue(data[0]?.detalleEmpresa.capitalAportado);

                //Validación campos domicilio
                this.listaDomicilio = JSON.parse(data[0].domicilios);
                if (!this.vacio(this.listaDomicilio)) {
                    // Recorremos la lista identificaciones para formar la matriz y guardarla en listaDomiciliosSeleccionados
                    this.listaDomicilio.forEach(element => {
                        let objeto = [
                            element.nacionalidad_id,    // 0
                            element.nacionalidad,       // 1
                            element.estado_id,          // 2
                            element.nombre_estado,      // 3
                            element.ciudad_id,          // 4
                            element.ciudad,             // 5
                            element.localidad_id,       // 6
                            element.localidad,          // 7
                            element.colonia_id,         // 8
                            element.nombre_colonia,     // 9
                            element.codigo_postal,      // 10
                            element.calle,              // 11
                            element.numero_exterior,    // 12
                            element.numero_interior,    // 13
                            element.entre_calle_1,      // 14
                            element.entre_calle_2,      // 15
                            element.referencia,         // 16
                            element.res_extrajera,      // 17
                            element.latitud,            // 18
                            element.longitud,           // 19
                            element.tiempo_arraigoid,   // 20
                            element.tiempoArraigo,      // 21
                            element.numeroDomicilioID,  // 22
                            element.numDomicilio,       // 23
                            element.domicilio_id        // 24
                        ];
                        this.listaDomicilioSeleccionados.push(objeto);
                    });
                }

                //Datos agendas
                this.listaAgenda = JSON.parse(data[0].agendas);
                if (!this.vacio(this.listaAgenda)) {
                    // Recorremos la lista identificaciones para formar la matriz y guardarla en listaAgendaSeleccionadas
                    this.listaAgenda.forEach(element => {
                        let objeto = [
                            element.agendaId,       // 0
                            element.telefono,       // 1
                            element.correo,         // 2
                            element.tipoContactoId, // 3
                            element.tipoContacto    // 4
                        ];
                        this.listaAgendaSeleccionadas.push(objeto);
                    });
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * Carga todos los combos y resetea el form
     */
    nuevaEmpresa() {
        this.formEmpresa.reset();
        this.listaAgendaSeleccionadas = [];
        this.listaDomicilioSeleccionados = [];
        this.empresaId = 0;
        this.tipoEmpresa.setValue('');
        this.spsEmpresas();
        this.showEmpresa = false;
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
     * Bloque de Validaciones
     */
    validaciones = {

        //Validación campos empresa
        'clave': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 4 caracteres.' },
        ],
        'razonSocial': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 255 caracteres.' },
        ],
        'rfc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
            { type: 'pattern', message: 'No cumple con la estructura VECJ880326XXX.' },
        ],
        'representante': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 caracteres.' },
        ],
        'nombreComercial': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 255 caracteres.' },
        ],

        //Validación campos detalle empresa
        'tipoEmpresa': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'cif': [
            { type: 'maxlength', message: 'Campo máximo 8 dígitos.' },
            { type: 'minlength', message: 'Campo mínimo 8 dígitos.' },
            { type: 'pattern', message: 'Campo solo números enteros.' },
            { type: 'required', message: 'Campo requerido.' },
        ],
        'nif': [
            { type: 'maxlength', message: 'Campo máximo 8 dígitos.' },
            { type: 'minlength', message: 'Campo mínimo 8 dígitos.' },
            { type: 'pattern', message: 'Campo solo números enteros.' },
            { type: 'required', message: 'Campo requerido.' },
        ],
        'numeroEmpleados': [
            { type: 'minlength', message: 'Campo mínimo 1 dígito.' },
            { type: 'pattern', message: 'Solo se aceptan números.' },
            { type: 'required', message: 'Campo requerido.' },
        ],
        'tamanioEmpresa': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'giroEmpresa': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'capitalAportado': [
            { type: 'minlength', message: 'Campo mínimo 8 dígitos.' },
            { type: 'pattern', message: 'Campo solo números enteros.' },
            { type: 'required', message: 'Campo requerido.' },
        ],

        //Validación campos domicilio
        'calle': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 caracteres.' },
        ],
        'numeroExterior': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 20 caracteres.' },
        ],
        'numeroInterior': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 20 caracteres.' },
        ],
        'entreCalle1': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 caracteres.' },
        ],
        'entreCalle2': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 150 caracteres.' },
        ],
        'referencia': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 250 caracteres.' },
        ],
        'estado': [
            { type: 'required', message: 'Estado requerido.' },
            { type: 'autocompleteObjectValidator', message: 'El estado no existe, seleccione otro registro.' }
        ],
        'ciudad': [
            { type: 'required', message: 'Estado requerido, se debe seleccionar el estado para poder filtrar.' },
            { type: 'autocompleteObjectValidator', message: 'La ciudad no existe, seleccione otro registro.' }
        ],
        'localidad': [
            { type: 'required', message: 'Localidad requerida, se debe seleccionar la ciudad para poder filtrar.' },
            { type: 'autocompleteObjectValidator', message: 'La localidad no existe, seleccione otro registro.' }
        ],
        'catColonia': [
            { type: 'required', message: 'Colonia requerida, se debe seleccionar la localidad para poder filtrar.' },
            { type: 'autocompleteObjectValidator', message: 'El estado no existe, seleccione otro registro.' }
        ],
        'catNacionalidad': [
            { type: 'required', message: 'Nacionalidad requerida.' },
            { type: 'autocompleteObjectValidator', message: 'La nacionalidad no existe, seleccione otro registro.' }
        ],
        'latitud': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'longitud': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'resExtranjera': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'tiempoArraigo': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'numeroDomicilio': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'codigoPostal': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'telefono': [
            { type: 'maxlength', message: 'Campo maximo 10 dígitos.' },
            { type: 'minlength', message: 'Campo maximo 10 dígitos.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'correoElectronico': [
            { type: 'maxlength', message: 'Campo maximo 50 dígitos.' },
            { type: 'pattern', message: 'No es el formato correcto, ejemplo: ejemplo@gmail.com.' }
        ]
    };


    /**
     * MÉTODOS DE DOMICILIO
     */
    /**
         * Método para consultar y listar los tiempos de arraigo.
         * @param general
         */
    spsTiempoArraigo() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('16TA', 'listaGeneralCategoria').subscribe(data => {
            this.listaTiempoArraigo = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /*  
     * Método para consultar y listar los numeros de domicilio.
     * @param general
     */
    spsNumeroDomicilio() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('01JD', 'listaGeneralCategoria').subscribe(data => {
            this.listaNumeroDomicilio = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Método para consultar y listar estados y realzia el autocomplete.
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            console.log('spsEstados', data);
            this.opcionesEstado = this.formEmpresa.get('estado').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
 /**
    * Metodo para setear el codigo postal
    */
  opcionSelecColonia(event) {
    let cp= event.option.value.codP;
    this.formEmpresa.get('codigoPostal').setValue(cp);
}

    /** 
     * Método que consulta y lista colonias y realiza el autocomplete
     */
    spsColonias() {
        this.blockUI.start('Cargando datos...');
        let path: any;
        path = this.selectedIdCiudad + '/' + this.selectedIdLocalidad;
        this.service.getListByID(path, 'listaColoniaCiudad').subscribe(data => {
            this.blockUI.stop();
            this.listaColonias = data;
            console.log(data)
            this.opcionesColonias = this.formEmpresa.get('catColonia').valueChanges.pipe(
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

    /**
     * Muestra la descripción del estado
     * @param option --estado seleccionado
     * @returns --nombre de estado
     */
    displayFn(option: any): any {
        return option ? option.nombreEstado : undefined;
    }

    /**
    * Filtra el estado
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any {
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
     * Método para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionada(event) {
        this.selectedIdEstado = event.option.value.estadoid;
        this.spsCiudad();
    }

    /**
     * Valida cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {           //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);           //3
            if (control instanceof UntypedFormControl) {           //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {      //5
                this.validateAllFormFields(control);        //6
            }
        });
    }


    /**
    * Muestra la descripcion de la ciudad
    * @param option --ciudad seleccionada
    * @returns --nombre de ciudad
    */
    displayFnCiudad(option: any): any {
        return option ? option.nombre : undefined;
    }

    /**
    * Muestra la descripcion del asentamiento
    * @param option --asentamiento selecicionado
    * @returns --descripcion del asentamiento
    */
    displayFnAsentamiento(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Muestra la descripcion de la localidad
    * @param option --localidad seleccionada
    * @returns --nombre de localidad
    */
    displayFnLocalidad(option: any): any {
        return option ? option.nombreLocalidad : undefined;
    }

    /**
    * Metodo para obtener la lista de localidaades
    * por ciudad
    */
    spsLocalidad() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.selectedIdCiudad, 'spsLocalidades').subscribe(data => {
            this.listaLocalidad = data;
            console.log(this.listaLocalidad);
            this.opcionesLocalidades = this.formEmpresa.get('localidad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterLocalidad(value))
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
    private _filterLocalidad(value: any): any {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaLocalidad.filter(option => option.nombreLocalidad.toLowerCase().includes(filterValue));
    }

    /**
     * Filtra Ciudades por Estado ID
     */
    spsCiudad() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.selectedIdEstado, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            console.log(this.listaCiudadEstado);
            this.opcionesCiudades = this.formEmpresa.get('ciudad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudad(value))
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
    private _filterCiudad(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCiudadEstado.filter(option => option.nombre.toLowerCase().includes(filterValue));
    }

    /*
    * Metodo para filtrar por ciudad ID las localidades
    */
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.spsLocalidad();
    }

    /**
    * Metodo para filtrar por ciudad ID las colonias
    */
    opcionSelecLocalidad(event) {
        this.selectedIdLocalidad = event.option.value.localidadid;
        this.spsColonias();
    }

    spsNacionalidad() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaNacionalidades').subscribe(data => {
            this.listaNacionalidad = data;
            console.log('spsNacionalidad', data);
            this.opcionesNacionalidad = this.formEmpresa.get('catNacionalidad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNacionalidad(value))
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
    displayFnNacionalidad(option: any): any {
        return option ? option.nacion : undefined;
    }

    /**
     * Metodo para filtrar por ciudad ID las localidades
    */
    opcionSelectNacionalidad(event) {
        this.selectedIdNacionalidad = event.option.value.nacion;
    }

    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterNacionalidad(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaNacionalidad.filter(option => option.nacion.toLowerCase().includes(filterValue));
    }

    /**
     * MÉTODOS DE DOMICILIO
     */
    /**
     * Método para consultar y listar los tipos de empresa.
     * @param general
     */
    spsTipoEmpresa() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('34TE', 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoEmpresa = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método para consultar y listar los tamanos de empresa.
     * @param general
     */
    spsTamanioEmpresa() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('41TM', 'listaGeneralCategoria').subscribe(data => {
            this.listaTamanioEmpresa = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método para consultar y listar los diros de empresa.
     * @param general
     */
    spsGiroEmpresa() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('42GE', 'listaGeneralCategoria').subscribe(data => {
            this.listaGiroEmpresa = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo que consulta la empresas
    */
    spsEmpresas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaEmpresa').subscribe(data => {
            this.blockUI.stop();
            this.listaEmpresa = data;
            this.searcher = new FuzzySearch(this.listaEmpresa, ['clave', 'razonSocial'], {
                caseSensitive: false,
            });
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
   * Metodo para filtrar empresa
   * 
   */

    buscarEmpresa() {
        this.result = this.searcher.search(this.searchText);
        console.log(this.searchText, ": ", this.result);
        this.listaEmpresa = this.result;
    }

    /**
     * Método para agregar un domicilio principal
     */
    agregarDomicilio() {
        this.formEmpresa.get('calle').setValidators(Validators.required);
        this.formEmpresa.get('calle').updateValueAndValidity();
        this.formEmpresa.get('numeroExterior').setValidators(Validators.required);
        this.formEmpresa.get('numeroExterior').updateValueAndValidity();
        this.formEmpresa.get('entreCalle1').setValidators(Validators.required);
        this.formEmpresa.get('entreCalle1').updateValueAndValidity();
        this.formEmpresa.get('entreCalle2').setValidators(Validators.required);
        this.formEmpresa.get('entreCalle2').updateValueAndValidity();
        this.formEmpresa.get('referencia').setValidators(Validators.required);
        this.formEmpresa.get('referencia').updateValueAndValidity();
        this.formEmpresa.get('catColonia').setValidators(Validators.required);
        this.formEmpresa.get('catColonia').updateValueAndValidity();
        this.formEmpresa.get('catNacionalidad').setValidators(Validators.required);
        this.formEmpresa.get('catNacionalidad').updateValueAndValidity();
        this.formEmpresa.get('tiempoArraigo').setValidators(Validators.required);
        this.formEmpresa.get('tiempoArraigo').updateValueAndValidity();
        this.formEmpresa.get('estado').setValidators(Validators.required);
        this.formEmpresa.get('estado').updateValueAndValidity();
        this.formEmpresa.get('ciudad').setValidators(Validators.required);
        this.formEmpresa.get('ciudad').updateValueAndValidity();
        this.formEmpresa.get('localidad').setValidators(Validators.required);
        this.formEmpresa.get('localidad').updateValueAndValidity();
        this.formEmpresa.get('numeroDomicilio').setValidators(Validators.required);
        this.formEmpresa.get('numeroDomicilio').updateValueAndValidity();
        if(this.formEmpresa.invalid){
            this.validateAllFormFields(this.formEmpresa);
            this.service.showNotification('top', 'right', 3, "Completa la información del domicilio.");
            this.blockUI.stop();
            return;
        }
        let domicilioID = 0;
        let calle = this.formEmpresa.get('calle').value;
        let numeroExterior = this.formEmpresa.get('numeroExterior').value;
        let numeroInterior = this.formEmpresa.get('numeroInterior').value;
        let entreCalle1 = this.formEmpresa.get('entreCalle1').value;
        let entreCalle2 = this.formEmpresa.get('entreCalle2').value;
        let referencia = this.formEmpresa.get('referencia').value;
        let catColonia = this.formEmpresa.get('catColonia').value;
        let catNacionalidad = this.formEmpresa.get('catNacionalidad').value;
        let resExtranjera = this.formEmpresa.get('resExtranjera').value;
        let latitud = this.formEmpresa.get('latitud').value;
        let longitud = this.formEmpresa.get('longitud').value;
        let tiempoArraigo = this.formEmpresa.get('tiempoArraigo').value;
        let codigoPostal = this.formEmpresa.get('codigoPostal').value;
        let catEstado = this.formEmpresa.get('estado').value;
        let catCiudad = this.formEmpresa.get('ciudad').value;
        let catLocalidad = this.formEmpresa.get('localidad').value;
        let numeroDomicilio = this.formEmpresa.get('numeroDomicilio').value;


        if (this.listaDomicilioSeleccionados.length <= 0) {
            let objeto = [
                catNacionalidad.nacionalidadid,     // 0
                catNacionalidad.nacion,             // 1
                catEstado.estadoid,                 // 2
                catEstado.nombreEstado,             // 3
                catCiudad.ciudaId,                  // 4
                catCiudad.nombre,                   // 5
                catLocalidad.localidadid,           // 6
                catLocalidad.nombreLocalidad,       // 7
                catColonia.coloniaID,               // 8
                catColonia.nombrecolonia,           // 9
                codigoPostal,                       // 10
                calle,                              // 11
                numeroExterior,                     // 12
                numeroInterior,                     // 13
                entreCalle1,                        // 14
                entreCalle2,                        // 15
                referencia,                         // 16
                resExtranjera,                      // 17
                latitud,                            // 18
                longitud,                           // 19
                tiempoArraigo,                      // 20
                tiempoArraigo.descripcion,          // 21
                numeroDomicilio,                    // 22
                numeroDomicilio.descripcion,        // 23
                domicilioID                         // 24
            ];
            this.listaDomicilioSeleccionados.push(objeto);

            this.formEmpresa.get('calle').setValue('');
            this.formEmpresa.get('numeroExterior').setValue('');
            this.formEmpresa.get('numeroInterior').setValue('');
            this.formEmpresa.get('entreCalle1').setValue('');
            this.formEmpresa.get('entreCalle2').setValue('');
            this.formEmpresa.get('referencia').setValue('');
            this.formEmpresa.get('catColonia').setValue('');
            this.formEmpresa.get('catNacionalidad').setValue('');
            this.formEmpresa.get('resExtranjera').setValue('');
            this.formEmpresa.get('latitud').setValue('');
            this.formEmpresa.get('longitud').setValue('');
            this.formEmpresa.get('tiempoArraigo').setValue('');
            this.formEmpresa.get('estado').setValue('');
            this.formEmpresa.get('ciudad').setValue('');
            this.formEmpresa.get('localidad').setValue('');
            this.formEmpresa.get('codigoPostal').setValue('');
            this.formEmpresa.get('numeroDomicilio').setValue('');

        } else {// La lista no se encuentra vacia.
            // Buscamos en la lista si ya existe un registro con el tipoAgenda
            let indice = this.listaDomicilioSeleccionados.findIndex(i => i[22] === numeroDomicilio.generalesId);
            if (indice === -1) { // No existe
                // Se verifica que no exista un registro con el mismo numeroAgenda
                let objeto = [
                    catNacionalidad.nacionalidadid,     // 0
                    catNacionalidad.nacion,             // 1
                    catEstado.estadoid,                 // 2
                    catEstado.nombreEstado,             // 3
                    catCiudad.ciudaId,                  // 4
                    catCiudad.nombre,                   // 5
                    catLocalidad.localidadid,           // 6
                    catLocalidad.nombreLocalidad,       // 7
                    catColonia.coloniaID,               // 8
                    catColonia.nombrecolonia,           // 9
                    codigoPostal,                       // 10
                    calle,                              // 11
                    numeroExterior,                     // 12
                    numeroInterior,                     // 13
                    entreCalle1,                        // 14
                    entreCalle2,                        // 15
                    referencia,                         // 16
                    resExtranjera,                      // 17
                    latitud,                            // 18
                    longitud,                           // 19
                    tiempoArraigo.generalesId,          // 20
                    tiempoArraigo.descripcion,          // 21
                    numeroDomicilio.generalesId,        // 22
                    numeroDomicilio.descripcion,        // 23
                    domicilioID                         // 24
                ];

                this.formEmpresa.get('calle').setValue('');
                this.formEmpresa.get('numeroExterior').setValue('');
                this.formEmpresa.get('numeroInterior').setValue('');
                this.formEmpresa.get('entreCalle1').setValue('');
                this.formEmpresa.get('entreCalle2').setValue('');
                this.formEmpresa.get('referencia').setValue('');
                this.formEmpresa.get('catColonia').setValue('');
                this.formEmpresa.get('catNacionalidad').setValue('');
                this.formEmpresa.get('resExtranjera').setValue('');
                this.formEmpresa.get('latitud').setValue('');
                this.formEmpresa.get('longitud').setValue('');
                this.formEmpresa.get('tiempoArraigo').setValue('');
                this.formEmpresa.get('estado').setValue('');
                this.formEmpresa.get('ciudad').setValue('');
                this.formEmpresa.get('localidad').setValue('');
                this.formEmpresa.get('codigoPostal').setValue('');
                this.formEmpresa.get('numeroDomicilio').setValue('');
                this.listaDomicilioSeleccionados.push(objeto);
            }
            else { // Existe, se actualiza el registro
                // Recorremos la lista, al encontrarlo lo actualizamos.            
                this.listaDomicilioSeleccionados.forEach(element => {
                    if (element[22] === numeroDomicilio.generalesId) {
                        element[0] = catNacionalidad.nacionalidadid;    // 0
                        element[1] = catNacionalidad.nacion;        // 1
                        element[2] = catEstado.estadoid;            // 2
                        element[3] = catEstado.nombreEstado;        // 3
                        element[4] = catCiudad.ciudaId;             // 4
                        element[5] = catCiudad.nombre;              // 5
                        element[6] = catLocalidad.localidadid;      // 6
                        element[7] = catLocalidad.nombreLocalidad;  // 7
                        element[8] = catColonia.coloniaID;          // 8
                        element[9] = catColonia.nombrecolonia;      // 9
                        element[10] = codigoPostal;                 // 10
                        element[11] = calle;                        // 11
                        element[12] = numeroExterior;               // 12
                        element[13] = numeroInterior;               // 13
                        element[14] = entreCalle1;                  // 14
                        element[15] = entreCalle2;                  // 15
                        element[16] = referencia;                   // 16
                        element[17] = resExtranjera;                // 17
                        element[18] = latitud;                      // 18
                        element[19] = longitud;                     // 19
                        element[20] = tiempoArraigo.generalesId;    // 20
                        element[21] = tiempoArraigo.descripcion;    // 21
                        element[22] = numeroDomicilio.generalesId;  // 22
                        element[23] = numeroDomicilio.descripcion;  // 23
                        element[24] = domicilioID;                  // 24
                    }
                });
                this.formEmpresa.get('calle').setValue('');
                this.formEmpresa.get('numeroExterior').setValue('');
                this.formEmpresa.get('numeroInterior').setValue('');
                this.formEmpresa.get('entreCalle1').setValue('');
                this.formEmpresa.get('entreCalle2').setValue('');
                this.formEmpresa.get('referencia').setValue('');
                this.formEmpresa.get('catColonia').setValue('');
                this.formEmpresa.get('catNacionalidad').setValue('');
                this.formEmpresa.get('resExtranjera').setValue('');
                this.formEmpresa.get('latitud').setValue('');
                this.formEmpresa.get('longitud').setValue('');
                this.formEmpresa.get('tiempoArraigo').setValue('');
                this.formEmpresa.get('estado').setValue('');
                this.formEmpresa.get('ciudad').setValue('');
                this.formEmpresa.get('localidad').setValue('');
                this.formEmpresa.get('codigoPostal').setValue('');
                this.formEmpresa.get('numeroDomicilio').setValue('');
                this.service.showNotification('top', 'right', 1, "El domicilio ya se encuentra registrado, solo se actualizaron sus valores.")

            }
        }
        this.formEmpresa.get('calle').setValidators(null);
        this.formEmpresa.get('calle').updateValueAndValidity();
        this.formEmpresa.get('numeroExterior').setValidators(null);
        this.formEmpresa.get('numeroExterior').updateValueAndValidity();
        this.formEmpresa.get('entreCalle1').setValidators(null);
        this.formEmpresa.get('entreCalle1').updateValueAndValidity();
        this.formEmpresa.get('entreCalle2').setValidators(null);
        this.formEmpresa.get('entreCalle2').updateValueAndValidity();
        this.formEmpresa.get('referencia').setValidators(null);
        this.formEmpresa.get('referencia').updateValueAndValidity();
        this.formEmpresa.get('catColonia').setValidators(null);
        this.formEmpresa.get('catColonia').updateValueAndValidity();
        this.formEmpresa.get('catNacionalidad').setValidators(null);
        this.formEmpresa.get('catNacionalidad').updateValueAndValidity();
        this.formEmpresa.get('tiempoArraigo').setValidators(null);
        this.formEmpresa.get('tiempoArraigo').updateValueAndValidity();
        this.formEmpresa.get('estado').setValidators(null);
        this.formEmpresa.get('estado').updateValueAndValidity();
        this.formEmpresa.get('ciudad').setValidators(null);
        this.formEmpresa.get('ciudad').updateValueAndValidity();
        this.formEmpresa.get('localidad').setValidators(null);
        this.formEmpresa.get('localidad').updateValueAndValidity();
        this.formEmpresa.get('numeroDomicilio').setValidators(null);
        this.formEmpresa.get('numeroDomicilio').updateValueAndValidity();
    
    }

    /**
     * Validar domicilio
     */

    validarDomicilio(): boolean {
        if (this.formEmpresa.get('calle').value === '') {
            return false;
        }
        if (this.formEmpresa.get('numeroExterior').value === '') {
            return false;
        }
        if (this.formEmpresa.get('numeroInterior').value === '') {
            return false;
        }
        if (this.formEmpresa.get('entreCalle1').value === '') {
            return false;
        }
        if (this.formEmpresa.get('entreCalle2').value === '') {
            return false;
        }
        if (this.formEmpresa.get('referencia').value === '') {
            return false;
        }
        if (this.formEmpresa.get('catColonia').value === '') {
            return false;
        }
        if (this.formEmpresa.get('catNacionalidad').value === '') {
            return false;
        }
        if (this.formEmpresa.get('resExtranjera').value === '') {
            return false;
        }
        if (this.formEmpresa.get('latitud').value === '') {
            return false;
        }
        if (this.formEmpresa.get('longitud').value === '') {
            return false;
        }
        if (this.formEmpresa.get('tiempoArraigo').value === '') {
            return false;
        }
        return true;
    }

    /**
    * Metodo para remover domicilio de la lista
    */
    removerDomicilio(valor: any): void {
        let index = this.listaDomicilioSeleccionados.findIndex(res => res[3] === valor[22]);
        this.listaDomicilioSeleccionados.splice(index, 1);
    }

    /**
    * Metodo para remover domicilio de la lista
    */
    actualizarDomicilio(): void {
        let domicilio = {
            "domicilioID": this.domicilioID,
            "calle": this.formEmpresa.get("calle").value,
            "numeroExterior": this.formEmpresa.get('numeroExterior').value,
            "numeroInterior": this.formEmpresa.get('numeroInterior').value,
            "entreCalle1": this.formEmpresa.get('entreCalle1').value,
            "entreCalle2": this.formEmpresa.get('entreCalle2').value,
            "referencia": this.formEmpresa.get('referencia').value,
            "catColonia": this.formEmpresa.get('catColonia').value,
            "catNacionalidad": this.formEmpresa.get('catNacionalidad').value,
            "estado": this.formEmpresa.get('estado').value,
            "localidad": this.formEmpresa.get('localidad').value,
            "extencionDomicilio": {
                "resExtranjera": this.formEmpresa.get('resExtranjera').value,
                "latitud": this.vLatitudMarket,
                "longitud": this.vLongitudMarket,
                "catGeneral": {
                    "generalesId": this.formEmpresa.get('tiempoArraigo').value
                },
                "codigoPostal": this.formEmpresa.get('codigoPostal').value,
                "numeroDomicilio": this.formEmpresa.get('numeroDomicilio').value
            }
        };

        const index = this.listaDomicilioArreglo.indexOf(domicilio.domicilioID, 0);
        if (index >= 0) {
            this.listaDomicilioArreglo.splice(index, 1);
        }
        this.listaDomicilioArreglo.push(domicilio);
        this.agregarDomicilio();
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
     * Metodo para mostrar la agenda
     * elemento[3] = tipoDeCOntacto
     * elemento[1] = correo
     * elemento[0] = telefono
    */
    mostrarAgenda(elemento: any) {
        let numeroAgenda: any
        //Busca la información de la lista original por el id
        numeroAgenda = this.listaNumeroDomicilio.find(x => x.generalesId === elemento[3]);
        this.formEmpresa.get('telefono').setValue(elemento[1]);
        this.formEmpresa.get('correoElectronico').setValue(elemento[2]);
        this.formEmpresa.get('numeroAgenda').setValue(numeroAgenda);
    }

    /**
     * Metodo para remover datos de la lista de agenda
    */
    eliminarAgenda(valor: any) {
        let index = this.listaAgendaSeleccionadas.findIndex(res => res[3] === valor[3]);
        this.listaAgendaSeleccionadas.splice(index, 1);
    }

    /**
    * Metodo para agregar datos a la lista de agendas
    */
    agregarAgendas() {
        this.formEmpresa.get('telefono').setValidators(Validators.required);
        this.formEmpresa.get('telefono').updateValueAndValidity();
        this.formEmpresa.get('numeroAgenda').setValidators(Validators.required);
        this.formEmpresa.get('numeroAgenda').updateValueAndValidity();
        if(this.formEmpresa.invalid){
            this.validateAllFormFields(this.formEmpresa);
            this.service.showNotification('top', 'right', 3, "Completa la información de Agenda.");
            this.blockUI.stop();
            return;
        }
        let agendaID = 0;
        let telefono = this.formEmpresa.get('telefono').value;
        let correoElectronico = this.formEmpresa.get('correoElectronico').value;
        let numeroAgenda = this.formEmpresa.get('numeroAgenda').value;
        if (this.listaAgendaSeleccionadas.length <= 0) {
            let objeto = [
                agendaID,
                telefono,
                correoElectronico,
                numeroAgenda.generalesId,
                numeroAgenda.descripcion
            ];
            this.listaAgendaSeleccionadas.push(objeto);

            this.formEmpresa.get('telefono').setValue('');
            this.formEmpresa.get('correoElectronico').setValue('');
            this.formEmpresa.get('numeroAgenda').setValue('');

        } else {// La lista no se encuentra vacia.
            this.agendaDatos();
        }
        this.formEmpresa.get('telefono').setValidators(null);
        this.formEmpresa.get('telefono').updateValueAndValidity();
        this.formEmpresa.get('numeroAgenda').setValidators(null);
        this.formEmpresa.get('numeroAgenda').updateValueAndValidity();
    }
    /**
     * verifica si ya existe ese contacto o lo actualiza
     * @returns notificacion
     */
    agendaDatos() {
        let agendaID = 0;
        let telefono = this.formEmpresa.get('telefono').value;
        let correoElectronico = this.formEmpresa.get('correoElectronico').value;
        let numeroAgenda = this.formEmpresa.get('numeroAgenda').value;
        // Buscamos en la lista si ya existe un registro con el tipoAgenda
        let indice = this.listaAgendaSeleccionadas.findIndex(i => i[3] === numeroAgenda.generalesId); //i.tipoIdentificacionId
        if (indice === -1) { // No existe
            // Se verifica que no exista una identificacion con el mismo numeroAgenda
            let indice1 = this.listaAgendaSeleccionadas.findIndex(i => i[0] === telefono);
            let indice2 = this.listaAgendaSeleccionadas.findIndex(i => i[1] === correoElectronico);
            if (indice1 === -1 && indice2 === -1) { // No existe
                let objeto = [
                    agendaID,
                    telefono,
                    correoElectronico,
                    numeroAgenda.generalesId,
                    numeroAgenda.descripcion
                ];
                this.formEmpresa.get('telefono').setValue('');
                this.formEmpresa.get('correoElectronico').setValue('');
                this.formEmpresa.get('numeroAgenda').setValue('');
                this.listaAgendaSeleccionadas.push(objeto);
            } else { // Existe
                this.service.showNotification('top', 'right', 3, 'Ya existe una agenda, con los mismos datos');
                return;
            }
        }
        else { // Existe, se actualiza el registro de agenda
            // Se verifica que no exista una regsitro de agenda
            let indice2 = this.listaAgendaSeleccionadas.findIndex(i => i[1] === telefono && i[2] === correoElectronico && i[3] !== numeroAgenda.generalesId);
            if (indice2 === -1) { // No existe
                // Recorremos la lista, al encontrarlo lo actualizamos.            
                this.listaAgendaSeleccionadas.forEach(element => {
                    if (element[3] === numeroAgenda.generalesId) {
                        element[1] = telefono;
                        element[2] = correoElectronico;
                    }
                });
                this.formEmpresa.get('telefono').setValue('');
                this.formEmpresa.get('correoElectronico').setValue('');
                this.formEmpresa.get('numeroAgenda').setValue('');
                this.service.showNotification('top', 'right', 1, "La agenda ya se encuentra registrada, solo se actualizaron sus valores.")
            } else { // Existe
                this.service.showNotification('top', 'right', 3, 'Ya existe la agenda');
                return;
            }
        }
    }
    /** 
    * Metodo para mostrar el domicilio
    */
    mostrarDomicilio(domicilio: any) {
        let catNacionalidad: any;
        let catColonia: any;
        let estado: any;
        let ciudad: any;
        let localidad: any;
        let tiempoArraigo: any;

        //Busca la información de la lista original por el id
        //ver si se usa let numeroDomicilio = this.listaNumeroDomicilio.find(x => x.generalesId === domicilio[22]);
        this.formEmpresa.get('numeroDomicilio').setValue(domicilio[22]);
        catNacionalidad = this.listaNacionalidad.find(x => x.nacionalidadid === domicilio[0]);
        estado = this.listaEstados.find(x => x.estadoid === domicilio[2]);
        this.selectedIdEstado = domicilio[2];
        //Metodo de ciudad-estado
        this.service.getListByID(this.selectedIdEstado, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            console.log(this.listaCiudadEstado);
            this.opcionesCiudades = this.formEmpresa.get('ciudad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudad(value))
            );
            ciudad = this.listaCiudadEstado.find(x => x.ciudaId === domicilio[4]);
            this.selectedIdCiudad = domicilio[4];

            //Metodo localidad
            this.service.getListByID(this.selectedIdCiudad, 'spsLocalidades').subscribe(loc => {
                this.listaLocalidad = loc;
                this.opcionesLocalidades = this.formEmpresa.get('localidad').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterLocalidad(value))
                );
                localidad = this.listaLocalidad.find(x => x.localidadid === domicilio[6]);
                this.selectedIdCiudad = domicilio[4];
                this.selectedIdLocalidad = domicilio[6];
            });

            //Localidad
            let path: any;
            path = this.selectedIdCiudad + '/' + this.selectedIdLocalidad;
            this.service.getListByID(path, 'listaColoniaCiudad').subscribe(col => {
                this.blockUI.stop();
                this.listaColonias = col;
                this.opcionesColonias = this.formEmpresa.get('catColonia').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterColonias(value))
                );
                catColonia = this.listaColonias.find(x => x.coloniaID === domicilio[8]);
                this.formEmpresa.get('calle').setValue(domicilio[11]);
                this.formEmpresa.get('numeroExterior').setValue(domicilio[12]);
                this.formEmpresa.get('numeroInterior').setValue(domicilio[13]);
                this.formEmpresa.get('entreCalle1').setValue(domicilio[14]);
                this.formEmpresa.get('entreCalle2').setValue(domicilio[15]);
                this.formEmpresa.get('referencia').setValue(domicilio[16]);
                this.formEmpresa.get('resExtranjera').setValue(domicilio[17]);
                this.formEmpresa.get('latitud').setValue(domicilio[18]);
                this.formEmpresa.get('longitud').setValue(domicilio[19]);
                this.formEmpresa.get('catNacionalidad').setValue(catNacionalidad);
                this.formEmpresa.get('catColonia').setValue(catColonia);
                this.formEmpresa.get('estado').setValue(estado);
                this.formEmpresa.get('ciudad').setValue(ciudad);
                this.formEmpresa.get('localidad').setValue(localidad);
                this.formEmpresa.get('tiempoArraigo').setValue(domicilio[21]);
                this.formEmpresa.get('codigoPostal').setValue(domicilio[10]);
            });
        });
    }

    /**
     * 
     * @param accion 
     */
    abrirAdminMapa(elemento) {
        /*const dialogoMapa = this.dialog.open(AdminMapaComponent, {
            data: {
                mapa: elemento

            }
        })
        //Este se usa para que cuando cerramos
        dialogoMapa.afterClosed().subscribe(result => {
            let vLatitudMarket = result[0].lat;
            this.formEmpresa.get('latitud').setValue(vLatitudMarket);
            let vLongitudMarket = result[0].lat;
            this.formEmpresa.get('longitud').setValue(vLongitudMarket);
            console.log('lngModal', result[0].lat);
            console.log('vLongitudMarket', vLongitudMarket)
        });*/
    }

    /*
    * Validacion hidden
    */
    validacionHidden(elemento) {

        console.log(elemento, 'validacionhidden', this.vTipoEmpresa);

        if (elemento.value.cveGeneral != environment.generales.cveEmpleadora) {
            this.vTipoEmpresa = false;
            this.formEmpresa.controls['cif'].setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('[0-9]*')]);
            //this.formEmpresa.controls['cif'].enable();
            this.formEmpresa.controls['nif'].setValidators([Validators.required, Validators.maxLength(8), Validators.minLength(8), Validators.pattern('[0-9]*')]);
            //this.formEmpresa.controls['nif'].enable();
            this.formEmpresa.controls['numeroEmpleados'].setValidators([Validators.required, Validators.minLength(1), Validators.pattern('[0-9]*')]);
            //this.formEmpresa.controls['numeroEmpleados'].enable();
            this.formEmpresa.controls['tamanioEmpresa'].setValidators([Validators.required]);
            //this.formEmpresa.controls['tamanioEmpresa'].enable();
            this.formEmpresa.controls['giroEmpresa'].setValidators([Validators.required]);
            //this.formEmpresa.controls['giroEmpresa'].enable();
            this.formEmpresa.controls['capitalAportado'].setValidators([Validators.required, Validators.minLength(1), Validators.pattern('[0-9]*')]);
            //this.formEmpresa.controls['capitalAportado'].enable();

        } else {
            console.log(elemento.value.cveGeneral);
            this.vTipoEmpresa = true;
            this.formEmpresa.controls['cif'].clearValidators();
            //this.formEmpresa.controls['cif'].enable();
            this.formEmpresa.controls['nif'].clearValidators();
            //this.formEmpresa.controls['nif'].enable();
            //this.formEmpresa.controls['numeroEmpleados'].clearValidators();
            //this.formEmpresa.controls['numeroEmpleados'].enable();
            //this.formEmpresa.controls['tamanioEmpresa'].clearValidators();
            //this.formEmpresa.controls['tamanioEmpresa'].enable();
            //this.formEmpresa.controls['giroEmpresa'].clearValidators();
            //this.formEmpresa.controls['giroEmpresa'].enable();
            this.formEmpresa.controls['capitalAportado'].clearValidators();
            //this.formEmpresa.controls['capitalAportado'].enable();

        }
        this.formEmpresa.controls['cif'].updateValueAndValidity();
        this.formEmpresa.controls['nif'].updateValueAndValidity();
        this.formEmpresa.controls['numeroEmpleados'].updateValueAndValidity();
        this.formEmpresa.controls['tamanioEmpresa'].updateValueAndValidity();
        this.formEmpresa.controls['giroEmpresa'].updateValueAndValidity();
        this.formEmpresa.controls['capitalAportado'].updateValueAndValidity();

    }
    /**Metodo para consultar las empresa por su tipo de la
     * @param event tipo de empresa seleccionado*/
    claveTipoEm: string = '';
    buscarTipoEm(event) {
        this.claveTipoEm = event.value.cveGeneral;
        this.spsTipoEmpresas(this.claveTipoEm);
    }
    /**
* Listar empresas por el tipo de empresa filtrada
* @param '01EE' clave de empresa empleadora
*/
    spsTipoEmpresas(claveTipoEm) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(claveTipoEm, 'listaTipoEmpresa').subscribe(data => {
            this.listaEmpresa = data;
            this.searcher = new FuzzySearch(this.listaEmpresa, ['clave', 'razonSocial'], {
                caseSensitive: false,
            });
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

}





