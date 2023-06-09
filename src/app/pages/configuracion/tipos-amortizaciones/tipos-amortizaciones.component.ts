import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminTipoAmortizacionComponent } from "./modal-tipoamortizacion/administracion-tipoamortizacion.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";


@Component({
    selector: 'tipos-amortizaciones',
    moduleId: module.id,
    templateUrl: 'tipos-amortizaciones.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 17/09/2021
 * @descripcion: Componente para la gestion de tipos amortizaciones
 */
export class TipoAmortizacionComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['consecutivo', 'clave','descripcion', 'estatus', 'acciones'];
    dataSourceTipoAmortizacion: MatTableDataSource<any>;
    listaTipoCredito: any;
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
        this.spsTipoAmortizacion();

    }

    /**
 * Metodo para cargar tabla de Tipos Amortizaciones
 */
     spsTipoAmortizacion() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1,'listaTipoAmortizacion').subscribe(
            data => {
                this.blockUI.stop();
                this.listaTipoCredito = data;
                this.dataSourceTipoAmortizacion = new MatTableDataSource(this.listaTipoCredito);
                this.dataSourceTipoAmortizacion.paginator = this.paginator;
                this.dataSourceTipoAmortizacion.sort = this.sort;
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
        this.dataSourceTipoAmortizacion.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceTipoAmortizacion.paginator) {
            this.dataSourceTipoAmortizacion.paginator.firstPage();
        }
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
        const dialogRef = this.dialog.open(AdminTipoAmortizacionComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                tipoamortizacion: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsTipoAmortizacion();
        });
    }

    /**
     * metodo para dar de baja el tipo amortizacion
     * @param elemento - Id a dar de baja
     *      
     * */
    bajaregistroTipoAmort(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "tipoamortizacionId": elemento.tipoamortizacionId,
            "descripcion": elemento.descripcion,
            "estatus": false
        };
        this.service.registrarBYID(data, 3, 'crudTipoAmortizacion').subscribe(
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
                this.spsTipoAmortizacion();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * metodo para dar de alta tipo amortizacion
     * @param elemento 
     *      
     * */
    altaRegistroTipoAmort(elemento: any) {
        //areglo que contiene los datos para reingreso
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "tipoamortizacionId": elemento.tipoamortizacionId,
            "descripcion": elemento.descripcion,
            "estatus": true
        };
        this.service.registrarBYID(data, 4, 'crudTipoAmortizacion').subscribe(
            result => {
                elemento.estatus = true;
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.blockUI.stop();
                this.spsTipoAmortizacion();
                this.service.showNotification('top', 'right', 4, errorReingreso.error + '<br>' + errorReingreso.trace);
            }
        );

    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaregistroTipoAmort(element);
        } else {
            this.altaRegistroTipoAmort(element);
        }

    }

}

