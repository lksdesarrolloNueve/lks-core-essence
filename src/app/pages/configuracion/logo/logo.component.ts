import { Component, OnInit } from '@angular/core';
import { GestionGenericaService } from '../../../../app/shared/service/gestion';
import { AngularFireStorage } from '@angular/fire/storage';
import { FiresbaseService } from "../../../shared/service/service-firebase/firebase.service";
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/firestore';
/**
 * @title Card with multiple sections
 */
@Component({
    selector: 'logo',
    templateUrl: 'logo.component.html'
})

export class LogoComponent implements OnInit {

    //Declaracion de variables y componentes
    id: any;
    url: any;
    cveLogo = 'LOGO';

    /**
     * Construtor de la clase
     * @param firestore - Gestor de consultas en tiempo real
     * @param fireService - Service firebase
     * @param storage - Instancia para el almacenamiento en la. nube
     * @param mensaje - Gestor de acceso a mensajeria
     */
    constructor(
        private firestore: AngularFirestore,
        private fireService: FiresbaseService,
        private storage: AngularFireStorage,
        private mensaje: GestionGenericaService) {

    }

    /**
     * Método init.
     */
    ngOnInit(): void {

        this.spsLogo();

    }

    /**
     * Metodo para subir el logo
     * @param archivo - Archivo a subir
     */
    subirFoto(archivo) {

        let imagen = archivo.target.files[0];
        let path = 'galeria/' + imagen.name;

        const fileRef = this.storage.ref(path);
        const task = this.storage.upload(path, imagen);
      
        //si esta vacio se inserta si no solo se actualiza
        if (!this.id) {
          
            task.snapshotChanges().pipe(
                finalize(() => {
                    fileRef.getDownloadURL().subscribe(urlImage => {
                        let url = urlImage;

                        this.fireService.insertar("galeria", {
                            cveImage: 'LOGO',
                            urlImage: url

                        }).then((e) => {

                            this.mensaje.showNotification('top', 'right', 2, 'Se registro correctamente');
                        }, (error) => {
                            this.mensaje.showNotification('top', 'right', 3, 'Hubo un error al registrar');

                        });
                    }
                    )
                }
                )
            ).subscribe();

        } else {
        
            task.snapshotChanges().pipe(
                finalize(() => {
                    fileRef.getDownloadURL().subscribe(urlImage => {
                        let url = urlImage;

                        this.fireService.actualiza("galeria", this.id, {
                            cveImage: 'LOGO',
                            urlImage: url
                        }).then((e) => {

                            this.mensaje.showNotification('top', 'right', 2, 'Se actualizo correctamente');
                        }, (error) => {
                            this.mensaje.showNotification('top', 'right', 3, 'Hubo un error al registrar');

                        });
                    }
                    )
                }
                )
            ).subscribe();
        }

    }


    /**
     * Metodo para obtener el logo
     */
    spsLogo() {
        this.firestore.collection("galeria", ref => ref.where('cveImage', '==', this.cveLogo)
        ).snapshotChanges().subscribe((res) => {
            res.forEach((p: any) => {
                this.id = p.payload.doc.id;
                this.url = p.payload.doc.data().urlImage;
            });
        });
    }

}