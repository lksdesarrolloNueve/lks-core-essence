import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { formatDate } from "@angular/common";

@Component({
    selector: 'report-razones-fin',
    moduleId: module.id,
    templateUrl: 'razones-financieras.component.html'
})
export class ReportrazonesFinComponent implements OnInit {

    //Declaración de variables y componentes
    @BlockUI() blockUI: NgBlockUI;

    // Variables de las sucursales
    sucursalID: any;
    listaSucursales: any = [];
    selectedISucursal: number = 0;
    opcionesSucursales: Observable<string[]>;
    sucursal = new UntypedFormControl('', [Validators.required]);

    //radiobutons
    mostrarSucursal: boolean = false;

    formRazonesFinancieras: UntypedFormGroup;

    /**
     * Constructor de la clase
     * @param service - Service para el acceso a datos
     * @param formBuilder - Gestion de fomularios
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService
    ) {

        this.formRazonesFinancieras = this.formBuilder.group({
            fecha: new UntypedFormControl('', { validators: [Validators.required] }),
            sucursal: new UntypedFormControl(''),
            consolidado: new UntypedFormControl(true),
            miles: new UntypedFormControl(true)

        })
    }

    ngOnInit(): void {
        this.spsObtenerSucursales();
    }

    /**
  * Limpia los campos del form
  */
    limpiarFormGeneral() {
        this.formRazonesFinancieras.reset();
        this.listaSucursales = [];
    }

    /**
   * Obtener sucursales
   */
    spsObtenerSucursales() {

        this.blockUI.start();

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursales = this.formRazonesFinancieras.get('sucursal').valueChanges.pipe(
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
      this.formRazonesFinancieras.get("sucursal").setValue("");
      this.formRazonesFinancieras.get("sucursal").setValidators([]);
      this.formRazonesFinancieras.get("sucursal").updateValueAndValidity();
    }
  }


    /**
     * Método para generar el reporte de Razones Financieras 
     */
    reporteRazonesFinancieras(){

        if (this.formRazonesFinancieras.get('consolidado').value === false) {
            this.formRazonesFinancieras.get('sucursal').setValidators([Validators.required]);
            this.formRazonesFinancieras.get('sucursal').updateValueAndValidity();
        } else {
            this.formRazonesFinancieras.get('sucursal').setValidators([]);
            this.formRazonesFinancieras.get('sucursal').updateValueAndValidity();
        }


        if (this.formRazonesFinancieras.invalid) {
            this.validateAllFormFields(this.formRazonesFinancieras);
            return;
        }

        if (this.formRazonesFinancieras.get('consolidado').value === false) {
            this.sucursalID = this.formRazonesFinancieras.get('sucursal').value.sucursalid;
        } else {
            this.sucursalID = 0;
        }

        let fecha =  formatDate(this.formRazonesFinancieras.get('fecha').value, 'yyyy-MM-dd', 'en-US');

     
        let path = fecha+'/' + this.formRazonesFinancieras.get('consolidado').value + '/' +  this.formRazonesFinancieras.get('miles').value + '/' + this.sucursalID ;

        this.blockUI.start('Generando Reporte...');
        this.service.getListByID(path, 'reporteRazonesFinancieras').subscribe(response => {
            this.blockUI.stop();

            if (response[0] === '0') {
                this.service.showNotification('top', 'right', 2, response[1]);
                const linkSource = 'data:application/pdf;base64,' + response[2] + '\n';
                const downloadLink = document.createElement("a");
                const fileName = 'Razones-Financieras' + '.pdf';

                downloadLink.href = linkSource;
                downloadLink.download = fileName;
                downloadLink.click();

            } else {
                this.service.showNotification('top', 'right', 3, response[1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }

    /**
 * Valida Cada atributo del formulario
 * @param formGroup - Recibe cualquier asigna de FormGroup
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
     * Validaciones de los datos para el Reporte Razones Financoeras
     */
    validaciones = {
        'fecha': [
            { type: 'required', message: 'Campo requerido.'}
        ]
    }
}