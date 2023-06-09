import { Component, OnInit } from "@angular/core";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { PermisosService } from "../../../shared/service/permisos.service";

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 10/11/2021
* @descripcion: Componente para la gestion de empresas
*/
@Component({
    selector: 'sucursales-socio',
    moduleId: module.id,
    templateUrl: 'sucursales-socio.component.html'
})

export class SucursalesSocioComponent implements OnInit {

    listaSucursales: any = [];

    sucursalCrtl = new UntypedFormControl('', [Validators.required]);


    constructor(public dialogo: MatDialogRef<SucursalesSocioComponent>, private servicePermisos: PermisosService) {

        this.listaSucursales = servicePermisos.sucursales;

    }

    /**
  * Metodo OnInit de la clase
  */
    ngOnInit() {

    }


    /**
     * Se setea la sucursal a la clase global
     */
    setSucursal() {
        if(!this.vacio(this.sucursalCrtl.value)){
            this.servicePermisos.setSucursalSelecionada(this.sucursalCrtl.value);
            this.dialogo.close();
        }

    }



    /**
* Metodo que valida los datos vacios
* @param value -valor a validar
* @returns 
*/
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }


}