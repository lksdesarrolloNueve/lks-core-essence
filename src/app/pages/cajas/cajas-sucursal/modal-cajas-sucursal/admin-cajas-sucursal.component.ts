import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { NavigationExtras, Router } from '@angular/router'
import { PermisosService } from "../../../../shared/service/permisos.service";
import * as moment from "moment";

@Component({
    selector: 'admin-cajas-sucursal',
    moduleId: module.id,
    templateUrl: 'admin-cajas-sucursal.component.html'
})

/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 06/10/2021
 * @descripcion: Componente para la Administracion de INPC
 */
export class AdminCajasSucursalComponent implements OnInit {

    //Declaracion de variables y constantes
    titulo: string;
    accion: number;
    inpcId: number = 0;
    formCajasSucursal: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;
    listaSesiones: any[];
    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;
    nombreUsuario = this.servicePermisos.usuario.username;

    cve_sucursal: any;
    sucursal: any;
    cve_caja: any;
    descripcion_caja: any;
    estatusSesion: number = 0;
    timezone: any;
    cajaId: any;

    /**
     * Constructor para la clase INPC
     * @param service -- Servoce para el acceso de datos
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private router: Router,
        private servicePermisos: PermisosService,
        private dialogRef: MatDialogRef<AdminCajasSucursalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.accion = data.accion;

        this.cve_caja = data.cajas.cve_caja;
        this.cajaId = data.cajas.caja_id;

        this.formCajasSucursal = this.formBuilder.group({
            saldoInicialCajero: new UntypedFormControl('', [Validators.required]),
            comentario: new UntypedFormControl('', [Validators.required]),
            botonD: new UntypedFormControl({ value: '', disabled: true }),
        });

        if (this.accion === 2) {
            this.cve_caja = data.cajas.cve_caja;
            this.cajaId = data.cajas.caja_id;
            this.descripcion_caja = data.cajas.descripcion;
            this.cve_sucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;
            this.sucursal = this.servicePermisos.sucursalSeleccionada.nombreSucursal;

        }

        this.fechaFormatoPg = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    /**
     * Metodo init
     */
    ngOnInit(): void {
        this.calcularSaldoInicial();
    }

    /**
     * Redirecciona.
     */
    redireccion() {

        const navigationExtras: NavigationExtras = {
            state: {
                cajas: this.data.cajas,
            }
        };
        this.router.navigate(['/caja-movimientos'], navigationExtras);
    }


    /** GESTION DE CAJAS POR MEDIO DE POSTGRES */
    fechaFormatoPg: any;
    saldoInicialSistemaPg: any;

    /**
    * Metodo que inicia la sesion 
    */
    inicioSesionCajaPg() {
        /**
        * Validacion complementaria para la validacion de guardado de datos en el formulario formCajasSucursal
        */
        if (this.formCajasSucursal.invalid) {
            this.validateAllFormFields(this.formCajasSucursal);
            return;
        }

        let datos = {
            "accion": 1,
            "datos": [
                null,
                this.vUsuarioId,
                null,
                null,
                this.formCajasSucursal.get('comentario').value,
                null,
                String((this.saldoInicialSistemaPg === null) ? 0 : this.saldoInicialSistemaPg), // Se ingresa como saldoInicialSistema el saldoFinalSistema de la ultima sesion),
                String(this.formCajasSucursal.get('saldoInicialCajero').value),
                0,
                0,
                0,
                this.cve_caja,
                null //Sesion id
            ]
        }

        this.blockUI.start('Cargando datos...');

        // Se agregan los datos de cierre al historial
        this.service.registrar(datos, 'crudSesionesCajasPg').subscribe(data => {
            this.blockUI.stop();
            this.dialogRef.close();

            this.data.cajas.caja_id = data[0][2];
            this.data.cajas.id = data[0][3];
            this.data.cajas.fecha_apertura = data[0][4];
            this.data.cajas.sesionid = data[0][5];
            this.data.cajas.estatus = data[0][6];
            this.data.cajas.comentario_apertura = this.formCajasSucursal.get('comentario').value;
            this.data.cajas.saldo_inicial_sistema = Number((this.saldoInicialSistemaPg === null) ? 0 : this.saldoInicialSistemaPg);
            this.data.cajas.saldo_inicial_cajero = Number(this.formCajasSucursal.get('saldoInicialCajero').value);

            this.redireccion();
            this.service.showNotification('top', 'right', 2, 'El inicio de sesión se hizo correctamente');
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Calcula saldo inical cajas
     */
    calcularSaldoInicial() {
        // 1. Saldos posteriores a apertura de caja. 2. Saldos posteriores por cuenta contable/poliza.
        // 3. Saldos anteriores. 4. Saldos anteriores por poliza
        let caja = {
            "accion": 5,
            "cveCaja": this.cve_caja,
            "sesionId": 0
        }


        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(caja, 'listaSaldoCajaMov').subscribe(data => {
            this.blockUI.stop();
            this.saldoInicialSistemaPg = 0;

            data.forEach((p: any) => {
                if (p.monto != undefined) {
                    this.saldoInicialSistemaPg += p.monto;
                }
            });

        }, error => {
            this.blockUI.stop();
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

    /**
     * Validacion para los campos
     */
    validaciones = {
        'saldoInicialCajero': [
            { type: 'required', message: 'Campo requerido.' },

        ],
        'comentario': [
            { type: 'required', message: 'Campo requerido.' },
        ],

    }


}
