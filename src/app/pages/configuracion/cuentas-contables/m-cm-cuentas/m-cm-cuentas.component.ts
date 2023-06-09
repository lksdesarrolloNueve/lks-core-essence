import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import * as XLSX from 'xlsx';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";

/**
 * @autor: María Inés Barrón Agreda
 * @version: 1.0.0
 * @fecha: 07/03/2022
 * @descripcion: Componente para la inserción masiva de Cuentas Contables
 */

@Component({
    selector: 'm-cm-cuentas',
    moduleId: module.id,
    templateUrl: 'm-cm-cuentas.component.html'
})

export class MCargaCuentas {

    /*
      *Variable de la matriz que muestra los datos del arreglo en filas del archivo Cuentas Contables
      */
    datos: any = [];
    listaActualizar: any = [];

    listaTipoCuenta: any = [];
    listaRubro: any = [];
    listaNaturaleza: any = [];
    listaCuentasAnexo: any = [];
    listaMonedas: any = [];
    listaCuentasContables: any = [];

    listaErrores: any = [];

    @BlockUI() blockUI: NgBlockUI;

    //Declaracion de variables y Componentes
    formCarga: UntypedFormGroup;

    /**
        * Constructor del componente cuentas contables
        * @param data -- Componente para crear diálogos modales en Angular Material 
        * @param service  -- Instancia de acceso a datos
        */

    constructor(private formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService,public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.listaTipoCuenta = data.listaTipoCuenta;

        this.listaNaturaleza = data.listaNaturaleza;

        this.listaRubro = data.listaRubro;

        this.listaCuentasAnexo = data.listaCuentasAnexo;
       

        this.listaMonedas = data.listaMonedas;

        this.listaCuentasContables = data.listaCuentasContables;
        this.formCarga = this.formBuilder.group({
            archivo: new UntypedFormControl('', Validators.required),
            actualizar: new UntypedFormControl('', Validators.required)
        });
    }

    /*
    *Metodo que procesa la informacion del archivo .xlsx, .csv y .txt para Cuentas Contables
    */
    cargaArchivo(evt: any) {
        const target: DataTransfer = <DataTransfer>(evt.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellDates: true, cellNF: false, cellText: true });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            this.datos = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'DD-MM-YYYY' });
            this.datos.splice(0, 1)
        };
        reader.readAsBinaryString(target.files[0]);
    }

    /**
    * Metodo para procesar la carga masiva de cuentas contables
    */
    procesarCargaCuentas() {

     

        this.listaErrores = [];
        this.listaActualizar = []

        let i = 0;

        /*
        *Metodo que valida el numero de columnas del archivo carga masiva de cuentas contables
        */
        for (let cuenta of this.datos) {

            if (cuenta.length < 11) {
                let fila = i + 2;
                this.listaErrores.push([fila, "La fila no contiene el total de columnas requeridas."]);
            } else {

                /*
                *Metodo que valida la existencia de la cuenta del archivo carga masiva de cuentas contables
                 */
                let existeCuenta = this.listaCuentasContables.findIndex(c => c.cuenta === cuenta[0]);
                if (existeCuenta !== -1) {
                    this.listaActualizar.push(cuenta);
                    let indexExiste = this.datos.findIndex(i => i[0] === cuenta[0]);
                    this.datos.splice(indexExiste, 1);
                }

                /*
                *Metodo que valida la existencia de tipo de cuenta del archivo carga masiva de cuentas contables
                */
                let existeTipo = this.listaTipoCuenta.find(t => t.cveTipo === cuenta[3]);
                if (existeTipo === undefined) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Tipo Cuenta no contiene tipo de cuenta valido o esta inactivo."]);
                }

                /*
               *Metodo que valida la existencia de naturaleza de la cuenta del archivo carga masiva de cuentas contables
               */

                let existeNaturaleza = this.listaNaturaleza.find(n => n.cveNaturaleza === cuenta[4]);
                if (existeNaturaleza === undefined) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Naturaleza Cuenta no contiene Naturaleza de cuenta valido o esta inactivo."]);
                }

                /*
               *Metodo que valida la existencia de lista de rubro de la cuenta del archivo carga masiva de cuentas contables
               */
                let existeRubro = this.listaRubro.find(r => r.cveRubro === cuenta[5]);
                if (existeRubro === undefined) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Rubro Cuenta no contiene Rubro de cuenta valido o esta inactivo."]);
                }

                /*
               *Metodo que valida la existencia de cuenta anexo de la cuenta del archivo carga masiva de cuentas contables
               */

                if (!this.vacio(cuenta[6])) {
                    let existeAnexo = this.listaCuentasAnexo.find(a => a.codAgrupador === cuenta[6]);
                    if (existeAnexo === undefined) {
                        let fila = i + 2;
                        this.listaErrores.push([fila, "La columna cuenta anexo no contiene anexo de cuenta valido."]);
                    }
                }

                /*
               *Metodo que valida la existencia de monedas sat de la cuenta del archivo carga masiva de cuentas contables
               */
                let existeMonedas = this.listaMonedas.find(s => s.cveMonedaSat === cuenta[10]);
                if (existeMonedas === undefined) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna monedas sat no contiene el tipo de moneda valido o esta inactivo."]);
                }

                /*
               *Metodo que valida si estatus contiene el formato de si /no  de la cuenta del archivo carga masiva de cuentas contables
               */
                if (cuenta[11].toUpperCase().trim() !== 'SI' && cuenta[11].toUpperCase().trim() !== 'NO') {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna estatus no contiene SI/NO."]);
                }
            }
            i++;
        }
        
       
        if (this.listaErrores.length > 0) {
            this.service.showNotification('top', 'right', 3, 'Se encontraron errores en Archivo.')
            return;
        }

        /*
        *Metodo que valida que exista un archivo para procesar o actualizar
        */
        if (this.datos.length == 0 && this.listaActualizar.length == 0) {
            this.service.showNotification('top', 'right', 3, 'Debes seleccionar un archivo.');
            return;
        }

          /*
        *Metodo que valida que exista un archivo para actualizar
        */
        if (this.formCarga.get('actualizar').value === ''){
            this.service.showNotification('top', 'right', 3, 'Debes seleccionar la opción Actualizar/Omitir.');
            return;
         }

       /*
        *Metodo quen inserta los datos de carga masiva de cuentas contables
        */
        if (this.datos.length > 0) {
            this.crudCuentasContables(this.datos, 1);
        }

         /*
        *Metodo quen actualiza los datos de carga masiva de cuentas contables
        */
        if (this.listaActualizar.length > 0 && this.formCarga.get('actualizar').value === 0){
            this.crudCuentasContables(this.listaActualizar, 2);
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

    /**
     * Metodo que procesara cualquier tipo de lista
     * @param vLista - lista a procesar
     * @param vAccion - Accion a realiar
     */
    crudCuentasContables(vLista, vAccion) {
        this.blockUI.start('Procesando petición...');
        let json = {
            cuentasContables: vLista, accion: vAccion
        }
        this.service.registrar(json, 'cargaCuentas').subscribe(result => {
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
 * Metodo que valida si va vacio.
 * @param value 
 * @returns 
 */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}