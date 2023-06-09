import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../../auth/service/auth.service';
import { PermisosService } from '../service/permisos.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../service/gestion';
import { MatDialog } from '@angular/material/dialog';
import { SucursalesSocioComponent } from '../../pages/modales/sucursales-socio/sucursales-socio.component';
import { verificacionModalComponent } from '../../pages/modales/verificacion-modal/verificacion-modal.component';
import moment from 'moment';
import { TitleService } from './title-service.service';

@Component({
  moduleId: module.id,
  selector: 'navbar-cmp',
  templateUrl: 'navbar.component.html'
})

export class NavbarComponent implements OnInit {
  private listTitles: any[];
  location: Location;
  private nativeElement: Node;
  private toggleButton;
  private sidebarVisible: boolean;
  lblNombre: any;
  usuario: any;
  sucursal: any = '';
  fechaHora: any;
  titulo = 'General';
  rutasTituloEspecial: string[];

  listaSucursales: any = [];

  //Declaracion de variables y Componentes
  @BlockUI() blockUI: NgBlockUI;


  public isCollapsed = true;
  @ViewChild("navbar-cmp", { static: false }) button;

  constructor(location: Location,
    private element: ElementRef, private router: Router,
    private authService: AuthService,
    private service: GestionGenericaService,
    private servicePermisos: PermisosService,
    public dialog: MatDialog,
    private titleService: TitleService) {
    this.location = location;
    this.nativeElement = element.nativeElement;
    this.sidebarVisible = false;
    this.usuario = this.authService.getLoggedUser();
    this.fechaHora = moment(new Date()).format('DD/MM/YY HH:mm:ss');


  }

  ngOnInit() {
    this.listTitles = this.servicePermisos.permisos;
    var navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
    this.router.events.subscribe((event) => {
      this.sidebarClose();
      this.getTitle();
    });
    this.spsUsuario();

    // Se asigna el titulo en caso de ser un titulo especifico, como el nombre de caja en /caja-movimientos
    this.titleService.getTitulo().subscribe(result => {
      this.titulo = result;
    }, error => {
      console.warn('No se pudo obtener nombre', error);
    });

    /**
    * Aqui se agregan las rutas con un titulo especifico
    * Ejemplo: caja-movimientos debe tener como titulo el nombre de la caja seleccionada
    */
    this.rutasTituloEspecial = [
      'caja-movimientos',
      
    ];
  }

  getTitle() {
    let titlee = this.location.prepareExternalUrl(this.location.path());

    if (titlee.charAt(0) === '#') {
      titlee = titlee.slice(1);
    }

    // Si la ruta no es parte de las rutas con titulo especial, se asigna el titulo del menu
    if (!this.rutasTituloEspecial.includes(`/${titlee}`)) {
      for (let menu of this.servicePermisos.permisos) {
        if ('/' + menu.pathURL === titlee) {
          this.titulo = menu.titulo;
        }
      }
    }

  }

  sidebarToggle() {
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const html = document.getElementsByTagName('html')[0];
    const mainPanel = <HTMLElement>document.getElementsByClassName('main-panel')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);

    html.classList.add('nav-open');
    if (window.innerWidth < 991) {
      mainPanel.style.position = 'fixed';
    }
    this.sidebarVisible = true;
  }

  sidebarClose() {
    const html = document.getElementsByTagName('html')[0];
    const mainPanel = <HTMLElement>document.getElementsByClassName('main-panel')[0];
    if (window.innerWidth < 991) {
      setTimeout(function () {
        mainPanel.style.position = '';
      }, 500);
    }
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    html.classList.remove('nav-open');
  }

  collapse() {
    this.isCollapsed = !this.isCollapsed;
    const navbar = document.getElementsByTagName('nav')[0];
    if (!this.isCollapsed) {
      navbar.classList.remove('navbar-transparent');
      navbar.classList.add('bg-white');
    } else {
      navbar.classList.add('navbar-transparent');
      navbar.classList.remove('bg-white');
    }

  }

  cerrarSesion() {
    this.authService.logout();
  }


  spsUsuario() {

    this.blockUI.start('Cargando datos...');

    this.service.getListByID('1/' + this.usuario.preferred_username, 'listaUsuariosInformacion').subscribe(data => {
      this.blockUI.stop();

      this.servicePermisos.setDatosUsuario(data[0]);
      this.lblNombre = this.servicePermisos.usuario.firstName + ' ' + this.servicePermisos.usuario.lastName;
      this.listaSucursales = this.servicePermisos.sucursales;


      if (this.listaSucursales.length === 1) {
        this.sucursal = this.listaSucursales[0].nombreSucursal;
        this.servicePermisos.setSucursalSelecionada(this.listaSucursales[0]);
      }

      if (this.listaSucursales.length > 1) {
        this.openSucursales();
      }

      

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    }
    );
  }

  sucursalSelecionada(sucursal) {

    const dialogRef = this.dialog.open(verificacionModalComponent, {
      data: {
        titulo: 'Cambio de Sucursal',
        body: '¿Esta seguro de cambiar la sucursal  ?'
      }
    });

    //Cerrar ventana
    dialogRef.afterClosed().subscribe(result => {

      if (result === 0) {
        this.sucursal = sucursal.nombreSucursal;
        this.servicePermisos.setSucursalSelecionada(sucursal);
        this.router.navigate(['/']);
      }

    });

  }



  /**
  * Metodo para abrir ventana modal
  * @param data -- Objecto o valor a condicionar
  */
  openSucursales() {

    //se abre el modal
    const dialogRef = this.dialog.open(SucursalesSocioComponent, {
      panelClass: 'full-screen-modal'
    });
    //Se usa para cuando cerramos
    dialogRef.afterClosed().subscribe(result => {

      if (this.vacio(this.servicePermisos.sucursalSeleccionada)) {
        this.openSucursales();
      } else {
        this.sucursal = this.servicePermisos.sucursalSeleccionada.nombreSucursal;
      }

    });

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
