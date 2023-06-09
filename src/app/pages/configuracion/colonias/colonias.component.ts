import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminColoniaComponent } from "./modal-colonias/administracion-colonias.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { UntypedFormControl } from "@angular/forms";
import { map, startWith } from "rxjs/operators";


@Component({
    selector: 'colonias',
    moduleId: module.id,
    templateUrl: 'colonias.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 27/09/2021
 * @descripcion: Componente para la gestion de colonias
 */
export class ColoniaComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['nombre_colonia', 'ciudad_id', 'cp', 'asentamiento_id', 'localidad_id',
         'clave_inegi', 'clave_colonia_siti', 'estatus', 'acciones'];
    dataSourceColonia: MatTableDataSource<any>;
    listaColonia: any;
    accion: number;
    titulo: string;
    listaCiudades: any;
    listaEstados: any;
    opcionesEstado: Observable<string[]>;
    selectedId: number;
    estado = new UntypedFormControl();

    /**Controles Ciudad */
    ciudad = new UntypedFormControl();
    opcionesCiudades: Observable<string[]>;
    selectedIdCiudad: number;
    listaCiudadEstado: any;
    /**Fin Control Ciudad */


    /**Controles localidad */
    localidad = new UntypedFormControl();
    opcionesLocalidades: Observable<string[]>;
    selectedIdLocalidad: number;
    listaLocalidad: any;
    /**Fin Control localidad */
    mostrar:boolean =false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * 
     * @param service service para el acceso de datos 
     */

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    }
    ngOnInit() {
        this.spsEstados();
    }

    /**
    * Metodo para listar los ESTADOS
    * 
    */
    spsEstados() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(2, 'listaEstados').subscribe(data => {
            this.listaEstados = data;
            this.opcionesEstado = this.estado.valueChanges.pipe(
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
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEstados.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
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
   * Muestra la descripcion de la ciudad
   * @param option --ciudad seleccionada
   * @returns --nombre de ciudad
   */
    displayFnCiudad(option: any): any {
        return option ? option.nombre : undefined;
    }

    /**
* Muestra la descripcion de la localidad
* @param option --localidad seleccionada
* @returns --nombre de localidad
*/
    displayFnLocalidad(option: any): any {
        return option ? option.nombreLocalidad : undefined;
    }


    /**
     * Metodo para obtener la lista de ciudades
     * por ESTADO
     */
    spsCiudad() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedId, 'listaCiudadEstado').subscribe(data => {
            this.listaCiudadEstado = data;
            this.opcionesCiudades = this.ciudad.valueChanges.pipe(
                startWith(''),
                map(value => this._filterCiudad(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para obtener la lista de localidaades
     * por ciudad
     */
    spsLocalidad() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(this.selectedIdCiudad, 'spsLocalidades').subscribe(data => {
            this.listaLocalidad = data;
            this.opcionesLocalidades = this.localidad.valueChanges.pipe(
                startWith(''),
                map(value => this._filterLocalidad(value))
            );
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
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterLocalidad(value: any): any {

        let filterValue = value;

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaLocalidad.filter(option => option.nombreLocalidad.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para filtrar por ciudad ID las colonias
     */
    opcionSelecCiudad(event) {
        this.selectedIdCiudad = event.option.value.ciudaId;
        this.spsLocalidad();
        this.spsColonia(this.selectedIdCiudad, 0);
    }

    /**
     * MEtodo para filtrar por ciudad ID las colonias
     */
    opcionSelecLocalidad(event) {

        this.selectedIdLocalidad = event.option.value.localidadid;
        this.spsColonia(0, this.selectedIdLocalidad);
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
 * Metodo para cargar tabla de Colonias
 */
    spsColonia(ciudad: number, localidad: number) {
        this.blockUI.start('Cargando...');
        let path = ciudad + '/' + localidad;
        this.service.getListByID(path, 'listaColoniaCiudad').subscribe(
            data => {
                this.blockUI.stop();
                this.listaColonia = data;
                this.dataSourceColonia = new MatTableDataSource(this.listaColonia);
                this.dataSourceColonia.paginator = this.paginator;
                this.dataSourceColonia.sort = this.sort;
                this.mostrar = true;
            }, error => {
                //se detiene el loader
                this.mostrar = false;
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

    }


    //metodo para filtrar en el listado obtenido de base de datos
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceColonia.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceColonia.paginator) {
            this.dataSourceColonia.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    abrirdialogo(data) {
        /**si la accion es igual a o el titulo se llamara a registrar o editar  */
        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = 'Editar';

        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdminColoniaComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                colonia: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
            this.spsColonia(result,0);
            }
        });
    }

    /**
     * metodo para dar de baja el colonia
     * @param elemento - Id a dar de baja
     *      
     * */
    bajaregistroColonia(elemento: any) {

        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "coloniaID": elemento.coloniaID,
            "nombrecolonia": elemento.nombrecolonia,
            "ciudad": elemento.ciudad,
            "codP": elemento.codP,
            "catg": elemento.catg,
            "localidad": elemento.localidad,
            "codpatid": elemento.codpatid,
            "cveInegi": elemento.cveInegi,
            "cveSiti": elemento.cveSiti,
            "estatus": false
        };

        this.service.registrarBYID(data, 3, 'crudColonia').subscribe(
            result => {
                elemento.estatus = false;
                if (result[0][0] === '0') {
                    this.blockUI.stop();//se cierra el loader
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * metodo para dar de alta colonia
     * @param elemento 
     *      
     * */
    altaRegistroColonia(elemento: any) {
        //areglo que contiene los datos para reingreso
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "coloniaID": elemento.coloniaID,
            "nombrecolonia": elemento.nombrecolonia,
            "ciudad": elemento.ciudad,
            "codP": elemento.codP,
            "catg": elemento.catg,
            "localidad": elemento.localidad,
            "codpatid": elemento.codpatid,
            "cveInegi": elemento.cveInegi,
            "cveSiti": elemento.cveSiti,
            "estatus": true
        };
        this.service.registrarBYID(data, 4, 'crudColonia').subscribe(
            result => {
                elemento.estatus = true;
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaregistroColonia(element);
        } else {
            this.altaRegistroColonia(element);
        }

    }

}

