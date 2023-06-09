import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionPrincipalComponent } from "./modal-principal/administracion-principal.component";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";

@Component({
    selector: 'principal',
    moduleId: module.id,
    templateUrl: 'principal.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de Grupo Principal
 */
export class PrincipalComponent implements OnInit {

    displayedColumns: string[] = ['cveGP', 'grupoP', 'division', 'estatus', 'acciones'];
    dataSourcePrincipal: MatTableDataSource<any>;
    listaPrincipal: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente 
    * @param service -- Instancia de acceso a datos
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }
    /**
    * Metodo OnInit de la clase
    */
    ngOnInit() {
        this.spsPrincipal();
    }

    /**
    * Metodo para filtrar grupo principal
    * @param event --evento a filtrar
    */
    buscarPrincipal(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourcePrincipal.filter = filterValue.trim().toLowerCase();

        if (this.dataSourcePrincipal.paginator) {
            this.dataSourcePrincipal.paginator.firstPage();
        }
    }

    /**
    * Metodo para obtener la lista de grupo
    * todos activos e inactivos
    */
    spsPrincipal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaGrupo').subscribe(data => {
            this.blockUI.stop();
            this.listaPrincipal = data;
            this.dataSourcePrincipal = new MatTableDataSource(this.listaPrincipal);
            this.dataSourcePrincipal.paginator = this.paginator;
            this.dataSourcePrincipal.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    abrirDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionPrincipalComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                grupo: data
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsPrincipal();//se refresque la tabla 
        });
    }
    /**
       * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
       * @param element --Lista con los datos de grupo principal
       */
    cambiaEstatus(element: any) {
        if (element.estatus === false) {
            this.abrirAdvertencia(element, 1);//activar 
        } else if (element.estatus === true) {
            this.abrirAdvertencia(element, 0);//desactivar
        }
    }
    /**
        * Abrir ventana modal de confirmacion
        * @param element datos grupo principal
        * @param accion 1:Activar, 0: Desactivar
        * */
    abrirAdvertencia(elemento: any, accion: number) {

        var encabezado = "";
        var body = "";
        if (accion === 1) {
            encabezado = "Activar grupo principal";
            body = 'El grupo contiene subgrupos,grupo unitario que se activaran.';
        } else {
            encabezado = "Desactivar  grupo principal";
            body = 'El grupo  contiene subgrupos,grupo unitario que se desactivaran.'
        }
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0 && accion === 1) {//aceptar y va a Activar
                this.reingresoPrincipal(elemento);
            } else if (result === 0 && accion === 0) {//aceptar y va a desactivar                
                this.bajaPrincipal(elemento);
            }
            else {//se refresca
                this.spsPrincipal();
            }
        });
    }
    /**
    * Metodo para dar de baja
    * @param elemento --Lista con los datos de Principal
    */
    bajaPrincipal(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "grupoId": elemento.grupoId,
            "cveGrupo": elemento.cveGrupo,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "division": elemento.division
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudGrupo').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();//se cierra el loader
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error 
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Metodo para dar de alta Grupo Principal
    * @param element --Lista con los datos de Grupo
    */
    reingresoPrincipal(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "grupoId": elemento.grupoId,
            "cveGrupo": elemento.cveGrupo,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "division": elemento.division
        };

        this.service.registrarBYID(data, 4, 'crudGrupo').subscribe(
            result => {

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            }
        );

    }
}