import { Component, OnInit } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdminCajasSucursalComponent } from "./modal-cajas-sucursal/admin-cajas-sucursal.component";
import { MatDialog } from "@angular/material/dialog";
import { NavigationExtras, Router } from '@angular/router'
import { PermisosService } from "../../../shared/service/permisos.service";

@Component({
    selector: 'cajas-sucursal',
    moduleId: module.id,
    templateUrl: 'cajas-sucursal.component.html',
    styleUrls: ['./cajas-sucursal.component.css']
})

/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 26/04/2022
 * @descripcion: Componente para la gestion de cajas por medio de Postgres
 */
export class CajasSucursalComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
 
    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;
    nombreUsuario = this.servicePermisos.usuario.username;
    cveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

   sesionActiva = false;
   datosSesion : any;

   listaCajas = [];


    /**
     * Constructor de la clase MovimientosCajaComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService,
        private servicePermisos: PermisosService,
        public dialog: MatDialog,
        private router: Router) {

    }


    /**
     * metodo OnInit de la clase MovimientosCaja para iniciar las listas
     */
    ngOnInit() {
 
        //this.spsCajasSesionPg();

        this.listaCajasDisponibles();
    }


    /**
     * Metodo que retorna la sesion del usuario o cajas disponibles
     */
    listaCajasDisponibles(){
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(this.vUsuarioId+'/'+this.cveSucursal,'listaCajasDisponibles').subscribe( resCajas => {
            this.blockUI.stop();

            if(resCajas){
                this.sesionActiva = resCajas.estatus;

                if(this.sesionActiva === true){
                    this.datosSesion = resCajas.sesion;
                }else{
                    if(resCajas.cajas){
                        this.listaCajas = resCajas.cajas;
                        this.listaCajas.sort((a, b) => (a.cve_caja > b.cve_caja) ? 1 : -1);
                    }
                }
            }
  
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }

  
    irCaja(){

        if(this.datosSesion){
            const navigationExtras: NavigationExtras = {
                state: {
                    cajas: this.datosSesion,
                }
            };
    
            this.router.navigate(['/caja-movimientos'], navigationExtras);
        }
 
        

    }

    iniciarSession(caja : any){
        this.dialog.open(AdminCajasSucursalComponent, {
            data: {
                cajas: caja
            }
        });
    }



}
