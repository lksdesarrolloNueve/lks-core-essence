import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { BuscarClientesComponent } from '../../../pages/modales/clientes-modal/buscar-clientes.component';
import { globales } from "../../../../environments/globales.config";
import { MatDialog } from '@angular/material/dialog';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'historial-cobranza',
    moduleId: module.id,
    templateUrl: 'historial-cobranza.component.html'
})

export class HistorialCobranzaComponet implements OnInit {

    //Declaracion de variables
    lblCliente: string = globales.ente;
    lblClientes: string = globales.entes;
    refCredito: string = "";

    promedioGeneral = 0;
    desGeneralCalificacion = "";

    numeroCliente = new UntypedFormControl('');
    nombre = new UntypedFormControl('');
  
    //Formulario
    formHistCob: UntypedFormGroup;


    editable = false;

    creditoID: BigInteger;
    montoCredito: number = 0.00;
    saldoCredito: number = 0.00;
    tasaInicial: number = 0.00;
    tasaInteres: number = 0.00;
    amortizaciones: number = 0;
    montoVencido: number = 0.00;
    diasInteres: number = 0;
    capital: number = 0.00;
    interesCredito: number = 0.00;
    moratorioCredito: number = 0.00;
    ivaCredito: number = 0.00;
    totalCredito: number = 0.00;
    totalLiquida: number = 0.00;
    capitalrestante: number = 0.00;
    creditoClienteId: any;
    listaCreditoCliente: any;
    creditoClienteControl = new UntypedFormControl('', [Validators.required]);
    //saldopagocreControl = new FormControl('', [Validators.required])
   

    now = new Date();
    year = this.now.getFullYear();
    month = this.now.getMonth();
    day = this.now.getDay();
    minDate = new Date(this.year, this.month, this.day);
    maxDate = new Date(5000, 1, 31);


    @BlockUI() BlockUI: NgBlockUI;

    constructor(private service: GestionGenericaService,
        private dialog: MatDialog,
        private fomrBuilder: UntypedFormBuilder) {

            this.formHistCob = this.fomrBuilder.group({
                saldoPrestamo: new UntypedFormControl(''),
                tasaInic: new UntypedFormControl(''),
                tasaInt: new UntypedFormControl(''),
                amortVencidas: new UntypedFormControl(''),
                montoVencidas: new UntypedFormControl(''),
                diasInt: new UntypedFormControl(''),
                capital: new UntypedFormControl(''),
                interes: new UntypedFormControl(''),
                moratorio: new UntypedFormControl(''),
                iva: new UntypedFormControl(''),
                total: new UntypedFormControl(''),
                creditocliente: this.creditoClienteControl,
    
            });

    }

    /**
     * metodo OnInit de la clase MovimientosCaja para iniciar las listas
     */
    ngOnInit() {
      
    }


    /**
  * Metodo para abrir ventana modal para buscar al cliente
  * @param data -- Objecto o valor a condicionar
  */
    abrirDialogCliente(data:any) {
        this.limpiaForm();
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {//clientes
            let titulo = "Lista clientes";

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                data: {
                    titulo: titulo,
                    cliente: data
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {

                if(!result || result == undefined){
                    return;
                }

                if (result != 1) {
                    if (result.tipoPersona == 'F') {
                        this.numeroCliente.setValue(result.datosCl.numero_cliente);
                        this.nombre.setValue(result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl);
                        this.spsCreditoCliente();
                    }
                }

            });
        }

    }

     // metodo para consultar los saldos de cuenta bancaria
     spsSaldoCredito(cveCredito: string) {

        this.BlockUI.start('Cargando créditos.');

        this.service.getListByID(cveCredito,'listaSaldoCredito').subscribe(
            data => {
                //MUESTRA LA TABLA
                this.creditoID = data[0].creditoID;
                this.montoCredito = data[0].monto;
                this.saldoCredito = data[0].saldoRestante;
                this.tasaInicial = data[0].tasaInicial;
                this.tasaInteres = data[0].tasaInteres;
                this.amortizaciones = data[0].amortizaciones;
                this.montoVencido = data[0].montoVencido;
                this.diasInteres = data[0].diasInteres;
                this.capital = data[0].capital;
                this.interesCredito = data[0].interes;
                this.moratorioCredito = data[0].interesMoratorio,
                this.ivaCredito = data[0].iva;
                this.totalCredito = data[0].total;
                this.totalLiquida = data[0].totalLiquida;

                this.BlockUI.stop();
            }, errorSaldo => {
                this.BlockUI.stop();
                this.service.showNotification('top', 'right', 4, errorSaldo);
            }
        )

    }

    /**
     * Método para consultar los creditos por cliente(solo creditos vigentes)
     * @param general
     */
     spsCreditoCliente() {
        this.BlockUI.start('Cargando créditos.');

        let path = this.numeroCliente.value + '/' + 2;
        this.service.getListByID(path, 'listaHistorialCred').subscribe(data => {
            
            this.listaCreditoCliente = data;
            this.BlockUI.stop();

        }, error => {
            this.BlockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /** 
    * Activa div de acuerdo al tipo de movimiento
    * @param event 
    */
     opcionCreditoSelect(event) {
        let claveCred = this.formHistCob.get('creditocliente').value;
        this.spsSaldoCredito(claveCred);
    }

    /**
   * Método para generar el reporte de Financiamiento
   */
  reporteHistorialCob() {

    if (this.formHistCob.invalid) {
        this.validateAllFormFields(this.formHistCob);
        return;
    }

    this.BlockUI.start('Generando Reporte');
    //Esta vacia la caja de texto sucursal cuando es reporte consolidado

    let url = this.numeroCliente.value + '/' + this.formHistCob.get('creditocliente').value;


    this.service.getListByID(url, 'reporteHistorialCob').subscribe(data => {
      this.BlockUI.stop();
      if (data[0] === '0') {
        const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'reporteHistCobranza' + '.pdf';
        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 4, data[1])
      }
    }, error => {
      this.BlockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });
  }

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

    /** Creación del arreglo para implementar las validaciones **/
    validaciones = {
        'claveCredito': [
            { type: 'required', message: 'Campo requerido para reporte.' },
        ],

    }


    /**
     * Limpiar formulario
     */
    limpiaForm(){
        this.numeroCliente.setValue(null);
        this.nombre.setValue(null);
        this.listaCreditoCliente = [];
        this.formHistCob.get('creditocliente').setValue(null);
        this.montoCredito = null;
        this.saldoCredito = null;
    }

}
