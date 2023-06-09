import { Component } from '@angular/core';
import { FiresbaseService } from './shared/service/service-firebase/firebase.service';
import { GestionGenericaService } from './shared/service/gestion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lks-gold';

  constructor(private firebase: FiresbaseService,private service: GestionGenericaService) {
   //  this.registraAviso();
    this.listaAvisos();
  }


  /**
  * Metodo que sirve para registrar un aviso
  */
  registraAviso() {
    this.firebase.insertar("aviso_cajas", {
      id_aviso: "01222",
      descripcion: "Prueba de Mensajeria Prueba"
    }).then(() => {
      //this.fireService.openSnackBar("La venta se registro correctamente.");
    }, (error) => {
      //this.fireService.openSnackBar("Hubo un error al registrar la venta.");
    });
  }


  /**
* metodo que lista los aviso_cajas en el combo
*/
  listaAvisos() {
    this.firebase.lista("aviso_cajas").subscribe((res) => {
      res.forEach((p: any) => {

        this.service.showNotification('top', 'right', 4, p.payload.doc.data().descripcion);

        this.firebase.elimina("aviso_cajas",p.payload.doc.id);

      })
    });
  }


}
