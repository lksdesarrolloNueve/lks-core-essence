import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { environment } from "../../../../environments/environment";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../shared/service/gestion";
import * as moment from "moment";

@Component({
  selector: 'riesgo-credito',
  moduleId: module.id,
  templateUrl: 'riesgo-credito.component.html'
})

/**
* @autor: Fatima Bolaños Duran 
* @descripcion: Componente para la gestión de reportes de Riesgo Creditos 
* @versión: 1.0.0
* @fecha: 10/06/2022
*/
export class RiesgoCreditoComponent implements OnInit {

  //Wait
  @BlockUI() blockUI: NgBlockUI;

  //Declaración de variables y componentes
  formRiesgoCredito: UntypedFormGroup;

  // Lista de las sucursales
  listaSucursales: any[];
  opcionesSucursales: Observable<string[]>;
  selectedISucursal: number = 0;

  //Lista de reportes
  listaReportes: any[];
  opcionesReporte: Observable<string[]>;
  tipoRepor: string = '';

  //Activar tipos de riesgos
  isActivo: boolean = true;
  servicePermisos: any;

  //radiobutons
  opciones: any = [{ id: 1, nombre: 'Sucursal' }, { id: 2, nombre: 'Consolidado' }];
  mostrarSucursal: boolean = false;

  constructor(private service:
    GestionGenericaService, private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe
  ) {
    this.formRiesgoCredito = this.formBuilder.group({
      sucursal: new UntypedFormControl(''),
      //rbtmConsolidado: new FormControl('', { validators: [Validators.required] }),
      fecha: new UntypedFormControl('', { validators: [Validators.required] }),
      tipoReporteCredito: new UntypedFormControl('', { validators: [Validators.required] })
    })
  }

  /**
    * metodo OnInit de la clase riesgoCreditoComponent para iniciar los metodos
    */
  ngOnInit(): void {
    this.spsObtenerSucursales();
    this.tipoReportecredito();
  }

