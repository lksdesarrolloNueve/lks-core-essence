import { Component, OnInit } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { environment } from "../../../../environments/environment";
import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DatePipe } from "@angular/common";
import { MatDatepicker } from "@angular/material/datepicker";

//Constantes//
const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'riesgo-comun',
  moduleId: module.id,
  templateUrl: 'riesgo-comun.component.html',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})

/**
 * @autor: María Guadalupe Santana Olalde 
 * @descripcion: Componente para la gestión de reportes de Riesgo Común 
 * @versión: 1.0.0
 * @fecha: 02/06/2022
 */
export class RiesgoComunComponent implements OnInit {

  date = new UntypedFormControl(moment());

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  //Wait
  @BlockUI() blockUI: NgBlockUI;

  //Declaración de variables y componentes
  accion: number;
  formRiesgoComun: UntypedFormGroup;

  //Lista de las sucursales
  listaSucursales: any[];
  opcionesSucursales: Observable<string[]>;
  selectedISucursal: number = 0;
  sucursal = new UntypedFormControl('', [Validators.required]);

  //radiobutons
  mostrarSucursal: boolean = false;

  //Lista tipos de reportes
  listaReportes: any[];
  opcionesReporte: Observable<string[]>;
  tipoRepor: string = '';

  //Lista tipo de riesgo(Monitoreo)
  listaTipoRiesgo: any[];
  opcionesRiesgos: Observable<string[]>;
  Visible: boolean = false;
  tipoRies: string = '';
  activTipoRiesgo = new UntypedFormControl(false);

  //Activar tipos de riesgos
  isActivarRiesgo: boolean = true;
  servicePermisos: any;

  /**
  * Constructor del componente MovimientosBancariosComponent
  * @param service - Service para el acceso a datos
  */
  constructor(private service: GestionGenericaService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe) {


    this.formRiesgoComun = this.formBuilder.group({
      sucursal: new UntypedFormControl(''),
      descripcion: new UntypedFormControl(''),
      date: new UntypedFormControl('', { validators: [Validators.required] }),
      consolidado: new UntypedFormControl(false),
      tipoReporte: new UntypedFormControl('', { validators: [Validators.required] }),
      tipoRiesgo: new UntypedFormControl('', { validators: [Validators.required] })
    })
  }
  ngOnInit(): void {
    this.spsObtenerSucursales();
    this.tipoReporte();
    this.tipoRiesgo();
  }

  /**
   * Limpia los campos del form
   */
  limpiarFormGeneral() {
    this.formRiesgoComun.reset();
    this.listaSucursales = [];
    this.listaTipoRiesgo = [];
    this.listaReportes = [];

  }


