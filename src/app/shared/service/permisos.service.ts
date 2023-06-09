import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermisosService {
  permisos: any = [];
  usuario :any=[];
  roles: any = [];
  sucursales: any = [];
  sucursalSeleccionada : any=[];

  addPermisos(permisos) {
    this.permisos = permisos;
  }

  setDatosUsuario(data){
    this.sucursales =JSON.parse(data.sucursales);
    this.usuario = data;
  }

  setSucursalSelecionada(sucursal){
    this.sucursalSeleccionada = sucursal;
  }

  clear() {
    this.permisos = [];
    this.usuario =[];
    this.roles = [];
    this.sucursales = [];
    this.sucursalSeleccionada = [];
  }



}