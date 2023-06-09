import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { data } from "jquery";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdministracionIsrComponent } from "./modal-isr/administracion-isr.component";


@Component({
    selector: 'isr',
    moduleId: module.id,
    templateUrl: 'isr.component.html'
})

/**
 * @autor:Luis Rolando Guerrero Calzada
 * version: 1.0.
 * @fecha: 05/10/2021
 * @description: componente para la gestion del isr
 * 
 */

export class IsrComponent implements OnInit {
    displayedColumns: string[] = ['isrID', 'cveIsr', "fecha", "salarios_min", "dias_elevo", "valor_uma", "excento", "tasa", 'estatus', "acciones"];


    //Declaracion de variables y controles
    listaISR = []
    dataSourceISR: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    /**
     * constructor de la clase ISR
     * @param service - service para el acceso de datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Metodo OnInit de la clase isr
     */
    ngOnInit() {
        this.spslistaIsr()

    }

    /**
     * Metodo que lista los registros de isr
     */
    spslistaIsr() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaISR').subscribe(
            (dataISR: any) => {
                this.blockUI.stop();
                this.listaISR = dataISR
                this.dataSourceISR = new MatTableDataSource(this.listaISR);
                this.dataSourceISR.paginator = this.paginator;
                this.dataSourceISR.sort = this.sort;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * Metodo para filtrar monedas sat
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceISR.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceISR.paginator) {
            this.dataSourceISR.paginator.firstPage();
        }
    }

    /**
   * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
   */
    crudISR(elemento: any, datos: any) {
        let tipoAccion = 0;

        if (elemento === false) {
            tipoAccion = 3 // baja
            this.blockUI.start('Procesando Baja...')
        } else {
            tipoAccion = 4 //alta
            this.blockUI.start('Procesando Alta...')

        }

        this.service.registrarBYID(datos, tipoAccion, 'crudISR')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    datos.estatus = elemento;
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.spslistaIsr()
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            })
    }

    /**
     * 
     * Metodo que abre un modal para la administración de isr
     */
    abrirAdminIsr(elemento:any, accion: any) {
        let titulo = "REGISTRAR ";

        if (accion !== 1) {
            titulo = "EDITAR ";
        }

        const dialogRef = this.dialog.open(AdministracionIsrComponent,{
            data:
            {
                titulo: titulo,
                accion: accion,
                isr: elemento

            }
        });

        //este se usa cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spslistaIsr();
        })  
      }
}