
import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { map, startWith } from "rxjs/operators";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { PermisosService } from "../../../shared/service/permisos.service";
import * as moment from "moment";


@Component({
  selector: 'polizas-auxiliares',
  moduleId: module.id,
  templateUrl: 'polizas-auxiliares.component.html'
})

/**
 * @autor: Fatima Bolaños Duran 
 * @version: 1.0.0
 * @fecha: 08/08/2022
 * @descripcion: Componente para la gestion de polizas y auxiliares (sat)
 */
export class PolizasAuxiliaresSatComponent implements OnInit {
  //Wait
  @BlockUI() blockUI: NgBlockUI;

  // Declaracion de variables y componentes
  formPolizasAuxi: UntypedFormGroup;

  // Variables de las sucursales
  sucursalID: any;
  listaSucursales: any = [];
  cveSucursal: any;

  // datos de numero de orden y transaciones
  mostrarOrden: boolean = false;
  mostrarTran: boolean = false;

  //Lista de reportes
  listaReportes: any = [];
  opcionesReporte: Observable<string[]>;
  tipoRepor: string = '';

  // lista de polizas
  listatipos: any = [];
  tipoPoliza: any = [];

  // lista de tipo de solicitud de
  listaSolicitud: any = [];
  opcionesSolicitud: Observable<string[]>;
  tipoSolicitudes: string = '';

  

  constructor(private service: GestionGenericaService,
    private formBuilder: UntypedFormBuilder,
    private servicePermisos: PermisosService
  ) {


    this.formPolizasAuxi = this.formBuilder.group({
      tipoReporte: new UntypedFormControl('', { validators: [Validators.required] }),
      fechain: new UntypedFormControl('', [Validators.required]),
      fechafin: new UntypedFormControl('', [Validators.required]),
      tipo: new UntypedFormControl(''),
      tipoSolicitud: new UntypedFormControl('',),
      numeroOrden: new UntypedFormControl(''),
      numeroTramite: new UntypedFormControl('',),
      sucursal: new UntypedFormControl(),
      consolidado: new UntypedFormControl(true),
      acumulado: new UntypedFormControl(false),
      movimientos: new UntypedFormControl(false),
      cveSucursal: new UntypedFormControl(),
      xml: new UntypedFormControl(false)


    });

    this.formPolizasAuxi.get('tipo').setValue(this.listatipos[3]);
    this.sucursalID = servicePermisos.sucursalSeleccionada.sucursalid;
    this.cveSucursal = servicePermisos.sucursalSeleccionada.cveSucursal
  
  }


  /**
   * Metodo de OnInit
   */
  ngOnInit(): void {
    this.tipoReportePolizas();
    this.tipoSolicitude();
    this.spslistaTipoPolizas();
    this.spsSucurales();
  }


  /**
    * Metodo para cargar en tabla las sucursales
    */
  spsSucurales() {
    this.blockUI.start('Cargando datos...');

    this.listaSucursales = this.servicePermisos.sucursales;

    this.blockUI.stop();
  }

