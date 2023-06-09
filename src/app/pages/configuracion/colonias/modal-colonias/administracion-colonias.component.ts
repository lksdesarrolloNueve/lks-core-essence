import { Component, Inject, OnInit } from "@angular/core";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ThemePalette } from "@angular/material/core";

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 28/09/2021
 * @descripcion: Componente para la gestion de tipos amortizaciones
 */
@Component({
    selector: 'administracion-colonias',
    moduleId: module.id,
    templateUrl: 'administracion-colonias.component.html'
})

export class AdminColoniaComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Colonia';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';
    coloniaid: number;
    formColonia: UntypedFormGroup;
    ciudadID: number;
    @BlockUI() blockUI: NgBlockUI;

    /**Controles Estados */
    opcionesEstado: Observable<string[]>;
    selectedId: number;
    listaEstados: any;
    /**Fin Controles Estados */

    /**Controles Ciudad */
    opcionesCiudades: Observable<string[]>;
    selectedIdCiudad: number;
    listaCiudadEstado: any;
    /**Fin Control Ciudad */

    /**Controles localidad */
    opcionesLocalidades: Observable<string[]>;
    selectedIdLocalidad: number;
    listaLocalidad: any;
    /**Fin Control localidad */

    /**controles categoria*/
    opcionAsentamiento: Observable<string[]>;
    selectedIdAsen: number;
    listaAsentamiento: any;
    /**fin */


    /**
    * Constructor de la clase
    * @param service - Instancia de acceso a datos
    * @param data - Datos recibidos desde el padre
    */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        //validacion de campos requeridos
        this.formColonia = this.formBuilder.group({
            colonia: new UntypedFormControl('', [Validators.required]),
            codigopostal: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
            codpatid: new UntypedFormControl('', [Validators.required]),
            cveInegi: new UntypedFormControl('', [Validators.required, Validators.maxLength(15), Validators.pattern("^[0-9]*$")]),
            cveSiti: new UntypedFormControl('', [Validators.required, Validators.maxLength(15), Validators.pattern("^[0-9]*$")]),
            estatus: new UntypedFormControl(true),
            localidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            asentamiento: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] })


        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.coloniaid = data.colonia.coloniaID;
            this.formColonia.get('colonia').setValue(data.colonia.nombrecolonia);
            this.formColonia.get('codigopostal').setValue(data.colonia.codP);
            this.formColonia.get('codpatid').setValue(data.colonia.codpatid);
            this.formColonia.get('cveInegi').setValue(data.colonia.cveInegi);
            this.formColonia.get('cveSiti').setValue(data.colonia.cveSiti);
            this.formColonia.get('estatus').setValue(data.colonia.estatus);
            this.formColonia.get('ciudad').setValue(data.colonia.ciudad);
            this.formColonia.get('localidad').setValue(data.colonia.localidad);
            this.formColonia.get('asentamiento').setValue(data.colonia.catg);
            this.selectedIdCiudad = data.colonia.ciudad.ciudaId;


        }

    }

    /**
   * Metodo OnInit de la clase
   */
    ngOnInit() {
        this.spsEstados();
        this.spsCategoria();
    }

    /**
    * Metodo para consultar estados
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;

            this.opcionesEstado = this.formColonia.get('estado').valueChanges.pipe(
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
    * Metodo para consultar categoria
    */
    spsCategoria() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID('04AS', 'listaGeneralCategoria').subscribe(data => {
            this.listaAsentamiento = data;

            this.opcionAsentamiento = this.formColonia.get('asentamiento').valueChanges.pipe(
                startWith(''),
                map(value => this._filterAsentamiento(value))
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
    displayFn(option: any): any {
        return option ? option.nombreEstado : undefined;
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
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedIdCiudad, 'spsLocalidades').subscribe(data => {
            this.listaLocalidad = data;
            this.opcionesLocalidades = this.formColonia.get('localidad').valueChanges.pipe(
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
    * Filtra el estado
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterAsentamiento(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaAsentamiento.filter(option => option.descripcion.toLowerCase().includes(filterValue));
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
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionada(event) {
        this.selectedId = event.option.value.estadoid;
        this.spsCiudad();
    }

    /**metodo para filtar asentamiento */
    opcionSelecAsen(event) {
    }

    /**
     * Filtra Ciudades por Estado ID
     */
    spsCiudad() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedId, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            this.opcionesCiudades = this.formColonia.get('ciudad').valueChanges.pipe(
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


    /**
     * MEtodo para filtrar por ciudad ID las localidades
     */
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.spsLocalidad();
    }

    /**
  * MEtodo para filtrar por ciudad ID las colonias
  */
    opcionSelecLocalidad(event) {
        this.selectedIdLocalidad = event.option.value.localidadid;
    }

    /**
     * MEtodo para guardar una colonia
     */
    guardarColonia() {
        if (this.formColonia.invalid) {
            this.validateAllFormFields(this.formColonia);
            this.service.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }
        this.blockUI.start('Guardando ...');

        const data = {
            "coloniaID": 0,
            "nombrecolonia": this.formColonia.get('colonia').value,
            "ciudad": this.formColonia.get('ciudad').value,
            "codP": this.formColonia.get('codigopostal').value,
            "catg": this.formColonia.get('asentamiento').value,
            "localidad": this.formColonia.get('localidad').value,
            "codpatid": this.formColonia.get('codpatid').value,
            "cveInegi": this.formColonia.get('cveInegi').value,
            "cveSiti": this.formColonia.get('cveSiti').value,
            "estatus": this.formColonia.get('estatus').value,
        };
        this.service.registrarBYID(data, 1, 'crudColonia').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formColonia.reset();
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );


    }

    /**
     * Metodo para editar la colonia
     */
    editarColonia() {
        if (this.formColonia.invalid) {
            this.validateAllFormFields(this.formColonia);
            this.service.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
            return;
        }
        this.blockUI.start('Editando ...');
        this.ciudadID = this.formColonia.get('ciudad').value.ciudadId;
        // se asignan los datos a actualizar/Editar
        const data = {
            "coloniaID": this.coloniaid,
            "nombrecolonia": this.formColonia.get('colonia').value,
            "ciudad": this.formColonia.get('ciudad').value,
            "codP": this.formColonia.get('codigopostal').value,
            "catg": this.formColonia.get('asentamiento').value,
            "localidad": this.formColonia.get('localidad').value,
            "codpatid": this.formColonia.get('codpatid').value,
            "cveInegi": this.formColonia.get('cveInegi').value,
            "cveSiti": this.formColonia.get('cveSiti').value,
            "estatus": this.formColonia.get('estatus').value,

        };
        this.service.registrarBYID(data, 2, 'crudColonia').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formColonia.reset();
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }

    //Arreglo de mensajes a mostrar al validar formulario
    validaciones = {
        'cveInegi': [
            { type: 'required', message: ' Clave inegi requerida.' },
            { type: 'pattern', message: 'Solo números.' }
        ],
        'cveSiti': [
            { type: 'required', message: ' Clave siti requerida.' },
            { type: 'pattern', message: 'Solo números.' }
        ],
        'codigopostal': [
            { type: 'required', message: 'CP requerido.' },
            { type: 'pattern', message: 'Solo números.' }
        ],

        'colonia': [
            { type: 'required', message: 'Colonia requerida.' }
        ],

        'codpatid': [
            { type: 'required', message: 'Rellena con 0(caso de no tener clave)' }
        ],
        'estado': [
            { type: 'required', message: 'Estado requerido para filtro ciudad' },
            { type: 'autocompleteObjectValidator', message: 'El estado no existe elije otro.' }
        ],

        'asentamiento': [
            { type: 'required', message: 'Asentamiento requerido' },
            { type: 'autocompleteObjectValidator', message: 'El asentamiento no existe elije otro.' }
        ],
        'ciudad': [
            { type: 'required', message: 'Ciudad requerida' },
            { type: 'autocompleteObjectValidator', message: 'La ciudad no existe elije otra.' }
        ],
        'localidad': [
            { type: 'required', message: 'Localidad requerida' },
            { type: 'autocompleteObjectValidator', message: 'La localidad no existe elije otra.' }
        ]
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
}
