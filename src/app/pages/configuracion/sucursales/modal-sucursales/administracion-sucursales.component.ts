import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from '../../../../shared/service/gestion';


/**
* @autor: Juan Eric Juarez
* @version: 1.0.0
* @fecha: 09/09/2021
* @descripcion: Componente para la gestion de sucursales
*/
@Component({
    selector: 'administracion-sucursales',
    moduleId: module.id,
    templateUrl: 'administracion-sucursales.component.html',
})
export class AdministracionSucursalesComponent implements OnInit {

    //Declaracion de variables y componentes
    titulo = 'Sucursal';
    encabezado: string;
    accion: number;
    formSucursal: UntypedFormGroup;
    color: ThemePalette = 'primary';
    selectedIdCtaTr: any;

    /**controles sucursal */
    listaCuentaC: any;
    opcionesCuentaC: Observable<string[]>;

    sucursalid: number = 0;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Validacion para los campos
     */
    validaciones = {
        'nombreSucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
        ],
        'cveSucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 3 dígitos.' },
            { type: 'pattern', message: 'Solo se aceptan Mayusculas y numeros.' },
        ],
        'cuentaContableTras': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra.' }
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }


    /**
     * Constructor de la clase
     * @param service - Instancia de acceso a datos
     * @param data - Datos recibidos desde el padre
     */
    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formSucursal = this.formbuilder.group({
            nombreSucursal: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            cveSucursal: new UntypedFormControl('', [Validators.required, Validators.maxLength(3), Validators.pattern('[A-Z0-9]*')]),
            cuentaContableTras:  new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            estatus: new UntypedFormControl(true)
        });


        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.sucursalid = data.sucursal.sucursalid;
            this.formSucursal.get('nombreSucursal').setValue(data.sucursal.nombreSucursal);
            this.formSucursal.get('cveSucursal').setValue(data.sucursal.cveSucursal);
            this.formSucursal.get('estatus').setValue(data.sucursal.estatus);
            this.selectedIdCtaTr = data.sucursal.ctaContableTraspaso.cuentaid;
        }

    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

        this.spsCuentaConta();

    }

    /**
     * Metodo para editar informacion de sucursales
     */
    crudSucursal() {
       
        if (this.formSucursal.invalid) {
            this.validateAllFormFields(this.formSucursal);
            return;
        }

   
        this.blockUI.start('Editando...');

        //se setean los datos en el array
        const data = {
            "sucursalid": this.sucursalid,
            "nombreSucursal": this.formSucursal.get('nombreSucursal').value,
            "cveSucursal":  this.formSucursal.get('cveSucursal').value,
            "estatus": this.formSucursal.get('estatus').value,
            "ctaContableTraspaso":{"cuentaid": this.selectedIdCtaTr}
        };



        this.service.registrarBYID(data, this.accion, 'crudSucursales').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
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
    * Metodo para consultar cuentas contables.
    */
     spsCuentaConta() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
            this.listaCuentaC = data;

            this.opcionesCuentaC = this.formSucursal.get('cuentaContableTras').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaC(value))
            );

            let cuentaContTR = this.listaCuentaC.filter((cuentaTr: any) => cuentaTr.cuentaid === this.selectedIdCtaTr);
            this.formSucursal.get('cuentaContableTras').setValue(cuentaContTR[0]);

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
        displayFnCuentaConta(option: any): any {
            return option ? option.cuenta +' / '+option.nombre   : undefined;
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
    opcionSeleccionCuentaC(event) {
        this.selectedIdCtaTr = event.option.value.cuentaid;
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

}