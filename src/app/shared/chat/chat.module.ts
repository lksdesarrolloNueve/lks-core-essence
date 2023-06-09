import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatComponent } from './chat.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ListaChatComponent } from './lista-chat/lista-chat.component';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { ConversacionComponent } from './conversacion/conversacion.component';
import { NuevoChatComponent } from './nuevo-chat/nuevo-chat.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { UpdateChatComponent } from './conversacion/update-chat/update-chat.component';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
    imports: [ RouterModule, CommonModule, NgbModule ,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatTableModule,
        MatTabsModule,
        MatCheckboxModule,
        MatMenuModule
    ],
    declarations: [
        ChatComponent,
        ListaChatComponent,
        ConversacionComponent,
        NuevoChatComponent,
        UpdateChatComponent
     ],
    exports: [ ChatComponent ]
})

export class ChatModule {}