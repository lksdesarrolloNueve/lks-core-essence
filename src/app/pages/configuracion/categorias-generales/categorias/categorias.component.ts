import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AdministracionCategoriasComponent } from './modal-categorias/administracion-categorias.component';
import { verificacionModalComponent } from '../../../../pages/modales/verificacion-modal/verificacion-modal.component';

@Component({
    selector: 'categorias',
    templateUrl: 'categorias.component.html'
})
export class CategoriaComponent{
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    displayedColumns: string[] = ['categoria','cveC', 'descripcion', 'fecha', 'estatus', 'acciones'];
    dataSourceCategorias: MatTableDataSource<any>;
    listaCategorias: any;
    accion: number;
    titulo: string;

    /**
    * Constructor del componente garantias
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    * @param service -- Instancia de acceso a datos
    */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsCategorias();

    }

    /**
         * Metodo para obtener la lista de garantias
         */
    spsCategorias() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaCategorias').subscribe(data => {
            this.blockUI.stop();
            this.listaCategorias = data;
            this.dataSourceCategorias = new MatTableDataSource(this.listaCategorias);
            this.dataSourceCategorias.paginator = this.paginator;
            this.dataSourceCategorias.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
          * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
          * @param element --Lista con los datos de categoria
          */
    cambiaEstatus(element: any) {
        if (element.estatus === false) {
            this.abrirAdvertencia(element, 1);//activar
        } else if (element.estatus === true) {
            this.abrirAdvertencia(element, 0);//desactivar
        }
    }
    /**
   * Metodo para filtrar 
   * @param event --evento a filtrar
   */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCategorias.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCategorias.paginator) {
            this.dataSourceCategorias.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    openDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionCategoriasComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                categoria: data
            }

        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsCategorias();//se refresque la tabla y se vea la nueva catgeria
        });

    }

    /**
         * Metodo para dar de baja
         * @param elemento --Lista con los datos de Grantia
         */
    bajaCategoria(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {

            "categoriaId": elemento.categoriaId,
            "fecha": elemento.fecha,
            "cveCategoria":elemento.cveCategoria,
            "descripcion": elemento.descripcion,
            "estatus": false

        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudCategoria').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();//se cierra el loader
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error             
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Metodo para dar de alta Garantia
    * @param element --Lista con los datos de Garantia
    */
    reingresoCategoria(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "categoriaId": elemento.categoriaId,
            "fecha": elemento.fecha,
            "cveCategoria":elemento.cveCategoria,
            "descripcion": elemento.descripcion,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudCategoria').subscribe(
            result => {

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            }
        );

    }
        /**
     * Abrir ventana modal de confirmacion
     * @param element datos categoria
     * @param accion 1:Activar, 0: Desactivar
     * */
         abrirAdvertencia(elemento: any, accion: number) {
            var  encabezado ="";
            var body="";
            if(accion===1){
                encabezado = "Activar categoria";
                body = 'La categoria '+elemento.descripcion+' contiene subcategorias que se activaran.';
            }else{
                encabezado = "Desactivar categoria";
                body = 'La categoria '+elemento.descripcion+' contiene subcategorias que se desactivaran.' 
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
                    this.reingresoCategoria(elemento);
                } else if (result === 0 && accion === 0) {//aceptar y va a desactivar                
                    this.bajaCategoria(elemento);
                }
                else {//se refresca
                    this.spsCategorias();
                }
            });
        }
}
