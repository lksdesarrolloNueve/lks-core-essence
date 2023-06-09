import { Component, OnInit } from '@angular/core';
import { GestionGenericaService } from '../shared/service/gestion';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { AuthService } from '../auth/service/auth.service';
import { PermisosService } from '../shared/service/permisos.service';
import { AngularFirestore } from '@angular/fire/firestore';


/** Flat node with expandable and level information */
interface MenuNode {
    expandable: boolean;
    menuid: number;
    titulo: string;
    cvemenu: string;
    descripcion: string;
    pathURL: string;
    menuPadreID: number;
    icono: string;
    estatus: boolean;
    level: number;
}




@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {

    //Declaracion de variables y Componentes
    @BlockUI() blockUI: NgBlockUI;

    listaMenus: any[] = [];
    rol: any;
    listaPermisos: any[] = [];

    url : any;
    cveLogo = 'LOGO';


    //### Configuracion Arbol MenusComponent
    /** Arbol Servidores */
    private _transformer = (node: any, level: number) => {
        return {
            expandable: !!node.submenus && node.submenus.length > 0,
            menuid: node.menu_id,
            titulo: node.titulo,
            cvemenu: node.cvemenu,
            descripcion: node.descripcion,
            pathURL: node.pathurl,
            menuPadreID: node.menu_padre_id,
            icono: node.icon,
            estatus: node.estatus,
            level: level,
        };
    }

    treeControl = new FlatTreeControl<MenuNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.submenus);

    dataSourceMenus = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    hasChild = (_: number, node: MenuNode) => node.expandable;

    //## FIN COnfiguracion Arbol


    /**
     *
     * @param service - gestion de Datos al BACK
     * @param auth - Usuario logueado
     * @param servicePermisos - Componente para variables de entorno
     */
    constructor( private firestore: AngularFirestore,
        private service: GestionGenericaService,
        private auth: AuthService,
        private servicePermisos: PermisosService) {
        //this.spsLogo();
        this.rol = this.auth.getLoggedUser();

    }


    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsJsonMenu();
        this.spsPermisosRol();
    }


    /**
     * Metodo para obtener el Json para formar el Arbol de Menus
     */
    spsJsonMenu() {

      /*  this.listaMenus = []*/
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(this.rol.preferred_username, 'jsonPermisosRol').subscribe(data => {
            this.blockUI.stop();

            const res = JSON.parse(data);


            this.listaMenus = res;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
    * Metodo para obtener los permisos por rol en formato Lista
    */
    spsPermisosRol() {

       this.blockUI.start('Cargando datos...');

        this.service.getListByID(this.rol.preferred_username, 'spsPermisosRolbyUsuario').subscribe(data => {

            this.listaPermisos = data;
            this.servicePermisos.addPermisos(this.listaPermisos);
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Busca la informacion del usuario
     */
    spsUsuario(){

        this.blockUI.start('Cargando datos...');

        this.service.getListByID('1/'+this.rol.preferred_username, 'listaUsuariosInformacion').subscribe(data => {

            this.listaMenus = JSON.parse(data[0].permisos);
            this.servicePermisos.setDatosUsuario(data[0]);
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para obtebner el logo
     */
    spsLogo() {
        this.firestore.collection("galeria", ref => ref.where('cveImage', '==', this.cveLogo)
        ).snapshotChanges().subscribe((res) => {
                res.forEach((p: any) => {
                    this.url = p.payload.doc.data().urlImage;
                });
        });
    }

}