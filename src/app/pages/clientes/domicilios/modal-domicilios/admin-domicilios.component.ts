import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators,ValidatorFn ,AbstractControl} from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";



@Component({
    selector: 'admin-domicilios',
    moduleId: module.id,
    templateUrl: 'admin-domicilios.component.html'
})

/**
 * @autor: Eduardo Romero Haro
 * @version: 1.0.0
 * @fecha: 15/10/2021
 * @descripcion: Componente para la gestion de domicilios
 */

export class AdministracionDomiciliosComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    domicilioID: number = 0;
    selectedId: number;
    @BlockUI() blockUI: NgBlockUI;
    formDomicilio: UntypedFormGroup;

    /** Controles Nacionalidad**/
    selectedIdNacionalidad: number = 0;
    listaNacionalidad: any[];
    opcionesNacionalidad: Observable<string[]>;
    nacionalidadId: number;
    /** Fin Controles Nacionalidad */

    /** Controles Tiempo Arraigo **/
    arraigoGeneralId: any;
    listaTiempoArraigo: any;
    tiempoArraigoControl = new UntypedFormControl('', [Validators.required])
    /** Fin Controles Tiempo Arraigo **/

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

    /** Controles Numero Domicilio **/
    numeroDomicilioGeneralId: any;
    listaNumeroDomicilio: any;
    numeroDomicilioControl = new UntypedFormControl('', [Validators.required])
    /** Fin Controles Numero Domicilio **/



    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.titulo = data.titulo + ' domicilios';
        this.accion = data.accion;
        //Se asigan valor y se validan las componentes
        this.formDomicilio = this.formBuilder.group({
            calle: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            numeroExterior: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            estadoH: new UntypedFormControl(''),
            numeroInterior: new UntypedFormControl('', [Validators.required, Validators.maxLength(20)]),
            entreCalle1: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            entreCalle2: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            referencia: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            latitud: new UntypedFormControl('', [Validators.required, Validators.maxLength(26)]),
            longitud: new UntypedFormControl('', [Validators.required, Validators.maxLength(26)]),
            resExtranjera: new UntypedFormControl('',[Validators.required]),
            tiempoArraigo: this.tiempoArraigoControl,
            estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            localidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catColonia: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catNacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            numeroDomicilio: this.numeroDomicilioControl,
            codigoPostal: new UntypedFormControl('', [Validators.maxLength(13)]),
        });


        //Se obtienen los valores para poder pintarlos en el modal.
        if (this.accion === 2) {

            this.domicilioID = data.domicilio.domicilioID
            this.formDomicilio.get('calle').setValue(data.domicilio.calle);
            this.formDomicilio.get('numeroExterior').setValue(data.domicilio.numeroExterior);
            this.formDomicilio.get('numeroInterior').setValue(data.domicilio.numeroInterior);
            this.formDomicilio.get('entreCalle1').setValue(data.domicilio.entreCalle1);
            this.formDomicilio.get('entreCalle2').setValue(data.domicilio.entreCalle2);
            this.formDomicilio.get('referencia').setValue(data.domicilio.referencia);
            this.formDomicilio.get('resExtranjera').setValue(data.domicilio.extencionDomicilio.resExtranjera);
            this.formDomicilio.get('latitud').setValue(data.domicilio.extencionDomicilio.latitud);
            this.formDomicilio.get('longitud').setValue(data.domicilio.extencionDomicilio.longitud);
            this.formDomicilio.get('catNacionalidad').setValue(data.domicilio.catNacionalidad);
            this.formDomicilio.get('catColonia').setValue(data.domicilio.catColonia);
            this.formDomicilio.get('estado').setValue(data.domicilio.extencionDomicilio.catEstado);
            this.formDomicilio.get('ciudad').setValue(data.domicilio.extencionDomicilio.catCiudad);
            this.formDomicilio.get('localidad').setValue(data.domicilio.extencionDomicilio.catLocalidad);
            this.formDomicilio.get('tiempoArraigo').setValue(data.domicilio.extencionDomicilio.catGeneral.generalesId);
            this.formDomicilio.get('codigoPostal').setValue(data.domicilio.extencionDomicilio.codigoPostal);
            this.formDomicilio.get('numeroDomicilio').setValue(data.domicilio.extencionDomicilio.catGeneralNumeroDomicilio.generalesId);
        }

    }

    /** Creación del arreglo para implementar las validaciones
    en el modal de admin-domicilios.component.html **/
    validaciones = {
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
            { type: 'maxlength', message: 'Campo máximo 26 caracteres.' },
        ],
        'longitud': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 26 caracteres.' },
        ],
        'resExtranjera': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 13 caracteres.' },
        ],
        'tiempoArraigo': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'numeroDomicilio': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'codigoPostal': [
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
        this.spsEstados();
        this.spsNacionalidad();
        this.spsNumeroDomicilio();
    }

    /**
     * Método que guarda y edita domicilios.
     */
    crudDomicilios() {
        /**
         * Validación complementaria para la validación de guardado de datos en el formulario formDomicilio
         */

        if (this.formDomicilio.invalid) {
            this.validateAllFormFields(this.formDomicilio);
            return;
        }

        /**
         * Se estructura y se setean los datos al JSON para funcionalidad crud.
         */
        const data = {
            "domicilioID": this.domicilioID,
            "calle": this.formDomicilio.get("calle").value,
            "numeroExterior": this.formDomicilio.get('numeroExterior').value,
            "numeroInterior": this.formDomicilio.get('numeroInterior').value,
            "entreCalle1": this.formDomicilio.get('entreCalle1').value,
            "entreCalle2": this.formDomicilio.get('entreCalle2').value,
            "referencia": this.formDomicilio.get('referencia').value,
            "catColonia": this.formDomicilio.get('catColonia').value,
            "catNacionalidad": this.formDomicilio.get('catNacionalidad').value,
            "extencionDomicilio": {
                "resExtranjera": this.formDomicilio.get('resExtranjera').value,
                "latitud": this.formDomicilio.get('latitud').value,
                "longitud": this.formDomicilio.get('longitud').value,
                "catGeneral": {
                    "generalesId": this.formDomicilio.get('tiempoArraigo').value
                },
                "codigoPostal": this.formDomicilio.get('codigoPostal').value,
                "catGeneralNumeroDomicilio": {
                    "generalesId": this.formDomicilio.get('numeroDomicilio').value
                }
            }
        }

        /**
         * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
         * de acuerdo al tipo de accion al que pertenezca.
         */
        if (this.accion === 2) {
            this.blockUI.start('Editando ...');
        } else {
            this.blockUI.start('Guardando ...');
        }
        this.service.registrarBYID(data, this.accion, 'crudDomicilios').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (this.accion !== 2) {
                        this.formDomicilio.reset();
                    }
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
    validateAllFormFields(formGroup: UntypedFormGroup) {           //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);           //{3}
            if (control instanceof UntypedFormControl) {           //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {      //{5}
                this.validateAllFormFields(control);        //{6}
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

    /** Metodo para filtar asentamiento **/
    opcionSelecAsen(event) {
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

    /*  
     * Método para consultar y listar el numero domicilio.
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

}