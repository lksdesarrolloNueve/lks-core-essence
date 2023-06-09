import { Component, ViewChild } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { categorias } from "../../../../environments/categorias.config";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import globales from '../../../../environments/globales.config';
import { AdminCarteraComponent } from './admin-cartera/admin-cartera.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'cla-cartera',
    moduleId: module.id,
    templateUrl: 'cla-cartera.component.html'
})
export class ClaCarteraComponent {

    //Declaracion de variables
    listSucursales: any = [];
    listaTipoCartera: any = [];
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    //Tabla Saldo cuentas
    displayedColumns: string[] = ['cliente', 'nombre', 'saldo', 'referencia', 'cartera', 'dias', 'acciones'];
    dataSourceCreditos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    listaCreditos: any = [];

    formBusqueda: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase
     * @param service -  Inst de acceso a datos
     * @param formBuilder - Gestion de formularios
     * @param dialog - Gestion de dialogos
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private dialog: MatDialog) {
        this.spsSucurales();
        this.spsTipoCartera();

        this.formBusqueda = this.formBuilder.group({
            sucursal: new UntypedFormControl('', [Validators.required]),
            cartera: new UntypedFormControl('', [Validators.required]),
            cliente: new UntypedFormControl('')
        })
    }


    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listSucursales = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para obtener los tipos de cartera
     */
    spsTipoCartera() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(categorias.catTipoCartera, 'listaGeneralCategoria').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoCartera = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }



    /**
     * Metodo para buscar carteras
     */
    buscarCartera() {

        if (this.formBusqueda.invalid) {
            this.validateAllFormFields(this.formBusqueda);
            return;
        }

        let path = "";

        if (this.formBusqueda.get('cliente').value) {
            path = this.formBusqueda.get('cliente').value.toUpperCase() + "/" + this.formBusqueda.get('cartera').value.cveGeneral + "/" + this.formBusqueda.get('sucursal').value.sucursalid
        } else {
            path = this.formBusqueda.get('cartera').value.cveGeneral + "/" + this.formBusqueda.get('sucursal').value.sucursalid;
        }

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(path, 'clasificacionCreditos').subscribe(data => {
            this.blockUI.stop();
            this.listaCreditos = [];
            this.listaCreditos = data;
            this.dataSourceCreditos = new MatTableDataSource(this.listaCreditos);
            setTimeout(() => this.dataSourceCreditos.paginator = this.paginator);
            this.dataSourceCreditos.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    /**
    * Valida Cada atributo del formulario
    * @param formGroup - Recibe cualquier tipo de FormGroup
    */
    validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof UntypedFormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    /**
     * Metodo que abre el modal con la información del credito
     * @param credito - Informacion del credito
     */
    modalClasificacion(credito: any) {

        this.listaCreditos = [];

        this.dialog.open(AdminCarteraComponent, {
            width: '70%',
            data: {
                credito: credito,
                listaTipoCartera: this.listaTipoCartera
            }
        });
    }

    /** Lista de validaciones*/
    validacion_msj = {
        'sucursal': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'cartera': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'cliente': [
            { type: 'required', message: 'Campo requerido.' }
        ]

    }


}