import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionSubgrupoComponent } from "./modal-subgrupo/administracion-subgrupo.component";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";

@Component({
    selector: 'subgrupo',
    moduleId: module.id,
    templateUrl: 'subgrupo.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de Subgrupos SINCO
 */
export class SubgrupoComponent  {

    displayedColumns: string[] = ['cveSub', 'descripcion', 'principal', 'estatus', 'acciones'];
    dataSourceSub: MatTableDataSource<any>;
    listaSub: any;

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
        this.spsSubgrupo();
    }

    /**
    * Metodo para filtrar ciudades
    * @param event --evento a filtrar
    */
    buscarSubgrupo(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSub.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceSub.paginator) {
            this.dataSourceSub.paginator.firstPage();
        }
    }

    /**
    * Metodo para obtener la lista de subgrupo
    * por grupo principal 
    */
    spsSubgrupo() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaSubgrupo').subscribe(data => {
            this.blockUI.stop();
            this.listaSub = data;
            this.dataSourceSub = new MatTableDataSource(this.listaSub);
            this.dataSourceSub.paginator = this.paginator;
            this.dataSourceSub.sort = this.sort;
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
        const dialogRef = this.dialog.open(AdministracionSubgrupoComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                subgrupo: data
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsSubgrupo();//se refresque la tabla 
        });
    }
    /**
       * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
       * @param element --Lista con los datos de subgrupo
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
     * @param element datos subgrupo
     * @param accion 1:Activar, 0: Desactivar
     * */
  abrirAdvertencia(elemento: any, accion: number) {
   var  encabezado ="";
   var body="";
   if(accion===1){
       encabezado = "Activar subgrupo";
       body = 'El subgrupo '+elemento.descripcion+' contiene grupo unitario que se activara.';
   }else{
       encabezado = "Desactivar subgrupo ";
       body = 'El subgrupo '+elemento.descripcion+' contiene grupo unitario que se desactivara.' 
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
           this.reingresoSubgrupo(elemento);
       } else if (result === 0 && accion === 0) {//aceptar y va a desactivar   
           this.bajaSubgrupo(elemento);
       }
       else {//se refresca
           this.spsSubgrupo();
       }
   });
}
    /**
    * Metodo para dar de baja
    * @param elemento --Lista con los datos de Subgrupo
    */
    bajaSubgrupo(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "subgrupoId": elemento.subgrupoId,
            "cveSubgrupo": elemento.cveSubgrupo,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "principal": elemento.principal
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudSubgrupo').subscribe(resultado => {
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
    * Metodo para dar de alta SubGrupo 
    * @param element --Lista con los datos de SubGrupo
    */
    reingresoSubgrupo(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "subgrupoId": elemento.subgrupoId,
            "cveSubgrupo": elemento.cveSubgrupo,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "principal": elemento.principal
        };

        this.service.registrarBYID(data, 4, 'crudSubgrupo').subscribe(
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
}