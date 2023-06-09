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

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 29/08/2022
 * @descripcion: Componente para la gestion de pre cierres.
 */
@Component({
    selector: 'precierre',
    moduleId: module.id,
    templateUrl: 'precierre.component.html',
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
        },

        { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    ]
})
export class PrecierreComponent implements OnInit {

    //Declaracion de variables
    formPrecierre: UntypedFormGroup;
    listaPrecierres = [];
    columnsDInversiones: string[] = ['fechaPrecierre','nombreUsuario', 'mensaje', 'cerrado'];
    dataSourcePrecierres: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;
    mensaje = false;
    titulo: any;

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

        this.formPrecierre = this.formBuilder.group({
            sucursal: new UntypedFormControl('', [this.autocompleteObjectValidator(),Validators.required]),
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
     * Obtener sucursales filtradas por permisos
     */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.permisos.sucursales;

        this.opcionesSucursales = this.formPrecierre.get('sucursal').valueChanges.pipe(
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
        const ctrlValue = this.formPrecierre.get('fecha').value;
        ctrlValue.month(normalizedMonthAndYear.month());
        ctrlValue.year(normalizedMonthAndYear.year());
        this.formPrecierre.get('fecha').setValue(ctrlValue);
        datepicker.close();
    }

    /**
     * Metodo que lista por filtro
     * @param accion - acciona realizar
     * @returns 
     */
    spsPrecierres(accion: any) {

        this.listaPrecierres = [];
        let path = '1';
        this.mensaje = false;

        let mes : any;
        let anio : any;
        mes = this.datePipe.transform(this.formPrecierre.get('fecha').value, 'M');
        anio = this.datePipe.transform(this.formPrecierre.get('fecha').value, 'yyyy');
        let diasMes = new Date(anio, mes, 0).getDate();
        let fecha = anio+'-'+ mes +'-'+ diasMes;

        //Eliminar acciones sucursal
        this.columnsDInversiones.forEach((value,index)=>{
            if(value === 'acciones') this.columnsDInversiones.splice(index,1);
            if(value === 'sucursal') this.columnsDInversiones.splice(index,1);
        });

        if (accion === 3) {
            
            if (this.formPrecierre.invalid) {
                this.validateAllFormFields(this.formPrecierre);
                return;
            }

            path = accion + '/' + fecha + '/' + this.formPrecierre.get('sucursal').value.cveSucursal;
        }else if (accion === 2){
            this.columnsDInversiones.push('sucursal');
            path = accion + '/' + fecha + '/' + this.formPrecierre.get('sucursal').value.cveSucursal;
        
        }


        this.blockUI.start('Cargando datos...');


        this.service.getListByID(path, 'listaPrecierre').subscribe(detalle => {

            this.blockUI.stop();
            this.listaPrecierres = detalle;
            
            if(this.listaPrecierres.length > 0 && accion === 3){
                if(this.listaPrecierres[0].cerrado){
                    this.columnsDInversiones.push('acciones');
                }
            }
            
            if (this.listaPrecierres.length === 0) {
                this.mensaje = true;
            }


            this.dataSourcePrecierres = new MatTableDataSource(this.listaPrecierres);
            setTimeout(() => this.dataSourcePrecierres.paginator = this.paginator);
            this.dataSourcePrecierres.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message);
        });

    }
    

    /**
     * Metodo que realiza el proceso de precierre
     */
    aplicarPrecierre(accion:any) {

        this.titulo = '';
        
        if(!this.integreTitulo(accion)){
            return;
        }

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: this.titulo,
                body: '¿Esta seguro de realizar el proceso?'
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {

            if (result === 0) {
                let mes : any;
                let anio : any;
                let path : any;

                 mes = this.datePipe.transform(this.formPrecierre.get('fecha').value, 'M');
                 anio = this.datePipe.transform(this.formPrecierre.get('fecha').value, 'yyyy');
                
                 let diasMes = new Date(anio, mes, 0).getDate();

                 let fecha = anio+'-'+ mes +'-'+ diasMes;
     
                 path = accion + '/' + fecha + '/' +this.permisos.usuario.id +'/'+this.formPrecierre.get('sucursal').value.cveSucursal;
                

                this.blockUI.start('Procesando precierre...');

                this.service.registrarBYParametro(path, 'crudPrecierre').subscribe(result => {
                    this.blockUI.stop();

                    if (result[0][0] === '0') {

                        if(accion === 1){
                            this.spsPrecierres(2);
                        }else if(accion === 3 || accion === 2){
                            this.spsPrecierres(3);
                        }


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
     * Crea el titulo del dialog.
     * @param accion 
     * @returns true o false
     */
    integreTitulo(accion:any){

        if(accion == 1){
            this.titulo = 'Generar pre cierre consolidado';
        }else if(accion == 2){
            this.titulo = 'Generar pre cierre para: '+this.formPrecierre.get('sucursal').value.nombreSucursal;

            if (this.formPrecierre.invalid) {
                this.validateAllFormFields(this.formPrecierre);
                return false;
            }

        }else if(accion == 3){
            this.titulo = 'Abrir pre cierre';
        }

        return true;

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
     * Limpia la tabla
     */
    limpiaTabla(){
        this.mensaje = false;

        if(this.listaPrecierres.length > 0){

            this.listaPrecierres = [];
            this.dataSourcePrecierres = new MatTableDataSource(this.listaPrecierres);
        }

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
     * Lista de validaciones del formulario PEP
     */
    listaValidaciones = {
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra sucursal.' }
        ],

        "fecha": [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };

}