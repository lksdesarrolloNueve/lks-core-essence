import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";
import { CuentaContableModalComponent } from "../../modales/cuentacontable-modal/buscar-cuentacontable.component";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { PermisosService } from "../../../shared/service/permisos.service";



@Component({
    selector: 'conciliacion-bancaria',
    moduleId: module.id,
    templateUrl: 'conciliacion-bancaria.component.html',
    styleUrls: ['conciliacion-bancaria.component.css']
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 
 * @descripcion: Componente para la gestion de conciliacion bancaria 
 */
export class ConciliacionBancariaComponent implements OnInit {

    totalRows = 0;
    pageSize = 10;
    currentPage = 0;
    pageSizeOptions: number[] = [10, 25, 100];

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['fechaHora', 'descripcion', 'claveMovimiento', 'beneficiario', 'concepto',
        'debe', 'haber', 'transito'];
    dataSourceCuentaBancaria: MatTableDataSource<any>;
    listaCuentaBancaria: any;
    accion: number;
    titulo: string;
    selectedId: number;
    selectedIdTC: number;
    formConciliacion: UntypedFormGroup;
    mostrar: boolean = false;
    editable: boolean = false;
    dataSourceSaldoCuenta: MatTableDataSource<any>;
    listaSaldoCuentaBancaria: any;
    /**Controles sucursales*/
    listaSucursales: any;
    opcionesSucursal: Observable<string[]>;
    sucursal = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });

    /**Controles tipoCuenta*/
    listaTipoCuenta: any;
    opcionesTCuenta: Observable<string[]>;
    tipocuenta = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });

    /**Controles clave cuenta*/
    listaClaveCuenta: any;
    opcionesClave: Observable<string[]>;
    ClaveCuenta = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });

    /**Controles cuenta bancaria*/
    listaCuentaBanco: any;
    opcionesCuentaBancOri: Observable<string[]>;
    cuentaBancOri = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });

    //saldoDeposito
    saldoInicial = 0;
    saldoDeposito = 0;
    saldoRetiro = 0;
    saldoChTransito = 0;
    saldoFinal = 0;
    //Generar poliza datos
    fechaIn: string = "";
    fechaFin: string = "";
    idCuentaB: number = 0

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    isLoadingResults = true;
    isResultado = false;
     //Formulario. 
     range: UntypedFormGroup;

    /**
     * 
     * @param service service para el acceso de datos 
     */

    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, private servicePermisos: PermisosService, public dialog: MatDialog) {
        this.formConciliacion = this.formBuilder.group({
            sucursal: new UntypedFormControl('', [Validators.required]),
            tipoCuenta: new UntypedFormControl('', [Validators.required]),
            saldoInicial: new UntypedFormControl(),
            saldoDeposito: new UntypedFormControl(),
            saldoRetiro: new UntypedFormControl(''),
            saldoChTransito: new UntypedFormControl(''),
            saldoFinal: new UntypedFormControl(''),
        });

        this.range = this.formBuilder.group({
            start:  new UntypedFormControl(new Date, [Validators.required]),
            end:    new UntypedFormControl(new Date, [Validators.required]),
        });
    }

    /** Creación del arreglo para implementar las validaciones **/
    validaciones = {
        'sucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra.' },
        ],

        'tipoCuenta': [
            { type: 'required', message: 'Campo requerido.' },
        ],

        'start': [
            { type: 'matStartDateInvalid', message: 'Fecha incio erronea.' },
            { type: 'required', message: 'Fecha inicial requerida.' }
        ],
        'end': [
            { type: 'matEndDateInvalid', message: 'Fecha final erronea.' },
            { type: 'required', message: 'Fecha final requerida.' }
        ],

        'cuentaBancOri': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta no pertenece a la lista, elija otra.' }
        ]

        
    }

        /**
       * Valida que el texto ingresado pertenezca a un estado
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

    ngOnInit() {
        this.spsSucursales();
        this.spsTipoCuenta();
    }

    /**
    * Metodo para listar las sucursales
    * 
    */
    spsSucursales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsSucursalesTsr').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursal = this.formConciliacion.get("sucursal").valueChanges.pipe(
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
* Filtra la categoria
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filter(value: any): any[] {
        const filterValue = value;
        this.mostrar = false;
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    //metodo para filtrar en el listado obtenido de base de datos
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCuentaBancaria.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCuentaBancaria.paginator) {
            this.dataSourceCuentaBancaria.paginator.firstPage();
        }
    }

    //obtiene el id de la sucursal selecionada
    opcionSeleccionada(event) {
        this.selectedId = event.option.value.sucursalid;
    }
    //obtiene el id de la sucursal selecionada
    opcionSucursal() {
        this.mostrar = false;
        this.formConciliacion.get('tipoCuenta').setValue('');
        this.cuentaBancOri.setValue('');
    }
    /**
     * Muestra la descripcion de la sucursal
     * @param option --estado seleccionada
     * @returns --nombre sucursal
     */
    displayFn(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    /**
    * Metodo para listar los tipos de cuenta
    * 
    */
    spsTipoCuenta() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('07CB', 'spsGeneralesCatTsr').subscribe(data => {
            this.listaTipoCuenta = data;
            this.opcionesTCuenta = this.tipocuenta.valueChanges.pipe(
                startWith(''),
                map(value => this._filterTCuenta(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo para listar los tipos de cuenta
    * 
    */
    spsClaveCuenta() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('07CB', 'spsGeneralesCatTsr').subscribe(data => {
            this.listaClaveCuenta = data;
            this.opcionesClave = this.ClaveCuenta.valueChanges.pipe(
                startWith(''),
                map(value => this._filterTCuenta(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Activa div de acuerdo al tipo de movimiento
    * @param event 
    */
    opcionSeleccionadaTipoCuenta(event) {
        //limpiar campos
        this.mostrar = false;
        this.cuentaBancOri.setValue('');
        //conuslta nuevos datos
        let sucursalId = this.formConciliacion.get('sucursal').value.sucursalid;
        this.spsCuentaBancariaID(sucursalId, event.value.generalesId);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
    * Metodo para listar cuenta bancaria
    * 
    */
    spsCuentaBancaria() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCuentaBancariaTsr').subscribe(data => {

            this.listaCuentaBanco = data;
            this.opcionesCuentaBancOri = this.cuentaBancOri.valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaBanco(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterTCuenta(value: any): any[] {
        const filterValue = value;
        return this.listaTipoCuenta.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * Muestra la descripcion de los tipos de cuenta
     * @param option --tipo cuenta seleccionada
     * @returns -- descripcion del tipo de cuenta
     */
    displayFnTCuenta(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
* Muestra la descripcion de la sucursal
* @param option --Sucursal
* @returns --nombre sucursal
*/
    displaySucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    /**
   * Metodo para listar cuenta bancaria
   * 
   */
    spsCuentaBancariaID(sucursal: any, tipocuenta: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCuentaBancariaTsr').subscribe(
            (data: any) => {
                this.listaCuentaBanco = data.filter((result: any) => result.tipoCuentaId === tipocuenta && result.sucursalId === sucursal);
                this.opcionesCuentaBancOri = this.cuentaBancOri.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCuentaBanco(value))
                );
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });
    }

    /**
    * Filtra la cuenta bancaria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaBanco(value: any): any[] {
        let filterValue = value;
        this.mostrar = false;
        return this.listaCuentaBanco.filter(cuentaBO => cuentaBO.claveCuenta.toLowerCase().includes(filterValue));
    }

    /**
     * Muestra clave cuenta banco
     * @param cuentaBanco --tipo cuenta seleccionada
     * @returns -- descripcion del tipo de cuenta
     */
    displayCuentaBancOri(cuentaBanco: any): any {
        return cuentaBanco ? cuentaBanco.claveCuenta : undefined;
    }

    /**
     * Cuenta bancaria seleccionada
     */
    opcionSeleccionadaCuenta(event) {
        this.mostrar = false;
    }


    /**
     * Cuenta bancaria seleccionada
     */
    fechaI: string;
    fechaF: string;
    opcionSeleccionadaCuentaID(event) {
        if (this.formConciliacion.invalid) {
            this.validateAllFormFields(this.formConciliacion);
            return;
        }
        //VALIDAR FORMULARIO
        if (this.range.invalid) {
            this.validateAllFormFields(this.range);
            return;
        }

        this.fechaI = this.range.get('start').value.toLocaleDateString();
        this.fechaF = this.range.get('end').value.toLocaleDateString();
        let fechaIn = this.fechaI.replace(/\//g, '-');
        let fechaFin = this.fechaF.replace(/\//g, '-');
        let idCuentaB = this.cuentaBancOri.value.cuentaBancariaID;
        this.spsMovCuenta(idCuentaB, fechaIn, fechaFin, this.currentPage, this.pageSize);
        
    }

/**
 * Metodo para cargar tabla de movimientos
 */
    spsMovCuenta(cuentaBancariaID: number, fechaInicio: string, fechaFinal: string, page: number, size: number) {
        let path = cuentaBancariaID + '/' + fechaInicio + '/' + fechaFinal + '/' + page + '/' + size;
        this.isLoadingResults = true;
        this.isResultado      = false;
        this.service.getListByID(path, 'spsMovCuentaBancariaTsr').subscribe(
            data => {
                this.listaCuentaBancaria = data;
                if(this.listaCuentaBancaria.length > 0){
                this.dataSourceCuentaBancaria = new MatTableDataSource(this.listaCuentaBancaria);
                this.dataSourceCuentaBancaria.paginator = this.paginator;
                this.dataSourceCuentaBancaria.sort = this.sort;
                setTimeout(() => {
                    this.paginator.pageIndex = this.currentPage;
                    this.paginator.length = Number(data[0].totalRegistro);
                });
                //MUESTRA LA TABLA
                this.mostrar = true;
                this.spsSaldoCuenta(cuentaBancariaID,fechaInicio,fechaFinal);
                }
                this.isLoadingResults = false;
            }, error => {
                //se detiene el loade
                this.mostrar = false;
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

    }

    // metodo para consultar los saldos de cuenta bancaria
    spsSaldoCuenta(cuentaBancariaID: number, fechaInicio: string, fechaFinal: string) {
        this.isLoadingResults = true;
        this.isResultado      = false;
        let path = cuentaBancariaID + '/' + fechaInicio + '/' + fechaFinal;
        this.service.getListByID(path, 'spsSaldoCuentaBancariaTsr').subscribe(
            data => {
                //MUESTRA LA TABLA
                this.saldoInicial = data[0].saldoInicial;
                this.saldoDeposito = data[0].deposito;
                this.saldoRetiro = data[0].retiro;
                this.saldoChTransito = data[0].chequeTransito;
                this.saldoFinal = data[0].saldoFinal;
                this.mostrar = true;
                this.isLoadingResults = false;
            }, errorSaldo => {
                this.mostrar = false;
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, errorSaldo.Message);
            }
        )

    }

    /**
     * Valida cada atributo del formulario
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
    * Abrir ventana modal de confirmacion
    * */
    abrirDialogo() {
        let idCuentaContable = this.cuentaBancOri.value.cuentaContableId;

        const dialogRef = this.dialog.open(CuentaContableModalComponent, {
            width: '50%',
            data:{
                idCuenta:idCuentaContable
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let idCuentaConta = result.cuentaid;
                //generar poliza
                this.generaPolizaConciliada(idCuentaConta);
            }
        });

    }

    //Metodo para cargar los datos por pagina
    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.fechaI = this.range.get('start').value.toLocaleDateString();
        this.fechaF = this.range.get('end').value.toLocaleDateString();
        let fechaIn = this.fechaI.replace(/\//g, '-');
        let fechaFin = this.fechaF.replace(/\//g, '-');
        let idCuentaB = this.cuentaBancOri.value.cuentaBancariaID;
        this.spsMovCuenta(idCuentaB, fechaIn, fechaFin, this.currentPage, this.pageSize)
    }

    //Metodo para generar poliza de conciliacion
    generaPolizaConciliada(idCuenta) {
        this.fechaI = this.range.get('start').value.toLocaleDateString();
        this.fechaF = this.range.get('end').value.toLocaleDateString();

        this.fechaIn = this.fechaI.replace(/\//g, '-');
        this.fechaFin = this.fechaF.replace(/\//g, '-');
        this.idCuentaB = this.cuentaBancOri.value.cuentaBancariaID;

        this.blockUI.start('Guardando Poliza...');
        const data = {
            "fechaInicial": this.fechaIn,
            "fechaFinal": this.fechaFin,
            "cuentaBancariaId": this.idCuentaB,
            "cuentaContableId": idCuenta,
            "sucursalId": this.servicePermisos.sucursalSeleccionada.sucursalid,
            "usuarioId": this.servicePermisos.usuario.id
        }

        this.service.registrar(data, 'spGeneraPolizaConciliada').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        )

    }

}