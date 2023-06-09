import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionClaseActividadesComponent } from "./modal-clase-actividades/administracion-clase-actividades.component";



@Component({
    selector: 'clase-actividades',
    moduleId: module.id,
    templateUrl: 'clase-actividades.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de Clase de Actividades SCIAN
 */
export class ClaseActividadesComponent implements OnInit {
    displayedColumns: string[] = ['codCActividad', 'descripcion', 'sueldoMesAprox', 'actividadPLD', 'subRama', 'estatus', 'acciones'];
    dataSourceClaseActividades: MatTableDataSource<any>;
    listaClaseAvtividades: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente Clase de Actividades SCIAN Component
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        
    }

    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsClaseActividades();
    }

    /**
     * Metodo para obtener la lista de Clase de Acitivdad Scian.
     * por Sub Rama
     */
    spsClaseActividades() {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaClaseActividades').subscribe(data => {
            this.blockUI.stop();
  
            this.listaClaseAvtividades = data;
            this.dataSourceClaseActividades = new MatTableDataSource(this.listaClaseAvtividades);
            this.dataSourceClaseActividades.paginator = this.paginator;
            this.dataSourceClaseActividades.sort = this.sort;
           
            //set a new filterPredicate function
            this.dataSourceClaseActividades.filterPredicate = (dataClase, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, data, key);
                };
                const dataStr = Object.keys(dataClase).reduce(accumulator, '').toLowerCase();
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
     * Metodo para filtrar clase actividades
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceClaseActividades.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceClaseActividades.paginator) {
            this.dataSourceClaseActividades.paginator.firstPage();
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
        const dialogRef = this.dialog.open(AdministracionClaseActividadesComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                claseActividad: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsClaseActividades();//se refresque la tabla y se vea la actividad        
        });
    }


    /**
     * Metodo para dar de baja una actividad SCIAN
     */
    bajaActividad(elemento: any) {

        const data = {
            "cActividadId": elemento.cActividadId,
            "codCActividad": elemento.codCActividad,
            "descripcion": elemento.descripcion,
            "sueldoMesAprox" : elemento.sueldoMesAprox,
            "actividadPLD" : elemento.actividadPLD,
            "subRama" : elemento.subRama,
            "estatus": false
        };

        this.service.registrarBYID(data, 3, 'crudClaseActividades').subscribe(
            result => {

                elemento.estatus = false;
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
     * Metodo para dar de baja una actividad SCIAN
     */
    reingresoActividad(elemento: any) {

        const data = {
            "cActividadId": elemento.cActividadId,
            "codCActividad": elemento.codCActividad,
            "descripcion": elemento.descripcion,
            "sueldoMesAprox" : elemento.sueldoMesAprox,
            "actividadPLD" : elemento.actividadPLD,
            "subRama" : elemento.subRama,
            "estatus": true
        };

        

        this.service.registrarBYID(data, 4, 'crudClaseActividades').subscribe(
            result => {
                elemento.estatus = true;
                this.blockUI.stop();

                //Se condiciona resultado
                if (result[0][0] === '0') {

                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, errorReingreso => {
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );

    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.blockUI.start('Procesando baja...');
            this.bajaActividad(element);
        } else {
            this.blockUI.start('Procesando reingreso...');
            this.reingresoActividad(element);
        }

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