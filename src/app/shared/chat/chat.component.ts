import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { fromEvent, Observable } from "rxjs";
import { delay, takeUntil } from 'rxjs/operators';
import { GestionGenericaService } from "../service/gestion";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 30/06/2022
 * @description: Componente para la gestion del chat
 * 
 */
@Component({
    selector: 'chat-cmp',
    moduleId: module.id,
    templateUrl: 'chat.component.html',
    styleUrls: ['chat.component.css']
})

export class ChatComponent implements OnInit, AfterViewInit {
    @ViewChild('burbuja', { static: false }) burbujaChat: ElementRef;
    @BlockUI() blockUI: NgBlockUI;
    mouseDown: Observable<any>;
    mouseUp: Observable<any>;
    chatContainerElement: any;
    chatBurbujaElement: any;
    chatVentanaElement: any;
    chatSeleccionado = {};
    accionUpdate: number;
    allUsers = {};
    chatAbierto = false;
    ventanaAbierta = false;
    nuevoChat = false;
    updateChat = false;
    listaUsuarios: any[];
    puntoNotif: boolean;
    burbujaActiva = false;
    altoVentana = 35;
    anchoVentana = 25;
    altoBurbuja = 5;

    constructor(
        private service: GestionGenericaService,
        private firestore: AngularFirestore,
    ) {
    }

    ngOnInit() {
        this.crearUsuarios();
    }

    ngAfterViewInit() {
        this.mouseDown = fromEvent(this.burbujaChat.nativeElement, 'mousedown');
        this.mouseUp = fromEvent(this.burbujaChat.nativeElement, 'mouseup');
        this.chatContainerElement = document.getElementById("chat-container");
        this.chatBurbujaElement = document.getElementById("chat-burbuja");
        this.chatVentanaElement = document.getElementById("chat-ventana");
    }


    /**
     * Metodo que obtiene los usuarios del sistema en Postgres y agrega los que falten a firebase.
     * Este metodo permite que haya consistencia entre los usuarios del chat y los usuarios generales.
     */
    crearUsuarios() {
        this.blockUI.start('Cargando...');

        // Se consultan todos los usuarios del sistema
        this.service.getList('spsUsuariosChat').subscribe(data => {
            this.blockUI.stop();
            this.listaUsuarios = data;

            // Por cada usuario en postgres se consulta si el usuario existe en firebase
            this.listaUsuarios.forEach(usuario => {

                // Se consulta el usuario en firebase
                this.firestore.collection("usuario", ref => ref
                    .where('id', '==', usuario.id)
                ).snapshotChanges().subscribe((res) => {

                    // Si el usuario no existe en firebase, el tamaño de res es 0,
                    // por lo que se agrega el usuario a firebase
                    if (res.length == 0) {
                        this.firestore.collection("usuario")
                            .doc(usuario.id).set(usuario);
                    }
                });
            });
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
     * Metodo que abre el chat (muestra la ventana de chat al dar click en la burbuja de chat)
     */
    abrirChat() {

        // Se define el cursor como pointer al posarlo sobre la burbuja para indicar que se puede dar click sobre ella
        this.chatBurbujaElement.style.cursor = "pointer";

        // Se detecta si el click dura mas de 200 milisegundos, de ser asi indica que
        // posiblemente se intenta arrastrar la burbuja, no abrir el chat
        this.mouseDown.pipe(
            delay(200), // Tiempo de espera en milisegundos
            takeUntil(this.mouseUp)
        ).subscribe(() => {
            // Se reestructura el chat para que no interfiera al ocultarse la ventana
            this.chatContainerElement.style.gridTemplateColumns = `${this.altoBurbuja}em`;
            this.chatContainerElement.style.gridTemplateRows = `${this.altoBurbuja}em`;
            this.chatBurbujaElement.style.gridRow = 1;
            this.chatBurbujaElement.style.gridColumn = 1;

            // Se indica que no se debe abrir el chat, pues se esta arrastrando la burbuja
            this.burbujaActiva = false;
            this.ventanaAbierta = false;

            // Se cambia el cursor de la burbuja para indicar que se esta arrastrando
            this.chatBurbujaElement.style.cursor = "all-scroll";
        });

        // Se comprueba si la burbuja debe abrir el chat o no, segun si se dio click o se arrastro
        if (this.burbujaActiva) {
            // Si la ventana esta abierta se cierra y viceversa
            this.ventanaAbierta = !this.ventanaAbierta;

        }

        // Se adapta la estructura del componente segun si la ventana esta abierta o no
        if (this.ventanaAbierta) {
            this.chatContainerElement.style.gridTemplateColumns = `${this.anchoVentana}em ${this.altoBurbuja}em`;
            this.chatContainerElement.style.gridTemplateRows = `${this.altoVentana}em ${this.altoBurbuja}em`;
            this.chatBurbujaElement.style.gridRow = 2;
            this.chatBurbujaElement.style.gridColumn = 2;
            this.chatVentanaElement.style.gridRow = 1;
            this.chatVentanaElement.style.gridColumn = 1;
        } else {
            this.chatContainerElement.style.gridTemplateColumns = `${this.altoBurbuja}em`;
            this.chatContainerElement.style.gridTemplateRows = `${this.altoBurbuja}em`;
            this.chatBurbujaElement.style.gridRow = 1;
            this.chatBurbujaElement.style.gridColumn = 1;
        }

        // Se reasigna la posibilidad de abrir la ventana
        this.burbujaActiva = true;
    }


    /**
     * Metodo que abre la conversacion seleccionada, oculta la lista de chats
     * y muestra el chat enviando los datos correspondientes al componente "conversacion"
     */
    abrirConversacion(chat) {
        this.chatSeleccionado = chat;
        this.chatAbierto = true;
    }


    /**
     * Metodo que cierra la conversacion y vuelve a mostrar la lista de chats
     */
    cerrarConversacion() {
        this.chatAbierto = false;
    }


    /**
     * Metodo que abre la seccion de agregar nuevo chat
     */
    agregarChat() {
        this.nuevoChat = true;
    }


    /**
    * Metodo que cierra la seccion de agregar nuevo chat
    */
    cerrarNuevo() {
        this.nuevoChat = false;
    }


    /**
     * Funcion que cambia el estatus de puntoNotif para mostrar el punto rojo de notificacion de mensaje.
     * Se ocupa un setTimeOut para evitar error ExpressionChangedAfterItHasBeenChecked
     */
    mostrarPuntoNotif(estatus) {
        setTimeout(() => {
            this.puntoNotif = estatus;
        }, 0); // El tiempo es 0 porque asi se ejecutara en la siguiente MacroTask del navegador, sin tener que esperar mas tiempo
    }


    /**
     * Funcion que abre la seccion de actualizar chat, en donde se cambian aspectos como agregar o eliminar miembros
     */
    abrirUpdate(accion) {
        this.accionUpdate = accion;
        this.updateChat = true;
        this.chatAbierto = false;
    }


    /**
     * Funcion que cierra la seccion de actualizar chat
     */
    cerrarUpdate() {
        this.updateChat = false;
        this.chatAbierto = true;
    }

}