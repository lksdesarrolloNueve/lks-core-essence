import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn, AbstractControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";



@Component({
    selector: 'administracion-proveedor',
    moduleId: module.id,
    templateUrl: 'administracion-proveedor.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 3/11/2021
 * @descripcion: Componente para la gestion de proveedores
 */

export class AdministracionProveedorComponent implements OnInit {
    step = 0;

    setStep(index: number) {
        this.step = index;
    }

    nextStep() {
        this.step++;
    }

    prevStep() {
        this.step--;
    }

    //Declaracion de variables
    titulo: string;
    accion: number;
    domicilioID: number = 0;
    proveedorID: number = 0;
    agendaID: number = 0;
    selectedId: number;
    @BlockUI() blockUI: NgBlockUI;
    formDomicilio: UntypedFormGroup;
    listaAgenda: any[];
    /** Controles Nacionalidad**/
    selectedIdNacionalidad: number = 0;
    listaNacionalidad: any[];
    opcionesNacionalidad: Observable<string[]>;
    nacionalidadId: number;
    /** Fin Controles Nacionalidad */

    /**controles sucursal */
    sucursal = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaSucursal: any;
    opcionesSucursal: Observable<string[]>;
    selectedIdSuc: number;
    /**fin */

    /** Controles Nacionalidad**/
    selectedIdNacionalidadProv: number = 0;
    listaNacionalidadProv: any[];
    opcionesNacionalidadProv: Observable<string[]>;
    nacionalidadIdProv: number;
    /** Fin Controles Nacionalidad */

    /**controles banco sat */
    bancosat = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaBancoSat: any;
    opcionesBancoSat: Observable<string[]>;
    selectedIdBSat: number;
    /**fin */
    /** Controles Tiempo Arraigo **/
    arraigoGeneralId: any;
    listaTiempoArraigo: any;
    tiempoArraigoControl = new UntypedFormControl('', [Validators.required])
    /** Fin Controles Tiempo Arraigo **/

    /** Controles tipoOperacion **/
    topeGeneralId: any;
    listaTipoOpe: any;
    tipoOpeControl = new UntypedFormControl('', [Validators.required])
    /** Fin Controles tipoOperacion **/

    /** Controles tipoTercero **/
    tterGeneralId: any;
    listaTipoTer: any;
    tipoTerControl = new UntypedFormControl('', [Validators.required])
    /** Fin Controles tipoTercero **/


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

    /** Controles tipo compra **/
    opciontcompra: Observable<string[]>;
    selectedIdtcompra: number = 0;
    listatipoc: any;
    /** Fin Control tipo compra **/

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.titulo = data.titulo + ' Proveedor';
        this.accion = data.accion;
        //Se asigan valor y se validan las componentes
        this.formDomicilio = this.formBuilder.group({
            rfc: new UntypedFormControl('', [Validators.required, Validators.maxLength(13)]),
            nombreprov: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
            numCuenta: new UntypedFormControl(''),
            tcompra: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            tipoTercera: this.tipoTerControl,
            tipoOperacion: this.tipoOpeControl,
            provNacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            BancoSat: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            Sucursal: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            estatus: new UntypedFormControl('true'),
            calle: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            numeroExterior: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            estadoH: new UntypedFormControl(''),
            numeroInterior: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            entreCalle1: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle2: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            referencia: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            latitud: new UntypedFormControl('', [Validators.maxLength(13)]),
            longitud: new UntypedFormControl('', [Validators.maxLength(13)]),
            resExtranjera: new UntypedFormControl('false'),
            tiempoArraigo: this.tiempoArraigoControl,
            estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            localidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catColonia: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catNacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            telefono: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            email: new UntypedFormControl('', [Validators.required, Validators.pattern('^[_\.0-9a-z-]+@([0-9a-z][0-9a-z-]+)+((\.)[a-z]{2,})+$')]),
        });

        //Se obtienen los valores para poder pintarlos en el modal.
        if (this.accion === 2) {
            this.listaAgenda = JSON.parse(data.proveedor.extencionProveedor.agenda.trim());
            this.formDomicilio.get('telefono').setValue(this.listaAgenda[0].telefono.trim());
            this.formDomicilio.get('email').setValue(this.listaAgenda[0].correo);
            this.proveedorID = data.proveedor.proveedorID
            this.formDomicilio.get('rfc').setValue(data.proveedor.rfc);
            this.formDomicilio.get('nombreprov').setValue(data.proveedor.nombreProveedor);
            this.formDomicilio.get('numCuenta').setValue(data.proveedor.numeroCuenta.trim());
            this.formDomicilio.get('tcompra').setValue(data.proveedor.extencionProveedor.tipoCuenta);
            this.formDomicilio.get('tipoTercera').setValue(data.proveedor.extencionProveedor.tipoTercera.generalesId);
            this.formDomicilio.get('tipoOperacion').setValue(data.proveedor.extencionProveedor.tipoOperacion.generalesId);
            this.formDomicilio.get('provNacionalidad').setValue(data.proveedor.extencionProveedor.nacionalidad);
            this.formDomicilio.get('BancoSat').setValue(data.proveedor.extencionProveedor.bancosat);
            this.formDomicilio.get('Sucursal').setValue(data.proveedor.extencionProveedor.sucursal);
            this.formDomicilio.get('estatus').setValue(data.proveedor.estatus);
            this.domicilioID = data.proveedor.extencionProveedor.domicilio.domicilioID
            this.formDomicilio.get('calle').setValue(data.proveedor.extencionProveedor.domicilio.calle);
            this.formDomicilio.get('numeroExterior').setValue(data.proveedor.extencionProveedor.domicilio.numeroExterior.trim());
            this.formDomicilio.get('numeroInterior').setValue(data.proveedor.extencionProveedor.domicilio.numeroInterior.trim());
            this.formDomicilio.get('entreCalle1').setValue(data.proveedor.extencionProveedor.domicilio.entreCalle1);
            this.formDomicilio.get('entreCalle2').setValue(data.proveedor.extencionProveedor.domicilio.entreCalle2);
            this.formDomicilio.get('referencia').setValue(data.proveedor.extencionProveedor.domicilio.referencia);
            this.formDomicilio.get('resExtranjera').setValue(data.proveedor.extencionProveedor.domicilio.extencionDomicilio.resExtranjera);
            this.formDomicilio.get('latitud').setValue(data.proveedor.extencionProveedor.domicilio.extencionDomicilio.latitud.trim());
            this.formDomicilio.get('longitud').setValue(data.proveedor.extencionProveedor.domicilio.extencionDomicilio.longitud.trim());
            this.formDomicilio.get('catNacionalidad').setValue(data.proveedor.extencionProveedor.domicilio.nacionalidad);
            this.formDomicilio.get('catColonia').setValue(data.proveedor.extencionProveedor.domicilio.colonia);
            this.formDomicilio.get('estado').setValue(data.proveedor.extencionProveedor.domicilio.colonia.ciudad.estado);
            this.formDomicilio.get('ciudad').setValue(data.proveedor.extencionProveedor.domicilio.colonia.ciudad);
            this.formDomicilio.get('localidad').setValue(data.proveedor.extencionProveedor.domicilio.colonia.localidad);
            this.formDomicilio.get('tiempoArraigo').setValue(data.proveedor.extencionProveedor.domicilio.extencionDomicilio.tiempoArraigo.generalesId);
        }

    }

    /** Creación del arreglo para implementar las validaciones
    en el modal de admin-domicilios.component.html **/
    validaciones = {
        'rfc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],

        'nombreprov': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 100 caracteres.' },
        ],

        'tcompra': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El tipo no pertenece a la lista, elija otro.' },
        ],

        'tipoTercera': [
            { type: 'required', message: 'Campo requerido.' },
        ],

        'tipoOperacion': [
            { type: 'required', message: 'Campo requerido.' },
        ],

        'provNacionalidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La nacionalidad no pertenece a la lista, elija otra.' },
        ],

        'BancoSat': [
            { type: 'invalidAutocompleteObject', message: 'El banco sat no pertenece a la lista, elija otro.' }
        ],

        'Sucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra.' }
        ],

        'telefono': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números' }
        ],

        'numCuenta': [
            { type: 'pattern', message: 'Campo solo números' }
        ],

        'email': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'El correo electrónico debe ser una dirección de correo electrónico válida' }
        ],

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
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'longitud': [
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'resExtranjera': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'tiempoArraigo': [
            { type: 'required', message: 'Campo requerido.' },
        ],

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
     * Metodo que abre un modal para la gestion de Domcilio
     */

    ngOnInit() {
        this.spsTiempoArraigo();
        this.spsTcompra();
        this.spsTipoTercero();
        this.spsTipoOperacion();
        this.spsEstados();
        this.spsNacionalidadProv();
        this.spsBancoSat();
        this.spsSucursal();
        this.spsNacionalidad();
    }

    /**
     * Metodo para Guardar bancos con validaciones para insertar
     * @returns 
     */

    guardarProveedor() {

        if (this.formDomicilio.invalid) {
            this.validateAllFormFields(this.formDomicilio);
            return;
        }

        let idbancosat = 0;
        let varLatitud = 'N/P';
        let varLongitud = 'N/P';


        if (this.formDomicilio.get('BancoSat').value) {
            idbancosat = this.formDomicilio.get('BancoSat').value.bancosatId;
        }

        if (this.formDomicilio.get('latitud').value) {
            varLatitud = this.formDomicilio.get('latitud').value;
        }

        if (this.formDomicilio.get('longitud').value){
            varLongitud = this.formDomicilio.get('longitud').value;
        }

        this.blockUI.start('Guardando ...');
        const data = {
            "proveedor": {
                "proveedorID": this.proveedorID,
                "rfc": this.formDomicilio.get('rfc').value,
                "nombreProveedor": this.formDomicilio.get('nombreprov').value,
                "numeroCuenta": this.formDomicilio.get('numCuenta').value,
                "estatus": this.formDomicilio.get('estatus').value,
                "extencionProveedor": {
                    "tipoCuenta": this.formDomicilio.get('tcompra').value,
                    "tipoTercera": {
                        "generalesId": this.formDomicilio.get('tipoTercera').value
                    },
                    "tipoOperacion": {
                        "generalesId": this.formDomicilio.get('tipoOperacion').value
                    },
                    "nacionalidad": this.formDomicilio.get('provNacionalidad').value,

                    "bancosat": { "bancosatId": idbancosat },

                    "sucursal": this.formDomicilio.get('Sucursal').value
                    ,
                    "domicilio": {
                        "domicilioID": this.domicilioID,
                        "calle": this.formDomicilio.get("calle").value,
                        "numeroExterior": this.formDomicilio.get('numeroExterior').value,
                        "numeroInterior": this.formDomicilio.get('numeroInterior').value,
                        "entreCalle1": this.formDomicilio.get('entreCalle1').value,
                        "entreCalle2": this.formDomicilio.get('entreCalle2').value,
                        "referencia": this.formDomicilio.get('referencia').value,
                        "colonia": this.formDomicilio.get('catColonia').value,
                        "nacionalidad": this.formDomicilio.get('catNacionalidad').value,
                        "extencionDomicilio": {
                            "resExtranjera": this.formDomicilio.get('resExtranjera').value,
                            "latitud": varLatitud,
                            "longitud": varLongitud,
                            "tiempoArraigo": {
                                "generalesId": this.formDomicilio.get('tiempoArraigo').value
                            }
                        }
                    }
                }
            },
            "contactos": [[this.agendaID, this.formDomicilio.get('telefono').value, this.formDomicilio.get('email').value]],

            "accion": 1
        }

        this.service.registrar(data, 'crudProveedor').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formDomicilio.reset();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        )

    }


    /**
    * Metodo para Guardar bancos con validaciones para insertar
    * @returns 
    */


    ActualizarProveedor() {

        if (this.formDomicilio.invalid) {
            this.validateAllFormFields(this.formDomicilio);
            return;
        }

        let idbancosat = 0;
        let varLatitud = 'N/P';
        let varLongitud = 'N/P';


        if (this.formDomicilio.get('BancoSat').value) {
            idbancosat = this.formDomicilio.get('BancoSat').value.bancosatId;
        }

        if (this.formDomicilio.get('latitud').value) {
            varLatitud = this.formDomicilio.get('latitud').value;
        }

        if (this.formDomicilio.get('longitud').value){
            varLongitud = this.formDomicilio.get('longitud').value;
        }

        this.blockUI.start('Guardando ...');
        const data = {
            "proveedor": {
                "proveedorID": this.proveedorID,
                "rfc": this.formDomicilio.get('rfc').value,
                "nombreProveedor": this.formDomicilio.get('nombreprov').value,
                "numeroCuenta": this.formDomicilio.get('numCuenta').value,
                "estatus": this.formDomicilio.get('estatus').value,
                "extencionProveedor": {
                    "tipoCuenta": this.formDomicilio.get('tcompra').value,
                    "tipoTercera": {
                        "generalesId": this.formDomicilio.get('tipoTercera').value
                    },
                    "tipoOperacion": {
                        "generalesId": this.formDomicilio.get('tipoOperacion').value
                    },
                    "nacionalidad": this.formDomicilio.get('provNacionalidad').value,

                    "bancosat": { "bancosatId": idbancosat },

                    "sucursal": this.formDomicilio.get('Sucursal').value
                    ,
                    "domicilio": {
                        "domicilioID": this.domicilioID,
                        "calle": this.formDomicilio.get("calle").value,
                        "numeroExterior": this.formDomicilio.get('numeroExterior').value,
                        "numeroInterior": this.formDomicilio.get('numeroInterior').value,
                        "entreCalle1": this.formDomicilio.get('entreCalle1').value,
                        "entreCalle2": this.formDomicilio.get('entreCalle2').value,
                        "referencia": this.formDomicilio.get('referencia').value,
                        "colonia": this.formDomicilio.get('catColonia').value,
                        "nacionalidad": this.formDomicilio.get('catNacionalidad').value,
                        "extencionDomicilio": {
                            "resExtranjera": this.formDomicilio.get('resExtranjera').value,
                            "latitud": varLatitud,
                            "longitud": varLongitud,
                            "tiempoArraigo": {
                                "generalesId": this.formDomicilio.get('tiempoArraigo').value
                            }
                        }
                    }
                }
            },
            "contactos": [[this.agendaID, this.formDomicilio.get('telefono').value, this.formDomicilio.get('email').value]],

            "accion": 2
        }

        this.service.registrar(data, 'crudProveedor').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        )

    }

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

    /**
 * Método para consultar y listar los tipos de operacion.
 * @param general
 */
    spsTipoOperacion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('34TO', 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoOpe = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
* Método para consultar y listar los tipos de tercero.
* @param general
*/
    spsTipoTercero() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('33TT', 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoTer = data;
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
            this.opcionesEstado = this.formDomicilio.get('estado').valueChanges.pipe(
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
* Método para consultar tipo compra y llenar el autocomplete.
*/
    spsTcompra() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('17TC', 'listaGeneralCategoria').subscribe(data => {
            this.listatipoc = data;
            this.opciontcompra = this.formDomicilio.get('tcompra').valueChanges.pipe(
                startWith(''),
                map(value => this._filterTCompra(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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
            this.opcionesColonias = this.formDomicilio.get('catColonia').valueChanges.pipe(
                startWith(''),
                map(value => this._filterColonias(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }

    /**
* Filtra la categoría de tipo compra
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterTCompra(value: any): any[] {

        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listatipoc.filter(option => option.descripcion.toLowerCase().includes(filterValue));
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
     * Muestra la descripción de la colonia 
     * @param option --colonia seleccionada
     * @returns -- colonia
     *  option.nombrecolonia 
     */
    displayFntcompra(option: any): any {
        return option ? option.descripcion : undefined;
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
 * Método para setear el id a filtrar
 * @param event  - Evento a setear
 */
    opcionSelectcompra(event) {
        this.selectedIdtcompra = event.option.value.generalesId;

    }

    /**
     * Valida cada atributo del formulario
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
            this.opcionesLocalidades = this.formDomicilio.get('localidad').valueChanges.pipe(
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
            this.opcionesCiudades = this.formDomicilio.get('ciudad').valueChanges.pipe(
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
            this.opcionesNacionalidad = this.formDomicilio.get('catNacionalidad').valueChanges.pipe(
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

    spsNacionalidadProv() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaNacionalidades').subscribe(data => {
            this.listaNacionalidadProv = data;
            this.opcionesNacionalidadProv = this.formDomicilio.get('provNacionalidad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNacionalidadProv(value))
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
    displayFnNacionalidadProv(option: any): any {
        return option ? option.nacion : undefined;
    }

    /**
     * Metodo para filtrar por ciudad ID las localidades
    */
    opcionSelectNacionalidadProv(event) {
        this.selectedIdNacionalidadProv = event.option.value.nacion;
    }

    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterNacionalidadProv(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaNacionalidadProv.filter(option => option.nacion.toLowerCase().includes(filterValue));
    }

    /**
    * Metodo para consultar Bancos Sat
    */
    spsBancoSat() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaBancoSat').subscribe(data => {
            this.listaBancoSat = data;
            this.opcionesBancoSat = this.formDomicilio.get('BancoSat').valueChanges.pipe(
                startWith(''),
                map(value => this._filterBancoSat(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
  * Muestra la descripcion del banco sat
  * @param option --banco sat seleccionado
  * @returns --nombre del baco
  */
    displayFnBancoSat(option: any): any {
        return option ? option.nombreBanco : undefined;
    }


    /**
* Filtra el estado
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterBancoSat(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaBancoSat.filter(option => option.nombreBanco.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionadaBancoSat(event) {
        this.selectedIdBSat = event.option.value.bancosatId;
    }

    /**
    * Metodo para consultar estados
    */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursal = data;
            this.opcionesSucursal = this.formDomicilio.get('Sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSuc(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
  * Muestra la descripcion del estado
  * @param option --estado seleccionado
  * @returns --nombre de estado
  */
    displayFnSuc(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
* Filtra el estado
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterSuc(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaSucursal.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionSuc(event) {
        this.selectedIdSuc = event.option.value.sucursalid;
    }

}