import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import globales from "../../../../environments/globales.config";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { AdminBloqueoClienteComponent } from "./admin-bloqueo-cliente.component";


@Component({
    selector: 'bloqueo-cliente',
    moduleId: module.id,
    templateUrl: 'bloqueo-cliente.component.html',
})
/**
 * @autor: Fatima Bolaños Duran
 * @version: 1.0.0
 * @fecha: 18/04/2022
 * @descripcion: Componente para la gestion de bloqueo de clientes en tiempo real.
 */
export class BloqueoClienteComponent implements OnInit {

    //Declaracion de variables y componentes
    listaSocios: any = [];


    // Variables Avisos
    listaBloqueoClientes = [];
    ColumnsBloqueoClientes: string[] = ['noCliente', 'cliente', 'sucursal', 'fechas', 'motivo', 'comentarios', 'estatus', 'acciones'];
    dataSourceBloqueoCliente: MatTableDataSource<any>;
    @ViewChild('PaginatorBloqueoCliente') paginatorBloqueoCliente: MatPaginator;
    @ViewChild('SortBloqueoCliente') sortBloqueoCliente: MatSort;


    lblClientes: string = globales.entes; comentarios
    lblCliente: string = globales.ente;

    panelOpenState = false;
    @BlockUI() blockUI: NgBlockUI;
    condicion = new UntypedFormControl('');

    /**
     * Constructor de la clase SujetosComponent
     * @param service -Service para el acceso a datos 
     * @param dialog -Servicio para la gestion de 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }



    /**
     * Metodo onInit de la clase bloqueoCliente
     * */
    ngOnInit() {
        this.spsBloqueoClientes();
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
                data: {
                    titulo: titulo,
                    accion: accion,
                    cliente: data
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                if (result !== 1 && result !== undefined) {//NO esta vacio Aceptar llenar datos
               
                    this.abrirDialogoBloqueo(1, result.datosCl);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'No se ha seleccionado un cliente Físico o extranjero.');

                }
            });
        }

    }


    /**
     * Metodo que lista los clientes bloqueados 
     */

    spsBloqueoClientes() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsBloqueoClientes').subscribe(
            data => {
                this.listaBloqueoClientes = data;
                this.dataSourceBloqueoCliente = new MatTableDataSource(this.listaBloqueoClientes);
                this.dataSourceBloqueoCliente.paginator = this.paginatorBloqueoCliente;
                this.dataSourceBloqueoCliente.sort = this.sortBloqueoCliente;
                this.blockUI.stop();
            }
        );
    }


    /**
    * metodo para filtrar en el listado obtenido de base de datos
    * @param event - evento a filtrar
    */
    applyFilter(event: Event) {
        const filterAviso = (event.target as HTMLInputElement).value;
        this.dataSourceBloqueoCliente.filter = filterAviso.trim().toLowerCase();
        if (this.dataSourceBloqueoCliente.paginator) {
            this.dataSourceBloqueoCliente.paginator.firstPage();
        }

    }





    /**
   * Metodo que abre el modal para la administracion de avisos
   * @param data - Objeto o condicion
   */
    abrirDialogoBloqueo(accion, data) {
        let titulo = '';


        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (accion === 1) {
            titulo = "registrar";
        } else {
            titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminBloqueoClienteComponent, {
            data: {
                accion: accion,
                titulo: titulo,
                socio: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            //spss
            this.spsBloqueoClientes();
        });

    }


    /**
 * 
 * Metodo tipo CRUD para guardar y editar los bloqueos de clientes
 */
    crearBloqueos(bloqueo) {

        this.blockUI.start('Editando...');

        let data = {
            "datos": [bloqueo.bitBloqueoClienteId, false],
            "accion": 3
        };

        this.service.registrar(data, 'crudBloqueoCliente').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                    this.spsBloqueoClientes();
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)

            }
        );
    }



}


