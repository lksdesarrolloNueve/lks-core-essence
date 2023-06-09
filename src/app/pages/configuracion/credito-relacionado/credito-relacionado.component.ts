import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionCredRelComponent} from "./modal-credito-relacionado/administracion-credrel.component";




@Component({
    selector: 'credito-relacionado',
    moduleId: module.id,
    templateUrl: 'credito-relacionado.component.html'

})

/**
 * @autor:Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 10/11/2021
 * @descripcion: Componente para la gestion de parametros_creditos_relacionados
 */

export class CreditoRelacionadoComponent implements OnInit {


    //Declaracion de variables y compoenentes
    listaParametroCred: any[];
    displayedColumns: string[] = ['claveParametro','valor','descripcion','estatus', 'acciones'];
    dataSourceCredRel: MatTableDataSource<any>;
    accion: number;
    titulo: String;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;


    /**
       * Constructor de variables y componentes
       * @param servcice -Service para el acceso de datos
       */
    constructor(private service: GestionGenericaService, public dialog: MatDialog
    ) {


    }

    /**
   * Metodo OnInit de la clase
   */

    ngOnInit() {
        this.spsParametrosCred();
    }


    /**
     * Metodo para cargar la tabla de parametros_creditos_relacionados
     */
    spsParametrosCred() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaCreditoRelacionado').subscribe(data => {
            this.blockUI.stop();
            this.listaParametroCred = data;
            this.dataSourceCredRel = new MatTableDataSource(this.listaParametroCred);
            this.dataSourceCredRel.paginator = this.paginator;
            this.dataSourceCredRel.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para filtrar la tabla
     * @param event - Dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCredRel.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCredRel.paginator) {
            this.dataSourceCredRel.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data 
     */
     abrirDialogoParametro(data) {
        /** si la accion es igual*/

        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.titulo = 'Editar';
            this.accion = 2;
        }

        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionCredRelComponent, {
            width: '40%',
            data: {

                accion: this.accion,
                titulo: this.titulo,
                parametroCred: data
            }
        }
        );

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsParametrosCred();
        });

    }
/**
 * Metodo para dar de baja
 * @param elemento --Lista con los datos de parametros_creditos_relacionados
 */
    bajaParametro(elemento: any) {
          //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "parametroId": elemento.parametroId,
            "claveParametro": elemento.claveParametro,
            "valor": elemento.valor,
            "descripcion": elemento.descripcion,
            "estatus": false
        };

         //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'CrudCreditoRelacionado').subscribe(
            result => {

                elemento.estatus= false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spsParametrosCred();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );
    }

    /**
     * SE agrega metodo para dar reingreso a un banco 
     * @param elemento 
     */
    reingresoParametro(elemento: any) {
        this.blockUI.start('Procesando Reingreso...');
        const data = {
            "parametroId": elemento.parametroId,
            "claveParametro": elemento.claveParametro,
            "valor": elemento.valor,
            "descripcion": elemento.descripcion,
            "estatus": true
        };


        this.service.registrarBYID(data, 4, 'CrudCreditoRelacionado').subscribe(
            result => {
                elemento.estatus= true;
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {

                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.spsParametrosCred();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorReingreso.error + '<br>' + errorReingreso.trace)
            }
        );
    }

    /**
  * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
  */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaParametro(element);
        } else {
            this.reingresoParametro(element);
        }

    }


}