import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ModalParametrosComponent } from "./modal-parametros/modal-parametros.component";

@Component({
    selector: 'parametros',
    moduleId: module.id,
    templateUrl: 'parametros.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 28/11/2022
 * @descripcion: Componente para la gestion de parametros
 */
export class ParametrosComponent {

    //Declaración de las variables globales 
    listaParametros: any = [];
    displayedColumnaParametros: string[] = ['nombre', 'valor', 'estatus', 'acciones'];
    dataSourceParametros: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
 * Constructor de la clase ParametrosComponent
 * @param service -Instancia de acceso a datos
 * @param dialog - Instancia de acceso a dialogos
 */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
        this.spsParametros();
    }
    /**
     * Método que en lista todos los tipos de bajas para activos
     * accion 1 muestra todos las bajas
     */
    spsParametros() {
        this.service.getListByID(1, 'spsParametros').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaParametros = JSON.parse(data);
            }
            this.dataSourceParametros = new MatTableDataSource(this.listaParametros);
            this.dataSourceParametros.paginator = this.paginator;
            this.dataSourceParametros.sort = this.sort;
        }

        );

    }

    /**
     * Método que filtra la tabla 
     * @param event- dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceParametros.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceParametros.paginator) {
            this.dataSourceParametros.paginator.firstPage();
        }
    }
    /**
    * Método que abre una ventana modal para la gestión de tipo de baja de activos
    * @param accion - 1.-Registrar, 2.-Editar
    * @param elemento - Elemento a editar 
    */
    abrirDialogo(accion: any, elemento: any) {

        let titulo = 'Registrar Parametro';
        if (accion == 2) {
            titulo = 'Editar Parametro';
        }

        const dialogRef = this.dialog.open(ModalParametrosComponent, {

        data: {
            accion: accion,
            titulo: titulo,
            datos: elemento
        },
    });

        dialogRef.afterClosed().subscribe(result => {
            this.spsParametros();
        });
    }
    /**
     * Metodo para cambiar el estatus del parametros desde la tabla
     * accion 3 Alta, accion 4 Baja
     * @param estado - Estatus del parametros
     * @param baja - Infomacion del parametro a cambiar de estado
     */
    cambiaEstatus(estado: any, parametro: any): void {
        this.blockUI.start('Cargando datos...');
        let accion;
        if (estado) {
            accion = 3;
        } else {
            accion = 4;
        }
        let jsonData = { "datos": [parametro.parametros_id], "accion": accion };
        this.blockUI.stop();
        this.service.registrar(jsonData, 'crudParametros').subscribe(result => {

            if (result[0][0] === '0') {

                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
            }
            this.spsParametros();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        });

    }
    /**
         * Metodo que valida si va vacio.
         * @param value 
         * @returns 
         */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}