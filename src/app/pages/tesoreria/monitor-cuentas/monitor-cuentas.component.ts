import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";

@Component({
    selector: 'monitor-cuentas',
    moduleId: module.id,
    templateUrl: 'monitor-cuentas.component.html'
})


/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 23/12/2021 
 * @descripcion: Componente para el monitoreo de cuentas bancarias 
 */
export class MonitorCuentasComponent implements OnInit {

    displayedColumns: string[] = ['cveCuenta', 'nombreCuenta', 'sucursal','tipoCuenta','saldo','porcentaje', 'estatus']
    listaCuentas = []
    listaSucursales = []
    listaTipoCuentas = []
    cveCuentaActual = 0
    sucursal = 0
    tipoCuenta = ''


    dataSourceCuentas: MatTableDataSource<any>;
    dataSourceSucursales: MatTableDataSource<any>;
    dataSourceTipoCuentas: MatTableDataSource<any>;
     @ViewChild(MatPaginator) paginator: MatPaginator;
     @ViewChild(MatSort) sort: MatSort;
     @BlockUI() blockUI: NgBlockUI;

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        
    }

    ngOnInit() {
        this.spsCuentas();
        this.spsSucursales();
        this.spsTipoCuentas();
    }

    /**
     * 
     * @param id Método que realiza la llamada a la API correspondiente para obtener las cuentas bancarias
     * @param metodo 
     */
    getCuentas(id:any,metodo:string) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(id, metodo).subscribe(data => {
            this.blockUI.stop();
            this.listaCuentas = data;

            this.dataSourceCuentas = new MatTableDataSource(this.listaCuentas);
            this.dataSourceCuentas.paginator = this.paginator;
            this.dataSourceCuentas.sort = this.sort;

            // Agrega el saldo actual de cada cuenta
            this.addSaldo();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método para listar las cuentas bancarias sin filtro
     */
    spsCuentas() {
        this.blockUI.start('Cargando...');
        this.getCuentas(1,'listaCuentaBancaria');
        this.blockUI.stop();
    }

    /**
     * Método para filtrar las cuentas segun la sucursal y el tipo de cuenta seleccionados
     * @param sucursal 
     * @param tipoCuenta 
     */
    spsCuentasFiltradas(sucursal:number, tipoCuenta:string) {
        let path = '?sucursalId=' + sucursal + '&' + 'tipoCuenta=' + tipoCuenta;
        this.getCuentas(path,'listaCuentaBancariaSuc');
    }

    /**
     * Método para listar las sucursales
     */
    spsSucursales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listaSucursales = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método para listar los tipos de cuenta
     */
     spsTipoCuentas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('07CB', 'listaGeneralCategoria').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoCuentas = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Agrega el saldo actual a cada cuenta bancaria
     */
    addSaldo() {
        for(let i=0; i<this.listaCuentas.length; i++){
            this.cveCuentaActual = this.listaCuentas[i].claveCuenta;
            
            this.blockUI.start('Cargando datos...');
            this.service.getListByID(1+'/'+this.cveCuentaActual, 'spsSaldoCuentaTsr').subscribe(data => {
                this.blockUI.stop();
                this.listaCuentas[i].saldo = data[0].saldo;

                // Agrega el porcentaje de la cuenta en base al saldo actual
                this.calcularPorcentaje(i);

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });
        }
    }


    /**
     * Calcula y agrega un porcentaje a la cuenta en base a su saldo actual, el monto maximo y monto minimo.
     * @param i Indice de la cuenta a la que se le asignara el porcentaje.
     */
    calcularPorcentaje(i: number){
        let porcentaje = (this.listaCuentas[i].saldo * 100) / (this.listaCuentas[i].montoMaximo - this.listaCuentas[i].montoMinimo);
        porcentaje = Math.round((porcentaje + Number.EPSILON) * 10) / 10;
        this.listaCuentas[i].porcentaje = porcentaje;
    }

    /**
     * Método que actualiza la tabla al seleccionar una sucursal
     * @param sucursal 
     */
    seleccionarSucursal(sucursal){
        this.sucursal = sucursal.sucursalid;
        this.spsCuentasFiltradas(this.sucursal,this.tipoCuenta);
    }

    /**
     * Método que actualiza la tabla al seleccionar un tipo de cuenta
     * @param tipoCuenta 
     */
    seleccionarTipoCuenta(tipoCuenta){
        this.tipoCuenta = tipoCuenta.cveGeneral;
        this.spsCuentasFiltradas(this.sucursal,this.tipoCuenta);
    }
}
