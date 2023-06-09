import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {

  ngOnInit() { }

  /**
   * Funcion que se activa al terminar de arrastrar la burbuja de chat.
   * Se reposiciona la burbuja si llega a salir del viewport.
   */
  reposicionarChat(event: CdkDragEnd) {
    let chat = document.getElementById("chat");
    // Se obtienen las coordenadas a las que se movio la burbuja de chat
    let coordenadas = event.source.getFreeDragPosition();
    let pantallaAlto = window.innerHeight;
    let pantallaAncho = window.innerWidth;
    let burbujaAlto = chat.offsetHeight;
    let burbujaAncho = chat.offsetWidth;
    let nuevasCoordenadas = { x: coordenadas.x, y: coordenadas.y };

    // Si la burbuja se mueve fuera de las coordenadas del viewport, se asigna la coordenada adecuada para devolverla
    // Si sale por arriba
    if ((coordenadas.y - burbujaAlto) < -pantallaAlto) nuevasCoordenadas.y = -pantallaAlto + burbujaAlto;
    // // Si sale por abajo
    if (coordenadas.y > 0) nuevasCoordenadas.y = 0;
    // // Si sale por la izquierda
    if ((coordenadas.x - burbujaAncho) < -pantallaAncho) nuevasCoordenadas.x = -pantallaAncho + burbujaAncho;
    // // Si sale por la derecha
    if (coordenadas.x > 0) nuevasCoordenadas.x = 0;

    event.source._dragRef.setFreeDragPosition({ x: nuevasCoordenadas.x, y: nuevasCoordenadas.y });
  }

}
