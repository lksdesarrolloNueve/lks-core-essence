import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormControl, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";

import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdministracionGastosComponent } from "./modal-gastos/administracion-gastos.component";

@Component({
    selector: 'gastos',
    moduleId: module.id,
    templateUrl: 'gastos.component.html',
    styleUrls: ['gastos.component.css']
})

/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 18/10/2022
 * @descripcion: Componente para la gestion de gastos
 */
export class GastosComponent implements OnInit {

    vAccion: number;
    vTitulo: string;

    
    //Declaracion de Variables y Componentes
    displayedColumns: string[] = ['cveGasto','descripcion','cuenta','nombre','sucursal','limite','estatus','acciones'];
    dataSourceGastos: MatTableDataSource<any>;
    listaGastos: any = [];
    mostrar: boolean;

    /**Controles sucursales*/
    listaSucursales: any;
    opcionesSucursal: Observable<string[]>;
    sucursal = new UntypedFormControl('', { validators: [] });

    isLoadingResults = true;
    isResultado = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente garantias
     * @param dialog -- Componente para crear diálogos modales en Angular Material 
     * @param service -- Instancia de acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

        this.spsGastos();
        this.spsSucursales();
    
    }

    /**
     * Metodo para listar gastos 
     * Se lista 1.- muestra todos, 2.- muestra activos , 3.- muestra inactivos
     */
    spsGastos() {
       //this.blockUI.start('Cargando datos...');

        this.isLoadingResults = true;
        this.isResultado = false;

        this.sucursal.setValue('');

        this.service.getListByID(1, 'listaGastos').subscribe(data => {
            
            this.isResultado = data.length === 0;

            this.blockUI.stop();

            this.listaGastos = data;

            this.dataSourceGastos = new MatTableDataSource(this.listaGastos);




            //set a new filterPredicate function
            this.dataSourceGastos.filterPredicate = (data, filter: string) => {
                    const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, data, key);
                };
            
                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate

            this.dataSourceGastos.paginator = this.paginator;
            this.dataSourceGastos.sort = this.sort;

            this.isLoadingResults = false;



        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    //also add this nestedFilterCheck class function
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
    * Metodo para abrir ventana modal
    * @param data -- Objecto o valor a condicionar
    */
    openDialog(data: any) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.vTitulo = "Registrar";
            this.vAccion = 1;
        } else {
            this.vTitulo = "Editar"
            this.vAccion = 2;
        }


        //Se abre el modal
        const dialogRef = this.dialog.open(AdministracionGastosComponent, {
            width: '70%',
            data: {
                titulo: this.vTitulo,
                accion: this.vAccion,
                caja: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if(this.sucursal.value.cveSucursal){
                this.spsGastosSucursal(this.sucursal.value.cveSucursal );
            }else{
                this.spsGastos();
            }

        });

    }

    /**
     * Metodo para filtrar gastos
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;

        this.dataSourceGastos.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceGastos.paginator) {
            this.dataSourceGastos.paginator.firstPage();

        }

    }


    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     * @param element --Lista con los datos de cajas
     */
    cambiaEstatus(element: any) {
        this.blockUI.start('Cambiando Estatus ...');

        if (element.estatus) {
            this.blockUI.stop();
            this.bajaAltaCaja(element,3);
        } else {
            this.blockUI.stop();
            this.bajaAltaCaja(element,4);
        }

    }

    /**
     * Metodo para dar de alta o baja un gasto
     * @param elemento --Lista con los datos gastos
     */
     bajaAltaCaja(elemento: any, accion: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja ...');

        //Declaracion json.
        const data = {
            "idGasto": elemento.idGasto,
            "sucursal": elemento.sucursal,
            "cveGasto": elemento.cveGasto,
            "descripcion": elemento.descripcion,
            "cuentaContable": elemento.cuentaContable,
            "limiteGasto": elemento.limiteGasto,
            "estatus": elemento.estatus
        }

        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, accion, 'crudGastos').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error 
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
        
    /**
     * Metodo para listar las sucursales
     * 
     */
    spsSucursales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Filtra sucursales
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any[] {
        let filterValue = value;
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        this.mostrar = false;
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * Muestra la descripcion de la sucursal
     * @param option --estado seleccionada
     * @returns --nombre sucursal
     */
    displayFn(option: any): any {
    return option ? option.nombreSucursal : undefined;
    }


    /**
     * Refresca los gastos filtrados por sucursal.
     * @param event 
     */
    opcionSeleccionadaSucursal(event:any) {
    
        this.spsGastosSucursal(this.sucursal.value.cveSucursal );

    }

    /**
     * Consulta 
     * @param cveSucursal 
     */
    spsGastosSucursal(cveSucursal: any){
        
        this.listaGastos = [];
        this.dataSourceGastos = new MatTableDataSource(this.listaGastos);

        this.isLoadingResults = true;
        this.isResultado = false;

        let path = cveSucursal + '/' +  1;

        this.service.getListByID(path, 'listaGastosPorSuc').subscribe(data => {
            
            //this.blockUI.stop();

            this.isResultado = data.length === 0;

            this.listaGastos = data;

            this.dataSourceGastos = new MatTableDataSource(this.listaGastos);
            this.dataSourceGastos.paginator = this.paginator;
            this.dataSourceGastos.sort = this.sort;


            //set a new filterPredicate function
            this.dataSourceGastos.filterPredicate = (data, filter: string) => {
                const accumulator = (currentTerm, key) => {
                return this.comprobacionFiltroAnidado(currentTerm, data, key);
            };
        
            const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
            
            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();
            
            return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate

            this.isLoadingResults = false;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Valida que el texto ingresado pertenezca a un gasto
     * @returns mensaje de error.
     */
     autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }



}