  /**
  * Método que en lista los tipos de reporte de polizas
  */
  tipoReportePolizas() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(environment.categorias.tipoReporPolizas, 'listaGeneralCategoria').subscribe(data => {
      this.listaReportes = data;
      this.opcionesReporte = this.formPolizasAuxi.get('tipoReporte').valueChanges.pipe(
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
  movimiento: boolean = false;
  saldoacomulado: boolean = false;

  opcionReporte(opcion:any):void {

    this.movimiento = false;
    this.saldoacomulado = false;
    this.numTramiteActivo = false;
    this.numOrdenAvtivo = false;
    this.formPolizasAuxi.get('numeroTramite').setValue('');
    this.formPolizasAuxi.get('numeroOrden').setValue('');
    this.formPolizasAuxi.get('numeroTramite').setValidators([]);
    this.formPolizasAuxi.get('numeroTramite').updateValueAndValidity();
    this.formPolizasAuxi.get('numeroOrden').setValidators([]);
    this.formPolizasAuxi.get('numeroOrden').updateValueAndValidity();

    this.formPolizasAuxi.get('tipo').setValue(null);

    this.formPolizasAuxi.get('tipoSolicitud').reset();
    
    this.opcionesSolicitud = this.formPolizasAuxi.get('tipoSolicitud').valueChanges.pipe(
      startWith(''),
      map(value => this.filtroSolicitud(value))
    );
    
    
    this.formPolizasAuxi.get('sucursal').setValue(null);

    this.tipoRepor = opcion.option.value.cveGeneral;

    if (this.tipoRepor == environment.generales.auxiliarCuenta) {
      this.movimiento = true;
      this.saldoacomulado = true;
    }
    
  }

  /**
   * Método que en lista los tipos de Solicitud
   */
  tipoSolicitude() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(environment.categorias.tipoSolicituds, 'listaGeneralCategoria').subscribe(data => {
      this.listaSolicitud = data;
      this.opcionesSolicitud = this.formPolizasAuxi.get('tipoSolicitud').valueChanges.pipe(
        startWith(''),
        map(value => this.filtroSolicitud(value))
      );

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );
  }

  /**
   * 
   * @param value 
   * @returns 
   */
  private filtroSolicitud(value: string): any {
    const filterValue = value;
    return this.listaSolicitud.filter(data => data.descripcion.toLowerCase().includes(filterValue));
  }

  /**
   * 
   * @param solicitud 
   * @returns 
   */
  displayFn1(solicitud: any): string {
    return solicitud && solicitud.descripcion ? solicitud.descripcion : '';
  }

  /**
  * Método para el tipo de solicitud seleccionado
  * @param opcion 
  */
  numOrdenAvtivo: boolean = false;
  numTramiteActivo: boolean = false;

  opcionesSolicitu(opcion:any) {
    
    this.tipoSolicitudes = opcion.option.value.cveGeneral;

    if (this.tipoSolicitudes == environment.generales.devolucion || 
        this.tipoSolicitudes == environment.generales.compesacion) {

        this.numTramiteActivo = true;
        this.formPolizasAuxi.get('numeroTramite').setValue('');
        this.formPolizasAuxi.get('numeroTramite').setValidators([Validators.required, Validators.pattern("[0-9]{10}")]);
        this.formPolizasAuxi.get('numeroTramite').updateValueAndValidity();
        this.formPolizasAuxi.get('numeroOrden').setValidators([]);
        this.formPolizasAuxi.get('numeroOrden').updateValueAndValidity();

        this.numOrdenAvtivo = false;
        this.formPolizasAuxi.get('numeroOrden').setValue('');


    } else {

        this.numTramiteActivo = false;
        this.formPolizasAuxi.get('numeroTramite').setValue('');
        this.numOrdenAvtivo = true;
        this.formPolizasAuxi.get('numeroOrden').setValue('');
        this.formPolizasAuxi.get('numeroOrden').setValidators([Validators.required, Validators.pattern("[a-z]{3}[0-6][0-9][0-9]{5}{/}[0-9]{2}")]);
        this.formPolizasAuxi.get('numeroOrden').updateValueAndValidity();
        this.formPolizasAuxi.get('numeroTramite').setValidators([]);
        this.formPolizasAuxi.get('numeroTramite').updateValueAndValidity();

    }

  }


  /**
   * Metodo que genera el reporte de Polizas de Periodo
   */
  spsReportePolizasPeriodoXml() {

    if (this.formPolizasAuxi.get('consolidado').value === false) {
      this.formPolizasAuxi.get('sucursal').setValidators([Validators.required]);
      this.formPolizasAuxi.get('sucursal').updateValueAndValidity();
    } else {
      this.formPolizasAuxi.get('sucursal').setValidators([]);
      this.formPolizasAuxi.get('sucursal').updateValueAndValidity();
    }

    if (this.formPolizasAuxi.invalid) {
      this.validateAllFormFields(this.formPolizasAuxi);
      return;
    }

    if (this.formPolizasAuxi.get('consolidado').value === false) {
      this.sucursalID = this.formPolizasAuxi.get('sucursal').value.sucursalid;
    } else {
      this.sucursalID = this.servicePermisos.sucursalSeleccionada.sucursalid;
    }

    let json = {
                "fechaIn": moment(this.formPolizasAuxi.get('fechain').value).format("YYYY-MM-DD"),
                "fechaFin": moment(this.formPolizasAuxi.get('fechafin').value).format("YYYY-MM-DD"),
                "tipoPoliza": this.tipoPoliza.claveTipo,
                "tipoSolicitud": this.tipoSolicitudes,
                "consolidado": this.formPolizasAuxi.get('consolidado').value,
                "sucursalID": this.sucursalID,
                "numOrden": this.formPolizasAuxi.get('numeroOrden').value,
                "numTramite": this.formPolizasAuxi.get('numeroTramite').value
               }

    this.blockUI.start('Generando Reporte...');

    this.service.registrar(json, 'spsPolizasXml').subscribe(xml => {
      this.blockUI.stop();
      if (xml[0] === '0') {
        this.service.showNotification('top', 'right', 2, xml[1]);
        if (xml[2] != null) {
          const linkSource = 'data:application/xml;base64,' + xml[2] + '\n';

          const downloadLink = document.createElement("a");
          const fileName = 'Polizas del Periodo' + '.xml';

          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
          this.formPolizasAuxi.reset();
        }


      } else {
        this.service.showNotification('top', 'right', 3, xml[1]);
      }



    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });

  }


  /**
   * Metodo de selecion del tipo de poliza 
   * 
   **/
  selectipo(option: any) {

    this.tipoPoliza = option.value;

  }


  /**
   * Metodo que genera el reporte de Auxiliar de Folios
   */
  spsReporteAuxiliarFoliosXml() {

    if (this.formPolizasAuxi.get('consolidado').value === false) {
      this.formPolizasAuxi.get('sucursal').setValidators([Validators.required]);
      this.formPolizasAuxi.get('sucursal').updateValueAndValidity();
    } else {
      this.formPolizasAuxi.get('sucursal').setValidators([]);
      this.formPolizasAuxi.get('sucursal').updateValueAndValidity();
    }


    if (this.formPolizasAuxi.invalid) {
      this.validateAllFormFields(this.formPolizasAuxi);
      return;
    }

    if (this.formPolizasAuxi.get('consolidado').value === false) {
      this.sucursalID = this.formPolizasAuxi.get('sucursal').value.sucursalid;
    } else {
      this.sucursalID = this.servicePermisos.sucursalSeleccionada.sucursalid;
    }


    let json =

    {
      "fechaIn": moment(this.formPolizasAuxi.get('fechain').value).format("YYYY-MM-DD"),
      "fechaFin": moment(this.formPolizasAuxi.get('fechafin').value).format("YYYY-MM-DD"),
      "tipoPoliza": this.tipoPoliza.claveTipo,
      "tipoSolicitud": this.tipoSolicitudes,
      "consolidado": this.formPolizasAuxi.get('consolidado').value,
      "sucursalID": this.sucursalID,
      "numOrden": this.formPolizasAuxi.get('numeroOrden').value,
      "numTramite": this.formPolizasAuxi.get('numeroTramite').value
    }

    this.blockUI.start('Generando Reporte...');
    this.service.registrar(json, 'spsPolizasfoliosXml').subscribe(xml => {
      this.blockUI.stop();

      if (xml[0] === '0') {
        this.service.showNotification('top', 'right', 2, xml[1]);
        if (xml[2] != null) {
          const linkSource = 'data:application/xml;base64,' + xml[2] + '\n';

          const downloadLink = document.createElement("a");
          const fileName = 'Auxiliar de Folios' + '.xml';

          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
          this.formPolizasAuxi.reset();
        }


      } else {
        this.service.showNotification('top', 'right', 3, xml[1]);
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });


  }


  /**
   * Metodo que genera el reporte de Auxiliar de cuentas
   */
  spsReporteAuxiliarCuentasXml() {

    if (this.formPolizasAuxi.get('consolidado').value === false) {
      this.formPolizasAuxi.get('sucursal').setValidators([Validators.required]);
      this.formPolizasAuxi.get('sucursal').updateValueAndValidity();
    } else {
      this.formPolizasAuxi.get('sucursal').setValidators([]);
      this.formPolizasAuxi.get('sucursal').updateValueAndValidity();
    }


    if (this.formPolizasAuxi.invalid) {
      this.validateAllFormFields(this.formPolizasAuxi);
      return;
    }

    if (this.formPolizasAuxi.get('consolidado').value === false) {
      this.sucursalID = this.formPolizasAuxi.get('sucursal').value.sucursalid;
    } else {
      this.sucursalID = this.servicePermisos.sucursalSeleccionada.sucursalid;
    }

    let json =

    {
      "cvesucursal": this.cveSucursal,
      "fechain": moment(this.formPolizasAuxi.get('fechain').value).format("YYYY-MM-DD"),
      "fechafin": moment(this.formPolizasAuxi.get('fechafin').value).format("YYYY-MM-DD"),
      "tipoPoliza": this.tipoPoliza.claveTipo,
      "acumulado": this.formPolizasAuxi.get('acumulado').value,
      "movimientos": this.formPolizasAuxi.get('movimientos').value,
      "consolida": this.formPolizasAuxi.get('consolidado').value,
      "sucursalID": this.sucursalID,
      "tipoSolicitud": this.tipoSolicitudes,
      "numOrden": this.formPolizasAuxi.get('numeroOrden').value,
      "numTramite": this.formPolizasAuxi.get('numeroTramite').value
    }

    // saldos acomulado 
    this.blockUI.start('Generando Reporte...');
    this.service.registrar(json, 'spsAuxctasXml').subscribe(xml => {
      this.blockUI.stop();
      if (xml[0] === '0') {
        this.service.showNotification('top', 'right', 2, xml[1]);
        if (xml[2] != null) {
          const linkSource = 'data:application/xml;base64,' + xml[2] + '\n';

          const downloadLink = document.createElement("a");
          const fileName = 'Auxiliar de Folios' + '.xml';

          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
          this.formPolizasAuxi.reset();
        }


      } else {
        this.service.showNotification('top', 'right', 3, xml[1]);
      }



    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });


  }

  /**
   * Metodo que lista los tipos de poliza 
   */
  spslistaTipoPolizas() {

    this.blockUI.start();

    this.service.getListByID(2, 'listaTipoPolizas').subscribe(
      (data: any) => {

        this.listatipos = data.splice(0, 3)

        this.blockUI.stop();

      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      });
  }

  /**
   *validaciones
   */
  validaciones = {

    'tipoReporte': [{ type: 'required', message: 'Campo requerido.' }],
    'mesIn': [{ type: 'required', message: 'Fecha Inicial requerida.' }],
    'mesFin': [{ type: 'required', message: 'Fecha Final requerida.' }],
    'tipo': [{ type: 'required', message: 'Campo requerido.' }],
    'tipoSolicitud': [{ type: 'required', message: 'Campo requerido.' }],
    'numeroOrden': [{ type: 'required', message: ' Numero de Orden Incorrecta.' }],
    'numeroTramite': [{ type: 'required', message: 'Numero de Tramite Incorrecto.' }],
    'sucursal': [{ type: 'required', message: 'Sucursal requerida.' }],

  }


  /**
   * Identifica el tipo de reporte a generar 
   * valor si el combo xml esta chekeado es xml
   * 
   */
  seleccionaTipoReporte() {

    if (this.tipoRepor == environment.generales.auxiliarCuenta) {

      this.spsReporteAuxiliarCuentasXml();
      // REPORTE XML

    } else
      if (this.tipoRepor == environment.generales.polizasPeriodo) {

        this.spsReportePolizasPeriodoXml();     // REPORTE XML

      } else {
        this.spsReporteAuxiliarFoliosXml();  // REPORTE XML

      }
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

}