import { CurrencyPipe, DatePipe } from "@angular/common";
import { Component, ComponentFactoryResolver, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdministracionPolizasComponent } from "./modal-polizas/administracion-polizas.component";
import { PermisosService } from "../../../shared/service/permisos.service";
import { environment } from '../../../../environments/environment';
import { ModalCfdiComponent } from "./comprobantes/modal-cfdi/modal-cfdi.component";



//Constantes generales
const cClaseMov = environment.generales.claseMovContable;//"50CO"; //Movimiento contable
const cOrigenMov = environment.generales.origenMov;//"51EL"; //Origen movimiento

//Tipo movimiento póliza
const cCargo = environment.contabilidad.cargo;
const cAbono = environment.contabilidad.abono;

//Tipo póliza

const cIngreso = environment.contabilidad.ingreso;  //'I', //Ingreso
const cEgreso = environment.contabilidad.egreso;   //'E', //Egreso
const cDiario = environment.contabilidad.diario;   //'D', //Diario
const cOrden = environment.contabilidad.orden;    //'O', //Diario

//Tipo movimientos
const cDeposito = environment.tesoreria.deposito;  // 001 'Depostio' = 'I'
const cRetiro = environment.tesoreria.retiro;    // 002 'Retiro'   =  'E'
const cTraspaso = environment.tesoreria.traspasoO; // 003 'Traspaso a otra cuenta' = 'D'

//Forma de pago
const cTransferencia = environment.tesoreria.formaTrans; // 03 'Transferencia'


export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'polizas',
  moduleId: module.id,
  templateUrl: 'polizas.component.html',
  styleUrls: ['polizas.component.css']
})

/**
 * @autor: Horacio Abraham Picón Galván.
 * version: 2.0.
 * @fecha: 16/11/2021
 * @description: componente para la gestion del polizas
 * 
 */

export class PolizasComponent implements OnInit {

  //Usuario id 
  vUsuarioId = this.servicePermisos.usuario.id;

  displayedColumns: string[] = ['no', 'cuentaContable', 'concepto', 'ref', 'debe', 'haber', 'acciones'];

  //Fecha
  fecha = new Date();

  CurrentDate: any;


  listaTipoPolizas = []
  listaSucursales = []
  listaCuentasContables = []
  listaMovimientos = []
  reporte = []
  @BlockUI() blockUI: NgBlockUI;
  formPoliza: UntypedFormGroup;
  adm: AdministracionPolizasComponent
  dataSourceMovimiento: MatTableDataSource<any>;
  selectedICuenta: number = 0;
  selectedISucursal: number = 0;
  opcionesCuenta: Observable<string[]>;
  opcionesSucursales: Observable<string[]>;
  clickedRows = new Set<PeriodicElement>(); //
  polizaSeleccionadaObjeto: any
  idPoliza = 0;


  //EDICION
  isEditVisible: boolean = false;
  isContable: boolean = false;
  claveMovimiento: string = null;
  claseMovimiento: string = null;
  usuario: string = null;
  isActivo: boolean = true;

  //MOVIMIENTOS TRANSACCIONALES.
  idMovimiento = 0;
  cveMovimiento = null;

  //Mensaje dialog.
  mensajeDialog = null;
  cveTipoMovimiento = null;
  //Comprobante Fiscal
  cfdi: any = [];
  poliza: any = [];

  //validacion de campos
  validaciones = {
    'sucursal': [
      { type: 'required', message: 'Campo requerido.' },
      { type: 'invalidAutocompleteObject', message: 'La sucursal no pertenece a la lista, elija otra sucursal.' },
    ],
    'descripcion': [
      { type: 'required', message: 'Campo requerido.' },
    ],
    'tipo': [
      { type: 'required', message: 'Campo requerido.' },
    ]

  }
  save: any;
  /**
  * constructor de la clase polizas
  * @param service - service para el acceso de datos
  */
  constructor(private service: GestionGenericaService,
    public dialog: MatDialog,
    private formbuilder: UntypedFormBuilder,
    private servicePermisos: PermisosService,
    private datePipe: DatePipe) {

    this.CurrentDate = this.datePipe.transform(this.fecha, 'dd/MM/yyyy');

    this.formPoliza = this.formbuilder.group({
      clave: new UntypedFormControl({ value: '', disabled: false }),
      estatus: new UntypedFormControl({ value: '', disabled: false }),
      tipo: new UntypedFormControl('', [Validators.required]),
      sucursal: new UntypedFormControl('', [this.autocompleteObjectValidator(), Validators.required]),
      descripcion: new UntypedFormControl('', [Validators.required])
    })
  }
  customCss: any;

