import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdminClienteCitatoriosComponent } from "./modal-cliente-morosos/admin-cliente-citatorio.component";
import globales from "../../../../../../environments/globales.config";


@Component({
    selector: 'clientes-morosos',
    moduleId: module.id,
    templateUrl: 'cliente-moroso.component.html',
})

/**
 * @autor: Fatima Bolaños Duran
 * version: 1.0.
 * @fecha: 22/06/2022
 * @description: Componente para la gestion de medios de Clientes mososos 
 * 
 */

export class ClientesMorososComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    lblCliente: string = globales.ente;
    lblClientes: string = globales.entesMayuscula;

    displayedColumns: string[] = ['numero_cliente', 'nombre_cliente', 'referencia', 'monto_credito', 'saldo_credito', 'dias', 'acciones'];
    dataSourceGeneral: MatTableDataSource<any>;
    listaClienteMorosos: any;
    accion: number;
    titulo: string;

    /**
    * Constructor del componente garantias
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    * @param service -- Instancia de acceso a datos
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    }

    /**
    * Metodo OnInit de la clase
    */
    ngOnInit() {
        this.spsExtrajudicialMorosos();

    }

    /**
    * Metodo para obtener la lista de Clientes Morosos
     */
    spsExtrajudicialMorosos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('', 'spsExtrajudicialMorosos').subscribe(data => {
            this.blockUI.stop();
            this.listaClienteMorosos = data;
            this.dataSourceGeneral = new MatTableDataSource(this.listaClienteMorosos);
            this.dataSourceGeneral.paginator = this.paginator;
            this.dataSourceGeneral.sort = this.sort;
            //Fin set predicate

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo para filtrar 
    * @param event --evento a filtrar
    */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceGeneral.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceGeneral.paginator) {
            this.dataSourceGeneral.paginator.firstPage();
        }
    }

    /**
   * Metodo que abre una ventana modal
   * para la Administracion para los cientes morosos y relisar el citatorio
    * @param accion --1 Registrar , 2 . Editar
    * @param elemento - elemento a editar
    */
    abrirDialogoClientesMorosos(accion: any, elemento: any) {
        let titulo = '';
        //Si la accion es igual a 0 el titulo se llamara Registrar si no Editar
        if (accion === 1) {

            titulo = "registrar";
        } else {
            titulo = 'Editar';
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminClienteCitatoriosComponent, {
            width: '50%',

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento

            },
        });
        dialogRef.afterClosed().subscribe(result => {
            this.spsExtrajudicialMorosos();
        });
    }
}