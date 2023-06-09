import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { ClientesMorososComponent } from "./clientes-morosos/cliente-moroso.component";
import globales from "../../../../../environments/globales.config";

@Component({
  selector: 'citatorios',
  moduleId: module.id,
  templateUrl: 'extra-climo-citatorios.component.html'

})

/**
  * @autor: Fatima Bolaños Duran
  * @version: 1.0.0
  * @fecha: 20/06/2022
  * @descripcion: Componente para la gestion de extrajudicial
  */

export class ExtraclimoCitaroriosComponent {

  lblClientes: string = globales.entesMayuscula;

  // Metodo que manda llamar la clase de ClientesMorososComponent
  @ViewChild(ClientesMorososComponent) citatorios: ClientesMorososComponent;

  /**
  * Constructor del componente 
  * @param service -- Instancia de acceso a datos
  * @param dialog -- Componente para crear diálogos modales en Angular Material 
  */
  constructor(private service: GestionGenericaService,
    public dialog: MatDialog

  ) {

  }
}