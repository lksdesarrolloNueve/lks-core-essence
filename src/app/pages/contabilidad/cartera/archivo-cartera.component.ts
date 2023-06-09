import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import * as moment from "moment";

/**
* @autor: Jasmin .
* @version: 1.0.0
* @fecha: 26/08/2022
* @descripcion: Componente para la gestion de archivo cartera
*/
@Component({
    selector: 'archivo-cartera',
    moduleId: module.id,
    templateUrl: 'archivo-cartera.component.html',
})

export class ArchivoCarteraComponent implements OnInit {
    //Bloqueo de pantalla
    @BlockUI() blockUI: NgBlockUI;

    //Declaración de variables y componentes
    formCartera: UntypedFormGroup;

    // Lista de las sucursales
    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;
    selectedISucursal: number = 0;

    //radiobutons
    opciones: any = [{ id: 1, nombre: 'Sucursal' }, { id: 2, nombre: 'Consolidado' }];
    mostrarSucursal: boolean = false;

    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder
    ) {
        this.formCartera = this.formBuilder.group({
            sucursal: new UntypedFormControl(''),
            fecha: new UntypedFormControl('', { validators: [Validators.required] })
        })
    }

    /**
   * metodo OnInit de la clase riesgoCreditoComponent para iniciar los metodos
   */
    ngOnInit(): void {
        this.spsObtenerSucursales();
    }

    /**
     * Obtener sucursales
     */
    spsObtenerSucursales() {

        this.blockUI.start();

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursales = this.formCartera.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursales(value))
            );

            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Filtra la categoria de sucursales
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursales(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));

    }
    /**
   * Muestra la descripcion de la sucursal
   * @param option --muestra el nombre de la sucursal seleccionada
   * @returns --nombre de la sucursal
   */

    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }
    /**
       * Seleccion radio group
       * @param dato infomarmacion de la opcion seleccionada
       */
    cambioRadio(dato) {
        if (dato.id == 1) {
            this.mostrarSucursal = true;
            this.formCartera.get('sucursal').setValidators([Validators.required]);
            this.formCartera.get('sucursal').updateValueAndValidity();
        } else {
            //se oculata y limpia la caja de texto
            this.mostrarSucursal = false;
            this.formCartera.get('sucursal').setValue('');
            this.formCartera.get('sucursal').setValidators(null);
            this.formCartera.get('sucursal').updateValueAndValidity();
        }

    }

    /**
     * Metodo para generar archivo EXCEL de CALIFICACIÓN Y CONSTITUCIÓN DE ESTIMACIONES PREVENTIVAS
     */
    spsReporteCalificaEstPrev() {
        this.blockUI.start('Cargando datos...');
        if (this.formCartera.invalid) {
            this.validateAllFormFields(this.formCartera);
            return this.blockUI.stop();
          }
        let fecha = moment(this.formCartera.get('fecha').value).format("YYYY-MM-DD");
        let sucursal = 0;
        if (this.mostrarSucursal) {
            sucursal = this.formCartera.get('sucursal').value.sucursalid;
        }

        let path = fecha + '/' + sucursal;
        this.service.getListByID(path, 'spsReporteCalificacionEstimacionPrev').subscribe(data => {

            if (!this.vacio(data)) {
                let listReport = JSON.parse(data);
                this.generarExcel(listReport, 'Comprobación Cartera');
            } else {
                this.service.showNotification('top', 'right', 3, 'No hay datos para generar el archivo Excel.');
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        }
        );

    }
    /**
        * Método para asignar los parametros necesarios para generar un excel en base al json que se proporcione
        */
    generarExcel(listReporte, nombreRep) {
        let json = listReporte; // JSON que se convertira a excel
        let nombreExcel = nombreRep; // Nombre que tendra el excel
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'comprobacion-cartera': worksheet }, SheetNames: ['comprobacion-cartera'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.descargarExcel(excelBuffer, nombreExcel);
    }

    /**
     * Método para descargar el excel generado
     * @param buffer 
     * @param fileName 
     */
    descargarExcel(buffer: any, fileName: string) {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + "_" + new Date().toLocaleDateString() + EXCEL_EXTENSION); // Se completa el nombre del excel con informacion adicional
    }
    /**
     * Metodo para mostrar los mensajes de validaciones 
     */

    validaciones = {
        'fecha': [{ type: 'required', message: 'Campo requerido.' }],
        'sucursal': [{ type: 'required', message: 'Campo requerido.' }]
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
    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == null || value == "" || value.length == 0);
    }
}