import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";

@Component({
    selector: 'spei-out',
    templateUrl: './spei-out.component.html'
})
export class SpeiOutComponent {

    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;

    listaPagos = [];
    columnsPagos: string[] = ['beneficiario',
        'cuenta','cveRastreo','fecha', 'monto','estatus'];
    dataSourcePagos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginatorPagos: MatPaginator;
    @ViewChild(MatSort) sortPagos: MatSort;

    constructor(private service: GestionGenericaService){
        this.spsPagoSPEI();
    }


    spsPagoSPEI(){

        let jsonRequest = {
            datos: [],
            accion: 1
        };

        this.blockUI.start('Cargando datos...');

        this.service.getListByObjet(jsonRequest, 'spsPagoSPEI').subscribe(respGetPagos => {
            this.blockUI.stop();
            if (respGetPagos.codigo === "0") {
                this.listaPagos = respGetPagos.lista;
                this.dataSourcePagos = new MatTableDataSource(this.listaPagos);
                setTimeout(() => this.dataSourcePagos.paginator = this.paginatorPagos);
                this.dataSourcePagos.sort = this.sortPagos;
            }else{
                this.service.showNotification('top', 'right', 1, respGetPagos.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }

    /**
     * Metodo para filtrar PAGOS
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourcePagos.filter = filterValue.trim().toLowerCase();

        if (this.dataSourcePagos.paginator) {
            this.dataSourcePagos.paginator.firstPage();
        }
    }

}