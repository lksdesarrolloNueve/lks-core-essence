import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../../../environments/environment";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { EncryptDataService } from "../../../../shared/service/encryptdata";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

/**
* @autor: María Guadalupe Santana Olalde
* @fecha: 12/05/2022
* @descripción: Componente para la gestión de listas para PEP'S
* @version: 1.0.0
*/
@Component({
    selector: 'admin-peps',
    moduleId: module.id,
    templateUrl: 'admin-peps.component.html'

})

export class AdminPepsComponent implements OnInit {

    //Declaración de variables y componentes 
    titulo: string;
    accion: number;
    pepsID: number = 0;
    formPEP: UntypedFormGroup;

    //lista de los cargos 
    listaCargos = [];
    opcionesCargo: Observable<string[]>;
    cargo: number;
    sujeto: number = 0;
    datosAct: any = [];

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase admin-peps
     * @param data - Recibe datos del padre
     * @param service - Instancia de acceso a datos
     * @param formBuilder - Instancia de construcción del formulario
     * @param cifrar - Service para la enciptación de datos
     */
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private cifrar: EncryptDataService
    ) {
        this.titulo = data.titulo;
        this.accion = data.accion;

        this.formPEP = this.formBuilder.group({

            folio: new UntypedFormControl('', [Validators.required, Validators.maxLength(7), Validators.pattern("[0-9]*")]),
            nombres: new UntypedFormControl('', [Validators.required]),
            apellidoPaterno: new UntypedFormControl('', [Validators.required]),
            apellidoMaterno: new UntypedFormControl('', [Validators.required]),
            descripcion: new UntypedFormControl('', [Validators.required,this.autocompleteObjectValidator()]),
            observaciones: new UntypedFormControl(''),
            estatus: new UntypedFormControl(true),
            pepsId: new UntypedFormControl('')
        });

        if (this.accion === 2) {
            this.datosAct = data.datos;
            this.pepsID = data.datos.pepsId;
            this.formPEP.get('pepsId').setValue(data.datos.pepsId);
            this.formPEP.get('folio').setValue(data.datos.folio);
            this.sujeto = data.datos.sujetoId;
            this.formPEP.get('nombres').setValue(data.datos.nombres);
            this.formPEP.get('apellidoPaterno').setValue(data.datos.apellidoPaterno);
            this.formPEP.get('apellidoMaterno').setValue(data.datos.apellidoMaterno);
            this.cargo = data.datos.cargosId;
            this.formPEP.get('observaciones').setValue(data.datos.observaciones);
            this.formPEP.get('estatus').setValue(data.datos.estatus);

        }
    }

    ngOnInit(): void {
        this.spsCargosPoliticos();
    }

    /**
        * Metodo para listar los  generos registrados 
        * en generales por la clave de la categoria
        * @param catGenero
        */
    spsCargosPoliticos(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catCargos, 'listaGeneralCategoria').subscribe(data => {
            this.listaCargos = data;
            let notSelect = [];
            this.opcionesCargo = this.formPEP.get('descripcion').valueChanges.pipe(
                startWith(''),
                map(value => this.filtroCargo(value))
            );

            if (this.accion == 2) {
                notSelect.push(this.listaCargos.find(n => n.generalesId === Number.parseInt((this.datosAct.cargosId))));
                this.formPEP.get('descripcion').setValue(notSelect[0]);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        }
        );
    }
    private filtroCargo(value: string): any {

        const filterValue = value;

        return this.listaCargos.filter(data => data.descripcion.toLowerCase().includes(filterValue));
    }

    displayFn(cargo: any): string {
        return cargo && cargo.descripcion ? cargo.descripcion : '';
    }

    /**
    * Método tipo crud para guardar y editar los datos de PEP'S
    */
    crudPeps() {

        if (this.formPEP.invalid) {
            this.validateAllFormFields(this.formPEP);
            return;
        }
        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }


        let jsonPEP = {
            datos: [
                this.pepsID,
                this.formPEP.get('folio').value,
                this.sujeto,
                this.formPEP.get('descripcion').value.generalesId,
                this.formPEP.get('observaciones').value,
                this.formPEP.get('estatus').value
            ],
            sujeto: [this.formPEP.get('nombres').value,
            this.formPEP.get('apellidoPaterno').value,
            this.formPEP.get('apellidoMaterno').value,],
            accion: this.accion
        };

        this.service.registrar(jsonPEP, 'crudPeps').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    this.formPEP.reset();

                    this.service.showNotification('top', 'right', 2, result[0][1])
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
    * Lista de validaciones del formulario PEP
    */
    listaValidaciones = {
        "folio": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan enteros' },
            { type: 'maxlength', message: 'Campo máximo 7 dígitos' }
        ],
        "descripcion": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "nombres": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "apellidoPaterno": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "apellidoMaterno": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "observaciones": [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };

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
}