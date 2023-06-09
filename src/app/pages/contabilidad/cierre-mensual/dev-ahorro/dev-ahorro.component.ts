import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";
import moment, { Moment } from "moment";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MY_FORMATS } from "../dev-inversiones/dev-inversiones.component";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { globales } from '../../../../../environments/globales.config';

@Component({
    selector: 'dev-ahorro',
    moduleId: module.id,
    templateUrl: 'dev-ahorro.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
/**
 * Jasmin Santana
 * Clase: DevAhorro 
 */
export class DevAhorroComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    sucursal = new UntypedFormControl('', [Validators.required]);
    fecha = new UntypedFormControl(moment(), [Validators.required]);
    fechaG = new UntypedFormControl(moment(), [Validators.required]);
    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;
    //Tabla de devengamiento de ahorro
    columns: string[] = ['numCliente', 'nombre', 'interes', 'ahorro', 'fecha'];
    dataSourceAhorro: MatTableDataSource<any>;
    devAhorro: any = [];
    totalRows = 0;
    pageSize = 10;
    currentPage = 0;
    pageSizeOptions: number[] = [10, 25, 100];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    /**
         * Constructor de la clase
         * @param service - servicio de acceso a datos
         * @param formBuilder - Gestion de formularios
         * @param datePipe - servico de fechas
         * @param permisos - servicio de info de sesion
         */
    constructor(private service: GestionGenericaService,
        private datePipe: DatePipe,
        private permisos: PermisosService,
        private dialog: MatDialog) {



    }
    ngOnInit() {
        this.spsListaSucursales();
    }
    /**
     * Metodo que consume los devengamientos
     * @returns lista los devengamientos aplicados
     */
    spsDevengamientoAhorro() {
        this.blockUI.start();
        if (this.sucursal.invalid) {
            if (this.sucursal instanceof UntypedFormControl) {
                this.sucursal.markAsTouched({ onlySelf: true });
            }
            this.service.showNotification('top', 'right', 3, "Selecciona una sucursal.");
            this.blockUI.stop();
            return;
        }
        this.devAhorro = [];
        let mes = this.datePipe.transform(this.fecha.value, 'M');
        let anio = this.datePipe.transform(this.fecha.value, 'yyyy');
        let arreglo = [mes, anio, this.sucursal.value.cveSucursal, this.currentPage, this.pageSize];
        this.service.getListByObjet(arreglo, 'spsDevengamientoAhorro').subscribe(data => {
            if (!this.vacio(data)) {
                this.devAhorro = JSON.parse(data)
                this.dataSourceAhorro = new MatTableDataSource(this.devAhorro);
                this.dataSourceAhorro.paginator = this.paginator;
                this.dataSourceAhorro.sort = this.sort;
            }else{
                this.service.showNotification('top', 'right', 3, 'No se ha generado el devengamiento.'); 
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    //Metodo para cargar los datos por pagina
    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.spsDevengamientoAhorro();
    }
    /**
     * Modal para notificar que se va a realizar el devengamiento
     */
    aplicarDevengamientos() {
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            disableClose: true,
            data: {
                titulo: 'Generar Devengamiento Ahorro',
                body: '¿Esta seguro de realizar el proceso?'
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {
                this.generaDevengamientoAhorro();
            }
        })
    }
    /**
     * Genera el devengamiento de ahorro
     */
    generaDevengamientoAhorro() {
        this.blockUI.start('Generando devengamiento de ahorro.');
        let mes = this.datePipe.transform(this.fechaG.value, 'M');
        let anio = this.datePipe.transform(this.fechaG.value, 'yyyy');
        let path = anio + '/' + mes + '/' + this.permisos.usuario.id + '/1';
        this.service.registrarBYID('', path, 'generarDevAhorro').subscribe(genAhorro => {
            if (genAhorro[0][0] == '0') {
                this.service.showNotification('top', 'right', 2, genAhorro[0][1]);
            } else {
                this.service.showNotification('top', 'right', 3, genAhorro[0][1]);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para cancelar el devengamiento por periodo
     */
    cancelarDevengamiento() {
        let mes = this.datePipe.transform(this.fecha.value, 'M');
                let anio = this.datePipe.transform(this.fecha.value, 'yyyy');
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            disableClose: true,
            data: {
                titulo: 'Cancelar Devengamiento Ahorro',
                body: '¿Esta seguro de cancelar el devengamiento del periodo ' + mes +','+anio+ ' ?'
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {
                //cancelar devengamiento
                let path = anio + '/' + mes + '/' + this.permisos.usuario.id + '/2';
                this.service.registrarBYID('', path, 'generarDevAhorro').subscribe(genAhorro => {
                    if (genAhorro[0][0] == '0') {
                        this.service.showNotification('top', 'right', 2, genAhorro[0][1]);
                        this.devAhorro = [];
                        this.dataSourceAhorro = new MatTableDataSource(this.devAhorro);
                        this.dataSourceAhorro.paginator = this.paginator;
                        this.dataSourceAhorro.sort = this.sort;
                    } else {
                        this.service.showNotification('top', 'right', 3, genAhorro[0][1]);
                    }
                  
                    this.blockUI.stop();
                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error);
                });
            }
        })

    }
    /**
     * Metodo para invocar la lista de ahorro 
     * 0 listar, 1 generar
     * */
    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        if (changeEvent.index == 1) {
            this.devAhorro = [];
        }
    }
    /**
     * Obtener sucursales
     */
    spsListaSucursales() {
        this.blockUI.start();
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursales = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursales(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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
        const ctrlValue = this.fecha.value;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.fecha.setValue(ctrlValue);
        datepicker.close();
    }
    /**
       * Metodo para setar año y mes
       * @param normalizedMonthAndYear - formatos
       * @param datepicker - fecha
       */
    setMonthAndYearG(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
        const ctrlValue = this.fechaG.value;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.fechaG.setValue(ctrlValue);
        datepicker.close();
    }

    /**
    * Metodo que valida si va vacio.
    * @param value 
    * @returns 
    */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    /**
     * Lista de validaciones del formulario PEP
     */
    listaValidaciones = {
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' }
        ],

        "fecha": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "fechaG": [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };
}