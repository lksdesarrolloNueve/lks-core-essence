import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminCalidadExtranjeroComponent } from "./modal-calidadextranjero/administracion-calidadextranjero.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";


@Component({
    selector: 'calidad-extranjeros',
    moduleId: module.id,
    templateUrl: 'calidad-extranjeros.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 08/09/2021
 * @descripcion: Componente para la gestion de calidades extranjeros
 */
export class CalidadExtranjeroComponent implements OnInit {

    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['consecutivo','descripcion', 'estatus','acciones'];
    dataSourceCalidadExtranjero: MatTableDataSource<any>;
    listCalidadExtranjero: any;
    accion : number;
    titulo : string;

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
        this.spsCalidadesExtranjeros();

    }

    /**
 * Metodo para cargar tabla de calidad extranjeros
 */
    spsCalidadesExtranjeros() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1,'spsCalidadesExtranjeros').subscribe (
            data => {
                this.blockUI.stop();
                this.listCalidadExtranjero = data;
                this.dataSourceCalidadExtranjero = new MatTableDataSource(this.listCalidadExtranjero);
                this.dataSourceCalidadExtranjero.paginator = this.paginator;
                this.dataSourceCalidadExtranjero.sort = this.sort;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

    }
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCalidadExtranjero.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCalidadExtranjero.paginator) {
            this.dataSourceCalidadExtranjero.paginator.firstPage();
        }
    }
    
    abrirdialogocalidad(data) {
        /**si la accion es igual a o el titulo se llamara a registrar o editar  */
        if (data === 0){
            this.titulo ='Registrar';
            this.accion = 1;
        }else{
            this.accion = 2;
            this.titulo = 'Editar';
           
        }
        const dialogRef = this.dialog.open(AdminCalidadExtranjeroComponent,{
            data: {
                accion: this.accion,
                titulo : this.titulo,
                extranjero:data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
        this.spsCalidadesExtranjeros();
        });
    }

    /**
     * metodo para dar de baja la calidad extranjero
     * @param elemento 
     *      
     * */
    bajaregistrocalidad(elemento: any){
        this.blockUI.start('Procesando baja...');
        const data = {
            "calidadid":elemento.calidadid,
            "descripcion": elemento.descripcion,
            "estatus": false
        };
        this.service.registrarBYID(data, 3, 'crudCalidadesExtranjeros').subscribe(
            result => {
                elemento.estatus = false;
                if (result[0][0] === '0') {
                    this.blockUI.stop();//se cierra el loader
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();//se cierra el loader
                this.spsCalidadesExtranjeros();
                this.service.showNotification('top', 'right', 4, error.error+'<br>'+error.trace);
            }
        );

    }

    /**
     * metodo para dar de alta la calidad extranjero
     * @param elemento 
     *      
     * */
    altaRegistrocalidad(elemento: any){
        this.blockUI.start('Procesando alta...');
        const data = {
            "calidadid":elemento.calidadid,
            "descripcion": elemento.descripcion,
            "estatus": true
        };
        this.service.registrarBYID(data, 4, 'crudCalidadesExtranjeros').subscribe(
            result => {
                elemento.estatus = true;
                if (result[0][0] === '0') {
                    this.blockUI.stop();//se cierra el loader
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.blockUI.stop();//se cierra el loader
                this.spsCalidadesExtranjeros();
                this.service.showNotification('top', 'right', 4, errorReingreso.error+'<br>'+errorReingreso.trace);
            }
        );

    }
    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
     cambiaEstatus(element: any){
        if(element.estatus){
            this.bajaregistrocalidad(element);
        }else{
            this.altaRegistrocalidad(element);
        }

    }
    
}

