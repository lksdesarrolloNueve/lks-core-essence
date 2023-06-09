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
* @descripcion: Componente para la gestion de grupo unitario
*/
@Component({
    selector: 'administracion-unitario',
    moduleId: module.id,
    templateUrl: 'administracion-unitario.component.html'
})

export class AdministracionUnitarioComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Grupo Unitario';
    encabezado: string;
    accion: number;
    listaDivision:any;
    listaPrincipal:any;
    listaSubgrupo:any;
    formUnitario: UntypedFormGroup;
    opcionesGrupo: Observable<string[]>;
    opcionesSubGrupo: Observable<string[]>;
    selectedDivision: number;
    selectedGrupo:number

    isChecked = true;    
    unitarioId: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService,private formBuilder: UntypedFormBuilder,@Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones del formulario 
        this.formUnitario = this.formBuilder.group(
            {
                cveUni: new UntypedFormControl('',[ Validators.required,Validators.pattern("^[0-9]*$"), Validators.minLength(4)]),
                descripcion: new UntypedFormControl('',[ Validators.required]),
                subgrupo: new UntypedFormControl('',{ validators: [this.autocompleteObjectValidator(),Validators.required]}),
                estatus: new UntypedFormControl(true),
                division: new UntypedFormControl('', [ Validators.required]),
                principal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] })
            })
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        //Actualizar
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.unitarioId = data.unitario.unitarioId;
            this.formUnitario.get('descripcion').setValue(data.unitario.descripcion);
            this.formUnitario.get('cveUni').setValue(data.unitario.cveUnitario);            
            this.formUnitario.get('estatus').setValue(data.unitario.estatus);
            this.formUnitario.get('division').setValue(data.unitario.subgrupo.principal.division.divisionId);
            this.formUnitario.get('principal').setValue(data.unitario.subgrupo.principal);
            this.formUnitario.get('subgrupo').setValue(data.unitario.subgrupo);
            
        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsDivision();
    }
 /**
     * Lista las division activas
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
        this.selectedDivision = this.formUnitario.get('division').value;
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
            this.opcionesGrupo = this.formUnitario.get('principal').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
       * Valida que el texto ingresado pertenezca a un grupo principal/subgrupo
       * @returns mensaje de error.
       */
     autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
          if (typeof control.value === 'string'  && control.value.length > 0) {
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
        return this.listaPrincipal.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
      /**
         * Metodo opcionSeleccionada
         * permite obtner el id o descripcion al cambiar el grupo
         * @param event -- grupo principal seleccionado
         */
       opcionSeleccionada(event) {
        this.selectedGrupo=event.option.value.grupoId;
        this.spsSubGrupo();
    }

       /**
     * Lista los Subgrupo  por Grupo Principal
     */
        spsSubGrupo() {
            this.blockUI.start('Cargando datos...');
            this.service.getListByID(this.selectedGrupo, 'listaSubPrincipal').subscribe(data => {
                this.blockUI.stop();
                this.listaSubgrupo = data;    
                this.opcionesSubGrupo= this.formUnitario.get('subgrupo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterS(value))
                );                
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });
        }
         /**
      * Muestra la descripcion del Subgrupo
      * @param option --grupo seleccionado
      * @returns --nombre de Subgrupo
      */
    displayFnS(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filta el Subgrupo 
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterS(value: any): any[] {
        let filterValue = value;
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSubgrupo.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }
    /**
       * Metodo para guardar los datos de subgrupo 
       */
     guardarUnitario() {
        if (this.formUnitario.invalid) {
            this.validateAllFormFields(this.formUnitario);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "unitarioId": '0',
            "cveUnitario": this.formUnitario.get('cveUni').value,
            "descripcion": this.formUnitario.get('descripcion').value,
            "estatus": this.formUnitario.get('estatus').value,
            "subgrupo": this.formUnitario.get('subgrupo').value

        };
        
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudUnitario').subscribe(resultado => {
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
     actualizarUnitario() {
        if (this.formUnitario.invalid) {
            this.validateAllFormFields(this.formUnitario);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "unitarioId": this.unitarioId,
            "cveUnitario": this.formUnitario.get('cveUni').value,
            "descripcion": this.formUnitario.get('descripcion').value,
            "estatus": this.formUnitario.get('estatus').value,
            "subgrupo": this.formUnitario.get('subgrupo').value
        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudUnitario').subscribe(resultado => {
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
        this.formUnitario.get('descripcion').setValue('');
        this.formUnitario.get('cveUni').setValue('');
        this.formUnitario.get('subgrupo').setValue('');
        this.formUnitario.get('division').setValue('');
        this.formUnitario.get('principal').setValue('');
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
    'cveUni': [
        { type: 'required', message: ' Clave Grupo Unitario requerida.' },
        { type: 'pattern', message: 'Solo números de 4 dígitos.' }
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
    ],
    'subgrupo': [
        { type: 'required', message: 'Subgrupo requerido.' },
        { type: 'invalidAutocompleteObject', message: 'No existe el subgrupo elige otro.' }
    ]

}
}