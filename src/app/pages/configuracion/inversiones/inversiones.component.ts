import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { AdministracionInversionesComponent } from './modal-inversiones/admin-inversiones.component';

@Component({
    selector: 'inversiones',
    moduleId: module.id,
    templateUrl: 'inversiones.component.html'
})
/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la gestion de inversiones
 */
export class InversionesComponent implements OnInit {
    
    //Declaracion de variables
    listaInversiones = [];
    // Seteamos el interruptor en true
    //estatusIsr = new FormControl({value: '', disabled : true});
    // Creamos las columnas de la tabla
    displayedColumns: string[] = ['claveInversion', 'descripcion', 'plazo', 'tasa', 'pasivoDeposito', 'pasivoInteresDevengado',
    'pasivoIsrRetenido', 'pasivoRetencionIde', 'resultadoInteresPagado', 'resultadoInteresDevengado', 
    'montoInf', 'montoSup', 'retieneIsr', 'estatus', 'acciones']

    //Declaracion de Controles
    dataSourceInversiones: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    /**
     * Constructor de la clase InversionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog){

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsInversiones();
    }

    /**
     * Metodo que enlista las inversiones
     */
    spsInversiones() {
        this.blockUI.start('Cargando la información...');
        this.service.getListByID(1, 'listaInversiones').subscribe(
            data =>{
                this.listaInversiones = data;
                this.dataSourceInversiones = new MatTableDataSource(this.listaInversiones);
                this.dataSourceInversiones.paginator = this.paginator;
                this.dataSourceInversiones.sort = this.sort;
                this.blockUI.stop();
            }, error =>{
                this.blockUI.stop();
            });
    }

    /**
     * Metodo para filtrar la tabla
     * @param event - evento a filtrar
     */
    applyFilterInversiones(event: Event){
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceInversiones.filter = filterValue.trim().toLowerCase();
        
        if(this.dataSourceInversiones.paginator){
            this.dataSourceInversiones.paginator.firstPage();
        }
    }

    /**
     * Metodo para realizar el crud de inversiones
     * @param element 
     */
    crudInversion(element: any, estatus){
        let tipoAccion = 0;
        if(estatus){
            tipoAccion = 4; //REEINGRESO
            this.blockUI.start('Procesando alta...');
        } else {
            tipoAccion = 3; //BAJA
            this.blockUI.start('Procesando baja...');
        }

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
         * Baja y Reeingreso
        */
        this.service.registrarBYID(element, tipoAccion, 'crudInversiones').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if(result[0][0] === '0'){
                    // Al interruptor de estatus se le setea el estatus.
                    element.extensionInversion.estatus = estatus;
                    // Se muestra el mensaje al front
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    // Hubo un error al momento de realizar la petición
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => { // Cacheo de errores al momento del consumo de la api.
                this.spsInversiones();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )
    }

    /**
     * Metodo que abre un modal para la gestion de inversiones
     * @param elemento 
     * @param accion 
     */
    abrirAdminInversion(elemento : any, accion : any) {
        
        // Declaracion de variable
        let titulo = 'REGISTRAR';

        // Si accion es diferente a 1 = Editar
        if(accion !== 1){
            titulo = 'EDITAR';
        }

        /**
         * Se manda llamar el modal pasandole los datos.
         */
        const dialogRef = this.dialog.open(AdministracionInversionesComponent, 
            {
                // Arreglo de datos que recibira el modal
                data : {
                    accion: accion,
                    titulo: titulo,
                    inversion: elemento
                }
            }

        );

        /**
         * Despues de cerrar el modal, 
         * se ejecuta el metodo que enlista las inversiones en la tabla. 
        */
        dialogRef.afterClosed().subscribe(result => {
            this.spsInversiones();
        });
    }
}