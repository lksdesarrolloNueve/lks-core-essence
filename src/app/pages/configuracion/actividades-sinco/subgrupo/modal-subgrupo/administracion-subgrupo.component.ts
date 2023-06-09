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
* @fecha: 30/09/2021
* @descripcion: Componente para la gestion de Subgrupo
*/
@Component({
    selector: 'administracion-subgrupo',
    moduleId: module.id,
    templateUrl: 'administracion-subgrupo.component.html'
})

export class AdministracionSubgrupoComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Subgrupo';
    encabezado: string;
    accion: number;
    listaPrincipal: any;
    listaDivision: any;
    formSubgrupo: UntypedFormGroup;
    opcionesGrupo: Observable<string[]>;
    selectedDivision: number;

    subgrupoId: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones del formulario 
        this.formSubgrupo = this.formBuilder.group(
            {
                cveSub: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(3)]),
                descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
                principal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
                estatus: new UntypedFormControl(true),
                division: new UntypedFormControl('', [Validators.required])
            })
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        //Actualizar
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.subgrupoId = data.subgrupo.subgrupoId;
            this.formSubgrupo.get('descripcion').setValue(data.subgrupo.descripcion);
            this.formSubgrupo.get('cveSub').setValue(data.subgrupo.cveSubgrupo);
            this.formSubgrupo.get('estatus').setValue(data.subgrupo.estatus);
            this.formSubgrupo.get('principal').setValue(data.subgrupo.principal);
            this.formSubgrupo.get('division').setValue(data.subgrupo.principal.division.divisionId);
        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsDivision();

    }

    /**
     * Lista las divisiones activas
     */
    spsDivision() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaDivision').subscribe(data => {
            this.blockUI.stop();
            this.listaDivision = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Division Seleccionada
    * @param event idDivision
    */
    selectDiv() {
        this.selectedDivision = this.formSubgrupo.get('division').value;
        this.spsPrincipal();
    }
    /**
     * Lista las divisiones activas
     * @param divisionId seleccionada
     */
    spsPrincipal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(this.selectedDivision, 'listaGrupoDivision').subscribe(data => {
            this.blockUI.stop();
            this.listaPrincipal = data;
            this.opcionesGrupo = this.formSubgrupo.get('principal').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
       * Valida que el texto ingresado pertenezca a un grupo
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
      * Muestra la descripcion del grupo
      * @param option --grupo seleccionado
      * @returns --nombre de grupo
      */
    displayFn(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filta el grupo
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
        return this.listaPrincipal.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
       * Metodo para guardar los datos de subgrupo 
       */
    guardarSubgrupo() {
        if (this.formSubgrupo.invalid) {
            this.validateAllFormFields(this.formSubgrupo);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "subgrupoId": '0',
            "cveSubgrupo": this.formSubgrupo.get('cveSub').value,
            "descripcion": this.formSubgrupo.get('descripcion').value,
            "estatus": this.formSubgrupo.get('estatus').value,
            "principal": this.formSubgrupo.get('principal').value,

        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudSubgrupo').subscribe(resultado => {
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
    actualizarSubgrupo() {
        if (this.formSubgrupo.invalid) {
            this.validateAllFormFields(this.formSubgrupo);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "subgrupoId": this.subgrupoId,
            "cveSubgrupo": this.formSubgrupo.get('cveSub').value,
            "descripcion": this.formSubgrupo.get('descripcion').value,
            "estatus": this.formSubgrupo.get('estatus').value,
            "principal": this.formSubgrupo.get('principal').value
        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudSubgrupo').subscribe(resultado => {
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
     * Limpiar el formulario formPrincipal
     */
    limpiarCampos() {
        this.formSubgrupo.get('descripcion').setValue('');
        this.formSubgrupo.get('cveSub').setValue('');
        this.formSubgrupo.get('division').setValue('');
        this.formSubgrupo.get('principal').setValue('');
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
        'cveSub': [
            { type: 'required', message: ' Clave Subgrupo requerida.' },
            { type: 'pattern', message: 'Solo números de 3 dígitos.' },
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' }
        ],
        'principal': [
            { type: 'required', message: 'Grupo principal requerido.' },
            { type: 'invalidAutocompleteObject', message: 'No existe el grupo elige otro.' }
        ],
        'division': [
            { type: 'required', message: 'División requerida.' }
        ]

    }
}