import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ModalServicioComponent } from './modal-servicio.component';

@Component({
    selector: 'empresas-nomina',
    moduleId: module.id,
    templateUrl: 'empresas-nomina.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 18/10/2022
 * @descripcion: Componente para listar las empresas que cuentan con servicio de nomina
 */
export class EmpresasNominaComponent implements OnInit {

    @BlockUI() blockUI: NgBlockUI;
    registro: any = [];
    listaEmpresa: any = [];
    displayedColumns: string[] = ['noCuenta', 'empresa', 'medioDispersion', 'estado']
    dataSourceEmpresa: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    /**
     * Constructor de la clase
     * @param service 
     * @param dialog 
     */
    constructor(private service: GestionGenericaService, private dialog: MatDialog) {

    }

    ngOnInit() {
        this.spsEmpresasNomina();
    }
    /**
     * Lisa las empresas con servicio de nomina
     */
    spsEmpresasNomina() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('', 'spsEmpresasNomina').subscribe(empresa => {
            if (!this.vacio(empresa)) {
                this.listaEmpresa = JSON.parse(empresa);
                this.dataSourceEmpresa = new MatTableDataSource(this.listaEmpresa);
                this.dataSourceEmpresa.paginator = this.paginator;
                this.dataSourceEmpresa.sort = this.sort;
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
 * Metodo para filtrar empresas
 * @param event --evento a filtrar
 */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceEmpresa.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceEmpresa.paginator) {
            this.dataSourceEmpresa.paginator.firstPage();
        }
    }

    /**
     * Se pasa el registro seleccionado para editar
     * @param registro 
     */
    getRecord(registro) {
        this.registro = registro;
        this.abrirModalServicio(2);
    }
    /**
     * Abrir modal ModalServicioComponent para Agregar o Editar un lata de servicio
     */
    abrirModalServicio(accion) {

        let titulo = 'Alta de empresa';
        if (accion == 2) {
            titulo = 'Actualizar  empresa';
        }
        const dialogRef = this.dialog.open(ModalServicioComponent, {
            data: {
                titulo: titulo,
                accion: accion,
                datos: this.registro
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsEmpresasNomina();
        });
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