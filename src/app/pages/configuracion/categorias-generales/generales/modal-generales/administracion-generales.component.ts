import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 17/09/2021
* @descripcion: Componente para la gestion de categorias
*/
@Component({
    selector: 'administracion-generales',
    moduleId: module.id,
    templateUrl: 'administracion-generales.component.html'
})

export class AdministracionGeneralesComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Generales';
    encabezado: string;
    accion: number;
    categoria : string;

    listaCategorias: any;
    generalId: number;
    formGenerales: UntypedFormGroup;
    filteredOptions: Observable<string[]>;

    @BlockUI() blockUI: NgBlockUI;

    /**
            * Constructor del componente 
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones Formulario
        this.formGenerales = this.formBuilder.group({
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(200)]),
            clave: new UntypedFormControl('', [Validators.required, Validators.maxLength(4),Validators.pattern("^([0-9]{2,2})+([a-zA-Z]{2,2})+$")]),
            categoriaId: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            estatus: new UntypedFormControl(true),
        });

        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        this.categoria = data.cveCategoria;
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.generalId = data.general.generalesId;
            this.formGenerales.get('categoriaId').setValue(data.general.categoria);
            this.formGenerales.get('clave').setValue(data.general.cveGeneral);
            this.formGenerales.get('descripcion').setValue(data.general.descripcion);
            this.formGenerales.get('estatus').setValue(data.general.estatus);
        }
    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spsCategorias();
    }
    /**
     * Metodo para listar las catgeorias
     * @param catid --Al actualizar pasa la categoriaId
     */
    spsCategorias() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaCategorias').subscribe(data => {
            this.listaCategorias = data;
      
            if(this.categoria !==''){
                this.listaCategorias = data.filter(x => x.cveCategoria === this.categoria);
            }

            this.filteredOptions = this.formGenerales.get('categoriaId').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Muestra la descripcion de la categoria
     * @param option --categoria seleccionada
     * @returns --descripcion de categoria
     */
    displayFn(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
     * Filta la categoria
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
        return this.listaCategorias.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
     * Valida que el texto ingresado pertenezca a una categoria
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
     * Metodo para limpiar los campos a guardar.
     */
    limpiarCampos() {
        this.formGenerales.get('clave').setValue('');
        this.formGenerales.get('descripcion').setValue('');
        this.formGenerales.get('categoriaId').setValue('');
    }

    /**
         * Metodo para guardar los datos de garantias
         */
    guardarGenerales() {
        //Se valida que no esten vacios los datos  
        if (this.formGenerales.invalid) {
            this.validateAllFormFields(this.formGenerales);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "categoria": this.formGenerales.get('categoriaId').value,
            "generalesId": '0',
            "cveGeneral": this.formGenerales.get('clave').value,
            "descripcion": this.formGenerales.get('descripcion').value,
            "estatus": this.formGenerales.get('estatus').value
        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 1, 'crudGenerales').subscribe(resultado => {
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
         * Metodo para actualizar los datos de garantia
         */
    actualizarGenerales() {
        //Se valida que no esten vacios los datos
        if (this.formGenerales.invalid) {
            this.validateAllFormFields(this.formGenerales);
            return;
        }
        //areglo que contiene los datos a guardar
        const data = {
            "categoria": this.formGenerales.get('categoriaId').value,
            "generalesId": this.generalId,
            "cveGeneral": this.formGenerales.get('clave').value,
            "descripcion": this.formGenerales.get('descripcion').value,
            "estatus": this.formGenerales.get('estatus').value
        };
        //uso del metodo para guardar en base de datos    
        this.service.registrarBYID(data, 2, 'crudGenerales').subscribe(resultado => {
            this.blockUI.start('Actualizando ...');
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
            'clave': [
                { type: 'required', message: ' Clave generales requerida.' },
                { type: 'pattern', message: 'Dos números,Dos letras; Ejemplo: 01JG' },
                { type: 'minLength', message: 'Minímo 4 carácteres.' }
            ],
            'descripcion': [
                { type: 'required', message: 'Descripción requerida.' }
            ],
            'categoriaId': [
                { type: 'required', message: 'Categoría requerida.' },
                { type: 'autocompleteObjectValidator', message: 'La categoría no existe elije otra.' }
            ]
        }
}