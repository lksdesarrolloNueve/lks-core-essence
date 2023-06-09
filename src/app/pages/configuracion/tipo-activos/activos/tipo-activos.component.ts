import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministrarTipoActivosComponent } from "./modal-activos/administracion-tipo-activos.component";

@Component({
    selector: 'tipo-activos',
    moduleId: module.id,
    templateUrl: 'tipo-activos.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 24/11/2022
 * @descripcion: Componente para la gestion de tipos de activos
 */
export class TipoActivosComponent {
    //Declaración de las variables globales 
    listaTipoAct: any = [];
    columnaTipoAct: string[] = ['nombre', 'porcentaje', 'mesesDepreciar', 'cuentaDebe', 'cuentaHaber', 'usuario', 'estatus', 'acciones'];
    dataSourceTipActi: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
 * Constructor de la clase TipoActivosComponent
 * @param service -Instancia de acceso a datos
 * @param dialog - Instancia de acceso a dialogos
 */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
        this.spsTipoActivos();
    }

    /**
   * Método que en lista todos los tipos de activos
   * accion 1 muestra todos los activos
   */
    spsTipoActivos() {
        this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoAct = JSON.parse(data);
            }
            this.dataSourceTipActi = new MatTableDataSource(this.listaTipoAct);
            this.dataSourceTipActi.paginator = this.paginator;
            this.dataSourceTipActi.sort = this.sort;
        }

        );

    }

    /**
     * Método que filtra la tabla PEP
     * @param event- dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceTipActi.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceTipActi.paginator) {
            this.dataSourceTipActi.paginator.firstPage();
        }
    }
    /**
   * Método que abre una ventana modal para la gestión de tipo de activos
   * @param accion - 1.-Registrar, 2.-Editar
   * @param elemento - Elemento a editar 
   */
    abrirDialogo(accion: any, elemento: any) {

        let titulo = 'Registrar  Activo';
        if (accion == 2) {
            titulo = 'Editar Activo';
        }

        const dialogRef = this.dialog.open(AdministrarTipoActivosComponent, {

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsTipoActivos();
        });
    }
    /**
     * Metodo para cambiar el estatus de l activo desde la tabla
     * accion 3 Alta, accion 4 Baja
     * @param estado - Estatus del activo
     * @param activo - Infomacion del activo a cambiar de estado
     */
    cambiaEstatus(estado: any, activo: any): void {
        this.blockUI.start('Cargando datos...');
        let accion;
        if (estado) {
            accion = 3;
        } else {
            accion = 4;
        }
        let jsonData = { "datos": [activo.tipo_activo_id], "accion": accion };
        this.blockUI.stop();
        this.service.registrar(jsonData,'crudTipoActivos').subscribe(result => {
           if (result[0][0] === '0') {
               
               this.service.showNotification('top', 'right', 2, result[0][1]);
               this.blockUI.stop();
           } else {
               this.service.showNotification('top', 'right', 3, result[0][1]);
               this.blockUI.stop();
           }
           this.spsTipoActivos();
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