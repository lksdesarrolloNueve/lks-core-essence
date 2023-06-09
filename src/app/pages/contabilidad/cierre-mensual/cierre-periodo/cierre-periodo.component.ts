import { Component, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { map, startWith } from "rxjs/operators";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatDatepicker } from "@angular/material/datepicker";
import { DatePipe } from "@angular/common";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { CuentaContableModalComponent } from "../../../../pages/modales/cuentacontable-modal/buscar-cuentacontable.component";

//Constantes//
const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
    parse: {
        dateInput: 'YYYY',
    },
    display: {
        dateInput: 'YYYY',
        monthYearLabel: 'YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'YYYY',
    },
};


/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 2.0.0
 * @fecha: 26/07/2022
 * @descripcion: Componente para la gestion de cierre de peridos contables.
 */
@Component({
    selector: 'cierre-periodo',
    moduleId: module.id,
    templateUrl: 'cierre-periodo.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})

export class CierrePeriodoComponent implements OnInit {

    chosenYearDate: Date;    

    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;

    //Declaracion de variables
    listaDetalleCierreP = [];
    columnsCierrePeriodo: string[] = ['periodo', 'estatus'];
    dataSourceDetalleCierreP: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    formCierrePeriodo: UntypedFormGroup;
    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;
    @BlockUI() blockUI: NgBlockUI;
    date = new UntypedFormControl(moment());

    /**
     * Constructor de la clase CierrePeriodoComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, 
                public dialog: MatDialog, 
                private servicePermisos: PermisosService,
                private formBuilder: UntypedFormBuilder,
                private datePipe: DatePipe) {

                this.formCierrePeriodo = this.formBuilder.group({
                    sucursal: new UntypedFormControl('', [this.autocompleteObjectValidator(), Validators.required]),
                    anio: this.date
                })

    }


    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsListaSucursales();
        // this.spsPeriodos();
        // this.mostrarFiltrar = true;
        // this.mostrarBaja = false;
    }


    /**
     * Obtener sucursales
     */
     spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.opcionesSucursales = this.formCierrePeriodo.get('sucursal').valueChanges.pipe(
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
     * Limpia la tabla cierre diario
     */
    public limpiaTabla() {

        this.listaDetalleCierreP = [];
        this.dataSourceDetalleCierreP = new MatTableDataSource(this.listaDetalleCierreP);

    }

    /**
     * Metodo para setar año 
     * @param normalizedMonthAndYear - formatos
     * @param datepicker - fecha
     */
     setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
        this.limpiaTabla();
        const ctrlValue = this.formCierrePeriodo.get('anio').value!;

        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.formCierrePeriodo.get('anio').setValue(ctrlValue);
        datepicker.close();
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
     * Metodo que lista por filtro
     * @returns 
     */
    spsDetalleCierreP(accion:any){


        this.listaDetalleCierreP = [];

        let path = '1';
        let anio: any;

        if (accion === 2) {

            if (this.formCierrePeriodo.invalid) {
                this.validateAllFormFields(this.formCierrePeriodo);
                return;
            }

            anio = this.datePipe.transform(this.formCierrePeriodo.get('anio').value, 'yyyy');


            path =  accion + '/' +
                    this.formCierrePeriodo.get('sucursal').value.cveSucursal + '/' +
                    anio + '/' +
                    0

        }

        //////////////////////////////Cargar los dias del mes a la lista/////////////////////////
        for (let pr: number = 13; pr > 0; pr--) {

            let fecha: any;

            fecha = {
                "periodo": pr,
                "estatus": false
            };

            this.listaDetalleCierreP.push(fecha);

        }

        this.dataSourceDetalleCierreP = new MatTableDataSource(this.listaDetalleCierreP);

        //////////////////////////////////////////////////////////////////////////////////////////

  
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(path, 'listaPeriodo').subscribe(detalle => {
            this.blockUI.stop();

            let listaObtenida = detalle;

            //Iteramos lista precargada 
            for (let i = 0; i < this.listaDetalleCierreP.length; i++) {

                //Iteramos lista obtenida de bd
                for (let j = 0; j < listaObtenida.length; j++) {

                    if (this.listaDetalleCierreP[i].periodo === listaObtenida[j].periodo) {
                        this.listaDetalleCierreP[i] = listaObtenida[j];
                    }
                }

            }

            this.dataSourceDetalleCierreP = new MatTableDataSource(this.listaDetalleCierreP);
            setTimeout(() => this.dataSourceDetalleCierreP.paginator = this.paginator);
            this.dataSourceDetalleCierreP.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message);
        })


    }

   /**
     * Método para cambiar estatus si es activo-desactivo y 
     * si esta desactivado-activa.
     * @param estatus - Valor del toggle
     * @param element - Elemento a cambiar de estatus
     */
    cambiaEstatus(element: any) {

        //Validamos el formulario
        if (this.formCierrePeriodo.invalid) {
            this.validateAllFormFields(this.formCierrePeriodo);
            return;
        }

        let encabezado = "";
        let body = "";

        let accion: any;
     
        if (element.estatus === false) {
            encabezado = "Cerrar periodo";
            body = 'Al realizar esta acción cerrará el ejercicio: '+ 
                   this.datePipe.transform(this.formCierrePeriodo.get('anio').value, 'yyyy') +
                   ' periodo: ' + element.periodo +'. ¿Desea continuar?';
            accion = 1;
        } else {
            encabezado = "Abrir periodo";
            body = 'Al realizar esta acción se abrirán los periodos posteriores al ejercicio: '+ 
                    this.datePipe.transform(this.formCierrePeriodo.get('anio').value, 'yyyy') +
                    ' periodo: ' + element.periodo +'. ¿Desea continuar?';
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

                if (element.periodo == 13){

                    let cveCuenta : any;

                    if(element.estatus === false){
                        
                        const dialogRef = this.dialog.open(CuentaContableModalComponent, {
                            width: '50%',
                            data:{
                                idCuenta:0
                            }
                        });
                
                 
                        dialogRef.afterClosed().subscribe(result => {
                            if (result) {
                                cveCuenta = result.cuenta;

                                //Aministrar periodo 13
                                this.crudPerido13(element, accion, cveCuenta);
                            }
                        });

                    } else {

                        //Aministrar periodo 13
                        this.crudPerido13(element, accion, null);

                    }

                }else{

                    //Administrar periodo
                    this.crudPeriodo(element, accion);
                    
                }
           
            } 

        });

    }


    /**
     * Metodo para administrar periodo cerrar y abrir.
     * @param element 
     * @param accion 
     */
    crudPeriodo(element:any, accion:any){

        if (element.estatus === false) {
            this.blockUI.start('Cerrando periodo...');
        } else {
            this.blockUI.start('Abriendo periodo...');
        }

        let json ={
            "accion" : accion,
            "cveSucursal": this.formCierrePeriodo.get('sucursal').value.cveSucursal,
            "ejercicio": this.datePipe.transform(this.formCierrePeriodo.get('anio').value, 'yyyy'),
            "periodo": element.periodo,
            "consolida": false
        };

        this.service.registrar(json, 'crudPeriodo').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0]  === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]+ ' '+result[0][3])
                }

                //REFRESCA TABLA
                this.spsDetalleCierreP(2);

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );


    }

    /**
     * Gestion de periodo 13 
     * @param element
     * @param accion 
     */
    crudPerido13(element:any, accion:any, cveCuenta:any){


        if (element.estatus === false) {
            this.blockUI.start('Cerrando periodo...');
        } else {
            this.blockUI.start('Abriendo periodo...');
        }

        let json ={

            "accion":      accion,
            "cveSucursal": this.formCierrePeriodo.get('sucursal').value.cveSucursal,
            "cveUsuario":  this.vUsuarioId,
            "cuenta" :     cveCuenta,
            "fecha"  :     "31/12/" + this.datePipe.transform(this.formCierrePeriodo.get('anio').value, 'yyyy')

        };

        this.service.registrar(json, 'spiCierreAnual').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0]  === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]+ ' '+result[0][3])
                }

                //REFRESCA TABLA
                this.spsDetalleCierreP(2);

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
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

        "anio": [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };

}