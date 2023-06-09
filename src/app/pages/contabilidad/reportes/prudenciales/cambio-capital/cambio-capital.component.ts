import { Component } from "@angular/core";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { DatePipe, formatDate } from "@angular/common";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { PermisosService } from "../../../../../shared/service/permisos.service";

@Component({
    selector: 'cambio-capital',
    moduleId: module.id,
    templateUrl: './cambio-capital.component.html'
})
export class CambioCapitalComponent {
    //Declaracion de Variables y Componentes
    @BlockUI() blockUI: NgBlockUI;
    listaSucursales: any = [];
    sucursalID: any;
    formFiltros: UntypedFormGroup;

     /**Constructor de la clase que inicializa todos los componentes
     *
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService) {
        //se obtiene la sucursal iniciada 
        this.sucursalID = servicePermisos.sucursalSeleccionada.sucursalid;
        this.spsListaSucursales(); 
        
        // componentes del formFiltros
        this.formFiltros = this.formBuilder.group({
            fecha: new UntypedFormControl('', Validators.required),
            sucursal: new UntypedFormControl(),
            consolidado: new UntypedFormControl(true),
            miles: new UntypedFormControl(true),
            csv: new UntypedFormControl(false)
        });

    }

    /**
     * Obtener sucursales (usuario logeado)
     */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.blockUI.stop();

    }

    /**Identifica el tipo de reporte a generar 
     * valor si el combo csv esta chekeado es csv
     * por defecto genera PDF
    */
    seleccionaTipoReporte() {
        if (this.formFiltros.get('csv').value === false) {
            this.spsGeneraReporte(); // REPORTE PDF
        } else {
            this.spsGeneraReporteCsv();// REPORTE CSV
        }
    }

    /**
     *Metodo que genera el reporte origen aplicacion pdf
     *  */
    spsGeneraReporte() {
        //Validaciones
        if (this.formFiltros.get('consolidado').value === false) {
            this.formFiltros.get('sucursal').setValidators([Validators.required]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        } else {
            this.formFiltros.get('sucursal').setValidators([]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        }

        if (this.formFiltros.invalid) {
            this.validateAllFormFields(this.formFiltros);
            return;
        }

        if (this.formFiltros.get('consolidado').value === false) {
            this.sucursalID = this.formFiltros.get('sucursal').value.sucursalid;
        } else {
            this.sucursalID = this.servicePermisos.sucursalSeleccionada.sucursalid;
        }

        let fecha = formatDate(this.formFiltros.get('fecha').value, 'yyyy-MM-dd', 'en-US');


        let path = fecha + '/' + this.formFiltros.get('consolidado').value + '/' +
            this.formFiltros.get('miles').value + '/' + this.sucursalID;

        this.blockUI.start('Generando Reporte...');

        this.service.getListByID(path, 'reporteCambioCapPdf').subscribe(response => {
            this.blockUI.stop();

            if (response[0] === '0') {
                this.service.showNotification('top', 'right', 2, response[1]);
                const linkSource = 'data:application/pdf;base64,' + response[2] + '\n';
                const downloadLink = document.createElement("a");
                const fileName = 'CambioCapital' + '.pdf';

                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();

            } else {
                this.service.showNotification('top', 'right', 3, response[1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     *Metodo que genera el reporte en formato CSV
     *  */
    spsGeneraReporteCsv() {
        //Validaciones
        if (this.formFiltros.get('consolidado').value === false) {
            this.formFiltros.get('sucursal').setValidators([Validators.required]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        } else {
            this.formFiltros.get('sucursal').setValidators([]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        }

        if (this.formFiltros.invalid) {
            this.validateAllFormFields(this.formFiltros);
            return;
        }

        if (this.formFiltros.get('consolidado').value === false) {
            this.sucursalID = this.formFiltros.get('sucursal').value.sucursalid;
        } else {
            this.sucursalID = this.servicePermisos.sucursalSeleccionada.sucursalid;
        }

        let fecha = formatDate(this.formFiltros.get('fecha').value, 'yyyy-MM-dd', 'en-US');


        let path = fecha + '/' + this.formFiltros.get('consolidado').value + '/' +
            this.formFiltros.get('miles').value + '/' + this.sucursalID;

        this.blockUI.start('Generando Reporte...');

        this.service.getListByID(path, 'reporteCambioCapCSV').subscribe(response => {
            this.blockUI.stop();
            this.exportarACSV(response, 'cambioCapital.csv');

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
 * Valida Cada atributo del formulario
 * @param formGroup - Recibe cualquier asigna de FormGroup
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

    /**Exportar datos JSON a csv
         * @param JSONList lista a procesar 
         * @param fileName nombre del archivo
         */
    exportarACSV(JSONList: any[], fileName: string) {
        const replace = (key: string, value: string) => value === null ? '' : value;
        const header = Object.keys(JSONList[0]);
        let csv = JSONList.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replace)).join(';'));
        csv.unshift(header.join(';'));
        let data = csv.join('\r\n');
        CambioCapitalComponent.downloadFile(fileName, data);
    }
    /**Se define el metodo estatico para ser llamdao solo por la clase 
     * Descarga el archivo csv
     *@param filename nombre del  archivo
     *@param data infomacion procesada definida con el simbolo ;
    */
    static downloadFile(filename: string, data: string) {
        // the document has to be compatible with Excel, we export in UTF-8
        // previously we saved only using 'text/csv'
        let format = 'text/plain;charset=utf-8';
        // we add the BOF for UTF-8, Excel requires this information to show chars with accents etc.
        let blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), data], { type: format });
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename + '.csv';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }

    /**
    * Validaciones de los datos para el reporte
    */
    validaciones = {
        'sucursal': [
            { type: 'required', message: 'Sucursal requerida.' }
        ],
        'fecha': [
            { type: 'required', message: 'Fecha requerida.' }
        ]
    }

}
