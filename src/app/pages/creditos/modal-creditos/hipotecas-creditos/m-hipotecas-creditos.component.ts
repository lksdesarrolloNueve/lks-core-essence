import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
    selector: 'm-hipotecas-creditos',
    moduleId: module.id,
    templateUrl: 'm-hipotecas-creditos.component.html'
})

export class MHipotecasCreditosComponent {
    //Declaracion de variables
    titulo: any;
    accion: any;
    hipoteca_id: number = 0;


    listaHipotecas: any = [];
    garantiaID: number = 0;
    formHipoteca: UntypedFormGroup;

    constructor(private dialog: MatDialogRef<MHipotecasCreditosComponent>,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.accion = data.accion;
        this.titulo = data.titulo;


        this.formHipoteca = this.formBuilder.group({
            no_escritura: new UntypedFormControl('', Validators.required),
            folio: new UntypedFormControl('', Validators.required),
            fecha_registro: new UntypedFormControl({ value: new Date(), disabled: true }, Validators.required),
            fecha_vencimiento: new UntypedFormControl({ value: new Date(), disabled: true }, Validators.required),
            valor: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            fecha_valuacion: new UntypedFormControl({ value: new Date(), disabled: true }, Validators.required),
            grado_prelacion: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')])
        });
        if (this.accion == 2) {
            this.hipoteca_id = data.detalle[0];
            //Se llenan los datos del formulario a editar
            this.formHipoteca.get('no_escritura').setValue(data.detalle[1]);
            this.formHipoteca.get('folio').setValue(data.detalle[2]);
            this.formHipoteca.get('fecha_registro').setValue(data.detalle[3]);
            this.formHipoteca.get('fecha_vencimiento').setValue(data.detalle[4]);
            this.formHipoteca.get('valor').setValue(data.detalle[5]);
            this.formHipoteca.get('fecha_valuacion').setValue(data.detalle[6]);
            this.formHipoteca.get('grado_prelacion').setValue(data.detalle[7]);
            this.garantiaID = data.detalle[8];
        }
    }

    /**
     * Metodo que permite agregar la garantia a una lista de Garantia
     * @returns Metodo que agrega la garantia 
     */
    agregarGarantia() {

        if (this.formHipoteca.invalid) {
            this.validateAllFormFields(this.formHipoteca);
            return false;
        }


        this.listaHipotecas.push(this.hipoteca_id,
            this.formHipoteca.get('no_escritura').value,
            this.formHipoteca.get('folio').value,
            this.formHipoteca.get('fecha_registro').value,
            this.formHipoteca.get('fecha_vencimiento').value,
            this.formHipoteca.get('valor').value,
            this.formHipoteca.get('fecha_valuacion').value,
            this.formHipoteca.get('grado_prelacion').value,
            this.garantiaID
        );

        this.dialog.close(this.listaHipotecas);
    }



    //validacion de campos 
    validaciones = {
        'no_escritura': [
            { type: 'required', message: 'Campo requerido.' }],
        'folio': [
            { type: 'required', message: 'Campo requerido.' }],
        'fecha_registro': [
            { type: 'required', message: 'Campo requerido.' }],
        'fecha_vencimiento': [
            { type: 'required', message: 'Campo requerido.' }],
        'valor': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números enteros.' }],
        'fecha_valuacion': [
            { type: 'required', message: 'Campo requerido.' }],
        'grado_prelacion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números enteros.' }]
    };


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