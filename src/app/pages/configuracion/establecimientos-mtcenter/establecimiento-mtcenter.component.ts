import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { ModalEstablecimientoComponent } from "./modal-establecimiento/modal-establecimiento.component";

@Component({
    selector: 'establecimiento-mtcenter',
    moduleId: module.id,
    templateUrl: 'establecimiento-mtcenter.component.html',

})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 12/05/2022
 * @descripcion: Componente para la gestión de MTCenter
 */
export class EstablecimientoMTCenterComponent {
    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['establecimiento', 'cadena', 'terminal', 'sucursal', 'estatus', 'acciones'];
    dataSourceMTCenter: MatTableDataSource<any>;
    listaEstablecimientos: any;

    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente EstablecimientoMTCenterComponent
    * @param service - Service para el acceso a datos
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsEstablecimientosMtcenter();
    }
    /**
        * Metodo para cargar en tabla Estado de Créditos.
        */
    spsEstablecimientosMtcenter() {
        this.blockUI.start('Cargando datos...');
        let json ={
            "data":{"cveSucursal":""},
            "accion":1
        };
        this.service.getListByObjet(json, 'listaEstablecimientosMTCenter').subscribe(spsMtcenter => {
            this.blockUI.stop();
            //this.service.showNotification('top', 'right', 2, spsMtcenter.mensaje);
            if (spsMtcenter.codigo == "0") {
                this.listaEstablecimientos = spsMtcenter.info;
                this.dataSourceMTCenter = new MatTableDataSource(this.listaEstablecimientos);
                this.dataSourceMTCenter.paginator = this.paginator;
                this.dataSourceMTCenter.sort = this.sort;
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
        * Metodo para filtrar  Establecimientos MTCenter
        * @param event - evento a filtrar
        */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMTCenter.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceMTCenter.paginator) {
            this.dataSourceMTCenter.paginator.firstPage();
        }
    }

    /**
       * Método para cambiar estatus si es activo-desactivo y 
       * si esta desactivado-activa.
       * @param estatus - Valor del toggle
       * @param element - Elemento a cambiar de estatus
       */
    cambiaEstatus(element: any) {
        var encabezado = "";
        var body = "";
        if (element.estatus) { //esta true se da de baja
            encabezado = "Desactivar Estatus de Establecimiento";
            body = 'Al realizar esta acción se da de baja el registro. ¿Desea continuar?'
        } else {//alta
            encabezado = "Activar Estatus de Establecimiento ";
            body = 'Al realizar esta acción se da de alta el registro. ¿Desea continuar?';

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
                let accion = 3; //Por inicio sera alta
                if (element.estatus === false) {
                    this.blockUI.start('Procesando baja...');
                } else {
                    accion = 4; //Para procesar la baja
                    this.blockUI.start('Procesando alta...');
                }
                let json = {
                    "data": {
                        "establecimientoId": element.establecimiento_id,
                    },
                    "accion": accion
                }
           
                this.service.registrar(json, 'crduEstablecimientosMTCenter').subscribe(
                    crudMtcenter => {
                        this.blockUI.stop();
                        if (crudMtcenter.codigo == "0") {
                            let info=crudMtcenter.info;
                            element.estatus = info.estatus;
                            this.service.showNotification('top', 'right', 2, crudMtcenter.mensaje);
                        } else {
                            this.service.showNotification('top', 'right', 2, crudMtcenter.mensaje);
                        }
                    }, error => {
                        this.spsEstablecimientosMtcenter();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsEstablecimientosMtcenter();
            }

        });

    }



    /**
     * Metodo que me abre un modal para la gestion clasificación de créditos. (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirModal(data) {
        let accion:number;
        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "Registrar Establecimiento";
            accion= 1;
        } else {
             accion = 2;
            this.titulo = "Editar Establecimiento";
        }
        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(ModalEstablecimientoComponent, {
            data: {
                accion: accion,
                titulo: this.titulo,
                establecimiento: data
            }
        });
        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if(result=="0"){
                    this.spsEstablecimientosMtcenter();
            }
        });
    }

}