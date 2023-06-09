import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AdministracionGeneralesComponent } from './modal-generales/administracion-generales.component';

@Component({
    selector: 'generales',
    templateUrl: 'generales.component.html',

})
export class GeneralesComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    displayedColumns: string[] = ['general', 'clave', 'descripcion', 'categoria', 'estatus', 'acciones'];
    dataSourceGenerales: MatTableDataSource<any>;
    listaGenerales: any;
    accion: number;
    titulo: string;

    /**
    * Constructor del componente garantias
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    * @param service -- Instancia de acceso a datos
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsGenerales();

    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

    }

    /**
         * Metodo para obtener la lista de garantias
         */
    spsGenerales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaGenerales').subscribe(data => {
            this.blockUI.stop();
            this.listaGenerales = data;
            this.dataSourceGenerales = new MatTableDataSource(this.listaGenerales);
            this.dataSourceGenerales.paginator = this.paginator;
            this.dataSourceGenerales.sort = this.sort;

            //set a new filterPredicate function
            this.dataSourceGenerales.filterPredicate = (data, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, data, key);
                };
                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
          * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
          * @param element --Lista con los datos 
          */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaGenerales(element);
        } else {
            this.reingresoGenerales(element);
        }
    }
    /**
   * Metodo para filtrar 
   * @param event --evento a filtrar
   */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceGenerales.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceGenerales.paginator) {
            this.dataSourceGenerales.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    openDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar

        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionGeneralesComponent, {
            width: '600px',
            data: {
                titulo: this.titulo,
                accion: this.accion,
                general: data,
                cveCategoria: ''
            }

        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsGenerales();//se refresque la tabla
        });

    }

    /**
         * Metodo para dar de baja
         * @param elemento --Lista con los datos de Grantia
         */
    bajaGenerales(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "generalesId": elemento.generalesId,
            "cveGeneral": elemento.cveGeneral,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "categoria": { "categoriaId": elemento.categoria.categoriaId }

        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudGenerales').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();//se cierra el loader
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error             
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Metodo para dar de alta 
    * @param element --Lista con los datos de 
    */
    reingresoGenerales(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "generalesId": elemento.generalesId,
            "cveGeneral": elemento.cveGeneral,
            "descripcion": elemento.descripcion,
            "estatus": true,
            "categoria": { "categoriaId": elemento.categoria.categoriaId }
        };

        this.service.registrarBYID(data, 4, 'crudGenerales').subscribe(
            result => {

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            }
        );

    }



    //also add this nestedFilterCheck class function
    comprobacionFiltroAnidado(search, data, key) {
        if (typeof data[key] === 'object') {
            for (const k in data[key]) {
                if (data[key][k] !== null) {
                    search = this.comprobacionFiltroAnidado(search, data[key], k);
                }
            }
        } else {
            search += data[key];
        }
        return search;
    }
}
