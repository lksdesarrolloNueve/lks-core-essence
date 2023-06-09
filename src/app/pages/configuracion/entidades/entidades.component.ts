import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { environment } from '../../../../environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { SujetosModalComponent } from '../../../pages/modales/sujetos-modal/sujetos-modal.component';

@Component({
    selector: 'entidades',
    moduleId: module.id,
    templateUrl: 'entidades.component.html'
})
/**
 * @autor: Juan Eric Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 03/11/2021
 * @descripcion: Componente para la gestion de depreciaciones
 */
export class EntidadesComponent implements OnInit {

    //Declaracion de variables y componentes
    accion = 1;
    v_entidad_id = 0;
    v_contabilidad_id = 0;
    v_siti_id = 0;
    v_entidad = '';


    mostrarGuardar = true;
    mostrarEditar = false;
    mostrarDetalleEmpresa = false;

    listaEmpresa: any = [];
    listaDomicilios: any = [];
    listaSucursales: any = [];
    listaTiposFuncionarios: any = [];
    listaSujetos: any = [];
    listaAddFuncionarios: any = [];

    listaEntidades: any = [];
    listaEditEmpresa: any = [];
    listaEditContabilidad: any = [];
    listaEditFuncionarios: any = [];
    listaEditSiti: any = [];

    opcionesEmpresa: Observable<string[]>;
    opcionesSucursal: Observable<string[]>;


    displayedColumns: string[] = ['estado', 'ciudad', 'colonia', 'calle', 'exterior'];
    dataSourceEmpresa: MatTableDataSource<any>;


    funcionario = new UntypedFormControl();

    sujeto = new UntypedFormControl();
    estatus = new UntypedFormControl(true);


    razon = new UntypedFormControl('');
    rfc = new UntypedFormControl('');
    nombreComercial = new UntypedFormControl('');

    formSiti: UntypedFormGroup;
    formContabilidad: UntypedFormGroup;
    formEntidad: UntypedFormGroup;


