import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";

@Component({
    selector: 'detalle-cierre',
    moduleId: module.id,
    templateUrl: 'detalle-cierre.component.html',
    styleUrls: ['./detalle-cierre.component.css']
})
export class DetalleCierreComponent implements OnInit {

    @BlockUI() blockUI: NgBlockUI;

    //Declaracion de variables
    usuario: string = '';
    saldoInicialSistemaPg: number = 0.00;
    saldoInicialCajeroPg: number = 0.00;
    saldoFinalCajaPg: number = 0.00;
    diferenciaPg: number = 0.00;
    saldoFinalSistemaPg: number = 0.00;
    sesionID: any;
    caja: string = '';

    //Tabla transacciones
    displayedColumnsHMov: string[] = ['fecha', 'cveMovimiento', 'movimiento', 'formaPago', 'operacion', 'monto', 'estatus'];
    dataSourceHMov: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild("sortMov") sortMov: MatSort;
    listaHMov = [];


    constructor(private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) private data: any) {

        this.saldoInicialSistemaPg = data.sesion.saldoInicialSistema;
        this.saldoInicialCajeroPg = data.sesion.saldoInicialCajero;
        this.saldoFinalCajaPg = data.sesion.saldoFinalCajero;
        this.saldoFinalSistemaPg = data.sesion.saldoFinalSistema;
        this.diferenciaPg = data.sesion.diferencia;
        this.usuario = data.sesion.usuario;
        this.sesionID = data.sesion.id;
        this.caja = data.sesion.extSesCaja.caja.descripcion;
    }


    ngOnInit() {
        this.listaDetallesMovSesion();
    }

    listaDetallesMovSesion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.sesionID, 'listaDetallesMovSesion').subscribe(data => {
            this.blockUI.stop();

            if(data) {
                this.listaHMov = data;
                this.dataSourceHMov = new MatTableDataSource(this.listaHMov);
                setTimeout(() => this.dataSourceHMov.paginator = this.paginator);
                this.dataSourceHMov.sort = this.sortMov;
            }


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

}