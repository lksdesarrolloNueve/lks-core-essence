import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { SectoresComponent } from "./sectores/sectores.component";
import { SubSectoresComponent } from "./sub-sectores/sub-sectores.component";
import { RamasComponent } from "./ramas/ramas.component";
import { SubRamasComponent } from "./sub-ramas/sub-ramas.component";
import { ClaseActividadesComponent } from "./clase-actividades/clase-actividades.component";
import { MatTabChangeEvent } from "@angular/material/tabs";

@Component({
    selector: 'actividades-scian',
    moduleId: module.id,
    templateUrl: 'actividades-scian.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 29/09/2021
 * @descripcion: Componente para la gestion de actividades SCIAN
 */
export class ActividadesSCIANComponent  {

    @ViewChild(SectoresComponent) sectores: SectoresComponent;
    @ViewChild(SubSectoresComponent) subSectores: SubSectoresComponent;
    @ViewChild(RamasComponent) ramas: RamasComponent;
    @ViewChild(SubRamasComponent) subRamas: SubRamasComponent;
    @ViewChild(ClaseActividadesComponent) claseActividades: ClaseActividadesComponent;


    /**
     * Constructor del componente ActividadesSCIAN Component
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
  * Metodo para invocar la lista de actividades SCIAN y que se actualice la lista
  * al dar de baja o alta 
  * 0 division, 1 principal,2,sub,3uniario,4 ocupaciones
  * */
    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        if (changeEvent.index == 0) {
            this.sectores.spsSectores();
        } else if (changeEvent.index == 1) {
            this.subSectores.spsSubSectores();
        } else if (changeEvent.index == 2) {
            this.ramas.spsRamas();
        } else if (changeEvent.index == 3) {
            this.subRamas.spsSubRamas();
        } else {
            this.claseActividades.spsClaseActividades();
        }
    }

}