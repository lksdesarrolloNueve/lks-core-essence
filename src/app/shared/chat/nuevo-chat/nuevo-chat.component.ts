import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AuthService } from "../../../auth/service/auth.service";
import { MatTableDataSource } from "@angular/material/table";
import { UntypedFormControl, Validators } from "@angular/forms";
import { firestore } from 'firebase/app';
import { SelectionModel } from "@angular/cdk/collections";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/06/2022
 * @description: Componente para la creacion de nuevos chat,
 * incluye la creacion de chat grupales y solicitud de mensajes
 * 
 */
@Component({
    selector: 'nuevo-chat',
    moduleId: module.id,
    templateUrl: 'nuevo-chat.component.html',
    styleUrls: ['nuevo-chat.component.css']
})

export class NuevoChatComponent implements OnInit {
    columnasIndividual = ['nombre',];
    columnasGrupal = ['select', 'nombre',];
    @Output() cerrarNuevoEvent = new EventEmitter<any>();
    @Output() abrirChatEvent = new EventEmitter<any>();
    @BlockUI() blockUI: NgBlockUI;
    dataSourceChatIndividual = new MatTableDataSource();
    dataSourceChatGrupal = new MatTableDataSource();
    isGrupal = new UntypedFormControl(0);
    nombreGrupo = new UntypedFormControl('', { validators: [Validators.required] });
    seleccionGrupo = new SelectionModel<any>(true, []);
    usuariosIndividual: any[];
    usuariosGrupal: any[];
    gruposIndividuales: any[];
    usuarioId: any;

    validaciones = {
        'validacionGrupo': [
            { type: 'required', message: 'El grupo requiere un nombre' }
        ],
    }


    constructor(
        private service: GestionGenericaService,
        private fire: AngularFirestore,
        private authService: AuthService
    ) {
        this.usuarioId = this.authService.getLoggedUser().sub;
    }

    ngOnInit() {
        this.spsUsuarios();
    }


    /**
     * Metodo que emite la señal al componente "chat" para cerrar la conversacion
     */
    regresar() {
        this.cerrarNuevoEvent.emit();
    }

    /**
     * Metodo que consulta los usuarios de postgres
     */
    spsUsuarios() {
        // Se consultan todos los usuarios del sistema
        this.service.getList('spsUsuariosChat').subscribe(data => {
            this.blockUI.stop();
            this.gruposIndividuales = [];
            this.usuariosIndividual = [];
            this.usuariosGrupal = [];

            // Se excluye el usuario actual de la lista para que no se muestre en 
            this.usuariosGrupal = data.filter(usuario => usuario.id != this.usuarioId);
            this.usuariosIndividual = data

            // Se consultan los grupos a los que pertenece el usuario actual y que sean de tipo 1 (chat individual)
            this.fire.collection("grupo", ref => ref
                .where('miembros', 'array-contains', this.usuarioId)
                .where('tipo', '==', 1)
            ).snapshotChanges().subscribe((res) => {

                // Si el usuario no esta en ningun chat individual aun, usuariosIndividual es igual a todos los usuarios excluyendo al actual
                if (res.length == 0) this.usuariosIndividual = this.usuariosIndividual.filter(usuario => usuario.id != this.usuarioId);

                // Se llena un arreglo con los grupos individuales a los que pertenece el usuario actual
                res.forEach((p: any) => {
                    this.gruposIndividuales.push({
                        miembros: p.payload.doc.data().miembros,
                    });
                });

                // Se llena un arreglo con los usuarios disponibles para chat individual con el usuario actual.
                // Estos usuarios disponibles se mostraran en agregar chat individual
                this.gruposIndividuales.forEach(grupo => {
                    // Se excluyen los usuarios que ya estan en chat individuales con el usuario actual
                    this.usuariosIndividual = this.usuariosIndividual.filter(usuario => !grupo.miembros.includes(usuario.id));
                });

                this.dataSourceChatIndividual.data = this.usuariosIndividual;
                this.dataSourceChatGrupal.data = this.usuariosGrupal;
            });


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    /**
     * Método que crea el nuevo grupo y redirige a la conversacion del grupo creado
     */
    agregarGrupo() {
        let miembros = [this.usuarioId];
        let nombreGrupo = this.nombreGrupo.value;

        this.seleccionGrupo.selected.forEach(seleccion => miembros.push(seleccion.id));

        let chat = {
            id: "",
            nombre: nombreGrupo,
            creador: this.usuarioId,
            miembros: miembros,
            historialMiembros: miembros,
            tipo: 2,
            fechaCreacion: new Date(),
            mensajeReciente: {
                fecha: new Date(),
                remitente: this.usuarioId,
                texto: "Grupo creado",
                leidoPor: [this.usuarioId]
            }
        }

        // Se agrega el grupo a "grupos" en firebase
        this.fire.collection("grupo")
            .add(chat)
            .then(docRef => {
                // Se obtiene la id autogenerada al insertar el grupo
                chat.id = docRef.id;

                // Se agrega el id del grupo como propiedad de si mismo
                this.fire.collection("grupo").doc(docRef.id).update({ id: docRef.id });

                // Se agrega el grupo a los usuarios participantes
                chat.miembros.forEach(usuario => {
                    this.fire.collection("usuario").doc(usuario).update({
                        grupos: firestore.FieldValue.arrayUnion(docRef.id)
                    });
                });
            })
            .then(() => {
                // Se reinician los checkbox e input de la seccion de agregar chat grupal
                this.limpiarGrupo();

                // Se oculta la seccion de agregar grupo y se abre una conversacion en el chat recien agregado
                this.regresar();
                this.abrirChatEvent.emit(chat);
            })
            .catch(error => {
                console.error("No se pudo agregar el documento: ", error);
            });
    }


    /**
     * Metodo que abre una nueva conversacion individual
     */
    abrirConversacionIndividual(row) {
        let chat = {
            creador: this.usuarioId,
            miembros: [
                this.usuarioId,
                row.id
            ],
            historialMiembros: [ // Propiedad que sirve de historial de usuarios del chat, pues "miembros" puede cambiar
                this.usuarioId,
                row.id
            ],
            tipo: 1,
            fechaCreacion: new Date(),
            nuevo: true,
            // Se agrega nombre para que aparezca en el encabezado del nuevo chat
            // Se borra posteriormente en conversacion.component porque los chat individuales no tienen nombre predefinido
            // El encabezado siempre muestra el usuario opuesto de la conversacion, por eso no hay nombre predefinido
            nombre: row.nombre
        }

        this.regresar();
        this.abrirChatEvent.emit(chat);
    }


    /**
     * Funcion que reinicia los checkbox e input del componente cuando se agrega un nuevo chat grupal
     */
    limpiarGrupo() {
        this.nombreGrupo = new UntypedFormControl('', { validators: [Validators.required] });
        this.seleccionGrupo = new SelectionModel<any>(true, []);
    }

}