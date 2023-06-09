import { Component, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { PermisosService } from "../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import globales from "../../../../environments/globales.config";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
import { animate, state, style, transition, trigger } from "@angular/animations";
@Component({
    selector: 'op-inusual',
    moduleId: module.id,
    templateUrl: 'op-inusual.component.html',
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
 * @fecha: 31/05/2022
 * @descripcion: Componente para la gestion de operaciones inusuales
 */
export class OpinusualComponent{
      //Declaracion de Variables y Componentes
      @BlockUI() blockUI: NgBlockUI;
      lblClientes: string = globales.entes;
      lblCliente: string = globales.ente;
      today = new Date();
      /**Controles para filtrar los op inuales */
      fechaIn = new UntypedFormControl(this.today);
      fechaFin = new UntypedFormControl();
      sucursal = new UntypedFormControl();
//Controles autocomplete sucursal
      listaSucursales: any = [];
      opcionesSucursal: Observable<string[]>;
      idSucursal: number = 0;
      //Tabla operaciones inusuales
    listaInusual: any = [];
    listaDescripciones:any=[];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre', 'fecha'];
    dataSourceInusual: MatTableDataSource<any>;
    expandedElement: any |null ;

      constructor(private service: GestionGenericaService, private servicePermisos: PermisosService) {

    }
ngOnInit() {
   this.spsSucursal(); 
   this.spsInusual();
}
      /**
   * Metodo para consultar Sucursales
   * accion 2 activas
   */
       spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            let sucursal = this.listaSucursales.find(sucu => sucu.sucursalid === this.servicePermisos.sucursalSeleccionada.sucursalid);
            this.sucursal.setValue(sucursal);
            this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this.filterSuc(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
      /**
* Filtra la sucursal
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
private filterSuc(value: any): any {

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
* Muestra la descripcion de la sucursal
* @param option --sucursal seleccionado
* @returns --nombre de sucursal
*/
displayFnSuc(option: any): any {
    return option ? option.nombreSucursal : undefined;
}
/**
* Metodo para setear el id a filtrar
* @param event  - Evento a setear
*/
opcionSeleccionSuc(event) {
    this.idSucursal = event.option.value.sucursalid;
}

/**Lista las operaciones inusuales del dia y la sucursal en session */
spsInusual() {
    this.blockUI.start('Cargando datos...');
    this.listaInusual= [];
    let fechaI = moment(this.fechaIn.value).format("YYYY-MM-DD");
    let fechaF = ''
    if (!this.vacio(this.fechaFin.value)) {
        fechaF = moment(this.fechaFin.value).format("YYYY-MM-DD");
    }
    if (this.idSucursal == 0) {
        this.idSucursal = this.servicePermisos.sucursalSeleccionada.sucursalid;
    }
   
    //Se genera el Arreglo para consultar operaciones inusuales
    let arreglo = {
        "datos": [fechaI, fechaF, this.idSucursal],
        "accion": 1
    };

    this.service.getListByObjet(arreglo, 'spsOpInusual').subscribe(data => {

        if (!this.vacio(data)) {
            this.listaInusual= JSON.parse(data);
            this.dataSourceInusual= new MatTableDataSource(this.listaInusual);
            this.dataSourceInusual.paginator = this.paginator;
            this.dataSourceInusual.sort = this.sort;
        } else {
            this.dataSourceInusual = this.listaInusual;
            this.service.showNotification('top', 'right', 3, 'No se encontraron operaciones.');
        }

        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
}
    /**
 * Metodo para filtrar operaciones
 * @param event --evento a filtrar
 */
     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceInusual.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceInusual.paginator) {
            this.dataSourceInusual.paginator.firstPage();
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