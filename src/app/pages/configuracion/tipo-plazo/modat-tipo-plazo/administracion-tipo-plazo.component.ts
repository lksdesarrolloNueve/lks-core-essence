import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn } from "@angular/forms";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ThemePalette } from "@angular/material/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";




/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 13/10/2021
 * @descripcion: Componente para la administración de tipo plazo
 */
@Component({
  selector: 'administracion-tipo-plazo',
  moduleId: module.id,
  templateUrl: 'administracion-tipo-plazo.component.html'
})

export class AdministracionTipoPlazoComponent implements OnInit {
  //Declaracion de variables y constantes
  titulo: string;
  accion: number;
  formTipoPlazo: UntypedFormGroup;
  tipoPlazoId: number = 0;
  @BlockUI() blockUI: NgBlockUI;

  //validacion de campos
  validaciones = {
      'clavePlazo': [
          { type: 'required', message:  'Campo requerido.' },
          { type: 'maxlength', message: 'El tamaño máximo es de 3 caracteres.' },
      ],
      'descripcion': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'maxlength', message:'El tamaño máximo es de 255 caracteres.' },
      ],
      'dias': [
          { type: 'required', message: 'Campo requerido.' },
          { type: 'pattern', message: 'El campo solo acepta números enteros.' }
      ],
      'meses': [
          { type: 'required', message: 'Campo requerido.' },
          { type: 'pattern', message: 'El campo solo acepta números enteros.' }

      ],   
      'estatus': [
        { type: 'required', message: 'Campo requerido.' },
      ]

  }

  /**
  * constructor de la clase tipo plazo
  * @param service - service para el acceso de datos
  */
  constructor(private service: GestionGenericaService,
      private formbuilder: UntypedFormBuilder,
      @Inject(MAT_DIALOG_DATA) public data: any) {
      this.titulo = data.titulo + " Tipo Plazo";
      this.accion = data.accion;

      this.formTipoPlazo = this.formbuilder.group({
          clavePlazo: new UntypedFormControl('', [Validators.required, Validators.maxLength(3)]),
          descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
          dias: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
          meses: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
          estatus: new UntypedFormControl(true)

      });

      if (this.accion === 2) {
          this.tipoPlazoId = data.tipoPlazo.tipoPlazoId
          this.formTipoPlazo.get('clavePlazo').setValue(data.tipoPlazo.clavePlazo)
          this.formTipoPlazo.get('descripcion').setValue(data.tipoPlazo.descripcion)
          this.formTipoPlazo.get('dias').setValue(data.tipoPlazo.dias)
          this.formTipoPlazo.get('meses').setValue(data.tipoPlazo.meses)
          this.formTipoPlazo.get('estatus').setValue(data.tipoPlazo.estatus)
      }
  }


  ngOnInit() { 

  }

  /**
   * Metodo que guardar y editar tipo plazo
   * 
   */
  crudTipoPlazo(form: any) {

      if (this.formTipoPlazo.invalid) {
          this.validateAllFormFields(this.formTipoPlazo);
          return;
      }

      const data = {
          tipoPlazoId: this.tipoPlazoId,
          clavePlazo: form.clavePlazo,
          descripcion: form.descripcion,
          dias: form.dias,
          meses: form.meses,
          estatus: form.estatus
      }

      if (this.accion === 2) {
          this.blockUI.start('Editando ...')
      } else {
          this.blockUI.start('Guardando ...')
      }


      this.service.registrarBYID(data, this.accion, 'crudTipoPlazo')
          .subscribe(result => {
              this.blockUI.stop();
              if (result[0][0] === '0') {
                  if (this.accion !== 2) {
                      this.formTipoPlazo.reset();
                  }
                  this.service.showNotification('top', 'right', 2, result[0][1])
              } else {
                  this.service.showNotification('top', 'right', 3, result[0][1])
              }
          }, error => {
              this.blockUI.stop();
              this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
          })
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