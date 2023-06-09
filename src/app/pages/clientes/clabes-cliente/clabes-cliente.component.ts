import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { globales } from '../../../.././environments/globales.config';
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import Swal from 'sweetalert2';

@Component({
    selector: 'clabes-cliente',
    moduleId: module.id,
    templateUrl: 'clabes-cliente.component.html'
})
export class ClabesClienteComponent {

    //Declaracion de variables
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    titulo: string = '';
    accion: number = 0;
    datosCliente: any;
    tipoPersona: any;

    numSocio: any;
    nombreSocio: any;
    sucursal: any;
    listaMovCaja = [];
    listaClabeCuenta = [];
    showForm = true;
    formClabe: UntypedFormGroup;
    idClabe = 0;
    idCliente = 0;

    @BlockUI() blockUI: NgBlockUI;

    displayedColumns: string[] = ['cuenta', 'clabe', 'acciones']
    dataSourceClabes: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    /** Lista de validaciones*/
    validacion_msj = {
        'cuenta': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    }


    constructor(private service: GestionGenericaService,
        private dialog: MatDialog,
        private formBuilder: UntypedFormBuilder) {
        this.spsMovimientosCaja();

        this.formClabe = this.formBuilder.group({
            cuenta: new UntypedFormControl('', Validators.required)
        });

    }


    /**
     * Metodo para abrir ventana modal
     * @param ventana -- 0 Cliente 1 Empresa 2 Refencia
     */
    abrirDialog(accion) {

        this.titulo = "Lista clientes";
        this.accion = 1;

        //se abre el modal
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (result !== undefined) {

                this.datosCliente = result.datosCl;
                this.tipoPersona = result.tipoPersona;

                this.numSocio = result.datosCl.numero_cliente;
                this.sucursal = result.datosCl.nombre_sucursal;
                this.idCliente = result.datosCl.cliente_id;

                this.spsClabeCuentaCliente(result.datosCl.numero_cliente)

                if (result.tipoPersona === 'F') {
                    this.nombreSocio = result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl
                } else {
                    this.nombreSocio = result.datosCl.razon_social
                }
                this.showForm = false;

            } else {
                //cancelar
                this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente.');
            }
        });

    }


    /**
     * Metodo que consulta los Movimientos Cajas
     */
    spsMovimientosCaja() {

        this.blockUI.start('Cargando datos...');
        let path = "NULL" + '/' + 2;
        this.service.getListByID(path, 'listaMovCaja').subscribe(data => {
            this.blockUI.stop();
            this.listaMovCaja = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );

    }


    /**
     * Metodo para cargar la cuenta del cliente
     */
    spsClabeCuentaCliente(numCliente: any) {
        this.listaClabeCuenta = [];
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(numCliente, 'spsClabeCuentaCliente').subscribe(cuenta => {
            this.blockUI.stop();
            if (cuenta.estatus) {
                this.listaClabeCuenta = cuenta.cuentas;
                this.dataSourceClabes = new MatTableDataSource(this.listaClabeCuenta);
                this.dataSourceClabes.sort = this.sort;
                setTimeout(() => this.dataSourceClabes.paginator = this.paginator);
            } else {
                this.service.showNotification('top', 'right', 3, cuenta.mensaje);
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    crudClabe(){
        if (this.formClabe.invalid) {
            this.validateAllFormFields(this.formClabe);
            return;
        }

        const json ={
            datos: [this.idClabe,this.idCliente,
                this.formClabe.get('cuenta').value.catMovimientoCajaID,
                true],
            accion: 1
        }

        this.blockUI.start('Procesando petición...');

        this.service.registrar(json,'crudClabeClienteCajas').subscribe(response => {
            this.blockUI.stop();
            if (response[0][0] === '0') {
                this.formClabe.reset();
                this.service.showNotification('top', 'right', 2, response[0][1]);
                this.spsClabeCuentaCliente(this.numSocio);
            } else {
                this.service.showNotification('top', 'right', 3, response[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


    }

    /**
     * Metodo que permite cambiar el estatus de un Usuario
     * @param estatus - Valor de Togge
     * @param clabe - Elemento a cambiar de estatus
     */
     cambiaEstatus(estatus: any, clabe: any) {

        let confirmacionTEXT = "Al realizar esta acción la cuenta no podra recibir depositos. ¿Desea continuar?";

        if(estatus === true){
            confirmacionTEXT = "Al realizar esta acción la cuenta podra recibir depositos. ¿Desea continuar?";
        }

        Swal.fire({
            title: '¿Estas seguro?',
            text: confirmacionTEXT,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, realizar!',
            cancelButtonText:'Cancelar'
          }).then((result) => {

            if (result.isConfirmed) {
                const json ={
                    datos: [clabe.clabe_cliente_id,
                        estatus],
                    accion: 3
                }
        
                this.blockUI.start('Procesando petición...');
        
                this.service.registrar(json,'crudClabeClienteCajas').subscribe(response => {
                    this.blockUI.stop();
                    if (response[0][0] === '0') {
                        clabe.estatus = estatus;
                        this.service.showNotification('top', 'right', 2, response[0][1]);
                    } else {
                        this.service.showNotification('top', 'right', 3, response[0][1]);
                    }
                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.Message);
                });
            }else{
                this.spsClabeCuentaCliente(this.numSocio);
                
            }
          })

        

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

}