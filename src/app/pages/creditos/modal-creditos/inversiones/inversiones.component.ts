import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTabChangeEvent } from "@angular/material/tabs";

@Component({
  selector: 'inversiones',
  moduleId: module.id,
  templateUrl: 'inversiones.component.html'
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 8/08/2022
 * @descripcion: Componente para la gestion de garantia inversion
 */

export class ModalInversionesComponent implements OnInit {
  //Declaracion de variable sy compronentes
  @BlockUI() blockUI: NgBlockUI;
  opcionesInversiones: any = [];
  listaInversiones = [];
  encabezado: string = "";
  numCliente: string = "";
  inversiones: any = [];//lista de inversiones seleccionadas

  @ViewChild(MatPaginator) paginatorI: MatPaginator;
  @ViewChild(MatSort) sortI: MatSort;
  displayedColumnsIn: string[] = ['seleccionI', 'monto', 'inversion'];
  dataSourceInversiones: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);
  accion: number = 0;

  /**
   * Contructor de la clase que incializa los componentes
   * @param service  utileria 
   * @param dialog modal
   * @param data informacion que recibe el modal
   */
  constructor(private service: GestionGenericaService, private dialog: MatDialogRef<ModalInversionesComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.encabezado = data.titulo;
    this.inversiones = data.listInv;
    this.numCliente = data.numCliente;


  }
  ngOnInit() {
    this.spsInvCliente();
  }
  /**
   * Metodo que obtiene las inversiones por filtro de cliente
   * @param numCliente - Numero del cliente/socio
   */
  spsInvCliente() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(this.numCliente + '/4', 'spsInvCliente').subscribe(inversiones => {

      this.opcionesInversiones = inversiones;
      this.dataSourceInversiones = new MatTableDataSource(this.opcionesInversiones);
      this.blockUI.stop();
      /** Mostrar seleccion */
      if (this.inversiones.length > 0) {
        for (let option of this.inversiones) {
          const exists = this.dataSourceInversiones.data.filter(x => x.inversionID === option[0])[0];
          this.selection.toggle(exists);
        }
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error.Message);
    });

  }
  /** Verifica Si el número de elementos seleccionados coincide con el número total de filas. */
  estaSeleccionado() {
    const numSelected = this.selection.selected.length;
    let numRows;
    if (this.dataSourceInversiones != undefined) {
      numRows = this.dataSourceInversiones.data.length;
    }
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario borrar la selección. */
  masterToggle() {
    if (this.estaSeleccionado()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSourceInversiones.data);
  }

  /** La etiqueta de la casilla de verificación en la fila aprobada*/
  casillaVerificacionI(row?: any): string {
    if (!row) {
      return `${this.estaSeleccionado() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  /**
* Metodo para actualizar la lista de inversiones
* @param changeEvent contiene el elemento tab con sus propiedades
* */
  tabSeleccionada(changeEvent: MatTabChangeEvent) {
    if (changeEvent.index == 0) {
      this.spsInvCliente();
    }

  }
  /**
   * Metodo que devuelve una lista de inversiones seleccionadas como garantia
   */
  agregarInversion() {
    if (this.selection.selected.length > 0) {
      for (let inv of this.selection.selected) {
        this.listaInversiones.push([
          inv.inversionID, inv.detalleInversion.monto, inv.numPagare]
        );
      }
      this.dialog.close(this.listaInversiones);
    }

  }

}