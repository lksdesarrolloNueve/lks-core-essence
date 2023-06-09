import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FiresbaseService } from "../../../../../shared/service/service-firebase/firebase.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../../shared/service/gestion";

//https://stackoverflow.com/questions/53478860/how-to-encrypt-and-decrypt-in-angular-6/53478984
//https://www.npmjs.com/package/crypto-js
//https://www.npmjs.com/package/crypto-es

@Component({
    selector: 'admin-bloqueo-clientes',
    moduleId: module.id,
    templateUrl: 'admin-bloqueo-clientes.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de bloqueo de clientes en tiempo real (Base DAtos FireBAse)
 */
export class AdminBloqueoClientesComponent {

    //Declaracion de variables y componentes
    titulo = 'BLOQUEO CLIENTE';
    encabezado: string;
    accion: number;
    formAviso: UntypedFormGroup;
    color: ThemePalette = 'primary';
    nombreSocio: string = '';
    sucursal: string = '';
    numSocio: string = '';
    tipoSocio: string = '';
    descTipoSocio: string = '';
    bloqueoID : any;

    formBloqueo: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Validacion para los campos
     */
    validaciones = {
        'motivo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
        ]
    }


    constructor(private firebase: FiresbaseService,
        private formbuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;


        this.formBloqueo = this.formbuilder.group({
            motivo: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            estatus: new UntypedFormControl(true)
        });


        if (this.accion === 0) {
            this.nombreSocio = data.socio.nombre_cl + ' ' +
                data.socio.paterno_cl + ' ' + data.socio.materno_cl;
            this.sucursal = data.socio.nombre_sucursal;
            this.numSocio = data.socio.numero_cliente;
            this.tipoSocio = data.socio.cve_socio;
            this.descTipoSocio = data.socio.tipo_socio;
        } else {
            this.bloqueoID = data.socio.id;
            this.nombreSocio = data.socio.descripcion;
            this.sucursal = data.socio.sucursal;
            this.numSocio = data.socio.cve;
            this.tipoSocio = data.socio.tiposocio;
            this.descTipoSocio = data.socio.descTipoSocio;
            this.formBloqueo.get('motivo').setValue(data.socio.motivo);
        }

    }




    gestionAvisos(){

        if(this.accion === 0){
            this.crearBloqueo();
        }else{
            this.modifcarBloqueo();
        }
    }

    crearBloqueo() {

        if (this.formBloqueo.invalid) {
            this.validateAllFormFields(this.formBloqueo);
            return;
        }


        this.blockUI.start('Guardando ...');

        this.firebase.insertar("bloqueo_clientes", {
            descripcion: this.nombreSocio,
            cve: this.numSocio,
            motivo: this.formBloqueo.get('motivo').value,
            fechabloqueo: new Date().toLocaleDateString(),
            fechadesbloqueo: '',
            sucursal: this.sucursal,
            tiposocio: this.tipoSocio,
            descTipoSocio : this.descTipoSocio,
            usuario : 'admin',
            estatus: this.formBloqueo.get('estatus').value
        }).then(() => {
            this.formBloqueo.reset();
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El aviso se registro correctamente');
        }, (error) => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


    }

    modifcarBloqueo() {

        if (this.formBloqueo.invalid) {
            this.validateAllFormFields(this.formBloqueo);
            return;
        }


        this.blockUI.start('Editando ...');

        this.firebase.actualiza("bloqueo_clientes", this.bloqueoID,{
            descripcion: this.nombreSocio,
            cve: this.numSocio,
            motivo: this.formBloqueo.get('motivo').value,
            fechabloqueo: new Date().toLocaleDateString(),
            fechadesbloqueo: '',
            sucursal: this.sucursal,
            tiposocio: this.tipoSocio,
            descTipoSocio : this.descTipoSocio,
            usuario : 'admin',
            estatus: this.formBloqueo.get('estatus').value
        }).then(() => {
            this.formBloqueo.reset();
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El aviso se modifico correctamente');
        }, (error) => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


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


    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

}