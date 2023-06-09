import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { ModalRiesgosComponent } from "./modal-riesgos/modal-riesgos.component";
import { MatDialog } from "@angular/material/dialog";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'matriz-riesgos',
    moduleId: module.id,
    templateUrl: 'matriz-riesgos.component.html',
    styleUrls: ['matriz-riesgos.component.css']
})
/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 11/05/2022
 * @descripcion: Componente para la gestion de la matriz de riesgos
 */
export class MatrizRiesgosComponent implements OnInit {
    displayedColumns: string[] = ['numero', 'elementoRiesgo', 'indicadoresRiesgo', 'definicionTeorica',
        'definicionOperativa', 'criterioRiesgoAlto', 'puntajeRiesgoAlto', 'criterioRiesgoBajo', 'puntajeRiesgoBajo',
        'ponderador'];
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    dataSourceMatriz = new MatTableDataSource();
    listaMatriz: any;
    excel = [];

    constructor(
        private service: GestionGenericaService,
        public dialog: MatDialog,
    ) {
    }

    ngOnInit() {
        this.spsMatriz();
    }

    /**
     * Se consulta la matriz de riesgos para vaciar su contenido en una tabla
     */
    spsMatriz() {
        this.blockUI.start('Cargando...');

        this.service.getList('spsMatrizRiesgos').subscribe(data => {
            this.blockUI.stop();
            this.listaMatriz = data;

            this.dataSourceMatriz.data = this.listaMatriz;
            this.dataSourceMatriz.paginator = this.paginator;
            this.dataSourceMatriz.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Se filtra el contenido de la tabla en base al input de filtro
     * @param event
     */
    filtrar(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMatriz.filter = filterValue.trim().toLowerCase();
    }

    /**
     * Se abre el modal de crud y se pasan los datos correspondientes segun el caso
     * @param accion 1. Insercion 2. Actualizacion
     * @param row Datos del renglon seleccionado, se usa en caso de querer actualizar, sino se envia null
     */
    crudElemento(accion: number, row: any) {
        const dialofRef = this.dialog.open(ModalRiesgosComponent, {
            width: '40%',
            data: {
                accion: accion, // 1. Agregar 2. Actualizar
                riesgo: row
            }
        });

        dialofRef.afterClosed().subscribe(() => { this.spsMatriz(); });
    }

    /**
     * Método para asignar los parametros necesarios para generar un excel en base al json que se proporcione
     */
    public exportarExcel() {
        let json = this.listaMatriz; // JSON que se convertira a excel
        let nombreExcel = "matriz_riesgos"; // Nombre que tendra el excel

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.descargarExcel(excelBuffer, nombreExcel);
    }

    /**
     * Método para descargar el excel generado
     * @param buffer 
     * @param fileName 
     */
    private descargarExcel(buffer: any, fileName: string) {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';

        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + "_" + new Date().getTime() + EXCEL_EXTENSION); // Se completa el nombre del excel con informacion adicional
    }

}