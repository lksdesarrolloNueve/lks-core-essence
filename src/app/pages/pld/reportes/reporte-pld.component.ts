import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import globales from "../../../../environments/globales.config";
import { map, startWith } from "rxjs/operators";
import { PermisosService } from "../../../shared/service/permisos.service";
import * as moment from "moment";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";


@Component({
    selector: 'reporte-pld',
    moduleId: module.id,
    templateUrl: 'reporte-pld.component.html',
    styleUrls: ['reporte.component.css']
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 17/05/2021
 * @descripcion: Componente para la gestion de reportes PLD
 */
export class ReportePldComponent implements OnInit {
    //Declaracion de Variables y Componentes
    @BlockUI() blockUI: NgBlockUI;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    today = new Date();
    /**Controles para filtrar los operaciones */
    formReporte: UntypedFormGroup;

    opcionesReporte: any = [{ id: 1, nombre: "Relevante" }, { id: 2, nombre: "Inusual" }, { id: 3, nombre: "Int.Preocupante" }];
    /**listar sucrsales */
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;
    idSucursal: number = 0;
    listaOpRelevantes: any = [];
    listaOpPreocupantes: any = [];
    listaOpInsuales: any = [];


    //radiobutons
    opciones: any = [{ id: 1, nombre: 'Sucursal' }, { id: 2, nombre: 'Consolidado' }];
    mostrarSucursal: boolean = false;

    //Tabla reporte relevante
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['organismo', 'casfim', 'sucursal', 'operacion', 'instrumento', 'cuenta', 'monto',
        'fechaOp', 'cliente', 'act', 'consecutivo', 'numC', 'clave',
        'titular', 'decripcion', 'razonA'];
    dataSourceRelevantes: MatTableDataSource<any>;
    //REPORTE
    listRel: any = [];
    listPre: any = [];
    listIns: any = [];
    accion: number = 1;
    tipoC: number = 0;
    /**Constructor de la clase */
    constructor(private service: GestionGenericaService, private servicePermisos: PermisosService, private formBuilder: UntypedFormBuilder) {
        this.formReporte = this.formBuilder.group({
            mesIn: new UntypedFormControl('', [Validators.required]),
            mesFin: new UntypedFormControl('', [Validators.required]),
            sucursal: new UntypedFormControl(),
            reporte: new UntypedFormControl('', [Validators.required]),
            optConsolidado: new UntypedFormControl(true)
        });
    }

    ngOnInit() {
        this.spsSucursal();

    }
    /**
     * Seleccion radio group
     * @param dato infomarmacion de la opcion seleccionada
     */
    cambioRadio(dato) {
        if (!this.formReporte.get('optConsolidado').value) {
            this.mostrarSucursal = true;
        } else {
            //se oculata y limpia la caja de texto
            this.mostrarSucursal = false;
            this.formReporte.get('sucursal').setValue('');
            this.formReporte.get('sucursal').setValidators(null);
            this.formReporte.get('sucursal').updateValueAndValidity();
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
            this.opcionesSucursal = this.formReporte.get('sucursal').valueChanges.pipe(
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
* Metodo para setear el id a filtrar
* @param event  - Evento a setear
*/
    opcionSeleccionSuc(event) {
        this.idSucursal = event.option.value.sucursalid;
    }
    /**Identifica el tipo de reporte a generar 
     * valor 1 Relevante  2 Inusual 3 Int.Preocupante
     * @param tipo 1 reporte por sucursal 2 reporte de todas las sucursales
    */
    seleccionaTipoReporte() {
        //Validaciones
        if (this.formReporte.invalid) {
            this.validateAllFormFields(this.formReporte);
            return;
        }
        //Relevante
        if (this.formReporte.get('reporte').value.id == 1) {
            this.spsReporteRel();
        } else //Insual
            if (this.formReporte.get('reporte').value.id == 2) {
                this.spsReporteInusual();
            } else {
                //Preocupante
                if (this.formReporte.get('reporte').value.id == 3)
                    this.spsReportePreocupante();
            }
    }
    /**
     * Datos de reporte relevante
     */
    spsReporteRel() {
        this.blockUI.start('Cargando datos...');
        //Esta vacia la caja de texto sucursal es reporte consolidado
        this.listaOpRelevantes = [];
        if (this.mostrarSucursal) {
            //Se valida la sucursal
            this.formReporte.get('sucursal').setValidators([Validators.required]);
            this.formReporte.get('sucursal').updateValueAndValidity();
            if (this.formReporte.get('sucursal').invalid) {
                if (this.formReporte.get('sucursal') instanceof UntypedFormControl) {
                    this.formReporte.get('sucursal').markAsTouched({ onlySelf: true });
                }
                this.blockUI.stop();
                return;
            }
            this.accion = 1;
        } else {
            this.accion = 2;
        }
        //Se genera el Arreglo para consultar operaciones relevantes
        let arreglo = {
            "datos": [moment(this.formReporte.get('mesIn').value).format("MM"),
            moment(this.formReporte.get('mesFin').value).format("MM"),
            moment(this.formReporte.get('mesFin').value).format("YYYY"),
            this.idSucursal],
            "accion": this.accion
        };
        this.service.getListByObjet(arreglo, 'spsReporteRel').subscribe(reporteRel => {
            if (!this.vacio(reporteRel)) {
                this.listaOpRelevantes = JSON.parse(reporteRel);
            } this.dataSourceRelevantes = new MatTableDataSource(this.listaOpRelevantes);
            this.dataSourceRelevantes.paginator = this.paginator;
            this.dataSourceRelevantes.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Consumo de API para obtener los datos del operaciones Inusuales
     * @returns STRING - JSON con los registros de operaciones Inusuales
     */
    spsReporteInusual() {

        this.blockUI.start('Cargando datos...');
        //Esta vacia la caja de texto sucursal es reporte consolidado
        this.listaOpInsuales = [];
        if (this.mostrarSucursal) {
            //Se valida la sucursal
            this.formReporte.get('sucursal').setValidators([Validators.required]);
            this.formReporte.get('sucursal').updateValueAndValidity();
            if (this.formReporte.get('sucursal').invalid) {
                if (this.formReporte.get('sucursal') instanceof UntypedFormControl) {
                    this.formReporte.get('sucursal').markAsTouched({ onlySelf: true });
                }
                this.blockUI.stop();
                return;
            }
            this.accion = 1;//x sucursal
        } else {
            this.accion = 2;//consolidado
        }
        //Se genera el Arreglo para consultar operaciones inusuales
        let inusual = {
            "datos": [moment(this.formReporte.get('mesIn').value).format("MM"),
            moment(this.formReporte.get('mesFin').value).format("MM"),
            moment(this.formReporte.get('mesFin').value).format("YYYY"),
            this.idSucursal],
            "accion": this.accion
        };
        this.service.getListByObjet(inusual, 'spsReporteInusual').subscribe(reporteIn => {
            if (!this.vacio(reporteIn)) {
                this.listaOpInsuales = JSON.parse(reporteIn);
            }
            this.dataSourceRelevantes = new MatTableDataSource(this.listaOpInsuales);
            this.dataSourceRelevantes.paginator = this.paginator;
            this.dataSourceRelevantes.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Datos de reporte preocupante 
    */
    spsReportePreocupante() {
        this.blockUI.start('Cargando datos...');
        //Esta vacia la caja de texto sucursal es reporte consolidado
        this.listaOpPreocupantes = [];
        if (this.mostrarSucursal) {
            //Se valida la sucursal
            this.formReporte.get('sucursal').setValidators([Validators.required]);
            this.formReporte.get('sucursal').updateValueAndValidity();
            if (this.formReporte.get('sucursal').invalid) {
                if (this.formReporte.get('sucursal') instanceof UntypedFormControl) {
                    this.formReporte.get('sucursal').markAsTouched({ onlySelf: true });
                }
                this.blockUI.stop();
                return;
            }
            this.accion = 1;
        } else {
            this.accion = 2;
        }
        //Se genera el Arreglo para consultar operaciones preocupantes
        let arreglo1 = {
            "datos": [moment(this.formReporte.get('mesIn').value).format("MM"),
            moment(this.formReporte.get('mesFin').value).format("MM"),
            moment(this.formReporte.get('mesFin').value).format("YYYY"),
            this.idSucursal],
            "accion": this.accion
        };
        this.service.getListByObjet(arreglo1, 'spsReportePreocupante').subscribe(reportePre => {
            if (!this.vacio(reportePre)) {
                this.listaOpPreocupantes = JSON.parse(reportePre);

            }
            this.dataSourceRelevantes = new MatTableDataSource(this.listaOpPreocupantes);
            this.dataSourceRelevantes.paginator = this.paginator;
            this.dataSourceRelevantes.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
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

    /**Genera el folio para el reporte colocando  ceros a la izquierda  del numero
     * @param number numero al que se agrregaran los ceros
    */
    folio(number) {
        var numberOutput = Math.abs(number); /* Valor absoluto del número */
        var length = number.toString().length; /* Largo del número */
        var zero = "0"; /* String de cero */
        let width = 5;//00000 1 
        if (width <= length) {
            if (number < 0) {
                return ("-" + numberOutput.toString());
            } else {
                return numberOutput.toString();
            }
        } else {
            if (number < 0) {
                return ("-" + (zero.repeat(width - length)) + numberOutput.toString());
            } else {
                return ((zero.repeat(width - length)) + numberOutput.toString());
            }
        }
    }

    /**
     * Metodo para generar el reporte acorde al valor seleccionado 
     * valor 1 Relevante  2 Inusual 3 Int.Preocupante
     */
    generarReporte() {
        this.blockUI.start('Cargando datos...');
        if (this.formReporte.get('reporte').value.id == 1 && this.listaOpRelevantes.length > 0) {
            let nombre = '1' + this.listaOpRelevantes[0].casfim + moment(this.today).format("YYMM") + '.' + this.listaOpRelevantes[0].organismo_supervisor;
            //llenar lista con los datos correspondientes 
            let folio = '';
            let cant = 1;
            for (let rel of this.listaOpRelevantes) {
                folio = this.folio(cant);
                this.listRel.push({
                    'TIPO DE REPORTE': 1, 'PERIODO DEL REPORTE': moment(this.today).format("YYYYMM"), 'FOLIO': folio,
                    'ORGANISMO SUPERVISOR': rel.organismo_supervisor, 'CLAVE DE LA ENTIDAD FINANCIERA': rel.casfim, 'LOCALIDAD': rel.clave_colonia_siti, 'SUCURSAL': rel.cve_sucursal,
                    'TIPO DE OPERACION': rel.clave_t_mov, 'INSTRUMENTO MONETARIO': rel.cve_fpago, 'NUMERO DE CUENTA CONTRATO': rel.numero_cliente, 'MONTO': rel.cantidad, 'MONEDA': rel.cve_moneda_sat,
                    'FECHA DE LA OPERACION': rel.fecha_operacion, 'FECHA DE DETECCION DE LA OPERACION': '', 'NACIONALIDAD': rel.nacionalidad, 'TIPO DE PERSONA': rel.tipo_persona, 'RAZON SOCIAL': '',
                    'NOMBRE': rel.nombres, 'APELLIDO PATERNO': rel.apellido_paterno, 'APELLIDO MATERNO': rel.apellido_materno, 'RFC': rel.rfc, 'CURP': rel.curp,
                    'FECHA DE NACIMIENTO O CONSTITUCION': rel.fecha_nacimiento, 'DOMICILIO': rel.calle + ' ' + rel.numero_exterior + ' ' + rel.numero_interior + ' ' + rel.codigo_postal,
                    'COLONIA': rel.cve_col, 'CIUDAD O POBLACION': rel.cve_pld, 'TELEFONO': rel.telefono, 'ACTIVIDAD ECONOMICA': rel.cve_ocupacion,
                    'AGENTE O APODERADO': '', 'APELLIDO PATERNO.': '', 'APELLIDO MATERNO.': '', 'RFC.': '', 'CURP.': '', 'CONSECUTIVO DE CUENTAS': '', 'NUMERO DE CUENTA': '', 'CLAVE DE LA ENTIDAD': '',
                    'TITULAR DE LA CUENTA': '', 'APELLIDO PATERNO T': '', 'APELLIDO MATERNO T': '', 'DESCRIPCION DE LA OPERACION': '', 'RAZONES': ''
                });
                //incrementa la can cada vez que se recorre el for para armar el folio
                cant++;

            }

            //Descargar archivo
            this.exportarACSV(this.listRel, nombre);

        } else if (this.formReporte.get('reporte').value.id == 2 && this.listaOpInsuales.length > 0) {
            //metodo para armar reporte inusual
            this.generarReporteInusual();
        } else if (this.formReporte.get('reporte').value.id == 3 && this.listaOpPreocupantes.length > 0) {//Interna preocupante
            this.generaReportePreocupante();

        } else {
            this.service.showNotification('top', 'rigth', 3, 'No se a generado una busqueda de operaciones.');
        }
        this.blockUI.stop();
    }
    /// Metodo que genera el reporte de operaciones internas preocupantes 
    generaReportePreocupante() {
        if (this.formReporte.get('reporte').value.id == 3) {
            let nombre = '3' + this.listaOpPreocupantes[0].casfim + moment(this.today).format("YYMMDD") + '.' + this.listaOpPreocupantes[0].organismo_supervisor;
            //llenar lista con los datos correspondientes 
            let folio = '';
            let cant = 1;
            for (let pre of this.listaOpPreocupantes) {
                let telF = JSON.parse(pre.telefono);
                let telM = JSON.parse(pre.telmoral);
                let tel = '';
                if (!this.vacio(telF)) {
                    tel = telF[0].telefono;
                } else if (!this.vacio(telM)) {
                    tel = telM[0].telefono;
                }
                let interior = '';
                if (!this.vacio(pre.numero_interior)) {
                    interior = pre.numero_interior;
                }
                folio = this.folio(cant);
                this.listPre.push({
                    'TIPO DE REPORTE': 3, 'PERIODO DEL REPORTE': moment(this.today).format("YYYYMMDD"), 'FOLIO': folio,
                    'ORGANISMO SUPERVISOR': pre.organismo_supervisor, 'CLAVE DE LA ENTIDAD FINANCIERA': pre.casfim, 'LOCALIDAD': pre.clave_colonia_siti, 'SUCURSAL': pre.cve_sucursal,
                    'TIPO DE OPERACION': '', 'INSTRUMENTO MONETARIO': '', 'NUMERO DE CUENTA CONTRATO': pre.numero_cliente, 'MONTO': '', 'MONEDA': '',
                    'FECHA DE LA OPERACION': pre.fecha_operacion, 'FECHA DE DETECCION DE LA OPERACION': pre.fecha_operacion, 'NACIONALIDAD': pre.nacionalidad, 'TIPO DE PERSONA': pre.tipo_persona, 'RAZON SOCIAL': pre.razon_social,
                    'NOMBRE': this.vacio(pre.nombres) ? '' : pre.nombres, 'APELLIDO PATERNO': pre.apellido_paterno, 'APELLIDO MATERNO': pre.apellido_materno, 'RFC': this.vacio(pre.rfc) ? '' : pre.rfc, 'CURP': pre.curp,
                    'FECHA DE NACIMIENTO O CONSTITUCION': this.vacio(pre.fecha_nacimiento) ? '' : pre.fecha_nacimiento, 'DOMICILIO': this.vacio(pre.calle) ? pre.callem : (pre.calle + ' ' + pre.numero_exterior + interior + pre.codigo_postal),
                    'COLONIA': this.vacio(pre.cve_col) ? '' : pre.cve_col, 'CIUDAD O POBLACION': pre.cve_pld, 'TELEFONO': tel, 'ACTIVIDAD ECONOMICA': this.vacio(pre.cve_ocupacion) ? '' : pre.cve_ocupacion,
                    'AGENTE O APODERADO': '', 'APELLIDO PATERNO.': '', 'APELLIDO MATERNO.': '', 'RFC.': '', 'CURP.': '', 'CONSECUTIVO DE CUENTAS': '', 'NUMERO DE CUENTA': '', 'CLAVE DE LA ENTIDAD': '',
                    'TITULAR DE LA CUENTA': '', 'APELLIDO PATERNO T': '', 'APELLIDO MATERNO T': '', 'DESCRIPCION DE LA OPERACION': pre.notificacion, 'RAZONES': ''

                });
                //incrementa la can cada vez que se recorre el for para armar el folio
                cant++;
            }
            //Descargar archivo
            this.exportarACSV(this.listPre, nombre);
        }
    }
    /**
     * Se arma el JSON a procesar para el docuemnto CSV de Inusuales
     */
    generarReporteInusual() {
        let nombre = '2' + this.listaOpInsuales[0].casfim + moment(this.today).format("YYMMDD") + '.' + this.listaOpInsuales[0].organismo_supervisor;
        //llenar lista con los datos correspondientes 
        let folio = '';
        let cant = 1;
        for (let ins of this.listaOpInsuales) {
            folio = this.folio(cant);
            //obtener el telefono 
            let telF = JSON.parse(ins.telefono);
            let telM = JSON.parse(ins.telmoral);
            let interior = '';
            if (!this.vacio(ins.numero_interior)) {
                interior = ins.numero_interior;
            }
            this.listIns.push({
                'TIPO DE REPORTE': 2, 'PERIODO DEL REPORTE': moment(this.today).format("YYYYMMDD"), 'FOLIO': folio,
                'ORGANISMO SUPERVISOR': ins.organismo_supervisor, 'CLAVE DE LA ENTIDAD FINANCIERA': ins.casfim, 'LOCALIDAD': ins.clave_colonia_siti, 'SUCURSAL': ins.cve_sucursal,
                'TIPO DE OPERACION': ins.clave_t_mov, 'INSTRUMENTO MONETARIO': ins.cve_fpago, 'NUMERO DE CUENTA CONTRATO': ins.numero_cliente, 'MONTO': ins.cantidad, 'MONEDA': ins.cve_moneda_sat,
                'FECHA DE LA OPERACION': ins.fecha_operacion, 'FECHA DE DETECCION DE LA OPERACION': '', 'NACIONALIDAD': ins.nacionalidad, 'TIPO DE PERSONA': ins.tipo_persona, 'RAZON SOCIAL': ins.razon_social,
                'NOMBRE': ins.nombres, 'APELLIDO PATERNO': ins.apellido_paterno, 'APELLIDO MATERNO': ins.apellido_materno, 'RFC': ins.rfc, 'CURP': ins.curp,
                'FECHA DE NACIMIENTO O CONSTITUCION': ins.fecha_nacimiento, 'DOMICILIO': ins.calle + ' ' + ins.numero_exterior + interior + ins.codigo_postal,
                'COLONIA': ins.cve_col, 'CIUDAD O POBLACION': ins.cve_pld, 'TELEFONO': this.vacio(telF) ? telM[0].telefono : telF[0].telefono, 'ACTIVIDAD ECONOMICA': ins.cve_ocupacion,
                'AGENTE O APODERADO': '', 'APELLIDO PATERNO.': '', 'APELLIDO MATERNO.': '', 'RFC.': '', 'CURP.': '', 'CONSECUTIVO DE CUENTAS': '', 'NUMERO DE CUENTA': '', 'CLAVE DE LA ENTIDAD': '',
                'TITULAR DE LA CUENTA': '', 'APELLIDO PATERNO T': '', 'APELLIDO MATERNO T': '', 'DESCRIPCION DE LA OPERACION': ins.notificacion, 'RAZONES': ''
            });
            //incrementa la can cada vez que se recorre el for para armar el folio
            cant++;

        }

        //Descargar archivo
        this.exportarACSV(this.listIns, nombre);
    }
    /**
* Metodo para filtrar OP. RELEVANTES
* @param event --evento a filtrar
*/
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceRelevantes.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceRelevantes.paginator) {
            this.dataSourceRelevantes.paginator.firstPage();
        }
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
        ReportePldComponent.downloadFile(fileName, data);
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
     * Metodo para mostrar los mensajes de error
     */
    validaciones = {
        //Referencias para datos generales referencias
        'reporte': [
            { type: 'required', message: 'Campo requerido.' }],
        'mesIn': [
            { type: 'required', message: 'Campo requerido.' }],
        'mesFin': [
            { type: 'required', message: 'Campo requerido.' }],
        'sucursal': [{ type: 'required', message: 'Campo requerido.' }]

    }
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
}
