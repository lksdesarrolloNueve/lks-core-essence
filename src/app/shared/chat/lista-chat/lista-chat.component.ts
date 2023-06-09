import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import * as moment from "moment";
import { AuthService } from "../../../auth/service/auth.service";
import { EncryptDataService } from "../../../shared/service/encryptdata";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/06/2022
 * @description: Componente para la lista de chats
 * 
 */
@Component({
    selector: 'lista-chat',
    moduleId: module.id,
    templateUrl: 'lista-chat.component.html',
    styleUrls: ['lista-chat.component.css']
})

export class ListaChatComponent implements OnInit {
    displayedColumns = ['nombre',];
    @BlockUI() blockUI: NgBlockUI;
    @Output() abrirChatEvent = new EventEmitter<any>();
    @Output() nuevoChatEvent = new EventEmitter<any>();
    @Output() notificacionEvent = new EventEmitter<any>();
    dataSourceGrupos = new MatTableDataSource();
    listaUsuarios: any[];
    listaGrupos: any[];
    usuario: any;
    usuarioId: any;
    hoy: any;


    constructor(
        private fire: AngularFirestore,
        private authService: AuthService,
        private encripta: EncryptDataService,
    ) {
        this.usuario = this.authService.getLoggedUser().preferred_username;
        this.usuarioId = this.authService.getLoggedUser().sub;


        // Fecha actual sin horas, minutos, segundos
        this.hoy = new Date().setHours(0, 0, 0, 0,);
    }

    ngOnInit() {
        this.spsUsuarios();
    }


    /**
     * Funcion que obtiene la lista de usuarios
     */
    spsUsuarios() {
        this.listaUsuarios = [];

        this.blockUI.start('Cargando...');
        this.fire.collection("usuario", ref => ref
        ).snapshotChanges().subscribe((res) => {

            // Se asignan los valores de la lista de usuarios
            res.forEach((p: any) => {
                this.listaUsuarios.push({
                    id: p.payload.doc.data().id,
                    nombre: p.payload.doc.data().nombre,
                });
            });

            // Se solicitan los grupos en los que participa el usuario actual
            this.spsGrupos(this.usuarioId);
        });
    }

    /**
     * Funcion que obtiene la lista de chats del usuario actual
     */
    spsGrupos(usuarioId) {
        //this.blockUI.start('Cargando...');
        this.fire.collection("grupo", ref => ref
            .where('miembros', 'array-contains', usuarioId)
            .orderBy('mensajeReciente.fecha', 'desc')
        ).snapshotChanges().subscribe((res) => {
            this.listaGrupos = [];

            res.forEach((p: any) => {
                let nombre;
                let data = p.payload.doc.data();
                // Se recorta el texto del mensajeReciente en caso de ser muy largo
                let mensajeReciente = data.mensajeReciente;
                mensajeReciente.texto = this.encripta.desencriptar(mensajeReciente.texto); // Se desencripta el mensaje
                if (mensajeReciente.texto && mensajeReciente.texto.length > 10) mensajeReciente.texto = `${mensajeReciente.texto.slice(0, 10)}...`;

                // Si el chat es individual (tipo == 1) se asigna el nombre del otro usuario de la conversacion,
                // si es grupal se asigna el nombre obtenido de firebase
                if (data.tipo == 1) {
                    // Se id del otro usuario del chat individual
                    nombre = data.miembros.filter(usuario => usuario != this.usuarioId)[0];
                    // Se asigna el nombre al otro usuario comparando la id obtenida con las id de la lista de usuarios
                    nombre = this.listaUsuarios.filter(usuario => usuario.id == nombre)[0].nombre;
                } else {
                    nombre = data.nombre;
                }

                this.listaGrupos.push({
                    id: data.id,
                    creador: data.creador,
                    fechaCreacion: data.fechaCreacion,
                    nombre: nombre,
                    mensajeReciente: mensajeReciente,
                    miembros: data.miembros,
                    historialMiembros: data.historialMiembros,
                    tipo: data.tipo,
                });

            });

            this.convertirFechas();
            this.activarNotificacion();

            this.dataSourceGrupos.data = this.listaGrupos;

            if (this.dataSourceGrupos.paginator) {
                this.dataSourceGrupos.paginator.firstPage();
            }

            //this.blockUI.stop();
        });
    }


