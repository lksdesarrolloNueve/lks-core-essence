import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionEstadosComponent } from "./modal-estados/administracion-estados.component";



@Component({
    selector:'estados',
    moduleId: module.id,
    templateUrl:'estados.component.html'
})
/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 22/09/2021
 * @descripcion: Componente para la gestion de estados
 */
export class EstadosComponent {
    //Declaracion de Variables y Componentes
    displayedColumns: string[] = ['nombreEstado','nivelRiesgo','cveEstado','cveInegi','nacionalidadid','cveEstadoBuro','estatus','acciones'];
    dataSourceEstados: MatTableDataSource<any>;
    listaEstados: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente estados
    * @param service -- Instancia de acceso a datos
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsEstados();
    }

    /**
     * Metodo para listar estados 
     * Se lista 1.- muestra todos, 2.- muestra activos , 3.- muestra inactivos
     */
    spsEstados() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaEstados').subscribe(data => {
            this.blockUI.stop();
            this.listaEstados = data;
            this.dataSourceEstados = new MatTableDataSource(this.listaEstados);
            this.dataSourceEstados.paginator = this.paginator;
            this.dataSourceEstados.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para filtrar estados
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceEstados.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceEstados.paginator) {
            this.dataSourceEstados.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    openDialog(data) {
         //Si es 0 es Registrar si es diferente es actualizar
         if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }

        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionEstadosComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                estado: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsEstados();//se refresque la tabla y se vea el nuevo estado
        });


    }

    /**
    * Metodo para dar de baja
    * @param elemento --Lista con los datos de Nacionalidad
    */
    bajaEstado(elemento: any) {
        //areglo que contiene los datos para baja
        const data = {
            "estadoid": elemento.estadoid,
            "nombreEstado": elemento.nombreEstado,
            "nivelRiesgo": elemento.nivelRiesgo,
            "cveEstado": elemento.cveEstado,
            "cveInegi": elemento.cveInegi,
            "nacionalidadid": elemento.nacionalidadid,
            "cveEstadoBuro": elemento.cveEstadoBuro,
            "estatus": false,
            "nacionalidad": elemento.nacionalidad
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudEstados').subscribe(resultado => {
            this.blockUI.start('Procesando baja ...');
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error 
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo para dar de alta un Estado
    * @param element --Lista con los datos de Estado
    */
    reingresoEstado(elemento: any) {

        const data = {
            "estadoid": elemento.estadoid,
            "nombreEstado": elemento.nombreEstado,
            "nivelRiesgo": elemento.nivelRiesgo,
            "cveEstado": elemento.cveEstado,
            "cveInegi": elemento.cveInegi,
            "nacionalidadid": elemento.nacionalidadid,
            "cveEstadoBuro": elemento.cveEstadoBuro,
            "estatus": true,
            "nacionalidad": elemento.nacionalidad
        };

        this.service.registrarBYID(data, 4, 'crudEstados').subscribe(
            result => {
                this.blockUI.start('Procesando reingreso ...');
                //Se condiciona resultado
                if (result[0][0] === '0') {
                    //se cierrra el loader
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }

     /**
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         * @param element --Lista con los datos de Estado
         */
      cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaEstado(element);
        } else {
            this.reingresoEstado(element);
        }
    }


}