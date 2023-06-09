
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdministracionInpcComponent } from "./modal-inpc/administracion-inpc.component";

@Component({
    selector: 'inpc',
    moduleId: module.id,
    templateUrl: 'inpc.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la gestion de INPC
 */
export class InpcComponent implements OnInit {


    //Declaracion de variables y Controles
    displayedColumns: string[] = ['cvinpc', 'fecha', 'inpcD', 'estatus', 'acciones'];
    listaINPC = []
    dataSourceINPC: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor para la clase INPC
     * @param service -- Servoce para el acceso de datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Metodo OnInit de la clase INPC
     */
    ngOnInit() {

        this.spslistaInpc();
    }

    /**
     * Metodo que lista los registros de inpc
     */

    spslistaInpc() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaINPC').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaINPC = data;
                this.dataSourceINPC = new MatTableDataSource(this.listaINPC);
                this.dataSourceINPC.paginator = this.paginator;
                this.dataSourceINPC.sort = this.sort;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * Metodo para filtrar INPC
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceINPC.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceINPC.paginator) {
            this.dataSourceINPC.paginator.firstPage();
        }
    }



    /**
* Metodo para dar de baja un INPC
*/
    crudINPC(elemento: any, datos: any) {
        let tipoAccion = 0;

        if (elemento === false) {
            tipoAccion = 3;//Baja
            this.blockUI.start('Procesando Baja...');
        } else {
            tipoAccion = 4;//Alta
            this.blockUI.start('Procesando Alta...');
        }
        this.service.registrarBYID(datos, tipoAccion, 'crudINPC').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    datos.estatus = elemento;
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spslistaInpc();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.message)


            }
        );

    }


    /**
     * Metodo que abre el modal para la gestion de INPC
     */

    abrirINPC(elemento, accion) {
        let titulo = "REGISTRAR";

        if (accion !== 1) {
            titulo = 'EDITAR';
        }
        const dialogoRef = this.dialog.open(AdministracionInpcComponent, {
            data: {
                accion: accion,
                titulo: titulo,
                inpc: elemento
            }
        });


        //Este se usa cuando se cierra el modal paraç
        dialogoRef.afterClosed().subscribe(result => {
            this.spslistaInpc();
        })

    }

}