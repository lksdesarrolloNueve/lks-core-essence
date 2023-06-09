import { Component, OnInit } from "@angular/core";
import { STEPPER_GLOBAL_OPTIONS } from "@angular/cdk/stepper";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { MatDialogRef } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: 'servicios-mtc',
    moduleId: module.id,
    templateUrl: 'servicios.component.html',
    providers: [
        {
            provide: STEPPER_GLOBAL_OPTIONS,
            useValue: { showError: true },
        },
    ],
})
export class ServiciosMTCComponent implements OnInit {

    //Declaracion de variables
    formServicios: UntypedFormGroup;
    formServiciosSecond: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;

    //Filtro servicios 
    selectedIdServicio: number = 0;
    listaServicios: any = [];
    opcionesServicios: Observable<string[]>;

    varValidacionFirst: boolean = false;
    varValidacionSecond: boolean = false;

    lblServicios: string = "";
    lblReferenciaUno: string = "";
    lblReferenciaDos: string = "";
    lblMonto : number = 0;

    //listaMovCaja
    listaMovCaja: any = [];


    constructor(
        private formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        private dialog: MatDialogRef<ServiciosMTCComponent>) {

        this.formServicios = this.formBuilder.group({
            servicio: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            referencia: new UntypedFormControl('', Validators.required),
            digitoVerif: new UntypedFormControl(''),
            monto: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')]),
            confMonto: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')])
        });

        this.formServiciosSecond = this.formBuilder.group({
            usuario: new UntypedFormControl('',[Validators.required, Validators.maxLength(6), Validators.pattern('[0-9]*')]),
            contrasenia: new UntypedFormControl('', Validators.required)
        });

    }

    ngOnInit(): void {
        this.spsServicios();
        this.spsMovimientosCaja();
    }


    /**
     * Metodo que consulta los Movimientos Cajas
     */
    spsMovimientosCaja() {

        this.blockUI.start('Cargando datos...');
        let path = "0005" + '/' + 4;
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
 
        this.lblServicios = event.option.value.producto;
        //this.selectedIdServicio = event.option.value.producto;
        //this.formServicios.get('comision').setValue(event.option.value.comision);
        //this.spsServicios();
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
     * Registro de servicio pagado
     */
    crudServicio() {

        //Valida fomrulario
        if (this.formServicios.invalid) {
            this.validateAllFormFields(this.formServicios);
            this.varValidacionFirst = true;
            return;
        }

        //Valida fomrulario
        if (this.formServiciosSecond.invalid) {
            this.validateAllFormFields(this.formServiciosSecond);
            this.varValidacionSecond = true;
            return;
        }

        if (!this.validacionesPersonalizadas()) {
            this.varValidacionFirst = true;
            return;
        }


        //areglo que contiene los datos a guardar
        const data = {
            servicio: {
                servicio: this.formServicios.get('servicio').value,
                monto: this.formServicios.get('monto').value,
                referencia: this.formServicios.get('referencia').value,
                digitoVerif: this.formServicios.get('digitoVerif').value,
                usuario: this.formServiciosSecond.get('usuario').value,
                contrasenia: this.formServiciosSecond.get('contrasenia').value
            },
            mov: this.listaMovCaja[0]
        };


        let jsonLogin = {
            "cadena": 5000,
            "establecimiento": 11678,
            "terminal": 32424,
            "cajero": 39326,
            "clave": "F#(/G0@dwZ",
            //"cajero":this.formRecargas.get('usuario').value,
            //"clave": this.formRecargas.get('contrasenia').value
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
                this.service.registrar(reqSaldo, 'saldoServicios').subscribe(respSaldo => {
                    this.blockUI.stop();
                    if (respSaldo.codigo_respuesta === 0) {
                       
                        if(respSaldo.saldo > this.formServicios.get('monto').value){
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
        if (this.formServicios.get('monto').value !== this.formServicios.get("confMonto")?.value) {
            this.formServicios.controls['confMonto'].setErrors({ noCoincide: true });
            return false;
        }


        return true;

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
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' }
        ],
        'confMonto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' },
            { type: 'noCoincide', message: 'El monto no coincide.'}
        ],
        'usuario': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo de 6 dígitos.' },
            { type: 'pattern', message: 'Solo números enteros.'}
        ],
        'contrasenia': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };


}