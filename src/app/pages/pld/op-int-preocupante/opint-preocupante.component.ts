import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdminOpintPreocupanteComponent } from "./modal-op-int-preocupante/admin-opint-preocupante.component";
import { PermisosService } from "../../../shared/service/permisos.service";
import { globales } from "../../../../environments/globales.config";



@Component({
    selector: 'opint-preocupante',
    moduleId: module.id,
    templateUrl: 'opint-preocupante.component.html',
})
/**
 * @autor: Fatima Bolaños Duran
 * @version: 1.0.0
 * @fecha: 11/05/2022
 * @descripcion: Componente para la gestion de operaciones internas preocupantes en tiempo real.
 */

export class OpintPreocupante implements OnInit {

    // Declaraciones de variables glovales y componentes
    listaOpintPreocupante = [];
    ColumnsOpintPreocupantes: string[] = ['cliente', 'sucursal', 'usuario', 'descripcion', 'denunciate', 'fecha', 'acciones'];
    dataSourceOpintPreocupante: MatTableDataSource<any>;
    @ViewChild('PaginatorOpintPreocupante') paginatorOpintPreocupante: MatPaginator;
    @ViewChild('SortOpintPreocupante') sortOpintPreocupante: MatSort;
    @BlockUI() blocKUI: NgBlockUI;

    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    /**
     * Constructor del componente 
     * @param service - service para el acceso de datos
     * @param dialog - servicio para la gestion de dialogos tipo modal
     */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog,
        private session: PermisosService) {
    }

    /**
     * Metodo onInit de la clase Operaciones preocupantes 
     */
    ngOnInit() {
        this.sps_op_int_preocupantes();
    }

    /**
     * Metodo  que lista  las operaciones preocupantes
     */
    sps_op_int_preocupantes() {
        this.blocKUI.start('Cargando datos');
        this.service.getListByID(this.session.sucursalSeleccionada.cveSucursal, 'spsOpintPreocupante').subscribe(
            data => {
                this.listaOpintPreocupante = data;
                this.dataSourceOpintPreocupante = new MatTableDataSource(this.listaOpintPreocupante);
                this.dataSourceOpintPreocupante.paginator = this.paginatorOpintPreocupante;
                this.dataSourceOpintPreocupante.sort = this.sortOpintPreocupante;
                this.blocKUI.stop();
            }
        );
    }

    /**
     * metodo para filtrar en el listado obtenido de base de datos
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterAviso = (event.target as HTMLInputElement).value;
        this.dataSourceOpintPreocupante.filter = filterAviso.trim().toLowerCase();
        if (this.dataSourceOpintPreocupante.paginator) {
            this.dataSourceOpintPreocupante.paginator.firstPage();
        }

    }

    /**
    * Metodo que abre una ventana modal
    * para la Administracion para las operaciones preocupantes 
     * @param accion --1 Registrar , 2 . Editar
     * @param elemento - elemento a editar
     */
    abrirDialogoOpintPreocupantes(accion: any, elemento: any) {
        let titulo = '';
        //Si la accion es igual a 0 el titulo se llamara Registrar si no Editar
        if (accion === 1) {

            titulo = "registrar";
        } else {
            titulo = 'Editar';
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminOpintPreocupanteComponent, {
            width: '50%',

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento

            },
        });
        dialogRef.afterClosed().subscribe(result => {
            this.sps_op_int_preocupantes();
        });
    }

    /*
    * Metodo tipo CRUD para guardar y editar los datos de operaciones preocupantes
    **/
    crearOpintPreocupante(elemento) {
        this.blocKUI.start('Editando....');
        let data = {
            "datos": [
                elemento.op_intpreocupante_id
            ],
            "accion": 1

        };

        this.service.registrar(data, 'crudOpIntPreocupante').subscribe(
            result => {
                this.blocKUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                    this.sps_op_int_preocupantes();

                } error => {
                    this.blocKUI.stop();
                    this.service.showNotification('top', 'right', 4, error.message)
                }
            }
        );
    }
}

