import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";



@Component({
    selector:'administracion-estados',
    moduleId: module.id,
    templateUrl:'administracion-estados.component.html'
})
/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 22/09/2021
 * @descripcion: AdministracionComponente para la gestion de estados
 */
export class AdministracionEstadosComponent implements OnInit{
     //Declaracion de variables
     titulo= 'Estado';
     encabezado: string;
     accion: number;

    estadoid: number=0;
     /***
      * Se crean los FormControl(); con los datod que va a recibir
      */
      formEstados: UntypedFormGroup;

      @BlockUI() blockUI: NgBlockUI;

       /* 
    *Metodo para validar campos
    */
    validaciones = {
        'nombreEstado': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 100 dígitos' },
        ],
        'nivelRiesgo': [
            { type: 'required', message: 'Campo requerido' },
        ],
        'cveEstado': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 4 dígitos'}
        ],
        'cveInegi': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 2 dígitos' },
        ],
        'cveEstadoBuro': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 6 dígitos' },
        ],
        'nacionalidad': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 300 dígitos' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido' }
        ]
    };
  

    //Inicio Autocomplete Componentes
    listaNacionalidades : any[];
    listaGenerales: any[];
    filteredNacionalidades: Observable<string[]>;

    //Fin autoonpletador

     /**
         * Constructor del componente estados
         * @param service 
         */

     constructor (private service: GestionGenericaService, 
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any){
         this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formEstados = this.formbuilder.group({
            nombreEstado: new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
            nivelRiesgo: new UntypedFormControl ('',{validators: [Validators.required,this.autocompleteObjectValidator()]}),
            cveEstado: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            cveInegi: new UntypedFormControl('', [Validators.required, Validators.maxLength(2)]),
            cveEstadoBuro: new UntypedFormControl('', [Validators.required, Validators.maxLength(6)]),
            nacionalidad: new UntypedFormControl('',{validators: [Validators.required,this.autocompleteObjectValidator()]}),
            estatus: new UntypedFormControl(true)


        });
        if (this.accion === 2){
             //se pasan los datos de la tabla al formulario

             this.estadoid = data.estado.estadoid;
             this.formEstados.get('nombreEstado').setValue(data.estado.nombreEstado);
             this.formEstados.get('nivelRiesgo').setValue(data.estado.nivelRiesgo.generalesId);
             this.formEstados.get('cveEstado').setValue(data.estado.cveEstado);
             this.formEstados.get('cveInegi').setValue(data.estado.cveInegi);
             this.formEstados.get('cveEstadoBuro').setValue(data.estado.cveEstadoBuro);
            this.formEstados.get('nacionalidad').setValue(data.estado.nacionalidad);
             this.formEstados.get('estatus').setValue(data.estado.estatus);

        }
     }
     /**
     * Metodo OnInit de la clase
     */
      ngOnInit() {

        this.spsNacionalidades();
        this. spsNivelR();

    }

    /**
     * Metodo para guardar los datos de estado
     */
     guardarEstado() {
        if (this.formEstados.invalid) {
            this.validateAllFormFields(this.formEstados);
            return;
        }
        this.blockUI.start('Guardando Datos...');

        //areglo que contiene los datos a guardar
        const data = {
            "estadoid": 0,
            "nombreEstado" : this.formEstados.get('nombreEstado').value,
            "nivelRiesgo":{"generalesId":this.formEstados.get('nivelRiesgo').value} ,
            "cveEstado": this.formEstados.get('cveEstado').value,
            "cveInegi": this.formEstados.get('cveInegi').value,
            "cveEstadoBuro": this.formEstados.get('cveEstadoBuro').value,
            "estatus": this.formEstados.get('estatus').value,
            "nacionalidad": this.formEstados.get('nacionalidad').value 
        };
        //uso del metodo para guardar en base de datos
        if (this.formEstados.get('nombreEstado').value && this.formEstados.get('nivelRiesgo').value && this.formEstados.get('cveEstado').value) {
            this.service.registrarBYID(data, 1, 'crudEstados').subscribe(resultado => {
            
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
        } //fin de guardar
    }

     /**
     * Metodo para guardar los datos de estados
     */
      actualizarEstado() {
        if (this.formEstados.invalid) {
            this.validateAllFormFields(this.formEstados);
            return;
        }
        this.blockUI.start('Editando Datos...');
        //areglo que contiene los datos actualizar
        const data = {
            "estadoid": this.estadoid,
            "nombreEstado" : this.formEstados.get('nombreEstado').value,
            "nivelRiesgo":{"generalesId":this.formEstados.get('nivelRiesgo').value} ,
            "cveEstado": this.formEstados.get('cveEstado').value,
            "cveInegi": this.formEstados.get('cveInegi').value,
            "cveEstadoBuro": this.formEstados.get('cveEstadoBuro').value,
            "estatus": this.formEstados.get('estatus').value,
            "nacionalidad": this.formEstados.get('nacionalidad').value 
        };
        //se manda llamar el metodo
        if (this.formEstados.get('nombreEstado').value && this.formEstados.get('nivelRiesgo').value 
        && this.formEstados.get('cveEstado').value && this.formEstados.get('cveInegi').value) {
            this.service.registrarBYID(data, 2, 'crudEstados').subscribe(resultado => {
                if (resultado[0][0] === '0') {//exito   
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
        }//fin 
    }

      /**
     * Metodo limpiarCampos
     * Vacia los campos cada vez  que se guarda una Nacionalidad
     */
       limpiarCampos() {
        this.estadoid = 0;
        this.formEstados.get('nombreEstado').setValue("");
        this.formEstados.get('nivelRiesgo').setValue("");
        this.formEstados.get('cveEstado').setValue("");
        this.formEstados.get('cveInegi').setValue("");
        this.formEstados.get('cveEstadoBuro').setValue("");
    }


      /**
     * Metodo para obtener la lista de nacionalidades
     */
       spsNacionalidades() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaNacionalidades').subscribe(data => {
            this.blockUI.stop();

            this.listaNacionalidades = data;

            this.filteredNacionalidades = this.formEstados.get('nacionalidad').valueChanges.pipe(
                startWith('Mexicana'),
                map(value => this.filtroNacionaldiad(value))
              );
           
           
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Se GREGA UN FILTRO PARA NACIONALIDADES 
     * @param value 
     * @returns 
     */
    private filtroNacionaldiad(value: string): any {
        const filterValue = value;
    
        return this.listaNacionalidades.filter(data => data.nacion.toLowerCase().includes(filterValue));
      }

      displayFn(nacion: any): string {
        return nacion && nacion.nacion ? nacion.nacion : '';
      }



        /**
     * Metodo para listar las generales por categoria
     * @param general
     */
   spsNivelR() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID('02RE','listaGeneralCategoria').subscribe(data => {
      this.listaGenerales= data;           
        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
}

      /**
 * Valida Cada atributo del formulario
 * @param formGroup - Recibe cualquier tipo de FormGroup
 */
       validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);             //{3}
            if (control instanceof UntypedFormControl) {             //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
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