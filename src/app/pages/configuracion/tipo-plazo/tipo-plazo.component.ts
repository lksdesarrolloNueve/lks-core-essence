import { Component, OnInit, PipeTransform, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionTipoPlazoComponent } from "./modat-tipo-plazo/administracion-tipo-plazo.component";

@Component({
    selector: 'tipo-plazo',
    moduleId: module.id,
    templateUrl: 'tipo-plazo.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 13/10/2021
 * @descripcion: Componente para la gestion de tipo plazo
 */
export class TipoPlazoComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['clavePlazo', 'descripcion', 'dias', 'meses', 'estatus', 'acciones'];
    dataSourceTipoPlazo: MatTableDataSource<any>;
    listaTipoPlazo: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente tipo plazo
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsTipoPlazo();
    }

    /**
     * Metodo para cargar en tabla tipos plazo
     */
    spsTipoPlazo() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1, 'listaTipoPlazo').subscribe(data => {
            this.blockUI.stop();

            this.listaTipoPlazo = data;
            this.dataSourceTipoPlazo = new MatTableDataSource(this.listaTipoPlazo);
            this.dataSourceTipoPlazo.paginator = this.paginator;
            this.dataSourceTipoPlazo.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para filtrar tipo plazo
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceTipoPlazo.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceTipoPlazo.paginator) {
            this.dataSourceTipoPlazo.paginator.firstPage();
        }
    }

    /**
     * Metodo que me abre un modal para la gestion de tipo plazo (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirDialogoTipoPlazo(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionTipoPlazoComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                tipoPlazo: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsTipoPlazo();
        });
    }

    /**
    * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
    */
    crudTipoPlazo(elemento: any, datos: any) {
        let tipoAccion = 0;

        if (elemento === false) {
            tipoAccion = 3 // baja
            this.blockUI.start('Procesando Baja...')
        } else {
            tipoAccion = 4 //alta
            this.blockUI.start('Procesando Alta...')

        }

        this.service.registrarBYID(datos, tipoAccion, 'crudTipoPlazo')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    datos.estatus = elemento;
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.spsTipoPlazo()
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            })
    }


}