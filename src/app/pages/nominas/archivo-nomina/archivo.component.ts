import { Component, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'archivo-nomina',
    moduleId: module.id,
    templateUrl: 'archivo.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 31/10/2022
 * @descripcion: Componente para la generacion del archivo de nomina
 */
export class ArchivoComponent {
    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;
    listaEmpresa: any = [];
    opcionesEmpresa: Observable<string[]>;
    formArchivo: UntypedFormGroup;

    listaPlantilla: any = [];
    listaNomina: any = [];


    displayedColumns: string[] = ['noCuenta', 'nombre', 'sueldo', 'periodo', 'plantilla']
    dataSourceNomina: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    numCliente: string = '';

    listaExcel: any = [];

    /**
    * Constructor de la clase DispersionNominaComponent
    * @param service -Service para el acceso a datos 
    */
    constructor(private service: GestionGenericaService, private fomrBuilder: UntypedFormBuilder) {
        this.formArchivo = this.fomrBuilder.group({
            empresa: new UntypedFormControl('', Validators.required),
            plantilla: new UntypedFormControl('', Validators.required),
            concepto: new UntypedFormControl('', Validators.required),
        });
        this.spsEmpresasNomina();
    }

    /**
     * Lisa las empresas con servicio de nomina
     */
    spsEmpresasNomina() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('', 'spsEmpresasNomina').subscribe(empresa => {
            if (!this.vacio(empresa)) {
                this.listaEmpresa = JSON.parse(empresa);
                // Se setean los creditos para el autocomplete
                this.opcionesEmpresa = this.formArchivo.get('empresa').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEmpresaN(value)));

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterEmpresaN(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEmpresa.filter(option => option.nombre.toLowerCase().trim().includes(filterValue)
            || option.numero_cliente.toLowerCase().trim().includes(filterValue));
    }
    displayEmpresa(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    /**
    * 
    * @param emp Muestra informacion de la empresa seleccionada
    */
    empresaSeleccionada(emp) {
        if (!this.vacio(emp)) {
            this.numCliente = emp.value.numero_cliente;
            this.spsPlantillas();
        }
    }
    /**
       * Lista las plantilla
       */
    spsPlantillas() {
        this.blockUI.start('Cargando datos...');
        this.listaPlantilla = [];
        this.service.getListByID(this.numCliente, 'spsPlantillas').subscribe(plantilla => {
            if (!this.vacio(plantilla)) {
                this.listaPlantilla = JSON.parse(plantilla);

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Lisa las empresas con servicio de nomina
     */
    cargarEmpleados() {
        this.blockUI.start('Cargando datos...');
        this.listaNomina = [];
        this.service.getListByID(this.numCliente + '/' + this.formArchivo.get('plantilla').value.nombre, 'spsEmpleadosNomina').subscribe(nomina => {
            if (!this.vacio(nomina)) {
                this.listaNomina = JSON.parse(nomina);
            }
            this.dataSourceNomina = new MatTableDataSource(this.listaNomina);
            this.dataSourceNomina.paginator = this.paginator;
            this.dataSourceNomina.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Generar archivo con el concepto
     */
    generarArchivo() {
      if(this.formArchivo.invalid){
          this.validateAllFormFields(this.formArchivo);
          return  this.service.showNotification('top', 'right',3,'Completa la información.');
      }
      this.blockUI.start('Generando archivo...');
        for (let n of this.listaNomina) {
            this.listaExcel.push({
                'Cuenta': n.numero_cuenta, 'ClaveBanco': n.clave_banco, 'Beneficiario': n.empleado,
                'RFC_CURP': n.rfc_curp, 'Concepto': this.formArchivo.get('concepto').value, 'Monto': n.sueldo,'Empresa': this.numCliente 
            });
        }
        this.generarExcel();
        this.formArchivo.get('concepto').setValue('');
        this.blockUI.stop();
    }
    /**
       * Método para asignar los parametros necesarios para generar un excel en base al json que se proporcione
       */
    generarExcel() {
        let json = this.listaExcel; // JSON que se convertira a excel
        let nombreExcel = "Dispersion de nomina"; // Nombre que tendra el excel
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'nomina': worksheet }, SheetNames: ['nomina'] };
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
        FileSaver.saveAs(data, fileName+"_"+this.numCliente  + "_" + new Date().toLocaleDateString() + EXCEL_EXTENSION); // Se completa el nombre del excel con informacion adicional
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
     * Valida cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
      validateAllFormFields(formGroup: UntypedFormGroup) {           //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);           //3
            if (control instanceof UntypedFormControl) {           //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {      //5
                this.validateAllFormFields(control);        //6
            }
        });
    }
    validaciones = {
        'empresa': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'plantilla': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'concepto':[{ type: 'required', message: 'Campo requerido.'}]
    }
}