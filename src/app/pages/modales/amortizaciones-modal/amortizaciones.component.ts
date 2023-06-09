import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 17/02/2022
* @descripcion: Componente para mostrar la tabla de amortizaciones
*/
@Component({
    selector: 'amortizaciones',
    moduleId: module.id,
    templateUrl: 'amortizaciones.component.html'
})
export class AmortizacionesComponent {
    //Declaracion de varablies y Controles
    displayedColumns: string[] = ['numamortizacion', 'fechapago', 'interes', 'importe', 'interesnormal', 'iva', 'saldo', 'pagototal', 'monto']
    //Imports
    dataSourceAmortizacion: MatTableDataSource<any>;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    encabezado: string = "";
    parametros: any;
    amortizaciones:any = [];
    /**
        * Constructor del componente 
        * @data --Envio de datos al modal dialogo
        */
    constructor(private service: GestionGenericaService, 
        private dialog: MatDialogRef<AmortizacionesComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.encabezado = data.titulo;
        this.parametros = data.parametros;

        if (data.lista.length > 0) {
            this.amortizaciones=data.lista;
            this.dataSourceAmortizacion = new MatTableDataSource(this.amortizaciones);
            this.dataSourceAmortizacion.sort = this.sort;
        } else if (Object.keys(this.parametros).length > 0) {
            //se manda llamar la funcion spsAmortizaciones
            this.spsAmortizaciones();
        }
    }
    /**
* Metodo que lista la tabla de amortizacion
*/
    spsAmortizaciones() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(this.parametros, 'listaAmortizaciones').subscribe(amortizacion => {
            this.amortizaciones=amortizacion;
            this.dataSourceAmortizacion = new MatTableDataSource(amortizacion);
            this.dataSourceAmortizacion.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.service.showNotification('top', 'right', 4, error.message);
        });


    }
    /**Cierra el modal y manda la lista de las amortizaciones  */
    imprimir(){
        
        let contenido, emergente;
        contenido = document.getElementById('tblAmortizacion').innerHTML;
        emergente = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        emergente.document.open();
        emergente.document.write(`
          <html>
            <head>
              <title>Calendario de pagos</title>
              <style>
              //........Customized style.......
              </style>
            </head>
        <body onload="window.print();window.close()">${contenido}</body>
          </html>`
        );
        this.dialog.close(this.amortizaciones);
    }
}