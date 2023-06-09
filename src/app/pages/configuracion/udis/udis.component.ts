import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionUdiComponent } from "./modal-udis/administracion-udis.component";


@Component({
    selector: 'udis',
    moduleId: module.id,
    templateUrl: 'udis.component.html'

})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 17/09/2021
 * @descripcion: Componente para la gestion de las udis
 */

export class UdisComponent implements OnInit {

    //Declaracion de variables y compoenentes
    listaUdis: any[];
    displayedColumns: string[] = ['valor', 'fecha', 'estatus', 'acciones'];
    dataSourceUdi: MatTableDataSource<any>;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de variables y componentes
     * @param servcice -Service para el acceso de datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {


    }

    ngOnInit() {
        this.spsUdis();
    }

    /**
     * Metodo para cargar en tabla de udis
     */
    spsUdis() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaUdis').subscribe(data => {
            this.blockUI.stop();
            this.listaUdis = data;
            this.dataSourceUdi = new MatTableDataSource(this.listaUdis);
            this.dataSourceUdi.paginator = this.paginator;
            this.dataSourceUdi.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
  * Metodo para filtrar la tabla
  * @param event - Dato a filtrar
  */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceUdi.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceUdi.paginator) {
            this.dataSourceUdi.paginator.firstPage();
        }
    }

    /**
* Metodo para abrir ventana modal
* @param data 
*/
    abrirDialogoUdi(data) {
        /** si la accion es igual*/

        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.titulo = 'Editar';
            this.accion = 2;
        }

         //se abre el modal
         const dialogRef = this.dialog.open(AdministracionUdiComponent, {

            data: {

                accion: this.accion,
                titulo: this.titulo,
                udi: data
            }
        }
        );

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsUdis();
        });


    }

    /**
 * Metodo para dar de baja
 * @param elemento --Lista con los datos de las Udis
 */
    bajaUdi(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "udiId": elemento.udiId,
            "valor": elemento.valor,
            "fecha": elemento.fecha,
            "estatus": false
        };

        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudUdis').subscribe(
            result => {

                elemento.estatus= false;

                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spsUdis();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );

    }

    /**
     * Metodo para reingresar un registro
     * @param elemento 
     */
    reingresoUdi(elemento: any) {
        this.blockUI.start('Procesando Reingreso...');
        const data = {
            "udiId": elemento.udiId,
            "valor": elemento.valor,
            "fecha": elemento.fecha,
            "estatus": true

        };


        this.service.registrarBYID(data, 4, 'crudUdis').subscribe(
            result => {

                elemento.estatus= true;
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {

                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
               

            }, errorReingreso => {
                this.spsUdis();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorReingreso.error + '<br>' + errorReingreso.trace)
            }
        );

    }

    /**
  * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
  */
    cambiaEstatus(element: any) {

        if (element.estatus) {
            this.bajaUdi(element);
        } else {
            this.reingresoUdi(element);
        }

    }




}