import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";



@Component({
    selector: 'administracion-formas-pago',
    moduleId: module.id,
    templateUrl: 'administracion-formas-pago.component.html'
})
/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 29/09/2021
 * @descripcion: AdministracionComponente para la gestion de las formas de pago
 */

export class AdministracionFormasPago implements OnInit {
    //Declaracion de variables
    titulo = 'Formas Pago';
    encabezado: string;
    accion: number;


    @BlockUI() blockUI: NgBlockUI;//loader

    //Inicio Autocomplete Componentes
    listaMonedas: any[];
    filteredMonedas: Observable<string[]>;

    formPago: UntypedFormGroup;
    fpagoid: number;

    
    //Fin autocompletador

    /*
     *Validaciones para todos los campos agregados
     */
     validaciones = {
        'cvePago': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 2 dígitos' },
        ],
        'nombreFpago': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 200 dígitos' },
        ],
        'icono': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 100 dígitos' },
        ],
        'moneda': [
            { type: 'required', message: 'Campo requerido' }
        ]
    };


    /**
     * Constructor del componente formas de pago
     * @param service 
     */

    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formPago = this.fomrBuilder.group({
            cvePago : new UntypedFormControl('', [Validators.required, Validators.maxLength(2)]),
            nombreFpago : new UntypedFormControl('', [Validators.required, Validators.maxLength(200)]),
            moneda : new UntypedFormControl('', [Validators.required]),
            icono : new UntypedFormControl('', [Validators.required, Validators.maxLength(100)]),
            estatus : new UntypedFormControl(true),
          
        });


        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
               this.fpagoid = data.formapago.fpagoid;
               this.formPago.get('cvePago').setValue(data.formapago.cvefpago);
               this.formPago.get('nombreFpago').setValue(data.formapago.nombrefpago);
               this.formPago.get('moneda').setValue(data.formapago.monedasat);
               this.formPago.get('icono').setValue(data.formapago.icono);
               this.formPago.get('estatus').setValue(data.formapago.estatus);
               

        }
    }

    /**
     * Metodo ngOnInit de la clase
     */
    ngOnInit() {
        this.spsMonedas();
    }

    /**
     * Metodo para guardar los datos de las formas de pago
     */

    guardarFormaPago() {

        if (this.formPago.invalid) {
            this.validateAllFormFields(this.formPago);
            return;
        }

        this.blockUI.start('Guardando ...');
        const data = {
            "fpagoid": 0,
            "cvefpago": this.formPago.get('cvePago').value,
            "nombrefpago": this.formPago.get('nombreFpago').value,
            "icono": this.formPago.get('icono').value,
            "estatus": this.formPago.get('estatus').value,
            "monedasat": this.formPago.get('moneda').value
        };
        this.service.registrarBYID(data, 1, 'crudFormasPago').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formPago.reset();
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

    /**
     * Metodo para actualizar la forma de pago
     */
    editarFormaPago(){

        if (this.formPago.invalid) {
            this.validateAllFormFields(this.formPago);
            return;
        }
        
        this.blockUI.start('Editando ...');
        const data = {
            "fpagoid": this.fpagoid,
            "cvefpago": this.formPago.get('cvePago').value,
            "nombrefpago": this.formPago.get('nombreFpago').value,
            "icono": this.formPago.get('icono').value,
            "estatus": this.formPago.get('estatus').value,
            "monedasat": this.formPago.get('moneda').value
        };
        this.service.registrarBYID(data, 2, 'crudFormasPago').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
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

     /**
     * Metodo para obtener la lista de monedas
     */
      spsMonedas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2,'listaMonedas').subscribe(data => {
            this.blockUI.stop();
            this.listaMonedas = data;
            this.filteredMonedas = this.formPago.get('moneda').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

        /**
    * Filtra la forma de pago
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
         private _filter(value: any): any {

            let filterValue = value;

            if(value === null || value === undefined) {
                value = '';
            }
    
            if (!value[0]) {
                filterValue = value;
            } else {
                filterValue = value.toLowerCase();
            }
    
            return this.listaMonedas.filter(option => option.nombreMoneda.toLowerCase().includes(filterValue));
        }

            /**
      * Muestra la descripcion de la forma de pago
      * @param option --estado seleccionada
      * @returns --nombre de estado
      */
             displayFn(option: any): any {
        return option ? option.nombreMoneda : undefined;
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


    
}

