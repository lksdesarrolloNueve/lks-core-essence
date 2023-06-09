import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import globales from "../../../../../environments/globales.config";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";




@Component({
    selector: 'modal-solicitud-sucursal',
    moduleId: module.id,
    templateUrl: 'modal-solicitud-sucursal.component.html'
})

export class ModalSolicitudSucursalComponent {

    //Declaracion de variables
    titulo: string='';
    accion: number=1;
    encabezado: string='Listado de solicitudes sucursal '+this.permisos.sucursalSeleccionada.nombreSucursal;
    filtro: any;

    
     lblClientes: string =globales.entes;
     lblCliente: string= globales.ente;


    listaSolicitudes: any = [];
    listaEstSolicitud: any = [];
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;
    selectedIdSuc: number;
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre',  'numSolicitud',
        'motivo', 'observaciones', 'estadoComite'];
    dataSourceSolicitudes: MatTableDataSource<any>;




    constructor(public router: Router,
        private service: GestionGenericaService,
        private permisos: PermisosService,public dialog: MatDialog) {
       this.spsSolicitudes();
    }


    /**
     * Metodo que lista las solicitudes de creditos
     */
    spsSolicitudes() {

        let estatus=null;
        let arreglo = {
            "datos": [ this.permisos.sucursalSeleccionada.cveSucursal,estatus],
            "accion": this.accion
        };
        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(arreglo, 'spsSolicitudesActualiza').subscribe(data => {
            if(!this.vacio(data)) {
                this.listaSolicitudes = JSON.parse(data);
                this.dataSourceSolicitudes = new MatTableDataSource(this.listaSolicitudes);
                this.dataSourceSolicitudes.paginator = this.paginator;
                this.dataSourceSolicitudes.sort = this.sort; 
            }
       
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
   * Metodo para filtrar cajas
   * @param event --evento a filtrar
   */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;

        this.dataSourceSolicitudes.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceSolicitudes.paginator) {
            this.dataSourceSolicitudes.paginator.firstPage();

        }

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