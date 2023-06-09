import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import { ModalDetalleActivoComponent } from "./modal/modal-detalle.component";


@Component({
    selector: 'detalle-activo',
    moduleId: module.id,
    templateUrl: 'detalle-activo.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 9/12/2022
 * @descripcion: Componente para la gestion de detalle activo
 */
export class DetalleActivoComponent implements OnInit {

    //Declaración de las variables globales 
    listaDetalle: any = [];
    displayedColumnas: string[] = ['clave', 'departamento', 'empleado', 'concepto', 'frecibe', 'fentrega', 'acciones'];
    dataSource: MatTableDataSource<any>;
    formDetalleBusqueda:UntypedFormGroup;
    
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;

  
    listaTActivo: any = [];
    opcionesTipoAct: Observable<string[]>;

    accion: number = 1;
    sucursalId: number = 0;
    tpActivoId: number = 0;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
 * Constructor de la clase 
 * @param service -Instancia de acceso a datos
 * @param dialog - Instancia de acceso a dialogos
 */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog,private formbuilder: UntypedFormBuilder) {
            this.formDetalleBusqueda=this.formbuilder.group({
                tpActivo : new UntypedFormControl('', Validators.required),
                sucursal : new UntypedFormControl('', Validators.required)

            });

    }

    ngOnInit() {
        this.spsTipoActivos()
        this.spsSucursal();
    }

    /**
       * Metodo para filtrar los activos
       */
    buscarActivo() {
        if (this.formDetalleBusqueda.invalid) {
            this.validateAllFormFields(this.formDetalleBusqueda);
            return this.blockUI.stop();
        }  else {
         
                this.sucursalId = this.formDetalleBusqueda.get('sucursal').value.sucursalid;
                this.tpActivoId = this.formDetalleBusqueda.get('tpActivo').value.tipo_activo_id;

            this.spsActivoDetalle();
        }

    }
    /**
       * Método que en lista todos el detalle del activo
       * 
       */
    spsActivoDetalle() {
        let path;
        this.listaDetalle = [];
        if (this.sucursalId > 0) {
            this.accion = 2;
            path = this.sucursalId + "/" + this.tpActivoId + "/" + this.accion;
        } else {
            path = this.accion;
        }
        this.service.getListByID(path, 'spsDetalleActivo').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaDetalle = JSON.parse(data);
            }
            this.dataSource = new MatTableDataSource(this.listaDetalle);
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
            this.opcionesSucursal = this.formDetalleBusqueda.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this.filterSuc(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
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
        * Método que en lista todos los tipos de activos
        * accion 1 muestra todos los activos
        */
    spsTipoActivos() {

        this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTActivo = JSON.parse(data);
                // Se setean TIPO ACTIVOS para el autocomplete
                this.opcionesTipoAct = this.formDetalleBusqueda.get('tpActivo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterTA(value)));
            }

        });
    }
    /**
     * Filtra el tipo de credito
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterTA(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaTActivo.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
    }
    displayTA(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }

    /**
    * Método que abre una ventana modal para la gestión de activos
    * @param accion - 1.-Registrar, 2.-Editar
    * @param elemento - Elemento a editar 
    */
    abrirDialogo(accion: any, elemento: any) {

        let titulo = 'Registrar Detalle Activo ';
        if (accion == 2) {
            titulo = 'Editar Detalle Activo';
        }

        const dialogRef = this.dialog.open(ModalDetalleActivoComponent, {

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!this.vacio(result.tActivoId)) {
            //mostrar el registro guardado
            this.tpActivoId = result.tActivoId;
            let tAvtivo = this.listaTActivo.find(a => a.tipo_activo_id === result.tActivoId);
            this.formDetalleBusqueda.get('tpActivo').setValue(tAvtivo);
            this.sucursalId = result.sucursalId;
            let sucursal = this.listaSucursales.find(s => s.sucursalid === result.sucursalId);
            this.formDetalleBusqueda.get('sucursal').setValue(sucursal);
            this.spsActivoDetalle();
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
    // Inicia Validaciones del formulario 
    validacionesForm = {
        'sucursal': [
            { type: 'required', message: 'Campo requerido.' }],
        'tpActivo': [
            { type: 'required', message: 'Campo requerido.' }],
    }
     /**
       * Valida Cada atributo del formulario
       * @param formGroup - Recibe cualquier tipo de FormGroup
       */
      validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);       //3
            if (control instanceof UntypedFormControl) {             //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //5
                this.validateAllFormFields(control);            //6
            }
        });
    }
}