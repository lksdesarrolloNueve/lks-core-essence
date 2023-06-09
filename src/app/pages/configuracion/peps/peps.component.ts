import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdminPepsComponent } from "./modal-peps/admin-peps.component";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";

@Component({
    selector: 'peps',
    moduleId: module.id,
    templateUrl: 'peps.component.html'
})

export class PepComponent implements OnInit {

    //Declaración de las variables globales 
    listaPeps: any = [];
    columnaPEP: string[] = ['folio', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'descripcion', 'observaciones', 'estatus', 'acciones'];
    dataSourcePEP: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase PEPComponent
     * @param service -Instancia de acceso a datos
     * @param dialog - Instancia de acceso a dialogos
     */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.spsPeps();
    }

    /**
     * Método que enlista todas las personas PEP
     */
    spsPeps() {
        this.service.getListByID(1, 'listaPeps').subscribe(data => {
            this.listaPeps = data;
            this.dataSourcePEP = new MatTableDataSource(this.listaPeps);
            this.dataSourcePEP.paginator = this.paginator;
            this.dataSourcePEP.sort = this.sort;
        }

        );

    }

/**
 * Método que filtra la tabla PEP
 * @param event- dato a filtrar
 */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourcePEP.filter = filterValue.trim().toLowerCase();

        if (this.dataSourcePEP.paginator) {
            this.dataSourcePEP.paginator.firstPage();
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
            encabezado = "Activar Estatus de PEP'S ";
            body = 'Al realizar esta acción se da de alta el registro. ¿Desea continuar?';
        } else {
            encabezado = "Desactivar Estatus de PEP'S ";
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
                        element.pepsID,
                        estatus
                    ],
                    "sujeto": [],
                    "accion": accion
                };

                this.service.registrar(json, 'crudPeps').subscribe(
                    result => {
                        this.blockUI.stop();
                        if (result[0][0] === '0') {
                            element.estatus = estatus;
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1])
                        }
                    }, error => {
                        this.spsPeps();
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
            } else {
                this.spsPeps();
            }

        });

    }


    /**
 * Método que abre una ventana modal para la gestión de PEP
 * @param accion - 1.-Registrar, 2.-Editar
 * @param elemento - Elemento a editar 
 */
    abrirDialogoPEP(accion: any, elemento: any) {

        let titulo = 'Registrar';
        if (accion == 2) {
            titulo = 'Editar';
        }

        const dialogRef = this.dialog.open(AdminPepsComponent, {
            width: '50%',
            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            this.spsPeps();
        });
    }
}
