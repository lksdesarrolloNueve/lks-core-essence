import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminFinalidadCreditoComponent } from "./modal-finalidadcredito/administracion-finalidadcredito.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";


@Component({
    selector: 'finalidades-creditos',
    moduleId: module.id,
    templateUrl: 'finalidades-creditos.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 13/09/2021
 * @descripcion: Componente para la gestion de finalidades creditos
 */
export class FinalidadCreditoComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['consecutivo', 'cveFinalidad', 'descripcion', 'estatus', 'acciones'];
    dataSourceFinalidadCredito: MatTableDataSource<any>;
    listaFinalidadCredito: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;


    /**
     * 
     * @param service service para el acceso de datos 
     */

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    }
    ngOnInit() {
        this.spsFinalidadesCreditos();

    }

    /**
 * Metodo para cargar tabla de Finalidades Creditos
 */
    spsFinalidadesCreditos() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1,'listaFinalidadCredito').subscribe(
            data => {
                this.blockUI.stop();
                this.listaFinalidadCredito = data;
                this.dataSourceFinalidadCredito = new MatTableDataSource(this.listaFinalidadCredito);
                this.dataSourceFinalidadCredito.paginator = this.paginator;
                this.dataSourceFinalidadCredito.sort = this.sort;
            }, error => {
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

    }

    //metodo para filtrar en el listado obtenido de base de datos
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceFinalidadCredito.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceFinalidadCredito.paginator) {
            this.dataSourceFinalidadCredito.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    abrirdialogofinalidad(data) {
        /**si la accion es igual a o el titulo se llamara a registrar o editar  */
        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = 'Editar';

        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdminFinalidadCreditoComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                finalidadcre: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsFinalidadesCreditos();
        });
    }

    /**
     * metodo para dar de baja la finalidad credito
     * @param elemento - Id a dar de baja
     *      
     * */
    bajaregistrofinalidad(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "finalidadId": elemento.finalidadId,
            "cveFinalidad": elemento.cveFinalidad,
            "descripcion": elemento.descripcion,
            "estatus": false
        };
        this.service.registrarBYID(data, 3, 'crudFinalidadCredito').subscribe(
            result => {
                elemento.estatus = false;
                if (result[0][0] === '0') {
                    this.blockUI.stop();//se cierra el loader
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.spsFinalidadesCreditos();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * metodo para dar de alta la finalidad credito
     * @param elemento 
     *      
     * */
    altaRegistrofinalidad(elemento: any) {
        //areglo que contiene los datos para reingreso
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "finalidadId": elemento.finalidadId,
            "cveFinalidad": elemento.cveFinalidad,
            "descripcion": elemento.descripcion,
            "estatus": true
        };
        this.service.registrarBYID(data, 4, 'crudFinalidadCredito').subscribe(
            result => {
                elemento.estatus =true;
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorAlta => {
                this.blockUI.stop();
                this.spsFinalidadesCreditos();
                this.service.showNotification('top', 'right', 4, errorAlta.error + '<br>' + errorAlta.trace);
            }
        );

    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaregistrofinalidad(element);
        } else {
            this.altaRegistrofinalidad(element);
        }

    }

}

