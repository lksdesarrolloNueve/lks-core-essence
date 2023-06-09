import { Component } from "@angular/core";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { DatePipe, formatDate } from "@angular/common";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import * as moment from "moment";
import { PermisosService } from "../../../../../shared/service/permisos.service";

@Component({
    selector: 'origen-aplicacion',
    moduleId: module.id,
    templateUrl: './origen-aplicacion.component.html'
})
export class OrigenAplicacionComponent {
    //Declaracion de Variables y Componentes
    @BlockUI() blockUI: NgBlockUI;

    listaSucursales: any = [];
    sucursalID: any;

    formFiltros: UntypedFormGroup;

    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService) {

        this.sucursalID = servicePermisos.sucursalSeleccionada.sucursalid;
        this.spsListaSucursales();

        this.formFiltros = this.formBuilder.group({
            fecha: new UntypedFormControl('', Validators.required),
            sucursal: new UntypedFormControl(),
            consolidado: new UntypedFormControl(true),
            miles: new UntypedFormControl(true),
            nota: new UntypedFormControl(true)
        });

    }

    /**
     * Obtener sucursales alas que pertenece el usuario
     */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.blockUI.stop();

    }

    /**
     *Metodo que genera el reporte origen aplicacion pdf
     *  */
    spsGeneraReporte() {
        //Validaciones
        if (this.formFiltros.get('consolidado').value === false) {
            this.formFiltros.get('sucursal').setValidators([Validators.required]);
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
            this.formFiltros.get('miles').value + '/' + this.sucursalID + '/' + this.formFiltros.get('nota').value;

        this.blockUI.start('Generando Reporte...');

        this.service.getListByID(path, 'reporteOrigAplicacion').subscribe(response => {
            this.blockUI.stop();

            if (response[0] === '0') {
                this.service.showNotification('top', 'right', 2, response[1]);
                const linkSource = 'data:application/pdf;base64,' + response[2] + '\n';
                const downloadLink = document.createElement("a");
                const fileName = 'OrigenAplicacion' + '.pdf';

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
    * Validaciones de los datos de movimientos de polizas
    */
    validaciones = {
        'sucursal': [
            { type: 'required', message: 'Sucursal requerida.' }
        ],
        'fecha': [
            { type: 'required', message: 'Fecha requerida.' }
        ]
    }

}
