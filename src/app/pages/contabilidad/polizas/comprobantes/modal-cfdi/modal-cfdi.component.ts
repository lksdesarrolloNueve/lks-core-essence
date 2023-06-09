import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../../../../environments/environment";
import { MatTableDataSource } from "@angular/material/table";
import { DatePipe } from "@angular/common";
import XML2js from 'xml2js';
import { ModalComprobanteComponent } from "../modal-comprobante/modal-comprobante.component";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 21/07/2022
* @descripcion: Componente para la gestion de Comprobantes fiscales
*/
@Component({
    selector: 'modal-cfdi',
    moduleId: module.id,
    templateUrl: 'modal-cfdi.component.html'
})



export class ModalCfdiComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    encabezado: string = "";
    CurrentDate: any;
    proveedor = new UntypedFormControl('', [Validators.required]);
    listaProveedor: any = [];
    opcionesProveedor: Observable<string[]>;
    btnGuAct: string = "Guardar";
    comprobante = new UntypedFormControl('', [Validators.required]);
    listComprobante: any = [];
    //Infomacion del proveedor
    //proveedorId: number = 0;
    pRFC = new UntypedFormControl('');
    pCuenta = new UntypedFormControl('');
    pBanco = new UntypedFormControl('');
    pTCuenta = new UntypedFormControl('');
    pTOperacion = new UntypedFormControl('');
    pTercero = new UntypedFormControl('');
    //Infomacion de la poliza
    monto = new UntypedFormControl('');
    cvePoliza = new UntypedFormControl('');
    polizaId: number = 0;
    //CFDI
    comprobanteFiscal: any = [];
    cfdId: number = 0;
    //tipoComprobante: number = 0;
    //tabla de comprobante
    informacionComprobante: any = [];
    columns: string[] = ['serie', 'folio', 'rfcReceptor', 'rfcEmisor', 'monto'];
    dataSourceCFDI: MatTableDataSource<any>;
    serie: string = "";
    folio: string = "";
    receptor: string = "";
    emisor: string = "";
    total: number = 0;
    btnUp: boolean = false;
    /**
    * 
    * @param service service para el acceso de datos 
    */

    constructor(private service: GestionGenericaService, @Inject(MAT_DIALOG_DATA) public data: any, private datePipe: DatePipe, public abrirDia: MatDialog, private dialog: MatDialogRef<ModalCfdiComponent>) {
        this.CurrentDate = this.datePipe.transform(new Date(), 'dd/MM/yyyy');
        this.comprobanteFiscal = data.cfdi;
        this.encabezado = data.encabezado;
        this.polizaId = data.poliza.polizaId;
        this.cvePoliza.setValue(data.poliza.cvePoliza);
        let monto = JSON.parse(data.poliza.extPoliza.movimientosTesoreria);
        this.monto.setValue(monto[0].monto);
        this.llenarComprobante();

    }

    ngOnInit(): void {
        this.spsProveedor();
        this.spsTipoComprobante();
    }
    /**Seleccion de proveedor para cargar su infomacion */
    seleccionPro(proveedor) {
        this.pRFC.setValue(proveedor.option.value.rfc);
        this.pCuenta.setValue(proveedor.option.value.numeroCuenta);
        this.pBanco.setValue(proveedor.option.value.extencionProveedor.bancosat.nombreBanco);
        this.pTCuenta.setValue(proveedor.option.value.extencionProveedor.tipoCuenta.descripcion);
        this.pTOperacion.setValue(proveedor.option.value.extencionProveedor.tipoOperacion.descripcion);
        this.pTercero.setValue(proveedor.option.value.extencionProveedor.tipoTercera.descripcion);


    }
    /**
    * Metodo para cargar infomacion de los provedores
    */
    spsProveedor() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaProveedor').subscribe(data => {
            this.blockUI.stop();
            this.listaProveedor = data;
            this.opcionesProveedor = this.proveedor.valueChanges.pipe(
                startWith(''),
                map(value => this._filterProveedor(value))
            );
            //Editar comprobante
            if (!this.vacio(this.comprobanteFiscal)) {
                //llenar informacion del proveedor
                let proveedor = this.listaProveedor.find(value => value.claveProveedor == this.comprobanteFiscal[0].cve_proveedor);
                this.proveedor.setValue(proveedor);
                this.pRFC.setValue(proveedor.rfc);
                this.pCuenta.setValue(proveedor.numeroCuenta);
                this.pBanco.setValue(proveedor.extencionProveedor.bancosat.nombreBanco);
                this.pTCuenta.setValue(proveedor.extencionProveedor.tipoCuenta.descripcion);
                this.pTOperacion.setValue(proveedor.extencionProveedor.tipoOperacion.descripcion);
                this.pTercero.setValue(proveedor.extencionProveedor.tipoTercera.descripcion);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
    * Filtra el proveedor
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterProveedor(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaProveedor.filter(option => option.nombreProveedor.toLowerCase().includes(filterValue));

    }


    /**
   * Muestra la descripcion del proveedor
   * @param option --muestra el nombre de la sucursal seleccionada
   * @returns --nombre de la sucursal
   */
    displayFnPro(option: any): any {
        return option ? option.nombreProveedor : undefined;
    }
    /**
    * Método para consultar y listar las categorias de cfdi
    * por clave de categoria
    * @paramcatArraigo
    */
    spsTipoComprobante() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catTipoComprobante, 'listaGeneralCategoria').subscribe(data => {
            this.listComprobante = data;
            if (!this.vacio(this.comprobanteFiscal)) {
                let comprobante = this.listComprobante.find(categoria => categoria.cveGeneral == this.comprobanteFiscal[0].cvecomprobante);
                this.comprobante.setValue(comprobante);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**Tipo de comprobante seleccionado */
    SeleccionComprobante(tipo) {
        //Modal para los comprobantes diferentes al  Comprobante Fiscal Digital por Internet 
        if (tipo.cveGeneral != environment.generales.comprobanteDigital) {
            this.btnUp = true;
            const dialogRef = this.abrirDia.open(ModalComprobanteComponent, {
                disableClose: true,
                data:
                {
                    encabezado: tipo.descripcion,
                    emisor: this.proveedor.value, 
                    monto:this.monto.value
                }
            });

            dialogRef.afterClosed().subscribe(resultado => {
                if (!this.vacio(resultado) && resultado != 1) {
                    //llena la tabla con la informacion de comprobante capturado
                    this.informacionComprobante = resultado;
                    this.dataSourceCFDI = new MatTableDataSource(this.informacionComprobante);
                }
            })
        } else {
            this.btnUp = false;
        }
    }
    /**
     * Metodo para llenar la tabla con la informacion de comprobante
     * @returns 
     */
    llenarComprobante() {
        if (!this.vacio(this.comprobanteFiscal)) {
            for (let co of this.comprobanteFiscal) {
                this.cfdId = co.cfd_id;
                this.btnGuAct = "Actualizar";
                this.informacionComprobante.push({
                    'serie': co.serie, 'folio': co.folio,
                    'receptor': co.rfc_receptor, 'emisor': co.rfc_emisor, 'monto': co.monto
                });
                this.dataSourceCFDI = new MatTableDataSource(this.informacionComprobante);
            }

        }
    }
    /**
   * Metodo que valida si va vacio.
   * @param value 
   * @returns 
   */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    /**
     * Lectura del archivo XML
     * @param archivo 
     */
    subirArchivo(archivo) {
        this.blockUI.start('Cargando comprobante...');
        const reader = new FileReader();
        this.informacionComprobante = [];
        let serie, folio, receptor, emisor, total;
        reader.onload = (e: any) => {
            let xml = e.target.result;
            XML2js.parseString(xml, function (err, result) {
                serie = result["cfdi:Comprobante"].$.Serie;
                folio = result["cfdi:Comprobante"].$.Folio;
                receptor = result["cfdi:Comprobante"]["cfdi:Receptor"][0].$.Rfc;
                emisor = result["cfdi:Comprobante"]["cfdi:Emisor"][0].$.Rfc;
                total = result["cfdi:Comprobante"].$.Total;
            });

            this.informacionComprobante.push({
                'serie': serie, 'folio': folio,
                'receptor': receptor, 'emisor': emisor,
                'monto': total
            });
            this.dataSourceCFDI = new MatTableDataSource(this.informacionComprobante);
            this.blockUI.stop();
        }
        reader.readAsText(archivo.target.files[0])
    }

    /**Metodo CRUD para comprobante fiscal*/
    crudComprobanteF() {
        this.blockUI.start('Cargando datos...');
        let accion = 1;
        if (this.cfdId > 0) {
            accion = 2;//actualizar
        }
       
        let datos = {
            "datos": [this.cfdId, this.polizaId, this.monto.value, this.serie, this.folio,
            this.emisor, this.receptor, this.comprobante.value.generalesId, this.proveedor.value.proveedorID],
            "accion": accion

        }

        this.service.registrar(datos, 'crudCfdiPoliza').subscribe(
            (cfdip: any) => {

                if (cfdip[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, cfdip[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, cfdip[0][1]);
                }
                //cierra el modal
                this.dialog.close();
                this.blockUI.stop();

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }
    /**Metodo de validaciones para procesar el comprobante de pago */
    validaciones() {
        if (this.proveedor.invalid) {
            if (this.proveedor instanceof UntypedFormControl) {
                this.proveedor.markAsTouched({ onlySelf: true });
            }
            return this.blockUI.stop();
        }
        if (this.comprobante.invalid) {
            if (this.comprobante instanceof UntypedFormControl) {
                this.comprobante.markAsTouched({ onlySelf: true });
            }
            return this.blockUI.stop();
        }
        if (!this.vacio(this.informacionComprobante)) {
            //Se obtiene la información del comprobante procesado
            for (let com of this.informacionComprobante) {
                this.serie = com.serie; this.folio = com.folio; this.receptor = com.receptor;
                this.emisor = com.emisor; this.total = Number.parseFloat(com.monto);
            }
        } else {
            this.service.showNotification('top', 'right', 3, "No se ha cargado el comprobante de pago");
            return this.blockUI.stop();
        }
        //Valida que el monto y rfc concuerden con la poliza y el proveedor
        if (this.monto.value !== this.total) {
            this.service.showNotification('top', 'right', 3, "El valor de la poliza " + this.monto.value + " no es igual a la factura " + this.total);
            return this.blockUI.stop();
        }
        if (this.emisor !== this.proveedor.value.rfc) {
            this.service.showNotification('top', 'right', 3, "El RFC del emisor " + this.proveedor.value.rfc + " no coincide con el comprobante " + this.emisor);
            return this.blockUI.stop();
        }
        this.crudComprobanteF();
    }
    /**
     * Lista de validaciones 
     */
    listaValidaciones = {
        "proveedor": [
            { type: 'required', message: 'Campo requerido.' }
        ],
        "comprobante": [{ type: 'required', message: 'Campo requerido.' }]
    };
}