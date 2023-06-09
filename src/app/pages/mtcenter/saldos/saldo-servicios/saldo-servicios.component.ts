import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector:'saldo-servicios',
    moduleId:module.id,
    templateUrl:'./saldo-servicios.component.html'
})
export class SaldoServiciosComponent{

    //Clave sucursal sesión.
    vCveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

    establecimiento: any = null;

    saldo: any = null;

    @BlockUI() blockUI: NgBlockUI;

    formLogin: UntypedFormGroup;

    /**
     * Constructor de la clase AdministracionRolesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService) {

        this.formLogin = this.formBuilder.group({
            usuarioRecarga: new UntypedFormControl('', [Validators.required, Validators.maxLength(6), Validators.pattern('[0-9]*')]),
            contraseniaRecarga: new UntypedFormControl('', Validators.required)
        });

        this.getEstablecimiento();

    }

    getEstablecimiento() {
        let json = {
            "data": {
                "cveSucursal": this.vCveSucursal
            },
            "accion": 4
        };

        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(json, 'listaEstablecimientosMTCenter').subscribe(spsEstablecimiento => {
            this.blockUI.stop();
            if (spsEstablecimiento.codigo == "0") {
                this.establecimiento = spsEstablecimiento;
            } else {
                this.service.showNotification('top', 'right', 3, spsEstablecimiento.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para consultar saldo de Tiempo Aire Electronico
     */
    consultarSaldo(): void {
        //Valida fomrulario
        if (this.formLogin.invalid) {
            this.validateAllFormFields(this.formLogin);
            return;
        }

        if(this.establecimiento.codigo !== 0){
            this.service.showNotification('top', 'right', 3, this.establecimiento.mensaje);
            return;
        }

        let jsonLogin = {
            "cadena": this.establecimiento.info.cadena,
            "establecimiento": this.establecimiento.info.establecimiento,
            "terminal": this.establecimiento.info.terminal,
            //"cajero": 39326,
            //"clave": "F#(/G0@dwZ",
            "cajero":this.formLogin.get('usuarioRecarga').value,
            "clave": this.formLogin.get('contraseniaRecarga').value
        };

        this.blockUI.start('Validando datos...');
        this.service.registrar(jsonLogin, 'loginMTC').subscribe(respLogin => {
            this.blockUI.stop();

            console.log(respLogin);

            if (respLogin.codigoRespuesta !== 0) {
                this.service.showNotification('top', 'right', 3, respLogin.mensajeRespuesta);
                return;
            }

            let jsonSaldo = {
                "token": respLogin.token,
                "tokenType": respLogin.token_type
            };
    
            this.blockUI.start('Cargando datos...');
            this.service.getListByObjet(jsonSaldo, 'saldoServicios').subscribe(respSaldo => {
                this.blockUI.stop();
                console.log(respSaldo);
                if(respSaldo.codigo_respuesta !==0){
                    this.service.showNotification('top', 'right', 3, respSaldo.descripcion_respuesta);
                    return;
                }

                this.saldo = respSaldo;
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
            );


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

    /*Validaciones de los campos del formulario.
    * Se crean los mensajes de validación.
    */
    validaciones = {
        'usuarioRecarga': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo de 6 dígitos.' },
            { type: 'pattern', message: 'Solo números enteros.' }
        ],
        'contraseniaRecarga': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };
    
}