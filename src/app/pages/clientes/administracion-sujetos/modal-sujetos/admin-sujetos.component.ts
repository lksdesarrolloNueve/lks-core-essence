import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { environment } from '../../../../../environments/environment';
import * as moment from 'moment';

@Component({
    selector: 'admin-sujetos',
    moduleId: module.id,
    templateUrl: 'admin-sujetos.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la Administración de Sujetos
 */
export class AdministracionSujetosComponent implements OnInit {

    //Declaracion de variables, constantes, listas 
    titulo: string;
    accion: number;
    formSujetos: UntypedFormGroup;
    listaGenero: any[];
    opcionesGenero: Observable<string[]>;
    listaEstadoCivil: any[];
    opcionesEstadoCivil: Observable<string[]>;
    listaNacionalidad: any[];
    opcionesNacionalidad: Observable<string[]>;
    listaEstados: any;
    opcionesEstado: Observable<string[]>;
    listaCiudadEstado: any[];
    opcionesCiudades: Observable<string[]>;
    listaTipoIdentificaciones: any[];
    opcionesIdentificaciones: Observable<string[]>;
    listaIdentificaciones = [];
    listaIdentificacionesSeleccionados = [];

    selectedIdCiudad: number = 0;
    selectedIdEstado: number = 0;
    sujetoId: number = 0;
    agendaId: number = 0;

    // Obtenemos las categorias
    genero = environment.categorias.catGenero;
    tipoIden = environment.categorias.catIdentificacion;
    estadoCivil = environment.categorias.catEstCivil;
    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase AdministracionDepreciacionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        // Seteamos los datos que se pasan desde DepreciacionesComponent.
        this.titulo = data.titulo + ' SUJETO';
        this.accion = data.accion;

        // Creamos las validaciones de los campos.
        this.formSujetos = this.formBuilder.group({
            nombres: new UntypedFormControl('', [Validators.required, Validators.maxLength(100), Validators.pattern('[a-zA-Z ]{3,100}')]),
            apellidoPaterno: new UntypedFormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z ]{3,50}')]),
            apellidoMaterno: new UntypedFormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern('[a-zA-Z ]{3,50}')]),
            fechaNacimiento: new UntypedFormControl({ value: new Date(), disabled: true }, [Validators.required]),
            rfc: new UntypedFormControl({ value: '', disabled: true }, [Validators.required, Validators.maxLength(13), Validators.pattern('[A-Z,Ñ,&]{3,4}[0-9]{2}[0-1][0-9][0-3][0-9][A-Z,0-9]?[A-Z,0-9]?[0-9,A-Z]')]),
            curp: new UntypedFormControl({ value: '', disabled: true }, [Validators.required, Validators.maxLength(18), Validators.pattern('^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$')]),
            genero: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            estadoCivil: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            nacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            paisNac: new UntypedFormControl({ value: '', disabled: true }),
            estadoNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            ciudadNac: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            tipoIdentificacion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            correoElectronico: new UntypedFormControl('', [Validators.maxLength(50), Validators.pattern("[a-zA-Z0-9!#$%&'*_+-]([\.]?[a-zA-Z0-9!#$%&'*_+-])+@[a-zA-Z0-9]([^@&%$\/()=?¿!.,:;]|\d)+[a-zA-Z0-9][\.][a-zA-Z]{2,4}([\.][a-zA-Z]{2})?")]),
            telefono: new UntypedFormControl('', [Validators.maxLength(10), Validators.minLength(10), Validators.pattern('[0-9]*')]),
            numIdentificacion: new UntypedFormControl('', [Validators.maxLength(20)]),
            vigencia: new UntypedFormControl({ value: new Date(), disabled: true }),
            estatus: new UntypedFormControl(true)
        });

        /** 
         * Si la accion = 2, se setean los datos al modal para la editacion de datos.
         * Se obtienen los datos de la tabla y se setean al formulario del modal.
        */
        if (this.accion === 2) {
            this.sujetoId = data.sujeto.sujeto.sujetoId;
            this.formSujetos.get('nombres').setValue(data.sujeto.sujeto.nombres);
            this.formSujetos.get('apellidoPaterno').setValue(data.sujeto.sujeto.apellidoPaterno);
            this.formSujetos.get('apellidoMaterno').setValue(data.sujeto.sujeto.apellidoMaterno);
            this.formSujetos.get('fechaNacimiento').setValue(data.sujeto.sujeto.fechaNacimiento + 'T00:00:00');
            this.formSujetos.get('rfc').setValue(data.sujeto.sujeto.rfc);
            this.formSujetos.get('curp').setValue(data.sujeto.sujeto.curp);
            this.formSujetos.get('genero').setValue(data.sujeto.sujeto.generoId);
            this.formSujetos.get('estadoCivil').setValue(data.sujeto.sujeto.extSujeto.estadoCivilId);
            this.formSujetos.get('nacionalidad').setValue(data.sujeto.sujeto.nacionalidaId);
            this.formSujetos.get('estadoNac').setValue(data.sujeto.sujeto.extSujeto.paisNacId);
            this.formSujetos.get('ciudadNac').setValue(data.sujeto.sujeto.extSujeto.ciudadNacId);
            this.agendaId = data.sujeto.agenda.agendaID;
            this.formSujetos.get('correoElectronico').setValue(data.sujeto.agenda.correoElectronico);
            this.formSujetos.get('telefono').setValue(data.sujeto.agenda.telefono);
            this.formSujetos.get('estatus').setValue(data.sujeto.estatus);
            //if (data.sujeto.identificaciones !== '' || data.sujeto.identificaciones !== null) { 
            // Trae identificaciones
            // Parceamos las identificaciones a JSON y las guardamos en listaIdentificaciones
            this.listaIdentificaciones = JSON.parse(data.sujeto.identificaciones);
            if (!this.vacio(this.listaIdentificaciones)) {
                // Recorremos la lista identificaciones para formar la matriz y guardarla en listaIdentificacionesSeleccionados
                this.listaIdentificaciones.forEach(element => {
                    let objeto = [
                        element.identificacionId,
                        element.numIdentificacion,
                        element.vigencia,
                        element.tipoIdentificacionId,
                        element.tipoIdentificacion
                    ];
                    this.listaIdentificacionesSeleccionados.push(objeto);
                });
            }

            //}
        }

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsNacionalidad();
        this.spsEstados();
        this.spsTipoIdentificacion();
        this.spsGenero();
        this.spsEstadoCivil();
    }

    /**
     * Metodo que guarda y edita sujetos
     */
    crudSujetos() {

        // Validación del form
        if (this.formSujetos.invalid) {
            this.validateAllFormFields(this.formSujetos);
            return;
        }
        // Parseamos la fecha para quitarle 
        let fechaNacimiento = moment(this.formSujetos.get('fechaNacimiento').value).format("yyyy-MM-DD");
        /**
         * Se estructura y se setean los datos al JSON
         */
        const data = {

            "sujeto": {
                "sujetoId": this.sujetoId,
                "nombres": this.formSujetos.get('nombres').value,
                "apellidoPaterno": this.formSujetos.get('apellidoPaterno').value,
                "apellidoMaterno": this.formSujetos.get('apellidoMaterno').value,
                "fechaNacimiento": fechaNacimiento,
                "generoId": this.formSujetos.get('genero').value,
                "nacionalidaId": this.formSujetos.get('nacionalidad').value,
                "rfc": this.formSujetos.get('rfc').value,
                "curp": this.formSujetos.get('curp').value,
                "extSujeto": {
                    "estadoCivilId": this.formSujetos.get('estadoCivil').value,
                    "paisNacId": this.formSujetos.get('estadoNac').value,
                    "ciudadNacId": this.formSujetos.get('ciudadNac').value,
                }
            },
            "agenda": {
                "agendaID": this.agendaId,
                "telefono": this.formSujetos.get('telefono').value,
                "correoElectronico": this.formSujetos.get('correoElectronico').value
            },
            "matrizIdentificaciones": this.listaIdentificacionesSeleccionados,
            "estatus": this.formSujetos.get('estatus').value
        }
        /** 
         * Decision para el mensaje de bloqueo de pantalla.
         * Si accion 2 = Editar
         * Accion 1 = Guardar
        */
        if (this.accion === 2) {
            this.blockUI.start("Editando ...");
        } else {
            this.blockUI.start("Guardando ...");
        }

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
        */
        this.service.registrarBYID(data, this.accion, 'crudSujetos').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if (result[0][0] === '0') {
                    if (this.accion === 1) {
                        this.nuevoRegistro();
                    }
                    // Se muestra el mensaje al front
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    // Hubo un error al momento de realizar la petición
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => { // Cacheo de errores al momento del consumo de la api.
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )
    }

    /**
     * Metodo que lista el genero
     */
    spsGenero() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.genero, 'listaGeneralCategoria').subscribe(data => {
            this.listaGenero = data;
            this.opcionesGenero = this.formSujetos.get('genero').valueChanges.pipe(
                startWith(''),
                map(value => this._filterG(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
       * Muestra la descripción del genero
       * @param option --estado seleccionado
       * @returns --nombre de genero
       */
    displayFnG(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filtra el genero
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterG(value: any): any {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaGenero.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * Metodo que lista el estado civil
     */
    spsEstadoCivil() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.estadoCivil, 'listaGeneralCategoria').subscribe(data => {
            this.listaEstadoCivil = data;
            this.opcionesEstadoCivil = this.formSujetos.get('estadoCivil').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEC(value))
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
    displayFnEC(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filtra el genero
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterEC(value: any): any {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEstadoCivil.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * Metodo que lista el tipo identificacion
     */
    spsTipoIdentificacion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.tipoIden, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoIdentificaciones = data;
            this.opcionesIdentificaciones = this.formSujetos.get('tipoIdentificacion').valueChanges.pipe(
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
     * Metodo que enlista las naciones
     */
    spsNacionalidad() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaNacionalidades').subscribe(data => {
            this.listaNacionalidad = data;
            this.opcionesNacionalidad = this.formSujetos.get('nacionalidad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNacionalidad(value))
            );
            // Editar
            if (this.accion === 2) {
                let nacionalidad: any
                //Busca la información de la lista original por el id
                nacionalidad = this.listaNacionalidad.find(x => x.nacionalidadid === this.data.sujeto.sujeto.nacionalidaId.nacionalidadid);
                // Se pasa al siguiente metodo para setear el pais al form
                this.nacionalidadSeleccionada(nacionalidad);
            }
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
    displayFnNac(option: any): any {
        return option ? option.nacion : undefined;
    }

    /**
     * Metodo para filtrar por Nacionalidad
    */
    nacionalidadSeleccionada(element: any): any {
        this.formSujetos.get('paisNac').setValue(element.pais);
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
    * Método para consultar y listar estados y realzia el autocomplete.
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            this.opcionesEstado = this.formSujetos.get('estadoNac').valueChanges.pipe(
                startWith(''),
                map(value => this._filterE(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
       * Muestra la descripción del estado
       * @param option --estado seleccionado
       * @returns --nombre de estado
       */
    displayFnE(option: any): any {
        return option ? option.nombreEstado : undefined;
    }

    /**
    * Filtra el estado
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterE(value: any): any {
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
    estadoSeleccionado(event) {
        this.selectedIdEstado = event.option.value.estadoid;
        this.spsCiudad();
        //Generar CURP y RFC
        this.generarCurp();
    }

    /**
     * Filtra Ciudades por Estado ID
     */
    spsCiudad() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.selectedIdEstado, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            this.opcionesCiudades = this.formSujetos.get('ciudadNac').valueChanges.pipe(
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
    * Muestra la descripcion de la ciudad
    * @param option --ciudad seleccionada
    * @returns --nombre de ciudad
    */
    displayFnCiudad(option: any): any {
        return option ? option.nombre : undefined;
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
     * Metodo para generar la CURP y RFC
     */
    generarCurp() {
        let fechaNacimiento = moment(this.formSujetos.get('fechaNacimiento').value).format("yyyy-MM-DD");
        let sexo: any;
        let municipio: any;
        sexo = this.formSujetos.get('genero').value.descripcion.toUpperCase();
        municipio = this.formSujetos.get('estadoNac').value.nombreEstado.toUpperCase();
        if (sexo == 'FEMENINO') {
            sexo = 'M';
        } else {
            sexo = 'H';
        }
        //uso del JS para generar CURP
        let persona = environment.curp.getPersona();
        persona.nombre = this.formSujetos.get('nombres').value;
        persona.apellidoPaterno = this.formSujetos.get('apellidoPaterno').value;
        persona.apellidoMaterno = this.formSujetos.get('apellidoMaterno').value;
        persona.genero = sexo;
        persona.fechaNacimiento = fechaNacimiento;
        persona.estado = municipio;
        let curpGenerada = environment.curp.generar(persona);
        //asignacion de datos
        this.formSujetos.get('curp').setValue(curpGenerada);
        this.formSujetos.get('rfc').setValue(curpGenerada.substring(0, 10));
    }

    /**
    * Metodo para agregar datos a la lista de identificaciones
    */
    agregarIdentificaciones() {
        let tipoIdentificacion = this.formSujetos.get('tipoIdentificacion').value;
        let numIdentificacion = this.formSujetos.get('numIdentificacion').value;
        let vigencia = moment(this.formSujetos.get('vigencia').value).format("yyyy-MM-DD");

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

                this.formSujetos.get('tipoIdentificacion').setValue('');
                this.formSujetos.get('numIdentificacion').setValue('');
                this.formSujetos.get('vigencia').setValue(new Date());

            } else {// La lista no se encuentra vacia.
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
                        this.formSujetos.get('tipoIdentificacion').setValue('');
                        this.formSujetos.get('numIdentificacion').setValue('');
                        this.formSujetos.get('vigencia').setValue(new Date());
                        this.listaIdentificacionesSeleccionados.push(objeto);
                    } else { // Existe
                        this.service.showNotification('top', 'right', 3, 'Ya existe la identificación: ' + numIdentificacion + '.');
                        return;
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
                        this.formSujetos.get('tipoIdentificacion').setValue('');
                        this.formSujetos.get('numIdentificacion').setValue('');
                        this.formSujetos.get('vigencia').setValue(new Date());
                        this.service.showNotification('top', 'right', 1, "La identificación ya se encuentra registrada, solo se actualizaron sus valores.")
                    } else { // Existe
                        this.service.showNotification('top', 'right', 3, 'Ya existe la identificación: ' + numIdentificacion + '.');
                        return;
                    }
                }
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
        this.formSujetos.get('tipoIdentificacion').setValue(tipoIdentificacionId);
        this.formSujetos.get('numIdentificacion').setValue(elemento[1]);
        this.formSujetos.get('vigencia').setValue(new Date(elemento[2] + 'T00:00:00'));
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
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
    */
    validaciones = {
        'nombres': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 100 dígitos.' },
            { type: 'pattern', message: 'Campo solo letras.' }
        ],
        'apellidoPaterno': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 50 dígitos.' },
            { type: 'pattern', message: 'Campo solo letras.' }
        ],
        'apellidoMaterno': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 50 dígitos.' },
            { type: 'pattern', message: 'Campo solo letras.' }
        ],
        'estadoCivil': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Estado Civil no pertenece a la lista, elija otra.' }
        ],
        'genero': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Genero no pertenece a la lista, elija otra.' }
        ],
        'nacionalidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Nacionalidad no pertenece a la lista, elija otra.' }
        ],
        'estadoNac': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Estado no pertenece a la lista, elija otra.' }
        ],
        'ciudadNac': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La Ciudad no pertenece a la lista, elija otra.' }
        ],
        'telefono': [
            { type: 'maxlength', message: 'Campo maximo 10 dígitos.' },
            { type: 'minlength', message: 'Campo maximo 10 dígitos.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'correoElectronico': [
            { type: 'maxlength', message: 'Campo maximo 50 dígitos.' },
            { type: 'pattern', message: 'No es el formato correcto, ejemplo: ejemplo@gmail.com.' }
        ],
        'numIdentificacion': [
            { type: 'maxlength', message: 'Campo maximo 20 dígitos.' }
        ],
        'tipoIdentificacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El tipo identificación no pertenece a la lista, elija otra.' }
        ]
    };

    /**
     * Metodo que resetea el formulario y limpia variables
     */
    nuevoRegistro() {
        // Reseteamos el formulario
        this.formSujetos.reset();
        this.listaIdentificaciones = [];
        this.listaIdentificacionesSeleccionados = [];
        this.formSujetos.get('estatus').setValue(true);
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

}