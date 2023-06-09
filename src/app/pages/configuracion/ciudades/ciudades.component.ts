import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormControl, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdministracionCiudadesComponent } from "./modal-ciudades/administracion-ciudades.component";



@Component({
    selector: 'ciudades',
    moduleId: module.id,
    templateUrl: 'ciudades.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 22/09/2021
 * @descripcion: Componente para la gestion de ciudades
 */
export class CiudadesComponent implements OnInit {
    //Declaracion de variable y componentes

    displayedColumns: string[] = ['consecutivo','ciudad', 'poblacion', 'nivMarg', 'cveMunicipio', 'nivelR', 'cvePLD', 'estado', 'estatus', 'acciones'];
    dataSourceCiudades: MatTableDataSource<any>;
    listaCiudades: any;
    accion: number;
    titulo: string;

    mostrar:boolean =false;
    estado = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaEstados: any;
    opcionesEstado: Observable<string[]>;


    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente 
     * @param service -- Instancia de acceso a datos
     * @param dialog -- Componente para crear diálogos modales en Angular Material 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
       
    }
    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsEstados();
    }
    /**
        * Metodo para listar los ESTADOS activos
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
      * Muestra la descripcion del estado
      * @param option --estado seleccionada
      * @returns --nombre de estado
      */
    displayFn(option: any): any {
        return option ? option.nombreEstado : undefined;
    }

    /**
    * Filtra el nombre de estado
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
        return this.listaEstados.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
    }
    /**
         * Valida que el texto ingresado pertenezca a un estado
         * @returns mensaje de error.
         */
    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string') {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }
    /**
         * Metodo opcionSeleccionada
         * permite obtner el id o descripcion al cambiar el estado
         * @param event -- estado seleccionado
         */
    opcionSeleccionada(event) {
        this.spsCiudades(event.option.value.estadoid);
    }

    /**
     * Metodo para obtener la lista de ciudades
     * por ESTADO
     * @param estadoId --estado a filtrar
     */
    spsCiudades(estadoId: number) {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(estadoId, 'listaCiudadEstado').subscribe(data => {
            this.blockUI.stop();
            this.listaCiudades = data;
            this.dataSourceCiudades = new MatTableDataSource(this.listaCiudades);
            this.dataSourceCiudades.paginator = this.paginator;
            this.dataSourceCiudades.sort = this.sort;
            //MUESTRA LA TABLA
            this.mostrar = true;
        }, error => {
            this.mostrar = false;
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para filtrar ciudades
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCiudades.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCiudades.paginator) {
            this.dataSourceCiudades.paginator.firstPage();
        }
    }
    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    openDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionCiudadesComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                ciudad: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
                this.spsCiudades(result);//se refresque la tabla y se vea la nueva ciudad         
            }
        });

    }

    /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos de Ciudad
     */
    bajaCiudad(elemento: any) {
        //areglo que contiene los datos para baja
        const data = {
            "ciudaId": elemento.ciudaId,
            "nombre": elemento.nombre,
            "poblacion": elemento.poblacion,
            "nivelMarginacion": elemento.nivelMarginacion,
            "cveMunicipioInegi": elemento.cveMunicipioInegi,
            "nivelRiesgo": elemento.nivelRiesgo,
            "cvePld": elemento.cvePld,
            "estatus": false,
            "estado": elemento.estado
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudCiudades').subscribe(resultado => {
            this.blockUI.start('Procesando baja ...');
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
     * Metodo para dar de alta Ciudad
     * @param element --Lista con los datos de Ciudad
     */
    reingresoCiudad(elemento: any) {
        const data = {
            "ciudaId": elemento.ciudaId,
            "nombre": elemento.nombre,
            "poblacion": elemento.poblacion,
            "nivelMarginacion": elemento.nivelMarginacion,
            "cveMunicipioInegi": elemento.cveMunicipioInegi,
            "nivelRiesgo": elemento.nivelRiesgo,
            "cvePld": elemento.cvePld,
            "estatus": true,
            "estado": elemento.estado
        };

        this.service.registrarBYID(data, 4, 'crudCiudades').subscribe(
            result => {
                this.blockUI.start('Procesando reingreso ...');
                //Se condiciona resultado
                if (result[0][0] === '0') {
                    //se cierrra el loader
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }
    /**
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         * @param element --Lista con los datos de Ciudad
         */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaCiudad(element);
        } else {
            this.reingresoCiudad(element);
        }
    }

}