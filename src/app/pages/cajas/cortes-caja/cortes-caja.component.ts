import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";
import * as moment from "moment";
import { PermisosService } from "../../../shared/service/permisos.service";
import { DetalleCierreComponent } from "./detalle-cierre/detalle-cierre.component";
import { MatDialog } from "@angular/material/dialog";

export interface CajaInt {
    descripcion: string,
    usuario: string,
    sucursal: string,
    fechaApertura: string,
    fechaCierre: string,
    saldoCierre: string
}

@Component({
    selector: 'cortes-caja',
    moduleId: module.id,
    templateUrl: 'cortes-caja.component.html'
})



/**
 * @autor: Josué Roberto Gallegos Martínez
 * @version: 1.0.0
 * @fecha: 04/04/2022
 * @descripcion: Componente para la gestion del listado de cortes de caja
 */
export class CortesCajaComponent {

    @BlockUI() blockUI: NgBlockUI;

    formBuscarCaja: UntypedFormGroup;

    listaSucursales: any = [];
    listaCajasSuc: any = [];

    opcionesSucursal: Observable<string[]>;
    opcionesCaja: Observable<string[]>;

    /**
     * GESTION DE CORTES DE CAJA POR MEDIO DE POSTGRES
     */
    listaCajasFiltradasPg: any = [];
    dataSourceCajasPg = new MatTableDataSource();
    displayedColumns: string[] = ['descripcion', 'usuario', 'sucursal', 'fechaApertura', 'fechaCierre', 'saldoFinalSistema', 'saldoFinalCajero', 'diferencia', 'estatus'];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        private dialog: MatDialog
    ) {

        this.formBuscarCaja = this.formBuilder.group({
            sucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            caja: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            start: new UntypedFormControl('', [Validators.required]),
            end: new UntypedFormControl('', [Validators.required])
        });

        this.listaSucursales = this.servicePermisos.sucursales;

        this.opcionesSucursal = this.formBuscarCaja.get('sucursal').valueChanges.pipe(
            startWith(''),
            map(value => this._filter(value))
        );

    }



    /**
     * Funcion que obtiene la lista de cortes de caja, es decir, las sesiones
     * de caja con estatus falso (que ya han finalizado) y los filtra por fecha de cierre
     */
    spsCortesCajas() {

        if (this.formBuscarCaja.invalid) {
            this.validateAllFormFields(this.formBuscarCaja);
            return;
        }

        let jsonGet = {
            datos: [
                this.formBuscarCaja.get('caja').value.cvecaja,
                this.formBuscarCaja.get('start').value,
                this.formBuscarCaja.get('end').value
            ],
            accion: 3
        }

        this.blockUI.start('Cargando...');

        this.service.registrar(jsonGet, 'spsSesionesCajasPg').subscribe(data => {
            this.blockUI.stop();
            this.listaCajasFiltradasPg = data;

            // Se cambia el formato de las fechas de apertura y cierre
            this.listaCajasFiltradasPg.forEach(element => {

                // Si la caja tiene fecha de apertura, se cambia su formato
                if (element.fechaApertura != null) element.fechaApertura = moment(new Date(element.fechaApertura)).format('DD-MM-YYYY HH:mm:ss');
                // Si la caja tiene fecha de apertura, tambien se cambia su formato
                if (element.fechaCierre != undefined) element.fechaCierre = (element.fechaCierre === null) ?
                    null :
                    moment(new Date(element.fechaCierre)).format('DD-MM-YYYY HH:mm:ss');
            });

            this.dataSourceCajasPg.data = this.listaCajasFiltradasPg;
            setTimeout(() => this.dataSourceCajasPg.paginator = this.paginator);
            this.dataSourceCajasPg.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    spsCajaPorSucursal(cve: string, id: number) {
        this.blockUI.start('Cargando...');
        let path = cve + '/' + id;

        this.service.getListByID(path, 'listaCajasBySucursal').subscribe(data => {
            this.listaCajasSuc = [];
            this.listaCajasSuc = data;

            this.opcionesCaja = this.formBuscarCaja.get('caja').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCaja(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    displaySucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    displayCaja(option: any): any {
        return option ? option.cvecaja.trim() + ' / ' + option.descripcion.trim() : undefined;
    }

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

        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    private _filterCaja(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCajasSuc.filter(option => option.cvecaja.toLowerCase().includes(filterValue)
            || option.descripcion.toLowerCase().includes(filterValue));
    }

    opcionSeleccionadaSucursal() {

        let sucursal = this.formBuscarCaja.get('sucursal').value;

        this.spsCajaPorSucursal(sucursal.cveSucursal, 2);

    }


    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }

    showDetallesCorte(sesion: any) {

        this.dialog.open(DetalleCierreComponent, {
            width: '100%',
            data: {
                sesion: sesion
            }
        });
    }


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

    public validacion_msj = {
        'sucursal': [
            { type: 'required', message: 'Sucursal  requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal  no pertenece a la lista, elija otra sucursal.' }
        ],
        'caja': [
            { type: 'required', message: 'Caja  requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La caja no pertenece a la lista, elija otra caja.' }
        ],
        'start': [
            { type: 'matStartDateInvalid', message: 'Fecha incio erronea.' },
            { type: 'required', message: 'Fecha inicial requerida.' }
        ],
        'end': [
            { type: 'matEndDateInvalid', message: 'Fecha final erronea.' },
            { type: 'required', message: 'Fecha final requerida.' }
        ]
    }







}