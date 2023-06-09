import { Component } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { formatDate } from "@angular/common";
import { TableUtil } from "../../../../../shared/Util/tableUtil";
import { map, startWith } from "rxjs/operators";
import { Observable } from "rxjs";


@Component({
    selector: 'balance',
    moduleId: module.id,
    templateUrl: './balance.component.html'
})
export class BalanceComponent {

    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;

    listaSucursales: any = [];
    opcionesSucursales: Observable<string[]>;
    sucursalID: any;

    formFiltros: UntypedFormGroup;

    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService) {

        this.sucursalID = servicePermisos.sucursalSeleccionada.sucursalid;
       

        this.formFiltros = this.formBuilder.group({
            fecha: new UntypedFormControl('', Validators.required),
            sucursal: new UntypedFormControl(''),
            consolidado: new UntypedFormControl(true),
            miles: new UntypedFormControl(true),
            csv: new UntypedFormControl(false),
            nota: new UntypedFormControl(true)
        });

        this.spsListaSucursales();

    }


    /**
     * Obtener sucursales
     */
     spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.opcionesSucursales = this.formFiltros.get('sucursal').valueChanges.pipe(
            startWith(''),
            map(value => this._filterSucursales(value))
        );

        this.blockUI.stop();
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
   * Muestra la descripcion de la sucursal
   * @param option --muestra el nombre de la sucursal seleccionada
   * @returns --nombre de la sucursal
   */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    /**
     *Metodo que genera el balance pdf
     *  */
    spsGeneraBalance() {


        if (this.formFiltros.get('consolidado').value === false) {
            this.formFiltros.get('sucursal').setValidators([this.autocompleteObjectValidator(), Validators.required] );
            this.formFiltros.get('sucursal').updateValueAndValidity();
        } else {
            this.formFiltros.get('sucursal').setValidators([]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        }


        if (this.formFiltros.invalid) {
            this.validateAllFormFields(this.formFiltros);
            return;
        }

        if (this.formFiltros.get('consolidado').value === false) {
            this.sucursalID = this.formFiltros.get('sucursal').value.sucursalid;
        } else {
            this.sucursalID = this.servicePermisos.sucursalSeleccionada.sucursalid;
        }

        let fecha = formatDate(this.formFiltros.get('fecha').value, 'yyyy-MM-dd', 'en-US');


        let path = fecha + '/' + this.formFiltros.get('consolidado').value + '/' +
            this.formFiltros.get('miles').value + '/' + this.formFiltros.get('nota').value + '/' +
            this.sucursalID;

        this.blockUI.start('Generando Reporte...');

        if (this.formFiltros.get('csv').value === false) {

            this.service.getListByID(path, 'spsReporteBalance').subscribe(response => {
                this.blockUI.stop();

                if (response[0] === '0') {
                    this.service.showNotification('top', 'right', 2, response[1]);
                    const linkSource = 'data:application/pdf;base64,' + response[2] + '\n';
                    const downloadLink = document.createElement("a");
                    const fileName = 'Balance' + '.pdf';

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

        } else {

            this.service.getListByID(path, 'spsReporteBalanceCSV').subscribe(csvResponse => {
                this.blockUI.stop();
           
                csvResponse.sort((a, b) => (a.numero < b.numero) ? -1 : 1);
                
                if(csvResponse.length > 0) {
                    TableUtil.exportArrayToExcel(csvResponse,'Balance')
                }else{
                    this.service.showNotification('top', 'right', 3, 'No se encontraron datos.');
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });

        }


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
    * Valida que el texto ingresado pertenezca a un subramas
    * @returns mensaje de error.
    */
     autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null;
        }

    }

    /**
    * Validaciones de los datos de movimientos de polizas
    */
    validaciones = {
        'sucursal': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no existe.' }
        ],
        'fecha': [
            { type: 'required', message: 'Fecha requerida.' }
        ]
    }



}