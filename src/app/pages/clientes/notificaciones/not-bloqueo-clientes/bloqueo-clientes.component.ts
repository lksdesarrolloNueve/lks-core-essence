import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { UntypedFormControl } from "@angular/forms";
import { FiresbaseService } from "../../../../shared/service/service-firebase/firebase.service";
import { AdminBloqueoClientesComponent } from "./admin-bloqueo-clientes/admin-bloqueo-clientes.component";
import { BuscarClientesComponent } from "../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { globales } from '../../../../../environments/globales.config';

@Component({
    selector: 'bloqueo-clientes',
    moduleId: module.id,
    templateUrl: 'bloqueo-clientes.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de bloqueo de clientes en tiempo real (Base DAtos FireBAse)
 */
export class BloqueoClientesComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['nombreSocio', 'sucursal', 'tipoSocio', 'acciones'];
    dataSourceClientes: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    listaSocios: any = [];
    mostrar: boolean = false;


    //Variables Avisos
    listaBloqueos: any = [];
    displayedColumnsBloqueo: string[] = ['socio', 'motivo', 'fechabloqueo', 'fechadesbloqueo', 'sucursal', 'tipoSocio', 'estatus', 'acciones'];
    dataSourceClientesBloqueados: MatTableDataSource<any>;
    @ViewChild('paginatorBloqueo') paginatorBloqueo: MatPaginator;
    @ViewChild('sortBloqueo') sortBloqueo: MatSort;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;
    

    panelOpenState = false;
    @BlockUI() blockUI: NgBlockUI;
    condicion = new UntypedFormControl('');


    /**
 * Constructor de la clase
 * @param firebase  - Service de acceso a firebase
 * @param service - Service de acceso a las APIS
 * @param dialog - Gestion de ventanas emergentes
 */
    constructor(private firebase: FiresbaseService, private service: GestionGenericaService, public dialog: MatDialog) {


    }

    /**
     * Metodo Inicio de la clase
     */
    ngOnInit() {
        this.spsBloqueos();

    }


    /**
     * Metodo que abre el modal para la administracion de avisos
     * @param data - Objeto o condicion
     */
    abrirDialogoBloqueo(accion, data) {
        let titulo = '';


        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (accion === 0) {
            titulo = "registrar";
        } else {
            titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminBloqueoClientesComponent, {
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
    spsBloqueos() {
        this.firebase.lista("bloqueo_clientes").subscribe((res) => {
            this.listaBloqueos = [];
            res.forEach((p: any) => {
                this.listaBloqueos.push({
                    id: p.payload.doc.id,
                    descripcion: p.payload.doc.data().descripcion,
                    cve: p.payload.doc.data().cve,
                    motivo: p.payload.doc.data().motivo,
                    fechabloqueo: p.payload.doc.data().fechabloqueo,
                    fechadesbloqueo: p.payload.doc.data().fechadesbloqueo,
                    sucursal: p.payload.doc.data().sucursal,
                    tiposocio: p.payload.doc.data().tiposocio,
                    descTipoSocio: p.payload.doc.data().descTipoSocio,
                    estatus: p.payload.doc.data().estatus
                });
            });

            this.dataSourceClientesBloqueados = new MatTableDataSource(this.listaBloqueos);
            this.dataSourceClientesBloqueados.paginator = this.paginatorBloqueo;
            this.dataSourceClientesBloqueados.sort = this.sortBloqueo;


        });
    }


    /**
     * METODO QUE ELIMINA AVISOS
     * @param data - ELEMENTO A ELIMINAR
     * 
     *    
     */
    eliminaAviso(data: any) {

        this.firebase.elimina("avisos_socios", data.id).then(() => {
            this.service.showNotification('top', 'right', 2, 'El aviso se elimino correctamente');
        }, (error) => {
            this.service.showNotification('top', 'right', 4, 'Hubo un error al eliminar');
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

        this.firebase.actualiza("bloqueo_clientes", elemento.id, {
            descripcion: elemento.descripcion,
            cve: elemento.cve,
            motivo: elemento.motivo,
            fechabloqueo: elemento.fechabloqueo,
            fechadesbloqueo: new Date().toLocaleDateString(),
            sucursal: elemento.sucursal,
            tiposocio: elemento.tiposocio,
            descTipoSocio: elemento.descTipoSocio,
            estatus: elemento.estatus
        }).then(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El desbloqueo se aplico correctamente');
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
        this.dataSourceClientesBloqueados.filter = filterAviso.trim().toLowerCase();
        if (this.dataSourceClientesBloqueados.paginator) {
            this.dataSourceClientesBloqueados.paginator.firstPage();
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
                    this.abrirDialogoBloqueo(0, result.datosCl);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'No se ha seleccionado un cliente Físico o extranjero.');

                }
            });
        }

    }


}