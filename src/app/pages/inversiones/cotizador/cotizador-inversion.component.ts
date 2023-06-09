import { Component, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { CurrencyPipe } from "@angular/common";

@Component({
    moduleId: module.id,
    selector: 'cotizador-inversion',
    templateUrl: 'cotizador-inversion.component.html'
})

export class CotizadorInversionComponent {

    //Declaracion de variables
    displayedColumns: string[] = ['plazo', 'tasa', 'isr','monto', 'interes', 'total']
    listaInversiones = [];
    listaCotizaciones = [];

    monto = new UntypedFormControl('');
    cantidad: any;

    @BlockUI() blockUI: NgBlockUI;

    dataSourceInversiones: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private service: GestionGenericaService, private currencyPipe: CurrencyPipe) {
        this.spsInversiones();
    }

    /**
  * Metodo que enlista las inversiones
  */
    spsInversiones() {
        this.blockUI.start('Cargando la información...');
        this.service.getListByID(2, 'listaInversiones').subscribe(
            data => {
                this.listaInversiones = data;

                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
            });
    }

    /**
     * Metodo que procesara las cotizaciones de inversiones
     */
    cotizar() {

        this.listaCotizaciones = [];



        let monto = Number(this.monto.value);

        //this.monto.setValue(formatCurrency(monto, 'en-US', getCurrencySymbol('MXN', 'wide')))

        for (let plazo of this.listaInversiones) {
            //let interes = Number(((monto * (plazo.extensionInversion.tasa / 100)) / 360) * plazo.plazo);
            const interes = ((Math.floor(((Math.floor((monto * (plazo.extensionInversion.tasa / 100)) * 100)) / 360)) / 100) * plazo.plazo).toFixed(2);

            console.log(interes)
            this.listaCotizaciones.push({
                plazo: plazo.plazo,
                tasa: plazo.extensionInversion.tasa,
                monto: monto, interes: Number(interes),
                isr: plazo.extensionInversion.retieneIsr ? 'SI' : 'NO',
                total: (monto + Number(interes))
            });
        }

        this.dataSourceInversiones = new MatTableDataSource(this.listaCotizaciones);
        this.dataSourceInversiones.paginator = this.paginator;
        this.dataSourceInversiones.sort = this.sort;


    }


    /**
     * Metodo que dara formato de moneda
     * @param value - valor a formatear en moneda
     */
    formatoMonto(value: string) {
        this.cantidad = this.currencyPipe.transform(value, '$');
    }

    /**
     * Metodo  que abre una nueva ventana para poder imprimir la cotizacion
     */
    imprimirTabla(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <title>Cotización Inversiones</title>
              <style>
              //........Customized style.......
              </style>
            </head>
        <body onload="window.print();window.close()">${printContents}</body>
          </html>`
        );
        popupWin.document.close();
    }
}