import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BuscarClientesComponent } from "../../../../app/pages/modales/clientes-modal/buscar-clientes.component";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import globales from "../../../../environments/globales.config";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";

@Component({
    selector: 'puntoVenta',
    moduleId: module.id,
    templateUrl: 'punto-de-venta.component.html'
})

/**
 * @autor: María Guadalupe Santana Olalde 
 * @descripcion: Componente para la gestión de pago de servicios y recargas telefónicas
 * @fecha: 21/09/2022
 * @version 1.0.0
 */
export class PuntoDeVentaComponent implements OnInit {

    //Declaracion de variables
    formServicios: UntypedFormGroup;
    formRecargas: UntypedFormGroup;
    columnsProduct: string[] = ['monto', 'numero', 'codigo'];
    dataSourceRecarga: MatTableDataSource<any>;
    @BlockUI() blockUI: NgBlockUI;

    //Filtro servicios 
    selectedIdServicio: number = 0;
    listaServicios: any = [];
    opcionesServicios: Observable<string[]>;
    idProducto: number;


    //Filtro clientes    
    lblCliente: string = globales.ente;
    listaCuentas: any = [];
    numSocio: string = '';

    //Cuenta
    listaTiposCuenta: any = [];
    opcionesTiposCuenta: Observable<string[]>;
    selectedIdCuenta: number = 0;

    //recargas
    listaCompanias: any = [];
    listaMontos: any = [];
    selectedMonto: number = 0;
    opcionesCompania: Observable<string[]>;
    selectedIdCompania: number = 0;
    listaEstadosNac: any = [];
    opcionesNac: Observable<string[]>;
    selectedIdEstado: number = 0;


    constructor(
        private formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        public dialog: MatDialog) {

        this.formServicios = this.formBuilder.group({
            servicio: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            referencia: new UntypedFormControl('', Validators.required),
            digitoVerif: new UntypedFormControl('', Validators.required),
            monto: new UntypedFormControl('', Validators.required),
            confMonto: new UntypedFormControl('', Validators.required),
            comision: new UntypedFormControl(''),
            total: new UntypedFormControl(''),
            usuario: new UntypedFormControl('', Validators.required),
            contrasenia: new UntypedFormControl('', Validators.required),
            numeroCliente: new UntypedFormControl(''),
            cuenta: new UntypedFormControl(''),
        });


        //Recarga
        this.formRecargas = this.formBuilder.group({
            estado: new UntypedFormControl(''),
            compania: new UntypedFormControl('', Validators.required),
            numero: new UntypedFormControl('', Validators.required),
            repNumero: new UntypedFormControl('', Validators.required),
            montoRecarga: new UntypedFormControl('', Validators.required),
            usuarioRecarga: new UntypedFormControl('', Validators.required),
            contraseniaRecarga: new UntypedFormControl('', Validators.required),
            numeroClienteRecarga: new UntypedFormControl(''),
            cuentaRecarga: new UntypedFormControl('')

        });

    }
    ngOnInit(): void {
        this.spsServicios();
        this.spsEstadoNac();
        this.spsCompanias();
    }