    @BlockUI() blockUI: NgBlockUI;

    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder, public dialog: MatDialog) {

        this.formSiti = this.formbuilder.group({
            nivel_operaciones: new UntypedFormControl('', [Validators.required]),
            nivel_siti: new UntypedFormControl('', [Validators.required]),
            entidad_siti: new UntypedFormControl('', [Validators.required]),
            federacion_siti: new UntypedFormControl('', [Validators.required]),
            nivel_prudencial: new UntypedFormControl('', [Validators.required])
        });

        this.formContabilidad = this.formbuilder.group({
            fecha_inicio_devengamiento: new UntypedFormControl(new Date(), [Validators.required]),
            fecha_cobro_iva: new UntypedFormControl(new Date(), [Validators.required]),
            monto_parte_social: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            interes_minimo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            localidad_siscard: new UntypedFormControl('', [Validators.required]),
            tasa_inflacion: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            dias_captacion: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            dias_creditos: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            parte_social_completa: new UntypedFormControl(true, [Validators.required]),
            aplica_reciprocidad: new UntypedFormControl(true, [Validators.required]),
            traspaso_reciprocidad: new UntypedFormControl(true, [Validators.required]),
            inversion_exenta: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            porcentaje_inversion: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            interes_ahorro: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')])
        });

        this.formEntidad = this.formbuilder.group({
            empresa: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            sucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            estatus: new UntypedFormControl(true)
        });

    }


    ngOnInit() {
        this.spsEntidades();
        this.spsEmpresas();
        this.spsSucurales();
        this.spsListaFuncionarios();
    }



    crudEntidad() {


        if (this.formSiti.invalid) {
            this.validateAllFormFields(this.formSiti);
            return;
        }

        if (this.formContabilidad.invalid) {
            this.validateAllFormFields(this.formContabilidad);
            return;
        }

        if (this.formEntidad.invalid) {
            this.validateAllFormFields(this.formEntidad);
            return;
        }


        if (this.listaAddFuncionarios.length === 0) {
            this.service.showNotification('top', 'right', 3, "Debes Registrar al menos un Funcionario.");
            return;
        }

        if (this.accion === 1) {
            this.blockUI.start('Guardando ...');
        } else {
            this.blockUI.start('Editando ...');
        }

        const json = {
            "entidad": [this.v_entidad_id, this.formEntidad.get('sucursal').value.sucursalid, this.formEntidad.get('empresa').value.empresaId, this.formEntidad.get('estatus').value],
            "funcionarios": this.listaAddFuncionarios,
            "contabilidad": [this.v_contabilidad_id, this.formContabilidad.get('fecha_inicio_devengamiento').value,
            this.formContabilidad.get('fecha_cobro_iva').value,
            this.formContabilidad.get('monto_parte_social').value,
            this.formContabilidad.get('interes_minimo').value,
            this.formContabilidad.get('localidad_siscard').value,
            this.formContabilidad.get('tasa_inflacion').value,
            this.formContabilidad.get('dias_captacion').value,
            this.formContabilidad.get('dias_creditos').value,
            this.formContabilidad.get('parte_social_completa').value,
            this.formContabilidad.get('aplica_reciprocidad').value,
            this.formContabilidad.get('traspaso_reciprocidad').value,
            this.formContabilidad.get('inversion_exenta').value,
            this.formContabilidad.get('porcentaje_inversion').value,
            this.formContabilidad.get('interes_ahorro').value],
            "siti": [this.v_siti_id, this.formSiti.get('nivel_operaciones').value,
            this.formSiti.get('nivel_siti').value,
            this.formSiti.get('entidad_siti').value,
            this.formSiti.get('federacion_siti').value,
            this.formSiti.get('nivel_prudencial').value],
            "accion": this.accion
        };


        this.service.registrar(json, 'crudEntidad').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.nuevaEntidad();
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    editarEntidad(entidad) {
        this.accion = 2;


        let findEntidad = this.listaEntidades.find(e => e.empresa_id === entidad.empresa_id);
        this.v_entidad_id = findEntidad.entidad_id;


        this.formEntidad.get('estatus').setValue(findEntidad.estatus);

        //Setear los Datos de la Empresa en los compnentes
        let findEmpresa = this.listaEmpresa.find(e => e.empresaId === entidad.empresa_id);
        this.formEntidad.get('empresa').setValue(findEmpresa);
        this.editSetEmpresa(findEmpresa);

        //Seteo de datos sucursal
        let findSucursal = this.listaSucursales.find(s => s.sucursalid === findEntidad.sucursal_id);
        this.formEntidad.get('sucursal').setValue(findSucursal);

        //Seteo datos SITI
        let findSiti = this.listaEditSiti.find(s => s.entidad_id === findEntidad.entidad_id);
        this.v_siti_id = findSiti.siti_entidad_id;
        this.formSiti.get('nivel_operaciones').setValue(findSiti.nivel_operaciones);
        this.formSiti.get('nivel_siti').setValue(findSiti.nivel_siti);
        this.formSiti.get('entidad_siti').setValue(findSiti.entidad_siti);
        this.formSiti.get('federacion_siti').setValue(findSiti.federacion_siti);
        this.formSiti.get('nivel_prudencial').setValue(findSiti.nivel_prudencial);

        //Seteo datos Contabilidad
        let findContabilidad = this.listaEditContabilidad.find(c => c.entidad_id === findEntidad.entidad_id);
        this.v_contabilidad_id = findContabilidad.contabilidad_entidad_id;
        this.formContabilidad.get('fecha_inicio_devengamiento').setValue(findContabilidad.fecha_inicio_devengamiento + 'T00:00:00');
        this.formContabilidad.get('fecha_cobro_iva').setValue(findContabilidad.fecha_cobro_iva + 'T00:00:00');
        this.formContabilidad.get('monto_parte_social').setValue(findContabilidad.monto_parte_social);
        this.formContabilidad.get('interes_minimo').setValue(findContabilidad.interes_minimo);
        this.formContabilidad.get('localidad_siscard').setValue(findContabilidad.localidad_siscard);
        this.formContabilidad.get('tasa_inflacion').setValue(findContabilidad.tasa_inflacion);
        this.formContabilidad.get('dias_captacion').setValue(findContabilidad.dias_captacion);
        this.formContabilidad.get('dias_creditos').setValue(findContabilidad.dias_creditos);
        this.formContabilidad.get('parte_social_completa').setValue(findContabilidad.parte_social_completa);
        this.formContabilidad.get('aplica_reciprocidad').setValue(findContabilidad.aplica_reciprocidad);
        this.formContabilidad.get('traspaso_reciprocidad').setValue(findContabilidad.traspaso_reciprocidad);
        this.formContabilidad.get('inversion_exenta').setValue(findContabilidad.inversion_exenta);
        this.formContabilidad.get('porcentaje_inversion').setValue(findContabilidad.porcentaje_inversion);
        this.formContabilidad.get('interes_ahorro').setValue(findContabilidad.interes_ahorro);

        //Seteo datos Funcionarios
        this.listaAddFuncionarios = [];
        for (let funcionario of this.listaEditFuncionarios) {
            if (funcionario.entidad_id === findEntidad.entidad_id) {
                this.listaAddFuncionarios.push([0, funcionario.sujeto_id,
                    funcionario.generales_id,
                    funcionario.nombres,
                    funcionario.apellido_paterno,
                    funcionario.apellido_materno,
                    funcionario.descripcion
                ]);
            }
        }


    }

    editSetEmpresa(empresa: any) {
        this.mostrarDetalleEmpresa = true;
        this.razon.setValue(empresa.razonSocial);
        this.v_entidad = empresa.razonSocial;
        this.rfc.setValue(empresa.rfc);
        this.nombreComercial.setValue(empresa.nombreComercial);
        this.listaDomicilios = JSON.parse(empresa.domicilios);
        this.dataSourceEmpresa = new MatTableDataSource(this.listaDomicilios);


    }

    nuevaEntidad() {

        this.formContabilidad.reset();
        this.formEntidad.reset();
        this.formSiti.reset();
        this.listaAddFuncionarios = [];
        this.funcionario.setValue('');
        this.mostrarDetalleEmpresa = false;
        this.accion = 1;
        this.v_entidad_id = 0;
        this.v_contabilidad_id = 0;
        this.v_siti_id = 0;
        this.spsEntidades();

    }


    /**
    * Listar nacionalidades activas para cliente y referencia
    */
    spsEmpresas() {
        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByID(environment.generales.empresaSucursal, 'listaTipoEmpresa').subscribe(data => {
            this.listaEmpresa = data;
            this.opcionesEmpresa = this.formEntidad.get('empresa').valueChanges.pipe(
                startWith(''),
                map(value => this._filterEmpresa(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
    * Filtra la categoria de nacionalidad
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterEmpresa(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEmpresa.filter(option => option.nombreComercial.toLowerCase().includes(filterValue));
    }




    /**
        * Muestra la descripcion de la empresa
        * @param option --empresa seleccionada
        * @returns --nombre de la empresa
        */
    mostrarEmpresa(option: any): any {
        return option ? option.nombreComercial : undefined;
    }


    opcionEmpresa(empresa: any) {
        this.mostrarDetalleEmpresa = true;
        this.razon.setValue(empresa.option.value.razonSocial);
        this.rfc.setValue(empresa.option.value.rfc);
        this.nombreComercial.setValue(empresa.option.value.nombreComercial);
        this.listaDomicilios = JSON.parse(empresa.option.value.domicilios);
        this.dataSourceEmpresa = new MatTableDataSource(this.listaDomicilios);
    }


    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listaSucursales = data;
            this.opcionesSucursal = this.formEntidad.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))
            );


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }




    /**
        * Muestra la descripcion de la sucursal
        * @param option --sucursal seleccionada
        * @returns --nombre de la sucursal
        */
    mostrarSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }


    /**
     * Filtra las sucursales
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
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }



    /**
 * Metodo para listar los roles
 */
    spsListaFuncionarios() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catTiposFuncionarios, 'listaGeneralCategoria').subscribe(data => {
            this.blockUI.stop();

            this.listaTiposFuncionarios = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    buscarSujeto() {


        const dialogRef =
            this.dialog.open(SujetosModalComponent, {
                width: '40%',
                data: {
                    accion: 1
                }

            });

        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (!this.vacio(result)) {
                if (!this.vacio(result.length)) {
                    for (let sujeto of result) {
                        this.listaSujetos.push(sujeto);
                    }
                } else {
                    this.listaSujetos.push(result);
                }
            }

        });

    }




    agregaFuncionario() {

        let sujetoEncontrado = this.listaAddFuncionarios.find(res => res[1] === this.sujeto.value.sujeto_id);

        if (sujetoEncontrado) {
            this.service.showNotification('top', 'right', 5, "El Sujeto ya se encuentra relacionado.")
            return;
        }

        this.listaAddFuncionarios.push([0, this.sujeto.value.sujeto_id,
            this.funcionario.value.generalesId,
            this.sujeto.value.nombres,
            this.sujeto.value.apellido_paterno,
            this.sujeto.value.apellido_materno,
            this.funcionario.value.descripcion
        ]);

    }

    quitarSujeto(sujeto) {


        let index = this.listaAddFuncionarios.findIndex(res => res[1] === sujeto[1]);
        this.listaAddFuncionarios.splice(index, 1);

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
     * Metodo que valida los datos vacios
     * @param value -valor a validar
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    spsEntidades() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1, 'listaEntidades').subscribe(data => {
            this.blockUI.stop();

            this.listaEditEmpresa = [];
            this.listaEditContabilidad = [];
            this.listaEditSiti = [];
            this.listaEditFuncionarios = [];
            this.listaEntidades = [];

            for (let entidades of data) {

                let empresa = JSON.parse(entidades.empresa);
                for (let emp of empresa) {
                    this.listaEditEmpresa.push(emp);
                }

                let contabilidad = JSON.parse(entidades.contabilidad);
                for (let conta of contabilidad) {
                    this.listaEditContabilidad.push(conta);
                }

                let siti = JSON.parse(entidades.siti);
                for (let vsiti of siti) {
                    this.listaEditSiti.push(vsiti);
                }

                if (entidades.funcionarios !== null) {
                    let funcionarios = JSON.parse(entidades.funcionarios);
                    for (let vfuncionarios of funcionarios) {
                        this.listaEditFuncionarios.push(vfuncionarios);
                    }
                }


                let entidad = JSON.parse(entidades.entidadSucursal);
                for (let entidadSucursal of entidad) {
                    this.listaEntidades.push(entidadSucursal);
                }


            }


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
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
 * Validaciones FormGroup
 */
    validacionesSITI = {
        'nivel_operaciones': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'nivel_siti': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'entidad_siti': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'federacion_siti': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'nivel_prudencial': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'empresa': [{ type: 'invalidAutocompleteObject', message: 'La empresa no existe.' },
        { type: 'required', message: 'Campo requerido.' }],
        'sucursal': [{ type: 'invalidAutocompleteObject', message: 'La sucursal no existe.' },
        { type: 'required', message: 'Campo requerido.' }]
    };


    validacionesContabilidad = {
        'fecha_inicio_devengamiento': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'fecha_cobro_iva': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'localidad_siscard': [
            { type: 'required', message: 'Campo requerido.' }
        ],

        'parte_social_completa': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'aplica_reciprocidad': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'traspaso_reciprocidad': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'dias_captacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta enteros.' }
        ],
        'dias_creditos': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta enteros.' }
        ],
        'monto_parte_social': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta cantidades monetarias.' }
        ],
        'interes_minimo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta cantidades monetarias.' }
        ],
        'tasa_inflacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta cantidades monetarias.' }
        ],

        'inversion_exenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta cantidades monetarias.' }
        ],
        'porcentaje_inversion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta cantidades monetarias.' }
        ],

        'interes_ahorro': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: '  El campo solo acepta cantidades monetarias.' }
        ]

    };


}