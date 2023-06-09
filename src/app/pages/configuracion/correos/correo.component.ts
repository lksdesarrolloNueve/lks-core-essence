import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdminCorreoComponent } from "./modal-correo/admin-correo.component";

/**
 * @autor: Fatima Bolaños Duran
 * version: 1.0.
 * @fecha: 28/01/2022
 * @description: componente para la gestion de medios de notificacion de correos
 * 
 */

@Component({

    selector: 'correo',
    moduleId: module.id,
    templateUrl: 'correo.component.html',
})

export class CorreoComponent implements OnInit {

    // Declaracion de variables glovales y componentes
    listaCorreo = [];
    ColumnsCorreo: string[] = ['cveCorreo', 'correo', 'servidor', 'puerto', 'estatus', 'acciones'];
    dataSourceCorreo: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;
    /**
     * Constructor del componente SucursalesComponent
     * @param service - Service para el acceso a datos
     * @param dialog - Servicio para la gestion de Dialogos Tipo Modal
     */

    constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
    }

    /**
     * Metodo onInit de la clase CorreosComponent
     * */
    ngOnInit() {
        this.spsCorreos();
    }

    /**
     * Metodo que lista todos los medios de notificación de correo
     */
    spsCorreos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsCorreos').subscribe(
            data => {
                this.blockUI.stop();
                this.listaCorreo = data;
                this.dataSourceCorreo = new MatTableDataSource(this.listaCorreo);
                this.dataSourceCorreo.paginator = this.paginator;
                this.dataSourceCorreo.sort = this.sort;
                
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
    }

    /**
     * Metodo que filtra la tabla correo
     * @param event -Dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCorreo.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCorreo.paginator) {
            this.dataSourceCorreo.paginator.firstPage();
        }
    }

    /**
       * Metodo para cambiar estatus si es activo desactivo y 
       * si esta desactivado activa.
       * @param estatus - Valor del toggle
       * @param element - Elemento a cambiar de estatus
       */
    cambiaEstatus(estatus: any, element: any) {
        var encabezado = "";
        var body = "";

        if (estatus === true) {
            encabezado = "Activar Medio de Notificación " + element.email;
            body = 'Al realizar esta acción las sucursales emitirán notifiaciones. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar Medio de Notificación " + element.email;
            body = 'Al realizar esta acción las sucursales dejaran de emitir las notifiaciones. ¿Desea continuar?'
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
                        element.correoID,
                        estatus
                    ],
                    "sucursales": [],
                    "accion": accion
                };

                this.service.registrar(json, 'crudCorreos').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.estatus = estatus;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.spsCorreos();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsCorreos();
            }

        });

    }

    /**
        * Metodo que abre una ventana modal
        * para la Administracion  de Medios de 
        * Notificaciones correo
        * @param accion --1 Registrar , 2 . Editar
        * @param elemento - elemento a editar
        */
    abrirDialogoCorreo(accion: any, elemento: any) {
        let titulo = 'Registrar';
        if (accion === 2) {
            titulo = 'Editar';
        }
        const dialogRef = this.dialog.open(AdminCorreoComponent, {
            width: '50%',

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento

            },
        });
        dialogRef.afterClosed().subscribe(result => {
            this.spsCorreos();
        });
    }
}
