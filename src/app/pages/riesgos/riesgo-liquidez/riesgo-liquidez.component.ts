import { DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import moment from "moment";

@Component({
  selector: 'repor_liqui',
  moduleId: module.id,
  templateUrl: 'riesgo-liquidez.component.html'
})

export class RiesgoLiquidezComponent implements OnInit {

  //Wait
  @BlockUI() blockUI: NgBlockUI;
  //Declaracion de variables

  formRiesgoLiquidez: UntypedFormGroup;

  // Lista de las sucursales
  listaSucursales: any[];
  opcionesSucursales: Observable<string[]>;
  selectedISucursal: number = 0;
  tipoR = new UntypedFormControl('', [Validators.required]);
  //radiobutons
  opciones: any = [{ id: 1, nombre: 'Sucursal' }, { id: 2, nombre: 'Consolidado' }];
  mostrarSucursal: boolean = false;


  constructor(private service:
    GestionGenericaService, private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe
  ) {

    this.formRiesgoLiquidez = this.formBuilder.group({
      fecha: new UntypedFormControl('', { validators: [Validators.required] }),
      sucursal: new UntypedFormControl(''),

    })

  }

  /**
   * metodo OnInit de la clase  RiesgoLiquidezComponent para iniciar los metodos
   */
  ngOnInit(): void {
    this.spsObtenerSucursales();

  }
  /**
   * Obtener sucursales
   */
  spsObtenerSucursales() {

    this.blockUI.start();

    this.service.getListByID(2, 'listaSucursales').subscribe(data => {
      this.listaSucursales = data;
      this.opcionesSucursales = this.formRiesgoLiquidez.get('sucursal').valueChanges.pipe(
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
  * Filtra la categoria de sucursales
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
   * Seleccion radio group
   * @param dato infomarmacion de la opcion seleccionada
   */
  cambioRadio(dato) {

    if (dato.value.id == 1) {
      this.mostrarSucursal = true;
      this.formRiesgoLiquidez.get('sucursal').setValidators([Validators.required]);
      this.formRiesgoLiquidez.get('sucursal').updateValueAndValidity();
    } else {
      //se oculata y limpia la caja de texto
      this.mostrarSucursal = false;
      this.formRiesgoLiquidez.get('sucursal').setValue('');
      this.formRiesgoLiquidez.get('sucursal').setValidators(null);
      this.formRiesgoLiquidez.get('sucursal').updateValueAndValidity();
    }

  }
  /**
  * Metodo para filtrar las sucursal
  */
  opcionSelectSucursales(event) {
    this.selectedISucursal =
      event.option.value.nombreSucursal;
  }

  /**
 * Muestra la descripcion de la sucursal
 * @param option --muestra el nombre de la sucursal seleccionada
 * @returns --nombre de la sucursal
 */

  displayFnSucursal(option: any): any {
    return option ? option.nombreSucursal : undefined;
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
   * Metodo para mostrar los mensajes de validaciones 
   */
  validaciones = {
    'fecha': [{ type: 'required', message: 'Campo requerido.' }],
    'sucursal': [{ type: 'required', message: 'Campo requerido.' }],
    'rbtmConsolidado': [{ type: 'required', message: 'Campo requerido.' }],
    'tipoR': [{ type: 'required', message: 'Campo requerido' }]
  }

  /**
   * Metodo que valida si va vacio.
   * @param value 
   * @returns 
   */
  vacio(value) {
    return (!value || value == undefined || value == null || value == "" || value.length == 0);
  }

  /**
    * Metodo para generar el reporte de liquidez
    */
  spsReporteLiquidez() {

    if (this.tipoR.invalid) {
      if (this.tipoR instanceof UntypedFormControl) {
        this.tipoR.markAsTouched({ onlySelf: true });
      }
      this.service.showNotification('top', 'right', 3, "Seleciona tipo de reporte");
      this.blockUI.stop();
      return;
    }


    if (this.formRiesgoLiquidez.invalid) {
      this.validateAllFormFields(this.formRiesgoLiquidez);
      return;
    }

    this.blockUI.start('Cargando datos...');

    let fecha = moment(this.formRiesgoLiquidez.get('fecha').value).format("YYYY-MM-DD");
    let sucursal = 0;
    if (this.mostrarSucursal) {

      sucursal = this.formRiesgoLiquidez.get('sucursal').value.sucursalid;
    }

    let path = fecha + '/' + sucursal;
    this.service.getListByID(path, 'spsReporteLiquidez').subscribe(data => {

      if (data[0] == '0') {
        this.service.showNotification('top', 'right', 2, data[1]);
        const linkSource = 'data:application/pdf;base64,' + data[2] + '\n';
        const downloadLink = document.createElement("a");
        const fileName = 'Reporte de Liquidez' + '.pdf';

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
      } else {
        this.service.showNotification('top', 'right', 3, "Se genero correctamente...");
      }

      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    }
    );
  }
}