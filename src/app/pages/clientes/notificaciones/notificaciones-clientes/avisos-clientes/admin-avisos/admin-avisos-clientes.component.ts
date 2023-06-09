import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FiresbaseService } from "../../../../../../shared/service/service-firebase/firebase.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../../../shared/service/gestion";
import { globales } from '../../../.././../../../environments/globales.config';


//https://stackoverflow.com/questions/53478860/how-to-encrypt-and-decrypt-in-angular-6/53478984
//https://www.npmjs.com/package/crypto-js
//https://www.npmjs.com/package/crypto-es

@Component({
    selector: 'admin-avisos-clientes',
    moduleId: module.id,
    templateUrl: 'admin-avisos-clientes.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de avisos para clientes
 */
export class AdminAvisosClientesComponent {

    //Declaracion de variables y componentes
    titulo = 'NOTIFICACIÓN';
    encabezado: string;
    accion: number;
    formAviso: UntypedFormGroup;
    color: ThemePalette = 'primary';
    nombreSocio: string = '';
    sucursal: string = '';
    numSocio: string = '';
    tipoSocio: string = '';
    descTipoSocio: string = '';
    avisoID : any;

    formNotificacion: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;

    /**
     * Validacion para los campos
     */
    validaciones = {
        'aviso': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
        ],
        /*'cveSucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 3 dígitos.' },
            { type: 'pattern', message: 'Solo se aceptan Mayusculas y numeros.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],*/
    }


    constructor(private firebase: FiresbaseService,
        private formbuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;


        this.formNotificacion = this.formbuilder.group({
            aviso: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            vigencia: new UntypedFormControl(''),
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
            this.avisoID = data.socio.id;
            this.nombreSocio = data.socio.descripcion;
            this.sucursal = data.socio.sucursal;
            this.numSocio = data.socio.cve;
            this.tipoSocio = data.socio.tiposocio;
            this.descTipoSocio = data.socio.descTipoSocio;

            this.formNotificacion.get('aviso').setValue(data.socio.aviso);
            const [day, month, year] = data.socio.vigencia.split('/');
            this.formNotificacion.get('vigencia').setValue(new Date(year+'/'+month+'/'+day));
            this.formNotificacion.get('estatus').setValue(data.socio.estatus);

        }






    }



    gestionAvisos(){

        if(this.accion === 0){
            this.crearAviso();
        }else{
            this.modifcarAviso();
        }
    }

    crearAviso() {

        if (this.formNotificacion.invalid) {
            this.validateAllFormFields(this.formNotificacion);
            return;
        }

        let fecha = this.formNotificacion.get('vigencia').value;

        if (!this.vacio(fecha)) {
            fecha = this.formNotificacion.get('vigencia').value.toLocaleDateString();
        } else {
            fecha = '';
        }


        this.blockUI.start('Guardando ...');

        this.firebase.insertar("avisos_socios", {
            descripcion: this.nombreSocio,
            cve: this.numSocio,
            aviso: this.formNotificacion.get('aviso').value,
            vigencia: fecha,
            sucursal: this.sucursal,
            tiposocio: this.tipoSocio,
            descTipoSocio : this.descTipoSocio,
            estatus: this.formNotificacion.get('estatus').value
        }).then(() => {
            this.formNotificacion.reset();
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El aviso se registro correctamente');
        }, (error) => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


    }

    modifcarAviso() {

        if (this.formNotificacion.invalid) {
            this.validateAllFormFields(this.formNotificacion);
            return;
        }


        let fecha = this.formNotificacion.get('vigencia').value;

        if (!this.vacio(fecha)) {
            fecha = this.formNotificacion.get('vigencia').value.toLocaleDateString();
        } else {
            fecha = '';
        }


        this.blockUI.start('Editando ...');

        this.firebase.actualiza("avisos_socios", this.avisoID,{
            descripcion: this.nombreSocio,
            cve: this.numSocio,
            aviso: this.formNotificacion.get('aviso').value,
            vigencia: fecha,
            sucursal: this.sucursal,
            tiposocio: this.tipoSocio,
            descTipoSocio : this.descTipoSocio,
            estatus: this.formNotificacion.get('estatus').value
        }).then(() => {
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