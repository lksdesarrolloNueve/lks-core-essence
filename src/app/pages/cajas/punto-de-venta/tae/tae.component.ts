import { Component, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";

@Component({
    selector: 'tae',
    moduleId: module.id,
    templateUrl: 'tae.component.html',
    providers: [
        {
          provide: STEPPER_GLOBAL_OPTIONS,
          useValue: {showError: true},
        },
      ],
})

/**
 * @autor: Juan Eric Juarez Jaramillo
 * @descripcion: Componente para la gestión de recargas telefónicas
 * @fecha: 15/05/2023
 * @version 1.0.0
 */
export class TAEComponent implements OnInit {

    //Declaracion de variables
    formFirstRecargas: UntypedFormGroup;
    formSecondRecargas: UntypedFormGroup;


    columnsProduct: string[] = ['monto', 'numero', 'codigo'];
    dataSourceRecarga: MatTableDataSource<any>;
    @BlockUI() blockUI: NgBlockUI;

    //Clave sucursal sesión.
    vCveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

    idProducto: number;

    lblCompania: string = "";
    lblNumero: string = "";
    lblMonto: number = 0;
    varValidacionFirst: boolean = false;
    varValidacionSecond: boolean = false;



    //listaMovCaja
    listaMovCaja: any = [];

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
        private servicePermisos: PermisosService,
        private dialog: MatDialogRef<TAEComponent>) {
        //Recarga
        this.formFirstRecargas = this.formBuilder.group({
            compania: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            numero: new UntypedFormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]*')]),
            repNumero: new UntypedFormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]*')]),
            montoRecarga: new UntypedFormControl('', Validators.required)
        });

        this.formSecondRecargas = this.formBuilder.group({
            estado: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            usuarioRecarga: new UntypedFormControl('', [Validators.required, Validators.maxLength(6), Validators.pattern('[0-9]*')]),
            contraseniaRecarga: new UntypedFormControl('', Validators.required)
        });

    }
    ngOnInit(): void {
        this.spsEstadoNac();
        this.spsCompanias();
        this.spsMovimientosCaja();
    }


    /**
     * Metodo que consulta los Movimientos Cajas
     */
    spsMovimientosCaja() {

        this.blockUI.start('Cargando datos...');
        let path = "0006" + '/' + 4;
        this.service.getListByID(path, 'listaMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaMovCaja = data;

            if (this.listaMovCaja.length === 0) {
                this.dialog.close();
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }

    /**
    * Listar los estados activos para clientes y referencias
    */
    spsEstadoNac() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        let path = '133' + '/' + '2';
        this.service.getListByID(path, 'spsEstadosNacionalidad').subscribe(data => {
            this.blockUI.stop();
            this.listaEstadosNac = JSON.parse(data[0]);
            this.opcionesNac = this.formSecondRecargas.get('estado').valueChanges.pipe(
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
                this.opcionesCompania = this.formFirstRecargas.get('compania').valueChanges.pipe(
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
        this.lblCompania = event.option.value.compania;
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
        * Registro de recargas realizadas
        * NOTA: NO hay crud en base de datos
        */
    crudRecargas() {

        //Valida fomrulario
        if (this.formFirstRecargas.invalid) {
            this.validateAllFormFields(this.formFirstRecargas);
            this.varValidacionFirst = true;
            return;
        }

        //Valida fomrulario
        if (this.formSecondRecargas.invalid) {
            this.validateAllFormFields(this.formSecondRecargas);
            this.varValidacionSecond = true;
            return;
        }

        if (!this.validacionesPersonalizadas()) {
            this.varValidacionFirst = true;
            return;
        }


        //areglo que contiene los datos a guardar
        const data = {
            recarga: {
                compania: this.formFirstRecargas.get('compania').value,
                montoRecarga: this.formFirstRecargas.get('montoRecarga').value,
                numero: this.formFirstRecargas.get('numero').value,
                estado: this.formSecondRecargas.get('estado').value,
                usuario: this.formSecondRecargas.get('usuarioRecarga').value,
                contrasenia: this.formSecondRecargas.get('contraseniaRecarga').value
            },
            mov: this.listaMovCaja[0]
        };


        let jsonLogin = {
            "cadena": 5000,
            "establecimiento": 11678,
            "terminal": 32424,
            "cajero": 39326,
            "clave": "F#(/G0@dwZ",
            //"cajero":this.formRecargas.get('usuarioRecarga').value,
            //"clave": this.formRecargas.get('contraseniaRecarga').value
        };

        this.blockUI.start('Validando datos...');
        this.service.registrar(jsonLogin, 'loginMTC').subscribe(respLogin => {
            this.blockUI.stop();

            if (respLogin.codigoRespuesta === 0) {
                let reqSaldo = {
                    token: respLogin.token,
                    tokenType: respLogin.token_type
                }
                this.blockUI.start('Validando datos...');
                this.service.registrar(reqSaldo, 'saldoTAE').subscribe(respSaldo => {
                    this.blockUI.stop();
                    if (respSaldo.codigo_respuesta === 0) {
                        if(respSaldo.saldo > this.formFirstRecargas.get('montoRecarga').value.monto){
                            this.dialog.close(data);
                        }else{
                            this.service.showNotification('top', 'right', 3, "Sin saldo suficiente, contacte al tesorero.");
                        }
                        

                    } else {
                        this.service.showNotification('top', 'right', 3, respSaldo.descripcion_respuesta);
                    }

                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error);
                });

            } else {
                this.service.showNotification('top', 'right', 3, respLogin.mensajeRespuesta);
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
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

    /**
     * Método para validaciones personalizadas.
     */
    public validacionesPersonalizadas() {


        //Validacion Saldo insuficiente
        if (this.formFirstRecargas.get('numero').value !== this.formFirstRecargas.get("repNumero")?.value) {
            this.formFirstRecargas.controls['repNumero'].setErrors({ noCoincide: true });
            return false;
        }


        return true;

    }

    setMonto(monto){
        this.lblMonto= monto.monto;
    }

    /*Validaciones de los campos del formulario.
    * Se crean los mensajes de validación.
    */
    validaciones = {
        'compania': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La compañía no pertenece a la lista, elija otro.' }
        ],
        'estado': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El Estado no pertenece a la lista, elija otro.' }
        ],
        'contrascompaniaenia': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'numero': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'minlength', message: 'Campo máximo de 10 dígitos.' },
            { type: 'maxlength', message: 'Campo máximo de 10 dígitos.' },
            { type: 'pattern', message: 'Solo números enteros.'}
        ],
        'repNumero': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'minlength', message: 'Campo máximo de 10 dígitos.' },
            { type: 'maxlength', message: 'Campo máximo de 10 dígitos.' },
            { type: 'pattern', message: 'Solo números enteros.'},
            { type: 'noCoincide', message: 'El número no coincide.' }
        ],
        'montoRecarga': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'usuarioRecarga': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo de 6 dígitos.' },
            { type: 'pattern', message: 'Solo números enteros.' }
        ],
        'contraseniaRecarga': [
            { type: 'required', message: 'Campo requerido.' }
        ],


    };
}

