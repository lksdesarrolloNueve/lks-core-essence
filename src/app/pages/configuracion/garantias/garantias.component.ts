import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionGarantiasComponent } from "./modal-garantias/administracion-garantias.component";

@Component({
    selector: 'garantias',
    moduleId: module.id,
    templateUrl: 'garantias.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 14/09/2021
 * @descripcion: Componente para la gestion de garantias
 */
export class GarantiasComponent implements OnInit {
    //Declaracion de variable y componentes

    displayedColumns: string[] = ['consecutivo','cveGarantia', 'descripcion', 'estatus', 'acciones'];
    dataSourceGarantias: MatTableDataSource<any>;
    listaGarantias: any;
    accion: number;
    titulo: string;
    

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente garantias
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    * @param service -- Instancia de acceso a datos
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsGarantias();
    }

    /**
     * Metodo para obtener la lista de garantias
     */
    spsGarantias() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaGarantia').subscribe(data => {
            this.blockUI.stop();
            this.listaGarantias = data;
            this.dataSourceGarantias = new MatTableDataSource(this.listaGarantias);
            this.dataSourceGarantias.paginator = this.paginator;
            this.dataSourceGarantias.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para filtrar garantias
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceGarantias.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceGarantias.paginator) {
            this.dataSourceGarantias.paginator.firstPage();
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
        const dialogRef = this.dialog.open(AdministracionGarantiasComponent, {

            data: {
                titulo: this.titulo,
                accion: this.accion,
                garantia: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsGarantias();//se refresque la tabla y se vea la nueva garantia
        });
    }

    /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos de Garantia
     */
    bajaGarantia(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "garantiaId": elemento.garantiaId,
            "cveGarantia": elemento.cveGarantia,
            "descripcion": elemento.descripcion,
            "estatus": false
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudGarantia').subscribe(resultado => {
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
    * Metodo para dar de alta Garantia
    * @param element --Lista con los datos de Garantia
    */
    reingresoGarantia(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "garantiaId": elemento.garantiaId,
            "cveGarantia": elemento.cveGarantia,
            "descripcion": elemento.descripcion,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudGarantia').subscribe(
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

    /**
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         * @param element --Lista con los datos de garantia
         */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaGarantia(element);
        } else {
            this.reingresoGarantia(element);
        }
    }

    /**
* Metodo para dar de baja un INPC
*/
bajaStatus(elemento: any, datos: any) {

    let tipoAccion = 0;

    if (elemento === false) {
        tipoAccion = 3;//Baja
        this.blockUI.start('Procesando Baja...');
    } else {
        tipoAccion = 4;//Alta
        this.blockUI.start('Procesando Alta...');
    }
    let path : any;
    let arr: string;

    arr= '0/0/';

    path =  arr + tipoAccion;
    this.service.registrarBYID(datos, path, 'crudGarantia').subscribe(
        result => {
            this.blockUI.stop();
            if (result[0][0] === '0') {

                datos.estatus = elemento;
                this.service.showNotification('top', 'right', 2, result[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1])
            }

        }, error => {
           
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message)


        }
    );

}

    
}