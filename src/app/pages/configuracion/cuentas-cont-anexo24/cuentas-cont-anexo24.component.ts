import { FlatTreeControl } from "@angular/cdk/tree";
import { OnInit, Component } from "@angular/core";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { CMAnexoComponent } from "./cm-anexo/cm-anexo.component";
import { MatDialog } from "@angular/material/dialog";

/** Flat node with expandable and level information */
interface CuentaNode {
    expandable: boolean;
    cuentaid: number;
    nombre: string;
    cuenta: string;
    level: number;
}

/**
* @autor: Horacio Abraham Picón Galván
* @version: 1.0.0
* @fecha: 10/11/2021
* @descripcion: Componente para la administración de Cuentas Contables Anexo 24.
*/

@Component({
    selector: 'cuentas-cont-anexo24',
    moduleId: module.id,
    templateUrl: 'cuentas-cont-anexo24.component.html',
})
export class CuentasContablesAnexo24Component implements OnInit {

    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;

    //Formulario
    formCuenta: UntypedFormGroup;

    cuentaid : number;

    //Observables
    opcionesAnexo: Observable<string[]>;
    
    //listas
    listaCuentasAnexo: any[];
    
    //Botones boolean
    mostrarGuardar: boolean =true;
    mostrarEditar: boolean =false;

    // Declracion de variables
    arbolcuentas: any;

    /** Arbol Cuentas */
    private _transformer = (node: any, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            cuentaid : node.cta_cont_id,
            nombre: node.nombre_cta,
            cuenta: node.cod_agrupador,
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
     * Constructor
     * @param service 
     * @param fomrBuilder 
     */
    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder,
        private dialog: MatDialog) {
 
        this.formCuenta = this.fomrBuilder.group({
            nivel: new UntypedFormControl('', [Validators.required, Validators.maxLength(2), Validators.pattern('[0-9]*')]),
            codAgrupador: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            nombreCta: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            anexo: new UntypedFormControl('',{ validators: [this.autocompleteObjectValidator()] }),
            estatus: new UntypedFormControl(true)
        });

    }

    hasChild = (_: number, node: CuentaNode) => node.expandable;

    /**
     * OnInit
     */
    ngOnInit() {
  
        this.spsJSONCuentasContablesAnexo();
        this.nuevaCuenta();

    }

    /**
     * Metodo que consulta y setea el arbol para mostar en vista
     */
     spsJSONCuentasContablesAnexo() {
        this.blockUI.start('Cargando datos...');

        this.service.getList('listaJsonAnexo24').subscribe(data => {
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
     * Método para incializar una nueva cuenta.
     */
    nuevaCuenta(){
       this.formCuenta.reset();
       this.spsCuentasAnexo24();
       this.mostrarEditar = false;
       this.mostrarGuardar  = true;
       this.formCuenta.get('estatus').setValue(true);
    };

    /**
     * Filtrado de cuentas por Id
     */
     spsCuentasContablesByID(elemento: any) {
        this.mostrarEditar = true;
        this.mostrarGuardar  = false;
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(elemento, 'spsCuentaAnexoById').subscribe(
            data => {
             
                
                this.blockUI.stop();

                let cuentas = this.listaCuentasAnexo.filter(x => x.ctaContableID == data[0].cuentaPadreId);

                this.cuentaid = data[0].ctaContableID;
                this.formCuenta.get('nivel').setValue(data[0].nivel);
                this.formCuenta.get('codAgrupador').setValue(data[0].codAgrupador);
                this.formCuenta.get('nombreCta').setValue(data[0].nombreCta);
                this.formCuenta.get('anexo').setValue(cuentas[0]);
                this.formCuenta.get('estatus').setValue(data[0].estatus);
                
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * 
     * @returns Editar cuenta contable anexo 24
     */
    editarCuentaContableAnexo(): void {
        
        if (this.formCuenta.invalid) {
            this.validateAllFormFields(this.formCuenta);
            return;
        }


        this.blockUI.start('Guardando ...');

        let cuentaPadre = 0;

        if (!this.formCuenta.get('anexo').value) {
            cuentaPadre = 0;
        } else {
            cuentaPadre = this.formCuenta.get('anexo').value.ctaContableID
        }

        const data = {
            "ctaContableID": this.cuentaid,
            "nivel": this.formCuenta.get('nivel').value,
            "codAgrupador": this.formCuenta.get('codAgrupador').value,
            "nombreCta": this.formCuenta.get('nombreCta').value,
            "cuentaPadreId": cuentaPadre,
            "estatus": this.formCuenta.get('estatus').value

        };

        this.service.registrarBYID(data, 2, 'crudCuentaAnexo24').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.spsJSONCuentasContablesAnexo();
                    this.formCuenta.reset();
                    this.nuevaCuenta();
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
     * 
     * @returns Guardar cuenta contable anexo 24
     */
     guardarCuentaContableAnexo(): void {
        
        if (this.formCuenta.invalid) {
            this.validateAllFormFields(this.formCuenta);
            return;
        }


        this.blockUI.start('Guardando ...');

        let cuentaPadre = 0;

        if (!this.formCuenta.get('anexo').value) {
            cuentaPadre = 0;
        } else {
            cuentaPadre = this.formCuenta.get('anexo').value.ctaContableID
        }

        const data = {
            "ctaContableID": 0,
            "nivel": this.formCuenta.get('nivel').value,
            "codAgrupador": this.formCuenta.get('codAgrupador').value,
            "nombreCta": this.formCuenta.get('nombreCta').value,
            "cuentaPadreId": cuentaPadre,
            "estatus": this.formCuenta.get('estatus').value

        };

        this.service.registrarBYID(data, 1, 'crudCuentaAnexo24').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.spsJSONCuentasContablesAnexo();
                    this.formCuenta.reset();
                    this.nuevaCuenta();
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
    };

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
     * Validaciones FormGroup
     */
    validaciones = {
        'nivel': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño maximo es de 2 dígitos.' },
            { type: 'pattern', message: '  El campo solo acepta enteros.' }
        ],
        'codAgrupador': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño maximo es de 255 dígitos.' }
        ],
        'nombreCta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'El tamaño maximo es de 255 dígitos.' }
        ],
        'anexo': [
            { type: 'invalidAutocompleteObject', message: 'La cuenta anexo 24 no pertenece a la lista.' }
        ]};

        
    // filtrar recursivamente en una cadena de texto usando el valor del objeto de propiedad
  filterRecursive(filterText: string, array: any[], property: string) {
    let filteredData;

    //haga una copia de los datos para que no mutemos el original
    function copy(o: any) {
      return Object.assign({}, o);
    }

    // has string
    if (filterText) {
      // necesita la cadena para que coincida con el valor de la propiedad
      filterText = filterText.toLowerCase();
      // copy obj so we don't mutate it and filter
      filteredData = array.map(copy).filter(function x(y) {
        if (y[property].toLowerCase().includes(filterText)) {
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
    this. dataSourceCuentas.data = this.filterRecursive(filterText, this.arbolcuentas, 'nombre_cta');
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

  /**
   * Abre la ventana modal
   */
  abrirDialogoCargaMasiva(){
      //se abre el modal
      const dialogRef = this.dialog.open(CMAnexoComponent, {
        width: '40%',
        data: {
         listaCuentasAnexo: this.listaCuentasAnexo
        }
    });
    dialogRef.afterClosed().subscribe(result => {
        this.spsJSONCuentasContablesAnexo();
        this.spsCuentasAnexo24();
    });
  }

}