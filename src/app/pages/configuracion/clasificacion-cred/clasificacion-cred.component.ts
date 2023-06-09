import { Component, OnInit, PipeTransform, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdministracionClasificacionCred } from "./modal-clasificacion-cred/administracion-clas-cred.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'clasificacion-cred',
    moduleId: module.id,
    templateUrl: 'clasificacion-cred.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 10/09/2021
 * @descripcion: Componente para la gestion de clasificación de créditos.
 */
export class ClasificacionCredComponent  {

    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['cveClasificacion', 'descripcion', 'estatus', 'acciones'];
    dataSourceClasificacion: MatTableDataSource<any>;
    listaClasificacion: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente ClasificacionCredComponent
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsClasificaciones();
    }

    /**
     * Metodo para cargar en tabla Clasificación de Créditos.
     */
    spsClasificaciones() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1,'spsClasificacionCred').subscribe(data => {
            this.blockUI.stop();

            this.listaClasificacion = data;
            this.dataSourceClasificacion = new MatTableDataSource(this.listaClasificacion);
            this.dataSourceClasificacion.paginator = this.paginator;
            this.dataSourceClasificacion.sort = this.sort;


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para filtrar sucursales
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceClasificacion.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceClasificacion.paginator) {
            this.dataSourceClasificacion.paginator.firstPage();
        }
    }


    /**
     * Metodo que me abre un modal para la gestion clasificación de créditos. (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirDialogoClasificaciones(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionClasificacionCred, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                clasificacion: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsClasificaciones();
        });
    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.blockUI.start('Procesadon baja...');
            this.bajaClasificacion(element);
        } else {
            this.blockUI.start('Procesando reingreso...');
            this.reingresoClasificacion(element);
        }

    }

    /**
     * Metodo para dar de baja una clasificación de créditos
     */
    bajaClasificacion(elemento: any) {

        const data = {
            "clasificacionID": elemento.clasificacionID,
            "cveClasificacion": elemento.cveClasificacion,
            "descripcion": elemento.descripcion,
            "estatus": elemento.estatus
        };

        

        this.service.registrarBYID(data, 3, 'crudClasificacionCred').subscribe(
            result => {

                elemento.estatus = false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {

                this.spsClasificaciones();
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    /**
     * Metodo para dar de baja una clasificación de créditos.
     */
    reingresoClasificacion(elemento: any) {

        const data = {
            "clasificacionID": elemento.clasificacionID,
            "cveClasificacion": elemento.cveClasificacion,
            "descripcion": elemento.descripcion,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudClasificacionCred').subscribe(
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
                
                this.spsClasificaciones();
                this.blockUI.stop();
                
                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );

    }


}