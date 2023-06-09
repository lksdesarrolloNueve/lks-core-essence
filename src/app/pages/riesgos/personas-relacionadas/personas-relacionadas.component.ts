import { Component, OnInit } from "@angular/core";
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDatepicker } from "@angular/material/datepicker";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../..//shared/service/gestion";
import { DatePipe } from "@angular/common";


//Constantes//
const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'personas-relacion',
  moduleId: module.id,
  templateUrl: 'personas-relacionadas.component.html',
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ]
})

/**
 * @autor María Guadalupe Santana Olalde
 * @descripcion Componente para la generación del reporte de Personas relacionadas
 * @version 1.0.0
 * @fecha 29/07/2022
 */
export class PersonasRelacionadasComponent implements OnInit {

  date = new UntypedFormControl(moment());

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  //Wait
  @BlockUI() blockUI: NgBlockUI;

  //Declaración de variables y componentes
  accion: number;
  formPersonasRelacionadas: UntypedFormGroup;

  //Lista de las sucursales
  listaSucursales: any[];
  opcionesSucursales: Observable<string[]>;
  selectedISucursal: number = 0;
  sucursal = new UntypedFormControl('', [Validators.required]);


  //radiobutons
  mostrarSucursal: boolean = false;

  /**
* Constructor del componente MovimientosBancariosComponent
* @param service - Service para el acceso a datos
*/
  constructor(private service: GestionGenericaService,
    private formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe) {

    this.formPersonasRelacionadas = this.formBuilder.group({
      sucursal: new UntypedFormControl(''),
      date: new UntypedFormControl(''),
      consolidado: new UntypedFormControl(false)
    })
  }


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
      this.opcionesSucursales = this.formPersonasRelacionadas.get('sucursal').valueChanges.pipe(
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
 * Metodo para filtrar 
 */

  opcionSelectSucursales(event) {
    this.selectedISucursal = event.option.value.nombreSucursal;
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
   * Seleccion radio group
   * @param dato infomarmacion de la opcion seleccionada
   */
  cambioRadio(dato) {
    if (dato.id == 2) {
      this.mostrarSucursal = true;
    } else {
      //se oculata y limpia la caja de texto
      this.mostrarSucursal = false;
      this.sucursal.setValue('');
      this.sucursal.setValidators(null);
      this.sucursal.updateValueAndValidity();
    }

  }
  cambioConsolidado(dato) {
    if (dato.checked) {
      this.formPersonasRelacionadas.get("sucursal").setValue("");
      this.formPersonasRelacionadas.get("sucursal").setValidators([]);
      this.formPersonasRelacionadas.get("sucursal").updateValueAndValidity();
    }
  }

  /**
   * Método para generar el reporte de Financiamiento
   */
  reportePersonasRelacionadas() {

    let sucursalS = " ";
    if (this.formPersonasRelacionadas.get("consolidado").value) {
      this.accion = 1;//Consolidado
    } else {
      //Se valida la sucursal
      this.formPersonasRelacionadas.get("sucursal").setValidators([Validators.required]);
      this.formPersonasRelacionadas.get("sucursal").updateValueAndValidity();
      if (this.formPersonasRelacionadas.get("sucursal").invalid) {

        this.blockUI.stop();
        return;
      }
      sucursalS = this.formPersonasRelacionadas.get('sucursal').value.cveSucursal
      this.accion = 2;//Por sucursal
    }
    this.blockUI.start('Generando Reporte');
    let url = this.datePipe.transform(this.date.value, 'M') + '/' + this.datePipe.transform(this.date.value, 'yyyy') + '/' + sucursalS;
    this.accion;

    this.service.getListByID(url + '/' + this.accion, 'reportePersonasRelacionadas').subscribe(data => {

      this.blockUI.stop();
      if (data[0] === '0') {
        if (data[2] > 0) {
          const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
          const downloadLink = document.createElement("a");
          const fileName = 'Personas-Relacionadas' + '.pdf';

          downloadLink.href = linkSource;
          downloadLink.download = fileName;
          downloadLink.click();
        }else{
          this.service.showNotification('top', 'right', 3, 'No se encontraron datos para el reporte.');
        }
      }
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'rigth', 4, error[1]);
    }); 
  }

  /**
  * Lista de validaciones del formulario PEP
  */
  listaValidaciones = {
    "sucursal": [
      { type: 'required', message: 'Campo requerido.' }
    ],

    "date": [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };

}
