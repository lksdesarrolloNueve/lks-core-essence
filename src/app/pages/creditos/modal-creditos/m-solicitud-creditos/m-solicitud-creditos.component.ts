import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PermisosService } from "../../../../shared/service/permisos.service";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'm-solicitud-creditos',
    moduleId: module.id,
    templateUrl: 'm-solicitud-creditos.component.html'
})

export class MSolicitudCreditosComponent {
    //Declaracion de variables
    titulo: any;
    accion: any;

    filtro: any;


    listaSolicitudes: any = [];

    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre', 'tipoSocio', 'numSolicitud', 'fechaSolicitud',
        'montoCredito', 'descEstadoCred', 'estadoComite'];
    dataSourceSolicitudes: MatTableDataSource<any>;




    constructor(private dialog: MatDialogRef<MSolicitudCreditosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private permisos: PermisosService) {

        this.accion = data.accion;
        this.titulo = data.titulo;

        this.spsSolicitudes();
    }


    /**
     * Metodo que lista las solicitudes de creditos
     */
    spsSolicitudes() {
        let idSucursal = this.permisos.sucursalSeleccionada.sucursalid;
        this.blockUI.start('Cargando datos...');
        this.service.getListByArregloIDs(idSucursal, 'listaSolicitudes').subscribe(solicitud => {
            if (!this.vacio(solicitud)) {
                if (solicitud[0] != null) {
                    this.listaSolicitudes = JSON.parse(solicitud);
                    this.dataSourceSolicitudes = new MatTableDataSource(this.listaSolicitudes);
                    this.dataSourceSolicitudes.paginator = this.paginator;
                    this.dataSourceSolicitudes.sort = this.sort;

                    //Se agrega la busqueda de informacion en las extenciones de datos
                    this.dataSourceSolicitudes.filterPredicate = (data, filter: string) => {
                        const accumulator = (currentTerm, key) => {
                            return this.comprobacionFiltroAnidado(currentTerm, data, key);
                        };
                        const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                        // Transforma el filtro a minusculas y remueve los espacios.
                        const transformedFilter = filter.trim().toLowerCase();
                        return dataStr.indexOf(transformedFilter) !== -1;
                    }
                    //Fin set predicate

                } else {
                    this.service.showNotification('top', 'right', 3, "No hay solicitudes para mostrar.");
                }
            }



            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**Metodo para obtener la información de la solicitud selecionada */
    getRecord(solicitud) {
        this.dialog.close(solicitud);
    }


    /**
   * Metodo para filtrar el texto ingresado en la caja de filtro
   * @param event --evento a filtrar
   */
    filtrar(event: any) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSolicitudes.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceSolicitudes.paginator) {
            this.dataSourceSolicitudes.paginator.firstPage();
        }

    }
    //Se compara la cadena ingresada con el contenido de la lista de solicitud
    comprobacionFiltroAnidado(search, data, key) {
        if (typeof data[key] === 'object') {
            for (const k in data[key]) {
                if (data[key][k] !== null) {
                    search = this.comprobacionFiltroAnidado(search, data[key], k);
                }
            }
        } else {
            search += data[key];
        }
        return search;
    }
    /**
    * Metodo que valida si va vacio el dato.
    * @param value  cadena
    * @returns boolean
    */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}