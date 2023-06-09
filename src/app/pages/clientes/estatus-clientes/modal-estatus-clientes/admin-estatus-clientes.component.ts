import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { environment } from '../../../../../environments/environment';
import { PermisosService } from "../../../../shared/service/permisos.service";
import { globales } from '../../../../../environments/globales.config';





@Component({
    selector: 'administracion-estatus-clientes',
    moduleId: module.id,
    templateUrl: 'admin-estatus-clientes.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 09/12/2021
 * @descripcion: Componente para la gestion de bancos del sat
 */


export class AdministracionEstatusCliComponent implements OnInit {

    //Se declaran las variables
    titulo = 'Estatus del Cliente';
    encabezado: string;
    accion: number;

    //Combos--------------------
      listaEstatusCliente: any = [];
      listaMotBajaCliente: any = [];

      //-----------------------
    formEstatusCli: UntypedFormGroup;
    numero_cliente= new UntypedFormControl('',);
    nombres= new UntypedFormControl('',);

    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;


    /**
    * Constructor de la clase
    * @param service   - Servicio de acceso a datos
    * @param dialog  - Gestion de dialogos
    */
    constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, 
        private servicePermisos: PermisosService,
        private dialog: MatDialog) {
        this.encabezado = data.titulo;
        this.accion = data.accion

        this.numero_cliente.setValue(data.cliente.numero_cliente);
        this.nombres.setValue(data.cliente.nombre_cl+' '+data.cliente.paterno_cl+' '+data.cliente.materno_cl);

        this.formEstatusCli = this.formbuilder.group({
        
          
            desc_baja: new UntypedFormControl('',[Validators.required]),
            desc_mot_baja: new UntypedFormControl('',[Validators.required]),

        });
    }
    /**
     * Metodo para guardar el estatus del cliente si es solicitud de baja
     */
    guardarEstatusCli() {

        if (this.formEstatusCli.invalid) {
            this.validateAllFormFields(this.formEstatusCli);
            return;
        }

        if(this.data.cliente.estatus === false && this.formEstatusCli.get('desc_baja').value.cveGeneral === environment.generales.cveEstCliBaj){
            this.service.showNotification('top', 'right', 2, 'El cliente ya cuenta con una solicitud de baja.');
            return;
        }

        if(this.data.cliente.estatus === true && this.formEstatusCli.get('desc_baja').value.cveGeneral === environment.generales.cveEstCliCan){
            this.service.showNotification('top', 'right', 2, 'El cliente esta activo no se puede realizar la cancelación de baja.');
            return;
        }
   
   
        this.blockUI.start('Guardando...');
        const data = {
            "bitEstClienteID": 0,
            "clienteId": this.data.cliente.cliente_id,
            "estatusId": this.formEstatusCli.get('desc_baja').value.generalesId,
            "motBajaID": this.formEstatusCli.get('desc_mot_baja').value.generalesId,
            "usuarioID": this.servicePermisos.usuario.id
        };

        let accion=1;
        if (this.formEstatusCli.get('desc_baja').value.cveGeneral ===  environment.generales.cveEstCliCan){
            accion=2;
        }

        this.service.registrarBYID(data, accion, 'crudEstatusCli').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                    this.dialog.closeAll();
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        )
    }




    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

        this.spsEstatusBaja();
        this.spsMotBajaCliente();

    }



    
    /**
     * Metodo para obtener la lista del Estatus del cliete
     */
     spsEstatusBaja(){
        this.blockUI.start('Cargando Datos...');

        this.service.getListByID(environment.categorias.catEstatusCli, 'listaGeneralCategoria').subscribe(data =>{
            this.listaEstatusCliente = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        } );
    }

     /**
     * Metodo para obtener la lista de el motivo de la baja
     */
      spsMotBajaCliente(){
        this.blockUI.start('Cargando Datos...');

        this.service.getListByID(environment.categorias.catMotBajaCli, 'listaGeneralCategoria').subscribe(data =>{
            this.listaMotBajaCliente = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        } );
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

    
      /*
     *Validaciones para todos los campos agregados
     */
     validacionesEstCli = {
        'desc_baja': [
            { type: 'required', message: 'Campo requerido' }
        ],
        'desc_mot_baja': [
            { type: 'required', message: 'Campo requerido' }]
        
    };





}
