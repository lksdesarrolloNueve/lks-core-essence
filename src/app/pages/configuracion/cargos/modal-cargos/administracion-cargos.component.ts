import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { map, startWith } from "rxjs/operators";
import { environment } from "../../../../../environments/environment";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { Observable } from "rxjs";


/**
* @autor: Luis Rolando Guerrero Calzada
* @version: 1.0.0
* @fecha: 06/10/2021
* @descripcion: Componente para la gestion de isr
*/
@Component({
    selector: 'administracion-cargos',
    moduleId: module.id,
    templateUrl: 'administracion-cargos.component.html'
})

export class AdministracionCargosComponent implements OnInit {

    //Declaracion de variables y constantes
    titulo: string;
    accion: number;
    formCargos: UntypedFormGroup;
    cargoID: number = 0;
    @BlockUI() blockUI: NgBlockUI;
    listaCargosAgregado = [];
    esEditar = false;
    claveAntigua = "";

    //Lista de los cargos 
    listCargos: any[];
    descCargo: string = '';
    opcionesCargos:Observable<string[]>;

    //validacion de campos
    validaciones = {
        'fraccEnteId': [

        ],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 254.' },
        ],
        'cvefracc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 4.' },
        ],
        'cve_fracc_cargo':[
            { type: 'maxlength', message: 'Campo maximo 4.' },
        ],
        'descripcionC':[
            { type: 'maxlength', message: 'Campo maximo 254.' },
        ]
    }

    /**
    * constructor de la clase ISR
    * @param service - service para el acceso de datos
    */
    constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.titulo = data.titulo + "Ente / Cargos";
        this.accion = data.accion;

        this.formCargos = this.formbuilder.group({
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(254)]),
            cvefracc: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            estatus: new UntypedFormControl(true),
            clave_siti: new UntypedFormControl({ value: '1', disabled: true }),

            cve_fracc_cargo: new UntypedFormControl('', Validators.maxLength(4)),
            descripcionC: new UntypedFormControl('', Validators.maxLength(254)),
            estatusC: new UntypedFormControl(true)
        });

        if (this.accion === 2) {

            this.cargoID = data.cargos.fraccEnteId
            this.formCargos.get('descripcion').setValue(data.cargos.descripcion)
            this.formCargos.get('cvefracc').setValue(data.cargos.cvefracc)
            this.formCargos.get('estatus').setValue(data.cargos.estatus)
            this.formCargos.get('clave_siti').setValue(data.cargos.clavesiti)

            let listaCargosJson = JSON.parse(data.cargos.cargo)

             listaCargosJson.forEach(result => {
                let objeto = {
                    clave: result.cve_fracc_cargo,
                    descripcion: result.descripcion,
                    estatus: result.estatus
                }
                this.listaCargosAgregado.push(objeto)
             });

        }
    }


    ngOnInit() { 
        this.listaCargos();
    }

    /**
     * Metodo que guarda y edita ISR
     * 
     */
    crudCargos(form: any) {
        if (this.formCargos.invalid) {
            this.validateAllFormFields(this.formCargos);
            return;
        }
        let cargoArreglo = ""
        this.listaCargosAgregado.forEach(resultado => {

            if (cargoArreglo === "") {
                cargoArreglo = "{" + resultado.clave + "," + resultado.descripcion + "," + resultado.estatus + "}"
            } else {
                cargoArreglo = cargoArreglo + "," + "{" + resultado.clave + "," + resultado.descripcion + "," + resultado.estatus + "}"
            }
        })

        if (cargoArreglo === "") {
            cargoArreglo = "{{" + 0 + "}}"
        } else {
            cargoArreglo = "{" + cargoArreglo + "}"
        }

        const data = {
            fraccEnteId: this.cargoID,
            descripcion: form.descripcion,
            cvefracc: form.cvefracc,
            estatus: form.estatus,
            cargo: cargoArreglo
        }

        if (this.accion === 2) {
            this.blockUI.start('Editando ...')
        } else {
            this.blockUI.start('Guardando ...')
        }

        this.service.registrarBYID(data, this.accion, 'crudCargos')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (this.accion !== 2) {
                        this.formCargos.reset();
                        this.listaCargosAgregado = []
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            })
    }

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);             //{3}
            if (control instanceof UntypedFormControl) {             //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
            }
        });
    }


    agregarRegistro() {
        if (this.esEditar === false) {
            let clave = this.formCargos.get('cve_fracc_cargo').value
            let descripcion = this.formCargos.get('descripcionC').value.descripcion;

            let estatus = this.formCargos.get('estatusC').value
            if (clave !== "" && descripcion !== "") {
                let objeto = {
                    clave: clave,
                    descripcion: descripcion,
                    estatus: estatus
                }
                let existeClave = this.listaCargosAgregado.find(resultado => { return resultado.clave === clave })
                let existeDescripcion = this.listaCargosAgregado.find(resultado => { return resultado.descripcion === descripcion })

                if ((existeClave !== undefined) && (existeDescripcion !== undefined)) {
                    this.service.showNotification('top', 'right', 4, "Ya existe un registro con la misma clave y descripción")
                    this.formCargos.get('cve_fracc_cargo').setValue('')
                    this.formCargos.get('descripcionC').setValue('')
                    this.formCargos.get('estatusC').setValue(false)
                    return
                } else {
                    if (existeClave !== undefined) {
                        this.service.showNotification('top', 'right', 4, "Ya existe un registro con la misma clave")
                        this.formCargos.get('cve_fracc_cargo').setValue('')
                        this.formCargos.get('descripcionC').setValue('')
                        this.formCargos.get('estatusC').setValue(false)
                        return
                    } else {
                        if (existeDescripcion !== undefined) {
                            this.service.showNotification('top', 'right', 4, "Ya existe un registro con la misma descripción")
                            this.formCargos.get('cve_fracc_cargo').setValue('')
                            this.formCargos.get('descripcionC').setValue('')
                            this.formCargos.get('estatusC').setValue(false)
                            return
                        }
                    }
                }
                this.formCargos.get('cve_fracc_cargo').setValue('')
                this.formCargos.get('descripcionC').setValue('')
                this.formCargos.get('estatusC').setValue(false)
                this.listaCargosAgregado.push(objeto)
            } else {
                this.service.showNotification('top', 'right', 4, "Los campos descripción y clave del cargo, no pueden ir vacios")
            }
        } else {
            let clave = this.formCargos.get('cve_fracc_cargo').value
            let descripcion = this.formCargos.get('descripcionC').value
            let estatus = this.formCargos.get('estatusC').value
            this.listaCargosAgregado.forEach(resultado => {
                if (resultado.clave === this.claveAntigua) {
                    resultado.clave = clave
                    resultado.descripcion = descripcion
                    resultado.estatus = estatus
                }
            })
            this.service.showNotification('top', 'right', 2, "Cargo Actualizado...")

            this.esEditar = false
        }
    }

    registroSeleccionado(seleccionado) {
        this.formCargos.get('cve_fracc_cargo').setValue(seleccionado.clave)
        this.formCargos.get('descripcionC').setValue(seleccionado.descripcion)
        this.formCargos.get('estatusC').setValue(seleccionado.estatus)
        this.esEditar = true
        this.claveAntigua = seleccionado.clave
    }

    /**
     * Método para listar los yipos de cargos
     */
    listaCargos(){
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catCargoComite, 'listaGeneralCategoria').subscribe(data => {
            this.listCargos = data;
            this.opcionesCargos = this.formCargos.get('descripcionC').valueChanges.pipe(
              startWith(''),
              map(value => this.filtroCargo(value))
            );
            this.blockUI.stop();
          }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
          }
          );

        }
        private filtroCargo(value: string): any {
          const filterValue = value;
      
          return this.listCargos.filter(data => data.descripcion.toLowerCase().includes(filterValue));
        }
      
        displayFn(cargo: any): string {
          return cargo && cargo.descripcion ? cargo.descripcion : '';
    }

     /**
   * Método para generar pdf según el tipo de reporte seleccionado
   * @param opcion 
   */
  opcionCargos(opcion) {
    this.descCargo = opcion.option.value.cveGeneral;
  }
}