import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { generales } from "../../../../../environments/generales.config";

@Component({
  selector: 'credito-renovado',
  moduleId: module.id,
  templateUrl: 'credito-renovado.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 12/08/2022
 * @descripcion: 
 */

export class ModalCredRenovadoComponent implements OnInit {
  //Declaracion de variable sus componentes
  @BlockUI() blockUI: NgBlockUI;
  opcionesCredi: any = [];
  listaCredito: any = [];
  encabezado: string = "";
  numCliente: string = "";
  creditoCliente: any = [];//lista de creditos por cliente

  @ViewChild(MatPaginator) paginatorI: MatPaginator;
  @ViewChild(MatSort) sortI: MatSort;
  displayedColumnsIn: string[] = ['seleccionI', 'referencia', 'cveCredito', 'descripcion', 'montoCredito', 'saldoCredito', 'porcentajePagado'];
  dataSourceCredCliente: MatTableDataSource<any>;
  selection = new SelectionModel<any>();
  accion: number = 0;
  renovadoId: number = 0;
  clasificacion: string = "";
  tiposCred: any = [];
  cantRen: number = 0;
  catReest: number = 0
  jsonRenReest: any = [];
  /**
   * Contructor de la clase que incializa los componentes
   * @param service  utileria 
   * @param dialog modal
   * @param data informacion que recibe el modal
   */
  constructor(private service: GestionGenericaService, private dialog: MatDialogRef<ModalCredRenovadoComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.encabezado = data.titulo;
    this.numCliente = data.numCliente;
    this.renovadoId = data.idRenovado;
    this.clasificacion = data.clasificacion;
  }

  /**
   * metodo oninit de la clase
   */
  ngOnInit() {
    this.spsCredCliente();
    this.spsTiposCredito();
  }
  /**
* Metodo que lista los registros de Creditos
*/
  spsTiposCredito() {

    this.blockUI.start('Cargando ...')
    this.service.getListByID(1, 'listarCreditos').subscribe(
      (data: any) => {
        this.tiposCred = data;
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      });
  }

  /**
   * Metodo que obtiene los creditos por numero de cliente
   *
   */
  spsCredCliente() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(this.numCliente + '/false', 'spsCreditoRenovCliente').subscribe(renovado => {
      this.opcionesCredi = renovado;
      this.dataSourceCredCliente = new MatTableDataSource(this.opcionesCredi);
      this.blockUI.stop();
      /** Mostrar seleccion */
      if (this.renovadoId > 0) {
        const exists = this.dataSourceCredCliente.data.filter(x => x.creditoId === this.renovadoId)[0];
        this.selection = exists[0];
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error.Message);
    });

  }
  /**
  * Metodo para listar la cantidad de creditos renovados y reestructurados del cliente
  */
  spsCantidadCredRenReest() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(this.numCliente + '/' + this.listaCredito[0].cveCredito, 'spsCantidadCreditoRenReest').subscribe(renrest => {

      let jsonRenReest;
      if (!this.vacio(renrest)) {
        jsonRenReest = JSON.parse(renrest);
      }
      this.blockUI.stop();
      return jsonRenReest;
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error.Message);
    });
  }
  /** Verifica Si el número de elementos seleccionados coincide con el número total de filas. */
  estaSeleccionado() {
    this.listaCredito = [];
    this.listaCredito.push(this.selection);
    this.jsonRenReest = this.spsCantidadCredRenReest();

  }

  /**
   * Metodo que devuelve los datos del credito seleccionado
   */
  agregarCredito() {
    if (this.listaCredito.length > 0) {
      let tipoCred = this.tiposCred.find(tipo => tipo.cveCredito == this.listaCredito[0].cveCredito);
      let noRepro = tipoCred.extenciones.extCatCreCuatro.noReprogramaciones; //reestructura
      //VALIDA que el credito cumpla con las condiciones de renovacion 
      if (this.clasificacion == generales.clasificacionRenovado) {
        if (tipoCred.extenciones.extencionCatalogoCreditos.solicitudSobreprestamoAplica) {
          if (!this.vacio(this.jsonRenReest)) {//hay renovaciones
            if (this.jsonRenReest[0].cant_renovado > tipoCred.extenciones.extCatCreCuatro.noRefinanciamientos) {
              this.service.showNotification('top', 'right', 3, "El crédito supera el número de renovaciones.");
              return;
            }
          } else {
            this.validarRenovado();
          }
        } else {
          this.service.showNotification('top', 'right', 3, "El tipo de crédito no aplica para renovaciones.");
          return;
        }
      } else if (this.clasificacion == generales.clasificacionReestructura) {
        if (!this.vacio(this.jsonRenReest)) {//hay restructuras 
          if (this.jsonRenReest[0].cant_reesturcturado > noRepro) {
            this.service.showNotification('top', 'right', 3, "El crédito supera el número de reestructuras.");
            return;
          }
        } else {
          this.validarReestrucuturado();
        }
      }

    }

  }

  /**Validaciones para un credito Renovado */
  validarRenovado() {
    let tipoCred = this.tiposCred.find(tipo => tipo.cveCredito == this.listaCredito[0].cveCredito);
    let porcentajeRen = tipoCred.extenciones.extencionCatalogoCreditosDos.solicitudSobreprestamoNum;
    if (this.listaCredito[0].extRenov.interesMora > 0) {
      this.service.showNotification('top', 'right', 3, "El credito no cumple para ser renovado <br> Debe liquidar el Interés Moratorio.");
      return;
    }
    //porcentaje pagado
    if (this.listaCredito[0].extRenov.porcentajeTiempo <= 80) {
      if (this.listaCredito[0].extRenov.porcentajePagado < porcentajeRen) {
        this.service.showNotification('top', 'right', 3, "El credito no cumple para ser renovado <br> El porcentaje de pago debe ser mayor al " + porcentajeRen + "%.");
        return;
      }
    }
    //Cierra modal si cumple
    this.dialog.close(this.listaCredito);
  }

  /**
   * Validaciones para un credito Reestructurado
   */
  validarReestrucuturado() {
    let tipoCred = this.tiposCred.find(tipo => tipo.cveCredito == this.listaCredito[0].cveCredito);
    let diasVen = tipoCred.extenciones.extCatCreCuatro.diasaVencido;

    if (this.listaCredito[0].diaMora > diasVen) {//89
      if (this.listaCredito[0].extRenov.interesNormal > 0) {
        this.service.showNotification('top', 'right', 3, "El credito no cumple para ser reestructurado <br> El intere normal debe estar liquidado.");
        return;
      }
      if (this.listaCredito[0].extRenov.interesMora > 0) {
        this.service.showNotification('top', 'right', 3, "El credito no cumple para ser reestructurado <br> El intere moratorio debe estar liquidado.");
        return;
      }
      if (this.listaCredito[0].extRenov.iva > 0) {
        this.service.showNotification('top', 'right', 3, "El credito no cumple para ser reestructurado <br> El iva debe estar liquidado.");
        return;
      }
    } else {
      this.service.showNotification('top', 'right', 3, "El crédito no cumple para ser reestructurado <br> días de mora menor a " + diasVen + ".");
      return;
    }
    this.dialog.close(this.listaCredito);
  }
  /**
     * Metodo que valida si va vacio.
     * @param value 
     * @returns 
     */
  vacio(value) {
    return (!value || value == undefined || value == "" || value.length == 0);
  }

}