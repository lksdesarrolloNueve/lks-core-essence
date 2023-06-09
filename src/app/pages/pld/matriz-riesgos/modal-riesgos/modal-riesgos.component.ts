import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Router } from "@angular/router";

@Component({
    selector: 'modal-riesgos',
    moduleId: module.id,
    templateUrl: 'modal-riesgos.component.html',
    styleUrls: ['modal-riesgos.component.css']
})
/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 11/05/2022
 * @descripcion: Modal para la insercion y edicion de elementos en la matriz de riesgos
 */
export class ModalRiesgosComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    formRiesgos: UntypedFormGroup;

    validaciones = {
        'validacionGenerica': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }

    constructor(
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private dialogRef: MatDialogRef<ModalRiesgosComponent>,
        private router: Router,
    ) {
        this.formRiesgos = this.formBuilder.group({
            numero: new UntypedFormControl('', [Validators.required]),
            elementoRiesgo: new UntypedFormControl('', [Validators.required]),
            indicadoresRiesgo: new UntypedFormControl('', [Validators.required]),
            definicionTeorica: new UntypedFormControl('', [Validators.required]),
            definicionOperativa: new UntypedFormControl('', [Validators.required]),
            criterioRiesgoAlto: new UntypedFormControl('', [Validators.required]),
            puntajeRiesgoAlto: new UntypedFormControl('', [Validators.required]),
            criterioRiesgoBajo: new UntypedFormControl('', [Validators.required]),
            puntajeRiesgoBajo: new UntypedFormControl('', [Validators.required]),
            ponderacionAlta: new UntypedFormControl('', [Validators.required]),
            ponderacionBaja: new UntypedFormControl('', [Validators.required]),
        });

        if(this.data.accion == 2) this.formRiesgos.controls['numero'].disable();
    }

    ngOnInit() {
        if (this.data.accion == 2) {
            this.asignarValores();
        }
    }

    /**
     * Se asignan los valores correspondientes a cada input si se hara una actualizacion.
     */
    asignarValores() {
        this.formRiesgos.get('numero').setValue(this.data.riesgo.numero);
        this.formRiesgos.get('elementoRiesgo').setValue(this.data.riesgo.elementoRiesgo);
        this.formRiesgos.get('indicadoresRiesgo').setValue(this.data.riesgo.indicadoresRiesgo);
        this.formRiesgos.get('definicionTeorica').setValue(this.data.riesgo.definicionTeorica);
        this.formRiesgos.get('definicionOperativa').setValue(this.data.riesgo.definicionOperativa);
        this.formRiesgos.get('criterioRiesgoAlto').setValue(this.data.riesgo.criterioRiesgoAlto);
        this.formRiesgos.get('puntajeRiesgoAlto').setValue(this.data.riesgo.puntajeRiesgoAlto);
        this.formRiesgos.get('criterioRiesgoBajo').setValue(this.data.riesgo.criterioRiesgoBajo);
        this.formRiesgos.get('puntajeRiesgoBajo').setValue(this.data.riesgo.puntajeRiesgoBajo);
        this.formRiesgos.get('ponderacionAlta').setValue(this.data.riesgo.ponderacionAlta);
        this.formRiesgos.get('ponderacionBaja').setValue(this.data.riesgo.ponderacionBaja);
    }

    /**
     * Se insertan o actualizan datos segun la accion correspondiente. 1. Agregar 2. Actualizar
     */
    crud() {
        if (this.formRiesgos.invalid) {
            this.validateAllFormFields(this.formRiesgos);
            return;
        }
        let notificacion = (this.data.accion == 1) ? "Se agregó el registro correctamente" : "Se actualizó el registro correctamente";
        let data = {
            "accion": this.data.accion,
            "datos": [
                this.formRiesgos.get('numero').value,
                this.formRiesgos.get('elementoRiesgo').value,
                this.formRiesgos.get('indicadoresRiesgo').value,
                this.formRiesgos.get('definicionTeorica').value,
                this.formRiesgos.get('definicionOperativa').value,
                this.formRiesgos.get('criterioRiesgoAlto').value,
                this.formRiesgos.get('puntajeRiesgoAlto').value,
                this.formRiesgos.get('criterioRiesgoBajo').value,
                this.formRiesgos.get('puntajeRiesgoBajo').value,
                this.formRiesgos.get('ponderacionAlta').value,
                this.formRiesgos.get('ponderacionBaja').value
            ]
        }
        this.blockUI.start('Cargando datos...');
        this.service.registrar(data, "crudMatrizRiesgos").subscribe(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, notificacion);
            this.dialogRef.close();
            this.router.navigate(['/matriz-riesgos']);
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }
     /**
   * Valida cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
      validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof UntypedFormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }
}