    /**
        * Metodo para Abrir ventana modal de clientes */
    modalClientes(ventana) {
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente'
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result != 1) {
                if (result.tipoPersona == 'F') {
                    this.numSocio = result.datosCl.numero_cliente;
                    if (ventana === 0) {
                        this.formServicios.get('numeroCliente').setValue(result.datosCl.numero_cliente);
                    } else {
                        this.formRecargas.get('numeroClienteRecarga').setValue(result.datosCl.numero_cliente);
                    }
                    this.spsCargaCuentasSaldo();

                } else {
                    //Moral
                }
            }
            if (result == 1) {
                this.formServicios.get('numeroCliente').setValue('');
            }

        });

    }

    /**
 * Muestra la descripcion del Servicio
 * @param option --servicio seleccionada
 * @returns --nombre de la servicio
 */
    displayFnServicios(option: any): any {
        return option ? option.producto : undefined;
    }

    /**
     * Metodo para filtrar por sucursal
    */
    opcionSelectServicio(event) {
        this.selectedIdServicio = event.option.value.producto;
        this.formServicios.get('comision').setValue(event.option.value.comision);
        this.spsServicios();
    }

    /**
   * Filtra la servicio
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
    private _filterServicios(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaServicios.filter(option => option.producto.toLowerCase().includes(filterValue));
    }

    /**
     * Filtro de Servicios
     */
    spsServicios() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsProductosServicios').subscribe(
            data => {
                this.blockUI.stop();
                this.listaServicios = data;
                this.opcionesServicios = this.formServicios.get('servicio').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterServicios(value))
                );
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
    }

    /**
 * Carga los saldos de los movimientos del cliente.
 * @param cveCliente 
 */
    spsCargaCuentasSaldo() {
        this.blockUI.start('Cargando datos...');
        const ids = this.numSocio + "/" + 1;
        this.service.getListByArregloIDs(ids, 'listaSaldoMovimientoByCliente').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCuentas = data

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }


    /**
    * Listar los estados activos para clientes y referencias
    */
    spsEstadoNac() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        let path = '134' + '/' + '2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            this.blockUI.stop();
            this.listaEstadosNac = JSON.parse(data[0]);
            this.opcionesNac = this.formRecargas.get('estado').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEstado(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message)
        });
    }

    /**
   * Muestra el nombre del Estado
   * @param option --estado seleccionada
   * @returns --nombre del estado 
   */
    displayFnEstado(option: any): any {
        return option ? option.nombre_estado : undefined;
    }

    /**
     * Metodo para filtrar por sucursal
    */
    opcionSelectEstado(event) {
        this.selectedIdEstado = event.option.value.nombre_estado;
        this.spsEstadoNac();
    }

    /**
   * Filtra la servicio
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
    private _filterEstado(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEstadosNac.filter(option => option.nombre_estado.toLowerCase().includes(filterValue));
    }

    /**
     * Método para cargar una lista de compañias y sus montos
     */
    spsCompanias() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsRecargaTelefonica').subscribe(
            data => {
                this.blockUI.stop();
                this.listaCompanias = data;
                this.opcionesCompania = this.formRecargas.get('compania').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCompania(value))
                );
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );

    }

    /**
* Muestra la descripcion del Servicio
* @param option --servicio seleccionada
* @returns --nombre de la servicio
*/
    displayFnCompania(option: any): any {
        return option ? option.compania : undefined;
    }

    /**
     * Metodo para filtrar por sucursal
    */
    opcionSelectCompania(event) {
        this.selectedIdCompania = event.option.value.compania;
        let montoR = JSON.parse(event.option.value.montos)
        this.listaMontos = montoR;
        this.spsCompanias();
    }

    /**
   * Filtra la servicio
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
    private _filterCompania(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCompanias.filter(option => option.compania.toLowerCase().includes(filterValue));
    }
    /**
     * Calcula el total al confirmar monto
     */
    calculaTotal() {
        let suma = (this.formServicios.get('confMonto').value +
            this.formServicios.get('comision').value);
        this.formServicios.get('total').setValue(Math.round(suma));
    }
    /**
     * Registro de servicio pagado
     * NOTA: NO hay crud en base de datos
     */
    crudServicio() {
        //Valida fomrulario
        if (this.formServicios.invalid) {
            this.validateAllFormFields(this.formServicios);
            return;
        }
        if (this.formServicios.get('monto').value != this.formServicios.get('confMonto').value) {
            this.service.showNotification('top', 'right', 1, 'Los montos son diferentes.');
            return;
        }

        //areglo que contiene los datos a guardar
        const data = {
            servicios: [
                this.formServicios.get('servicio').value,
                this.formServicios.get('referencia').value,
                this.formServicios.get('digitoVerif').value,
                this.formServicios.get('monto').value,
                this.formServicios.get('confMonto').value,
                this.formServicios.get('comision').value,
                this.formServicios.get('total').value,
                this.formServicios.get('usuario').value,
                this.formServicios.get('contrasenia').value,
                this.formServicios.get('numeroCliente').value,
                this.formServicios.get('cuenta').value
            ]
        };

        this.service.showNotification('top', 'right', 2, 'Sin Servicio.');
        /*//uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, '').subscribe(resultado => {
            this.blockUI.start('Guardando ...');
            if (resultado[0][0] === '0') {//exito    
                
                //Se cierra el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error    
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });*/


    }

    /**
        * Registro de recargas realizadas
        * NOTA: NO hay crud en base de datos
        */
    crudRecargas() {
        //Valida fomrulario
        if (this.formRecargas.invalid) {
            this.validateAllFormFields(this.formRecargas);
            return;
        }


        //areglo que contiene los datos a guardar
        const data = {
            recarga: [
                this.formRecargas.get('compania').value,
                this.formRecargas.get('montoRecarga').value,
                this.formRecargas.get('numero').value,
                this.formRecargas.get('repNumero').value,
                this.formRecargas.get('estado').value,
                this.formRecargas.get('usuarioRecarga').value,
                this.formRecargas.get('contraseniaRecarga').value,
                this.formRecargas.get('numeroClienteRecarga').value,
                this.formRecargas.get('cuentaRecarga').value
            ]
        };

        this.service.showNotification('top', 'right', 2, 'Sin Servicio.');
        /*//uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, '').subscribe(resultado => {
            this.blockUI.start('Guardando ...');
            if (resultado[0][0] === '0') {//exito    
                
                
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error  
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
            //Se cierra el loader
                this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });*/


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
    /*Validaciones de los campos del formulario.
    * Se crean los mensajes de validación.
    */
    validaciones = {
        'servicio': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El servicio no pertenece a la lista, elija otro servicio.' }
        ],
        'referencia': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'digitoVerif': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'monto': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'confMonto': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'usuario': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'contrasenia': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'compania': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'contrascompaniaenia': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'numero': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'repNumero': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'montoRecarga': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'usuarioRecarga': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'contraseniaRecarga': [
            { type: 'required', message: 'Campo requerido.' }
        ],


    };
}

