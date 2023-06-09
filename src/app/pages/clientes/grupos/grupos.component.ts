import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { AdminGrupoComponent } from "./modal-grupos/admin-grupos.component";
import { Observable } from "rxjs";
import { PermisosService } from "../../../shared/service/permisos.service";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: 'grupos',
    moduleId: module.id,
    templateUrl: 'grupos.component.html'
})


/**
 * @autor: Victor Daniel Loza Cruz
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de grupos
 */
export class GruposComponent implements OnInit {


    /**
     * Declaracion de variables y controles
     */
    displayedColumns: string[] = ['cveGrupo', 'nombreGrupo', 'estatus', 'acciones']
    listaGrupos = [];
    listaIntegrantesGrupo = [];
    arrayIdsInGr: any[] = [];

    sucursal = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;

    formGrupos: UntypedFormGroup;

    //validacion de campos 
    validaciones = {
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no existe.' }
        ]
    };

    /*
    *Deshabilita opsiones en la vista
     */
    estatusGrupos = new UntypedFormControl({ value: '', disabled: true });

    dataSourceGrupos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase GruposComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService) {

        this.formGrupos = this.formBuilder.group({
            sucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
        });

    }

    /**
     * metodo OnInit de la clase Grupos
     */
    ngOnInit() {
        this.spsListaSucursales();
    }

    /**
     * Metodo que lista grupos
     */
    buscarGrupos() {

        //valida los campos del formulario
        if (this.formGrupos.invalid) {
            this.validateAllFormFields(this.formGrupos);
            return;
        }
        this.blockUI.start('Buscando datos...');
        this.service.getListByID(this.formGrupos.get('sucursal').value.cveSucursal + "/1", 'listaGrupos').subscribe(data => {
            this.blockUI.stop();
            this.listaGrupos = data;
            this.dataSourceGrupos = new MatTableDataSource(this.listaGrupos);
            this.dataSourceGrupos.paginator = this.paginator;
            this.dataSourceGrupos.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }

    /**
    * Metodo para obtener los integrantes del grupo
    */
    spsIntegrantesGrupo(elemento: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(elemento, 'listaIntegrantesGrupo').subscribe(data => {
            this.blockUI.stop();
            this.listaIntegrantesGrupo = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /** 
    *  Metodo para filtrar la tabla
    *  @param event - evento para filtrar
    */
    applyFilterGrupos(event: Event) {
        const filterValueBoveda = (event.target as HTMLInputElement).value;
        this.dataSourceGrupos.filter = filterValueBoveda.trim().toLowerCase();
        if (this.dataSourceGrupos.paginator) {
            this.dataSourceGrupos.paginator.firstPage();
        }
    }

    /**
     * Metodo para realizar el crud de Grupos
     * Metodo que conforma el JSON
     * @param elemento - parametro de entrada elemento 
     */
    crudGrupos(elemento: any, estatus) {

        //Se crea forEach para agregar la información del JSON de forma lineal

        let jsonLineal = {
            "grupo": {
                "grupoId": elemento.grupoId,
                "cveGrupo": elemento.cveGrupo,
                "nombreGrupo": elemento.nombreGrupo,
                "estatus": elemento.estatus

            },
            "integrantesGrupo": this.arrayIdsInGr

        }

        let tipoAccion = 3;

        if (estatus === false) {
            tipoAccion = 3;
            this.blockUI.start('Procesando Baja...');//Se inicia el loader
        } else {
            this.blockUI.start('Procesando Alta...');//Se inicia el loader
            tipoAccion = 4;

        }

        this.service.registrarBYID(jsonLineal, tipoAccion, 'crudGrupos').subscribe(
            result => {
                this.blockUI.stop();//se cierra el loader
                if (result[0][0] === '0') {
                    elemento.estatus = estatus;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => {
                this.blockUI.stop();//se cierra el loader
                this.service.showNotification('top', 'right', 4, error.Message);
            }

        );
    }

    /** 
     * Metodo que abre un modal para la gestion de grupos
    */
    abrirAdminGrupos(elemento, accion) {


        let titulo = 'REGISTRAR';

        if (accion !== 1) {
            titulo = 'EDITAR';
            this.spsIntegrantesGrupo(elemento.cveGrupo);
        }

        const dialogRef =
            this.dialog.open(AdminGrupoComponent, {
                data: {
                    accion: accion,
                    titulo: titulo,
                    grupos: elemento, //trae la información de la grupos
                    integrantesGrupo: this.listaIntegrantesGrupo
                }

            });

        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.listaGrupos = [];
        });

    }


    /**
    * Obtener sucursales
    */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.opcionesSucursales = this.sucursal.valueChanges.pipe(
            startWith(''),
            map(value => this._filterSucursales(value))
        );

        this.blockUI.stop();


    }

    /**
    * Filtra la categoria de sucursales
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursales(value: any): any {

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
   * @param option --muestra el nombre de la sucursal seleccionada
   * @returns --nombre de la sucursal
   */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
    * Valida que el texto ingresado pertenezca a un subramas
    * @returns mensaje de error.
    */
    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null;
        }

    }

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => { //2
            const control = formGroup.get(field);         //3
            if (control instanceof UntypedFormControl) {          //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {     //5
                this.validateAllFormFields(control);       //6
            }
        });
    }

}