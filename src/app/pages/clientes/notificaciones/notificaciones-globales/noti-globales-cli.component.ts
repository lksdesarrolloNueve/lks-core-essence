import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { FiresbaseService } from "../../../../shared/service/service-firebase/firebase.service";
import { AdminNotGloClientesComponent } from "./admin-not-globales/admin-not-globales-cli.component";
import { globales } from '../../../../../environments/globales.config';
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";


@Component({
    selector: 'noti-globales-cli',
    moduleId: module.id,
    templateUrl: 'noti-globales-cli.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 09/11/2021
 * @descripcion: Componente para la gestion de avisos para clientes de manera global
 */
export class NotGloClientesComponent implements OnInit {


    //Variables Avisos
    listaAvisos: any = [];
    displayedColumnsAvisos: string[] = ['aviso', 'vigencia', 'sucursal', 'tipoSocio', 'estatus', 'acciones'];
    dataSourceAvisos: MatTableDataSource<any>;
    @ViewChild('paginatorAvisos') paginatorAvisos: MatPaginator;
    @ViewChild('sortAvisos') sortAvisos: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;


    /**
     * Constructor de la clase
     * @param firebase  - Service de acceso a firebase
     * @param service - Service de acceso a las APIS
     * @param dialog - Gestion de ventanas emergentes
     */
    constructor(private firebase: FiresbaseService, private service: GestionGenericaService, public dialog: MatDialog) {


    }

    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsAvisos();

    }


    /**
     * metodo para filtrar en el listado obtenido de base de datos
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterAviso = (event.target as HTMLInputElement).value;
        this.dataSourceAvisos.filter = filterAviso.trim().toLowerCase();
        if (this.dataSourceAvisos.paginator) {
            this.dataSourceAvisos.paginator.firstPage();
        }
    }


    /**
    * metodo que lista los aviso_cajas en el combo
    */
    spsAvisos() {
        this.firebase.lista("avisos_globales_socios").subscribe((res) => {
            this.listaAvisos = [];

            res.forEach((p: any) => {

                this.listaAvisos.push({
                    id: p.payload.doc.id,
                    aviso: p.payload.doc.data().aviso,
                    vigencia: p.payload.doc.data().vigencia,
                    cveSucursal: p.payload.doc.data().cveSucursal,
                    sucursal: p.payload.doc.data().sucursal,
                    tiposocio: p.payload.doc.data().tiposocio,
                    descTipoSocio: p.payload.doc.data().descTipoSocio,
                    estatus: p.payload.doc.data().estatus
                });

            });


            this.dataSourceAvisos = new MatTableDataSource(this.listaAvisos);
            this.dataSourceAvisos.paginator = this.paginatorAvisos;
            this.dataSourceAvisos.sort = this.sortAvisos;


        });
    }


    /**
     * Metodo que habilita o deshabilita la notificacion
     * @param elemento  - elemento a afectar
     */
    cambiaEstatus(elemento: any) {

        if (elemento.estatus) {
            elemento.estatus = false;
        } else {
            elemento.estatus = true;
        }

        this.blockUI.start('Editando ...');

        this.firebase.actualiza("avisos_globales_socios", elemento.id, {
            aviso: elemento.aviso,
            vigencia: elemento.vigencia,
            cveSucursal: elemento.cveSucursal,
            sucursal: elemento.sucursal,
            tiposocio: elemento.tiposocio,
            descTipoSocio: elemento.descTipoSocio,
            estatus: elemento.estatus
        }).then(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El estatus del aviso se modifico correctamente');
        }, (error) => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    /**
     * METODO QUE ELIMINA AVISOS
     * @param data - ELEMENTO A ELIMINAR
     */
    eliminaAviso(data: any) {

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: "Confirmación.",
                body: "¿Desea eliminar el aviso?"
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar

                this.blockUI.start('Eliminando ...');

                this.firebase.elimina("avisos_globales_socios", data.id).then(() => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, 'El aviso se elimino correctamente');
                }, (error) => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, 'Hubo un error al eliminar');
                });

            }
        });

    }


    /**
     * Metodo que abre el modal para la administracion de avisos
     * @param data - Objeto o condicion
     */
    abrirDialogoNotClientesGLobales(data:any) {
        let titulo = '';
        let accion = 0;

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            titulo = "Registrar";
            accion = 0;
        } else {
            accion = 2;
            titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminNotGloClientesComponent, {
            data: {
                accion: accion,
                titulo: titulo,
                notificacion: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            //spss
        });

    }


}