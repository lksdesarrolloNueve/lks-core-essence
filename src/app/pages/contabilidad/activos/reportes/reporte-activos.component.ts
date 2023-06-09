import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";




@Component({
    selector: 'reporte-activos',
    moduleId: module.id,
    templateUrl: 'reporte-activos.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 12/01/2023
 * @descripcion: Componente para la gestion de reportes de activos
 */
export class ReporteActivosComponent implements OnInit {
    //Declaracion de Variables y Componentes
    @BlockUI() blockUI: NgBlockUI;
  
    /**Controles para filtrar los reportes */
    formAReportAct: UntypedFormGroup;

    opcionesReporte: any = [{ id: 1, nombre: "Activos" }, { id: 2, nombre: "Activo INPC" },
    { id: 3, nombre: "Activos Baja" }, { id: 4, nombre: "Activo Ubicacion" }, { id: 5, nombre: "Activo Check" },
    { id: 6, nombre: "Conciliacion" }];
    /**listar sucrsales */
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;
    idSucursal: number = 0;

    listaTipoAct: any = [];
    opcionesTActivo: Observable<string[]>;
    mostrarSucursal: boolean = false;

    /**Constructor de la clase */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder) {
        this.formAReportAct = this.formBuilder.group({
            mesIn: new UntypedFormControl('', [Validators.required]),
            sucursal: new UntypedFormControl(''),
            reporte: new UntypedFormControl('', [Validators.required]),
            optConsolidado: new UntypedFormControl(true),
            tpActivo: new UntypedFormControl('', [Validators.required]),
            depreciable: new UntypedFormControl(true, [Validators.required])
        });
    }

    ngOnInit() {
        this.spsSucursal();
        this.spsTipoActivos();

    }
    /**
     * Metodo para validar las componentes acorde al reporte selecionado
     */
    seleccionTReporte(reporte) {
        this.formAReportAct.get('tpActivo').enable();
        switch (reporte.value.id) {
            case 1: {
                //Activos
                this.formAReportAct.get('depreciable').disable();
                break;
            }
            case 2: {
                //activo INPC
                this.formAReportAct.get('depreciable').disable();
                break;
            }
            case 3: {
                //Activos Baja
                this.formAReportAct.get('depreciable').enable();
                break;
            }
            case 4: {
                //Ubicacion
                this.formAReportAct.get('depreciable').enable();
                break;
            }
            case 5: {
                //check
                this.formAReportAct.get('depreciable').enable();
                break;
            }
            case 6: {
                //conciliacion
                this.formAReportAct.get('tpActivo').disable();
                this.formAReportAct.get('depreciable').disable();

                break;
            }
        }
    }
    /**
     * Seleccion check consolidado
     * @param dato infomarmacion de la opcion seleccionada
     */
    cambioConsolidado(dato) {
        if (!dato.checked) {
            this.mostrarSucursal = true;
            this.formAReportAct.get('sucursal').setValidators(Validators.required);
            this.formAReportAct.get('sucursal').updateValueAndValidity();
        } else {
            //se oculata y limpia la caja de texto
            this.mostrarSucursal = false;
            this.formAReportAct.get('sucursal').setValue('');
            this.formAReportAct.get('sucursal').setValidators(null);
            this.formAReportAct.get('sucursal').updateValueAndValidity();
        }

    }
    /**
    * Metodo para consultar Sucursales
    * accion 2 activas
    */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursal = this.formAReportAct.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this.filterSuc(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
* Filtra la sucursal
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private filterSuc(value: any): any {
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
 * @param option --sucursal seleccionado
 * @returns --nombre de sucursal
 */
    displayFnSuc(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    /**
    * Método que en lista todos los tipos de activos
    * accion 1 muestra todos los activos
    */
    spsTipoActivos() {
        this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoAct = JSON.parse(data);
                // Se setean las cuentas para el autocomplete
                this.opcionesTActivo = this.formAReportAct.get('tpActivo').valueChanges.pipe(startWith(''),
                    map(value => this._filterTipoAct(value)));

            }
        });

    }
    private _filterTipoAct(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaTipoAct.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
    }

    displayActivo(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    /**
     * Metodo para procesar el reporte acorde al API
     */
    procesarReporte() {
        let api = '';
        let name = '';
        let path = '';
        let sucursal = 0;
        if (this.formAReportAct.invalid) {
            this.validateAllFormFields(this.formAReportAct);
            return;
        }

        if (!this.vacio(this.formAReportAct.get('sucursal').value)) {
            sucursal = this.formAReportAct.get('sucursal').value.sucursalid;
        }
        switch (this.formAReportAct.get('reporte').value.id) {
            case 1: {
                //Activos
                api = 'reporteActivo';
                name = 'Activo_Fijo';
                path = this.formAReportAct.get('tpActivo').value.tipo_activo_id + '/'
                    + moment(this.formAReportAct.get('mesIn').value).format("YYYY-MM-DD") + '/' +
                    sucursal;
                //generar reporte
                this.generaReportes(path, api, name);
                break;
            }
            case 2: {
                //activo INPC
                api = 'reporteInpcAct';
                name = 'Activo_INPC';
                path = this.formAReportAct.get('tpActivo').value.tipo_activo_id + '/'
                    + moment(this.formAReportAct.get('mesIn').value).format("YYYY-MM-DD") + '/' +
                    sucursal;
                //generar reporte
                this.generaReportes(path, api, name);
            }
            case 3: {
                //Activos Baja
                //Activos
                api = 'reporteBajaAct';
                name = 'Activo_Baja';
                path = this.formAReportAct.get('tpActivo').value.tipo_activo_id + '/'
                    + moment(this.formAReportAct.get('mesIn').value).format("YYYY-MM-DD") + '/' +
                    this.formAReportAct.get('depreciable').value + "/" +
                    sucursal;
                //generar reporte
                this.generaReportes(path, api, name);
                break;
            }
            case 4: {
                //Ubicacion
                api = 'reporteUbicacionAct';
                name = 'Activo_Ubicacion';
                path = this.formAReportAct.get('tpActivo').value.tipo_activo_id + '/'
                    + moment(this.formAReportAct.get('mesIn').value).format("YYYY-MM-DD") + '/' +
                    this.formAReportAct.get('depreciable').value + "/" +
                    sucursal;
                //generar reporte
                this.generaReportes(path, api, name);
                break;
            }
            case 5: {
                //check
                api = 'reporteCheckAct';
                name = 'Activo_CHECK-LIST';
                path = this.formAReportAct.get('tpActivo').value.tipo_activo_id + '/'
                    + moment(this.formAReportAct.get('mesIn').value).format("YYYY-MM-DD") + '/' +
                    this.formAReportAct.get('depreciable').value + "/" +
                    sucursal;
                //generar reporte
                this.generaReportes(path, api, name);
                break;
            }
            case 6: {
                //conciliacion
                api = 'reporteConciliacionAct';
                name = 'Activo_Fijo_Conciliacion';
                path = moment(this.formAReportAct.get('mesIn').value).format("YYYY-MM-DD") + '/' +
                    sucursal;
                //generar reporte
                this.generaReportes(path, api, name);

                break;
            }
        }

    }
    /**
     * Metodo para generar reporte
     * @param path datos a procesar
     * @param api  funcion a realizar 
     * @param name nombre del reporte
     */
    generaReportes(path, api, name) {
        this.blockUI.start('Generando Reporte...');
        this.service.getListByID(path, api).subscribe(response => {
            if (response[0] === '0') {
                this.service.showNotification('top', 'right', 2, response[1]);
                const linkSource = 'data:application/pdf;base64,' + response[2] + '\n';
                const downloadLink = document.createElement("a");
                const fileName = name + '.pdf';

                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();

            } else {
                this.service.showNotification('top', 'right', 3, response[1]);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
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
     * Metodo para mostrar los mensajes de error
     */
    validaciones = {
        //Referencias para datos generales referencias
        'reporte': [
            { type: 'required', message: 'Campo requerido.' }],
        'mesIn': [
            { type: 'required', message: 'Campo requerido.' }],
        'tpActivo': [
            { type: 'required', message: 'Campo requerido.' }],
        'sucursal': [{ type: 'required', message: 'Campo requerido.' }]

    }

}
