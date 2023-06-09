import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdminSMSComponent } from "./modal-sms/admin-sms.component";

/**
 * @autor: María Guadalupe Santana Olalde
 * @version: 1.0.0
 * @fecha: 27/01/2022
 * @descripción: Componente para la gestión de medios
 * de notificación SMS
 */
@Component({
    selector: 'sms',
    moduleId: module.id,
    templateUrl: 'sms.component.html'
})

export class SMSComponent implements OnInit {

    //Declaración de variables globales y componentes
    listaSMS = [];
    columnsSMS: string[] = ['cveSMS', 'numero', 'servidor', 'puerto', 'estatus', 'acciones'];
    dataSourceSMS: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase SMSComponent
     * @param service -Instancia de acceso a datos
     * @param dialog - Instancia de acceso a dialogos
     */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
    }

    /**
     * Método OnInit de la class SMSComponent
     */
    ngOnInit() {
        this.spsSMS();
    }

    /**
     * Método que enlista todos los medios de notificación SMS
     */
    spsSMS() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsSMS').subscribe(
            data => {
                this.blockUI.stop();
                this.listaSMS = data;
                this.dataSourceSMS = new MatTableDataSource(this.listaSMS);
                this.dataSourceSMS.paginator = this.paginator;
                this.dataSourceSMS.sort = this.sort;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
    }

    /**
     * Método que filtra la tabla SMS
     * @param event- dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSMS.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceSMS.paginator) {
            this.dataSourceSMS.paginator.firstPage();
        }
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
            encabezado = "Activar Medio de Notificación " + element.numero;
            body = 'Al realizar esta acción las sucursales emitiran notifiaciones. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar Medio de Notificación " + element.numero;
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
                        element.smsID,
                        estatus
                    ],
                    "sucursales": [],
                    "accion": accion
                };

                this.service.registrar(json, 'crudSMS').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.estatus = estatus;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.spsSMS();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsSMS();
            }

        });

    }
    /**
     * Método que abre una ventana modal para la gestión de Medios de
     * de notificación SMS
     * @param accion - 1.-Registrar, 2.-Editar
     * @param elemento - Elemento a editar 
     */
    abrirDialogoSMS(accion: any, elemento: any) {

        let titulo = 'Registrar';
        if (accion == 2) {
            titulo = 'Editar';
        }

        const dialogRef = this.dialog.open(AdminSMSComponent, {
            width: '50%',
            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsSMS();
        });
    }
}
