import { formatDate } from "@angular/common";
import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'estados-resultados',
    moduleId: module.id,
    templateUrl: './estadosResultados.component.html'
})
export class EstadoResultadosComponent {

    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;

    listaSucursales: any = [];
    sucursalID: any;
    listaAcumulado: any = [];

    formFiltros: UntypedFormGroup;

    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService) {

        this.sucursalID = servicePermisos.sucursalSeleccionada.sucursalid;
        this.spsListaSucursales();
        this.listaAcumulado.push({ id:0,
            descripcion:'Ambos'},{id:1,descripcion:'Mensual'},
            {id:2,descripcion:'Acomulado'});

        this.formFiltros = this.formBuilder.group({
            fecha: new UntypedFormControl('', Validators.required),
            consolidado: new UntypedFormControl(true),
            sucursal: new UntypedFormControl(),
            miles: new UntypedFormControl(true),
            acumulado: new UntypedFormControl(''),
            nota: new UntypedFormControl(true)
        });

        this.formFiltros.get('acumulado').setValue(this.listaAcumulado[0]);

    }

    /**
     *  Metodo que Obtiene las sucursales
     */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;

        this.blockUI.stop();

    }

    /**
     *Metodo que genera el reporte de estado de resultados pdf
     *  */
    spsReporteEstadoResultados() {

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

        let fecha =  formatDate(this.formFiltros.get('fecha').value, 'yyyy-MM-dd', 'en-US');

     
        let path = fecha+'/' + this.formFiltros.get('consolidado').value + '/' +   this.sucursalID +'/'+
            this.formFiltros.get('miles').value + '/' +  this.formFiltros.get('acumulado').value.id + '/' +this.formFiltros.get('nota').value 
          ;

        this.blockUI.start('Generando Reporte...');

        this.service.getListByID(path, 'spsReporteEstadosResultados').subscribe(response => {
            this.blockUI.stop();

            if (response[0] === '0') {
                this.service.showNotification('top', 'right', 2, response[1]);
                const linkSource = 'data:application/pdf;base64,' + response[2] + '\n';
                const downloadLink = document.createElement("a");
                const fileName = 'Estado Resultados' + '.pdf';

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
    * Validaciones de los datos de estados de resultados 
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