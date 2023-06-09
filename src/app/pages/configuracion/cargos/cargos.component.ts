import { Component, OnInit, ViewChild } from "@angular/core"
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionCargosComponent } from "./modal-cargos/administracion-cargos.component";



@Component({
    selector: 'cargos',
    moduleId: module.id,
    templateUrl: 'cargos.component.html'
})

/**
 * @autor:Luis Rolando Guerrero Calzada
 * version: 1.0.
 * @fecha: 09/11/2021
 * @description: componente para la gestion del cargos
 * 
 */


export class CargosComponent implements OnInit {
    displayedColumns: string[] = [ 'descripcion', "cvefracc", "clavesiti", "estatus", "acciones"];

    //Declaracion de variables y controles
    listaCargos = []
    dataSourceCargos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;


    /**
     * constructor de la clase ISR
     * @param service - service para el acceso de datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    ngOnInit(): void {
        this.spslistaCargos()
    }

    /**
     * Metodo que lista los registros de isr
     */
    spslistaCargos() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaCargos').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCargos = data
                this.dataSourceCargos = new MatTableDataSource(this.listaCargos);
                this.dataSourceCargos.paginator = this.paginator;
                this.dataSourceCargos.sort = this.sort;

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
    * Metodo para filtrar
    * @param event --evento a filtrar
    */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCargos.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCargos.paginator) {
            this.dataSourceCargos.paginator.firstPage();
        }
    }

    /**
   * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
   */
    crudCargos(elemento: any, datos: any) {
        let tipoAccion = 0;

        if (elemento === false) {
            tipoAccion = 3 // baja
            this.blockUI.start('Procesando Baja...')
        } else {
            tipoAccion = 4 //alta
            this.blockUI.start('Procesando Alta...')

        }

        let objeto = {
            clavesiti: datos.clavesiti,
            cvefracc: datos.cvefracc,
            descripcion: datos.descripcion,
            estatus: datos.estatus,
            cargo: "{{0}}"
        }
        this.service.registrarBYID(objeto, tipoAccion, 'crudCargos')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    datos.estatus = elemento;
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.spslistaCargos()
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            })
    }


    /**
    * 
    * Metodo que abre un modal para la administración de isr
    */
    abrirAdminCargo(elemento: any, accion: any) {
        let titulo = "REGISTRAR ";

        if (accion !== 1) {
            titulo = "EDITAR ";
        }

        const dialogRef = this.dialog.open(AdministracionCargosComponent, {
            width: '50%', data:
            {
                titulo: titulo,
                accion: accion,
                cargos: elemento

            }
        });

        //este se usa cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spslistaCargos();
        })
    }


}