import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/05/2022
 * @description: Componente modal para la gestion de PBA
 * 
 */
@Component({
    selector: 'modal-pba',
    moduleId: module.id,
    templateUrl: 'modal-pba.component.html',
    // styleUrls: ['modal-pba.component.css']
})

export class ModalPbaComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    formPBAExistente: UntypedFormGroup;
    formPBANueva: UntypedFormGroup;
    formMoralExistente: UntypedFormGroup;
    formNuevoMoral: UntypedFormGroup;
    formPBAUpdate: UntypedFormGroup;
    listaSujetos: any[];
    listaNacionalidad: any[];
    listaEmpresas: any[];
    opcionesSujetos: Observable<string[]>;
    opcionesNacionalidad: Observable<string[]>;
    opcionesEmpresas: Observable<string[]>;
    pba: any;
    nacionalidad: any;
    sexo: any;
    opcionesSexo = [
        { id: 2, nombre: "Masculino" },
        { id: 16, nombre: "Femenino" },
    ];

    validaciones = {
        'validacionGenerica': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'rfc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'minlength', message: 'Se requieren 13 caracteres.' },
        ],
        'curp': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'minlength', message: 'Se requieren 18 caracteres.' },
        ],
        'clave': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'minlength', message: 'Se requieren 4 caracteres.' },
        ],

    }

    constructor(
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private dialogRef: MatDialogRef<ModalPbaComponent>,
        private router: Router,
    ) {
        this.formPBAExistente = this.formBuilder.group({
            nombre: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            observaciones: new UntypedFormControl('', [Validators.required]),
        });
        this.formPBANueva = this.formBuilder.group({
            nombres: new UntypedFormControl('', [Validators.required]),
            apellidoPaterno: new UntypedFormControl('', [Validators.required]),
            apellidoMaterno: new UntypedFormControl('', [Validators.required]),
            rfc: new UntypedFormControl('', [Validators.required]),
            curp: new UntypedFormControl('', [Validators.required]),
            fechaNac: new UntypedFormControl('', [Validators.required]),
            sexo: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            nacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            observaciones: new UntypedFormControl(''),
        });
        this.formMoralExistente = this.formBuilder.group({
            nombre: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            observaciones: new UntypedFormControl('', [Validators.required]),
        });
        this.formNuevoMoral = this.formBuilder.group({
            clave: new UntypedFormControl('', [Validators.required]),
            representante: new UntypedFormControl('', [Validators.required]),
            nombre: new UntypedFormControl('', [Validators.required]),
            nombreComercial: new UntypedFormControl('', [Validators.required]),
            rfc: new UntypedFormControl('', [Validators.required]),
            fechaNac: new UntypedFormControl('', [Validators.required]),
            observaciones: new UntypedFormControl(''),
        });
        this.formPBAUpdate = this.formBuilder.group({
            nombre: new UntypedFormControl('', [Validators.required]),
            observaciones: new UntypedFormControl('', [Validators.required]),
            nombreSujeto: new UntypedFormControl('', [Validators.required]),
            apellidoPaterno: new UntypedFormControl('', [Validators.required]),
            apellidoMaterno: new UntypedFormControl('', [Validators.required]),
            rfc: new UntypedFormControl('', [Validators.required]),
            curp: new UntypedFormControl('', [Validators.required]),
            fechaNac: new UntypedFormControl('', [Validators.required]),
            sexo: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            nacionalidad: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            clave: new UntypedFormControl('', [Validators.required]),
            representante: new UntypedFormControl('', [Validators.required]),
            nombreComercial: new UntypedFormControl('', [Validators.required]),
            razonSocial: new UntypedFormControl('', [Validators.required]),
        });

        if (this.data.accion == 2) this.sexo = this.opcionesSexo.find(s => s.id === this.data.pba.sexo);
    }

    ngOnInit() {
        this.spsSujetos();
        this.spsNacionalidades();
        this.spsEmpresas();
    }

    /**
     * Metodo que consulta los sujetos en BD
     */
    spsSujetos() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaSujetos').subscribe(data => {
            this.listaSujetos = [];
            this.listaSujetos = data;

            this.opcionesSujetos = this.formPBAExistente.get('nombre').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSujeto(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo que consulta el catalogo de nacionalidades
     */
    spsNacionalidades() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(2, 'listaNacionalidades').subscribe(data => {
            this.listaNacionalidad = [];
            this.listaNacionalidad = data;

            if (this.data.accion == 2) {
                if (this.data.pba.nacionalidad !== null && this.data.pba.nacionalidad !== undefined) {
                    this.nacionalidad = this.listaNacionalidad.find(n => n.nacionalidadid === this.data.pba.nacionalidad);
                } else {
                    this.data.pba.nacionalidad = null;
                }
            }

            if (this.data.accion == 2) {
                this.asignarValores();
            }

            this.opcionesNacionalidad = this.formPBANueva.get('nacionalidad').valueChanges.pipe(
                startWith(''),
                map(value => this._filterNac(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo que consulta las empresas en BD
     */
    spsEmpresas() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaEmpresa').subscribe(data => {
            this.listaEmpresas = [];
            this.listaEmpresas = data;

            this.opcionesEmpresas = this.formMoralExistente.get('nombre').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEmpresas(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo que muestra la opciones de sujeto en el auto-complete
     */
    displaySujeto = (option: any) => {

        if (this.data.accion == 1) {
            return option ? `${option.nombres} ${option.apellidoPaterno} ${option.apellidoPaterno}` : undefined;
        } else {
            return option ? option : undefined;
        }
    }


    /**
     * Funcion para el despliegue del valor del autocomplete de empresas
     */
    displayEmpresa = (option: any) => {
        return option ? option.razonSocial : undefined;
    }


    /**
     * Funcion para el despliegue del valor del autocomplete de empresas
     */
    displaySexo = (option: any) => {
        return option ? option.nombre : undefined;
    }


    /**
     * Funcion para el despliegue del valor del autocomplete de empresas
     */
    displayNacionalidad = (option: any) => {
        return option ? option.nacion : undefined;
    }


    /**
     * Funcion que filtra las opciones del auto-complete de sujetos
     */
    private _filterSujeto(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaSujetos.filter(option => option.sujeto.nombres.toLowerCase().includes(filterValue));
    }


    /**
     * Funcion que filtra las opciones del auto-complete de nacionalidades
     */
    private _filterNac(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaNacionalidad.filter(option => option.nacion.toLowerCase().includes(filterValue));
    }


    /**
     * Funcion que filtra las opciones del auto-complete de empresas
     */
    private _filterEmpresas(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaEmpresas.filter(option => option.razonSocial.toLowerCase().includes(filterValue));
    }


    /**
     * Se asignan los valores correspondientes a cada input si se hara una actualizacion.
     */
    asignarValores() {
        this.formPBAUpdate.get('nombre').setValue(this.data.pba.nombre);
        this.formPBAUpdate.get('nombreSujeto').setValue(this.data.pba.nombresSujeto);
        this.formPBAUpdate.get('observaciones').setValue(this.data.pba.observaciones);
        this.formPBAUpdate.get('rfc').setValue(this.data.pba.rfc);
        this.formPBAUpdate.get('fechaNac').setValue(this.data.pba.fechaNacimiento);
        this.formPBAUpdate.get('apellidoPaterno').setValue(this.data.pba.apellidoPaterno);
        this.formPBAUpdate.get('apellidoMaterno').setValue(this.data.pba.apellidoMaterno);
        this.formPBAUpdate.get('curp').setValue(this.data.pba.curp);
        this.formPBAUpdate.get('sexo').setValue(this.sexo);

        this.formPBAUpdate.get('nacionalidad').setValue(this.nacionalidad);

        this.formPBAUpdate.get('clave').setValue(this.data.pba.clave);
        this.formPBAUpdate.get('representante').setValue(this.data.pba.representante);
        this.formPBAUpdate.get('nombreComercial').setValue(this.data.pba.nombre);
        this.formPBAUpdate.get('razonSocial').setValue(this.data.pba.razonSocial);
    }


    /**
     * Se insertan o actualizan datos segun la accion correspondiente.
     * 1. Agregar 2. Actualizar 3. Eliminar (Cambiar estatus a false)
     */
    crud(accion) {
        let notificacion = (this.data.accion == 1) ? "Se agregó el registro correctamente" : "Se actualizó el registro correctamente";
        let sujeto = null;
        let moral = null;
        let observaciones = null;
        let nombres = null;
        let apP = null;
        let apM = null;
        let rfc = null;
        let curp = null;
        let fechaNac = null;
        let sexo = null;
        let nacionalidad = null;
        let clave = null;
        let representante = null;
        let nombreComercial = null;

        switch (accion) {
            case 1: // Insercion de sujeto existente
                if (this.formPBAExistente.invalid) {
                    this.validateAllFormFields(this.formPBAExistente);
                    return;
                }
                sujeto = this.formPBAExistente.get('nombre').value.sujetoId;
                observaciones = this.formPBAExistente.get('observaciones').value;
                break;
            case 4: // Insercion de sujeto nuevo
                if (this.formPBANueva.invalid) {
                    this.validateAllFormFields(this.formPBANueva);
                    return;
                }
                observaciones = this.formPBANueva.get('observaciones').value;
                nombres = this.formPBANueva.get('nombres').value;
                apP = this.formPBANueva.get('apellidoPaterno').value;
                apM = this.formPBANueva.get('apellidoMaterno').value;
                rfc = this.formPBANueva.get('rfc').value;
                curp = this.formPBANueva.get('curp').value;
                fechaNac = this.formPBANueva.get('fechaNac').value;
                sexo = this.formPBANueva.get('sexo').value.id;
                nacionalidad = this.formPBANueva.get('nacionalidad').value.nacionalidadid;
                accion = 1;
                break;
            case 5: // Insercion de cliente moral existente
                if (this.formMoralExistente.invalid) {
                    this.validateAllFormFields(this.formMoralExistente);
                    return;
                }
                moral = this.formMoralExistente.get('nombre').value.empresaId;
                observaciones = this.formMoralExistente.get('observaciones').value;
                accion = 1;
                break;
            case 6: // Insercion de cliente moral nuevo
                if (this.formNuevoMoral.invalid) {
                    this.validateAllFormFields(this.formNuevoMoral);
                    return;
                }
                nombres = this.formNuevoMoral.get('nombre').value;
                rfc = this.formNuevoMoral.get('rfc').value;
                fechaNac = this.formNuevoMoral.get('fechaNac').value;
                observaciones = this.formNuevoMoral.get('observaciones').value;
                clave = this.formNuevoMoral.get('clave').value;
                representante = this.formNuevoMoral.get('representante').value;
                nombreComercial = this.formNuevoMoral.get('nombreComercial').value;
                accion = 1;
                break;
            default: // Actualizacion
                if (this.data.pba.moral) {
                    moral = this.data.pba.sujetoId;
                    observaciones = this.formPBAUpdate.get('observaciones').value;
                    rfc = this.formPBAUpdate.get('rfc').value;
                    fechaNac = this.formPBAUpdate.get('fechaNac').value;
                    clave = this.formPBAUpdate.get('clave').value;
                    representante = this.formPBAUpdate.get('representante').value;
                    nombreComercial = this.formPBAUpdate.get('nombreComercial').value;
                    nombres = this.formPBAUpdate.get('razonSocial').value;
                } else {
                    sujeto = this.data.pba.sujetoId;
                    observaciones = this.formPBAUpdate.get('observaciones').value;
                    nombres = this.formPBAUpdate.get('nombreSujeto').value;
                    apP = this.formPBAUpdate.get('apellidoPaterno').value;
                    apM = this.formPBAUpdate.get('apellidoMaterno').value;
                    rfc = this.formPBAUpdate.get('rfc').value;
                    curp = this.formPBAUpdate.get('curp').value;
                    fechaNac = this.formPBAUpdate.get('fechaNac').value;
                    sexo = this.formPBAUpdate.get('sexo').value.id;
                    nacionalidad = this.formPBAUpdate.get('nacionalidad').value.nacionalidadid;
                }
                break;
        }

        let datos = {
            "accion": accion,
            "datos": [
                sujeto,
                moral,
                observaciones,
                nombres,
                apP,
                apM,
                rfc,
                curp,
                fechaNac,
                sexo,
                nacionalidad,
                clave,
                representante,
                nombreComercial
            ]
        }

        this.blockUI.start('Cargando datos...');
        this.service.registrar(datos, "crudPBA").subscribe(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, notificacion);
            this.dialogRef.close();
            this.router.navigate(['/pba']);
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /* Valida que el texto ingresado pertenezca a la lista 
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

}