  /**
   * Obtener sucursales
   */
  spsObtenerSucursales() {

    this.blockUI.start();

    this.service.getListByID(2, 'listaSucursales').subscribe(data => {
      this.listaSucursales = data;
      this.opcionesSucursales = this.formRiesgoComun.get('sucursal').valueChanges.pipe(
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
 * Metodo para filtrar 
 */

  opcionSelectSucursales(event) {
    this.selectedISucursal = event.option.value.nombreSucursal;
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
  * Método que enlista los tipos de reporte
  */
  tipoReporte() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(environment.categorias.tipoReporte, 'listaGeneralCategoria').subscribe(data => {
      this.listaReportes = data;
      this.opcionesReporte = this.formRiesgoComun.get('descripcion').valueChanges.pipe(
        startWith(''),
        map(value => this.filtroReporte(value))
      );
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );


  }
  private filtroReporte(value: string): any {
    const filterValue = value;

    return this.listaReportes.filter(data => data.descripcion.toLowerCase().includes(filterValue));
  }

  displayFn(reporte: any): string {
    return reporte && reporte.descripcion ? reporte.descripcion : '';
  }


  /**
   * Método para generar pdf según el tipo de reporte seleccionado
   * @param opcion 
   */
  opcionReporte(opcion) {
    this.tipoRepor = opcion.option.value.cveGeneral;
  }


  /**
   * Método que enlista los tipos de riesgos para el reporte de Monitoreo
   */
  tipoRiesgo() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(environment.categorias.tipoRiesgo, 'listaGeneralCategoria').subscribe(data => {
      this.listaTipoRiesgo = data;
      this.opcionesRiesgos = this.formRiesgoComun.get('descripcion').valueChanges.pipe(
        startWith(''),
        map(value => this.filtroRiesgo(value))
      );

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );
  }
  private filtroRiesgo(value: string): any {
    const filterValue = value;

    return this.listaTipoRiesgo.filter(data => data.descripcion.toLowerCase().includes(filterValue));
  }

  displayFnR(riesgos: any): string {
    return riesgos && riesgos.descripcion ? riesgos.descripcion : '';
  }


  /**
   * Método para generar pdf según el tipo de riesgo seleccionado
   * @param opcion 
   */
  opcionRiesgo(opcion) {
    this.tipoRies = opcion.option.value.cveGeneral;
  }

  /**
 * Metodo que generara un reporte segun seleccione el tipo 
 */
  generaReporte() {

    switch (this.tipoRepor) {

      case environment.generales.financiamiento:
        this.reporteFinanciamiento();
        break;

      case environment.generales.identificacionRC:
        this.reporteIdentificacionRC();
        break;

      case environment.generales.monitoreoRC:
        this.generarReportesPorRiesgo();

        break;

      default:

        break;
    }

  }

  generarReportesPorRiesgo() {

    switch (this.tipoRies) {

      case environment.generales.conyugue:
        this.reporteMonitoreoOpcion1();
        break;

      case environment.generales.mismoDomicilio:
        this.reporteMonitoreoOpcion2();
        break;

      case environment.generales.parientes:
        this.reporteMonitoreoOpcion3();
        break;

      default:

        break;
    }

  }

  /**
    * Seleccion radio group
    * @param dato infomarmacion de la opcion seleccionada
    */
  cambioRadio(dato) {
    if (dato.id == 2) {
      this.mostrarSucursal = true;
    } else {
      //se oculata y limpia la caja de texto
      this.mostrarSucursal = false;
      this.sucursal.setValue('');
      this.sucursal.setValidators(null);
      this.sucursal.updateValueAndValidity();
    }

  }
  cambioConsolidado(dato) {
    if (dato.checked) {
      this.formRiesgoComun.get("sucursal").setValue("");
      this.formRiesgoComun.get("sucursal").setValidators([]);
      this.formRiesgoComun.get("sucursal").updateValueAndValidity();
    }
  }
  /**
   * Método para generar el reporte de Financiamiento
   */
  reporteFinanciamiento() {
    let sucursalS = " ";
    if (this.formRiesgoComun.get("consolidado").value) {
      this.accion = 1;//Consolidado
    } else {
      //Se valida la sucursal
      this.formRiesgoComun.get("sucursal").setValidators([Validators.required]);
      this.formRiesgoComun.get("sucursal").updateValueAndValidity();
      if (this.formRiesgoComun.get("sucursal").invalid) {

        this.blockUI.stop();
        return;
      }
      sucursalS = this.formRiesgoComun.get('sucursal').value.cveSucursal
      this.accion = 2;//Por sucursal
    }
    this.blockUI.start('Generando Reporte');
    let url = sucursalS + '/' + this.datePipe.transform(this.date.value, 'M') + '/' + this.datePipe.transform(this.date.value, 'yyyy');
    this.accion;
    this.service.getListByID(url + '/' + this.accion, 'reporteRCFinanciamiento').subscribe(data => {

      this.blockUI.stop();
      if (data[0] === '0') {
        if (data[2] > 0) {
          const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
          const downloadLink = document.createElement("a");
          const fileName = 'Financiamiento' + '.pdf';

          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }else{
          this.service.showNotification('top', 'right', 3, 'No se encontraron datos para el reporte.');
        }
      }
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });
  }


  /**
   * Método para generar el reporte de Identificación de Riesgo Común
   */
  reporteIdentificacionRC() {
    this.blockUI.start('Generando Reporte');
    let mes = this.datePipe.transform(this.date.value, 'M');
    let anio = this.datePipe.transform(this.date.value, 'yyyy');
    this.service.getListByID(mes + '/' + anio, 'reporteRCFinanciamiento').subscribe(data => {
      this.blockUI.stop();
      if (data[0] === '0') {
        if (data[2] > 0) {
          const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
          const downloadLink = document.createElement("a");
          const fileName = 'Identificación-Riesgo-Común' + '.pdf';
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }else {
          this.service.showNotification('top', 'right', 3, 'No se encontraron datos para el reporte.');
        }
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });
  }

  /**
   * Método para generar el reporte de Monitoreo 1 
   * 1.- Conyugue que depende económicamente
   */
  reporteMonitoreoOpcion1() {
    this.blockUI.start('Generando Reporte');
    let mes = this.datePipe.transform(this.date.value, 'M');
    let anio = this.datePipe.transform(this.date.value, 'yyyy');
    this.service.getListByID(mes + '/' + anio + '/' + 1, 'reporteMonitoreo').subscribe(data => {

      this.blockUI.stop();
      if (data[0] === '0') {
        if (data[2] > 0) {
          const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
          const downloadLink = document.createElement("a");
          const fileName = 'Monitoreo-Riesgo-Común-Riesgo1' + '.pdf';
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }else {
          this.service.showNotification('top', 'right', 3, 'No se encontraron datos para el reporte.');
        }
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });

  }

  /**
   * Método para generar el reporte de Monitoreo 2 
   * 2. Mismo domicilio con otros acreditados
   */
  reporteMonitoreoOpcion2() {
    this.blockUI.start('Generando Reporte');
    let mes = this.datePipe.transform(this.date.value, 'M');
    let anio = this.datePipe.transform(this.date.value, 'yyyy');
    this.service.getListByID(mes + '/' + anio, 'reporteMonitoreoOp2').subscribe(data => {

      this.blockUI.stop();
      if (data[0] === '0') {
        if (data[2] > 0) {
          const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
          const downloadLink = document.createElement("a");
          const fileName = 'Monitoreo-Riesgo-Común-Mismo-Domicilio' + '.pdf';
          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }else {
          this.service.showNotification('top', 'right', 3, 'No se encontraron datos para el reporte.');
        }
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });
  }

  /**
 * Método para generar el reporte de Monitoreo 1 
 * 3.- Parientes(Cualquier pariente)
 */
  reporteMonitoreoOpcion3() {
    this.blockUI.start('Generando Reporte');
    let mes = this.datePipe.transform(this.date.value, 'M');
    let anio = this.datePipe.transform(this.date.value, 'yyyy');
    this.service.getListByID(mes + '/' + anio + '/' + 2, 'reporteMonitoreo').subscribe(data => {

      this.blockUI.stop();
      if (data[0] === '0') {
        if (data[2] > 0) {
        const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Monitoreo-Riesgo-Común-Riesgo3' + '.pdf';
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      }else {
        this.service.showNotification('top', 'right', 3, 'No se encontraron datos para el reporte.');
      }
    }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });

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
   * Lista de validaciones del formulario PEP
   */
  listaValidaciones = {
    "sucursal": [
      { type: 'required', message: 'Campo requerido.' }
    ],

    "date": [
      { type: 'required', message: 'Campo requerido.' }
    ],

    "tipoReporte": [
      { type: 'required', message: 'Campo requerido.' }
    ],

    "tipoRiesgo": [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };
}

