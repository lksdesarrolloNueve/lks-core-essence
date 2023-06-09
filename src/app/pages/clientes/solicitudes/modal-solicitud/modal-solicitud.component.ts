import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import categorias from "../../../../../environments/categorias.config";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { BuscarClientesComponent } from "../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { globales } from '../../../../../environments/globales.config';
import { generales } from '../../../../../environments/generales.config';
import { PermisosService } from "../../../../shared/service/permisos.service";
import { ModalSolicitudSucursalComponent } from "./modal-solicitud-sucursal.component";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 6/06/2022
* @descripcion: Componente para la editar solicitud
*/
@Component({
    selector: 'modal-solicitud',
    moduleId: module.id,
    templateUrl: 'modal-solicitud.component.html'
})

export class ModalSolicitudComponent {
    @BlockUI() blockUI: NgBlockUI;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    today: Date = new Date();
    listaModulos: any = [];
    listaEstSolicitud: any = [];
    listAddSeccion: any = [];
    formSolicitud: UntypedFormGroup;
    encabezado: string = '';
    cargo: boolean = false;
    autoriza: boolean = false;
    lectura: boolean = true;
    btnDisabled: boolean = false;
    estatusNueva: boolean = true;
    //Informacion a procesar 
    solicitudId: number = 0;
    usuarioAutoriza: string = '';