  /**
   * Init
   */
  ngOnInit(): void {
    this.spslistaTipoPolizas();
    this.spsObtenerSucursales();
    this.spslistaCuentasContables();
  }

  /**
   * Obtener sucursales
   */
  spsObtenerSucursales() {

    this.blockUI.start();

    this.service.getListByID(2, 'listaSucursales').subscribe(data => {

      this.listaSucursales = data;
      this.opcionesSucursales = this.formPoliza.get('sucursal').valueChanges.pipe(
        startWith(''),
        map(value => this._filterSucursales(value))
      );

      this.blockUI.stop();

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }


  /**
   * Metodo que lista los tipos de poliza 
   */
  spslistaTipoPolizas() {

    this.blockUI.start();

    this.service.getListByID(2, 'listaTipoPolizas').subscribe(
      (data: any) => {

        this.listaTipoPolizas = data

        this.blockUI.stop();

      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      });
  }


  /**
    * Metodo que lista las cuentas contables AFECTABLES
    */
  spslistaCuentasContables() {
    this.blockUI.start();

    this.service.getListByID(2, 'spsCuentasContables').subscribe(
      (data: any) => {

        this.listaCuentasContables = data

        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      });
  }


  /**
   * Abrir modal administración pólizas.
   */
  abrirAdminPolizas(num, renglonR?) {

    let titulo = ""
    if (num === 1) {
      titulo = "Explorar pólizas";
    } else {
      titulo = "Movimientos póliza"
    }

    const dialogRef = this.dialog.open(AdministracionPolizasComponent, {
      data:
      {
        titulo: titulo,
        listaMovimientos: this.listaMovimientos,
        listaTipoPolizas: this.listaTipoPolizas,
        numero: num,
        renglon: renglonR
      }
    });

    //este se usa cuando cerramos
    dialogRef.afterClosed().subscribe(result => {
      if (result !== "" && result !== undefined) {
        if (result.controls !== undefined) {
          this.movimientoAgregado(result)
        } else {
          this.poliza = result;
          this.polizaSeleccionada(result)
        }

      }


    })
  }


  /**
   * Metodo para cargar datos obtenidos de la busqueda.
   * @param result 
   */
  polizaSeleccionada(result: any) {
    this.isContable = false;
    this.isEditVisible = true;

    //SOLO SE EDITA SI ES PÓLIZA CONTABLE.
    if (result.extPoliza.catGeneral.clave == cClaseMov) {
      this.isContable = true;
    }

    this.idPoliza = result.polizaId;
    this.listaMovimientos = [];

    this.polizaSeleccionadaObjeto = result;
    this.CurrentDate = result.fecha;

    this.claveMovimiento = result.cvePoliza;
    this.claseMovimiento = result.extPoliza.catGeneral.descripcion;
    this.usuario = result.extPoliza.usuario;
    this.isActivo = result.estatus;

    this.formPoliza.get("tipo").setValue(result.tipoPolizaId)

    let objetoSucursal = this.listaSucursales.find(res => { return res.sucursalid === result.sucursalId })
    this.formPoliza.get("sucursal").setValue(objetoSucursal)

    this.formPoliza.get("descripcion").setValue(result.concepto)

    let movimientosPol = JSON.parse(result.movimientos)

    movimientosPol.forEach((movimiento) => {
      let cuentaA = this.listaCuentasContables.find(res => { return res.cuentaid === movimiento.cuenta_id })

      let objeto = {
        idDestalle: movimiento.movimiento_poliza_id,
        cveMovPol: movimiento.clave,
        cuentaContable: cuentaA,
        concepto: movimiento.descripcion,
        ref: movimiento.referencia,
        debe: parseFloat(movimiento.debe),
        haber: parseFloat(movimiento.haber),
        cuenta_id: movimiento.cuenta_id,
        poliza_id: movimiento.poliza_id
      }

      this.listaMovimientos.push(objeto)

    })

    this.dataSourceMovimiento = new MatTableDataSource(this.listaMovimientos);

    //MOVIMIENTOS TRANSACCIONALES.
    let movimientos = JSON.parse(result.extPoliza.movimientosTesoreria)


    movimientos.forEach((movimientoTran) => {

      this.idMovimiento = movimientoTran.movimiento_id;
      this.cveMovimiento = movimientoTran.clave_movimiento;

    })


  }

  /**
   * Agregar movimiento póliza.
   * @param result 
   */
  movimientoAgregado(result: any) {

    if (result.controls.idDestalle.value === 0) {
      let objeto = {
        idDestalle: this.listaMovimientos.length + 1,
        cuentaContable: result.controls.cuenta.value,
        ref: result.controls.referencia.value,
        debe: parseFloat(result.controls.debe.value),
        haber: parseFloat(result.controls.haber.value),
        concepto: result.controls.descripcion.value
      }
      this.listaMovimientos.push(objeto)
      this.dataSourceMovimiento = new MatTableDataSource(this.listaMovimientos);

    } else {

      let indice = this.listaMovimientos.findIndex(res => { return res.idDestalle === result.controls.idDestalle.value })
      this.listaMovimientos[indice].cuentaContable = result.controls.cuenta.value,
        this.listaMovimientos[indice].ref = result.controls.referencia.value,
        this.listaMovimientos[indice].debe = parseFloat(result.controls.debe.value),
        this.listaMovimientos[indice].haber = parseFloat(result.controls.haber.value),
        this.listaMovimientos[indice].concepto = result.controls.descripcion.value
      this.listaMovimientos[indice].idDestalle = result.controls.idDestalle.value

      this.dataSourceMovimiento = new MatTableDataSource(this.listaMovimientos);
    }
  }
  /**Metodo que muestra la informacion del comprobante fiscal de la poliza */
  spsCfdi() {
    this.blockUI.start("Cargando datos ...");
    this.cfdi = [];
    this.service.getListByID(this.poliza.cvePoliza, 'spsCfdiProveedor').subscribe(data => {
      if (!this.vacio(data)) {
        this.cfdi = JSON.parse(data);
      }
      this.blockUI.stop();
      this.mostrarCfdi();
    }, error => {
      this.service.showNotification('top', 'right', 4, error);
    });

  }
  /**Modal para mostrar la infomacion del cfdi o guardar */
  mostrarCfdi() {
    let titulo = "";
    if (!this.vacio(this.cfdi)) {
      titulo = "Actualizar comprobante fiscal";
    } else {
      titulo = "Agregar Comprobante Fiscal";
    }
    this.dialog.open(ModalCfdiComponent, {
      disableClose: true,
      data:
      {
        encabezado: titulo,
        cfdi: this.cfdi,
        poliza: this.poliza
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
  /**
   * Metodo para filtrar por cuenta id 
   */
  opcionSelectCuenta(event) {
    this.selectedICuenta = event.option.value.cuenta;
  }

  opcionSelectSucursales(event) {
    this.selectedISucursal = event.option.value.nombreSucursal;
  }


  /**
   * Filtra la categoria de nacionalidad
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
  private _filterSucursales(value: any): any {

    let filterValue = value;

    if (value === null || value === undefined) {
      value = '';
    }
    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
  }


  /**
  * Muestra la descripcion de la cuenta
  * @param option --cuenta seleccionada
  * @returns --nombre de la nacionalidad
  */
  displayFnCuenta(option: any): any {
    return option ? option.cuenta : undefined;
  }

  displayFnSucursal(option: any): any {
    return option ? option.nombreSucursal : undefined;
  }


  ///////////////////////////////////////CRUD TRANSACTION//////////////////////////////
  /**
   * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
   * @param element --Lista con los datos del sectores
   */
  guardarEditarDialog(accion: number) {

    //this.evaluaTipoMovimiento();//BORRRAR

    if (this.formPoliza.invalid) {
      this.validateAllFormFields(this.formPoliza);
      return;
    }

    if (this.listaMovimientos.length <= 0) {
      this.service.showNotification('top', 'right', 3, "Se debe agregar el detalle de la póliza.");
      return;
    }

    //Validar que el cargo se igual al habono.
    if ((this.getTotalDebe() - this.getTotalHaber()) != 0) {
      this.service.showNotification('top', 'right', 3, "El cargo es diferente al abono.");
      return;
    }
    //Carga mensajes.
    this.mensajesDialog(accion);

    this.abrirAdvertencia(accion);//Guardar

  }

  /**
   * Abrir ventana modal de confirmacion
   * @param element datos categoria
   * @param accion 0:Guardar, 1:Modificar
   * */
  abrirAdvertencia(accion: number) {
    var encabezado = "";
    var body = "";
    if (accion === 1) {//Guardar movimiento.
      encabezado = "Guardar póliza.";
      body = this.mensajeDialog;

    } else if (accion === 4) {//Modificar movimiento
      encabezado = "Modificar póliza.";
      body = this.mensajeDialog;

    } else if (accion === 3) {
      encabezado = "Eliminar póliza.";
      body = this.mensajeDialog;
    }

    const dialogRef = this.dialog.open(verificacionModalComponent, {
      data: {
        titulo: encabezado,
        body: body
      }
    });

    //Cerrar ventana
    dialogRef.afterClosed().subscribe(result => {
      if (result === 0) {//aceptar y guardar

        this.crudPoliza(accion);

      }
    });
  }


  /**
   * Abrir ventana modal de confirmación con la clave. !!!!Pendiente de aprobación
   * @param element datos categoria
   * @param accion 0:Guardar, 1:Modificar
   * */
  modalConfirmacion(mensaje: any) {
    var encabezado = "Transacción exitosa.";

    this.dialog.open(verificacionModalComponent, {
      data: {
        titulo: encabezado,
        body: mensaje
      }
    });

  }



  /**
   * Mensajes para dialog movimientos.
   */
  mensajesDialog(accion: number) {
    this.mensajeDialog = null;

    if (accion === 1) {//Guardar

      this.mensajeDialog = "La póliza será creada."

    } else if (accion === 2) {

      this.mensajeDialog = "La póliza con clave " + this.claveMovimiento + " será actualizada."

    } else if (accion === 3) {

      this.mensajeDialog = "La póliza con clave " + this.claveMovimiento + " será cancelada."

    }
  }


  /////////////////////////////////////////////////////////////////////////////////////



  /**
   * Metodo CRUD para pólizas
   * @param accion 
   * @returns 
   */
  crudPoliza(accion) {

    this.blockUI.start();

    this.evaluaTipoMovimiento();

    //Agregar el json para enviar a crear la poliza
    let tipoPo = this.listaTipoPolizas.find(res => { return res.tipoPolizaId === this.formPoliza.get('tipo').value })
    let sucursal = this.formPoliza.get('sucursal').value
    let movimientosArreglo = []


    //MOVIMIENTOS POLIZA
    this.dataSourceMovimiento.data.forEach(res => {

      let claveTipoMovPol: any;

      if (res.debe !== 0) {
        claveTipoMovPol = cCargo;
      } else {
        claveTipoMovPol = cAbono;
      }


      let objetoMov = {
        "movPolizaId": res.idDestalle,
        "claveMov": res.cveMovPol,
        "polizaId": this.idPoliza,
        "descripcion": res.concepto,
        "referencia": res.ref,
        "cuentaContCve": res.cuentaContable.cuenta,
        "tipoMovPoliza": {
          "tipoMovPolId": null,
          "claveTipoMovPol": claveTipoMovPol,
          "descTipoMovPol": null,
          "estatusTipoMovPol": true
        },
        "debe": res.debe,
        "haber": res.haber,
        "noMovimiento": 1
      }
      movimientosArreglo.push(objetoMov)
    });

    let Objeto = {
      "listPoliza": [{
        "polizaId": this.idPoliza,
        "cvePoliza": this.claveMovimiento,
        "tipoPoliza": tipoPo,
        "conceptoPoliza": this.formPoliza.get('descripcion').value,
        "polFechaHora": null,
        "polSucursalCve": sucursal.cveSucursal,
        "polUsuarioId": this.vUsuarioId,
        "polEstatus": null,
        "noMovimiento": 1
      }],


      "listMovPoliza": movimientosArreglo,


      "listMovTran": [{
        "movimientoId": this.idMovimiento,
        "claveMovimiento": this.cveMovimiento,
        "sucursalCve": sucursal.cveSucursal,
        "concepto": this.formPoliza.get('descripcion').value,
        "clienteCve": null,
        "ctaBancoOrigenCve": null,
        "ctaBancoDestinoCve": null,
        "creditoCve": null,
        "extMov1": {
          "poliza": {
            "polizaId": this.idPoliza,
            "cvePoliza": null,
            "tipoPoliza": {
              "tipoPolizaId": 0,
              "claveTipo": null,
              "descTipo": null,
              "estatusTipo": true
            }
          },
          "movCajaCve": null,
          "tipoMovimiento": {
            "tipoMovimientoId": 0,
            "claveTipoMov": this.cveTipoMovimiento,
            "descripcion": null,
            "operacion": null,
            "estatus": true
          },
          "cajaCve": null,
          "bovedaCve": null,
          "formaPago": {
            "fpagoid": null,
            "cvefpago": cTransferencia,
            "nombrefpago": null
          },
          "fechaHora": null,
          "monto": this.getTotalDebe(),
          "numeroCheque": null,
          "beneficiario": null
        },
        "extMov2": {
          "claseMovimiento": {
            "generalesId": null,
            "cveGeneral": cClaseMov,
            "descripcion": null,
            "estatus": false,
            "categoria": null
          },
          "usuarioId": this.vUsuarioId,
          "origenMov": {
            "generalesId": null,
            "cveGeneral": cOrigenMov,
            "descripcion": null,
            "estatus": false,
            "categoria": null
          },
          "conciliado": false,
          "transito": false,
          "estatus": true,
          "movimientosPoliza": null,
          "noMovimiento": 1
        }
      }],
      "accion": accion
    }

    //se manda llamar la funcion para guardar
    this.service.registrar(Objeto, 'crudPoliza')
      .subscribe(result => {


        if (result[0][0] === '0') {
          this.formPoliza.reset();
          this.nuevo()

          //this.service.showNotification('top', 'right', 2, result[0][1] + ' '+result[0][4]);
          //!!!Pendiente aprobación.
          this.modalConfirmacion(result[0][1] + '. Clave de la póliza: ' + result[0][5]);

        } else {
          this.service.showNotification('top', 'right', 3, result[0][1]);
        }

        this.blockUI.stop();


      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message)
      })
  }


  /**
   * Evalua tipo movimiento.
   */
  evaluaTipoMovimiento() {

    //Agregar el json para enviar a crear la poliza
    let tipoPo = this.listaTipoPolizas.find(res => { return res.tipoPolizaId === this.formPoliza.get('tipo').value })

    if (tipoPo.claveTipo === cIngreso) {
      this.cveTipoMovimiento = cDeposito;
    } else if (tipoPo.claveTipo === cEgreso) {
      this.cveTipoMovimiento = cRetiro;
    } else if (tipoPo.claveTipo === cDiario) {
      this.cveTipoMovimiento = cTraspaso;
    } else if (tipoPo.claveTipo === cOrden) {
      this.cveTipoMovimiento = cTraspaso;
    }
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


  /** Total debe. */
  getTotalDebe() {
    return this.listaMovimientos.map(t => t.debe).reduce((acc, value) => acc + value, 0);
  }

  /** Total haber. */
  getTotalHaber() {
    return this.listaMovimientos.map(t => t.haber).reduce((acc, value) => acc + value, 0);
  }

  /**
   * Abrir ventana modal de confirmacion
   * @param element datos categoria
   * @param accion 0:Guardar, 1:Modificar
   * */
  abrirAdvertenciaEliminar(elemento: any) {

    const dialogRef = this.dialog.open(verificacionModalComponent, {
      data: {
        titulo: "Eliminar movimiento.",
        body: "Se eliminará el registro " + elemento.cuentaContable.cuenta + " de la tabla."
      }
    });

    //Cerrar ventana
    dialogRef.afterClosed().subscribe(result => {
      if (result === 0) {//aceptar
        this.eliminar(elemento);
      }
    });
  }

  /***
   * metodo para remover datos de la lista de activos
   */
  eliminar(valor: any) {
    let index = this.listaMovimientos.findIndex(res => res.cuentaContable === valor.cuentaContable);
    this.listaMovimientos.splice(index, 1);
    this.dataSourceMovimiento = new MatTableDataSource(this.listaMovimientos);
  }

  /**
   * Limpia el formulario y las listas.
   */
  nuevo() {
    this.formPoliza.reset();
    this.listaMovimientos = []
    this.dataSourceMovimiento = new MatTableDataSource(this.listaMovimientos);
    this.CurrentDate = this.datePipe.transform(this.fecha, 'dd/MM/yyyy');

    //Editar
    this.isEditVisible = false;
    this.isContable = false;
    this.claveMovimiento = null;
    this.claseMovimiento = null;
    this.usuario = null;
    this.isActivo = true;
    this.idPoliza = 0;

    //Movimientos Transaccionales
    this.idMovimiento = 0;
    this.cveMovimiento = null;
    this.cveTipoMovimiento = null;

  }

  /**
   * Valida que el texto ingresado pertenezca a la lista
   * @returns mensaje de error.
   */
  autocompleteObjectValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (typeof control.value === 'string' && control.value.length > 0) {
        return { 'invalidAutocompleteObject': { value: control.value } }
      }
      return null  /* valid option selected */
    }
  }

  /**
   * Método para generar reporte de poliza
   */
  spslistaPolizasPorCve() {
    this.blockUI.start('Generando reporte');

    this.service.getListByID(this.claveMovimiento, 'reporte').subscribe(data => {
      this.blockUI.stop();

      if (data[0] === '0') {
        const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
        const fileName = 'Poliza' + this.claveMovimiento + '.pdf';

        window.open(linkSource, fileName);

      } else {
        this.service.showNotification('top', 'right', 4, data[1])
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    });


  }
}
