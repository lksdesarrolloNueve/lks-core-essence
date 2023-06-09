import { Component, Inject, OnInit } from "@angular/core"
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms"
import { MAT_DIALOG_DATA } from "@angular/material/dialog"
import { GestionGenericaService } from "../../../../../shared/service/gestion"
import { BlockUI, NgBlockUI } from "ng-block-ui"
import { Observable } from "rxjs"
import { map, startWith } from "rxjs/operators"


/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 04/09/2021
* @descripcion: Componente para la gestion de ocupaciones sinco
*/
@Component({
    selector: 'administracion-ocupacion',
    moduleId: module.id,
    templateUrl: 'administracion-ocupacion.component.html'
})

export class AdministracionOcupacionComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Ocupaciones SINCO';
    encabezado: string;
    accion: number;

    listaUnitario: any;
    formOcupaciones: UntypedFormGroup;
    opcionesUnitario: Observable<string[]>;
    opcionesVulnerable: Observable<string[]>;

    listaRiesgo: any;
    listaVulnerable: any;

    ocupacionId: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {

        //Validaciones del formulario 
        this.formOcupaciones = this.formBuilder.group(
            {
                unitario: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                cveOcu: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$")]),
                descripcion: new UntypedFormControl('', [Validators.required]),
                sueldo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
                vulnerable: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                codPLD: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(8)]),
                codSCIAN: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.maxLength(8)]),
                nivelRi: new UntypedFormControl('', [Validators.required]),
                estatus: new UntypedFormControl('true', [Validators.required])
            })
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        //Actualizar
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.ocupacionId = data.ocupacion.ocupacionId;
            this.formOcupaciones.get('unitario').setValue(data.ocupacion.unitario);
            this.formOcupaciones.get('cveOcu').setValue(data.ocupacion.cveOcupacion);
            this.formOcupaciones.get('descripcion').setValue(data.ocupacion.descripcion);
            this.formOcupaciones.get('sueldo').setValue(data.ocupacion.sueldoMensual);
            this.formOcupaciones.get('vulnerable').setValue(data.ocupacion.actVulnerable);
            this.formOcupaciones.get('codPLD').setValue(data.ocupacion.codPld);
            this.formOcupaciones.get('codSCIAN').setValue(data.ocupacion.codScian);
            this.formOcupaciones.get('nivelRi').setValue(data.ocupacion.nivelRiesgo.generalesId);
            this.formOcupaciones.get('estatus').setValue(data.ocupacion.estatus);

        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsGrupoUni();
        this.spsNivelR();
        this.spsActividadesVul();
    }
    /**
     * Metodo para listar las generales por categoria
     * @param general
     */
    spsNivelR() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('06RS', 'listaGeneralCategoria').subscribe(data => {
            this.listaRiesgo = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Lista los Grupos Unitarios
     * 
     */
    spsGrupoUni() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaUnitario').subscribe(data => {
            this.blockUI.stop();
            this.listaUnitario = data;
            this.opcionesUnitario = this.formOcupaciones.get('unitario').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
       * Valida que el texto ingresado pertenezca a un grupo unitario
       * @returns mensaje de error.
       */
    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string') {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }
    /**
      * Muestra la descripcion del grupo
      * @param option --grupo seleccionado
      * @returns --nombre de grupo
      */
    displayFn(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filta el grupo this.spsSubGrupo();
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filter(value: any): any[] {
        let filterValue = value;
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaUnitario.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * Lista los Grupos Unitarios
     * 
     */
    spsActividadesVul() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaActividadesV').subscribe(data => {
            this.blockUI.stop();
            this.listaVulnerable = data;
            this.opcionesVulnerable = this.formOcupaciones.get('vulnerable').valueChanges.pipe(
                startWith(''),
                map(value => this._filterV(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
      * Muestra la descripcion del grupo
      * @param option --grupo seleccionado
      * @returns --nombre de grupo
      */
    displayFnV(option: any): any {
        return option ? option.concepto : undefined;
    }

    /**
    * Filta el grupo this.spsSubGrupo();
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterV(value: any): any[] {
        let filterValue = value;
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaVulnerable.filter(option => option.concepto.toLowerCase().includes(filterValue));
    }



    /**
       * Metodo para guardar los datos de subgrupo 
       */
    guardarOcupacion() {
        if (this.formOcupaciones.invalid) {
            this.validateAllFormFields(this.formOcupaciones);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "ocupacionId": '0',
            "cveOcupacion": this.formOcupaciones.get('cveOcu').value,
            "descripcion": this.formOcupaciones.get('descripcion').value,
            "sueldoMensual": this.formOcupaciones.get('sueldo').value,
            "codPld": this.formOcupaciones.get('codPLD').value,
            "codScian": this.formOcupaciones.get('codSCIAN').value,
            "estatus": this.formOcupaciones.get('estatus').value,
            "nivelRiesgo": {
                "generalesId": this.formOcupaciones.get('nivelRi').value
            },
            "actVulnerable": this.formOcupaciones.get('vulnerable').value,
            "unitario": this.formOcupaciones.get('unitario').value

        };

        //return;
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudOcupacion').subscribe(resultado => {
            this.blockUI.start('Guardando ...');
            if (resultado[0][0] === '0') {//exito    
                //Uso de metodo limpiarCampos para volver a guardar
                this.limpiarCampos();
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
        });
    }

    /**
          * Metodo para actualizar los datos de grupo principal
          */
    actualizarOcupacion() {
        if (this.formOcupaciones.invalid) {
            this.validateAllFormFields(this.formOcupaciones);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "ocupacionId": this.ocupacionId,
            "cveOcupacion": this.formOcupaciones.get('cveOcu').value,
            "descripcion": this.formOcupaciones.get('descripcion').value,
            "sueldoMensual": this.formOcupaciones.get('sueldo').value,
            "codPld": this.formOcupaciones.get('codPLD').value,
            "codScian": this.formOcupaciones.get('codSCIAN').value,
            "estatus": this.formOcupaciones.get('estatus').value,
            "nivelRiesgo": {
                "generalesId": this.formOcupaciones.get('nivelRi').value
            },
            "actVulnerable": this.formOcupaciones.get('vulnerable').value,
            "unitario": this.formOcupaciones.get('unitario').value

        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudOcupacion').subscribe(resultado => {
            this.blockUI.start('Actalizando ...');
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
        });
    }



    /**
     * Limpiar el formulario formUnitario
     */
    limpiarCampos() {
        this.formOcupaciones.get('cveOcu').setValue('');
        this.formOcupaciones.get('descripcion').setValue('');
        this.formOcupaciones.get('sueldo').setValue('');
        this.formOcupaciones.get('codPLD').setValue('');
        this.formOcupaciones.get('codSCIAN').setValue('');
        this.formOcupaciones.get('nivelRi').setValue('');
        this.formOcupaciones.get('vulnerable').setValue('');
        this.formOcupaciones.get('unitario').setValue('');
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

    //Arreglo de mensajes a mostrar al validar formulario
    validaciones = {
        'cveOcu': [
            { type: 'required', message: ' Clave Ocupación requerida.' },
            { type: 'pattern', message: 'Solo números de 4 dígitos.' },
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' }
        ],
        'sueldo': [
            { type: 'required', message: 'Sueldo mensual requerido.' },
            { type: 'pattern', message: 'Solo números decimales' }
        ],
        'vulnerable': [
            { type: 'required', message: 'Actividad vulnerable requerida.' },
            { type: 'autocompleteObjectValidator', message: 'No existe la actividad elige otra.' }
        ],
        'codPLD': [
            { type: 'required', message: 'Código PLD requerido.' },
            { type: 'pattern', message: 'Solo números máximo 8 dígitos.' },
            { type: 'maxLength', message: 'Máximo 8 carácteres' }
        ],
        'codSCIAN': [
            { type: 'required', message: 'Código SCIAN requerido.' },
            { type: 'pattern', message: 'Solo números máximo 8 dígitos.' },
            { type: 'maxLength', message: 'Máximo 8 carácteres' }
        ],
        'nivelRi': [
            { type: 'required', message: 'Nivel de riesgo requerido.' },
            { type: 'pattern', message: 'Solo números.' }
        ],
        'unitario': [
            { type: 'required', message: 'Grupo unitario requerido.' },
            { type: 'autocompleteObjectValidator', message: 'No existe el grupo unitario elige otro.' }
        ]

    }
}