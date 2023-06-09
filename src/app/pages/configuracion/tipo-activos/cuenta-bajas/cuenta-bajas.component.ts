import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { ModalCuentaActivoBajaComponent } from "./modal-cuenta/modal-cuenta-baja.component";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { UntypedFormControl, Validators } from "@angular/forms";
import Swal from 'sweetalert2';

@Component({
    selector: 'cuenta-bajas',
    moduleId: module.id,
    templateUrl: 'cuenta-bajas.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 21/12/2022
 * @descripcion: Componente para la gestion de cuentas activos bajas
 */
export class CuentasBajasComponent {

    //Declaración de las variables globales 
    listaTipoCuentaBaja: any = [];
    displayedColumna: string[] = ['activo', 'cuenta', 'sucursal', 'acciones'];
    dataSource: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    tActivo = new UntypedFormControl('',Validators.required);
    listaTipoAct: any = [];
    opcionesTipoAct: Observable<string[]>;
    /**
 * Constructor de la clase ParametrosComponent
 * @param service -Instancia de acceso a datos
 * @param dialog - Instancia de acceso a dialogos
 */
    constructor(private service: GestionGenericaService,
        public dialog: MatDialog, private permisosService: PermisosService) {
     this.spsTipoActivos();
    }
    /**
     * Método que en lista todos los tipos de bajas para activos
     * accion 1 muestra todos las bajas
     */
    spsTipoCuentaBaja() {
        if(this.tActivo.invalid){
            this.tActivo.markAsTouched({ onlySelf: true });
            return;
        }
        let path = this.permisosService.sucursalSeleccionada.sucursalid + '/'+this.tActivo.value.tipo_activo_id;
        this.service.getListByID(path, 'spsTipoCuentaBaja').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoCuentaBaja = JSON.parse(data);
            }
            this.dataSource = new MatTableDataSource(this.listaTipoCuentaBaja);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
        }

        );

    }

    /**
     * Método que filtra la tabla 
     * @param event- dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
      /**
   * Método que en lista todos los tipos de activos
   * accion 1 muestra todos los activos
   */
       spsTipoActivos() {
        this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoAct = JSON.parse(data);
                // Se setean las cuentas para el autocomplete
      this.opcionesTipoAct = this.tActivo.valueChanges.pipe(
        startWith(''),
        map(value => this._filterTipoAct(value)));
            }
           
        }

        );

    }
    private _filterTipoAct(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
          value = '';
        }
        if (!value[0]) {
          filterValue = value;
        } else {
          filterValue = value.toLowerCase();
        }
        return this.listaTipoAct.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
      }
    
      displayActivo(option: any): any {
        return option ? option.nombre.trim() : undefined;
    
      }
    /**
    * Método que abre una ventana modal para la gestión de tipo de baja de activos
    * @param accion - 1.-Registrar, 2.-Editar
    * @param elemento - Elemento a editar 
    */
    abrirDialogo(accion: any, elemento: any) {

        let titulo = 'Registrar Cuenta Baja';
        if (accion == 2) {
            titulo = 'Editar Cuenta Baja';
        }

        const dialogRef = this.dialog.open(ModalCuentaActivoBajaComponent, {

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento
            },
        });

        dialogRef.afterClosed().subscribe(result => {
           let tipoA= this.listaTipoAct.find(i => i.tipo_activo_id==result);
           this.tActivo.setValue(tipoA);
            this.spsTipoCuentaBaja();
        });
    }
      /**
      * Confirmar si se quiere procesar la infomacion cargada
      */
       confirmarProceso(accion,dato) {
        Swal.fire({
            title: '¿Deseas continuar con la eliminación?',
            text: "¡Se procesaran los datos, cargados!",
            icon: 'warning',
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                //Accion a realizar si  se acepta
                this.crudCuentaTipoActivos(accion,dato);
            } 
        })
    }
       /**
   * Metodo CRUD Cuenta tipo de activos
   *  accion 3 eliminar la relacion de activo con cuenta
   */
        crudCuentaTipoActivos(accion,dato) {
            this.blockUI.start('Cargando datos...');
            let jsonData = {
              "datos": [dato.cuenta_tipo_baja_id,
                dato.tipo_activo_id,
                dato.sucursalid,
                dato.cuenta_id,
        
              ], "accion": accion
            };
            this.service.registrar(jsonData, 'crudTipoCuentaBaja').subscribe(result => {
              if (result[0][0] === '0') {
        
                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
              } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
              }
            }, error => {
              this.blockUI.stop();
              this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            });
          }
      /**
     * Validaciones del formulario
     */
       validaciones = {
        'tActivo': [
            { type: 'required', message: 'Campo requerido.' }
        ]
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