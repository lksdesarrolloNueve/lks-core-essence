import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { AdministracionRangoInversionesComponent } from './modal-rango-inversiones/admin-rango-inversiones.component';

@Component({
    selector: 'rango-inversiones',
    moduleId: module.id,
    templateUrl: 'rango-inversiones.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 28/10/2021
 * @descripcion: Componente para la gestion de rango de inversiones
 */
export class RangoInversionesComponent implements OnInit {

    //Declaracion de Controles
    dataSourceRangoInversiones: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    //Declaracion de variables
    listaRangoInversiones = [];
    listaMostrar = [];

    // Creamos las columnas de la tabla
    displayedColumns: string[] = ['cveRangoInv', 'descripcion', 'plazo', 'tasa',
        'fechaInicio', 'fechaFin', 'estatus', 'acciones']

    /**
     * Constructor de la clase RangoInversionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsRangoInversiones();
    }
    /**
     * Metodo para filtrar la tabla
     * @param event - evento a filtrar
     */
    applyFilterInversiones(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceRangoInversiones.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceRangoInversiones.paginator) {
            this.dataSourceRangoInversiones.paginator.firstPage();
        }
    }


    /**
     * Metodo que enlista los rangos de inversiones
     */
    spsRangoInversiones() {
        this.blockUI.start('Cargando la información...');
        // Se consume la api para mostrar la lista
        this.service.getListByID(1, 'listaRangoInversiones').subscribe(data => {
                // se declara la lista para mostrar la información en vacia
                this.listaMostrar = []

                //Se crea forEach para agregar la información del JSON de forma lineal
                data.forEach(result => {
                    let jsonLineal = {
                        "rangoInvId": result.rangoInvId,
                        "cveRangoInv": result.cveRangoInv,
                        "descripcion": result.descripcion,
                        "inversionId": result.plazo.inversionId,
                        "plazo": result.plazo.plazo,
                        "fechaInicio": result.fechaInicio,
                        "fechaFin": result.fechaFin,
                        "tasa": result.tasa,
                        "estatus": result.estatus,
                    }
                    this.listaMostrar.push(jsonLineal)
                });

                this.listaRangoInversiones = data;
                this.dataSourceRangoInversiones = new MatTableDataSource(this.listaMostrar);
                this.dataSourceRangoInversiones.paginator = this.paginator;
                this.dataSourceRangoInversiones.sort = this.sort;
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
            });
    }

    /**
     * Metodo para realizar el crud de rango inversiones
     * @param element
     * @param estatus 
     */
    crudRangoInversiones(element: any, estatus) {
        let tipoAccion = 0;

        // Condicion que mostrará el mmensaje de bloqueo dependiendo la accion
        if (estatus) {
            tipoAccion = 4; //REEINGRESO
            this.blockUI.start('Procesando alta...');
        } else {
            tipoAccion = 3; //BAJA
            this.blockUI.start('Procesando baja...');
        }

        // Se declara variable local para guardar la estructura original del JSON
        let datos: any

        //Busca la información de la lista original por la clave
        datos = this.listaRangoInversiones.find((listaRangoInversione: any) => {
            return listaRangoInversione.cveRangoInv === element.cveRangoInv;
        });

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
         * Baja y Reeingreso
        */
        this.service.registrarBYID(datos, tipoAccion, 'crudRangoInversiones').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if (result[0][0] === '0') {
                    // Al interruptor de estatus se le setea el estatus.
                    element.estatus = estatus;
                    // Se muestra el mensaje al front
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    // Hubo un error al momento de realizar la petición
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => { // Cacheo de errores al momento del consumo de la api.
                this.spsRangoInversiones();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )
    }

    /**
     * Metodo que abre un modal para la gestion de rango inversiones
     * @param elemento 
     * @param accion 
     */
    abrirAdminRangoInversion(elemento: any, accion: any) {

        // Declaracion de variable
        let titulo = 'REGISTRAR';

        // Si accion es diferente a 1 = Editar
        if (accion !== 1) {
            titulo = 'EDITAR';
        }

         // Se declara variable local para guardar la estructura original del JSON
         let datos: any

         //Busca la información de la lista original por la clave
         datos = this.listaRangoInversiones.find((listaRangoInversione: any) => {
             return listaRangoInversione.cveRangoInv === elemento.cveRangoInv;
         });

        /**
         * Se manda llamar el modal pasandole los datos.
         */
        const dialogRef = this.dialog.open(AdministracionRangoInversionesComponent,
            {
                // Arreglo de datos que recibira el modal
                data: {
                    accion: accion,
                    titulo: titulo,
                    rangoInversion: datos
                }
            }

        );

        /**
         * Despues de cerrar el modal, 
         * se ejecuta el metodo que enlista los rangos de inversiones en la tabla. 
        */
        dialogRef.afterClosed().subscribe(result => {
            this.spsRangoInversiones();
        });
    }

}