import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";



@Component({
    selector: 'gastos-caja',
    moduleId: module.id,
    templateUrl: 'modal-gastos-caja.component.html'
})

/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 07 dic. 2022
 * @descripcion: Componente para la gestion de modales de apoyo para cajas.
 */
export class ModalGastosCajaComponent implements OnInit {

    //Formulario. 
    formGastos: UntypedFormGroup;
    listaGastos: any;
    opcionesGastos: Observable<string[]>;
    gastoId: any;
    montoMT = '';

    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase
     * @param formBuilder 
     * @param data 
     * @param service 
     * @param servicePermisos 
     */
    constructor(
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialogRef<ModalGastosCajaComponent>,
        private service: GestionGenericaService,
        private servicePermisos: PermisosService
    ) {

        //validacion de campos requeridos
        this.formGastos = this.formBuilder.group({
            gasto: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
            monto: new UntypedFormControl('', { validators: [Validators.required] }),
            concepto: new UntypedFormControl('', { validators: [Validators.required, Validators.maxLength(256)] })
        });


    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spspGastos();
    }

    /**
     * Metodo para consultar sucursales
     */
    spspGastos() {
        this.blockUI.start('Cargando datos...');//cabiara  ala de estados

        let path = this.servicePermisos.sucursalSeleccionada.cveSucursal + '/' + 1;

        this.service.getListByID(path, 'listaGastosPorSuc').subscribe(data => {
            this.listaGastos = data;

            this.opcionesGastos = this.formGastos.get('gasto').valueChanges.pipe(
                startWith(''),
                map(value => this._filterGasto(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
     * Muestra la descripcion del estado
     * @param option --estado seleccionado
     * @returns --nombre de estado
     */
    displayFnGasto(option: any): any {
        return option ? option.cveGasto + ' / ' + option.descripcion : undefined;
    }

    /**
     * Filtra el estado
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterGasto(value: any): any {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaGastos.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * MEtodo para setear el id a filtrar
     * @param event  - Evento a setear
     */
    opcionSeleccionGasto(event: any) {
        this.gastoId = event.option.value.gastoId;
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
     * Guardar movimiento
     */
    guardarGasto() {

        if (this.formGastos.invalid) {
            this.validateAllFormFields(this.formGastos);
            return;
        }

        this.validacionesPersonalizadas();

        if (this.formGastos.invalid) {
            this.formGastos.markAsTouched({ onlySelf: true });
            return;
        };

        this.blockUI.start('Procesando movimiento...');

        /*
            1.cve_t_mov    (Clave tipo movimiento)
            2.cve_boveda   (Clave boveda)
            3.cve_caja     (Clave caja)
            4.monto        (Monto de la transacción).
            5.descripcion  (Descripción de la operación).
            6.cve_sucursal (Clave sucursal)
            7.usuario_id   (Usuario)
            8.cve_gasto    (cve_gasto)
        */

        let jsonTB = {
            datos: [
                null,
                null,
                this.data.cajas.cve_caja,
                this.formGastos.get('monto').value,
                this.formGastos.get('concepto').value,
                this.servicePermisos.sucursalSeleccionada.cveSucursal,
                this.servicePermisos.usuario.id,
                this.formGastos.get('gasto').value.cveGasto
            ],
            accion: 3
        };

        this.service.registrar(jsonTB, 'crudDotacionesCaja').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    this.service.showNotification('top', 'right', 2, result[0][1])

                    this.dialog.close('');

                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );

    }


    /**
     * Método para validaciones personalizadas.
     */
    public validacionesPersonalizadas() {

        //Validar Cantidad = 0.
        if (Number(this.formGastos.get('monto').value) === 0) {
            this.formGastos.controls['monto'].setErrors({ cantidadCero: true });
        }

        //Valida monto máximo permitido.
        if (Number(this.formGastos.get('monto').value) > Number(this.formGastos.get('gasto').value.limiteGasto)) {
            this.montoMT = this.formGastos.get('gasto').value.limiteGasto;
            this.formGastos.controls['monto'].setErrors({ montoMaximo: true });
        }


    }



    //Arreglo de mensajes a mostrar al validar formulario
    validacion_msj = {

        'gasto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El gasto no pertenece a la lista, elija otro.' }
        ],

        'monto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' },
            { type: 'cantidadCero', message: 'La cantidad debe ser mayor a cero.' },
            { type: 'montoMaximo', message: 'El gasto supera el monto máximo permitido. '}

            
        ],

        'concepto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 256 carácteres.' }
        ]

    }


}