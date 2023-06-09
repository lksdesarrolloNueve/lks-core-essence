import { Component, OnInit, PipeTransform, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { UntypedFormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { AdminLocalidadComponent } from "./admin-localidad/admin-localidad.component";

@Component({
    selector: 'localidades',
    moduleId: module.id,
    templateUrl: 'localidades.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/09/2021
 * @descripcion: Componente para la gestion de localidades
 */
export class LocalidadesComponent implements OnInit {


    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['nombreLocalidad', 'cveLocalidadInegi', 'cveMunicipioInegi',
        'cveInegi', 'ciudad', 'estado', 'estatus', 'acciones'];
    dataSourceLocalidades: MatTableDataSource<any>;
    listLocalidades: any;



    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;


    mostrar: boolean = false;

    /**Controles Estados */
    estado = new UntypedFormControl();
    opcionesEstado: Observable<string[]>;
    selectedId: number;
    listaEstados: any;
    /**Fin Controles Estados */

    /**Controles Ciudad */
    mostrarCiudad: boolean = false;
    ciudad = new UntypedFormControl();
    opcionesCiudades: Observable<string[]>;
    selectedIdCiudad: number;
    listaCiudadEstado: any;
    /**Fin Control Ciudad */

    /**
        * Constructor del componente LocalidadesComponent
        * @param service - Service para el acceso a datos
        * @param dialog - Servicio para la gestion de Dialogos Tipo Modal
        */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsEstados();

    }

    /**
     * Metodo para consultar estados
     */
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            this.opcionesEstado = this.estado.valueChanges.pipe(
                startWith('GUANAJUATO'),
                map(value => this._filter(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
      * Muestra la descripcion del estado
      * @param option --estado seleccionada
      * @returns --nombre de estado
      */
    displayFn(option: any): any {
        return option ? option.nombreEstado : undefined;
    }




    /**
    * Filtra el estado
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaEstados.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
    }


    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionada(event) {
        this.selectedId = event.option.value.estadoid;
        this.spsCiudad();
    }

    /**
     * Metodo para la busqueda de localdiades por Id del Estado
     */
    spsLocalidades() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedIdCiudad, 'spsLocalidades').subscribe(data => {

            this.listLocalidades = data;
            this.dataSourceLocalidades = new MatTableDataSource(this.listLocalidades);
            this.dataSourceLocalidades.paginator = this.paginator;
            this.dataSourceLocalidades.sort = this.sort;
            //set a new filterPredicate function
            this.dataSourceLocalidades.filterPredicate = (dataLoc, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, dataLoc, key);
                };
                const dataStr = Object.keys(dataLoc).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate
            this.mostrar = true;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
   * Metodo para filtrar sucursales
   * @param event - evento a filtrar
   */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceLocalidades.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceLocalidades.paginator) {
            this.dataSourceLocalidades.paginator.firstPage();
        }
    }



    /**
     * Filtra Ciudades por Esatdo ID
     */
    spsCiudad() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedId, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            this.opcionesCiudades = this.ciudad.valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudad(value))
            );
            this.mostrarCiudad = true;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCiudad(value: any): any {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCiudadEstado.filter(option => option.nombre.toLowerCase().includes(filterValue));
    }

    /**
  * Muestra la descripcion de la ciudad
  * @param option --ciudad seleccionada
  * @returns --nombre de ciudad
  */
    displayFnCiudad(option: any): any {
        return option ? option.nombre : undefined;
    }


    /**
     * MEtodo para filtrar por ciudad ID las localidades
     */
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.spsLocalidades();

    }

    /**
   * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
   */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaLocalidad(element);
        } else {
            this.reingresoLocalidad(element);
        }
    }


    /**
  * Metodo que me abre un modal para la gestion de sucursales (REgistar, EDitar)
  * @param data - Objecto o valor a condicionar
  */
    abrirDialogoLocalidad(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminLocalidadComponent, {
            width: "40%",
            data: {
                accion: this.accion,
                titulo: this.titulo,
                localidad: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsLocalidades();
        });
    }


    /**
   * MEtodo para dar de baja una localidad
   * @param element --Lista con los datos de localidad
   */
    bajaLocalidad(elemento: any) {

        this.blockUI.start('Procesando baja ...');

        const data = {
            "localidadid": elemento.localidadid,
            "nombreLocalidad": elemento.nombreLocalidad,
            "cveLocalidadInegi": elemento.cveLocalidadInegi,
            "cveMunicipioInegi": elemento.cveMunicipioInegi,
            "cveInegi": elemento.cveInegi,
            "estatus": elemento.estatus,
            "ciudad": elemento.ciudad,
            "estado": elemento.estado
        };



        this.service.registrarBYID(data, 3, 'crudLocalidad').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    elemento.estatus = false;

                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.spsLocalidades();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    /**
    * MEtodo para dar reingreso una localidad
    * @param element --Lista con los datos de localidad
    */
    reingresoLocalidad(elemento: any) {

        this.blockUI.start('Procesando reingreso ...');

        const data = {
            "localidadid": elemento.localidadid,
            "nombreLocalidad": elemento.nombreLocalidad,
            "cveLocalidadInegi": elemento.cveLocalidadInegi,
            "cveMunicipioInegi": elemento.cveMunicipioInegi,
            "cveInegi": elemento.cveInegi,
            "estatus": true,
            "ciudad": elemento.ciudad,
            "estado": elemento.estado
        };



        this.service.registrarBYID(data, 4, 'crudLocalidad').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    elemento.estatus = true;

                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, errorRegistro => {
                this.spsLocalidades();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorRegistro.Message);
            }
        );

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



}