import { Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdministracionActividadesPLD } from "./modal-actividades-pld/administracion-act-pld.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'actividades-pld',
    moduleId: module.id,
    templateUrl: 'actividades-pld.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 09/09/2021
 * @descripcion: Componente para la gestion de actividades economicas pld
 */
export class ActividadesPLDComponent {

    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['cvePLD', 'actividadEco', 'estatus', 'acciones'];
    dataSourceActividades: MatTableDataSource<any>;
    listaActividades: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente ActividadesPLDComponent
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsActividades();
    }

    /**
     * Metodo para cargar en tabla las actividades pld
     */
    spsActividades() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1,'spsActividadesPLD').subscribe(data => {
            this.blockUI.stop();
        
            this.listaActividades = data;
            this.dataSourceActividades = new MatTableDataSource(this.listaActividades);
            this.dataSourceActividades.paginator = this.paginator;
            this.dataSourceActividades.sort = this.sort;
            
            
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para filtrar actividades pld
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceActividades.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceActividades.paginator) {
            this.dataSourceActividades.paginator.firstPage();
        }
    }


    /**
     * Metodo que me abre un modal para la gestion de actividades pld (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirDialogoActividades(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionActividadesPLD, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                actividad: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsActividades();
        });
    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any){
        if(element.estatus){
            this.blockUI.start('Procesando baja...');
            this.bajaActividad(element);
        }else{
            this.blockUI.start('Procesando reingreso...');
            this.reingresoActividad(element);
        }

    }

    /**
     * Metodo para dar de baja una actividad pld
     */
    bajaActividad(elemento: any) {

        const data = {
            "actividadId":   elemento.actividadId,
            "cvePLD":        elemento.cvePLD,
            "actividadEco":  elemento.actividadEco,
            "estatus":       elemento.estatus
        };

        this.service.registrarBYID(data, 3, 'crudActividadesPLD').subscribe(
            result => {

                elemento.estatus = false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.spsActividades();
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    /**
     * Metodo para dar de baja una actividad pld
     */
     reingresoActividad(elemento: any) {

        const data = {
            "actividadId":   elemento.actividadId,
            "cvePLD":        elemento.cvePLD,
            "actividadEco":  elemento.actividadEco,
            "estatus":       true
        };

        this.service.registrarBYID(data, 4, 'crudActividadesPLD').subscribe(
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

                this.spsActividades();
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );

    }


}