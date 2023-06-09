import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import globales from "../../../../environments/globales.config";


@Component({
    selector: 'tres-sesenta-fisicos',
    moduleId: module.id,
    templateUrl: 'tres-sesenta-fisicos.component.html',
    styleUrls: ['tres-sesenta-fisicos.component.css']
})


/**
 * 
 * 
 * 
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 14 Ene. 2022
 * @descripcion: Componente para manejo expediente 360 personas físicas.
 */
export class TresSesentaFisicosComponent implements OnInit {


    lblClientes: string = globales.entes; comentarios
    lblCliente: string = globales.ente;
    /**
     * Constructor de la clase GruposComponent
     * @param service  service para el acceso a datos
     */
     constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Método init.
     */
    ngOnInit(): void {

    }

 


}