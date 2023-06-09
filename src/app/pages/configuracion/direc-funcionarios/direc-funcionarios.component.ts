import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { MatDialog } from "@angular/material/dialog";
import { AdminBajaComponent } from "./modal-baja/admin-baja.component";
import { trim } from "jquery";
import { globales } from "../../../../environments/globales.config";
import { environment } from "../../../../environments/environment";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";

@Component({
    selector: 'direc-funcionarios',
    moduleId: module.id,
    templateUrl: 'direc-funcionarios.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 
 * @descripcion: Componente para la gestion de direccion funcionarios
 */
export class DirecFuncionariosComponent implements OnInit {

    //Declaracion de variables y Controles
    displayedColumns: string[] = ['cargo', 'estatus'];
    listaCargos: [];
    dataSourceCargos: MatTableDataSource<any>;
    //Declaracion de variables
    titulo: string;
    accion: number;
    sujetoID: number = 0;
    clienteID: number = 0;
    direcFunID: number = 0;
    selectedId: number;
    @BlockUI() blockUI: NgBlockUI;
    formDirectivoFuncionario: UntypedFormGroup;

    listaSujetosSucursal: [];
    isSlideCheckedEstatus: boolean = false;
    listaDomicilioArreglo = [];

    listaMostrar = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    listaCargosDirectivos = [];
    listaDirectivoCargoCliente = [];
    estatusCargo = [];
    listaEstatusCargo: any[];


    /** Controles Sucursal**/
    selectedIdSucursal: number = 0;
    selectedIdSucCliente: number = 0;
    listaSucursal: any[];
    opcionesSucursal: Observable<string[]>;
    sucursalId: number;
    /** Fin Controles Sucursal */

    /** Controles Fraccion */
    selectedIdFraccion: number = 0;
    listaFraccion: any[];
    opcionesFraccion: Observable<string[]>;
    fraccionId: number;
    /** Fin controles fraccion*/

    /** Controles Cliente**/
    selectedIdCliente: number = 0;
    nombresS: any;
    apellidoPaternoS: any;
    apellidoMaternoS: any;
    vnumeroCliente: string;
    listaCliente: any[];
    listaInformacionSujeto: any[];
    opcionesCliente: Observable<string[]>;
    clienteId: number;
    /** Fin Controles Cliente */

    /** Controles Cargo**/
    selectedDescripcion: number = 0;
    selectedIdCargo: number = 0;
    listaCargo: any[];
    opcionesCargo: Observable<string[]>;
    cargoId: number;
    /** Fin Controles Cargo */

    dataSourceMovimientoCajas: MatTableDataSource<any>;


    //Variables Chips formas de pago y tipos socios
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];


    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;


    //Botones boolean
    showGuardar: boolean = true;

    /**
     * Constructor de la clase MovimientosCajaComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog, private fomrBuilder: UntypedFormBuilder) {


        this.formDirectivoFuncionario = this.fomrBuilder.group({

            //Validators directivos funcionarios
            numeroClientefiltro: new UntypedFormControl('', [Validators.required]),
            catSucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            numeroCliente: new UntypedFormControl({ value: '', disabled: true }),
            nombres: new UntypedFormControl({ value: '', disabled: true }),
            apellidoPaterno: new UntypedFormControl({ value: '', disabled: true }),
            apellidoMaterno: new UntypedFormControl({ value: '', disabled: true }),
            fechaNacimiento: new UntypedFormControl({ value: '', disabled: true }),
            rfc: new UntypedFormControl({ value: '', disabled: true }),
            curp: new UntypedFormControl({ value: '', disabled: true }),
            //Validators directivos funcionarios
            observaciones: new UntypedFormControl('', [Validators.required]),
            catCargo: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catFraccion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            fechaInicioC: new UntypedFormControl('', [Validators.required]),
            fechaCalificaF: new UntypedFormControl('', [Validators.required])
        });
    }


    /**
     * metodo OnInit de la clase MovimientosCaja para iniciar las listas
     */
    ngOnInit() {
        this.nuevoRegistro();
        this.spsSucursal();
        this.spsCargo();
        this.spsFraccion();


    }

    /**
     * 
     * @param accion 
     */
    abrirAdminBaja(elemento, datos) {

        if (elemento.checked === false) {
            const dialogoRef = this.dialog.open(AdminBajaComponent, {
                width: '40%',
                data: {
                    accion: 2,
                    listaCargos: datos,
                    estado: elemento.checked
                }
            })
            //Este se usa para que cuando cerramos
            dialogoRef.afterClosed().subscribe(result => {
                this.spsSucursal();
            });
        } else if (elemento.checked === true) {
            const dialogoRef = this.dialog.open(AdminBajaComponent, {
                width: '40%',
                data: {
                    accion: 1,
                    listaCargos: datos,
                    estado: elemento.checked
                }
            })
            //Este se usa para que cuando cerramos
            dialogoRef.afterClosed().subscribe(result => {
                this.spsSucursal();
                this.spslistaCargo();
            });
        }

    }

    /**
    * Método que lista los registros de inpc
    */

    spslistaCargo() {
        let path: any;
        path = this.clienteID + '/' + 1
        this.service.getListByID(path, 'listaDirectivoFuncionarioById').subscribe(
            (data) => {
                this.listaCargos = data;
                this.dataSourceCargos = new MatTableDataSource(this.listaCargos);
                this.dataSourceCargos.paginator = this.paginator;
                this.dataSourceCargos.sort = this.sort;
            }, error => {
                this.service.showNotification('top', 'right', 4, error);
            });
    }

    /**
     * Metodo para filtrar INPC
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCargos.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCargos.paginator) {
            this.dataSourceCargos.paginator.firstPage();
        }
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



    //INICIO AUTOCOMPLETE SUCURSAL
    /**
   * Muestra la descripcion de la Sucursal
   * @param option --Sucursal seleccionada
   * @returns --nombre de la Sucursal
   */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    /**
     * Metodo para filtrar por sucursal
    */
    opcionSelectSucursal(event) {
        this.selectedIdSucursal = event.option.value.nombreSucursal;
        this.selectedIdSucCliente = event.option.value.sucursalid
        //this.spsCliente();
        this.spsSujetoSucursal();
    }

    /**
    * Filtra la categoria de Sucursal
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursal(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSucursal.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    //Metodo para obtener la sucursal
    spsSucursal() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaSucursales').subscribe(data => {
            this.listaSucursal = data;
            this.opcionesSucursal = this.formDirectivoFuncionario.get('catSucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    //FIN AUTOCOMPLETE SUCURSAL

    //Método para obtener la fraccion
    spsFraccion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catFraccion, 'listaGeneralCategoria').subscribe(data => {
            this.listaFraccion = data;
            this.opcionesFraccion = this.formDirectivoFuncionario.get('catFraccion').valueChanges.pipe(
                startWith(''),
                map(value => this.filtroReporte(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        })
    }
    private filtroReporte(value: string): any {
        const filterValue = value;

        return this.listaFraccion.filter(data => data.descripcion.toLowerCase().includes(filterValue));
    }

    displayFn(fraccion: any): string {
        return fraccion && fraccion.descripcion ? fraccion.descripcion : '';
    }

    //Método para filtrar por Fracción
    opcionSelectFraccion(event) {
        this.selectedIdFraccion = event.option.value.generalesId;
    }

    //INICIO AUTOCOMPLETE CLIENTES
    /**
       * Muestra la descripcion de la Cliente
       * @param option --Cliente seleccionada
       * @returns --nombre del cliente
       */
    displayFnCliente(option: any): any {
        return option ? option.sujeto.nombres : undefined;
    }

    /**
     * Metodo para filtrar por cliente
    */
    opcionSelectCliente(event) {
        this.selectedIdCliente = event.option.value.sujeto.sujetoId;

        this.nombresS = event.option.value.sujeto.nombres;
        this.apellidoPaternoS = event.option.value.sujeto.apellidoPaterno;
        this.apellidoMaternoS = event.option.value.sujeto.apellidoMaterno;
        this.spsDirectivoSujetoByIdGeneral();
    }

    /**
    * Filtra la categoria de Sucursal
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCliente(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCliente.filter(option => option.sujeto.nombres.toLowerCase().includes(filterValue));
    }




    // Filtrado por sucursal para obtener los clientes
    /*spsCliente() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        let path: any;
        path = this.selectedIdSucursal + '/' + globales.cveSocioFisico + '/' + 2
        this.service.getListByID(path, 'listaClientes').subscribe(data => {
            this.listaCliente = data;
            this.opcionesCliente = this.formDirectivoFuncionario.get('catCliente').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCliente(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }*/
    //FIN AUTOCOMPLETE CLIENTES


    //INICIO AUTOCOMPLETE CARGOS
    /**
       * Muestra la descripcion del CARGO
       * @param option --Catrgo seleccionado
       * @returns --nombre del cargo
       */
    displayFnCargo(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
     * Metodo para filtrar por cargos
    */
    opcionSelectCargo(event) {
        this.selectedDescripcion = event.option.value.descripcion;
        this.selectedIdCargo = event.option.value.fracc_cargo_id;

    }

    /**
    * Filtra los cargos
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCargo(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCargo.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    // Metodo para obtener el autocomplete de cargos
    spsCargo() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(1, 'listaCargos').subscribe(data => {
            //Validación campos domicilio
            data.forEach((respuesta) => {
                this.listaCargosDirectivos.push(JSON.parse(respuesta.cargo));

            });

            // Recorremos la lista identificaciones para formar la matriz y guardarla en listaDomiciliosSeleccionados
            this.listaCargosDirectivos.forEach(element => {
                if (element !== null) {
                    element.forEach((element2) => {
                        let objeto = {
                            'fracc_cargo_id': element2.fracc_cargo_id,
                            'cve_fracc_cargo': element2.cve_fracc_cargo,
                            'descripcion': trim(element2.descripcion)
                        };
                        this.listaDirectivoCargoCliente.push(objeto);
                    })
                }
            });

            this.listaCargo = this.listaDirectivoCargoCliente;
            this.opcionesCargo = this.formDirectivoFuncionario.get('catCargo').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCargo(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    //FIN AUTOCOMPLETE CARGOS

    /**
     * Metodo para guardar un nuevo cargo
     */
    guardarCargo(accion): void {

        if (this.formDirectivoFuncionario.invalid) {
            this.validateAllFormFields(this.formDirectivoFuncionario);
            return;
        }

        this.blockUI.start('Guardando ...');
        const data = {
            "datos": [
                this.direcFunID,
                this.formDirectivoFuncionario.get('fechaInicioC').value,
                this.formDirectivoFuncionario.get('fechaCalificaF').value,
                null,
                null,
                true,
                this.formDirectivoFuncionario.get('observaciones').value,
                null,
                this.selectedIdCargo,
                this.clienteID,
                this.selectedIdSucCliente,
                this.sujetoID,
                this.selectedIdFraccion
            ],
            "accion": accion
        };

        /**
         * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
         * de acuerdo al tipo de accion al que pertenezca.
         */
        this.service.getListByObjet(data, 'crudDirectivoFuncionario').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.spsSujetoSucursal();
                    this.nuevoRegistro();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error)
            }

        )
    }

    /**
     * Carga todos los combos y resetea el form
     */
    nuevoRegistro() {
        this.listaCargos = [];
        this.listaCargo = [];
        this.listaFraccion = [];
        this.spslistaCargo();
        this.spsFraccion();
        this.listaSujetosSucursal = [];
        this.formDirectivoFuncionario.reset();
        this.showGuardar = true;
        this.vnumeroCliente = "";
        this.nombresS = "";
        this.apellidoPaternoS = "";
        this.apellidoMaternoS = "";

    }

    /**
     * Bloque de Validaciones
     */
    validaciones = {

        //Validación campos relacion de cargos
        'catSucursal': [
            { type: 'required', message: 'Sucursal requerida.' },
            { type: 'autocompleteObjectValidator', message: 'La sucursal no existe, seleccione otro registro.' }
        ],
        'numeroClientefiltro': [
            { type: 'required', message: 'Cliente requerida.' }
        ],
        'catCargo': [
            { type: 'required', message: 'Cargo requerida.' },
            { type: 'autocompleteObjectValidator', message: 'El cargo no existe, seleccione otro registro.' }
        ],
        'catFraccion': [
            { type: 'required', message: 'Fracción requerida.' },
            { type: 'autocompleteObjectValidator', message: 'La fracción no existe, seleccione otro registro.' }
        ],
        'fechaInicioC': [
            { type: 'required', message: 'Fecha requerida.' }
        ],
        'fechaCalificaF': [
            { type: 'required', message: 'Fecha requerida.' }
        ],
        'observaciones': [
            { type: 'required', message: 'Observación requerida.' }
        ]
    };

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
    * Metodo que consulta sujeto por sucursal
    */
    spsSujetoSucursal() {
        this.blockUI.start('Cargando datos...');
        let path: any;
        path = this.selectedIdSucCliente + '/' + 1
        this.service.getListByID(path, 'listaDirectivoSucursalById').subscribe(data => {
            this.blockUI.stop();
            this.listaSujetosSucursal = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }



    /**
* Filtrado de  sujetos por id
*/
    spsDirectivoSujetoByIdGeneral() {
        this.blockUI.start('Cargando datos...');

        let path = this.vnumeroCliente + '/' + 0 + '/' + 1 + '/' + 0 + '/' + 1;

        this.service.getListByID(path, 'listaClientes').subscribe(
            data => {
                this.blockUI.stop();

                this.sujetoID = data[0].sujeto.sujetoId;
                this.clienteID = data[0].cliente.clienteId;
                // //Datos Directivos funcionarios

                this.formDirectivoFuncionario.get('numeroClientefiltro').setValue(data[0].cliente.numeroCliente);
                this.formDirectivoFuncionario.get('numeroCliente').setValue(data[0].cliente.numeroCliente);
                this.formDirectivoFuncionario.get('nombres').setValue(data[0].sujeto.nombres);
                this.formDirectivoFuncionario.get('apellidoPaterno').setValue(data[0].sujeto.apellidoPaterno);
                this.formDirectivoFuncionario.get('apellidoMaterno').setValue(data[0].sujeto.apellidoMaterno);
                this.formDirectivoFuncionario.get('fechaNacimiento').setValue(data[0].sujeto.fechaNacimiento);
                this.formDirectivoFuncionario.get('rfc').setValue(data[0].sujeto.rfc);
                this.formDirectivoFuncionario.get('curp').setValue(data[0].sujeto.curp);
                this.spsFraccion();
                this.spslistaCargo();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    /**
* Filtrado de  sujetos por id
*/
    spsDirectivoSujetoById(elemento: any) {
        this.blockUI.start('Cargando datos...');

        let path = elemento + '/' + 1;
        this.service.getListByID(path, 'listaDirectivoSujetoById').subscribe(
            data => {
                this.blockUI.stop();
                this.clienteID = data[0].clienteID.clienteId;
                this.sujetoID = data[0].sujetoID.sujetoId;

                // //Datos Directivos funcionarios
                this.formDirectivoFuncionario.get('numeroCliente').setValue(data[0].clienteID.numeroCliente);
                this.formDirectivoFuncionario.get('nombres').setValue(data[0].sujetoID.nombres);
                this.nombresS = data[0].sujetoID.nombres;
                this.formDirectivoFuncionario.get('apellidoPaterno').setValue(data[0].sujetoID.apellidoPaterno);
                this.formDirectivoFuncionario.get('apellidoMaterno').setValue(data[0].sujetoID.apellidoMaterno);
                this.formDirectivoFuncionario.get('fechaNacimiento').setValue(data[0].sujetoID.fechaNacimiento);
                this.formDirectivoFuncionario.get('rfc').setValue(data[0].sujetoID.rfc);
                this.formDirectivoFuncionario.get('curp').setValue(data[0].sujetoID.curp);
                this.spsFraccion();
                this.spslistaCargo();
                this.showGuardar = false;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
    * Metodo para Abrir ventana modal de clientes */
    modalClientes() {
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
                    this.vnumeroCliente = result.datosCl.numero_cliente.trim();
                    this.nombresS = result.datosCl.nombre_cl;
                    this.apellidoPaternoS = result.datosCl.paterno_cl;
                    this.apellidoMaternoS = result.datosCl.materno_cl;

                    this.spsDirectivoSujetoByIdGeneral();
                } else {
                    //Moral
                }
            }
            if (result == 1) {
                //this.numeroCliente.setValue('');
            }

        });

    }


}