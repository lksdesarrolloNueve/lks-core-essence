import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { trim } from "jquery";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable, Subscriber } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'admin-baja',
    moduleId: module.id,
    templateUrl: 'admin-baja.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 01/11/2021
 * @descripcion: Componente para la gestion de documentos codificados
 */

export class AdminBajaComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    estado: any;
    direcFunIDC: any;

    sucursalIDC: any;
    clienteIDC: any;
    sujetoIDC: any;
    fraccionIDC: any;
    fechaInicioCC: any;
    fechaCalificaFC: any;
    observacionesC: any;
    fraccCargoIDC: any;
    listaEditarC: any;
    dataSourceCargos: MatTableDataSource<any>;
    listaCargos: any;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;




    /** Fin Controles Cargo */

    @BlockUI() blockUI: NgBlockUI;
    formCargo: UntypedFormGroup;
    formCargo2: UntypedFormGroup;


    //Creación del arreglo para implementar las validaciones

    validaciones = {
        'fechaFinC': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'fechaBajaF': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'razonBaja': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }



    validaciones2 = {
        'fechaInicioC': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'fechaCalificaF': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'observaciones': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private sanitizer: DomSanitizer,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {


        this.titulo = data.titulo + ' Documento';
        this.accion = data.accion;
        this.estado = data.estado;
        this.formCargo = this.formBuilder.group({
            fechaFinC: new UntypedFormControl('', [Validators.required]),
            fechaBajaF: new UntypedFormControl('', [Validators.required]),
            razonBaja: new UntypedFormControl('', [Validators.required]),

        });


        this.formCargo2 = this.formBuilder.group({
            fechaInicioC: new UntypedFormControl('', [Validators.required]),
            fechaCalificaF: new UntypedFormControl('', [Validators.required]),
            observaciones: new UntypedFormControl('', [Validators.required]),
            cargo: new UntypedFormControl({ value: '', disabled: true }),
        });
        //Se obtienen los valores para poder pintarlos en el modal.

        if (this.accion === 2) {
            this.direcFunIDC = data.listaCargos.direcFunID,
                this.sujetoIDC = data.listaCargos.sujetoID.sujetoId,
                this.sucursalIDC = data.listaCargos.sucursalID.sucursalid,
                this.clienteIDC = data.listaCargos.clienteID.clienteId,
                this.fraccCargoIDC = data.listaCargos.fraccCargoID.fraccEnteId,
                this.fechaCalificaFC = data.listaCargos.fechaCalificaF,
                this.fechaInicioCC = data.listaCargos.fechaInicioC,
                this.observacionesC = data.listaCargos.observaciones

        };
        //Se obtienen los valores para poder pintarlos en el modal.

        if (this.accion === 2) {
            this.direcFunIDC = data.listaCargos.direcFunID,
                this.sujetoIDC = data.listaCargos.sujetoID.sujetoId,
                this.sucursalIDC = data.listaCargos.sucursalID.sucursalid,
                this.clienteIDC = data.listaCargos.clienteID.clienteId,
                this.fraccCargoIDC = data.listaCargos.fraccCargoID.fraccEnteId,
                this.fechaCalificaFC = data.listaCargos.fechaCalificaF,
                this.fechaInicioCC = data.listaCargos.fechaInicioC,
                this.observacionesC = data.listaCargos.observaciones
        }


        if (this.estado === true) {
            this.direcFunIDC = data.listaCargos.direcFunID,
                this.sujetoIDC = data.listaCargos.sujetoID.sujetoId,
                this.sucursalIDC = data.listaCargos.sucursalID.sucursalid,
                this.clienteIDC = data.listaCargos.clienteID.clienteId,
                this.fraccCargoIDC = data.listaCargos.fraccCargoID.fraccEnteId,
                this.fechaCalificaFC = data.listaCargos.fechaCalificaF,
                this.fechaInicioCC = data.listaCargos.fechaInicioC,
                this.observacionesC = data.listaCargos.observaciones,
                this.formCargo2.get('cargo').setValue(data.listaCargos.fraccCargoID.cargo);
        }

    }

    /**
     * Metodo que abre un modal para la gestion de cargos
     */

    ngOnInit() {
        this.spslistaCargo();
    }

    /**
   * Metodo que lista los registros de cargos
   */

    spslistaCargo() {
        let path: any;
        path = this.clienteIDC + '/' + 1
        this.service.getListByID(path, 'listaDirectivoFuncionarioById').subscribe(
            (data) => {
                this.listaCargos = data;
                this.dataSourceCargos = new MatTableDataSource(this.listaCargos);
                this.dataSourceCargos.paginator = this.paginator;
                this.dataSourceCargos.sort = this.sort;
            });
    }


    /**
    * Metodo para guardar un nuevo cargo
    */
    altaCargo(accion): void {
        /**
       * Validacion complementaria para la validacion de guardado de datos en el formulario formCargo
       */

        if (this.formCargo2.invalid) {
            this.validateAllFormFields(this.formCargo2);
            return;
        }
        this.blockUI.start('Guardando ...');
        const data = {
            "datos": [
                this.direcFunIDC,
                this.formCargo2.get('fechaInicioC').value,
                this.formCargo2.get('fechaCalificaF').value,
                null,
                null,
                true,
                this.formCargo2.get('observaciones').value,
                null,
                this.fraccCargoIDC,
                this.sucursalIDC,
                this.clienteIDC,
                this.sujetoIDC,
                this.fraccionIDC
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
                    this.service.showNotification('top', 'right', 2, result[0][1])
                    this.nuevoDirectorFuncionario();
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.message)
            }
        )

    }


    /**
       * Carga todos los combos y resetea el form
       */
    nuevoDirectorFuncionario() {

        this.spslistaCargo();
        this.listaCargos = [];
    }




    /**
    * Metodo para editar un cargo
    */
    bajaCargo(accion): void {
        /**
     * Validacion complementaria para la validacion de guardado de datos en el formulario formCargo
     */

        if (this.formCargo.invalid) {
            this.validateAllFormFields(this.formCargo);
            return;
        }
        this.blockUI.start('Procesando baja ...');

        const data = {
            "datos": [
                this.direcFunIDC,
                this.formCargo2.get('fechaInicioC').value,
                this.formCargo2.get('fechaCalificaF').value,
                null,
                null,
                true,
                this.formCargo2.get('observaciones').value,
                null,
                this.fraccCargoIDC,
                this.sucursalIDC,
                this.clienteIDC,
                this.sujetoIDC,
                this.fraccionIDC
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
                    this.service.showNotification('top', 'right', 2, "Los datos se guardaron correctamente")
                } else {
                    this.service.showNotification('top', 'right', 3, "Ya existe un registro con los mismo datos")
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error[1])
            }
        )


    };



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
}
