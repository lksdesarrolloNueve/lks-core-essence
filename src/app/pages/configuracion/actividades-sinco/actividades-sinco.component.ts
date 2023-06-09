import { Component, ViewChild } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { DivisionComponent } from "./division/division.component";
import { OcupacionComponent } from "./ocupacion/ocupacion.component";
import { PrincipalComponent } from "./principal/principal.component";
import { SubgrupoComponent } from "./subgrupo/subgrupo.component";
import { UnitarioComponent } from "./unitario/unitario.component";

@Component({
  selector: 'actividades-sinco',
  moduleId: module.id,
  templateUrl: 'actividades-sinco.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de actividades sinco
 */
export class ActividadesSincoComponent  {
  //declaracion de Variables y componentes
  /**
   * El decorador ViewChild nos permitirá hacer función con otros componentes y acceder a sus metodos.
   */
  @ViewChild(DivisionComponent) division: DivisionComponent;
  @ViewChild(PrincipalComponent) principal: PrincipalComponent;
  @ViewChild(SubgrupoComponent) subgrupo: SubgrupoComponent;
  @ViewChild(UnitarioComponent) unitario: UnitarioComponent;
  @ViewChild(OcupacionComponent) ocupacion: OcupacionComponent;

  /**
  * Constructor del componente 
  * @param service -- Instancia de acceso a datos
  * @param dialog -- Componente para crear diálogos modales en Angular Material 
  */
  constructor(private service: GestionGenericaService, private router: Router) {

  }

  /**
* Metodo para invocar la lista de actividades SINCO y que se actualice la lista
* al dar de baja o alta 
* 0 division, 1 principal,2,sub,3uniario,4 ocupaciones
* */
  tabSeleccionada(changeEvent: MatTabChangeEvent) {
    if (changeEvent.index == 0) {
      this.division.spsDivision();
    } else if (changeEvent.index == 1) {
      this.principal.spsPrincipal();
    } else if (changeEvent.index == 2) {
      this.subgrupo.spsSubgrupo();
    } else if (changeEvent.index == 3) {
      this.unitario.spsUnitario();
    } else {
      this.ocupacion.spsOcupaciones();
    }
  }

}