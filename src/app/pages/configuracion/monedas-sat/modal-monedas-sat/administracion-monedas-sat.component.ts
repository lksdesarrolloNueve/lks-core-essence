import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 10/09/2021
* @descripcion: Componente para la gestion de monedas sat
*/
@Component({
    selector: 'administracion-monedas-sat',
    moduleId: module.id,
    templateUrl: 'administracion-monedas-sat.component.html'
})

export class AdministracionMonedasComponent implements OnInit {
    //Declaracion de variables y componentes
    titulo = 'Moneda SAT';
    encabezado: string;
    accion: number;

    formMonedas: UntypedFormGroup;
    monedaid: number;
    @BlockUI() blockUI: NgBlockUI;

    /**
         * Constructor del componente Monedas
         * @param data -- Componente para crear diálogos modales en Angular Material 
         * @param service  -- Instancia de acceso a datos
         */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Validaciones formGrupo 
        this.formMonedas = this.formBuilder.group({
            estatus: new UntypedFormControl('true'),
            moneda: new UntypedFormControl('', Validators.required),
            cveSat: new UntypedFormControl('', [Validators.required, Validators.minLength(3), Validators.pattern("^[a-zA-Z]+$")]),
            tipoCambio: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            fecha: new UntypedFormControl('', Validators.required)
        });
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        if (this.accion === 2) {
            //se pasan los datos de la tabla al formulario
            this.monedaid = data.moneda.monedaId;
            this.formMonedas.get('cveSat').setValue(data.moneda.cveMonedaSat.trim());
            this.formMonedas.get('moneda').setValue(data.moneda.nombreMoneda);
            this.formMonedas.get('tipoCambio').setValue(data.moneda.tipoCambio);
            this.formMonedas.get('fecha').setValue(data.moneda.fecha);
            this.formMonedas.get('estatus').setValue(data.moneda.estatus);
        }
    }

    /**
        * Metodo OnInit de la clase
        */
    ngOnInit() {

    }

    /**
         * Metodo para guardar los datos de Monedas SAT
         */
    guardarMoneda() {
        //validacion de campos que no esten vacios
        if (this.formMonedas.invalid) {
            this.validateAllFormFields(this.formMonedas);
            return;
        }
        //arreglo que contiene los datos a guardar
        const data = {
            "monedaId": '0',
            "cveMonedaSat": this.formMonedas.get('cveSat').value,
            "nombreMoneda": this.formMonedas.get('moneda').value,
            "tipoCambio": this.formMonedas.get('tipoCambio').value,
            "fecha": this.formMonedas.get('fecha').value,
            "estatus": this.formMonedas.get('estatus').value
        };

        //uso del metodo para guardar en base de datos     
        this.blockUI.start('Guardando ...');
        //Se pasa el areglo,accion,direccionamiento
        this.service.registrarBYID(data, 1, 'crudMonedas').subscribe(resultado => {
            if (resultado[0][0] === '0') {
                //se manada llamar el metodo limpiar 
                this.limpiarCampos();
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 2, resultado[0][1]);

            } else {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);

            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
     * Metodo para actualizar los datos de Monedas SAT
     */
    actualizarMoneda() {
        //validacion de campos que no esten vacios
        if (this.formMonedas.invalid) {
            this.validateAllFormFields(this.formMonedas);
            return;
        }
        //areglo que contiene los datos actualizar
        const data = {
            "monedaId": this.monedaid,
            "cveMonedaSat": this.formMonedas.get('cveSat').value,
            "nombreMoneda": this.formMonedas.get('moneda').value,
            "tipoCambio": this.formMonedas.get('tipoCambio').value,
            "fecha": this.formMonedas.get('fecha').value,
            "estatus": this.formMonedas.get('estatus').value
        };
        //se manda llamar el metodo registrarBYID para actualizar      
        this.blockUI.start('Editando ...');
        this.service.registrarBYID(data, 2, 'crudMonedas').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito 
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error   
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**
     * Meotdo limpiarCampos
     * Limpia el formulario formMonedas Monedas SAT
     */
    limpiarCampos() {
        this.formMonedas.get('cveSat').setValue('');
        this.formMonedas.get('moneda').setValue('');
        this.formMonedas.get('tipoCambio').setValue('');
        this.formMonedas.get('fecha').setValue('');
    }
    /**
      * Valida Cada atributo del formulario
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

    //Arreglo de mensajes a mostrar al validar formulario
    validaciones = {
        'cveSat': [
            { type: 'required', message: ' Clave SAT requerida.' },
            { type: 'pattern', message: 'Solo letras de 3 carácteres.' },
            { type: 'minLength', message: 'Solo letras de 3 carácteres.' }
        ],
        'moneda': [
            { type: 'required', message: 'Descripción requerida.' }
        ],
        'tipoCambio': [
            { type: 'required', message: 'Tipo cambio requerido.' },
            { type: 'pattern', message: 'Solo números decimales' }
        ],
        'fecha': [
            { type: 'required', message: 'Fecha requerida.' }
        ]

    }
}