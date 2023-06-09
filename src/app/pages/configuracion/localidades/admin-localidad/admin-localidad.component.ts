import { Component, Inject, OnInit } from "@angular/core";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ThemePalette } from "@angular/material/core";

@Component({
    selector: 'admin-localidad',
    moduleId: module.id,
    templateUrl: 'admin-localidad.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/09/2021
 * @descripcion: Componente para la gestion de localidades
 */
export class AdminLocalidadComponent implements OnInit {


    //Declaracion de variables y componentes
    titulo = 'LOCALIDAD';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';

    localidadid: number;
    formLocalidad: UntypedFormGroup;


    @BlockUI() blockUI: NgBlockUI;




    /**Controles Estados */
   
    opcionesEstado: Observable<string[]>;
    selectedId: number;
    listaEstados: any;
    /**Fin Controles Estados */

    /**Controles Ciudad */
    mostrarCiudad: boolean = false;
    ciudad = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    opcionesCiudades: Observable<string[]>;
    selectedIdCiudad: number;
    listaCiudadEstado: any;
    /**Fin Control Ciudad */


    /**
    * Constructor de la clase
    * @param service - Instancia de acceso a datos
    * @param data - Datos recibidos desde el padre
    */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formLocalidad = this.formBuilder.group({
            localidad: new UntypedFormControl('', [Validators.required, Validators.maxLength(150)]),
            cveLocalidadInegi: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            cveMunicipioInegi: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            cveInegi: new UntypedFormControl('', [Validators.required, Validators.maxLength(15), Validators.pattern("[A-Z0-9]*")]),
            estatus: new UntypedFormControl(true),
            estado:  new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] })
        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.localidadid = data.localidad.localidadid;
            this.formLocalidad.get('localidad').setValue(data.localidad.nombreLocalidad);
            this.formLocalidad.get('cveLocalidadInegi').setValue(data.localidad.cveLocalidadInegi);
            this.formLocalidad.get('cveMunicipioInegi').setValue(data.localidad.cveMunicipioInegi);
            this.formLocalidad.get('cveInegi').setValue(data.localidad.cveInegi);
            this.formLocalidad.get('estatus').setValue(data.localidad.estatus);

            this.formLocalidad.get('estado').setValue(data.localidad.estado);

            this.selectedId = data.localidad.estado.estadoid;
            this.spsCiudad();
            this.ciudad.setValue(data.localidad.ciudad);

        }

    }



    /**
   * Metodo OnInit de la clase
   */
    ngOnInit() {
        this.spsEstados();

    }



    /**
    * Metodo para consultar estados
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            this.opcionesEstado =  this.formLocalidad.get('estado').valueChanges.pipe(
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
      * Muestra la descripcion del estado
      * @param option --estado seleccionada
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
    * Filtra el estado
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaEstados.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
    }


    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionada(event) {
        this.selectedId = event.option.value.estadoid;
        this.spsCiudad();
    }


    /**
     * Filtra Ciudades por Esatdo ID
     */
    spsCiudad() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedId, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            this.opcionesCiudades = this.ciudad.valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudad(value))
            );
            this.mostrarCiudad = true;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
* Filta la categoria
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filterCiudad(value: any): any[] {

        let filterValue = value;

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
    }

    /**
     * MEtodo para guardar una localidad
     */
    guardarLocalidad() {

        if (this.formLocalidad.invalid) {
            this.validateAllFormFields(this.formLocalidad);
            return;
        }



        if (this.ciudad.invalid) {
            return;
        }

  

        this.blockUI.start('Guardando ...');


        const data = {
            "localidadid": 0,
            "nombreLocalidad": this.formLocalidad.get('localidad').value,
            "cveLocalidadInegi": this.formLocalidad.get('cveLocalidadInegi').value,
            "cveMunicipioInegi": this.formLocalidad.get('cveMunicipioInegi').value,
            "cveInegi": this.formLocalidad.get('cveInegi').value,
            "estatus": this.formLocalidad.get('estatus').value,
            "ciudad": this.ciudad.value,
            "estado":  this.formLocalidad.get('estado').value
        };



        this.service.registrarBYID(data, 1, 'crudLocalidad').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formLocalidad.reset();
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
     * Metodo para editar las localidades
     */
    editarLocalidad() {


        if (this.ciudad.invalid) {
            return;
        }

        if (this.formLocalidad.invalid) {
            this.validateAllFormFields(this.formLocalidad);
            return;
        }

        this.blockUI.start('Editando ...');

        const data = {
            "localidadid": this.localidadid,
            "nombreLocalidad": this.formLocalidad.get('localidad').value,
            "cveLocalidadInegi": this.formLocalidad.get('cveLocalidadInegi').value,
            "cveMunicipioInegi": this.formLocalidad.get('cveMunicipioInegi').value,
            "cveInegi": this.formLocalidad.get('cveInegi').value,
            "estatus": this.formLocalidad.get('estatus').value,
            "ciudad": this.ciudad.value,
            "estado":  this.formLocalidad.get('estado').value
        };



        this.service.registrarBYID(data, 2, 'crudLocalidad').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formLocalidad.reset();
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

    /**
    * Validacion para los campos
    */
    validaciones = {

        'estado': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El estado no existe elije otro.' }
        ],
        'ciudad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La ciudad no existe elije otro.' }
        ],
        'localidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 150 dígitos.' },
        ],
        'cveLocalidadInegi': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo numeros enteros.' },
        ],
        'cveMunicipioInegi': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo numeros enteros.' },
        ],
        'cveInegi': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 15 dígitos.' },
            { type: 'pattern', message: 'Solo se aceptan Mayusculas y numeros.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }



}