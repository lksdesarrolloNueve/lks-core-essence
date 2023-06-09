import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { data } from "jquery";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { AdminCapNetoComponent } from "./admin-cap-neto/admin-cap-neto.component";

@Component({
    selector: 'capital-neto',
    moduleId: module.id,
    templateUrl: 'capital-neto.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 25/07/2022
 * @descripcion: Componente para la gestion de capital neto
 */

export class CapitalNetoComponent implements OnInit {

    //Declaracion de varablies y Controles
    displayedColumns: string[] = ['periodo', 'ejercicio', 'capitalNeto', 'limiteFisica', 'limiteMoral','montoRelacionado','sucursal','acciones']
    listaCapNeto = [];
    //Botones boolean
    mostrarFiltrar: boolean = false;
    mostrarBaja: boolean = true;
    seleccionado: boolean;
    allSelected: boolean;
    filteredSucursales: Observable<string[]>;
    listSucursales: any[];
    sucursales = new UntypedFormControl([]);
    listaAgregaSucursales: any[] = [];
    arrayIdsSuc: any[] = [];
    formPeriodo: UntypedFormGroup;
    listaSucursalesSeleccionadas = [];
    fechaGeneral: string;
    ejercicioP: any;
    periodoPC: any;
    estatusP: any;
    vAnio: any;
    accion: number;
    titulo: string;
    dataSourceCapNeto: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    //Creación del arreglo para implementar las validaciones
    validaciones = {
        'ejercicioP': [
            { type: 'required', message: 'Campo requerido para registro.' },
            { type: 'maxlength', message: 'Campo maximo 4 numeros.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ]
    }
    /**
     * Constructor de la clase PeriodoComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog, private fomrBuilder: UntypedFormBuilder) {
        this.formPeriodo = this.fomrBuilder.group({
            ejercicioP: new UntypedFormControl({ value: '', disabled: false },[Validators.required,Validators.maxLength(4),Validators.pattern('[0-9]*')]),
        });
        this.vAnio = new Date().getFullYear();
    }

    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsCapNeto();
        this.mostrarFiltrar = true;
    }

    /**
     * Metodo que lista los valores de capital neto
     */
    spsCapNeto() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.vAnio, 'listaCapNeto').subscribe(data1 => {
            this.blockUI.stop();
            this.listaCapNeto = data1;
            this.dataSourceCapNeto = new MatTableDataSource(this.listaCapNeto);
            this.dataSourceCapNeto.paginator = this.paginator;
            this.dataSourceCapNeto.sort = this.sort;
            //set a new filterPredicate function
            this.dataSourceCapNeto.filterPredicate = (dataSourceCapNeto, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, dataSourceCapNeto, key);
                };
                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate

        }, error => {
            this.service.showNotification('top', 'right', 4, error.message);
        });
    }

    /**
    * Metodo que lista los valores de capital neto
    */
    spsCapNeto2() {
        if (this.formPeriodo.invalid) {
            this.validateAllFormFields(this.formPeriodo);
            return;

        }
        this.ejercicioP = this.formPeriodo.get('ejercicioP').value;
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.ejercicioP, 'listaCapNeto').subscribe(data1 => {

            this.blockUI.stop();
            this.listaCapNeto = data1;
            this.dataSourceCapNeto = new MatTableDataSource(this.listaCapNeto);
            this.dataSourceCapNeto.paginator = this.paginator;
            this.dataSourceCapNeto.sort = this.sort;
            //set a new filterPredicate function
            this.dataSourceCapNeto.filterPredicate = (dataSourceCapNeto, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, dataSourceCapNeto, key);
                };
                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate

        }, error => {
            this.service.showNotification('top', 'right', 4, error.message);
        });
    }
    /**
   * Metodo para abrir ventana modal
   * @param data -- Objecto o valor a condicionar
   */
    abrirdialogo(data) {
        /**si la accion es igual a o el titulo se llamara a registrar o editar  */
        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = 'Editar';

        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdminCapNetoComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                capneto: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsCapNeto();
        });
    }


    /**
     * Metodo para filtrar la tabla
     */

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCapNeto.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCapNeto.paginator) {
            this.dataSourceCapNeto.paginator.firstPage();
        }
    }

    //also add this nestedFilterCheck class function
    comprobacionFiltroAnidado(search, dataFiltro, key) {
        if (typeof dataFiltro[key] === 'object') {
            for (const k in dataFiltro[key]) {
                if (dataFiltro[key][k] !== null) {
                    search = this.comprobacionFiltroAnidado(search, dataFiltro[key], k);
                }
            }
        } else {
            search += dataFiltro[key];
        }
        return search;
    }

    /**
* Valida Cada atributo del formulario
* @param formGroup - Recibe cualquier asigna de FormGroup
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