import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { SidebarModule } from './sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule} from './shared/navbar/navbar.module';
import { FixedPluginModule} from './shared/fixedplugin/fixedplugin.module';

import { AppComponent } from './app.component';
import { AppRoutes, AppRoutingModule } from './app-routing.module';

import esMX from '@angular/common/locales/es-MX'; //Editado

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from "./pages/auth/login/login.component";
import { StartupConfigService } from "./shared/service/startup-config.service";
import { HttpClientModule } from "@angular/common/http";
import { CombosClienteService, GestionGenericaService } from "./shared/service/gestion";
import { EncryptDataService } from "./shared/service/encryptdata";
import { BrowserModule } from "@angular/platform-browser";
import {  NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CurrencyPipe, DatePipe, registerLocaleData } from "@angular/common";
import { BlockUIModule } from "ng-block-ui";
import { NgIdleModule } from '@ng-idle/core';

// 1. Import the libs you need
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';

import { AuthModule } from './auth/auth.module';


import { environment } from '../environments/environment';
import { AngularFireStorageModule } from "@angular/fire/storage";
import { ChatModule } from "./shared/chat/chat.module";
//import { DragDropModule } from "@angular/cdk/drag-drop";
//DragDropModule,

registerLocaleData(esMX);

/**
 *  Carga de configuracion
 * @param appConfig - componente de configuracion
 */
 export function initConfig(startupService: StartupConfigService) {
  return () => startupService.load();
}



@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(AppRoutes,{
      useHash: true
    }),
    SidebarModule,
    NavbarModule,
    ChatModule,
    FooterModule,
    FixedPluginModule,
    BlockUIModule.forRoot(),
    AuthModule,
    NgIdleModule.forRoot(),
  ],
  providers: [
    StartupConfigService,
    { provide: APP_INITIALIZER, useFactory: initConfig, deps: [StartupConfigService], multi: true },
    { provide: LOCALE_ID, useValue: "es-MX" },
    GestionGenericaService, CombosClienteService,EncryptDataService, DatePipe, CurrencyPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
