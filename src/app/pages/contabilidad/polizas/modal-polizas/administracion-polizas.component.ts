import { DatePipe } from "@angular/common";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { environment } from '../../../../../environments/environment';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../shared/service/gestion";


//Cuenta afectable.
const cAfectable  = environment.contabilidad.afectable; //Clave fectable


/**
* @autor: Luis Rolando Guerrero Calzada
* @version: 1.0.0
* @fecha: 06/10/2021
* @descripcion: Componente para la gestion de polizas
*/
@Component({
    selector: 'administracion-polizas',
    moduleId: module.id,
    templateUrl: 'administracion-polizas.component.html',
    styleUrls: ['administracion-polizas.component.css']
})



export class AdministracionPolizasComponent implements OnInit {
    displayedColumns: string[] = ['fecha', 'usuario', "tipo", "clave", "sucursal", "concepto", "estatus"];
    //Declaracion de variables y constantes
    titulo: string;
    numero: number;
    formMovimiento: UntypedFormGroup;
    polizasLista = []
    listaTipoPolizas = []
    listaSucursales = []
    listaCuentasContables = []
    listaMovimientos = [];
    dataSourcePolizas: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    selectedICuenta: number = 0;
    selectedISucursal: number = 0;
    opcionesCuenta: Observable<string[]>;
    opcionesSucursales: Observable<string[]>;
    fechaInicio:string;
    fechaFin:string;
    
    //PAGINADO
    totalRows = 0;
    pageSize = 10;
    currentPage = 0;
    pageSizeOptions: number[] = [10,25,100];

    //Cuenta
    tablaVisible:boolean     = false;
    isLoadingResults:boolean = false;
    isResultado:boolean      = false;

