import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl, FormControlDirective, UntypedFormGroup, Validators } from "@angular/forms";
import FuzzySearch from 'fuzzy-search';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { SelectionModel } from "@angular/cdk/collections";
import { environment } from "../../../../environments/environment";


@Component({
  selector: 'comite',
  moduleId: module.id,
  templateUrl: 'comite.component.html'
})

/**
 * @autor:Jasmin Santana
 * version: 1.0.
 * @fecha: 13/01/2022
 * @description: componente para la gestion de comite de creditos
 * 
 */

export class ComiteComponent implements OnInit {
  //Declaracion de variables y  controles
  @BlockUI() blockUI: NgBlockUI;
  nombreTab: string = '';
  //filtrar comite
  busqueda: any;
  public textoBusqueda: string;
  public resultado: [];
  listaComite: any = []
  listaCargoComite: any = []
  comites: any = [];
  //formulario
  formComite: UntypedFormGroup;
  cargoC = new UntypedFormControl();
  formIntegrantes: UntypedFormGroup;
  //Tabla sucursales 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['seleccion', 'cveSucursal', 'nombreSucursal', 'estatus'];
  dataSourceSucursales: MatTableDataSource<any>;
  listSucursales: any = [];
  selection = new SelectionModel<any>(true, []);

  //tabla integrantrantes
  @ViewChild(MatPaginator) paginatorI: MatPaginator;
  @ViewChild(MatSort) sortI: MatSort;
  displayedColumnsIn: string[] = ['seleccionI', 'alias', 'nombre', 'cargo', 'estatusI'];
  dataSourceIntegrantes: MatTableDataSource<any>;
  listaUsuarios: any = [];
  selectionI = new SelectionModel<any>(true, []);
  //Matrices 
  listaComiteCredito: any = [];
  listaSucursalesSelec: any = [];
  listaIntegrantesSelect: any = [];
  //IDS
  comiteID: number = 0;
  claveCommite: string = "";

