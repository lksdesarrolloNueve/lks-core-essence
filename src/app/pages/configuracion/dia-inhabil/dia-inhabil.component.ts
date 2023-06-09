import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminDiaInhabilComponent } from "./modal-diainhabil/administracion-diainhabil.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MCargaDias } from "./m-cm-dias/m-cm-dias.component";


@Component({
    selector: 'dia-inhabil',
    moduleId: module.id,
    templateUrl: 'dia-inhabil.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 22/09/2021
 * @descripcion: Componente para la gestion de dias inhabiles
 */
export class DiaInhabilComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['fecha', 'descripcion', 'apliinversion', 'aplicredito', 'estatus', 'acciones'];
    dataSourceDiaInhabil: MatTableDataSource<any>;
    listaDiaInhabil: any;
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
        this.spsDiaInhabil();

    }

    /**
 * Metodo para cargar tabla de dias inhabiles
 */
    spsDiaInhabil() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaDiaInhabil').subscribe(
            data => {
                this.blockUI.stop();
                this.listaDiaInhabil = data;
                this.dataSourceDiaInhabil = new MatTableDataSource(this.listaDiaInhabil);
                this.dataSourceDiaInhabil.paginator = this.paginator;                this.dataSourceDiaInhabil.sort = this.sort;
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
        this.dataSourceDiaInhabil.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceDiaInhabil.paginator) {
            this.dataSourceDiaInhabil.paginator.firstPage();
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
        const dialogRef = this.dialog.open(AdminDiaInhabilComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                diainhabil: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsDiaInhabil();
        });
    }

    /**
     * metodo para dar de baja el dia inhabil
     * @param elemento - Id a dar de baja
     *      
     * */
    bajaregistroDia(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "diainhabilid": elemento.diainhabilid,
            "fecha": elemento.fecha,
            "descripcion": "",
            "apliinversion": true,
            "aplicredito": false,
            "estatus": false
        };
        this.service.registrarBYID(data, 3, 'crudDiaInhabil').subscribe(
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
                this.spsDiaInhabil();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * metodo para dar de alta dia inhabil
     * @param elemento 
     *      
     * */
    altaRegistroDia(elemento: any) {
        //areglo que contiene los datos para reingreso
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "diainhabilid": elemento.diainhabilid,
            "fecha": elemento.fecha,
            "descripcion": "",
            "apliinversion": true,
            "aplicredito": true,
            "estatus": true
        };
        this.service.registrarBYID(data, 4, 'crudDiaInhabil').subscribe(
            result => {
                elemento.estatus = true;
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.spsDiaInhabil();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaregistroDia(element);
        } else {
            this.altaRegistroDia(element);
        }

    }
/**
 * Metodo que abre el modal de Cargas masivas de dias inhabiles
 */
    abrirDialogoCargaMasiva(){
         //se abre el modal
         const dialogRef = this.dialog.open(MCargaDias);

        dialogRef.afterClosed().subscribe(result => {
    
        });
    }
}

