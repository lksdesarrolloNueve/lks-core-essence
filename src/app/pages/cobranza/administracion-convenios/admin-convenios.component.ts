import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormControl, ValidatorFn } from "@angular/forms";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { MatDialog } from "@angular/material/dialog";
import globales from "../../../../environments/globales.config";
import { ModalConveniosComponent } from "./modal-convenios/modal-convenios.component";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 16/06/2022
 * @description: Componente para la administracion de convenios
 * 
 */
@Component({
    selector: 'admin-convenios',
    moduleId: module.id,
    templateUrl: 'admin-convenios.component.html'
})

export class AdminConveniosComponent implements OnInit {
    displayedColumns = ['convenio', 'credito', 'fechaRegistro', 'fechaVigencia', 'estatus', 'acciones'];
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    filtroSucursal = new UntypedFormControl();
    dataSourceConvenios = new MatTableDataSource();
    lblCliente: string = globales.ente;
    vigentesChecked = false;
    listaConvenios: any;
    listaSucursales: any;
    opcionesSucursal: Observable<string[]>;
    pageSizeOptions: number[] = [10, 25, 100];
    pageSize = 10;
    currentPage = 0;




    constructor(
        private service: GestionGenericaService,
        public dialog: MatDialog,
    ) {
    }


    ngOnInit() {
        this.spsConvenios(0, 1, 0, this.pageSize);
        this.spsSucursales();
    }


    /**
     * Método que consulta los convenios correspondientes a un credito de un cliente
     */
    spsConvenios(clienteId, accion, pagina, tamanoPag) {
        this.blockUI.start('Cargando...');

        let path = `${clienteId}/${accion}/${pagina}/${tamanoPag}`;

        this.service.getListByID(path, 'listaConvenios').subscribe(result => {
            this.listaConvenios = [];
            this.listaConvenios = result;

            this.dataSourceConvenios.data = this.listaConvenios;
            this.dataSourceConvenios.paginator = this.paginator;
            this.dataSourceConvenios.sort = this.sort;

            this.dataSourceConvenios.filterPredicate = (data, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.nestedFilterCheck(currentTerm, data, key);
                };
                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            };

            setTimeout(() => {
                this.paginator.pageIndex = this.currentPage;
                this.paginator.length = Number(result[0].extConvenio.numRegistros);
            });

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Funcion que consulta las sucursales registradas en la BD
     */
    spsSucursales() {
        this.blockUI.start('Cargando...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = [];
            this.listaSucursales = data;

            this.opcionesSucursal = this.filtroSucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo para cargar los datos por pagina
     */
    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.spsConvenios(0, 1, this.currentPage, this.pageSize)
    }


    /**
     * Metodo para filtrar solo los convenios vigentes
     */
    mostrarVigentes(checked) {
        if (checked.checked) {
            this.dataSourceConvenios.data = this.listaConvenios.filter(c => new Date(c.fechaVigencia) >= new Date());
        } else {
            this.spsConvenios(0, 1, this.currentPage, this.pageSize);
        }
    }


    /* Valida que el texto ingresado pertenezca a la lista 
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
     * Metodo para llamar al modal de crud de convenios
     */
    crudConvenio(accion: number, row: any) {
        const dialogRef = this.dialog.open(ModalConveniosComponent, {
            width: '50%',
            data: {
                accion: accion,
                convenio: row
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(() => { this.spsConvenios(0, 1, this.currentPage, this.pageSize); });
    }


    /**
     * Se filtra el contenido de la tabla en base al input de filtro
     * @param event
     */
    filtrar(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceConvenios.filter = filterValue.trim().toLowerCase();
    }


    /**
     * Se muestran todos los convenios en caso de borrarse el filtro de sucursal
     */
    filtrarTodos(event: Event) {
        if ((event.target as HTMLInputElement).value == "") this.spsConvenios(0, 1, this.currentPage, this.pageSize);
    }


    /**
     * Funcion que filtra los convenios por sucursal
     */
    filtrarSucursal(sucursal) {
        this.dataSourceConvenios.data = this.listaConvenios.filter(c => c.extConvenio.sucursalId == sucursal.option.value.sucursalid);
    }


    /**
     * Funcion que filtra las opciones del auto-complete de sujetos
     */
    private _filterSucursal(value: any): any[] {

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
     * Metodo para mostrarla sucursal en el filtro de sucursal
     */
    displaySucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
   * Método para cambiar estatus si es activo-desactivo y 
   * si esta desactivado-activa.
   * @param estatus - Valor del toggle
   * @param element - Elemento a cambiar de estatus
   */
    cambiaEstatus(estatus: any, element: any) {

        var encabezado = "";
        var body = "";
        if (estatus === true) {
            encabezado = "Activar Estatus del Convenio";
            body = 'Al realizar esta acción se da de alta el registro. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar Estatus del Convenio ";
            body = 'Al realizar esta acción se da de baja el registro. ¿Desea continuar?'
        }
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(res => {
            if (res === 0) {
                this.blockUI.start('Procesando...');

                let json = {
                    "accion": 3,
                    "datos": [
                        element.clienteId,
                        element.creditoId,
                        null,
                        null,
                        null,
                        null,
                        null,
                        estatus
                    ]
                };

                this.service.registrar(json, 'crudConvenios').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.estatus = estatus;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            }
        });
    }


    /**
     * Funcion para verificar atributos anidados en objetos para el filtrado de datos
     */
    nestedFilterCheck(search, data, key) {
        if (typeof data[key] === 'object') {
            for (const k in data[key]) {
                if (data[key][k] !== null) {
                    search = this.nestedFilterCheck(search, data[key], k);
                }
            }
        } else {
            search += data[key];
        }
        return search;
    }


}