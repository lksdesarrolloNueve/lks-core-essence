import { Component } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import * as XLSX from 'xlsx';
import { BlockUI, NgBlockUI } from "ng-block-ui";


/**
 * @autor: María Inés Barrón Agreda
 * @version: 1.0.0
 * @fecha: 02/03/2022
 * @descripcion: Componente para la inserción masiva de dias inhabiles
 */

@Component({
    selector: 'm-cm-dias',
    moduleId: module.id,
    templateUrl: 'm-cm-dias.component.html'
})

export class MCargaDias {
    /*
    *Variable de la matriz que muestra los datos del arreglo en filas del archivo dias inhabiles
    */
    datos: any = [];

    listaErrores: any = [];

    @BlockUI() blockUI: NgBlockUI;

    //Declaracion de variables y Componentes
    formCarga: UntypedFormGroup;

    /*
     * Constructor del componente dia inhabil
     * @param data -- Componente para crear diálogos modales en Angular Material 
     * @param service  -- Instancia de acceso a datos
     */

    constructor(private formBuilder: UntypedFormBuilder, private service: GestionGenericaService) {

        this.formCarga = this.formBuilder.group({
            archivo: new UntypedFormControl('', Validators.required)
        });
    }

    /*
    *Metodo para aplicar la carga masiva de Días Inhabiles
    */
    aplicarCargaMasiva() {

    }

    /*
    *Metodo que procesa la informacion del archivo .xlsx, .csv y .txt para Días inhabiles
    */
    cargaArchivo(evt: any) {
        const target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellNF: false, cellText: false });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            this.datos = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'DD-MM-YYYY' });
        };

        reader.readAsBinaryString(target.files[0]);
    }

    /**
     * Metodo para procesar la carga masiva de días inhabiles
     */
    procesarCargaDias() {
        this.listaErrores = [];

        let i = 0;

        for (let dia of this.datos) {

            if (dia.length < 5) {
                let fila = i + 2;
                this.listaErrores.push([fila, "La fila no contiene el total de columnas requeridas."]);
            } else {

                let fecha = dia[0];
                const [d, m, y] = fecha.split('/');
                const fechaConversion = new Date(`${y}/${m}/${d}`);

                if (fechaConversion.toString() === "Invalid Date") {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna FECHA no contiene el Formmato dd/mm/yyyy."]);

                }

                if (dia[2].toUpperCase().trim() !== 'SI' && dia[2].toUpperCase().trim() !== 'NO') {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Aplica Inversion no contiene SI/NO."]);

                }


                if (dia[3].toUpperCase().trim() !== 'SI' && dia[3].toUpperCase().trim() !== 'NO') {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Aplica Credito no contiene SI/NO."]);

                }


                if (dia[4].toUpperCase().trim() !== 'SI' && dia[4].toUpperCase().trim() !== 'NO') {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Estatus no contiene SI/NO."]);

                }
            }

            i++;

        }

        if (this.listaErrores.length > 0) {
            this.service.showNotification('top', 'right', 3, 'Se encontraron errores en Archivo.')
            return;
        }

        this.blockUI.start('Procesando petición...');

        let json = {
            diasInhabiles: this.datos
        }

        this.service.registrar(json, 'cargaDias').subscribe(result => {
            this.blockUI.stop();
            if (result[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, result[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1])
            }


        }, error => {
            this.blockUI.stop();
        });

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

}