    /**
     * Se filtra el contenido de la tabla en base al input de filtro
     * @param event
     */
    filtrar(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceGrupos.filter = filterValue.trim().toLowerCase();
    }


    /**
     * Metodo que transforma la fecha de cada chat de objeto con nanosegundos a una fecha con formato regular
     */
    convertirFechas() {
        this.listaGrupos.forEach(c => {
            let fechaNano = c.mensajeReciente.fecha;
            let fechaSinFormato = new Date(fechaNano.seconds * 1000 + fechaNano.nanoseconds / 1000000).setHours(0, 0, 0, 0);
            let fechaConFormato = moment(new Date(fechaNano.seconds * 1000 + fechaNano.nanoseconds / 1000000)).format('DD/MM/YYYY');
            let hora = moment(new Date(fechaNano.seconds * 1000 + fechaNano.nanoseconds / 1000000)).format('HH:mm:ss');

            c.mensajeReciente.fechaSinFormato = fechaSinFormato; // Fecha sin horas en nanosegundos, necesaria para comparar con la fecha actual
            c.mensajeReciente.fechaFormato = fechaConFormato; // Fecha en formato DD/MM/YYYY
            c.mensajeReciente.hora = hora; // Hora en formato HH:mm:ss
        });
    }


    /**
     * Metodo que muestra la conversacion del chat seleccionado y oculta la lista de chats
     * Tambien se agrega el usuario actual al arreglo "leidoPor" de la propiedad "mensajeReciente" del chat
     * para marcar el mensaje reciente como leido
     */
    abrirConversacion(chat) {
        let mensajeReciente = chat.mensajeReciente;

        // Se confirma si el usuario actual ya ha leido el mensaje seleccionado
        // De no ser asi se agrega el usuario en "leidoPor" de "mensajeReciente"
        if (!mensajeReciente.leidoPor.includes(this.usuarioId)) {
            // Se agrega al usuario actual al arreglo
            mensajeReciente.leidoPor.push(this.usuarioId);
            // Se reasigna la misma fecha obtenida de la BD previamente
            mensajeReciente.fecha = new Date(mensajeReciente.fecha.seconds * 1000 + mensajeReciente.fecha.nanoseconds / 1000000);
            // Se eliminan del objeto los parametros que sirvieron su proposito pero no son necesarios en la BD
            delete mensajeReciente.fechaSinFormato;
            delete mensajeReciente.fechaFormato;
            delete mensajeReciente.hora;

            mensajeReciente.texto = this.encripta.encriptar(mensajeReciente.texto); // Se encripta el texto del mensaje

            // Se actualiza mensajeReciente en la BD con el objeto modificado
            this.fire.collection("grupo").doc(chat.id).update({
                mensajeReciente: mensajeReciente
            });
        }

        this.abrirChatEvent.emit(chat);
    }


    /**
     * Metodo que muestra la seccion de agregar nuevo chat y oculta la lista de chats
     */
    crearChat() {
        this.nuevoChatEvent.emit();
    }


    /**
     * Metodo que muestra notificacion de nuevo mensaje,
     * la notificacion consiste en mostrar un punto rojo en la burbuja de chat
     */
    activarNotificacion() {
        let estatus = false;

        // Si alguno de los grupos no ha sido leido por el usuario actual, se envia estatus verdadero para mostrar la notificacion
        this.listaGrupos.forEach(grupo => {
            if (!estatus && !grupo.mensajeReciente.leidoPor.includes(this.usuarioId)) estatus = true;
        });

        this.notificacionEvent.emit(estatus);
    }

}