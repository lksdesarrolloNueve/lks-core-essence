import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from "../../../../shared/service/gestion";

@Component({
    selector: 'admin-depreciaciones',
    moduleId: module.id,
    templateUrl: 'admin-depreciaciones.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 03/11/2021
 * @descripcion: Componente para la Administración de depreciaciones
 */
 export class AdministracionDepreciacionesComponent implements OnInit {
    
    //Declaracion de variables, constantes, listas 
    titulo : string;
    accion : number;
    formDepreciacion : UntypedFormGroup;
    listaCuentasContables: any[];
    opcionesCuentaActivo: Observable<string[]>;
    opcionesCuentaDepreciacion: Observable<string[]>;
    opcionesCuentaGasto: Observable<string[]>;
    opcionesCuentaBaja: Observable<string[]>;
    depreciacionId : number = 0;
    @BlockUI() blockUI: NgBlockUI;
    
    
    /**
     * Constructor de la clase AdministracionDepreciacionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any){
            
            // Seteamos los datos que se pasan desde DepreciacionesComponent.
            this.titulo = data.titulo + ' DEPRECIACION';
            this.accion = data.accion;

            // Creamos las validaciones de los campos.
            this.formDepreciacion = this.formBuilder.group({
                cveDepreciacion: new UntypedFormControl('', [Validators.required, Validators.maxLength(6)]),
                descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(50)]),
                tasaContable: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,3}$|^[0-9]{1,3}\.[0-9]{1,3}$')]),
                tasaFiscal: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,3}$|^[0-9]{1,3}\.[0-9]{1,3}$')]),
                maximoDeducible: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,3}$|^[0-9]{1,3}\.[0-9]{1,3}$')]),
                porcentaje: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,3}$|^[0-9]{1,3}\.[0-9]{1,3}$')]),
                cuentaActivo: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                cuentaDepreciacion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                cuentaGastos: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                cuentaBaja: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
                estatus: new UntypedFormControl(true)
            });

            /** 
             * Si la accion = 2, se setean los datos al modal para la editacion de datos.
             * Se obtienen los datos de la tabla y se setean al formulario del modal.
            */
            if(this.accion === 2){
                this.depreciacionId = data.depreciacion.depreciacionId;
                this.formDepreciacion.get('cveDepreciacion').setValue(data.depreciacion.cveDepreciacion);
                this.formDepreciacion.get('descripcion').setValue(data.depreciacion.descripcion);
                this.formDepreciacion.get('tasaContable').setValue(data.depreciacion.tasaContable);
                this.formDepreciacion.get('tasaFiscal').setValue(data.depreciacion.tasaFiscal);
                this.formDepreciacion.get('maximoDeducible').setValue(data.depreciacion.maximoDeducible);
                this.formDepreciacion.get('porcentaje').setValue(data.depreciacion.porcentaje);
                this.formDepreciacion.get('estatus').setValue(data.depreciacion.estatus);
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
        'cveDepreciacion' : [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'maxlength', message: 'Campo maximo 6 dígitos.'}
        ],
        'descripcion': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'maxlength', message: 'Campo maximo 50 dígitos.'}
        ],
        'tasaContable': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números o decimales.'}
        ],
        'tasaFiscal': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números o decimales.'}
        ],
        'maximoDeducible': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números o decimales.'}
        ],
        'porcentaje': [
            {type: 'required', message: 'Campo requerido.'},
            {type: 'pattern', message: 'Campo solo números o decimales.'}
        ],
        'cuentaActivo': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La Cuenta Activo no pertenece a la lista, elija otra.' }
        ],
        'cuentaDepreciacion': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La Cuenta Depreciacion no pertenece a la lista, elija otra.' }
        ],
        'cuentaGastos': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La Cuenta Gastos no pertenece a la lista, elija otra.' }
        ],
        'cuentaBaja': [
            {type: 'required', message: 'Campo requerido.'},
            { type: 'invalidAutocompleteObject',   message: 'La Cuenta Baja no pertenece a la lista, elija otra.' }
        ]
    };
    
    /**
     * Metodo que guarda y edita depreciaciones
     */
    crudDepreciaciones(){
        
        // Validación
        if(this.formDepreciacion.invalid){
            this.validateAllFormFields(this.formDepreciacion);
            return;
        }

        /**
         * Se estructura y se setean los datos al JSON
         */
        const data = {
            "depreciacionId": this.depreciacionId,
            "cveDepreciacion": this.formDepreciacion.get('cveDepreciacion').value,
            "descripcion": this.formDepreciacion.get('descripcion').value,
            "tasaContable": this.formDepreciacion.get('tasaContable').value,
            "tasaFiscal": this.formDepreciacion.get('tasaFiscal').value,
            "maximoDeducible": this.formDepreciacion.get('maximoDeducible').value,
            "porcentaje": this.formDepreciacion.get('porcentaje').value,
            "cuentaActivo": this.formDepreciacion.get('cuentaActivo').value,
            "cuentaDepreciacion": this.formDepreciacion.get('cuentaDepreciacion').value,
            "extensionDepreciacion": {
                "cuentaGastos": this.formDepreciacion.get('cuentaGastos').value,
                "cuentaBaja": this.formDepreciacion.get('cuentaBaja').value
            },
            "estatus": this.formDepreciacion.get('estatus').value,
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
        this.service.registrarBYID(data, this.accion, 'crudDepreciaciones').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if(result[0][0] === '0'){
                    if(this.accion === 1){
                        // Reseteamos el formulario
                        this.formDepreciacion.reset();
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
            this.opcionesCuentaActivo = this.formDepreciacion.get('cuentaActivo').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));
            
            this.opcionesCuentaDepreciacion = this.formDepreciacion.get('cuentaDepreciacion').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCuentaGasto = this.formDepreciacion.get('cuentaGastos').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            this.opcionesCuentaBaja = this.formDepreciacion.get('cuentaBaja').valueChanges.
            pipe(startWith(''), map(value => this._filterCuenta(value)));

            /** 
             * Si la accion = 2, se busca de la lista de cuentas contables al que pertenece el id de la CC.
            */
             if (this.accion === 2) {
                // Se declara variable local para guardar la cuenta contable cuentaActivo
                let cuentaActivo: any
                //Busca la información de la lista original por el id
                cuentaActivo = this.listaCuentasContables.find(x => x.cuentaid === this.data.depreciacion.cuentaActivo.cuentaid);
                this.formDepreciacion.get('cuentaActivo').setValue(cuentaActivo);

                // Se declara variable local para guardar la cuenta contable cuentaDepreciacion
                let cuentaDepreciacion: any
                //Busca la información de la lista original por el id
                cuentaDepreciacion = this.listaCuentasContables.find(x => x.cuentaid === this.data.depreciacion.cuentaDepreciacion.cuentaid);
                this.formDepreciacion.get('cuentaDepreciacion').setValue(cuentaDepreciacion);

                // Se declara variable local para guardar la cuenta contable cuentaGastos
                let cuentaGastos: any
                //Busca la información de la lista original por el id
                cuentaGastos = this.listaCuentasContables.find(x => x.cuentaid === this.data.depreciacion.extensionDepreciacion.cuentaGastos.cuentaid);
                this.formDepreciacion.get('cuentaGastos').setValue(cuentaGastos);

                // Se declara variable local para guardar la cuenta contable cuentaBaja
                let cuentaBaja: any
                //Busca la información de la lista original por el id
                cuentaBaja = this.listaCuentasContables.find(x => x.cuentaid === this.data.depreciacion.extensionDepreciacion.cuentaBaja.cuentaid);
                this.formDepreciacion.get('cuentaBaja').setValue(cuentaBaja);
            }

        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Muestra la descripcion de la cuenta contable para Activo
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnCA(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Depreciacion
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnCD(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Gastos
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnCG(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }

    /**
     * Muestra la descripcion de la cuenta contable para Baja
     * @param option --cuenta seleccionada
     * @returns -- cuenta
     */
     displayFnCB(option: any): any {
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