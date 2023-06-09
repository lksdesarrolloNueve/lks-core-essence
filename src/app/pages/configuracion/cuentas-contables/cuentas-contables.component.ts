import { FlatTreeControl } from "@angular/cdk/tree";
import { OnInit, Component } from "@angular/core";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MCargaCuentas } from "./m-cm-cuentas/m-cm-cuentas.component";
import { MatDialog } from "@angular/material/dialog";


/** Flat node with expandable and level information */
interface CuentaNode {
    expandable: boolean;
    cuentaid: number;
    nombre: string;
    cuenta: string;
    level: number;
}

@Component({
    selector: 'cuentas-contables',
    moduleId: module.id,
    templateUrl: 'cuentas-contables.component.html',
})
export class CuentasContablesComponent implements OnInit {

    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;



    formCuenta: UntypedFormGroup;

    opcionesCuentas: Observable<string[]>;

    opcionesAnexo: Observable<string[]>;


    opcionesMoneda: Observable<string[]>;

    //listas
    listaCuentasContables: any[];
    listaRubro: any[];
    listaTipoCuenta: any[];
    listaNaturaleza: any[];
    listaCuentasAnexo: any[];
    listaMonedas: any[];

    //Botones boolean
    mostrarGuardar: boolean = true;
    mostrarEditar: boolean = false;

    tipoControl = new UntypedFormControl('', [Validators.required]);
    rubroControl = new UntypedFormControl('', [Validators.required]);
    naturalezaControl = new UntypedFormControl('', [Validators.required]);

    cuentaid: number;

    //Declaracion de Variables arbol
    arbolcuentas: any;

