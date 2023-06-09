import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionSolicitudesOnboardingComponent } from './administracion-solicitudes/administracion-solicitudes-onboarding.component';
import { ExpedienteSolicitudesComponent } from './expediente-solicitudes/expediente-solicitudes.component';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { environment } from '../../../../environments/environment';

const cSolAceptada = environment.generales.cveSolicitudAceptada; // "88AC" Solicitud Aceptada
const cSolRechazada = environment.generales.cveSolicitudRechazada; // "88RE" Solicitud Rechazad

@Component({
  selector: 'solicitudes-onboarding',
  moduleId: module.id,
  templateUrl: 'solicitudes.component.html',
})
/**
 * @autor: José Alexis Martínez Bárcenas
 * @version: 1.0.0
 * @fecha: 18/05/2023
 * @descripcion: Componente que muestra las solicitudes de onboarding
 */
export class SolicitudesOnboardingComponent {
  //Declaracion de variables y compoenentes
  displayedColumns: string[] = ['solicitud_id', 'nombre_cliente', 'fecha_solicitud', 'estatus', 'expediente', 'observaciones_solicitud', 'acciones'];
  dataSourceSolicitudes: MatTableDataSource<any>;
  listSolicitudes: any;

  formObservaciones: UntypedFormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @BlockUI() blockUI: NgBlockUI;

  estatusSolicitudId: any;

  generales: any;

  /**
     * Constructor del componente SucursalesComponent
     * @param service - Service para el acceso a datos
     * @param dialog - Servicio para la gestion de Dialogos Tipo Modal
     */
  constructor(private service: GestionGenericaService, public dialog: MatDialog, private formbuilder: UntypedFormBuilder) {
    this.spsSucurales();

    this.formObservaciones = this.formbuilder.group({
      inputObservaciones: new UntypedFormControl('')
    });
  }

  /**
     * Metodo para cargar en tabla las sucursales
     */
  spsSucurales() {
    this.blockUI.start('Cargando datos...');

    this.service.getListByObjet({ "datos": { "cveEstatusSolicitud": environment.generales.cveSolicitudRevision }, "accion": 2 }, 'listaSolicitudesOnboarding').subscribe(data => {
      this.blockUI.stop();
      this.listSolicitudes = data.info;
      this.dataSourceSolicitudes = new MatTableDataSource(this.listSolicitudes);
      this.dataSourceSolicitudes.paginator = this.paginator;
      this.dataSourceSolicitudes.sort = this.sort;

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error.Message);
    }
    );
  }

  /**
     * Metodo para filtrar sucursales
     * @param event - evento a filtrar
     */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSolicitudes.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceSolicitudes.paginator) {
      this.dataSourceSolicitudes.paginator.firstPage();
    }
  }

  /**
     * Metodo que me abre un modal para la gestion de sucursales (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
  abrirDialogoSolicitud(data: any, accion: any) {
    let cvEstatusSolicitud;

    if (accion == 1) {
      cvEstatusSolicitud = cSolAceptada;
    } else if (accion == 2) {
      cvEstatusSolicitud = cSolRechazada;
    } else {
      console.log("Error en accion");
    }

    // Se abre el modal y setean valores
    const dialogRef = this.dialog.open(AdministracionSolicitudesOnboardingComponent,
      {
        data: {
          accion: accion,
          cvEstatusSolicitud: cvEstatusSolicitud,
          solicitud: data
        }
      });

    //Este se usa para que cuando cerramos
    dialogRef.afterClosed().subscribe(result => {
      this.spsSucurales();
    });
  }

  /**
     * Metodo que me abre un modal para la gestion de sucursales (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
  abrirDialogoExpediente(data: any) {
    // Se abre el modal y setean valores
    const dialogRef = this.dialog.open(ExpedienteSolicitudesComponent,
      {
        data: {
          expediente: data
        }
      });

    //Este se usa para que cuando cerramos
    dialogRef.afterClosed().subscribe(result => {
      this.spsSucurales();
    });
  }
}
