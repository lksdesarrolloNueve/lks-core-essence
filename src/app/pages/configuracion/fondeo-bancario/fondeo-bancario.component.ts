import { DatePipe } from "@angular/common";
import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import * as moment from "moment";
import FuzzySearch from 'fuzzy-search';

@Component({
    selector: 'fondeo-bancario',
    moduleId: module.id,
    templateUrl: 'fondeo-bancario.component.html'
})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 7/09/2022
 * @descripcion: Componente para la gestion de fondeo bancario
 */

export class FondeoBancarioComponent {
    @BlockUI() blockUI: NgBlockUI;
    formFondeo: UntypedFormGroup;
    searcher: any;
    public searchText: string;
    public result: [];
    listaFondeo: any = [];
    today: Date = new Date();
    datePipe = new DatePipe('en-US');

    mesIn = new UntypedFormControl('', [Validators.required]);
    mesFin = new UntypedFormControl('', [Validators.required]);

    fondeID: number = 0;
    /**
       * Constructor de la clase FondeoBancarioComponent
       * @param service  service para el acceso a datos
       */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder) {
        this.mesIn.setValue(this.today);
        this.mesFin.setValue(this.today);

        this.formFondeo = this.formBuilder.group({
            fecha: new UntypedFormControl('', [Validators.required]),
            apertura: new UntypedFormControl('', [Validators.required]),
            cierre: new UntypedFormControl('', [Validators.required]),
            minimo: new UntypedFormControl('', [Validators.required]),
            maximo: new UntypedFormControl('', [Validators.required]),
            ponderado: new UntypedFormControl('', [Validators.required])
        });

    }

    ngOnInit() {
        this.spsFondeoB();
    }
    /**
    * Método para consultar y listar los fondeos
    * @param fechaInicio - fecha inicio de busqueda
    * @param fechaFinal - fecha final de busqueda
    */
    spsFondeoB() {
        this.blockUI.start('Cargando datos...');
        let path = moment(this.mesIn.value).format("YYYY-MM-DD") + '/' + moment(this.mesFin.value).format("YYYY-MM-DD")
        this.service.getListByID(path, 'spsFondeoBancario').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaFondeo = JSON.parse(data);
                this.searcher = new FuzzySearch(this.listaFondeo, ['fecha', 'ponderado'], {
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
     * Busca el dondeo que se teclea en el filtro
     */
    buscarFondeo() {
        this.result = this.searcher.search(this.searchText);
        this.listaFondeo = this.result;
    }
    /**
     * Metodo para mostrar la informacion del fondeo
     */
    mostrarFondeo(datos) {
        this.fondeID = datos.fondeo_id;
        this.formFondeo.get('fecha').setValue(datos.fecha + 'T00:00:00');
        this.formFondeo.get('apertura').setValue(datos.apertura);
        this.formFondeo.get('cierre').setValue(datos.cierre);
        this.formFondeo.get('minimo').setValue(datos.minimo);
        this.formFondeo.get('maximo').setValue(datos.maximo);
        this.formFondeo.get('ponderado').setValue(datos.ponderado);

    }
    /**
     * Metodo CRUD para Fondeo Bancario
     */
    crudFondeo(accion) {
        this.blockUI.start('Cargando datos...');
        if (this.formFondeo.invalid) {
            this.validateAllFormFields(this.formFondeo);
            this.service.showNotification('top', 'right', 3, "Completa los datos.");
            this.blockUI.stop();
            return;
        }

        let data = {
            datos: [this.fondeID, moment(this.formFondeo.get('fecha').value).format("YYYY-MM-DD"),
            this.formFondeo.get('apertura').value, this.formFondeo.get('cierre').value,
            this.formFondeo.get('minimo').value, this.formFondeo.get('maximo').value,
            this.formFondeo.get('ponderado').value
            ],
            accion: accion
        }
        this.service.registrar(data, 'crudFondeoBancario').subscribe(crudF => {
            if (crudF[0][0] === '0') {//exito
                this.service.showNotification('top', 'right', 2, crudF[0][1]);
                this.spsFondeoB();
            } else {//error 
                this.service.showNotification('top', 'right', 3, crudF[0][1]);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para limpiar el formualario
     */
    nuevo() {
        this.fondeID = 0;
        this.formFondeo.reset();
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
        ],
        'cierre': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'apertura': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'minimo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'maximo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'ponderado': [
            { type: 'required', message: 'Campo requerido.' }
        ],
    }
}