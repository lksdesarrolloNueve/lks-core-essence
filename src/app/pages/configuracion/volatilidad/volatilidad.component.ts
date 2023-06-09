import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import * as moment from "moment";
import FuzzySearch from 'fuzzy-search';

@Component({
    selector: 'volatilidad',
    moduleId: module.id,
    templateUrl: 'volatilidad.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 7/09/2022
 * @descripcion: Componente para la gestion de Volatilidad en base al fondeo bancario
 */

export class VolatilidadComponent {
    @BlockUI() blockUI: NgBlockUI;
    formVolatilidad: UntypedFormGroup;
    searcher: any;
    public searchText: string;
    public result: [];
    today: Date = new Date();
    mesIn = new UntypedFormControl('', [Validators.required]);
    mesFin = new UntypedFormControl('', [Validators.required]);
    listaVolatilidad: any = [];
    volatilidadID: number = 0;
    /**
       * Constructor de la clase FondeoBancarioComponent
       * @param service  service para el acceso a datos
       */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder) {
        this.mesIn.setValue(this.today);
        this.mesFin.setValue(this.today);

        this.formVolatilidad = this.formBuilder.group({
            fecha: new UntypedFormControl('',[Validators.required]),
            min: new UntypedFormControl(''),
            max: new UntypedFormControl(''),
            media: new UntypedFormControl(''),
            desv: new UntypedFormControl(''),
            limInf1: new UntypedFormControl(''),
            limSup1: new UntypedFormControl(''),
            volat1: new UntypedFormControl(''),
            limInf7: new UntypedFormControl(''),
            limSup7: new UntypedFormControl(''),
            volat7: new UntypedFormControl(''),
            limInf30: new UntypedFormControl(''),
            limSup30: new UntypedFormControl(''),
            volat30: new UntypedFormControl(''),
            limInf90: new UntypedFormControl(''),
            limSup90: new UntypedFormControl(''),
            volat90: new UntypedFormControl(''),
            limInf360: new UntypedFormControl(''),
            limSup360: new UntypedFormControl(''),
            volat360: new UntypedFormControl('')
        });
    }
    ngOnInit() {
        this.spsVolatilidad();
    }
  /**
     * Busca el dondeo que se teclea en el filtro
     */
   buscarVolatilidad() {
    this.result = this.searcher.search(this.searchText);
    this.listaVolatilidad = this.result;
}
    /** 
           * Método para consultar y listar los fondeos
           * @param fechaInicio
           * @param fechaFinal
           */
    spsVolatilidad() {
        this.blockUI.start('Cargando datos...');
        let path = moment(this.mesIn.value).format("YYYY-MM-DD") + '/' + moment(this.mesFin.value).format("YYYY-MM-DD")
        this.service.getListByID(path, 'spsVolatilidad').subscribe(vol => {
            if (!this.vacio(vol)) {
                this.listaVolatilidad = JSON.parse(vol);
                this.searcher = new FuzzySearch(this.listaVolatilidad, ['fecha'], {
                    caseSensitive: false,
                });
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Mostrar datos del calculo volatilidad de la fecha seleccioanda
     * @param vol - Datos volatilidad 
     */
    mostrarV(vol,accion) {
        if(accion==1){
        this.volatilidadID = vol.volatilidad_id;
    }
        this.formVolatilidad.get('fecha').setValue(vol.fecha+ 'T00:00:00');
        this.formVolatilidad.get('min').setValue(vol.min);
        this.formVolatilidad.get('max').setValue(vol.max);
        this.formVolatilidad.get('media').setValue(vol.media);
        this.formVolatilidad.get('desv').setValue(vol.desv);
        this.formVolatilidad.get('limInf1').setValue(vol.limi1);
        this.formVolatilidad.get('limSup1').setValue(vol.lims1);
        this.formVolatilidad.get('volat1').setValue(vol.limv1);
        this.formVolatilidad.get('limInf7').setValue(vol.limi7);
        this.formVolatilidad.get('limSup7').setValue(vol.lims7);
        this.formVolatilidad.get('volat7').setValue(vol.limv7);
        this.formVolatilidad.get('limInf30').setValue(vol.limi30);
        this.formVolatilidad.get('limSup30').setValue(vol.lims30);
        this.formVolatilidad.get('volat30').setValue(vol.limv30);
        this.formVolatilidad.get('limInf90').setValue(vol.limi90);
        this.formVolatilidad.get('limSup90').setValue(vol.limi90);
        this.formVolatilidad.get('volat90').setValue(vol.limv90);
        this.formVolatilidad.get('limInf360').setValue(vol.limi360);
        this.formVolatilidad.get('limSup360').setValue(vol.lims360);
        this.formVolatilidad.get('volat360').setValue(vol.limv360);

    }
    /**
         * Metodo CRUD para Volatilidad
         */
    crudVolatilidad(accion) {
        this.blockUI.start('Cargando datos...');
        let fecha = moment(this.formVolatilidad.get('fecha').value).format("YYYY-MM-DD");
     
        if (accion != 1) {
            this.validacionesFormulario();
        }else{
            this.limpiarValidaciones();
        }
        if (this.formVolatilidad.invalid) {
            this.validateAllFormFields(this.formVolatilidad);
            this.service.showNotification('top', 'right', 3, "Completa los datos.");
            this.blockUI.stop();
            return;
        }
        let path = fecha + '/' + accion;
        this.service.registrarBYParametro(path, 'crudVolatilidad').subscribe(crudV => {
            let calculo;
            if (crudV[0][0] === '0') {//exito
                this.service.showNotification('top', 'right', 2, crudV[0][1]);
                if (accion == 1) {
                    if (!this.vacio(crudV[0][2])) {
                        calculo = JSON.parse(crudV[0][2]);
                        this.mostrarV(calculo[0],2);
                    }
                }
                this.blockUI.stop();
            } else {//error 
                this.limpiar();
                this.service.showNotification('top', 'right', 3, crudV[0][1]);
            }
            this.blockUI.stop();
        }, error => {
            this.limpiar();
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para validar el formulario al momento de guardar o actualizar
     */
    validacionesFormulario(){
        this.formVolatilidad.get('min').setValidators([Validators.required]);
        this.formVolatilidad.get('min').updateValueAndValidity();
        this.formVolatilidad.get('max').setValidators([Validators.required]);
        this.formVolatilidad.get('max').updateValueAndValidity();
        this.formVolatilidad.get('media').setValidators([Validators.required]);
        this.formVolatilidad.get('media').updateValueAndValidity();
        this.formVolatilidad.get('desv').setValidators([Validators.required]);
        this.formVolatilidad.get('desv').updateValueAndValidity();
        this.formVolatilidad.get('limInf1').setValidators([Validators.required]);
        this.formVolatilidad.get('limInf1').updateValueAndValidity();
        this.formVolatilidad.get('limSup1').setValidators([Validators.required]);
        this.formVolatilidad.get('limSup1').updateValueAndValidity();
        this.formVolatilidad.get('volat1').setValidators([Validators.required]);
        this.formVolatilidad.get('volat1').updateValueAndValidity();
        this.formVolatilidad.get('limInf7').setValidators([Validators.required]);
        this.formVolatilidad.get('limInf7').updateValueAndValidity();
        this.formVolatilidad.get('limSup7').setValidators([Validators.required]);
        this.formVolatilidad.get('limSup7').updateValueAndValidity();
        this.formVolatilidad.get('volat7').setValidators([Validators.required]);
        this.formVolatilidad.get('volat7').updateValueAndValidity();
        this.formVolatilidad.get('limInf30').setValidators([Validators.required]);
        this.formVolatilidad.get('limInf30').updateValueAndValidity();
        this.formVolatilidad.get('limSup30').setValidators([Validators.required]);
        this.formVolatilidad.get('limSup30').updateValueAndValidity();
        this.formVolatilidad.get('volat30').setValidators([Validators.required]);
        this.formVolatilidad.get('volat30').updateValueAndValidity();
        this.formVolatilidad.get('limInf90').setValidators([Validators.required]);
        this.formVolatilidad.get('limInf90').updateValueAndValidity();
        this.formVolatilidad.get('limSup90').setValidators([Validators.required]);
        this.formVolatilidad.get('limSup90').updateValueAndValidity();
        this.formVolatilidad.get('volat90').setValidators([Validators.required]);
        this.formVolatilidad.get('volat90').updateValueAndValidity();
        this.formVolatilidad.get('limInf360').setValidators([Validators.required]);
        this.formVolatilidad.get('limInf360').updateValueAndValidity();
        this.formVolatilidad.get('limSup360').setValidators([Validators.required]);
        this.formVolatilidad.get('limSup360').updateValueAndValidity();
        this.formVolatilidad.get('volat360').setValidators([Validators.required]);
        this.formVolatilidad.get('volat360').updateValueAndValidity();
    }
    /**
     * Limpiar validaciones al calcular
     */
    /**
     * Metodo para validar el formulario al momento de guardar o actualizar
     */
     limpiarValidaciones(){
        this.formVolatilidad.get('min').setValidators([]);
        this.formVolatilidad.get('min').updateValueAndValidity();
        this.formVolatilidad.get('max').setValidators([]);
        this.formVolatilidad.get('max').updateValueAndValidity();
        this.formVolatilidad.get('media').setValidators([]);
        this.formVolatilidad.get('media').updateValueAndValidity();
        this.formVolatilidad.get('desv').setValidators([]);
        this.formVolatilidad.get('desv').updateValueAndValidity();
        this.formVolatilidad.get('limInf1').setValidators([]);
        this.formVolatilidad.get('limInf1').updateValueAndValidity();
        this.formVolatilidad.get('limSup1').setValidators([]);
        this.formVolatilidad.get('limSup1').updateValueAndValidity();
        this.formVolatilidad.get('volat1').setValidators([]);
        this.formVolatilidad.get('volat1').updateValueAndValidity();
        this.formVolatilidad.get('limInf7').setValidators([]);
        this.formVolatilidad.get('limInf7').updateValueAndValidity();
        this.formVolatilidad.get('limSup7').setValidators([]);
        this.formVolatilidad.get('limSup7').updateValueAndValidity();
        this.formVolatilidad.get('volat7').setValidators([]);
        this.formVolatilidad.get('volat7').updateValueAndValidity();
        this.formVolatilidad.get('limInf30').setValidators([]);
        this.formVolatilidad.get('limInf30').updateValueAndValidity();
        this.formVolatilidad.get('limSup30').setValidators([]);
        this.formVolatilidad.get('limSup30').updateValueAndValidity();
        this.formVolatilidad.get('volat30').setValidators([]);
        this.formVolatilidad.get('volat30').updateValueAndValidity();
        this.formVolatilidad.get('limInf90').setValidators([]);
        this.formVolatilidad.get('limInf90').updateValueAndValidity();
        this.formVolatilidad.get('limSup90').setValidators([]);
        this.formVolatilidad.get('limSup90').updateValueAndValidity();
        this.formVolatilidad.get('volat90').setValidators([]);
        this.formVolatilidad.get('volat90').updateValueAndValidity();
        this.formVolatilidad.get('limInf360').setValidators([]);
        this.formVolatilidad.get('limInf360').updateValueAndValidity();
        this.formVolatilidad.get('limSup360').setValidators([]);
        this.formVolatilidad.get('limSup360').updateValueAndValidity();
        this.formVolatilidad.get('volat360').setValidators([]);
        this.formVolatilidad.get('volat360').updateValueAndValidity();
    }
    /**
     * Limpiar formulario
     * @param formVolatilidad
     */
    limpiar(){
        this.formVolatilidad.get('fecha').setValue('');
        this.formVolatilidad.get('min').setValue('');
        this.formVolatilidad.get('max').setValue('');
        this.formVolatilidad.get('media').setValue('');
        this.formVolatilidad.get('desv').setValue('');
        this.formVolatilidad.get('limInf1').setValue('');
        this.formVolatilidad.get('limSup1').setValue('');
        this.formVolatilidad.get('volat1').setValue('');
        this.formVolatilidad.get('limInf7').setValue('');
        this.formVolatilidad.get('limSup7').setValue('');
        this.formVolatilidad.get('volat7').setValue('');
        this.formVolatilidad.get('limInf30').setValue('');
        this.formVolatilidad.get('limSup30').setValue('');
        this.formVolatilidad.get('volat30').setValue('');
        this.formVolatilidad.get('limInf90').setValue('');
        this.formVolatilidad.get('limSup90').setValue('');
        this.formVolatilidad.get('volat90').setValue('');
        this.formVolatilidad.get('limInf360').setValue('');
        this.formVolatilidad.get('limSup360').setValue('');
        this.formVolatilidad.get('volat360').setValue('');
    }
    /**
       * Valida Cada atributo del formulario
       * @param formGroup - Recibe cualquier tipo de FormGroup
       */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);             //3
            if (control instanceof UntypedFormControl) {             //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //5
                this.validateAllFormFields(control);            //6
            }
        });
    }
    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

     /**
    * Mensaje de validaciones
    */
      validaciones = {
        'fecha': [
            { type: 'required', message: 'Fecha requerida.' }
        ]
    }
}