import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { Observable } from "rxjs";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { MatDatepicker } from "@angular/material/datepicker";
import { MatTableDataSource } from "@angular/material/table";
import { DatePipe } from "@angular/common";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { PermisosService } from "../../../../shared/service/permisos.service";

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


/**
* @autor: Horacio Abraham Picón Galván.
* @version: 1.0.0
* @fecha: 26/07/2022
* @descripcion: Componente para la gestion de cierres diarios.
*/
@Component({
    selector: 'cierre-dia',
    moduleId: module.id,
    templateUrl: 'cierre-dia.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})

export class CierreDiaComponent implements OnInit {

    //Declaracion de variables
    listaDetalleCierreD = [];
    columnsCierreDiario: string[] = ['fecha', 'estatus'];
    dataSourceDetalleCierreD: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    formCierreDiario: UntypedFormGroup;
    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;

    @BlockUI() blockUI: NgBlockUI;

    date = new UntypedFormControl(moment());


    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        public dialog: MatDialog,
        private datePipe: DatePipe) {

        this.formCierreDiario = this.formBuilder.group({
            sucursal: new UntypedFormControl('', [this.autocompleteObjectValidator(), Validators.required]),
            fecha: this.date
        })

       

    }

    ngOnInit() {
        this.spsListaSucursales();
    }

    /**
     * Obtener sucursales
     */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.opcionesSucursales = this.formCierreDiario.get('sucursal').valueChanges.pipe(
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
     * Metodo que lista por filtro
     * @param accion - acciona realizar
     * @returns 
     */
    spsDetalleCierreD(accion: any) {

        this.listaDetalleCierreD = [];

        let path = '1';


        let anio: any;
        let mes: any;

        if (accion === 3) {
            if (this.formCierreDiario.invalid) {
                this.validateAllFormFields(this.formCierreDiario);
                return;
            }

            anio = this.datePipe.transform(this.formCierreDiario.get('fecha').value, 'yyyy');
            mes = this.datePipe.transform(this.formCierreDiario.get('fecha').value, 'M');


            path = accion + '/' +
                this.formCierreDiario.get('sucursal').value.cveSucursal + '/' +
                null + '/' +
                anio + '/' +
                mes

        }

        //////////////////////////////Cargar los dias del mes a la lista//////////////////////////
        //Obtener dias del mes
        let diasMes = new Date(anio, mes, 0).getDate();

        for (let dia: number = diasMes; dia > 0; dia--) {

            // Ojo, hay que restarle 1 para obtener el mes correcto
            let indice = new Date(anio, mes - 1, dia).getDay();

            let fecha: any;

            fecha = {
                "fecha": anio + '-' + mes + '-' + dia,
                "estatus": false
            };

            this.listaDetalleCierreD.push(fecha);

        }

        this.dataSourceDetalleCierreD = new MatTableDataSource(this.listaDetalleCierreD);

        //////////////////////////////////////////////////////////////////////////////////////////


        this.blockUI.start('Cargando datos...');

        this.service.getListByID(path, 'spsListaCierreDiario').subscribe(detalle => {
            this.blockUI.stop();

            let listaObtenida = detalle;

            //Iteramos lista precargada 
            for (let i = 0; i < this.listaDetalleCierreD.length; i++) {

                //Iteramos lista obtenida de bd
                for (let j = 0; j < listaObtenida.length; j++) {

                    if (Date.parse(this.listaDetalleCierreD[i].fecha) === Date.parse(listaObtenida[j].fecha)) {
                        this.listaDetalleCierreD[i] = listaObtenida[j];
                    }
                }

            }

            this.dataSourceDetalleCierreD = new MatTableDataSource(this.listaDetalleCierreD);
            setTimeout(() => this.dataSourceDetalleCierreD.paginator = this.paginator);
            this.dataSourceDetalleCierreD.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message);
        })


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
        this.limpiaTabla();
        const ctrlValue = this.formCierreDiario.get('fecha').value!;

        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.formCierreDiario.get('fecha').setValue(ctrlValue);
        datepicker.close();
    }

    /**
     * Limpia la tabla d
     */
    public limpiaTabla() {

        this.listaDetalleCierreD = [];
        this.dataSourceDetalleCierreD = new MatTableDataSource(this.listaDetalleCierreD);

    }

    /**
     * Método para cambiar estatus si es activo-desactivo y 
     * si esta desactivado-activa.
     * @param estatus - Valor del toggle
     * @param element - Elemento a cambiar de estatus
     */
    cambiaEstatus(element: any) {

        if (this.formCierreDiario.invalid) {
            this.validateAllFormFields(this.formCierreDiario);
            return;
        }

        let encabezado = "";
        let body = "";

        let accion: any;
     
        if (element.estatus === false) {
            encabezado = "Cerrar periodo";
            body = 'Al realizar esta acción cerrará el periodo diario '+ 
                   this.datePipe.transform(element.fecha, 'dd/MM/yyyy')+'. ¿Desea continuar?';
            accion = 1;
        } else {
            encabezado = "Abrir periodo";
            body = 'Al realizar esta acción se abrirán los periodos posteriores a la fecha seleccionada '+
                   this.datePipe.transform(element.fecha, 'dd/MM/yyyy')+'. ¿Desea continuar?'
            accion = 2;
        }

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });

           
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(res => {



            if (res === 0) {

                if (element.estatus === false) {
                    this.blockUI.start('Cerrando periodo...');
                } else {
                    this.blockUI.start('Abriendo periodo...');
                }

                
                let json = { "accion": accion, 
                             "cveSucursal": this.formCierreDiario.get('sucursal').value.cveSucursal,
                             "fecha": this.datePipe.transform(element.fecha, 'dd/MM/yyyy'),
                             "periodo": this.datePipe.transform(element.fecha, 'MM'),
                             "consolida": "false" };


                this.service.registrar(json, 'spiCierreDiario').subscribe(
                    result => {

                        this.blockUI.stop();
                        if (result[0][0]  === '0') {
                            this.service.showNotification('top', 'right', 2, result[0][1])
                        } else {
                            this.service.showNotification('top', 'right', 3, result[0][1]+ ' '+result[0][3])
                        }

                        //REFRESCA TABLA
                        this.spsDetalleCierreD(3);

                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message)
                    }
                );
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
     * Valida que el texto ingresado pertenezca a la lista
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

    /**
     * Lista de validaciones
     */
    listaValidaciones = {
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal origen no pertenece a la lista, elija otra sucursal.' }
        ],

        "fecha": [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };

}