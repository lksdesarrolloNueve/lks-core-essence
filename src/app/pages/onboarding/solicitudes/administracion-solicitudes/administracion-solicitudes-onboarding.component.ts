import { Component, Inject } from "@angular/core";
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";

/**
* @autor: Juan Pablo Jimenez Jaime
* @version: 1.0.0
* @fecha: 26/05/2023
* @descripcion: modal para aceptar o rechazar una solicitud
*/
@Component({
  selector: 'administracion-solicitudes-onboarding',
  moduleId: module.id,
  templateUrl: 'administracion-solicitudes-onboarding.component.html',
})
export class AdministracionSolicitudesOnboardingComponent {

  solicitudId: number = 0;
  formSolicitud: UntypedFormGroup;
  @BlockUI() blockUI: NgBlockUI;
  accion: number;
  cvEstatusSolicitud: any;

  constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.formSolicitud = this.formbuilder.group({
      solicitudId: new UntypedFormControl(''),
      nombreCliente: new UntypedFormControl(''),
      observacionesSolicitud: new UntypedFormControl(''),
    });

    this.formSolicitud.get('solicitudId').setValue(data.solicitud.solicitud_id);
    this.formSolicitud.get('nombreCliente').setValue(data.solicitud.nombre_prospecto);
    this.formSolicitud.get('observacionesSolicitud').setValue(data.solicitud.observaciones_solicitud);

    this.solicitudId = data.solicitud.solicitud_id;
    this.cvEstatusSolicitud = data.cvEstatusSolicitud;
    this.accion = data.accion;
  }

  /**
   * Metodo para editar informacion de sucursales
   */
  revisarSolicitudes() {

    if (this.formSolicitud.invalid) {
      this.validateAllFormFields(this.formSolicitud);
      return;
    }


    this.blockUI.start('Editando...');

    //se setean los datos en el array
    const data = {
      "solicitudId": this.solicitudId,
      "observacionesSolicitud": this.formSolicitud.get('observacionesSolicitud').value,
      "cvEstatusSolicitud": this.cvEstatusSolicitud,
    };

    this.service.registrar({
      "datos": data,
      "accion": this.accion
    }, 'revisionSolicitudesOnboarding').subscribe(
      result => {

        this.blockUI.stop();
        if (result.codigo === '0') {
          this.service.showNotification('top', 'right', 2, result.mensaje);
        } else {
          this.service.showNotification('top', 'right', 2, result.mensaje);
        }

      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      }
    );

  }

  /**
   * Valida Cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
  validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
    Object.keys(formGroup.controls).forEach(field => {  //{2}
      const control = formGroup.get(field);             //{3}
      if (control instanceof UntypedFormControl) {             //{4}
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {        //{5}
        this.validateAllFormFields(control);            //{6}
      }
    });
  }

}
