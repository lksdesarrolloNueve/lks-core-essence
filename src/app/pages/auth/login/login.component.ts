import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { EncryptDataService } from '../../../shared/service/encryptdata'
import { KeycloakProfile } from 'keycloak-js';
import { AuthService } from '../../../auth/service/auth.service';


@Component({
    selector: 'login',
    moduleId: module.id,
    templateUrl: 'login.component.html'
})

export class LoginComponent implements OnInit {

    //Declaracion de variables y componentes
    public loggedIn: boolean = false;
    public userProfile: KeycloakProfile = {};
  
    constructor(private authService: AuthService) {}
  
    async ngOnInit(): Promise<void> {
      this.loggedIn = await this.authService.isLoggedIn();
      if (this.loggedIn) {
          this.userProfile = await this.authService.loadUserProfile();
      }
    }
  
    public login(): void {
      this.authService.login();
    }
  
    public logout(): void {
      this.authService.logout();
    }

}