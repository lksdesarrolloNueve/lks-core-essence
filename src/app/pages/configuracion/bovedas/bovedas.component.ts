import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { FormControl } from "@angular/forms";
import { AdminBovedaComponent } from "./modal-bovedas/admin-bovedas.component";

@Component({
    selector: 'bovedas',
    moduleId: module.id,
    templateUrl: 'bovedas.component.html'
})


/**
 * @autor: Victor Daniel Loza Cruz
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la gestion de bovedas
 */
export class BovedaComponent implements OnInit {

    /**
     * Declaracion de variables y controles
     */
    displayedColumns: string[] = ['clave', 'descripcion', 'claveCuenta', 'descripcionCuenta', 'cveSucursal', 'nombreSucursal', 'estatusCB', 'estatus', 'acciones']
    listaBovedas = [];
    listaMostrar = [];
    disabled = true;


    dataSourceBovedas: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase BovedasComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * metodo OnInit de la clase Bovedas
     */
    ngOnInit() {
        this.spsBovedas();
    }

    /**
     * Metodo que lista bovedas
     */
    spsBovedas() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1, 'listaBoveda').subscribe(dataBoveda => {
            this.blockUI.stop();

            // se declara la lista para mostrar la información en vacia
            this.listaMostrar = []

            //Se crea forEach para agregar la información del JSON de forma lineal
            dataBoveda.forEach((result: any) => {
                let jsonLineal = {
                    "clave": result.clave,
                    "descripcion": result.descripcion,
                    "claveCuenta": result.catCuentaBancaria.claveCuenta,
                    "descripcionCuenta": result.catCuentaBancaria.descripcionCuenta,
                    "cveSucursal": result.catSucursal.cveSucursal,
                    "nombreSucursal": result.catSucursal.nombreSucursal,
                    "estatus": result.estatus,
                    "estatusCuenta": result.catCuentaBancaria.estatus
                }
                this.listaMostrar.push(jsonLineal)
            });


            this.listaBovedas = dataBoveda;
            this.dataSourceBovedas = new MatTableDataSource(this.listaMostrar);
            this.dataSourceBovedas.paginator = this.paginator;
            this.dataSourceBovedas.sort = this.sort;


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }

    /** 
    *  Metodo para filtrar la tabla
    *  @param event - evento para filtrar
    */
    applyFilterBoveda(event: Event) {
        const filterValueBoveda = (event.target as HTMLInputElement).value;
        this.dataSourceBovedas.filter = filterValueBoveda.trim().toLowerCase();
        if (this.dataSourceBovedas.paginator) {
            this.dataSourceBovedas.paginator.firstPage();
        }
    }

    /**
     * Metodo para realizar el crud de Bovedas
     * Metodo que conforma el JSON
     * @param elemento - parametro de entrada elemento 
     */
    crudBoveda(elemento: any, estatus) {

        // se declara variable local
        let datos: any

        //Busca el la información por la clave
        datos = this.listaBovedas.find((listaBoveda: any) => {
            return listaBoveda.clave === elemento.clave;
        })

        let tipoAccion = 0;

        if (estatus === false) {
            tipoAccion = 3;
            this.blockUI.start('Procesando Baja...');//Se inicia el loader
        } else {
            this.blockUI.start('Procesando Alta...');//Se inicia el loader
            tipoAccion = 4;

        }

        //Conformando el JSON
        const data = {
            boveda:  datos,
            cajas: [],
            accion: tipoAccion

        };

        this.service.registrar(data, 'crudBoveda').subscribe(
            result => {
                this.blockUI.stop();//se cierra el loader
                if (result[0][0] === '0') {
                    elemento.estatus = estatus;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => {
                this.spsBovedas();
                this.blockUI.stop();//se cierra el loader
                this.service.showNotification('top', 'right', 4, error.Message);
            }

        );
    }

    /** 
     * Metodo que abre un modal para la gestion de bovedas
    */
    abrirAdminBoveda(elemento, accion) {

        // se declara variable local
        let datos: any

        //Busca el la información por la clave
        datos = this.listaBovedas.find((listaBoveda: any) => {
            return listaBoveda.clave === elemento;
        })

        let titulo = 'REGISTRAR';

        if (accion !== 1) {
            titulo = 'EDITAR';
        }

        const dialogRef =
            this.dialog.open(AdminBovedaComponent, {
                data: {
                    accion: accion,
                    titulo: titulo,
                    bovedas: datos  //trae la información de la boveda
                }

            });

        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsBovedas();
        });

    }


}