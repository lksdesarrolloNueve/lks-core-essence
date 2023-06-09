import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { PermisosService } from "../../../../app/shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { globales } from '../../../../environments/globales.config';
import { Router } from "@angular/router";
import { categorias } from "../../../../environments/categorias.config";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import { UntypedFormControl } from "@angular/forms";
import { ModalSolicitudComponent } from "./modal-solicitud/modal-solicitud.component";
import { MatDialog } from "@angular/material/dialog";




@Component({
    selector: 'solicitud-actualizacion',
    moduleId: module.id,
    templateUrl: 'solicitud-actualizacion.component.html'
})

export class SolicitudActualizacionComponent {

    //Declaracion de variables
    titulo: string='';
    accion: number=1;

    filtro: any;

    
     lblClientes: string =globales.entes;
     lblCliente: string= globales.ente;


    listaSolicitudes: any = [];
    listaEstSolicitud: any = [];
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;
    selectedIdSuc: number;
    sucursal = new UntypedFormControl();
    estatusSol = new UntypedFormControl();
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre', 'tipoSocio', 'numSolicitud', 'fechaSolicitud',
        'motivo', 'observaciones', 'estadoComite', 'acciones'];
    dataSourceSolicitudes: MatTableDataSource<any>;




    constructor(public router: Router,
        private service: GestionGenericaService,
        private permisos: PermisosService,public dialog: MatDialog) {


        //Se inicializan combos y tabla
        this.spsEstatusSolicitud();
        this.spsSucursal();
       
    }


    /**
     * Metodo que lista las solicitudes de creditos
     */
    spsSolicitudes() {

        let estatus=null;
       if(!this.vacio(this.estatusSol.value)){
            estatus=this.estatusSol.value.generalesId;
       }
        let arreglo = {
            "datos": [ this.selectedIdSuc,estatus],
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
    /**Abre modal para autorizar la solicitud
     * @param elemnto Infoamcion de la solicitud 
    */
    verSolicitud(elemento: any) {
        if(elemento==0){
            this.titulo="Nueva solicitud";
        }else{
            this.titulo="Autorización solicitud";
        }
        //se abre el modal
        const dialogRef = this.dialog.open(ModalSolicitudComponent, {
            // height: '500px',
            width: '50%',
            data: {
                titulo: this.titulo,
                accion: elemento
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsSolicitudes();
        });
    }
 
    /**
     * Metodo que consulta los Estados de la solicitud 
     */
    spsEstatusSolicitud() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(categorias.catEstusSol, 'listaGeneralCategoria').subscribe(data => {
            this.listaEstSolicitud = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**
       * Metodo para consultar Sucursales
       * accion 2 activas
       */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
        let idSucursal =  this.listaSucursales.find(sucursal => sucursal.sucursalid=== this.permisos.sucursalSeleccionada.sucursalid);
        this.selectedIdSuc = this.permisos.sucursalSeleccionada.cveSucursal;
        this.sucursal.setValue(idSucursal);    
        this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filterSuc(value))
            );
            this.spsSolicitudes();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Muestra la descripcion de la sucursal
    * @param option --sucursal seleccionado
    * @returns --nombre de sucursal
    */
    displayFnSuc(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
    * Filtra la sucursal
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSuc(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionSuc(event) {
        this.selectedIdSuc = event.option.value.cveSucursal;
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