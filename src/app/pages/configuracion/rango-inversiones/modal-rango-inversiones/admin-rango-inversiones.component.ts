import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, Form, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { DatePipe } from '@angular/common';
import * as moment from 'moment';

@Component({
    selector: 'admin-rango-inversiones',
    moduleId: module.id,
    templateUrl: 'admin-rango-inversiones.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 28/10/2021
 * @descripcion: Componente para la Administración del Rango de Inversiones
 */
export class AdministracionRangoInversionesComponent implements OnInit {

    //Declaracion de variables, constantes, listas 
    titulo: string;
    accion: number;
    listaInversiones = [];
    opcionesInversiones: Observable<string[]>;
    formRangoInversion: UntypedFormGroup;
    rangoInvId: number = 0;
    descripcion: string = "";
    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase InversionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, public datepipe: DatePipe) {

        // Seteamos los datos que se pasan desde RangoInversionesComponent.
        this.titulo = data.titulo + ' RANGO INVERSION';
        this.accion = data.accion;

        // Creamos las validaciones de los campos.
        this.formRangoInversion = this.formBuilder.group({
            cveRangoInv: new UntypedFormControl('', [Validators.required, Validators.maxLength(6)]),
            plazo: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            fechaInicio: new UntypedFormControl({ value: new Date(), disabled: true }, [Validators.required]),
            fechaFin: new UntypedFormControl({ value: new Date(), disabled: true }, [Validators.required]),
            tasa: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,3}$|^[0-9]{1,3}\.[0-9]{1,3}$')]),
            estatus: new UntypedFormControl(true)
        });

        /** 
         * Si la accion = 2, se setean los datos al modal para la editacion de datos.
         * Se obtienen los datos de la tabla y se setean al formulario del modal.
        */
        if (this.accion === 2) {
            this.rangoInvId = data.rangoInversion.rangoInvId;
            this.formRangoInversion.get('cveRangoInv').setValue(data.rangoInversion.cveRangoInv);
            this.descripcion = data.rangoInversion.descripcion;
            this.formRangoInversion.get('fechaInicio').setValue(data.rangoInversion.fechaInicio + 'T00:00:00');
            this.formRangoInversion.get('fechaFin').setValue(data.rangoInversion.fechaFin + 'T00:00:00');
            this.formRangoInversion.get('tasa').setValue(data.rangoInversion.tasa);
            this.formRangoInversion.get('estatus').setValue(data.rangoInversion.estatus);
        }

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsInversiones();
        //this.descripcion = "";
    }

    /** 
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
    */
    validaciones = {
        'cveRangoInv': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 6 dígitos.' }
        ],
        'plazo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ],
        'tasa': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' }
        ]
    };

    /**
     * Metodo que guarda y edita el rango de inversiones
     */
    crudRangoInversiones() {

        // Validación
        if (this.formRangoInversion.invalid) {
            this.validateAllFormFields(this.formRangoInversion);
            return;
        }

        let fechaIni = moment(this.datepipe.transform(this.formRangoInversion.get('fechaInicio').value, 'yyyy-MM-dd'));
        let fechaFn = moment(this.datepipe.transform(this.formRangoInversion.get('fechaFin').value, 'yyyy-MM-dd'));
        let plazo = this.formRangoInversion.get('plazo').value;

        let dias = fechaFn.diff(fechaIni, 'days') + 1;

        if (plazo.plazo != dias) {
            this.service.showNotification('top', 'right', 3, "El rango de fechas no corresponden al plazo.");
            return;
        }
        /**
         * Se estructura y se setean los datos al JSON
         */
        const data = {
            "rangoInvId": this.rangoInvId,
            "cveRangoInv": this.formRangoInversion.get('cveRangoInv').value,
            "plazo": plazo,
            "fechaInicio": fechaIni,
            "fechaFin": fechaFn,
            "tasa": this.formRangoInversion.get('tasa').value,
            "estatus": this.formRangoInversion.get('estatus').value
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
        this.service.registrarBYID(data, this.accion, 'crudRangoInversiones').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if (result[0][0] === '0') {
                    if (this.accion === 1) {
                        // Reseteamos el formulario
                        this.formRangoInversion.get('fechaInicio').setValue(new Date());
                        this.formRangoInversion.get('fechaFin').setValue(new Date());
                        this.descripcion = "";
                        this.formRangoInversion.reset();
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
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterInversion(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaInversiones.filter(option => option.claveInversion.toLowerCase().includes(filterValue)
            || option.descripcion.toLowerCase().includes(filterValue) || option.plazo.includes(filterValue));
    }


    /**
     * Metodo que consulta las inversiones
     */
    spsInversiones() {

        this.blockUI.start('Cargando datos...');

        // Consumo de api para obtener las inversiones activas
        this.service.getListByID(2, 'listaInversiones').subscribe(data => {
            this.blockUI.stop();
            this.listaInversiones = data;

            // Se setean las inversiones para cada campo de la vista
            this.opcionesInversiones = this.formRangoInversion.get('plazo').valueChanges.
                pipe(startWith(''), map(value => this._filterInversion(value)));

            /** 
             * Si la accion = 2, se busca de la lista de inversiones al que pertenece el id del plazo.
            */
            if (this.accion === 2) {
                // Se declara variable local para guardar la inversion
                let inversion: any
                //Busca la información de la lista original por el id
                inversion = this.listaInversiones.find(x => x.inversionId === this.data.rangoInversion.plazo.inversionId);
                this.formRangoInversion.get('plazo').setValue(inversion);
            }

        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Muestra la descripcion de la inversion
     * @param option --inversion seleccionada
     * @returns -- inversion
     */
    displayFnP(option: any): any {
        return option ? option.claveInversion + ' / ' + option.descripcion + ' / ' + option.plazo + ' días ' : undefined;
    }

    /**
     * Genera la descripción del rango de la inversion
     * @param element 
     */
    mostrarDescripcion(element: any): any {
        let descPlazo = 'PLAZO FIJO A ' + element.plazo + ' DÍAS';
        this.descripcion = descPlazo;
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
                this.descripcion = "";
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }

    }

}