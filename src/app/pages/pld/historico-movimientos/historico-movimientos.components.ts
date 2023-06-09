import { Component, OnInit, ViewChild } from "@angular/core";
import { globales } from "../../../../environments/globales.config";
import { generales } from "../../../../environments/generales.config";
import { UntypedFormControl } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import * as moment from 'moment';
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
    selector: 'historico-movimientos',
    moduleId: module.id,
    templateUrl: 'historico-movimientos.component.html',
    styleUrls: ['../../cajas/caja-movimientos/caja-movimientos.component.css'],
    animations: [
        trigger('detailExpand', [
          state('collapsed', style({ height: '0px', minHeight: '0' })),
          state('expanded', style({ height: '*' })),
          transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
        ])
      ]

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 27/04/2022
 * @descripcion: Componente para la gestion de movimientos realizados con efectivo o transaferncia
 */
export class HistoricoMovComponent implements OnInit {

   

    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    today = new Date();
    /**Controles para filtrar los movimientos */
    fechaIn = new UntypedFormControl(this.today);
    fechaFin = new UntypedFormControl();
    numeroCliente = new UntypedFormControl();

    /**Controles para la tabla de movimientos */
    listaMovimientos: any = [];
    listaDescripciones: any = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre', 'fecha', 'icon',
        'total'];
    dataSourceMovimientos: MatTableDataSource<any>;
    expandedElement: any |null ;

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
         
    }
    /**
    * metodo OnInit de la clase AdminCreditos para iniciar los metodos
    */
    ngOnInit() {
        this.spsHistMov();
    }
    /**
      * Metodo que lista los movimientos del credito
      */
    spsHistMov() {

        this.blockUI.start('Cargando datos...');
        let fechaI = moment(this.fechaIn.value).format("YYYY-MM-DD");
        let params = fechaI;
        let fechaF = ''
        if (!this.vacio(this.fechaFin.value)) {

            fechaF = moment(this.fechaFin.value).format("YYYY-MM-DD");
            params = fechaI + '/' + fechaF;
            if (!this.vacio(this.numeroCliente.value) && !this.vacio(this.fechaFin.value)) {
                params = fechaI + '/' + fechaF + '/' + this.numeroCliente.value;
            }
        } else {
            if (!this.vacio(this.numeroCliente.value)) {
                params = fechaI + '/' + moment(this.today).format("YYYY-MM-DD") + '/' + this.numeroCliente.value;
                // params = fechaI + '/' + fechaF + '/' + this.numeroCliente.value;
            } /*else {
                params = fechaI + '/' + moment(this.today).format("YYYY-MM-DD");
            }*/
        }

        //validar fecha fin sino esta vacia
        /*let fecha = this.fechaIn.value.replace('/', '-');
        let fechaIn = fecha.replace('/', '-');

        let fechaF = this.fechaFin.value.replace('/', '-');
        let fechaFin = fechaF.replace('/', '-');
*/

        this.service.getListByArregloIDs(params, 'spsHistoricoMov').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaMovimientos = JSON.parse(data);
                this.listaDescripciones = JSON.parse(this.listaMovimientos[0].movimientos);
                /*let nueva = [];
                let index=0;
                for (let m of this.listaMovimientos) {

                 let des=   this.listaDescripciones.find(d => d.cliente_id=== m.cliente_id && d.fecha===m.fecha);

                    nueva.push([m,des]);
                    
                }
  
                /*consolelet total = this.listaMovimientos.reduce((acc, mov,) => acc + (mov.monto),
                0);*/
                this.dataSourceMovimientos = new MatTableDataSource(this.listaMovimientos);
                this.dataSourceMovimientos.paginator = this.paginator;
                this.dataSourceMovimientos.sort = this.sort;
            }else{
                this.service.showNotification('top', 'right', 3, 'No se encontraron movimientos.');
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
 * Metodo para filtrar movimientos
 * @param event --evento a filtrar
 */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMovimientos.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceMovimientos.paginator) {
            this.dataSourceMovimientos.paginator.firstPage();
        }
    }
    /**Metodo para bir ventana modal de clientes */
    modalClientes() {

        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente',
                cliente: ''
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (result != 1) {
                if (result.tipoPersona == 'F') {

                    this.numeroCliente.setValue(result.datosCl.numero_cliente.trim())
                } else {
                    //Moral
                }
            }
            if(result == 1){ 
            this.numeroCliente.setValue('');
            }

        });

    }
    /**
         * Metodo que valida si va vacio.
         * @param value 
         * @returns 
         */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}