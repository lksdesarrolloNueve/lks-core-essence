import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../shared/service/gestion";

@Component({
    selector: 'administracion-gastos',
    moduleId: module.id,
    templateUrl: 'administracion-gastos.component.html'
})

/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 18/10/2022
 * @descripcion: Componente para la administracion de gastos
 */
export class AdministracionGastosComponent implements OnInit {

    //Declaracion de variables y componentes
    titulo = 'gasto';
    encabezado: string;
    accion: number;
    formGastos: UntypedFormGroup;
    listaGastos: any;
    idGasto = 0;
    @BlockUI() blockUI: NgBlockUI;

    /**Autocomplete sucursales */
    listaSucursales: any;
    opcionesSucursales: Observable<string[]>;
    selectedIdSuc: number;

    /**Autocomplete cuentas contables */
    listaCuentaC: any;
    opcionesCuentaC: Observable<string[]>;
    selectedIdCuentaC: number;
    

   /**
    * Constructor del componente garantias
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    * @param service -- Instancia de acceso a datos
    */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, 
               @Inject(MAT_DIALOG_DATA) public data: any) {

        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        //Validaciones Formulario
        this.formGastos = this.formBuilder.group({
            cveGasto: new UntypedFormControl('', [Validators.required,  Validators.minLength(6), Validators.pattern("^[a-zA-Z]+$")]),
            sucursal: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(256)]),
            cuentaContable: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            limiteGasto: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            estatus: new UntypedFormControl('true'),

        });

        //Editar
        if (this.accion === 2){

            this.formGastos.controls['cveGasto'].disable();

            this.idGasto = data.caja.idGasto;
            this.formGastos.get('cveGasto').setValue(data.caja.cveGasto);
            this.formGastos.get('descripcion').setValue(data.caja.descripcion);
            this.formGastos.get('limiteGasto').setValue(data.caja.limiteGasto);
            this.formGastos.get('estatus').setValue(data.caja.estatus);
        }
        
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsSucursales();
        this.spsCuentasContables();
    }

    /**
     * Metodo para consultar sucursales
     */
    spsSucursales() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursales = this.formGastos.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSuc(value))
            );

            //Set sucursal
            let sucursal:any;
            if (this.accion === 2){
                sucursal = this.listaSucursales.filter((suc: any) => suc.sucursalid === 
                this.data.caja.sucursal.sucursalid);
                this.formGastos.get('sucursal').setValue(sucursal[0]);
            }

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

        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionSuc(event:any) {
        this.selectedIdSuc = event.option.value.sucursalid;
    }

    /**
     * Metodo para consultar cuentas contables
     */
    spsCuentasContables() {
    this.blockUI.start('Cargando datos...');//cabiara  ala de estados
    this.service.getListByID(4, 'spsCuentasContables').subscribe(data => {
        this.listaCuentaC = data;

        this.opcionesCuentaC = this.formGastos.get('cuentaContable').valueChanges.pipe(
            startWith(''),
            map(value => this._filterCuentaC(value))
        );
        
        //Set cuenta contable
        let cuentaC:any;
        if (this.accion === 2){
            cuentaC = this.listaCuentaC.filter((cuentaCC: any) => cuentaCC.cuentaid === 
            this.data.caja.cuentaContable.cuentaid);
            this.formGastos.get('cuentaContable').setValue(cuentaC[0]);
        }

        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
    }

    /**
     * Muestra la descripcion de la cuenta contable
     * @param option --estado seleccionado
     * @returns --nombre de estado
     */
    displayFnCuentaConta(option: any): any {
        return option ?  option.cuenta +' / '+option.nombre : undefined;
    }

    /**
     * Filtra el estado
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterCuentaC(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCuentaC.filter(option => option.cuenta.toLowerCase().includes(filterValue) || option.nombre.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionCuentaC(event:any) {
        this.selectedIdCuentaC = event.option.value.cuentaid;
    }


    /**
     * Metod para guardar o editar gasto
     */
    procesarGasto(accion: any): void {
    /**
     * Validacion complementaria para la validacion de guardado de datos en el formulario formTipoDocumento
     */
    if (this.formGastos.invalid) {
        this.validateAllFormFields(this.formGastos);
        return;
    }


    this.blockUI.start('Guardando ...');

    let data: any;


    //Declaracion json.
    data = {
        "idGasto": this.idGasto,
        "sucursal": this.formGastos.get('sucursal').value,
        "cveGasto": this.formGastos.get('cveGasto').value,
        "descripcion": this.formGastos.get('descripcion').value,
        "cuentaContable": this.formGastos.get('cuentaContable').value,
        "limiteGasto": this.formGastos.get('limiteGasto').value,
        "estatus": this.formGastos.get('estatus').value
    }



    this.service.registrarBYID(data, accion, 'crudGastos').subscribe(
        result => {
            this.blockUI.stop();

            if (result[0][0] === '0') {
                
                if(this.accion === 1){
                    this.formGastos.reset();
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
     * Valida que el texto ingresado pertenezca a un gasto
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

    //Arreglo de mensajes a mostrar al validar formulario
    validaciones = {
        'cveGasto': [
            { type: 'required', message: ' Clave gasto requerida.' },
            { type: 'pattern', message: 'Solo letras  y cadena de 6 caracteres.' },
            { type: 'minlength', message: 'Minímo 6 carácteres.' }
        ],
        
        'sucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra.' }
        ],

        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' },
            { type: 'maxLength', message: 'Máximo 256 carácteres.' }
        ],

        'cuentaContable': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra.' }
        ],

        'limiteGasto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' }
        ]


    } 


}