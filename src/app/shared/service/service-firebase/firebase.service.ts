import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FiresbaseService {


  constructor(
    private firestore: AngularFirestore
  ) { }

  //Registra la informacion
  public insertar(tabla: string, data: any) {
    return this.firestore.collection(tabla).add(data);
  }

  //Obtiene un registro por ID
  public consultaID(tabla: string, documentId: string) {
    return this.firestore.collection(tabla).doc(documentId).snapshotChanges();
  }

  //Obtiene todos losregistros
  public lista(tabla: string) {
    return this.firestore.collection(tabla).snapshotChanges();
  }

  //Actualiza un registro
  public actualiza(tabla: string, documentId, data: any) {
    return this.firestore.collection(tabla).doc(documentId).set(data);
  }

  //eliminar
  public elimina(tabla: string, documentId){
    return this.firestore.collection(tabla).doc(documentId).delete();
  }


}