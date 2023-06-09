import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdministracionMonedasComponent } from "./modal-monedas-sat/administracion-monedas-sat.component";

@Component({
    selector: 'monedas-sat',
    moduleId: module.id,
    templateUrl: 'monedas-sat.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 10/09/2021
 * @descripcion: Componente para la gestion de monedas SAT
 */
export class MonedasSATComponent implements OnInit {
    //Declaracion de variable y componentes

    displayedColumns: string[] = ['consecutivo','cveMonedaSat', 'nombreMoneda', 'tipoCambio', 'fecha','estatus', 'acciones'];
    dataSourceMonedas: MatTableDataSource<any>;
    listaMonedas: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente monedas
     * @param dialog -- Componente para crear diálogos modales en Angular Material 
     * @param service -- Instancia de acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
      
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsMonedas();
    }

    /**
     * Metodo para obtener la lista de monedas
     */
    spsMonedas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaMonedas').subscribe(data => {
            this.blockUI.stop();
            this.listaMonedas = data;
            this.dataSourceMonedas = new MatTableDataSource(this.listaMonedas);
            this.dataSourceMonedas.paginator = this.paginator;
            this.dataSourceMonedas.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para filtrar monedas sat
     * @param event --dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMonedas.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceMonedas.paginator) {
            this.dataSourceMonedas.paginator.firstPage();
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
        const dialogRef = this.dialog.open(AdministracionMonedasComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                moneda: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsMonedas();//se refresque la tabla y se vea la nueva moneda
        });
    }

    /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos de Moneda
     */
    bajaMoneda(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "monedaId": elemento.monedaId,
            "cveMonedaSat": elemento.cveMonedaSat,
            "nombreMoneda": elemento.nombreMoneda,
            "tipoCambio": elemento.tipoCambio,
            "fecha": elemento.fecha,
            "estatus": false
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudMonedas').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();//se cierra el loader
                elemento.estatus=false;
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
     * Metodo para dar de alta Moneda
     * @param element --Lista con los datos de Moneda
     */
      reingresoMoneda(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "monedaId": elemento.monedaId,
            "cveMonedaSat": elemento.cveMonedaSat,
            "nombreMoneda": elemento.nombreMoneda,
            "tipoCambio": elemento.tipoCambio,
            "fecha": elemento.fecha,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudMonedas').subscribe(
            result => {

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    elemento.estatus=true;
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
         * @param element --Lista con los datos de moneda
         */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaMoneda(element);
        } else {
            this.reingresoMoneda(element);
        }
    }
}
