import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdministracionTipoSociosComponent } from "./modal-tipo-socios/administracion-tipos-socios.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { globales } from '../../../../environments/globales.config';




@Component({
    selector: 'tipos-socios',
    moduleId: module.id,
    templateUrl: 'tipos-socios.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 08/09/2021
 * @descripcion: Componente para la gestion de tipo socios
 */

export class TipoSociosComponent implements OnInit {

       //Declaracion de variables y compoenentes
       listaTipoSocio : any[];
       displayedColumns: string[] = [ 'cveSocio', 'descripcion','estatus', 'acciones'];
       dataSourceTiposSocios: MatTableDataSource<any>;
       accion : number;
       titulo:  String;
   
       @ViewChild(MatPaginator) paginator: MatPaginator;
       @ViewChild(MatSort) sort: MatSort;
       @BlockUI() blockUI: NgBlockUI;


       lblClientes: string =globales.entes;
       lblCliente: string= globales.ente;

       /**
        * Constructor de variables y componentes
        * @param servcice -Service para el acceso de datos
        */
    constructor(private service: GestionGenericaService,public dialog: MatDialog
        ) {
      
       

    }

    /**
     * Metodo OnInit de la clase
     */

    ngOnInit(){
        this.spsTipoSocios();
    }

    /**
     * Metodo para cargar en tabla de tipo socios
     */
    spsTipoSocios(){
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaTipoSocio').subscribe(data   => {
            this.blockUI.stop();
           this.listaTipoSocio = data;
           this.dataSourceTiposSocios = new MatTableDataSource(this.listaTipoSocio);
            this.dataSourceTiposSocios.paginator = this.paginator;
            this.dataSourceTiposSocios.sort = this.sort;

        },error =>{
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.Message);
        }
        );
    }

    /**
     * Metodo para filtrar Tipos Socios
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceTiposSocios.filter = filterValue.trim().toLowerCase();
    
        if (this.dataSourceTiposSocios.paginator) {
          this.dataSourceTiposSocios.paginator.firstPage();
        }
      }

       /**
     * Metodo que me abre un modal para la gestion de tipos socios(Registar, Editar)
     * @param data - Objecto o valor a condicionar
     */
      abrirDialogoTipoSocios(data) {
           //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
 
        if(data === 0){
            this.titulo = 'Registrar';
            this.accion= 1;
        }else{
            this.titulo= 'Editar';
            this.accion=2;
           
        }


         // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionTipoSociosComponent,{
      
            data: {

                accion: this.accion,
                titulo: this.titulo,
                tiposocio:data
            }
        }
        );
    
        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
          this.spsTipoSocios();
        });
      }


       /**
     * Metodo para dar de baja un tipo de socio
     */
      bajaTipoSocio(elemento: any){
        this.blockUI.start('Procesando Baja...');
        const data = {
            "tipoSocioid": elemento.tipoSocioid,
            "cveSocio" : elemento.cveSocio,
            "descripcion": elemento.descripcion,
            "estatus": false
    
        };


        this.service.registrarBYID(data,3,'crudtipossocios').subscribe (
            result =>{ 
                elemento.estatus= false;
                this.blockUI.stop();
                 //Se condiciona resultado
                if(result[0][0]=== '0'){
                    this.service.showNotification('top', 'right',2,result[0][1])
                }else{
                    this.service.showNotification('top', 'right',3,result[0][1])
                }

    
            },error =>{
                this.spsTipoSocios();
                this.blockUI.stop();
                this.service.showNotification('top', 'right',4,error.error+'<br>'+error.trace)
            }
        );
      }


      /**
     * Metodo para dar un reingreso a un tipo de socio
     */
      reingresoTipoSocio(elemento: any){
        this.blockUI.start('Reingresando...');
        const data = {
            "tipoSocioid": elemento.tipoSocioid,
            "cveSocio" : elemento.cveSocio,
            "descripcion": elemento.descripcion,
            "estatus": false
    
        };


        this.service.registrarBYID(data,4,'crudtipossocios').subscribe (
            result =>{

                elemento.estatus= true;
                this.blockUI.stop();
                if(result[0][0]=== '0'){
                    this.service.showNotification('top', 'right',2,result[0][1])
                }else{
                    
                    this.service.showNotification('top', 'right',3,result[0][1])
                }
    
            },errorReingreso =>{
                this.spsTipoSocios();
                this.blockUI.stop();
                this.service.showNotification('top', 'right',4,errorReingreso.error+'<br>' + errorReingreso.trace)
            }
        );
      }

      /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any){
        if(element.estatus){
            this.bajaTipoSocio(element);
        }else{
            this.reingresoTipoSocio(element);
        }

    }



    }
    
   
 