  /**
* constructor de la clase comite
* @param service - service para el acceso de datos
*/
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder) {
    this.formComite = this.formBuilder.group(
      {
        comite: new UntypedFormControl('', Validators.required),
        clave: new UntypedFormControl(''),
        estatus: new UntypedFormControl(true)
      });
    //el formControl se crea al listar ya que se asigan un id por registros de usuarios
    this.formIntegrantes = this.formBuilder.group({});
  }
  /**
* Metodo OnInit de la clase creditos
*/
  ngOnInit() {
    this.spsComite();
    this.spsCargos();
    this.spsUsuarios();
    this.spsSucurales();
  }
  /**
* Metodo que consulta los comites
*/
  spsComite() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(this.claveCommite, 'listaComite').subscribe(data => {
      this.blockUI.stop();
      if (this.claveCommite != "") {
        this.comites = data;
        this.editarComite();
      } else {
        this.listaComite = data;
      }
      this.busqueda = new FuzzySearch(this.listaComite, ['clave', 'nombre'], {
        caseSensitive: false,
      });
      this.claveCommite ='';
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });
  }
  /**
    * Metodo para filtrar comite
    * 
    */

  buscarComite() {
    this.resultado = this.busqueda.search(this.textoBusqueda);
    this.listaComite = this.resultado;
  }
  /**
   * Obtiene la clave del comite y se busca sus datos a editar
   * @param clave comite
   */
  mostrarComite(clave) {
    this.claveCommite = clave;
    this.spsComite();
  }
  /**
   * Se llena la información de los datos a editar
   */

  editarComite() {
    this.limpiarCampos();
    this.comiteID = this.comites[0].comiteId;
    this.formComite.get('clave').setValue(this.comites[0].clave);
    this.formComite.get('comite').setValue(this.comites[0].nombre);
    this.formComite.get('estatus').setValue(this.comites[0].estatus);
    //Seleccion de sucursales
    let sucursales = JSON.parse(this.comites[0].sucursales);
    for (let option of sucursales) {
      const exists = this.dataSourceSucursales.data.filter(x => x.sucursalid === option.sucursalid)[0];
      this.selection.toggle(exists);
    }
    //asignar integrantes
    let integrantes = JSON.parse(this.comites[0].integrantes);
    let i = 0;
    for(let us of  this.listaUsuarios){
      let encontro=integrantes.find(u => u.usuario_id===us.id);
      if(encontro!=undefined){
       //buscar y asignar cargo
       let cargo = this.listaCargoComite.find(c => c.generalesId === encontro.cargo_id);
       this.formIntegrantes.get('cargoC' + i).setValue(cargo);
       
      const exists = this.dataSourceIntegrantes.data.filter(x => x.id === encontro.usuario_id)[0];
      //Se usa el campo email de usuarios para asignar el valor del cargo
      exists.email=cargo;
      this.selectionI.toggle(exists);
      }
      i++; 
    }


  }
  /**
      * Metodo para listar los  cargos de comite  
      * en generales por la clave de la categoria
      * @param catGenero 60CC
      */
  spsCargos() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(environment.categorias.catCargoComite, 'listaGeneralCategoria').subscribe(data => {
      this.listaCargoComite = data;
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });
  }
  /**
     * Metodo para cargar en tabla las sucursales
     */
  spsSucurales() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(1, 'listaSucursales').subscribe(data => {
      this.listSucursales = data;
      this.blockUI.stop();
      this.dataSourceSucursales = new MatTableDataSource(this.listSucursales);
      this.dataSourceSucursales.paginator = this.paginator;
      this.dataSourceSucursales.sort = this.sort;
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    }
    );
  }
  /** Verifica Si el número de elementos seleccionados coincide con el número total de filas. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    let numRows;
    if (this.dataSourceSucursales != undefined) {
      numRows = this.dataSourceSucursales.data.length;
    }
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario borrar la selección. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSourceSucursales.data);
  }

  /** La etiqueta de la casilla de verificación en la fila aprobada*/
  casillaVerificacion(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  /**
* Metodo que consulta los Usuarios
*/
  spsUsuarios() {
    this.blockUI.start('Cargando datos...');
    this.service.getList('crudUsuario').subscribe(data => {
      this.blockUI.stop();
      this.listaUsuarios = data;
      this.dataSourceIntegrantes = new MatTableDataSource(this.listaUsuarios);

      // 1. Crear un nuevo control por cada registro de la tabla y asignarle un correlativo
      for (let i = 0; i < this.dataSourceIntegrantes.data.length; i++) {
        this.formIntegrantes.addControl('cargoC' + i, this.formBuilder.control('', Validators.required));
      }
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });
  }
  /** Verifica Si el número de integrantes seleccionados coincide con el número total de filas. */
  estaSeleccionado() {
    const numSelected = this.selectionI.selected.length;
    let numRows;
    if (this.dataSourceIntegrantes != undefined) {
      numRows = this.dataSourceIntegrantes.data.length;
    }
    return numSelected === numRows;
  }

  /** Selecciona todas las filas si no están todas seleccionadas; de lo contrario borrar la selección. */
  allAny() {
    if (this.estaSeleccionado()) {
      this.selectionI.clear();
      return;
    }

    this.selectionI.select(...this.dataSourceIntegrantes.data);
  }

  /** La etiqueta de la casilla de verificación en la fila aprobada*/
  casillaVerificacionI(row?: any): string {
    if (!row) {
      return `${this.estaSeleccionado() ? 'deselect' : 'select'} all`;
    }
    return `${this.selectionI.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  /**
* Metodo para filtrar 
* @param event --evento a filtrar
*/
  aplicarFiltro(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceIntegrantes.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Metodo para la gestion de un comite de credito
   * @param accion 1 Guardar 2 Actualizar
   */
  crudComite(accion: number) {
    this.blockUI.start('Cargando datos...');
     //limpiar lista
     this.listaComiteCredito = [];
     this.listaSucursalesSelec = [];
     this.listaIntegrantesSelect = [];
     if (this.formComite.invalid) {
      this.validateAllFormFields(this.formComite);
      this.blockUI.stop();
      return;
    }
     //llenar arreglos
     this.listaComiteCredito.push(
       this.comiteID,
       this.formComite.get('clave').value,
       this.formComite.get('comite').value,
       this.formComite.get('estatus').value,
     );
     if (this.selection.selected.length > 0) {
       for (let suc of this.selection.selected) {
         this.listaSucursalesSelec.push(
           suc.sucursalid
         );
       }
     }
     if (this.selectionI.selected.length > 0) {
       for (let usuario of this.selectionI.selected) {
         if (usuario.email.generalesId != undefined) {
           let cargoId = usuario.email.generalesId;
           this.listaIntegrantesSelect.push([usuario.id, cargoId
           ]);
         } else {
           this.service.showNotification('top', 'right', 3, "No se ha seleccionado un cargo.");
           this.blockUI.stop();
           return;
         }
 
       }
     }
     //Procesar datos 
     this.procesarDatos(accion); 
    
  }
  /**
   * Se crean los areglos y matrices de datos del comite a procesar en base de datos
   */
  procesarDatos(accion: number) {
        if (this.listaSucursalesSelec.length == 0) {
      this.service.showNotification('top', 'right', 3, "No se ha seleccionado una sucursal.");
      this.blockUI.stop();
      return;
    }
    if (this.listaIntegrantesSelect.length == 0) {
      this.service.showNotification('top', 'right', 3, "No se ha seleccionado un usuario.");
      this.blockUI.stop();
      return;
    }
    let datosComite = {
      "comite": this.listaComiteCredito,
      "sucursales": this.listaSucursalesSelec,
      "integrantes": this.listaIntegrantesSelect
    }

    this.service.registrarBYID(datosComite, accion, 'crudComite').subscribe(result => {
      if (result[0][0] === '0') {
        //refresca los comites y se limpian las listas y formularios        
        this.limpiarCampos();
        this.spsComite();
        this.service.showNotification('top', 'right', 2, result[0][1]);
      } else {
        this.service.showNotification('top', 'right', 3, result[0][1]);
      }
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
    }
    );
  }
  //Arreglo de mensajes a mostrar al validar formulario
  validacionesComite = {
    'comite': [
      { type: 'required', message: 'El nombre del comite es requerido.' }
    ]
  }
  /**
   * Valida los controles de los cargos
   * @param name control a validar
   * @param error 
   * @returns 
   */

  onCtrlValidate(name: any, error: any): FormControlDirective {
    return <FormControlDirective>this.formIntegrantes.controls[name].errors?.[error]
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
  /**
   * Se vacian los campos y listas 
   */
  limpiarCampos(){
    this.listaComiteCredito = [];
    this.listaSucursalesSelec = [];
    this.listaIntegrantesSelect = [];
    this.comiteID=0;
    this.selection.clear();
    this.selectionI.clear();
    this.formComite.reset();
    this.formComite.get('estatus').setValue(true);
    this.formIntegrantes.reset();
  }
}