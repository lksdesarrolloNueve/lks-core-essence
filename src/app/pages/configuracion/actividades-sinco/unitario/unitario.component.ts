import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionUnitarioComponent } from "./modal-unitario/administracion-unitario.component";

@Component({
    selector: 'unitario',
    moduleId: module.id,
    templateUrl: 'unitario.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de Grupo Unitario Sinco
 */
export class UnitarioComponent  {

    displayedColumns: string[] = ['cveUni', 'descripcion', 'subgrupo', 'estatus', 'acciones'];
    dataSourceUnitario: MatTableDataSource<any>;
    listaUnitario: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente 
    * @param service -- Instancia de acceso a datos
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsUnitario();
    }

    /**
    * Metodo para filtrar Grupo Unitario
    * @param event --evento a filtrar
    */
     buscarUnitario(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceUnitario.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceUnitario.paginator) {
            this.dataSourceUnitario.paginator.firstPage();
        }
    }

    /**
    * Metodo para obtener la lista de grupo unitario
    * por subgrupo
    */
    spsUnitario() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaUnitario').subscribe(data => {
            this.blockUI.stop();
            this.listaUnitario = data;
            this.dataSourceUnitario= new MatTableDataSource(this.listaUnitario);
            this.dataSourceUnitario.paginator = this.paginator;
            this.dataSourceUnitario.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
       const dialogRef = this.dialog.open(AdministracionUnitarioComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                unitario: data
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsUnitario();//se refresque la tabla 
        });
    }
    /**
       * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
       * @param element --Lista con los datos de Grupo Unitario
       */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaUnitario(element);
        } else {
            this.reingresoUnitario(element);
        }
    }

    /**
    * Metodo para dar de baja
    * @param elemento --Lista con los datos de Grupo Unitario
    */
    bajaUnitario(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "unitarioId": elemento.unitarioId,
            "cveUnitario": elemento.cveUnitario,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "subgrupo": elemento.subgrupo
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudUnitario').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();//se cierra el loader
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error             
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Metodo para dar de alta Grupo Unitario 
    * @param element --Lista con los datos de Grupo Unitario
    */
    reingresoUnitario(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "unitarioId": elemento.unitarioId,
            "cveUnitario": elemento.cveUnitario,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "subgrupo": elemento.subgrupo
        };

        this.service.registrarBYID(data, 4, 'crudUnitario').subscribe(
            result => {

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            }
        );

    }
}