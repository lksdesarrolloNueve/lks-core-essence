import { Component, Inject, ViewChild } from "@angular/core";
import { FormBuilder, UntypedFormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";

/**
* @autor: Juan Eric Juarez
* @version: 1.0.0
* @fecha: 18/11/2021
* @descripcion: Componente para la busqueda de sujetos
*/
@Component({
    selector: 'sujetos-modal',
    moduleId: module.id,
    templateUrl: 'sujetos-modal.component.html'
})

export class SujetosModalComponent {
  
    //Declaracion de variables
    nombre = new UntypedFormControl('');
    @BlockUI() blockUI: NgBlockUI;
    listaSujetos : any = [];

    accion : any = 0;


    displayedColumns: string[] = ['select','nombre','curp','genero','accion'];
    dataSourceSujetos: MatTableDataSource<any>;
    selection = new SelectionModel<any>(true, []);


    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    /**
     * Constructor
     */
    constructor(public dialogo: MatDialogRef<SujetosModalComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
    private service: GestionGenericaService) {
        
        //Si la accion es 1 Mostrara ambas opciones
            this.accion = data.accion;
      
    }

    /**Metodo para buscar un sujeto registrado que coincida con el q se va a registrar */
    buscarSujeto() {
        const sujeto = {
            "nombres": this.nombre.value
        }

        this.blockUI.start('Cargando datos...');//cmabiara  ala de estados
        this.service.getListByObjet(sujeto, 'buscarSujeto').subscribe(data => {


            if(!this.vacio(data[0].referencias)){
            this.listaSujetos= JSON.parse(data[0].referencias);
            this.dataSourceSujetos = new MatTableDataSource(this.listaSujetos);
            this.dataSourceSujetos.paginator = this.paginator;
            this.dataSourceSujetos.sort = this.sort;
        }else{
            this.service.showNotification('top', 'right', 3, "No se encontraron datos con la información proporcionada.")
        }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
        });
    }


   /**
     * Metodo para filtrar sucursales
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSujetos.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceSujetos.paginator) {
            this.dataSourceSujetos.paginator.firstPage();
        }
    }

    sujetoSeleccionado(sujeto){
        this.dialogo.close(sujeto);
    }

    sujetosSeleccion(){
        this.dialogo.close(this.selection.selected);
    }

      /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceSujetos.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSourceSujetos.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }


      /**
     * Metodo que valida los datos vacios
     * @param value -valor a validar
     * @returns 
     */
       vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
   
}