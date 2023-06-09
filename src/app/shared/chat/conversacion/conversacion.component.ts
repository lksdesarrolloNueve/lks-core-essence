import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import * as moment from "moment";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { firestore } from 'firebase/app';
import { AuthService } from "../../../auth/service/auth.service";
import { EncryptDataService } from "../../../shared/service/encryptdata";


/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/06/2022
 * @description: Componente para la gestion de conversaciones (chats)
 * 
 */
@Component({
    selector: 'conversacion-chat',
    changeDetection: ChangeDetectionStrategy.OnPush,
    moduleId: module.id,
    templateUrl: 'conversacion.component.html',
    styleUrls: ['conversacion.component.css']
})

export class ConversacionComponent implements OnChanges {
    @BlockUI() blockUI: NgBlockUI;
    @Input() chat: any;
    @Output() cerrarChatEvent = new EventEmitter<any>();
    @Output() updateChatEvent = new EventEmitter<any>();
    listaMensajes: any[];
    listaUsuarios: any[];
    hoy: any;
    inputMensaje: string;
    usuarioId: any;


    constructor(
        private fire: AngularFirestore,
        private authService: AuthService,
        private changeDetector: ChangeDetectorRef,
        private encripta: EncryptDataService,
    ) {
        this.hoy = new Date().setHours(0, 0, 0, 0,);
        this.usuarioId = this.authService.getLoggedUser().sub;
    }

    /**
     * Funcion que detecta los cambios en el @Input, significando esto que se selecciono un chat o grupo
     */
    ngOnChanges() {
        if (this.chat.id != undefined) this.spsUsuarios(this.chat.id);
        if (this.chat.nuevo) this.listaMensajes = [];
    }


    /**
     * Metodo que emite la señal al componente "chat" para cerrar la conversacion
     */
    regresar() {
        this.cerrarChatEvent.emit();
    }


    /**
     * Funcion que obtiene la lista de chats del usuario actual
     */
    spsConversacion(chatId) {
        this.blockUI.start('Cargando...');
        this.fire.collection("mensaje", ref => ref
            .doc(chatId)
            .collection('mensajes')
            .orderBy('fecha', 'desc')
        ).snapshotChanges().subscribe((res) => {
            this.listaMensajes = [];

            res.forEach((p: any) => {
                // Se agregan estas variables como validacion para evitar error de remitente indefinido
                let nombreRemitente = this.listaUsuarios.find(u => u.id == p.payload.doc.data().remitente)?.nombre;

                this.listaMensajes.push({
                    fecha: p.payload.doc.data().fecha,
                    remitente: p.payload.doc.data().remitente,
                    texto: this.encripta.desencriptar(p.payload.doc.data().texto),
                    nombreRemitente: nombreRemitente,
                });
            });

            this.convertirFechas();

            this.changeDetector.detectChanges();

            this.blockUI.stop();
        });
    }


    /**
     * Funcion que obtiene la lista de usuarios del chat seleccionado,
     * spsConversacion obtiene las id pero no los nombres
     */
    spsUsuarios(chatId) {
        this.blockUI.start('Cargando...');
        this.fire.collection("usuario", ref => ref
            .where('grupos', 'array-contains', chatId)
        ).snapshotChanges().subscribe((res) => {
            this.listaUsuarios = [];

            res.forEach((p: any) => {
                this.listaUsuarios.push({
                    id: p.payload.doc.data().id,
                    usuario: p.payload.doc.data().usuario,
                    nombre: p.payload.doc.data().nombre,
                });
            });

            // Si el chat no tiene nombre previamente asignado, significa que es nuevo chat individual,
            // por lo que se asigna el nombre del usuario opuesto
            if (!this.chat.nombre) {
                // Se id del otro usuario del chat individual
                let idUsuarioOpuesto = this.chat.miembros.filter(usuario => usuario != this.usuarioId)[0];
                // Se asigna el nombre al otro usuario comparando la id obtenida con las id de la lista de usuarios
                this.chat.nombre = this.listaUsuarios.filter(usuario => usuario.id == idUsuarioOpuesto)[0].nombre;
            }

            // Se consultan las conversaciones del chat
            this.spsConversacion(chatId);

            this.blockUI.stop();
        });
    }