    /** Arbol Servidores */
    private _transformer = (node: any, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            cuentaid: node.cuenta_id,
            nombre: node.nombre,
            cuenta: node.cuenta,
            level: level,
        };
    }

    treeControl = new FlatTreeControl<CuentaNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

    dataSourceCuentas = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);


    /** Fin arbol servidores */

    /**
  * 
  * @param service service para el acceso de datos 
  */



    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder, public dialog: MatDialog) {
        this.formCuenta = this.fomrBuilder.group({
            cuenta: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            nombre: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            cuentaAcumulada: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            fRegistro: new UntypedFormControl({ value: new Date(), disabled: true }, [Validators.required]),
            estatus: new UntypedFormControl(true),
            tipo: this.tipoControl,
            naturaleza: this.naturalezaControl,
            rubro: this.rubroControl,
            anexo: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            nivel: new UntypedFormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern('[0-9]*')]),
            concepto: new UntypedFormControl('', [Validators.maxLength(12)]),
            moneda: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            cambia: new UntypedFormControl('0')
        });



    }

    hasChild = (_: number, node: CuentaNode) => node.expandable;

    ngOnInit() {

        this.spsJSONCuentasContables();
        this.nuevaCuenta();


    }

    /**
     * Metodo que consulta y setea el arbol para mostar en vista
     */
    spsJSONCuentasContables() {
        this.blockUI.start('Cargando datos...');

        this.service.getList('listaJsonCuentas').subscribe(data => {
            this.blockUI.stop();

            const res = JSON.parse(data);
            this.dataSourceCuentas.data = res;
            this.arbolcuentas = res;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
     * Metodo que consulta las cuentas contables
     */
    spsCuentasContables() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1, 'spsCuentasContables').subscribe(data => {
            this.blockUI.stop();


            this.listaCuentasContables = data;

            this.opcionesCuentas = this.formCuenta.get('cuentaAcumulada').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuenta(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

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
  * Muestra la descripcion de la cuenta 
  * @param option --cuenta seleccionada
  * @returns -- cuenta
  */
    displayFn(option: any): any {
        return option ? option.cuenta + ' / ' + option.nombre : undefined;
    }


    /**
     * Lista los rublos para tipos de cuentas
     */
    spsRubro() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaRubro').subscribe(data => {
            this.blockUI.stop();
            this.listaRubro = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Lista los tipos de cuentas
     */
    spsTipoCuenta() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaTipoCuenta').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoCuenta = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Lista los tipos de naturaleza para cuentas contable
     */
    spsNaturaleza() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaNaturaleza').subscribe(data => {
            this.blockUI.stop();
            this.listaNaturaleza = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Cuentas anexo 24 sat
     */
    spsCuentasAnexo24() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'spsCuentasAnexo24').subscribe(data => {
            this.blockUI.stop();
            this.listaCuentasAnexo = data;
            this.opcionesAnexo = this.formCuenta.get('anexo').valueChanges.pipe(
                startWith(''),
                map(value => this._filterAnexo(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterAnexo(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentasAnexo.filter(anexo => anexo.nombreCta.toLowerCase().includes(filterValue)
            || anexo.codAgrupador.toLowerCase().includes(filterValue)
        );
    }


    /**
  * Muestra la descripcion de la cuenta 
  * @param anexo --cuenta seleccionada
  * @returns -- cuenta
  */
    displayAnexo(anexo: any): any {
        return anexo ? anexo.codAgrupador + ' / ' + anexo.nombreCta : undefined;
    }



    /**
     * Metodo para obtener la lista de monedas
     */
    spsMonedas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaMonedas').subscribe(data => {
            this.blockUI.stop();
            this.listaMonedas = data;
            this.opcionesMoneda = this.formCuenta.get('moneda').valueChanges.pipe(
                startWith(''),
                map(value => this._filterMoneda(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
    * Filta la moneda
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterMoneda(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaMonedas.filter(anexo => anexo.nombreMoneda.toLowerCase().includes(filterValue));
    }


    /**
  * Muestra la descripcion de la cuenta 
  * @param anexo --cuenta seleccionada
  * @returns -- cuenta
  */
    displayMoneda(option: any): any {
        return option ? option.tipoCambio + ' / ' + option.nombreMoneda : undefined;
    }



    /**
     * Carga todos los combos
     */
    nuevaCuenta() {
        this.formCuenta.reset();
        this.spsCuentasContables();
        this.spsCuentasAnexo24();
        this.spsNaturaleza();
        this.spsRubro();
        this.spsTipoCuenta();
        this.spsMonedas();
        this.formCuenta.get('fRegistro').setValue(new Date());
        this.mostrarEditar = false;
        this.mostrarGuardar = true;

    }

    /**
     * Metodo para guardar una cuenta contable
     */
    guardarCuentaContable(): void {


        if (this.formCuenta.invalid) {
            this.validateAllFormFields(this.formCuenta);
            return;
        }


        let cambia = 0;

        if (!this.vacio(this.formCuenta.get('cambia').value)) {
            cambia = this.formCuenta.get('cambia').value
        }

        let cuentaAcumulada = 0;

        if (!this.vacio(this.formCuenta.get('cuentaAcumulada').value)) {
            cuentaAcumulada = this.formCuenta.get('cuentaAcumulada').value.cuentaid
        }

        if (this.formCuenta.get('tipo').value.cveTipo !== 'T02' && cuentaAcumulada === 0) {
            this.service.showNotification('top', 'right', 3, 'La cuenta necesita ser ligada a una cuenta.');
            return;
        }


        this.blockUI.start('Guardando ...');

        const data = {
            "cuentaid": 0,
            "cuenta": this.formCuenta.get('cuenta').value,
            "ctaAcumulaId": cuentaAcumulada,
            "nombre": this.formCuenta.get('nombre').value,
            "nivelTabulacion": this.formCuenta.get('nivel').value,
            "numeroConcepto": this.formCuenta.get('concepto').value,
            "cambia": cambia,
            "fechaRegistro": this.formCuenta.get('fRegistro').value,
            "estatus": this.formCuenta.get('estatus').value,
            "extencionCuentaContable": {
                "tipoCuenta": this.formCuenta.get('tipo').value,
                "naturaleza": this.formCuenta.get('naturaleza').value,
                "rubro": this.formCuenta.get('rubro').value,
                "ctaContableAnexo": this.formCuenta.get('anexo').value,
                "monedaSat": this.formCuenta.get('moneda').value
            }

        };



        this.service.registrarBYID(data, 1, 'crudCuentaContable').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.spsJSONCuentasContables();
                    this.formCuenta.reset();
                    this.nuevaCuenta();
                    this.formCuenta.get('fRegistro').setValue(new Date());
                    this.formCuenta.get('concepto').setValue('0');
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
     * Filtrado de cuentas por Id
     */
    spsCuentasContablesByID(elemento: any) {
        this.mostrarEditar = true;
        this.mostrarGuardar = false;
        this.formCuenta.reset();
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(elemento, 'spsCuentasContablesByID').subscribe(
            data => {

                this.blockUI.stop();

                let cuentas = this.listaCuentasContables.filter(x => x.cuentaid == data[0].ctaAcumulaId);
                let tipoIndex = this.listaTipoCuenta.findIndex(x => x.tipoCuentaId == data[0].extencionCuentaContable.tipoCuenta.tipoCuentaId);
                let rubroIndex = this.listaRubro.findIndex(x => x.rubroId == data[0].extencionCuentaContable.rubro.rubroId);
                let natIndex = this.listaNaturaleza.findIndex(x => x.naturalezaId == data[0].extencionCuentaContable.naturaleza.naturalezaId);



                this.cuentaid = data[0].cuentaid;
                this.formCuenta.get('cuentaAcumulada').setValue(cuentas[0]);
                this.formCuenta.get('cuenta').setValue(data[0].cuenta);
                this.formCuenta.get('nombre').setValue(data[0].nombre);
                this.formCuenta.get('nivel').setValue(data[0].nivelTabulacion);
                this.formCuenta.get('concepto').setValue(data[0].numeroConcepto);
                this.formCuenta.get('cambia').setValue(data[0].cambia);
                this.formCuenta.get('fRegistro').setValue(data[0].fechaRegistro + 'T00:00:00');
                this.formCuenta.get('estatus').setValue(data[0].estatus);
                this.formCuenta.get('tipo').setValue(this.listaTipoCuenta[tipoIndex]);
                this.formCuenta.get('naturaleza').setValue(this.listaNaturaleza[natIndex]);
                this.formCuenta.get('rubro').setValue(this.listaRubro[rubroIndex]);

                if (data[0].extencionCuentaContable.ctaContableAnexo.ctaContableID !== 0) {
                    this.formCuenta.get('anexo').setValue(data[0].extencionCuentaContable.ctaContableAnexo);
                }
                this.formCuenta.get('moneda').setValue(data[0].extencionCuentaContable.monedaSat);


            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    editarCuentaContable(): void {

        if (this.formCuenta.invalid) {
            this.validateAllFormFields(this.formCuenta);
            return;
        }


        let cambia = 0;

        if (!this.vacio(this.formCuenta.get('cambia').value)) {
            cambia = this.formCuenta.get('cambia').value
        }

        let cuentaAcumulada = 0;

        if (!this.vacio(this.formCuenta.get('cuentaAcumulada').value)) {
            cuentaAcumulada = this.formCuenta.get('cuentaAcumulada').value.cuentaid
        }

        if (this.formCuenta.get('tipo').value.cveTipo !== 'T02' && cuentaAcumulada === 0) {
            this.service.showNotification('top', 'right', 3, 'La cuenta necesita ser ligada a una cuenta.');
            return;
        }

        this.blockUI.start('Guardando ...');

        const data = {
            "cuentaid": this.cuentaid,
            "cuenta": this.formCuenta.get('cuenta').value,
            "ctaAcumulaId": cuentaAcumulada,
            "nombre": this.formCuenta.get('nombre').value,
            "nivelTabulacion": this.formCuenta.get('nivel').value,
            "numeroConcepto": this.formCuenta.get('concepto').value,
            "cambia": cambia,
            "fechaRegistro": this.formCuenta.get('fRegistro').value,
            "estatus": this.formCuenta.get('estatus').value,
            "extencionCuentaContable": {
                "tipoCuenta": this.formCuenta.get('tipo').value,
                "naturaleza": this.formCuenta.get('naturaleza').value,
                "rubro": this.formCuenta.get('rubro').value,
                "ctaContableAnexo": this.formCuenta.get('anexo').value,
                "monedaSat": this.formCuenta.get('moneda').value
            }

        };

        this.service.registrarBYID(data, 2, 'crudCuentaContable').subscribe(
            resultCuenta => {

                this.blockUI.stop();
                if (resultCuenta[0][0] === '0') {
                    this.spsJSONCuentasContables();
                    this.formCuenta.reset();
                    this.nuevaCuenta();
                    this.formCuenta.get('fRegistro').setValue(new Date());
                    this.formCuenta.get('concepto').setValue('0');
                    this.service.showNotification('top', 'right', 2, resultCuenta[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, resultCuenta[0][1]);
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
     * Validaciones FormGroup
     */
    validaciones = {

        'cuenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño maximo es de 255 dígitos.' }
        ],
        'nombre': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño maximo es de 255 dígitos.' }
        ],
        'cuentaAcumulada': [{ type: 'invalidAutocompleteObject', message: 'La cuenta no existe.' }],
        'tipo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'naturaleza': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'rubro': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'anexo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta sat no existe.' }
        ],
        'nivel': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño maximo es de 2 dígitos.' },
            { type: 'pattern', message: '  El campo solo acepta enteros.' }
        ],
        'concepto': [
            { type: 'maxlength', message: 'El tamaño maximo es de 12 dígitos.' }
        ],
        'moneda': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La moneda no existe.' }
        ],

    };

    /**
     * Metodo que valida si va vacio.
     * @param value 
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }


    /**
   * Metodo que abre el modal de Cargas masivas Cuentas Contables
   */
    abrirDialogoCargaMasiva() {
        //se abre el modal
        const dialogRef = this.dialog.open(MCargaCuentas, {
            width: '40%',
            data: {
                listaTipoCuenta: this.listaTipoCuenta,
                listaRubro: this.listaRubro,
                listaNaturaleza: this.listaNaturaleza,
                listaCuentasAnexo: this.listaCuentasAnexo,
                listaMonedas: this.listaMonedas,
                listaCuentasContables: this.listaCuentasContables
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            this.spsJSONCuentasContables();
            this.nuevaCuenta();
        });
    }


    // filter recursively on a text string using property object value
    filterRecursive(filterText: string, array: any[], property: string) {
        let filteredData;

        //make a copy of the data so we don't mutate the original
        function copy(o: any) {
            return Object.assign({}, o);
        }

        // has string
        if (filterText) {
            // need the string to match the property value
            filterText = filterText.toLowerCase();
            // copy obj so we don't mutate it and filter
            filteredData = array.map(copy).filter(function x(y) {
                if (y[property].toLowerCase().includes(filterText) ||y['cuenta'].toLowerCase().includes(filterText)) {
                    return true;
                }
                // if children match
                if (y.children) {
                    return (y.children = y.children.map(copy).filter(x)).length;
                }
            });
            // no string, return whole array
        } else {
            filteredData = array;
        }

        return filteredData;
    }

    // pass mat input string to recursive function and return data
    filterTree(filterText: string) {
        // use filter input text, return filtered TREE_DATA, use the 'name' object value
        this.dataSourceCuentas.data = this.filterRecursive(filterText, this.arbolcuentas, 'nombre');
    }

    // filter string from mat input filter
    applyFilter(filterText: string) {
        this.filterTree(filterText);
        // show / hide based on state of filter string
        if (filterText) {
            this.treeControl.expandAll();
        } else {
            this.treeControl.collapseAll();
        }
    }
}