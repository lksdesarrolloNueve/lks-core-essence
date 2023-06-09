import { Component,ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdministracionEstadoCred } from "./modal-estado-cred/administracion-estado-cred.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'estado-cred',
    moduleId: module.id,
    templateUrl: 'estado-cred.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 14/09/2021
 * @descripcion: Componente para la gestion de estado de créditos.
 */
export class EstadoCredComponent{

    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['cveEstadoCred', 'descripcion', 'estatus', 'acciones'];
    dataSourceEstado: MatTableDataSource<any>;
    listaEstado: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente EstadoCredComponent
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsEstados();
    }

    /**
     * Metodo para cargar en tabla Estado de Créditos.
     */
    spsEstados() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1,'listaEstadoCred').subscribe(data => {
            this.blockUI.stop();

            this.listaEstado = data;
            this.dataSourceEstado = new MatTableDataSource(this.listaEstado);
            this.dataSourceEstado.paginator = this.paginator;
            this.dataSourceEstado.sort = this.sort;


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para filtrar estados créditos
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceEstado.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceEstado.paginator) {
            this.dataSourceEstado.paginator.firstPage();
        }
    }


    /**
     * Metodo que me abre un modal para la gestion clasificación de créditos. (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirDialogoEstados(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionEstadoCred, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                clasificacion: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsEstados();
        });
    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.blockUI.start('Procesadon baja...');
            this.bajaEstado(element);
        } else {
            this.blockUI.start('Procesando reingreso...');
            this.reingresoEstado(element);
        }

    }

    /**
     * Metodo para dar de baja una estado de créditos
     */
    bajaEstado(elemento: any) {

        const data = {
            "estadoCredId": elemento.estadoCredId,
            "cveEstadoCred": elemento.cveEstadoCred,
            "descripcion": elemento.descripcion,
            "estatus": false
        };

        this.service.registrarBYID(data, 3, 'crudEstadoCred').subscribe(
            result => {
                
                elemento.estatus = false;
                this.blockUI.stop();
                

                if (result[0][0] === '0') {
                    
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.spsEstados();
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    /**
     * Metodo para dar de baja una clasificación de créditos.
     */
    reingresoEstado(elemento: any) {

        const data = {
            "estadoCredId": elemento.estadoCredId,
            "cveEstadoCred": elemento.cveEstadoCred,
            "descripcion": elemento.descripcion,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudEstadoCred').subscribe(
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

                this.spsEstados();
                this.blockUI.stop();
                
                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );

    }


}