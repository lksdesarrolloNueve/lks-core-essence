import { Component, OnInit} from "@angular/core";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";

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
    selector: 'menus',
    moduleId: module.id,
    templateUrl: 'menus.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 23/10/2021
 * @descripcion: Componente para la gestion de menus
 */
export class MenusComponent implements OnInit {

    //Declaracion de variables y Componentes
    @BlockUI() blockUI: NgBlockUI;

    opcionesMenu: Observable<string[]>;
    listaMenus: any[] = [];
    formMenu: UntypedFormGroup;

    menuid: number = 0;

    accion: number = 1;
    arbolMenus : any;

    //Botones boolean
    mostrarGuardar: boolean = true;
    mostrarEditar: boolean = false;

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

    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder) {

        

        this.formMenu = this.fomrBuilder.group({
            cvemenu: new UntypedFormControl('', [Validators.required, Validators.maxLength(10)]),
            menu: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()] }),
            titulo: new UntypedFormControl('', [Validators.required, Validators.maxLength(30)]),
            descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            icono: new UntypedFormControl('', [Validators.maxLength(30)]),
            pathURL: new UntypedFormControl('', [Validators.maxLength(20)]),
            estatus: new UntypedFormControl(true)
        });

    }


    ngOnInit() {
        this.spsJsonMenu();
        this.spsListaMenus();
    }

    /**
     * Metodo para obtener el Json para formar el Arbol de Menus
     */
    spsJsonMenu() {
        this.blockUI.start('Cargando datos...');

        this.service.getList('jsonMenu').subscribe(data => {
            this.blockUI.stop();

            const res = JSON.parse(data);
      

            this.dataSourceMenus.data = res;

            this.arbolMenus = res;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    crudMenu(form: any): void {

        if (this.formMenu.invalid) {
            this.validateAllFormFields(this.formMenu);
            return;
        }

        let menuPadre = 0;

        if (!form.menu.menuId) {
            menuPadre = 0;
        } else {
            menuPadre = form.menu.menuId;
        }


        const data = {
            menuId: this.menuid,
            cveMenu: form.cvemenu,
            titulo: form.titulo,
            descripcion: form.descripcion,
            icon: form.icono,
            pathURL: form.pathURL,
            menuPadreId: menuPadre,
            estatus: form.estatus
        }

        if (this.accion === 2) {
            this.blockUI.start('Editando ...')
        } else {
            this.blockUI.start('Guardando ...')
        }


        this.service.registrarBYID(data, this.accion, 'crudMenu')
            .subscribe(result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.nuevoMenu();

                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            });

    }


    nuevoMenu(){
        this.accion = 1;
        this.menuid = 0;
        this.mostrarEditar = false;
        this.mostrarGuardar = true;
        this.formMenu.reset();
        this.spsJsonMenu();
        this.spsListaMenus();
    }


    /**
     * Metodo para listar los menus activos
     */
    spsListaMenus() {


        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaMenus').subscribe(data => {
            this.blockUI.stop();

            this.listaMenus = data;
        
            this.opcionesMenu = this.formMenu.get('menu').valueChanges.pipe(
                startWith(''),
                map(value => this._filterMenu(value))
            );


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Filtra de menus
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterMenu(value: any): any {

        
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaMenus.filter(option => option.titulo.toLowerCase().includes(filterValue));
    }

    /**
    * Muestra la descripcion del menu
    * @param option --estado seleccionada
    * @returns --nombre de menu
    */
    displayFn(option: any): any {
        return option ? option.titulo : undefined;
    }


    /**
     * Validacion para los campos
     */
    validaciones = {
        'cvemenu': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 10 dígitos.' },
        ],
        'titulo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 30 dígitos.' },
        ],
        'menu': [{ type: 'invalidAutocompleteObject', message: 'El menú no existe.' }],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
        ],
        'icono': [
            { type: 'maxlength', message: 'Campo maximo 30 dígitos.' },
        ],
        'pathURL': [
            { type: 'maxlength', message: 'Campo maximo 20 dígitos.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
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
     * Valida que el texto ingresado pertenezca a un estado
     * @returns mensaje de error.
     */
    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }

    editarMenu(elemento): void {
        this.mostrarEditar = true;
        this.mostrarGuardar = false;
        this.accion = 2;
        this.menuid = elemento.menuid;
        this.formMenu.get('titulo').setValue(elemento.titulo);
        this.formMenu.get('cvemenu').setValue(elemento?.cvemenu);
        this.formMenu.get('descripcion').setValue(elemento.descripcion);
        this.formMenu.get('icono').setValue(elemento?.icono);
        this.formMenu.get('pathURL').setValue(elemento?.pathURL);
        this.formMenu.get('estatus').setValue(elemento.estatus);

        if (elemento.menuPadreID) {
            let menuPadre = this.listaMenus.find(x => x.menuId == elemento.menuPadreID);
            this.formMenu.get('menu').setValue(menuPadre);
        }else{
            this.formMenu.get('menu').setValue('');
        }

    }


    // filtrar recursivamente en una cadena de texto usando el valor del objeto de propiedad
  filterRecursive(filterText: string, array: any[], property: string) {
    let filteredData;

    //haga una copia de los datos para que no mutemos el original
    function copy(o: any) {
      return Object.assign({}, o);
    }

    // has string
    if (filterText) {
      // necesita la cadena para que coincida con el valor de la propiedad
      filterText = filterText.toLowerCase();
      // copy obj so we don't mutate it and filter
      filteredData = array.map(copy).filter(function x(y) {
        if (y[property].toLowerCase().includes(filterText)) {
          return true;
        }
        // if children match
        if (y.submenus) {
          return (y.submenus = y.submenus.map(copy).filter(x)).length;
        }
      });
      // no string, return whole array
    } else {
      filteredData = array;
    }

    return filteredData;
  }

  // pass mat input string to recursive function and return data
  filterTree(filterText: string) {
    // use filter input text, return filtered TREE_DATA, use the 'name' object value
    this.dataSourceMenus.data = this.filterRecursive(filterText, this.arbolMenus, 'titulo');
  }

  // filter string from mat input filter
  applyFilter(filterText: string) {
    this.filterTree(filterText);
    // show / hide based on state of filter string
    if (filterText) {
      this.treeControl.expandAll();
    } else {
      this.treeControl.collapseAll();
    }
  }



}