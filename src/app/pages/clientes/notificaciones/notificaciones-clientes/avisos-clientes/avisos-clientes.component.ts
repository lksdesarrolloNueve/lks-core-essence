import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminAvisosClientesComponent } from "./admin-avisos/admin-avisos-clientes.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { UntypedFormControl } from "@angular/forms";
import { FiresbaseService } from "../../../../../shared/service/service-firebase/firebase.service";
import { BuscarClientesComponent } from "../../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { globales } from '../../../.././../../environments/globales.config';
import { verificacionModalComponent } from "../../../../../pages/modales/verificacion-modal/verificacion-modal.component";


@Component({
    selector: 'avisos-clientes',
    moduleId: module.id,
    templateUrl: 'avisos-clientes.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de avisos para clientes
 */
export class AvisosClientesComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['nombreSocio', 'sucursal', 'tipoSocio', 'acciones'];
    dataSourceClientes: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    listaSocios: any = [];
    mostrar: boolean = false;


    //Variables Avisos
    listaAvisos: any = [];
    displayedColumnsAvisos: string[] = ['socio', 'aviso', 'vigencia', 'sucursal', 'tipoSocio', 'estatus', 'acciones'];
    dataSourceAvisos: MatTableDataSource<any>;
    @ViewChild('paginatorAvisos') paginatorAvisos: MatPaginator;
    @ViewChild('sortAvisos') sortAvisos: MatSort;



    panelOpenState = false;
    @BlockUI() blockUI: NgBlockUI;
    condicion = new UntypedFormControl('');

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;


    /**
 * Constructor de la clase
 * @param firebase  - Service de acceso a firebase
 * @param service - Service de acceso a las APIS
 * @param dialog - Gestion de ventanas emergentes
 */
    constructor(private firebase: FiresbaseService, private service: GestionGenericaService,
        public dialogConfirm: MatDialog, public dialog: MatDialog) {


    }

    /**
     * Metodo Inicio de la clase
     */
    ngOnInit() {
        this.spsAvisos();

    }


    /**
     * Metodo que abre el modal para la administracion de avisos
     * @param data - Objeto o condicion
     */
    abrirDialogoAvisos(accion, data) {
        let titulo = '';


        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (accion === 0) {
            titulo = "registrar";
        } else {
            titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminAvisosClientesComponent, {
            data: {
                accion: accion,
                titulo: titulo,
                socio: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            //spss
        });

    }


    /**
     * Consulta de socios
     */
    spsSocios() {

        let path = this.condicion.value + '/2';

        this.blockUI.start('Cargando datos...');//cabiara  ala de estados
        this.service.getListByID(path, 'listaClientesFisicos').subscribe(data => {
            this.listaSocios = data;


            this.dataSourceClientes = new MatTableDataSource(this.listaSocios);
            this.dataSourceClientes.paginator = this.paginator;
            this.dataSourceClientes.sort = this.sort;

            if (this.listaSocios.length > 0) {
                this.mostrar = true;
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }


    /**
     * metodo que lista los aviso_cajas en el combo
     */
    spsAvisos() {
        this.firebase.lista("avisos_socios").subscribe((res) => {
            this.listaAvisos = [];
            res.forEach((p: any) => {
                this.listaAvisos.push({
                    id: p.payload.doc.id,
                    descripcion: p.payload.doc.data().descripcion,
                    cve: p.payload.doc.data().cve,
                    aviso: p.payload.doc.data().aviso,
                    vigencia: p.payload.doc.data().vigencia,
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
     * METODO QUE ELIMINA AVISOS
     * @param data - ELEMENTO A ELIMINAR
     * 
     *    
     */
    eliminaAviso(data: any) {

        const dialogRef = this.dialogConfirm.open(verificacionModalComponent, {
            data: {
                titulo: "Confirmación.",
                body: "¿Desea eliminar el aviso?"
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar

                this.blockUI.start('Eliminando ...');

                this.firebase.elimina("avisos_socios", data.id).then(() => {
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

        this.firebase.actualiza("avisos_socios", elemento.id, {
            descripcion: elemento.descripcion,
            cve: elemento.cve,
            aviso: elemento.aviso,
            vigencia: elemento.vigencia,
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
    * Metodo para abrir ventana modal para buscar al cliente
    * @param data -- Objecto o valor a condicionar
    */
    abrirDialogCliente(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {//clientes
            let titulo = "Lista clientes";
            let accion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                width: '50%',
                data: {
                    titulo: titulo,
                    accion: accion,
                    cliente: data
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                if (result !== 1 && result !== undefined) {//NO esta vacio Aceptar llenar datos
                    this.abrirDialogoAvisos(0,result.datosCl);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'No se ha seleccionado un cliente Físico o extranjero.');

                }
            });
        }

    }


}