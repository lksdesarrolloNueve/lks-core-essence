import { Component,ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdministracionSucursalesComponent } from "./modal-sucursales/administracion-sucursales.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'sucursales',
    moduleId: module.id,
    templateUrl: 'sucursales.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/09/2021
 * @descripcion: Componente para la gestion de sucursales
 */
export class SucursalesComponent  {

    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['nombreSucursal', 'cveSucursal', 'fechaAlta','estatus' ,'acciones'];
    dataSourceSucursales: MatTableDataSource<any>;
    listSucursales: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor del componente SucursalesComponent
     * @param service - Service para el acceso a datos
     * @param dialog - Servicio para la gestion de Dialogos Tipo Modal
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsSucurales();
    }

    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1,'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listSucursales = data;
            this.dataSourceSucursales = new MatTableDataSource(this.listSucursales);
            this.dataSourceSucursales.paginator = this.paginator;
            this.dataSourceSucursales.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'rigth', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para filtrar sucursales
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSucursales.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceSucursales.paginator) {
            this.dataSourceSucursales.paginator.firstPage();
        }
    }


    /**
     * Metodo que me abre un modal para la gestion de sucursales (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirDialogoSucursales(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionSucursalesComponent, {
            
            data: {
                accion: this.accion,
                titulo: this.titulo,
                sucursal: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsSucurales();
        });
    }


    /**
     * Metodo para dar de baja una sucursal
     */
    bajaSucursal(elemento: any) {
        this.blockUI.start('Procesando baja...');

        const data = {
            "sucursalid": elemento.sucursalid,
            "nombreSucursal": elemento.nombreSucursal,
            "cveSucursal":   elemento.cveSucursal,
            "estatus": false,
            "ctaContableTraspaso":{"cuentaid": elemento.ctaContableTraspaso.cuentaid}
        };

        this.service.registrarBYID(data, 3, 'crudSucursales').subscribe(
            result => {
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    elemento.estatus = false;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => {
                this.spsSucurales();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    /**
     * Metodo para dar de baja una sucursal
     */
     reingresoSucursal(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "sucursalid": elemento.sucursalid,
            "nombreSucursal": elemento.nombreSucursal,
            "cveSucursal":   elemento.cveSucursal,
            "estatus": true,
            "ctaContableTraspaso":{"cuentaid": elemento.ctaContableTraspaso.cuentaid}
        };

        this.service.registrarBYID(data, 4, 'crudSucursales').subscribe(
            result => {
                this.blockUI.stop();
                //Se condiciona resultado
                if (result[0][0] === '0') {
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, errorReingreso => {
                this.spsSucurales();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );

    }


    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
     cambiaEstatus(element: any){
        if(element.estatus){
            this.bajaSucursal(element);
        }else{
            this.reingresoSucursal(element);
        }
    }


}