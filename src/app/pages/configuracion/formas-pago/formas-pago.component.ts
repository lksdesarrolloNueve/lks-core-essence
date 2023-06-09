import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdministracionFormasPago } from "./modal-formas-pago/administracion-formas-pago.component";



@Component({
    selector: 'formas-pago',
    moduleId: module.id,
    templateUrl: 'formas-pago.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 229/09/2021
 * @descripcion: Componente para la gestion de formas de pago
 */

export class FormasPagoComponent implements OnInit {
    //Declaracion de Variables y Componentes
    displayedColumns: string[] = ['cveFpago', 'nombreFpago', 'moneda', 'estatus', 'acciones'];
    dataSourceFormasPago: MatTableDataSource<any>;
    listaFormasPago: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente formas de pago
    * @param service -- Instancia de acceso a datos
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    }

    /**
     * Metodo ngOnInit de la clase
     */
    ngOnInit() {
        this.spsFormasPago();

    }

    /**
    * Metodo para listar formas de pago
    * Se lista 1.- muestra todos, 2.- muestra activos , 3.- muestra inactivos
    */
    spsFormasPago() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaFormasPago').subscribe(data => {
            this.blockUI.stop();
            this.listaFormasPago = data;
            this.dataSourceFormasPago = new MatTableDataSource(this.listaFormasPago);
            this.dataSourceFormasPago.paginator = this.paginator;
            this.dataSourceFormasPago.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo para filtrar formas de pago
    * @param event --evento a filtrar
    */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceFormasPago.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceFormasPago.paginator) {
            this.dataSourceFormasPago.paginator.firstPage();
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
        const dialogRef = this.dialog.open(AdministracionFormasPago ,{
            data: {
                titulo: this.titulo,
                accion: this.accion,
                formapago: data
            }
        });
             //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsFormasPago();//se refresque la tabla y se vea la nueva forma de pago
        });



    }



    /**
    * Metodo para dar de baja
    * @param elemento --Lista con los datos de MonedaSAT
    */
    bajaFormaPago(elemento: any) {
        this.blockUI.start('Procesando baja ...');
        //areglo que contiene los datos para baja
        const data = {
            "fpagoid": elemento.fpagoid,
            "cvefpago": elemento.cvefpago,
            "nombrefpago": elemento.nombrefpago,
            "monedaId": elemento.monedaId,
            "estatus": false,
            "monedasat": elemento.monedasat,
        };
        //se manda llamar el metodo para dar de baja
        //crudFormasPago
        this.service.registrarBYID(data, 3, 'crudFormasPago').subscribe(resultado => {
           
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
   * Metodo para dar de alta una forma de pago
   * @param element --Lista con los datos de las formas de pago
   */
    reingresoFormaPago(elemento: any) {
        this.blockUI.start('Procesando reingreso ...');
        //areglo que contiene los datos para dar reingreso
        const data = {
            "fpagoid": elemento.fpagoid,
            "cvefpago": elemento.cvefpago,
            "nombrefpago": elemento.nombrefpago,
            "monedaId": elemento.monedaId,
            "estatus": false,
            "monedasat": elemento.monedasat,
        };
        this.service.registrarBYID(data, 4, 'crudFormasPago').subscribe(
            result => {
                
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
        * @param element --Lista con los datos formas de pago
        */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaFormaPago(element);
        } else {
            this.reingresoFormaPago(element);
        }
    }



}