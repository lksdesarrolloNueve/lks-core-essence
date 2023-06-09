import { Component,OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl,UntypedFormGroup,Validators} from "@angular/forms";
import { COMMA, ENTER } from "@angular/cdk/keycodes";


@Component({
    selector: 'calificacion-cartera',
    moduleId: module.id,
    templateUrl: 'calificacion-cartera.component.html'
})



/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 
 * @descripcion: Componente para la gestion de calificacion cartera
 */
export class CalificacionCarteraComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    calificacionCarteraID: number = 0;
    selectedId: number;
    @BlockUI() blockUI: NgBlockUI;
    formCalificacionCartera: UntypedFormGroup;
    listaCalificacionCartera: any[];
    isSlideCheckedEstatus: boolean = false;
    listaDomicilioArreglo = [];
    dataSourceDomicilio: MatTableDataSource<any>;
    listaMostrar = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    /** 
     * VARIABLES DE CALIFICACION CARTERA
    */
    


    dataSourceMovimientoCajas: MatTableDataSource<any>;


    //Variables Chips formas de pago y tipos socios
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

   


    //Botones boolean
    mostrarGuardar: boolean = true;
    mostrarEditar: boolean = false;

    /**
     * Constructor de la clase MovimientosCajaComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, private fomrBuilder: UntypedFormBuilder) {


        this.formCalificacionCartera = this.fomrBuilder.group({

            //Validators Calificacion cartera
            diasI: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            diasF: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            calificacion: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')])
        });
    }


    /**
     * metodo OnInit de la clase MovimientosCaja para iniciar las listas
     */
    ngOnInit() {
        this.nuevaCalificacionCartera();
        this.spsCalificacionCartera();
    }


    /**
     * Metodo para guardar una calificacion cartera
     */
    guardarCalificacionCartera(): void {
        if (this.formCalificacionCartera.invalid) {
            this.validateAllFormFields(this.formCalificacionCartera);
            return;
        }

        this.blockUI.start('Guardando ...');

        const data = {
            "calificacionCarteraID": this.calificacionCarteraID,
            "diasI": this.formCalificacionCartera.get('diasI').value,
            "diasF": this.formCalificacionCartera.get('diasF').value,
            "calificacion": this.formCalificacionCartera.get('calificacion').value,
        };
        /**
 * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
 * de acuerdo al tipo de accion al que pertenezca.
 */

        this.service.registrarBYID(data, 1, 'crudCalificacionCartera').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formCalificacionCartera.reset();
                    this.spsCalificacionCartera();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.message)
            }
        )

    }

    /**
     * Metodo para editar una emrpesa
     */
    editarCalificacionCartera(): void {
        if (this.formCalificacionCartera.invalid) {
            this.validateAllFormFields(this.formCalificacionCartera);
            return;
        }
        this.blockUI.start('Editando ...');

        const data = {
            "calificacionCarteraID": this.calificacionCarteraID,
            "diasI": this.formCalificacionCartera.get('diasI').value,
            "diasF": this.formCalificacionCartera.get('diasF').value,
            "calificacion": this.formCalificacionCartera.get('calificacion').value,
        };
        /**
 * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
 * de acuerdo al tipo de accion al que pertenezca.
 */

        this.service.registrarBYID(data, 2, 'crudCalificacionCartera').subscribe(
            result => {
                
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    this.spsCalificacionCartera();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.message)
            }
        )
    };

    /**
 * Filtrado de  calificaciones por id
 */
    spsCalificacionCarteraById(elemento: any) {
        this.mostrarEditar = true;
        this.mostrarGuardar = false;
        this.blockUI.start('Cargando datos...');
        let path = elemento + '/' + 1;
        this.service.getListByID(path, 'listaCalificacionCarteraById').subscribe(
            data => {
                this.blockUI.stop();
                this.calificacionCarteraID = data[0].calificacionCarteraID;
                //Datos Calificacion cartera
                this.formCalificacionCartera.get('diasI').setValue(data[0].diasI);
                this.formCalificacionCartera.get('diasF').setValue(data[0].diasF);
                this.formCalificacionCartera.get('calificacion').setValue(data[0].calificacion); 
               
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }

    /**
     * Carga todos los combos y resetea el form
     */
    nuevaCalificacionCartera() {
        this.formCalificacionCartera.reset();
        this.mostrarEditar = false;
        this.mostrarGuardar = true;
    }

  

    /**
     * Bloque de Validaciones
     */
    validaciones = {

        //Validación campos calificacion cartera
        'diasI': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números.' },
        ],
        'diasF': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números.' },
        ],
        'calificacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números.' },
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

    /**
    * Metodo que consulta la calificacion cartera
    */
    spsCalificacionCartera() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaCalificacionCartera').subscribe(data => {
            this.blockUI.stop();
            this.listaCalificacionCartera = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
}