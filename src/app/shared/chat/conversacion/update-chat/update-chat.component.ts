import { SelectionModel } from "@angular/cdk/collections";
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatTableDataSource } from "@angular/material/table";
import { AuthService } from "../../../../auth/service/auth.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/06/2022
 * @description: Componente para acutalizar chat (agregar/eliminar miembros)
 * 
 */
@Component({
    selector: 'update-chat',
    moduleId: module.id,
    templateUrl: 'update-chat.component.html',
    styleUrls: ['update-chat.component.css']
})

export class UpdateChatComponent implements OnInit, OnChanges {
    columnasMiembros = ['select', 'nombre',];
    @BlockUI() blockUI: NgBlockUI;
    @Output() cerrarUpdateEvent = new EventEmitter<any>();
    @Input() chat: any;
    @Input() accion: any;
    seleccionMiembros = new SelectionModel<any>(true, []);
    dataSourceMiembros = new MatTableDataSource();
    listaUsuarios: any;
    miembrosDisponibles: any;
    miembrosFinales: any;
    usuarioId: any;


    constructor(
        private service: GestionGenericaService,
        private fire: AngularFirestore,
        private authService: AuthService,
        private changeDetector: ChangeDetectorRef
    ) {
        this.usuarioId = this.authService.getLoggedUser().sub;
    }

    ngOnInit() {
        this.spsUsuarios();
    }

    ngOnChanges(changes: SimpleChanges) {
        // En base a la lista de usuarios se asigna cuales pueden ser agregados o eliminados del chat
        if (changes.accion) this.spsMiembros(changes.accion.currentValue);
    }


    /**
     * Método que consulta los usuarios del sistema para las operaciones relacionadas con agregar o eliminar usuarios del chat
     */
    spsUsuarios() {
        // Se consultan todos los usuarios del sistema
        this.service.getList('spsUsuariosChat').subscribe(data => {
            this.blockUI.stop();
            this.listaUsuarios = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
     * Método que asigna los usuarios que se pueden agregar y los que se pueden
     * @accion 2. Agregar miembro. 3. Eliminar miembro
     */
    spsMiembros(accion) {
        this.miembrosDisponibles = [];

        switch (accion) {
            // Se asignan como disponibles los usuarios actuales del chat
            case 1:
            this.miembrosDisponibles = this.listaUsuarios.filter(usuario => this.chat.miembros.includes(usuario.id));
                break;
            // Se asignan como disponibles para agregar todos los usuarios que no estan en el chat actual
            case 2:
                this.miembrosDisponibles = this.listaUsuarios.filter(usuario => !this.chat.miembros.includes(usuario.id));
                break;
            // Se asignan como disponibles para eliminar todos los usuarios que si estan en el chat actual
            case 3:
                // Primero se excluye el usuario actual, para que no pueda eliminarse el mismo
                this.miembrosDisponibles = this.listaUsuarios.filter(usuario => usuario.id != this.usuarioId);
                // A continuacion se filtran los usuarios restantes
                this.miembrosDisponibles = this.miembrosDisponibles.filter(usuario => this.chat.miembros.includes(usuario.id));
                break;
        }

        // Se asignan los miembros disponibles al dataSource de la tabla
        this.dataSourceMiembros = this.miembrosDisponibles;
    }


    /**
     * Método que devuelve a la conversacion
     */
    regresar() {
        this.cerrarUpdateEvent.emit();
    }


    /**
     * Método que agrega los miembros seleccionados al chat grupal
     */
    agregarMiembros() {
        this.miembrosFinales = [];
        let historialMiembros = [];

        // Se llena un arreglo con los miembros actuales del grupo
        this.chat.miembros.forEach(id => this.miembrosFinales.push(id));
        // Se agregan los nuevos miembros seleccionados al grupo
        this.seleccionMiembros.selected.forEach((miembro) => {
            this.miembrosFinales.push(miembro.id)
        });
        // Se actualiza "miembros" en la coleccion "grupo" de firebase
        this.fire.collection("grupo").doc(this.chat.id).update({ miembros: this.miembrosFinales }).then(() => {
            // Se actualiza el chat en el front con los nuevos miembros
            this.chat.miembros = this.miembrosFinales;
            this.spsMiembros(2)
        });

        // Se llena un arreglo con el historial de miembros
        this.chat.historialMiembros.forEach(id => historialMiembros.push(id));
        // Se agregan los nuevos miembros que no hayan estado ya en el historial
        this.seleccionMiembros.selected.forEach(miembro => {
            if (!historialMiembros.includes(miembro.id)) historialMiembros.push(miembro.id);
        });
        // Se actualiza "historialMiembros" agregando los miembros que nunca hayan estado en el grupo antes
        this.fire.collection("grupo").doc(this.chat.id).update({ historialMiembros: historialMiembros }).then(() => {
            this.chat.historialMiembros = historialMiembros; // Se actualiza el historial de miembros en front
        });

        this.limpiar();
        this.regresar();
    }


    /**
     * Método que elimina los miembros seleccionados del grupo
     */
    eliminarMiembros() {
        this.miembrosFinales = [];
        let miembrosEliminados = [];

        // Se llena un arreglo con los miembros seleccionados para eliminar del grupo
        this.seleccionMiembros.selected.forEach(miembro => miembrosEliminados.push(miembro.id));
        // Se llena un arreglo con los miembros actuales del grupo, excluyendo los miembros eliminados
        this.miembrosFinales = this.chat.miembros.filter(miembro => !miembrosEliminados.includes(miembro));
        // Se actualiza "miembros" en la coleccion "grupo" de firebase
        this.fire.collection("grupo").doc(this.chat.id).update({ miembros: this.miembrosFinales }).then(() => {
            // Se actualiza el chat en front sin los miembros eliminados
            this.chat.miembros = this.miembrosFinales;
            this.spsMiembros(3);
        });

        this.limpiar();
        this.regresar();
    }

    /**
     * Método que reinicia la seleccion de usuarios a agregar o eliminar
     */
    limpiar() {
        this.seleccionMiembros = new SelectionModel<any>(true, []);
    }

}