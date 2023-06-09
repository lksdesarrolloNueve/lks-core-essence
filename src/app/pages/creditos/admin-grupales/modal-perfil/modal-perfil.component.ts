import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";

@Component({
    selector: 'modal-perfil',
    moduleId: module.id,
    templateUrl: './modal-perfil.component.html'
})
export class ModalPerfilComponent {

    //Declaracion de variables
    lblNombre: string;
    listIngresos: any = [];
    listEgresos: any = [];
    dataSourceIngreso: MatTableDataSource<any>;
    dataSourceEgreso: MatTableDataSource<any>;

    //DECLARACIÓN DE COLUMNAS PARA INGRESOS
    displayedColumnsIngresos: string[] = ['Descripción', 'Monto'];
    //DECLARACIÓN DE COLUMNAS PARA EGRESOS
    displayedColumnsEgresos: string[] = ['Descripción', 'Monto'];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
        this.listIngresos = data.ingresos;
        this.listEgresos = data.egresos;
        this.lblNombre = data.nombre;

        //CREAMOS  EL DATA SOURCE PARA EL INGRESOS
        this.dataSourceIngreso = new MatTableDataSource(this.listIngresos);

        //CREAMOS  EL DATA SOURCE PARA EL EGRESOS
        this.dataSourceEgreso = new MatTableDataSource(this.listEgresos);


    }


    /** Gets the total cost of all transactions. */
    getTotalIngresos() {
        return this.listIngresos.map(t => t.monto_ingreso).reduce((acc, value) => acc + value, 0);
    }

    /** Gets the total cost of all transactions. */
    getTotalEgresos() {
        return this.listEgresos.map(t => t.monto_egreso).reduce((acc, value) => acc + value, 0);
    }

}