    constructor(private service: GestionGenericaService, private permisos: PermisosService,
        private dialog: MatDialogRef<ModalSolicitudComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: UntypedFormBuilder,
        public abrir: MatDialog) {
        this.encabezado = data.titulo;

        //Validaciones del formulario 
        this.formSolicitud = this.formBuilder.group(
            {
                fecha: new UntypedFormControl(this.today.toLocaleDateString()),
                cliente: new UntypedFormControl('', [Validators.required]),
                motivo: new UntypedFormControl('', [Validators.required]),
                seccion: new UntypedFormControl('', [Validators.required]),
                estatus: new UntypedFormControl('', [Validators.required]),
                autorizacion: new UntypedFormControl('',),
                usuario: new UntypedFormControl('',)

            })
        if (data.accion != 0) {//Autorizar solicitud
            this.llenarAutorizacion(data.accion);
            this.estatusNueva = false;
        }
    }
    /**
       * Metodo OnInit de la clase
       */
    ngOnInit() {
        this.spsEstatusSolicitud();
        this.spsUsuario();
        this.spsModulos();
    }
    /**
       * Metodo que consulta los Estados de la solicitud 
       */
    spsEstatusSolicitud() {
        this.blockUI.start('Cargando datos...');
        this.listaEstSolicitud=[];
        this.service.getListByID(categorias.catEstusSol, 'listaGeneralCategoria').subscribe(data => {
            if (this.estatusNueva) { //solicitud nueva 
                let espera = data.find(s => s.cveGeneral != generales.solRechazada || s.cveGeneral != generales.solAprobada);
                this.listaEstSolicitud.push(espera);
                this.formSolicitud.get("estatus").setValue(espera.generalesId);
            } else {
                this.listaEstSolicitud=data;
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**
     * Metodo que consulta los modulos a modificar 
     */
    spsModulos() {
        this.blockUI.start('Cargando datos...');
        this.listaModulos = [];
        this.service.getListByID(categorias.catModuloCl, 'listaGeneralCategoria').subscribe(data => {
            this.listaModulos = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**Metodo para bir ventana modal de clientes */
    modalClientes() {
        const dialogRef = this.abrir.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente',
                cliente: ''
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result != 1) {
                if (result.tipoPersona == 'F') {
                    this.spsModulos();
                    this.formSolicitud.get('cliente').setValue(result.datosCl.numero_cliente.trim());
                } else {
                    //Moral
                    let secciones = [];
                    for (let mod of this.listaModulos) {
                        if (mod.cveGeneral === generales.datoGeneralSecc || mod.cveGeneral === generales.perfilInfSecc ||
                            mod.cveGeneral === generales.refeSecc || mod.cveGeneral === generales.digitaSecc) {
                            secciones.push(mod);
                        }
                    }
                    this.listaModulos = secciones;
                    this.formSolicitud.get('seccion').setValue(secciones);
                    this.formSolicitud.get('cliente').setValue(result.datosCl.numero_cliente.trim());
                }
            }
            if (result == 1) {
                this.formSolicitud.get('cliente').setValue('');
            }

        });

    }
    /**Obtiene el integrante de comite acorde al usuario loggeado */
    spsUsuario() {
        this.blockUI.start('Cargando datos...');
        this.cargo = false;
        this.service.getListByID(this.permisos.usuario.id + '/' + this.permisos.sucursalSeleccionada.sucursalid, 'spsIntegranteComite').subscribe(data => {
            if (!this.vacio(data)) {
                let integrante = JSON.parse(data);
                this.cargo = true;
                //in habiliatr botn
                this.formSolicitud.get('usuario').setValue(integrante[0].first_name + ' ' + integrante[0].last_name);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Guardar solicitud para cambio de infomacion
     * @param informacion 
     */
    guardarAutorizar(accion) {
        this.blockUI.start('Cargando datos...');
        if (this.formSolicitud.invalid) {
            this.validateAllFormFields(this.formSolicitud);
            this.service.showNotification('top', 'right', 3, "Completa la información.");
            this.blockUI.stop();
            return;
        }
        if (accion == 2 && !this.cargo) {
            this.service.showNotification('top', 'right', 3, 'El usuario debe pertenecer a un comite de crédito ó <br> ser oficial de cumplimiento de la sucursal en sesión.');
            this.blockUI.stop();
            return;
        }
        let estatus = this.listaEstSolicitud.find(s => s.cveGeneral.trim() === generales.solAprobada);
        if (accion == 2 && estatus.generalesId != this.formSolicitud.get('estatus').value) {
            this.service.showNotification('top', 'right', 3, 'El estatus de la solicitud debe ser diferente al de espera.');
            this.blockUI.stop();
            return;
        }
        this.listAddSeccion = [];
        if (!this.vacio(this.formSolicitud.get('seccion').value)) {
            this.listAddSeccion = this.formSolicitud.get('seccion').value;
        }
        let arreglo = {
            "solicitud": [this.solicitudId,
            this.formSolicitud.get('cliente').value,
            this.permisos.sucursalSeleccionada.sucursalid,
            this.formSolicitud.get('motivo').value,
            this.permisos.usuario.id,
            this.formSolicitud.get('estatus').value,
            this.usuarioAutoriza,
            this.formSolicitud.get('autorizacion').value
            ],
            "modulo": this.listAddSeccion,
            "accion": accion
        };

        this.service.registrar(arreglo, 'crudSolActualizacionCl').subscribe(
            crudAut => {

                if (crudAut[0][0] === '0') {
                    this.dialog.close();
                    this.service.showNotification('top', 'right', 2, crudAut[0][1]);
                } else {
                    this.dialog.close();
                    this.service.showNotification('top', 'right', 3, crudAut[0][1]);
                }
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );


    }

    /**LLenar la infomacin del formulario para autorizar solicitud */
    llenarAutorizacion(informacion) {
        this.blockUI.start('Cargando datos...');
        this.spsUsuario();
        let estatus;//estatus solicitud
        let secciones = [];
        this.service.getListByID(categorias.catModuloCl, 'listaGeneralCategoria').subscribe(data => {
            this.listaModulos = data;
            let modulos = JSON.parse(informacion.modulos);
            for (let modulo of modulos) {
                let findSerivicios = this.listaModulos.find(a => a.generalesId === modulo.generales_id);
                secciones.push(findSerivicios.generalesId);
            }
            this.formSolicitud.get('seccion').setValue(secciones);

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

        this.service.getListByID(categorias.catEstusSol, 'listaGeneralCategoria').subscribe(data => {
            this.listaEstSolicitud = data;
            estatus = this.listaEstSolicitud.find(s => s.cveGeneral.trim() === informacion.cve_generales.trim());
            //deshabilitar boton si ya esta autorizada
            if (estatus.cveGeneral === generales.solAprobada) {
                this.usuarioAutoriza = informacion.autoriza_id;
                this.formSolicitud.get('usuario').setValue(informacion.name_autoriza);
                this.btnDisabled = true;
            } else {
                this.usuarioAutoriza = this.permisos.usuario.id;
                this.formSolicitud.get('usuario').setValue(this.permisos.usuario.firstName + ' ' + this.permisos.usuario.lastName);
            }
            this.solicitudId = informacion.solicitud_act_id;
            this.formSolicitud.get('fecha').setValue(informacion.fecha);
            this.formSolicitud.get('motivo').disable();
            this.formSolicitud.get('cliente').setValue(informacion.numero_cliente);
            this.formSolicitud.get('motivo').setValue(informacion.descripcion);
            this.formSolicitud.get('estatus').setValue(estatus.generalesId);
            this.formSolicitud.get('autorizacion').setValue(informacion.observaciones);


            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
        this.autoriza = true;


    }
    /**
     * Metodo para ver las solicitudes realizadas con su estatus
     */
    verSolCambio(){
        //se abre el modal
        this.abrir.open(ModalSolicitudSucursalComponent, {
           disableClose: true,
           width: '50%',
           data: {
               titulo: "Solicitudes registradas",
               accion: 0
           }
       });
       
   }
    /**
          * Metodo que valida si va vacio.
          * @param value 
          * @returns 
          */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    validaciones = {
        'cliente': [
            { type: 'required', message: 'Campo requerido.' }],
        'motivo': [
            { type: 'required', message: 'Campo requerido' }],
        'seccion': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    }
    /**
   * Valida Cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);             //3
            if (control instanceof UntypedFormControl) {             //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //5
                this.validateAllFormFields(control);            //6
            }
        });
    }
}