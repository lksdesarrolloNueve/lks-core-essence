import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { ModalPbaComponent } from "./modal-pba/modal-pba.component";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/05/2022
 * @description: Componente para la gestion de PBA
 * 
 */
@Component({
    selector: 'pba',
    moduleId: module.id,
    templateUrl: 'pba.component.html'
})

export class PbaComponent implements OnInit {
    displayedColumns: string[] = ['nombre', 'rfc', 'curp', 'fechaNac', 'estatus', 'acciones'];
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    dataSourcePba = new MatTableDataSource();
    listaPba: any;


    constructor(
        private service: GestionGenericaService,
        public dialog: MatDialog,
    ) {

    }

    ngOnInit() {
        this.spsPBA();
    }


    /**
     * Se consulta la lista de PBA para vaciar su contenido en una tabla
     */
    spsPBA() {
        this.blockUI.start('Cargando...');

        this.service.getList('spsPBA').subscribe(data => {
            this.blockUI.stop();
            this.listaPba = data;

            this.dataSourcePba.data = this.listaPba;
            this.dataSourcePba.paginator = this.paginator;
            this.dataSourcePba.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
     * Se filtra el contenido de la tabla en base al input de filtro
     * @param event
     */
    filtrar(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourcePba.filter = filterValue.trim().toLowerCase();
    }


    /**
     * Metodo que redirige al modal de pba, enviando los datos del renglon escogido en la tabla
     */
    crudPBA(accion: number, row: any) {
        const dialofRef = this.dialog.open(ModalPbaComponent, {
            width: '40%',
            data: {
                accion: accion, // 1. Agregar 2. Actualizar o Elminar (Cambiar estatus a false)
                pba: row
            }
        });

        dialofRef.afterClosed().subscribe(() => { this.spsPBA(); });
    }


    /**
     * Método para asignar los parametros necesarios para generar un excel en base al json que se proporcione
     */
    public exportarPdf() {
        this.blockUI.start('Generando reporte');

        this.service.getList('reportePBA').subscribe(data => {
            this.blockUI.stop();

            if (data[0] === '0') {
                const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
                const fileName = 'Reporte_PBA.pdf';

                window.open(linkSource, fileName);

            } else {
                this.service.showNotification('top', 'right', 4, data[1])
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'rigth', 4, error[1]);
        });
    }

    /**
   * Método para cambiar estatus si es activo-desactivo y 
   * si esta desactivado-activa.
   * @param estatus - Valor del toggle
   * @param element - Elemento a cambiar de estatus
   */
    cambiaEstatus(estatus: any, element: any) {

        var encabezado = "";
        var body = "";
        if (estatus === true) {
            encabezado = "Activar Estatus de PBA";
            body = 'Al realizar esta acción se da de alta el registro. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar Estatus de PBA'S ";
            body = 'Al realizar esta acción se da de baja el registro. ¿Desea continuar?'
        }
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(res => {
            if (res === 0) {
                this.blockUI.start('Procesando...');

                let moral = (element.moral == true) ? true : false;

                let json = {
                    "accion": 3,
                    "datos": [
                        element.sujetoId,
                        estatus,
                        moral
                    ]
                };

                this.service.registrar(json, 'crudPBA').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.estatus = estatus;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.spsPBA();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsPBA();
            }

        });

    }
}