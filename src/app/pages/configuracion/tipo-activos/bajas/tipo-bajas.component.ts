import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ModalTipoBajasComponent } from "./modal-bajas/modal-tipo-bajas.component";

@Component({
    selector: 'tipo-bajas',
    moduleId: module.id,
    templateUrl: 'tipo-bajas.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 28/11/2022
 * @descripcion: Componente para la gestion de tipos de bajas en activos
 */
export class TipoBajasComponent {

    //Declaración de las variables globales 
    listaTipoBaja: any = [];
    displayedColumnaBaja: string[] = ['nombre', 'registraVenta', 'cuentaDebe', 'cuentaHaber', 'cuentaIva', 'estatus', 'acciones'];
    dataSourceTipoBaja: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
 * Constructor de la clase TipoBajasComponent
 * @param service -Instancia de acceso a datos
 * @param dialog - Instancia de acceso a dialogos
 */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
this.spsTipoBajaActivos();
    }


    /**
   * Método que en lista todos los tipos de bajas para activos
   * accion 1 muestra todos las bajas
   */
     spsTipoBajaActivos() {
        this.service.getListByID(1, 'spsTipoBajaActivo').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoBaja = JSON.parse(data);
            }
            this.dataSourceTipoBaja = new MatTableDataSource(this.listaTipoBaja);
            this.dataSourceTipoBaja.paginator = this.paginator;
            this.dataSourceTipoBaja.sort = this.sort;
        }

        );

    }

    /**
     * Método que filtra la tabla 
     * @param event- dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceTipoBaja.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceTipoBaja.paginator) {
            this.dataSourceTipoBaja.paginator.firstPage();
        }
    }
    /**
   * Método que abre una ventana modal para la gestión de tipo de baja de activos
   * @param accion - 1.-Registrar, 2.-Editar
   * @param elemento - Elemento a editar 
   */
    abrirDialogo(accion: any, elemento: any) {

        let titulo = 'Registrar  Baja Activo';
        if (accion == 2) {
            titulo = 'Editar Baja Activo';
        }

        const dialogRef = this.dialog.open(ModalTipoBajasComponent, {

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsTipoBajaActivos();
        });
    }
    /**
     * Metodo para cambiar el estatus de tipo bajas desde la tabla
     * accion 3 Alta, accion 4 Baja
     * @param estado - Estatus del tipo de baja
     * @param baja - Infomacion del tipo de baja  a cambiar de estado
     */
    cambiaEstatus(estado: any, baja: any): void {
        this.blockUI.start('Cargando datos...');
        let accion;
        if (estado) {
            accion = 3;
        } else {
            accion = 4;
        }
        let jsonData = { "datos": [baja.tipo_baja_id], "accion": accion };
        this.service.registrar(jsonData,'crudTipoBajaActivo').subscribe(result => {

           if (result[0][0] === '0') {
               
               this.service.showNotification('top', 'right', 2, result[0][1]);
               this.blockUI.stop();
           } else {
               this.service.showNotification('top', 'right', 3, result[0][1]);
               this.blockUI.stop();
           }
           this.spsTipoBajaActivos();
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