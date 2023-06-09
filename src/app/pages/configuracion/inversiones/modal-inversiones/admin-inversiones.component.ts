import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, Form, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from "../../../../shared/service/gestion";

@Component({
    selector: 'admin-inversiones',
    moduleId: module.id,
    templateUrl: 'admin-inversiones.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 06/10/2021
 * @descripcion: Componente para la Administración de inversiones
 */
 export class AdministracionInversionesComponent implements OnInit {
    
    //Declaracion de variables, constantes, listas 
    titulo : string;
    accion : number;
    formInversion : UntypedFormGroup;
    listaCuentasContables: any[];
    opcionesCuentas1: Observable<string[]>;
    opcionesCuentas2: Observable<string[]>;
    opcionesCuentas3: Observable<string[]>;
    opcionesCuentas4: Observable<string[]>;
    opcionesCuentas5: Observable<string[]>;
    opcionesCuentas6: Observable<string[]>;
    inversionId : number = 0;
    @BlockUI() blockUI: NgBlockUI;
    
    
    /**
     * Constructor de la clase InversionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any){
            
            // Seteamos los datos que se pasan desde InversionesComponent.
            this.titulo = data.titulo + ' INVERSION';
            this.accion = data.accion;

            // Creamos las validaciones de los campos.
            this.formInversion = this.formBuilder.group({
                claveInversion: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
                descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(254)]),
                plazo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
                pasivoDeposito: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                pasivoInteresDevengado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                pasivoIsrRetenido: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                pasivoRetencionIde: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                resultadoInteresPagado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                resultadoInteresDevengado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                montoInf: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
                montoSup: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
                tasa: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
                retieneIsr: new UntypedFormControl(true),
                estatus: new UntypedFormControl(true)
            });

            /** 
             * Si la accion = 2, se setean los datos al modal para la editacion de datos.
             * Se obtienen los datos de la tabla y se setean al formulario del modal.
            */
            if(this.accion === 2){
                this.inversionId = data.inversion.inversionId;
                this.formInversion.get('claveInversion').setValue(data.inversion.claveInversion);
                this.formInversion.get('descripcion').setValue(data.inversion.descripcion);
                this.formInversion.get('plazo').setValue(data.inversion.plazo);
                this.formInversion.get('pasivoDeposito').setValue(data.inversion.pasivoDeposito);
                this.formInversion.get('pasivoInteresDevengado').setValue(data.inversion.pasivoInteresDevengado);
                this.formInversion.get('pasivoIsrRetenido').setValue(data.inversion.pasivoIsrRetenido);
                this.formInversion.get('pasivoRetencionIde').setValue(data.inversion.pasivoRetencionIde);
                this.formInversion.get('resultadoInteresPagado').setValue(data.inversion.resultadoInteresPagado);
                this.formInversion.get('resultadoInteresDevengado').setValue(data.inversion.resultadoInteresDevengado);
                this.formInversion.get('montoInf').setValue(data.inversion.extensionInversion.montoInf);
                this.formInversion.get('montoSup').setValue(data.inversion.extensionInversion.montoSup);
                this.formInversion.get('tasa').setValue(data.inversion.extensionInversion.tasa);
                this.formInversion.get('retieneIsr').setValue(data.inversion.extensionInversion.retieneIsr);
                this.formInversion.get('estatus').setValue(data.inversion.extensionInversion.estatus);
            }

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsCuentasContables();
    }

    /** 
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
    */
    validaciones = {
        'claveInversion' : [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'maxlength', message: 'Campo maximo 4 dígitos.'}
        ],
        'descripcion': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'maxlength', message: 'Campo maximo 254 dígitos.'}
        ],
        'plazo': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números enteros.'}
        ],
        'pasivoDeposito': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La cuenta pasivo deposito no pertenece a la lista, elija otra.' }
        ],
        'pasivoInteresDevengado': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La cuenta pasivo interes devengado no pertenece a la lista, elija otra.' }
        ],
        'pasivoIsrRetenido': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La cuenta pasivo ISR retenido no pertenece a la lista, elija otra.' }
        ],
        'pasivoRetencionIde': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La cuenta pasivo retencion IDE no pertenece a la lista, elija otra.' }
        ],
        'resultadoInteresPagado': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La cuenta resultado interes pagado no pertenece a la lista, elija otra.' }
        ],
        'resultadoInteresDevengado': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La cuenta resultado interes devengado no pertenece a la lista, elija otra.'}
        ],
        'montoInf': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números o decimales.'}
        ],
        'montoSup': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números enteros o decimales.'}
        ],
        'tasa': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números o decimales.'}
        ]
    };
    
    /**
     * Metodo que guarda y edita inversiones
     */
     crudInversion(){
        
        // Validación
        if(this.formInversion.invalid){
            this.validateAllFormFields(this.formInversion);
            return;
        }

        /**
         * Se estructura y se setean los datos al JSON
         */
        const data = {
            "inversionId": this.inversionId,
            "claveInversion": this.formInversion.get('claveInversion').value,
            "descripcion": this.formInversion.get('descripcion').value,
            "plazo": this.formInversion.get('plazo').value,
            "pasivoDeposito": this.formInversion.get('pasivoDeposito').value,
            "pasivoInteresDevengado": this.formInversion.get('pasivoInteresDevengado').value,
            "pasivoIsrRetenido": this.formInversion.get('pasivoIsrRetenido').value,
            "pasivoRetencionIde": this.formInversion.get('pasivoRetencionIde').value,
            "resultadoInteresPagado": this.formInversion.get('resultadoInteresPagado').value,
            "resultadoInteresDevengado": this.formInversion.get('resultadoInteresDevengado').value,
            "extensionInversion": {
                "montoInf": this.formInversion.get('montoInf').value,
                "montoSup": this.formInversion.get('montoSup').value,
                "tasa": this.formInversion.get('tasa').value,
                "retieneIsr": this.formInversion.get('retieneIsr').value,
                "estatus": this.formInversion.get('estatus').value,
            }
        }

        /** 
         * Decision para el mensaje de bloqueo de pantalla.
         * Si accion 2 = Editar
         * Accion 1 = Guardar
        */
        if(this.accion === 2){
            this.blockUI.start("Editando ...");
        } else {
            this.blockUI.start("Guardando ...");
        }

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
        */
        this.service.registrarBYID(data, this.accion, 'crudInversiones').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if(result[0][0] === '0'){
                    if(this.accion === 1){
                        // Reseteamos el formulario
                        this.formInversion.reset();
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

        return this.listaCuentasContables.filter(option => option.cuenta.toLowerCase().includes(filterValue)
            || option.nombre.toLowerCase().includes(filterValue));
    }


    /**
     * Metodo que consulta las cuentas contables
     */
     spsCuentasContables() {

        this.blockUI.start('Cargando datos...');

        // Consumo de api para obtener las cuentas contables
        this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
            this.blockUI.stop();

            // Filtramos las cuentas contables por Afectable
            this.listaCuentasContables = data.filter((result) => 
            result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');

            // Se setean las cuentas contables para cada campo de la vista
            this.opcionesCuentas1 = this.formInversion.get('pasivoDeposito').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));
            
            this.opcionesCuentas2 = this.formInversion.get('pasivoInteresDevengado').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCuentas3 = this.formInversion.get('pasivoIsrRetenido').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCuentas4 = this.formInversion.get('pasivoRetencionIde').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCuentas5 = this.formInversion.get('resultadoInteresPagado').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCuentas6 = this.formInversion.get('resultadoInteresDevengado').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Muestra la descripcion de la cuenta contable para Pasivo Deposito
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnPD(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Pasivo Interes Devengado
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnPID(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Pasivo Isr Retenido
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnPIR(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Pasivo Retencion Ide
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnPRI(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }
    
    /**
     * Muestra la descripcion de la cuenta contable para Resultado Interes Pagado
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnRIP(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Resultado Interes Devengado
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnRID(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
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

}