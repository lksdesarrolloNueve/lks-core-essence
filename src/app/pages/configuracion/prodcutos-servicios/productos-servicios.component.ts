import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { AdminProductoServicioComponent } from "./admin-producto-servicio/admin-producto-servicio.component";

/**
 * @autor: María Guadalupe Santana Olalde
 * @descripcion: Component para la gestión de prodcutos y servicios 
 * @fecha: 09/09/2022
 * @version: 1.0.0
 */
@Component({
    selector: 'servicios', 
    moduleId: module.id,
    templateUrl: 'productos-servicios.component.html'
})

export class ProdcutosServiciosComponent implements OnInit {

    //Declaración de variables globales y componentes
    listaProductos = [];
    columnsProduct: string[] = ['producto', 'codigo', 'dv', 'comision', 'bonificacion', 'estatus','acciones'];
    dataSourceProducto: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    
    /**
     * Constructor de la clase ProdcutosServiciosComponent
     * @param service - Instancia de acceso a datos
     * @param dialog - Instancia de acceso a dialogos
     */
     constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
    }

    /**
     * Método OnInit de la clase ProdcutosServiciosComponent
     */
    ngOnInit(): void {
        this.spsProductosServicios();
    }

    /**
 * Método que filtra la tabla Servicios
 * @param event- dato a filtrar
 */
     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceProducto.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceProducto.paginator) {
            this.dataSourceProducto.paginator.firstPage();
        }
    }

    /**
     * Método que lista los servicios 
     */
    spsProductosServicios(){
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsProductosServicios').subscribe(
            data => {

                this.blockUI.stop();
                this.listaProductos = data;
                this.dataSourceProducto = new MatTableDataSource(this.listaProductos);
                this.dataSourceProducto.paginator = this.paginator;
                this.dataSourceProducto.sort = this.sort;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
        
    }

      /**
   * Método para cambiar estatus del DV si es activo-desactivo y 
   * si esta desactivado-activa.
   * @param estatus - Valor del toggle
   * @param element - Elemento a cambiar de estatus
   */
       cambiaDV(dv: any, element: any) {

        var encabezado = "";
        var body = "";
        if (dv === true) {
            encabezado = "Activar DV";
            body = 'Al realizar esta acción se da de alta el registro. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar DV";
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
                let accion = 3; //Por inicio sera baja
                if (dv === false) {
                    this.blockUI.start('Procesando baja...');
                } else {
                    accion = 4; //Para procesar la alta
                    this.blockUI.start('Procesando alta...');
                }

                let json = {
                    "datos": [
                        element.idProducto,
                        dv],
                    "accion": accion
                };

                this.service.registrar(json, 'crudProductoServicios').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.dv = dv;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.spsProductosServicios();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsProductosServicios();
            }

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
            encabezado = "Activar Estatus";
            body = 'Al realizar esta acción se da de alta el registro. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar Estatus";
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
                let accion = 3; //Por inicio sera baja
                if (estatus === false) {
                    this.blockUI.start('Procesando baja...');
                } else {
                    accion = 4; //Para procesar la alta
                    this.blockUI.start('Procesando alta...');
                }

                let json = {
                    "datos": [
                        element.idProducto,
                        estatus],
                    "accion": accion
                };

                this.service.registrar(json, 'crudProductoServicios').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.estatus = estatus;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.spsProductosServicios();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsProductosServicios();
            }

        });

    }


/**
 * Método que abre una ventana modal para la gestión de Servicios
 * @param accion - 1.-Registrar, 2.-Editar
 * @param elemento - Elemento a editar 
 */
    abrirDialogoServicios(accion: any, elemento: any) {

        let titulo = 'Registrar';
        if (accion == 2) {
            titulo = 'Editar';
        }

        const dialogRef = this.dialog.open(AdminProductoServicioComponent, {
            width: '50%',
            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsProductosServicios();
        });
    }

}