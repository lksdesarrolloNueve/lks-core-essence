import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe } from "@angular/common";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { MatDialog } from "@angular/material/dialog";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";

//Constantes//
const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
    parse: {
        dateInput: 'MM/YYYY',
    },
    display: {
        dateInput: 'MM/YYYY',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY',
    },
};


@Component({
    selector: 'dev-inversiones',
    moduleId: module.id,
    templateUrl: 'dev-inversiones.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class DevInversionesComponent implements OnInit {

    //Declaracion de variables
    formDevengamiento: UntypedFormGroup;
    listaDetalleInversiones = [];
    columnsDInversiones: string[] = ['cvePoliza', 'periodo', 'ejercicio',
        'sucursal', 'detalle', 'fecha', 'usuario', 'estatus', 'acciones'];
    dataSourceDevengamientos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;

    @BlockUI() blockUI: NgBlockUI;

    date = new UntypedFormControl(moment());

    /**
     * Constructor de la clase
     * @param service - servicio de acceso a datos
     * @param formBuilder - Gestion de formularios
     * @param datePipe - servico de fechas
     * @param permisos - servicio de info de sesion
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private datePipe: DatePipe,
        private permisos: PermisosService,
        private dialog: MatDialog) {

        this.formDevengamiento = this.formBuilder.group({
            sucursal: new UntypedFormControl('',{ validators: [this.autocompleteObjectValidator(), Validators.required] }),
            fecha: this.date
        })

    }

    /**
     * Metodo de inicio
     */
    ngOnInit(): void {
        this.spsListaSucursales();
    }

    /**
     * Obtener sucursales
     */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.permisos.sucursales;

        this.opcionesSucursales = this.formDevengamiento.get('sucursal').valueChanges.pipe(
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
     * Metodo para setar año y mes
     * @param normalizedMonthAndYear - formatos
     * @param datepicker - fecha
     */
    setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
        const ctrlValue = this.formDevengamiento.get('fecha').value!;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.formDevengamiento.get('fecha').setValue(ctrlValue);
        datepicker.close();
    }

    /**
     * Metodo que lista por filtro
     * @param accion - acciona realizar
     * @returns 
     */
    listaDetalleDevengamientos(accion: any) {

        this.listaDetalleInversiones = [];
        let path = '1';
        if (accion === 2) {
            if (this.formDevengamiento.invalid) {
                this.validateAllFormFields(this.formDevengamiento);
                return;
            }
            let mes = this.datePipe.transform(this.formDevengamiento.get('fecha').value, 'M');
            let anio = this.datePipe.transform(this.formDevengamiento.get('fecha').value, 'yyyy');

            path = mes + '/' + anio + '/' + this.formDevengamiento.get('sucursal').value.sucursalid + '/' + accion
        }

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(path, 'listaDevengamientoInversion').subscribe(detalle => {
            this.blockUI.stop();
            this.listaDetalleInversiones = detalle;
            this.dataSourceDevengamientos = new MatTableDataSource(this.listaDetalleInversiones);
            setTimeout(() => this.dataSourceDevengamientos.paginator = this.paginator);
            this.dataSourceDevengamientos.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message);
        });


    }

    /**
     * Metodo que realiza el proceso de devengamiento
     */
    aplicarDevengamientos() {

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: 'Generar Devengamiento Inversión',
                body: '¿Esta seguro de realizar el proceso?'
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {

            if (result === 0) {
                let mes = this.datePipe.transform(this.formDevengamiento.get('fecha').value, 'M');
                let anio = this.datePipe.transform(this.formDevengamiento.get('fecha').value, 'yyyy');
                let path = mes + '/' + anio + '/' + this.permisos.usuario.id + '/1';
                this.blockUI.start('Procesando devengamiento...');
                this.service.registrarBYParametro(path, 'devengamientoInversiones').subscribe(result => {
                    this.blockUI.stop();
                    if (result[0][0] === '0') {
                        this.listaDetalleDevengamientos(1);

                        this.service.showNotification('top', 'right', 2, result[0][1])
                    } else {
                        this.service.showNotification('top', 'right', 3, result[0][1])
                    }

                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.message);
                });
            }
        });

    }


    /**
     * Metodo que realiza la cancelacion de devengamiento
     */
    cancelarDevengamientos(devengamiento) {

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: 'Cancelar Devengamiento Inversión',
                body: '¿Esta seguro de realizar el proceso?'
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {

            if (result === 0) {

                let path = this.permisos.usuario.id + '/3/' + devengamiento.cvePoliza;
                this.blockUI.start('Procesando...');
                this.service.registrarBYParametro(path, 'devengamientoInversiones').subscribe(response => {
                    this.blockUI.stop();

                    if (response[0][0] === '0') {
                        this.listaDetalleDevengamientos(1);

                        this.service.showNotification('top', 'right', 2, response[0][1])
                    } else {
                        this.service.showNotification('top', 'right', 3, response[0][1])
                    }

                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.message);
                });
            }
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
     * Lista de validaciones del formulario PEP
     */
    listaValidaciones = {
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no existe.' }
        ],

        "fecha": [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };

}