  /**
   * Obtener sucursales
   */
  spsObtenerSucursales() {

    this.blockUI.start();

    this.service.getListByID(2, 'listaSucursales').subscribe(data => {
      this.listaSucursales = data;
      this.opcionesSucursales = this.formRiesgoCredito.get('sucursal').valueChanges.pipe(
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
   * Seleccion radio group
   * @param dato infomarmacion de la opcion seleccionada
   */
  cambioRadio(dato) {
    if (dato.id == 1) {
      this.mostrarSucursal = true;
      this.formRiesgoCredito.get('sucursal').setValidators([Validators.required]);
      this.formRiesgoCredito.get('sucursal').updateValueAndValidity();
    } else {
      //se oculata y limpia la caja de texto
      this.mostrarSucursal = false;
      this.formRiesgoCredito.get('sucursal').setValue('');
      this.formRiesgoCredito.get('sucursal').setValidators(null);
      this.formRiesgoCredito.get('sucursal').updateValueAndValidity();
    }

  }
  /**
  * Metodo para filtrar las sucursal
  */
  opcionSelectSucursales(event) {
    this.selectedISucursal =
      event.option.value.nombreSucursal;
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
  tipoReportecredito() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(environment.categorias.tipoReporteCredito, 'listaGeneralCategoria').subscribe(data => {
      this.listaReportes = data;
      this.opcionesReporte = this.formRiesgoCredito.get('tipoReporteCredito').valueChanges.pipe(
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
     * Metodo para generar el reporte acorde al valor seleccionado 
     */
  generarReporte() {

    if (this.formRiesgoCredito.invalid) {
      this.validateAllFormFields(this.formRiesgoCredito);
      return;
    }
    switch (this.tipoRepor) {
      case environment.generales.riesgoConcentracionCartera:
        this.spsReporteConcentracionCartera();
        break;
      case environment.generales.riesgoTipoCredito:
        this.spsReporteTipoCredito();
        break;
      case environment.generales.riesgoPorZona:
        this.spsReporteZona();
        break;
      case environment.generales.riesgoPorActividad:
        this.spsReporteActvidad();
        break;
      case environment.generales.matrizTransaccion:
        this.spsMatrizTransicion();
        break;
      default:
        break;
    }

  }
  /**
   * Metodo para generar archivo EXCEL de CALIFICACIÓN Y CONSTITUCIÓN DE ESTIMACIONES PREVENTIVAS
   */
  spsReporteConcentracionCartera() {
    this.blockUI.start('Cargando datos...');
    let fecha = moment(this.formRiesgoCredito.get('fecha').value).format("YYYY-MM-DD");
    let sucursal = 0;
    if (this.mostrarSucursal) {

      sucursal = this.formRiesgoCredito.get('sucursal').value.sucursalid;
    }

    let path = fecha + '/' + sucursal;
    this.service.getListByID(path, 'spsReporteConcentracionCred').subscribe(concentracion => {

      if (concentracion[0] == '0') {
        this.service.showNotification('top', 'right', 2, concentracion[1]);
        const linkSource = 'data:application/pdf;base64,' + concentracion[2] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Concentracion por Califiacion' + '.pdf';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 3, concentracion[1]);
      }

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );

  }
  /**
   * Metodo para generar archivo EXCEL de CALIFICACIÓN Y CONSTITUCIÓN DE ESTIMACIONES PREVENTIVAS
   * por tipo de credito
   * 
   */
   spsReporteTipoCredito() {
    this.blockUI.start('Cargando datos...');
    let fecha = moment(this.formRiesgoCredito.get('fecha').value).format("YYYY-MM-DD");
    let sucursal = 0;
    if (this.mostrarSucursal) {

      sucursal = this.formRiesgoCredito.get('sucursal').value.sucursalid;
    }
    let path = fecha + '/' + sucursal;
    this.service.getListByID(path, 'spsReporteTipoCredito').subscribe(tipoCr => {

      if (tipoCr[0] == '0') {
        this.service.showNotification('top', 'right', 2, tipoCr[1]);
        const linkSource = 'data:application/pdf;base64,' + tipoCr[2] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Concentracion por Producto' + '.pdf';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 3, tipoCr[1]);
      }

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );

  }
  /**
   * Generacion del reporte Riesgo de credito por Zona
   */
  spsReporteZona(){
    
    this.blockUI.start('Cargando datos...');
    let fecha = moment(this.formRiesgoCredito.get('fecha').value).format("YYYY-MM-DD");
    let sucursal = 0;
    if (this.mostrarSucursal) {

      sucursal = this.formRiesgoCredito.get('sucursal').value.sucursalid;
    }

    let path = fecha + '/' + sucursal;

    this.service.getListByID(path, 'spsReporteZonaCredito').subscribe(zona => {
  
      if (zona[0] == '0') {
        this.service.showNotification('top', 'right', 2, zona[1]);
        const linkSource = 'data:application/pdf;base64,' + zona[2] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Concentracion por Zona' + '.pdf';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 3, zona[1]);
      }

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );

  }
  /**
   * Generacion del reporte Riesgo de credito por Actividad SCIAN U SINCO
   */
   spsReporteActvidad(){
    
    this.blockUI.start('Cargando datos...');
    let fecha = moment(this.formRiesgoCredito.get('fecha').value).format("YYYY-MM-DD");
    let sucursal = 0;
    if (this.mostrarSucursal) {

      sucursal = this.formRiesgoCredito.get('sucursal').value.sucursalid;
    }

    let path = fecha + '/' + sucursal;

    this.service.getListByID(path, 'spsReporteActividadCredito').subscribe(actividad => {

      if (actividad[0] == '0') {
        this.service.showNotification('top', 'right', 2, actividad[1]);
        const linkSource = 'data:application/pdf;base64,' + actividad[2] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Concentracion por Actividad' + '.pdf';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 3, actividad[1]);
      }

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );

  }
  /**
   * Genera reporte Matriz Transicion
   */
  spsMatrizTransicion(){
    this.blockUI.start('Cargando datos...');
    let fecha = moment(this.formRiesgoCredito.get('fecha').value).format("YYYY-MM-DD");
    let sucursal = 0;
    if (this.mostrarSucursal) {

      sucursal = this.formRiesgoCredito.get('sucursal').value.sucursalid;
    }

    let path = fecha + '/' + sucursal;

    this.service.getListByID(path, 'spsReporteMatrizTransicion').subscribe(matriz => {

      if (matriz[0] == '0') {
        this.service.showNotification('top', 'right', 2, matriz[1]);
        const linkSource = 'data:application/pdf;base64,' + matriz[2] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Matriz de Transicion' + '.pdf';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 3, matriz[1]);
      }

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );
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
   * Metodo para mostrar los mensajes de validaciones 
   */

  validaciones = {
    'tipoReporteCredito': [{ type: 'required', message: 'Campo requerido.' }],
    'fecha': [{ type: 'required', message: 'Campo requerido.' }],
    'sucursal': [{ type: 'required', message: 'Campo requerido.' }],
    'rbtmConsolidado': [{ type: 'required', message: 'Campo requerido.' }]
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