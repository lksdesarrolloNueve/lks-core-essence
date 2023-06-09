import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatSort } from "@angular/material/sort";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { MatDialog } from "@angular/material/dialog";
import { AdministracionActividadesVul } from "./modal-actividades-vulnerables/administracion-act-vul.componet";


@Component({
    selector: 'actividades-vulnerables',
    moduleId: module.id,
    templateUrl: 'actividades-vul.component.html',

})


/**
 * @autor: Guillermo Juárez Jaramillo 
 * @version: 1.0.0
 * @fecha: 24/09/2021
 * @descripcion: Componente para la gestion de actividades vulnerables
 */

export class ActividadesVulnerablesComponent implements OnInit {

    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['concepto', 'detalle', 'estatus', 'acciones'];
    dataSourceActividadesV: MatTableDataSource<any>;
    listaActividadesV: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

     /**
     * Constructor del componente ActividadesvulnerablesComponent
     * @param service - Service para el acceso a datos
     */
      constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    
    }

    /**
      * Metodo onInit de la clase
      */
    ngOnInit() {
        this.spsActividadesVul();

    }

      /**
     * Metodo para cargar en tabla las actividades vulnerables
     */
       spsActividadesVul() {

        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1,'listaActividadesV').subscribe(data => {
            this.blockUI.stop();
        
            this.listaActividadesV = data;
            this.dataSourceActividadesV = new MatTableDataSource(this.listaActividadesV);
            this.dataSourceActividadesV.paginator = this.paginator;
            this.dataSourceActividadesV.sort = this.sort;
            
            
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

      /**
     * Metodo para filtrar actividades vulnerables
     * @param event - evento a filtrar
     */
       applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceActividadesV.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceActividadesV.paginator) {
            this.dataSourceActividadesV.paginator.firstPage();
        }
    }

      /**
     * Metodo que me abre un modal para la gestion de actividades vulnerables(REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
       abrirDialogoActividadesvul(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }
          // Se abre el modal y setean valores
          const dialogRef = this.dialog.open(AdministracionActividadesVul, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                actividad: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsActividadesVul();
        });

        }
          /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any){
        if(element.estatus){
            this.blockUI.start('Procesando baja...');
            this.bajaActividadV(element);
        }else{
            this.blockUI.start('Procesando reingreso...');
            this.reingresoActividadV(element);
        }

    }

     /**
     * Metodo para dar de baja una actividad vulnerable
     */
      bajaActividadV(elemento: any) {

        const data = {
            "actVId":   elemento.actVId,
            "concepto":        elemento.concepto,
            "detalle":  elemento.detalle,
            "estatus":       elemento.estatus
        };

        this.service.registrarBYID(data, 3, 'crudActividadesVul').subscribe(
            result => {

                elemento.estatus = false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.spsActividadesVul();
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );}

             /**
     * Metodo para reingresar
     */
     reingresoActividadV(elemento: any) {

        const data = {
            "actVId":   elemento.actVId,
            "concepto":        elemento.concepto,
            "detalle":  elemento.detalle,
            "estatus":       elemento.estatus
        };

        this.service.registrarBYID(data, 4, 'crudActividadesVul').subscribe(
            result => {
                elemento.estatus = true;
                this.blockUI.stop();    

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, errorReingreso => {

                this.spsActividadesVul();
                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );

    }

}