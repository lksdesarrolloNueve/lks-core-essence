import { Component, Inject } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GestionGenericaService } from '../../../../shared/service/gestion';


@Component({
    selector: 'modal-fraccion-param',
    moduleId: module.id,
    templateUrl: 'modal-fraccion-param.component.html'
})

export class ModalFraccionParametros {
    /**Declaración de variable y componentes */

    @BlockUI() blockUI: NgBlockUI;
    encabezado: string = '';

    cuentaPrincipal = new UntypedFormControl('', [Validators.required]);
    cuentaGrupal = new UntypedFormControl('', [Validators.required]);
    listaCuentaP: any = [];
    opcionesCuentaP: Observable<string[]>;
    opcionesCuentaG: Observable<string[]>;
    descripcion = new UntypedFormControl();
    fraccParmID: number = 0;


    /**
    * Constructor del componente Fraccion prametros
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    * @param service -- Instancia de acceso a datos
    */
    constructor(private service: GestionGenericaService, @Inject(MAT_DIALOG_DATA) public datos: any, public dialogo: MatDialogRef<ModalFraccionParametros>) {
        this.encabezado = datos.titulo;
        if (datos.accion != 1) {
            this.fraccParmID = this.datos.param.fracc_param_id;
        }
    }
    /**Inicializacion de componentes */
    ngOnInit() {
        this.spsCuentaPrincipal();
    }
    /**
* Listar cuentas contables 
*/
    spsCuentaPrincipal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
           
                this.listaCuentaP = data;

                this.opcionesCuentaP = this.cuentaPrincipal.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filter(value))
                );
                this.opcionesCuentaG = this.cuentaGrupal.valueChanges.pipe(
                    startWith(''),
                    map(value => this.filterG(value))
                );
                if (this.fraccParmID > 0) {
                    //editar
                    let principal = this.listaCuentaP.find(t => t.cuentaid === this.datos.param.cuenta_principal_id);
                    this.cuentaPrincipal.setValue(principal);
                    let grupal = this.listaCuentaP.find(t => t.cuentaid === this.datos.param.cuenta_grupo_id);
                    this.cuentaGrupal.setValue(grupal);
                    this.descripcion.setValue(this.datos.param.descripcion);
                
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
* Filtra la cuenta contable
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private _filter(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentaP.filter(option => option.cuenta.toLowerCase().includes(filterValue) || option.nombre.toLowerCase().includes(filterValue));
    }
    /**
  * Muestra la descripcion de la cuenta
  * @param option -- cuenta
  * @returns --nombre de la cuenta
  */
    mostrarCuenta(option: any): any {
        return option ? option.cuenta : undefined;
    }
    /**
* Filtra la categoria de cuenta grupal
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private filterG(value: any): any {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentaP.filter(option => option.cuenta.toLowerCase().includes(filterValue)|| option.nombre.toLowerCase().includes(filterValue));
    }
    /**
   * Muestra la descripcion de la ceunta
   * @param option --cuenta seleccionada
   * @returns --nombre de la cuenta
   */
    mostrarCuentaGrup(option: any): any {
        return option ? option.cuenta : undefined;
    }

    /**
     * CRUD fraccion parametros
     */
    crudFraccParam(accion) {
        if (this.cuentaPrincipal.invalid) {
            if (this.cuentaPrincipal instanceof UntypedFormControl) {
                this.cuentaPrincipal.markAsTouched({ onlySelf: true });
            }
            return this.service.showNotification('top', 'right', 3, 'Selecciona la cuenta principal.');
        }
        if (this.cuentaGrupal.invalid) {
            if (this.cuentaGrupal instanceof UntypedFormControl) {
                this.cuentaGrupal.markAsTouched({ onlySelf: true });
            }
            return this.service.showNotification('top', 'right', 3, 'Selecciona la cuenta grupal.');
        }
        let data = {
            datos: [this.fraccParmID, this.cuentaPrincipal.value.cuentaid,
            this.cuentaGrupal.value.cuentaid, this.descripcion.value
            ],
            accion: accion
        }
     
        this.service.registrar(data, 'crudFraccParametros').subscribe(crudF => {
            if (crudF[0][0] === '0') {//exito
                this.service.showNotification('top', 'right', 2, crudF[0][1]);
            } else {//error 
                this.service.showNotification('top', 'right', 3, crudF[0][1]);
            }
            //limpiar campos
            this.fraccParmID = 0;
            this.cuentaPrincipal.setValue('');
            this.cuentaGrupal.setValue('');
            this.descripcion.setValue('');
            this.blockUI.stop();
            this.dialogo.close();
           
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
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
    /**
    * Mensaje de validaciones
    */
     validaciones = {
        'cuentaPrincipal': [
            { type: 'required', message: 'Cuenta requerida.' }
        ],
        'cuentaGrupal': [
            { type: 'required', message: 'Cuenta requerida.' }
        ]
    }
}