    /**
     * Metodo que transforma la fecha de cada chat de objeto con nanosegundos a una fecha con formato regular
     */
    convertirFechas() {
        this.listaMensajes.forEach(c => {
            let fechaNano = c.fecha;
            let fechaSinFormato = new Date(fechaNano.seconds * 1000 + fechaNano.nanoseconds / 1000000).setHours(0, 0, 0, 0);
            let fechaConFormato = moment(new Date(fechaNano.seconds * 1000 + fechaNano.nanoseconds / 1000000)).format('DD/MM/YYYY');
            let hora = moment(new Date(fechaNano.seconds * 1000 + fechaNano.nanoseconds / 1000000)).format('HH:mm:ss');

            c.fechaSinFormato = fechaSinFormato; // Fecha sin horas en nanosegundos
            c.fechaFormato = fechaConFormato; // Fecha en fomrato DD/MM/YYYY
            c.hora = hora; // Hora en formato HH:mm:ss
        });
    }


    /**
     * Metodo que envia a la BD el mensaje insertado en el input
     */
    enviarMensaje() {

        // Se valida que el mensaje no este vacio
        if (this.inputMensaje && this.inputMensaje.trim()) {

            let mensaje = {
                fecha: new Date(),
                remitente: this.usuarioId,
                texto: this.encripta.encriptar(this.inputMensaje)
            }

            // Se confirma si el chat es nuevo, de ser asi se crea nuevo grupo, se envia el primer mensaje
            // y se termina la ejecucion desde nuevoChat()
            if (this.chat.nuevo) {
                this.nuevoChat(mensaje);
            } else {
                let mensajeReciente = {
                    fecha: mensaje.fecha,
                    remitente: mensaje.remitente,
                    texto: mensaje.texto,
                    leidoPor: [this.usuarioId]
                }

                // Se agrega el mensaje a la BD
                this.fire.collection("mensaje")
                    .doc(this.chat.id)
                    .collection('mensajes')
                    .add(mensaje);

                // Se actualiza "mensajeReciente" en la coleccion "grupo"
                this.fire.collection("grupo").doc(this.chat.id).update({ mensajeReciente: mensajeReciente });
            }

        }

        // Se limpia el input de mensaje
        this.inputMensaje = "";
    }


    /**
     * Funcion que detecta cada tecla presionada cuando se escribe un mensaje, si es "Enter" envia el mensaje
     */
    enviarConEnter(event) {
        if (event.key == "Enter") {
            this.enviarMensaje();
        }
    }


    /**
     * Funcion que se activa si se esta enviando mensaje a un nuevo chat individual
     * Al ser nuevo el chat, se crea el nuevo grupo, se agrega a los usuarios participantes
     * y se inserta el mensaje en el nuevo grupo
     */
    nuevoChat(mensaje) {
        let chatNuevo = this.chat;
        // Se elimina el nombre proporcionado en nuevo-chat.component
        delete chatNuevo.nombre;

        chatNuevo.mensajeReciente = {
            fecha: mensaje.fecha,
            remitente: mensaje.remitente,
            texto: mensaje.texto,
            leidoPor: [this.usuarioId]
        };
        delete chatNuevo.nuevo;
        chatNuevo.id = "";

        // Se agrega el grupo nuevo a la BD
        this.fire.collection("grupo")
            .add(chatNuevo)
            .then(docRef => {
                this.chat.id = docRef.id;

                // Se agrega el id del grupo como propiedad de si mismo
                this.fire.collection("grupo").doc(docRef.id).update({ id: docRef.id });

                // Se agrega el grupo a los usuarios participantes
                this.chat.miembros.forEach(usuario => {
                    this.fire.collection("usuario").doc(usuario).update({
                        grupos: firestore.FieldValue.arrayUnion(docRef.id)
                    });
                });

                // Se agrega el mensaje a la BD
                this.fire.collection("mensaje")
                    .doc(this.chat.id)
                    .collection('mensajes')
                    .add(mensaje);

                // Se indica que el chat ya no es nuevo, para que no se vacien los mensajes
                delete this.chat.nuevo;

                // Se consultan los usuarios del chat para obtener sus nombre de usuario y nombre completo
                this.spsUsuarios(this.chat.id);
            })
            .catch(error => {
                console.error("No se pudo agregar el documento: ", error);
            });
    }


    /**
     * Método que muestra el componente "updateChat" para editar aspectos como agregar o eliminar miembros
     */
    editarChat(accion) {
        // Se envia la accion al componente "updateChat"
        // 1.Agregar miembros. 2.Eliminar miembros.
        this.updateChatEvent.emit(accion);
    }

}