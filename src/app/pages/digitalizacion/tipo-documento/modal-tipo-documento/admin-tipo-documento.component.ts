import { Component, Inject, OnInit, ViewChild, ElementRef } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from "rxjs";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { map, startWith } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";



@Component({
    selector: 'admin-tipo-documento',
    moduleId: module.id,
    templateUrl: 'admin-tipo-documento.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 13/10/2021
 * @descripcion: Componente para la gestion de tipo de documentos
 */

export class AdminTipoDocumentoComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    tipoDocumentoID: number = 0;
    @BlockUI() blockUI: NgBlockUI;
    listaTipoDocumento: any;
    formatoControl = new UntypedFormControl('', [Validators.required])
    formTipoDocumento: UntypedFormGroup;
    filteredFormatos: Observable<string[]>;


    listaFormatoDocumento: any[];
    listaFormatos: any;
    listaAgregaFormatos: any[] = [];
    arrayIdsFP: any[] = [];
    arrayIdsFPR: any[] = [];
    listaEliminadosFormatos: any[] = [];
    formatos = new UntypedFormControl('');

    //Variables Chips Formatos
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];


    @ViewChild('formatoInput') formatoInput: ElementRef<HTMLInputElement>;
    //Fin variables Chips formatos


    //Creación del arreglo para implementar las validaciones
    //en el modal de admin-tipo-documento.component.html
    validaciones = {
        'claveTipoDocumento': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 5 carácteres.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'nombreDoc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 60 carácteres.' },
        ],
        'limiteMB': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros.' }
        ]
    }

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.listaAgregaFormatos = [];
        this.listaEliminadosFormatos = [];
        this.arrayIdsFP = [];
        this.titulo = data.titulo + ' Tipo Documento';
        this.accion = data.accion;
        this.formTipoDocumento = this.formBuilder.group({
            estatus: new UntypedFormControl(true)//boolean
        });
        this.formTipoDocumento = this.formBuilder.group({
            claveTipoDocumento: new UntypedFormControl('', [Validators.required, Validators.maxLength(5)]),
            nombreDoc: new UntypedFormControl('', [Validators.required, Validators.maxLength(60)]),
            limiteMB: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            estatus: new UntypedFormControl(true)
        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.tipoDocumentoID = data.tipoDocumento.tipoDocumentoID;
            this.formTipoDocumento.controls['claveTipoDocumento'].setValue(data.tipoDocumento.claveTipoDocumento);
            this.formTipoDocumento.controls['limiteMB'].setValue(data.tipoDocumento.limiteMB);
            this.formTipoDocumento.controls['nombreDoc'].setValue(data.tipoDocumento.nombreDoc.trim());
            this.formTipoDocumento.controls['estatus'].setValue(data.tipoDocumento.estatus);
            this.spsFormatoDocumento(data.tipoDocumento.claveTipoDocumento);
        }
    }

    /**
     * Metodo que abre un modal para la gestion de Inversion
     */

    ngOnInit() {
        this.spsFormato();

    }



    /**
     * Metodo que consulta las Formas de Pago del Movimiento Cajas
     */
    spsFormatoDocumento(elemento: any) {
        this.blockUI.start('Cargando datos...');
        let path = elemento + '/' + 1;
        this.service.getListByID(path, 'listaFormatoDocumento').subscribe(data => {
            this.blockUI.stop();
            this.listaAgregaFormatos = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
   * Metodo para cargar las formas de pagos que existen
   */
    spsFormato() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('10EA', 'listaGeneralCategoria').subscribe(data => {
            this.blockUI.stop();
            this.listaFormatos = data;
            this.filteredFormatos = this.formatos.valueChanges.pipe(
                startWith(null),
                map((formato: string | null) => formato ? this._filter(formato) : this.listaFormatos.slice()));

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * agrega nuevos formatos a la lista
     * @param event 
     */
    selectedFormato(event: MatAutocompleteSelectedEvent): void {
        const index = this.listaAgregaFormatos.indexOf(event.option.value);
        const index2 = this.listaEliminadosFormatos.indexOf(event.option.value);

        if (index < 0) {
            this.listaAgregaFormatos.push(event.option.value);
            this.formatoInput.nativeElement.value = '';
            this.formatos.setValue(null);
        }

        if (index2 < 0) {
            this.listaEliminadosFormatos.splice(index2, 1);
        }

    }

    /**
     * Metodo que guarda y edita tipo Documento
     */
    crudTipoDocumento(): void {
        /**
         * Validacion complementaria para la validacion de guardado de datos en el formulario formTipoDocumento
         */
        if (this.formTipoDocumento.invalid) {
            this.validateAllFormFields(this.formTipoDocumento);
            return;
        }

        if(this.listaAgregaFormatos.length === 0){
            this.service.showNotification('top', 'right', 3,'Agrega al menos un tipo de formato');
            return;
        }

        this.blockUI.start('Guardando ...');
        /**
         * Se estructura y se setean los datos al JSON 
         */
        const data = {
            "tipoDocumentoID": this.tipoDocumentoID,
            "claveTipoDocumento": this.formTipoDocumento.get('claveTipoDocumento').value,
            "nombreDoc": this.formTipoDocumento.get('nombreDoc').value,
            "limiteMB": this.formTipoDocumento.get('limiteMB').value,
            "estatus": this.formTipoDocumento.get('estatus').value

        }
        //recorre las listas agregando los ID de los formatos
        for (let idsFP of this.listaAgregaFormatos) {
            this.arrayIdsFP.push(idsFP.generalesId);
        }

        if (this.arrayIdsFP.length === 0) {
            this.arrayIdsFP.push('0');
        }
        let headerPath = this.arrayIdsFP + '/0/' + 1;

        this.service.registrarBYID(data, headerPath, 'crudTipoDocumento').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formTipoDocumento.reset();
                    this.nuevoTipoDocumento();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.arrayIdsFPR = [];
                this.arrayIdsFP = [];
                this.service.showNotification('top', 'right', 4, error.message)


            }
        )

    }

    /**
    * Metodo que guarda y edita tipo Documento
    */
    editarTipoDocumento(elemento: any): void {

        /**
         * Validacion complementaria para la validacion de guardado de datos en el formulario formTipoDocumento
         */

        if (this.formTipoDocumento.invalid) {
            this.validateAllFormFields(this.formTipoDocumento);
            return;
        }

        if(this.listaAgregaFormatos.length === 0){
            this.service.showNotification('top', 'right', 3,'Agrega al menos un tipo de formato');
            return;
        }
   
        this.blockUI.start('Editando ...');
        /**
         * Se estructura y se setean los datos al JSON 
         */
        const data = {
            "tipoDocumentoID": this.tipoDocumentoID,
            "claveTipoDocumento": this.formTipoDocumento.get('claveTipoDocumento').value,
            "nombreDoc": this.formTipoDocumento.get('nombreDoc').value,
            "limiteMB": this.formTipoDocumento.get('limiteMB').value,
            "estatus": this.formTipoDocumento.get('estatus').value

        }
        //recorre las listas agregando los ID de los formatos
        for (let idsFP of this.listaAgregaFormatos) {
            this.arrayIdsFP.push(idsFP.generalesId);

        }

        //recorre las listas agregando los ID de los formatos que seran eliminados 
        for (let idsFPR of this.listaEliminadosFormatos) {
            this.arrayIdsFPR.push(idsFPR.generalesId);
        }

        // valida si viene vacio el arreglo, le concatena un 0
        if (this.arrayIdsFPR.length == 0) {
            this.arrayIdsFPR.push(0);
        }

        let headerPath = this.arrayIdsFP + '/' + this.arrayIdsFPR + '/' + 2;

        this.service.registrarBYID(data, headerPath, 'crudTipoDocumento').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.arrayIdsFPR = [];
                this.arrayIdsFP = [];
                this.service.showNotification('top', 'right', 4, error.message)
            }
        )

    }

    /**
         * filtra los formatos
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

        return this.listaFormatos.filter(formato => formato.descripcion.toLowerCase().includes(filterValue));
    }


    /**
    * Inicio Gestion Formatos para remover de la selección
    */
    removeFormato(formatosT: string): void {
        const index = this.listaAgregaFormatos.indexOf(formatosT);
        if (index >= 0) {
            //this.listaEliminadosFormatos = [];
            this.listaEliminadosFormatos = this.listaAgregaFormatos.splice(index, 1);
        }

    }


    /**
    * Carga todos los combos y resetea el form
    */
    nuevoTipoDocumento() {
        this.formTipoDocumento.reset();
        this.spsFormato();
        this.listaAgregaFormatos = [];
        this.listaEliminadosFormatos = [];
        this.arrayIdsFPR = [];
        this.arrayIdsFP = [];

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