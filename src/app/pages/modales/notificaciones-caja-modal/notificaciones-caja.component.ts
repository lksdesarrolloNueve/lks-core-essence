import { Component, Inject, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PermisosService } from "../../../shared/service/permisos.service";
import { FiresbaseService } from "../../../shared/service/service-firebase/firebase.service";

@Component({
    selector: 'notificaciones-caja', 
    moduleId: module.id,
    templateUrl: 'notificaciones-caja.component.html'
})

/**
 * @autor María Guadalupe Santana Olalde 
 * @descripcion Modal para mostrar las notificaciones de caja 
 * 1.Notificaciones globales 2.Notificaciones por cliente 3.Notificaciones por sucursal
 * @fecha 30/08/2022
 * @version 1.0.0
 */
export class NotificacionesCajaModalComponent implements OnInit{

    //Clave del cliente seleccionado
    cveCliente: string;

    constructor( private firebase: FiresbaseService, 
        private session: PermisosService, 
        private firestore: AngularFirestore, 
        @Inject(MAT_DIALOG_DATA)
        public data: any) {

        this.selectedCveSucursal = this.session.sucursalSeleccionada.cveSucursal;
        this.cveCliente = data.cveCliente;
    }
    ngOnInit(): void {
        this.spsAvisos();
        this.spsNotificacionesPorSucursal();
    }
   
    //ID de la sucursalen sesion
    selectedCveSucursal: number = 0;

    //Lista Avisos
    listaAvisosGlobales: any [];
    lista: any [];

    //Lista Notificaciones por sucursales
    listaNotSuc: any [];

    /**
     * Método para consultar los avisos de Notificaciones por cliente
     */
     spsAvisos() {
        this.listaAvisosGlobales = [];
        this.firestore.collection("avisos_socios", ref => ref.where('cve', '==', this.cveCliente).where('estatus', '==', true)
        ).snapshotChanges().subscribe((res) => {

            if(res.length > 0) {
                res.forEach((p: any) => {
                    this.listaAvisosGlobales.push({
                        aviso: p.payload.doc.data().cve + " " + "|" + " " + p.payload.doc.data().aviso + " " + "|" + " " + p.payload.doc.data().sucursal
                    });

                })
            }
        });
    }

    /**
     * Método para consultar los avisos globales por sucursal
     */
    spsNotificacionesPorSucursal(){
        this.listaNotSuc = [];
        this.firestore.collection("avisos_globales_socios", ref => ref.where('cveSucursal', '==', this.selectedCveSucursal).where('estatus', '==', true)
        ).snapshotChanges().subscribe((res) =>  {

            if(res.length > 0) {
                res.forEach((p: any) => {
                   
                    this.listaNotSuc.push({
                        aviso: p.payload.doc.data().aviso + " " + "|" + " " + p.payload.doc.data().sucursal
                    });
                    
                });
            }
        });
    }
}
