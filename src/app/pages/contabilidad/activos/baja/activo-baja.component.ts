import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormControl, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { ModalActivoBajaComponent } from "./modal/modal-baja.component";

@Component({
    selector: 'activo-baja',
    moduleId: module.id,
    templateUrl: 'activo-baja.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 15/12/2022
 * @descripcion: Componente para la gestion de Baja de Activo 
 */
export class ActivoBajaComponent implements OnInit {

    //Declaración de las variables globales 
    listaActivoBaja: any = [];
    displayedColumnas: string[] = ['tipoBaja', 'fechaBaja', 'importeVenta', 'clave', 'concepto', 'moi','acciones'];
    dataSource: MatTableDataSource<any>;

    sucursal = new UntypedFormControl('', Validators.required);
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;


    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
 * Constructor de la clase InpcComponent
 * @param service -Instancia de acceso a datos
 * @param dialog - Instancia de acceso a dialogos
 */
    constructor(private service: GestionGenericaService,private permisosService: PermisosService,
        public dialog: MatDialog) {
         

    }

    ngOnInit() {
        this.spsSucursal();
    }
    /**
         * Método que en lista todos los activos
         * accion 1 muestra todos las bajas
         */
    spsActivoBaja() {
        let path= this.sucursal.value.sucursalid+'/1';
        this.listaActivoBaja = [];
        
        this.service.getListByID(path, 'spsActivoBaja').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaActivoBaja = JSON.parse(data);
            }
            this.dataSource = new MatTableDataSource(this.listaActivoBaja);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }

        );

    }
   
    /**
     * Método que filtra la tabla 
     * @param event- dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
  
    /**
       * Metodo para consultar Sucursales
       * accion 2 activas
       */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this.filterSuc(value))
            );
            let sessionSuc=this.listaSucursales.find(s => s.sucursalid===this.permisosService.sucursalSeleccionada.sucursalid);
            this.sucursal.setValue(sessionSuc);
            this.spsActivoBaja();
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
    * Método que abre una ventana modal para la gestión de tipo de baja de activos
    * @param accion - 1.-Registrar, 2.-Editar
    * @param elemento - Elemento a editar 
    */
    abrirDialogo(accion: any, elemento: any) {

        let titulo = 'Registrar Baja de Activo ';
        if (accion == 2) {
            titulo = 'Editar Baja de Activo ';
        }

        const dialogRef = this.dialog.open(ModalActivoBajaComponent, {

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(r => {
            this.spsActivoBaja();
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
    // Inicia Validaciones del formulario de empleado
    validaciones = {
        'sucursal': [
            { type: 'required', message: 'Campo requerido.' }]
    }
}