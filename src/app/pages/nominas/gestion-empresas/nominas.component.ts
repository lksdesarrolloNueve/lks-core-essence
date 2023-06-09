import { Component, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { EmpleadosComponent } from './empleados/empleados.component';
import { PlantillaComponent } from './plantilla/plantilla.component';

@Component({
    selector: 'nominas',
    moduleId: module.id,
    templateUrl: 'nominas.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 18/10/2022
 * @descripcion: Componente para la administracion de dispersion de nomina
 */
export class NominaComponent {
    menu: string = '';
    @ViewChild(PlantillaComponent) plantilla: PlantillaComponent;
    @ViewChild(EmpleadosComponent) empleado: EmpleadosComponent;
    /**
     * Metodo para invocar la lista de empresas y que se actualice la lista
     * al cambiar de tab
     * 0 Servicio, 1 Empresas/plantilla ,2 Empleados
     * */
    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        if (changeEvent.index == 1) {
            this.plantilla.spsEmpresasNomina();
        } else if (changeEvent.index == 2) {
            this.empleado.spsEmpresasNomina();
            this.empleado.limpiar();
        }

    }
}