import { Component, ViewChild } from "@angular/core";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { Router } from "@angular/router";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { GeneralesComponent } from "./generales/generales.component";


@Component({
  selector: 'categoria-general',
  moduleId: module.id,
  templateUrl: 'categoria-general.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 06/10/2021
 * @descripcion: Componente para la gestion de categorias Generales
 */
export class CategoriaGeneralesComponent {
  //@ViewChild(selector) nombreDePropiedad: TipoDePropiedad
  @ViewChild(GeneralesComponent) generales: GeneralesComponent;
  /**
  * Constructor del componente 
  * @param service -- Instancia de acceso a datos
  * @param dialog -- Componente para crear diálogos modales en Angular Material 
  */
  constructor(private service: GestionGenericaService, private router: Router) {

  }

  /**
   * Metodo para invocar la lista de generales y que se actualice la lista
   * al dar de baja o alta la categoria
   * 0 categoria, 1 generales
   * */
  tabSeleccionada(changeEvent: MatTabChangeEvent) {
    if (changeEvent.index == 1) {
      this.generales.spsGenerales();
    }
  }

}