    //validacion de campos
    validaciones = {
        'cuenta': [
            { type: 'required', message: 'Cuenta contable requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra cuenta.' },
            { type: 'incluida', message: 'La cuenta contable ya fue seleccionada, elija otra.' },
            { type: 'acumulable', message: 'Seleccione una cuenta contable afectable.' }
        ],
        'referencia': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'debe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números decimales (0.00).' }
        ],
        'haber': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números decimales (0.00).' }
        ],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'start': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'end': [
            { type: 'required', message: 'Campo requerido.' },
        ]

    }

    /**
     * constructor de la clase polizas
     * @param service - service para el acceso de datos
     */
    constructor(public dialogo: MatDialogRef<AdministracionPolizasComponent>,
        private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.titulo = data.titulo
        this.numero = data.numero
        this.listaTipoPolizas = data.listaTipoPolizas
        this.listaMovimientos = data.listaMovimientos

        var datePipe = new DatePipe('en-US');
        this.fechaInicio = datePipe.transform(new Date, 'yyyy-MM-dd');
        this.fechaFin = datePipe.transform(new Date, 'yyyy-MM-dd');


        this.formMovimiento = this.formbuilder.group({
            idDestalle: new UntypedFormControl(0),
            cuenta: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            referencia: new UntypedFormControl('', [Validators.required]),
            debe: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]),
            haber: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]),
            descripcion: new UntypedFormControl('', [Validators.required]),
            start: new UntypedFormControl(new Date, [Validators.required]),
            end: new UntypedFormControl(new Date, [Validators.required]),
            sucursal: new UntypedFormControl(0),
            tipo: new UntypedFormControl(0)

        })

        //Quitar validaciones
        if (this.numero === 1){
            this.formMovimiento.get('cuenta').setValidators([]);
            this.formMovimiento.get('cuenta').updateValueAndValidity();
            this.formMovimiento.get('referencia').setValidators([]);
            this.formMovimiento.get('referencia').updateValueAndValidity();
            this.formMovimiento.get('debe').setValidators([]);
            this.formMovimiento.get('debe').updateValueAndValidity();
            this.formMovimiento.get('haber').setValidators([]);
            this.formMovimiento.get('haber').updateValueAndValidity();
            this.formMovimiento.get('descripcion').setValidators([]);
            this.formMovimiento.get('descripcion').updateValueAndValidity();
        }

        if (data.renglon !== undefined) {

            this.formMovimiento.controls['cuenta'].disable();
            this.formMovimiento.get('idDestalle').setValue(data.renglon.idDestalle);
            this.formMovimiento.get('descripcion').setValue(data.renglon.concepto);
            this.formMovimiento.get('referencia').setValue(data.renglon.ref);

            if (parseInt(data.renglon.debe) === 0) {
                this.formMovimiento.controls['debe'].disable();
            } else {
                this.formMovimiento.controls['debe'].enable();
            }
            this.formMovimiento.get('debe').setValue(data.renglon.debe)
            if (parseInt(data.renglon.haber) === 0) {
                this.formMovimiento.controls['haber'].disable();
            } else {
                this.formMovimiento.controls['haber'].enable();
            }
            this.formMovimiento.get('haber').setValue(data.renglon.haber)

        }
    }

    /**
     * Init.
     */
    ngOnInit(): void {
        this.spslistaCuentasContables();
        this.spsSucursales()
        //this.spsObtenerSucursales();
    }


    /**
    * Metodo para filtrar por cuenta id 
    */
    opcionSelectCuenta(event) {
        this.selectedICuenta = event.option.value.cuenta;
    }


  /**
   * Metodo que lista las cuentas contables AFECTABLES
   */
    spslistaCuentasContables() {
        this.service.getListByID(2, 'spsCuentasContables').subscribe(
            (data: any) => {

                this.listaCuentasContables = data

                let start = '';

                if(this.data.renglon !== undefined){
            
                    this.formMovimiento.get('cuenta').setValue(this.data.renglon.cuentaContable);
                    start = this.data.renglon.cuentaContable;

                }

                this.opcionesCuenta = this.formMovimiento.get('cuenta').valueChanges.pipe(
                    startWith(start),
                    map(value => this._filterCuenta(value))
                );
            }, error => {
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }



    /**
     * Filtra la categoria de nacionalidad
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterCuenta(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentasContables.filter(option => option.cuenta.toLowerCase().includes(filterValue));
    }


    /**
     * Muestra la descripcion de la cuenta
     * @param option --cuenta seleccionada
     * @returns --nombre de la nacionalidad
     */
    displayFnCuenta(option: any): any {
        return option ? option.cuenta + " / " + option.nombre : undefined;
    }

    registroSeleccionado(renglon) {
        this.dialogo.close(renglon);
    }

    opcionSelectSucursales(event) {
        this.selectedISucursal = event.option.value.nombreSucursal;
    }

    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

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
     * Cargar información de la siguiente página.
     * @param evento 
     */
    loadPage(evento) {

        this.tablaVisible = true;
        this.isLoadingResults = true;
        this.isResultado      = false;


        let fechaIn  = this.formMovimiento.get('start').value.toLocaleDateString().replace(/\//g, '-');
        let fechaFin = this.formMovimiento.get('end').value.toLocaleDateString().replace(/\//g, '-');
        
        let sucursalId:any;

        if (this.formMovimiento.get("sucursal").value !== 0) {
            sucursalId = this.formMovimiento.get("sucursal").value.sucursalid;
        } else {
            sucursalId= 0
        }


        this.currentPage = evento.pageIndex
        this.pageSize = evento.pageSize
        
        const ids = fechaIn + "/" +
                    fechaFin + "/" +
                    this.formMovimiento.get("tipo").value + "/" +
                    sucursalId + "/" + 
                    this.currentPage + "/" + 
                    this.pageSize;

        this.service.getListByArregloIDs(ids, 'listarPolizasFiltro').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;
            
                this.polizasLista = data;
                this.dataSourcePolizas = new MatTableDataSource(this.polizasLista);
                this.dataSourcePolizas.paginator = this.paginator;
                this.dataSourcePolizas.sort = this.sort;
                
                if (data.length > 0) {
    
                    setTimeout(() => {
                        this.paginator.pageIndex = this.currentPage;
                        this.paginator.length = Number(this.polizasLista[0].extPoliza.contador);
                    });
    
                }
                
                this.isLoadingResults = false;

            }, error => {

                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * Buscar póliza.
     */
    spsBuscarPoliza() {
        
        //Valida formulario
        if (this.formMovimiento.invalid) {
            this.validateAllFormFields(this.formMovimiento);
            return;
        }

        this.tablaVisible = true;
        this.isLoadingResults = true;
        this.isResultado      = false;


        let fechaIn  = this.formMovimiento.get('start').value.toLocaleDateString().replace(/\//g, '-');
        let fechaFin = this.formMovimiento.get('end').value.toLocaleDateString().replace(/\//g, '-');
        
        let sucursalId:any;

        if (this.formMovimiento.get("sucursal").value !== 0) {
            sucursalId = this.formMovimiento.get("sucursal").value.sucursalid;
        } else {
            sucursalId= 0
        }

        
        const ids = fechaIn + "/" +
                    fechaFin + "/" +
                    this.formMovimiento.get("tipo").value + "/" +
                    sucursalId + "/" + 
                    this.currentPage + "/" + 
                    this.pageSize;
        
        this.service.getListByArregloIDs(ids, 'listarPolizasFiltro').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;
            
                this.polizasLista = data;
                this.dataSourcePolizas = new MatTableDataSource(this.polizasLista);
                this.dataSourcePolizas.paginator = this.paginator;
                this.dataSourcePolizas.sort = this.sort;
                
                if (data.length > 0) {
    
                    setTimeout(() => {
                        this.paginator.pageIndex = this.currentPage;
                        this.paginator.length = Number(this.polizasLista[0].extPoliza.contador);
                    });
    
                }

                this.isLoadingResults = false;

            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    /**
     *Método para listar sucursales.
     */
    spsSucursales() {
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;

            this.opcionesSucursales = this.formMovimiento.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursales(value))
            );
        }, error => {
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Validaciones personalizadas
     */
    validacionesPersonalizadas(){

        //Acepta solo cuentas afectables 
        if(this.formMovimiento.get('cuenta').value.extencionCuentaContable.tipoCuenta.cveTipo != cAfectable){

            this.formMovimiento.controls['cuenta'].setErrors({acumulable:true});  
       
        }

        //valida cuenta existente.
        let index = this.listaMovimientos.findIndex(res => res.cuentaContable.cuentaid === this.formMovimiento.get('cuenta').value.cuentaid);

        if(index > -1){

             this.formMovimiento.controls['cuenta'].setErrors({incluida:true});

        }
    }

    /**
     * Agregar la cuenta contable con su detalles para
    */
     agregarCtaCont(cuenta:any) {
        
        this.validacionesPersonalizadas();

        //Valida formulario
        if (this.formMovimiento.invalid) {
            this.validateAllFormFields(this.formMovimiento);
            return;
        }
    
        //Validaciones personalizadas
        /*
        if(!this.validacionesPersonalizadas()){
            return;
        }*/

  
        this.dialogo.close(cuenta);

    }


    /**
     * Metodo igualar la contrapartida a 0
     */
    inputHaber(){

        if(this.formMovimiento.get('debe').value > 0){
            this.formMovimiento.get('haber').setValue(0);
        }

        
    }

    /**
     * Metodo igualar la contrapartida a 0
     */
    inputDebe(){


        if(this.formMovimiento.get('haber').value > 0){
            this.formMovimiento.get('debe').setValue(0);
        }

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


}