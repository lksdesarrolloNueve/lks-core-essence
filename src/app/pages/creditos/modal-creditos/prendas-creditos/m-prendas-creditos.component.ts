import { Component, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
    selector: 'm-prendas-creditos',
    moduleId: module.id,
    templateUrl: 'm-prendas-creditos.component.html'
})

export class MPrendasCreditosComponent {
    //Declaracion de variables
    titulo: any;
    accion: any;


    listaPrendasCreditos: any = [];
    prensariaID: number = 0;
    formPrenda: UntypedFormGroup
    garantiaID: number = 0;


    constructor(private dialog: MatDialogRef<MPrendasCreditosComponent>,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.accion = data.accion;
        this.titulo = data.titulo;


        this.formPrenda = this.formBuilder.group({
            no_factura: new UntypedFormControl('', [Validators.required]),
            valor_prenda: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            fecha_endoso: new UntypedFormControl(new Date(), [Validators.required]),
            nombre_titular: new UntypedFormControl('', [Validators.required])
        });
        if (this.accion == 2) {

            this.prensariaID = data.detalle[0];
            this.formPrenda.get('no_factura').setValue(data.detalle[1]);
            this.formPrenda.get('valor_prenda').setValue(data.detalle[2]);
            this.formPrenda.get('fecha_endoso').setValue(data.detalle[3]);
            this.formPrenda.get('nombre_titular').setValue(data.detalle[4]);
            this.garantiaID = data.detalle[5];
        }
    }

    /**
     * Metodo que permite agregar la garantia a una lista de Garantia
     * @returns Metodo que agrega la garantia 
     */
    agregarGarantia() {


        if (this.formPrenda.invalid) {
            this.validateAllFormFields(this.formPrenda);
            return false;
        }

        this.listaPrendasCreditos.push(this.prensariaID,
            this.formPrenda.get('no_factura').value,
            this.formPrenda.get('valor_prenda').value,
            this.formPrenda.get('fecha_endoso').value,
            this.formPrenda.get('nombre_titular').value,
            this.garantiaID
        );

        this.dialog.close(this.listaPrendasCreditos);

    }


    /**
     * Lista de Validaciones del formulario
     */
    validaciones = {
        'no_factura': [
            { type: 'required', message: 'Campo requerido.' }],
        'fecha_endoso': [
            { type: 'required', message: 'Campo requerido.' }],
        'nombre_titular': [
            { type: 'required', message: 'Campo requerido.' }],
        'valor_prenda': [
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