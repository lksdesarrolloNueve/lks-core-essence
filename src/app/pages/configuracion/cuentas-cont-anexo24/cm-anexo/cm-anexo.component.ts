import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import * as XLSX from 'xlsx';
import { BlockUI, NgBlockUI } from "ng-block-ui";

@Component({
    selector: 'cm-anexo',
    moduleId: module.id,
    templateUrl: 'cm-anexo.component.html'
})
export class CMAnexoComponent {

    //Declaracion de variables y Componentes
    formCarga: UntypedFormGroup;

    datos: any = [];

    listaCuentasAnexo: any = [];
    listaActualizar: any = [];
    listaInsertar: any = [];
    listaErrores: any = [];

    @BlockUI() blockUI: NgBlockUI;


    /**
    * Constructor del componente cuentas contables
    * @param data -- Componente para crear diálogos modales en Angular Material 
    * @param service  -- Instancia de acceso a datos
    */
    constructor(private formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.listaCuentasAnexo = data.listaCuentasAnexo;

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
            this.datos.splice(0, 1);
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
        this.datos.forEach(cuenta => {


            if (cuenta.length < 5) {
                let fila = i + 2;
                this.listaErrores.push([fila, "La fila no contiene el total de columnas requeridas."]);
            } else {


                if (this.vacio(cuenta[0])) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Cuenta esta vacia."]);
                }


                if (this.vacio(cuenta[2])) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Nombre esta vacia."]);
                }

                if (this.vacio(cuenta[3])) {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna Nivel esta vacia."]);
                }

                /*
                *Metodo que valida si estatus contiene el formato de si /no  de la cuenta del archivo carga masiva de cuentas contables
                */
                if (cuenta[4].toUpperCase().trim() !== 'SI' && cuenta[4].toUpperCase().trim() !== 'NO') {
                    let fila = i + 2;
                    this.listaErrores.push([fila, "La columna estatus no contiene SI/NO."]);
                }

                /*
                *Metodo que valida la existencia de la cuenta del archivo carga masiva de cuentas contables
                */
                let existeCuenta = this.listaCuentasAnexo.findIndex(c => c.codAgrupador === cuenta[0]);
                if (existeCuenta !== -1) {
                    this.listaActualizar.push(cuenta);
                }else{
                    this.listaInsertar.push(cuenta);
                }

            }

            i++;


        });




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
        if (this.formCarga.get('actualizar').value === '') {
            this.service.showNotification('top', 'right', 3, 'Debes seleccionar la opción Actualizar/Omitir.');
            return;
        }


        /*
        *Metodo quen inserta los datos de carga masiva de cuentas contables
        */
        if (this.listaInsertar.length > 0) {
            this.crudCuentasContables(this.listaInsertar, 1);
        }

        /*
        *Metodo quen actualiza los datos de carga masiva de cuentas contables
        */
        if (this.listaActualizar.length > 0 && this.formCarga.get('actualizar').value === "0") {

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
        this.service.registrar(json, 'cargaAnexo24').subscribe(result => {
            this.blockUI.stop();
            if (result[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, result[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1])
            }
        }, error => {
            this.service.showNotification('top', 'right', 4, error.Message);
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