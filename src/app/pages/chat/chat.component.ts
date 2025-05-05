import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { MensajesService } from '../../services/mensajes/mensajes.service';
import { AuthService } from '../../services/auth/auth.service';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  mensajes: any[] = [];
  mensaje: string = '';
  usuarioId: number | null = null;
  plegado: boolean = true;

  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef;

  constructor(
    private mensajesService: MensajesService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2 
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.usuarioId = await this.authService.obtenerIdUsuario();
      this.mensajesService.mensajes$.subscribe((mensajes) => {
        this.mensajes = [...mensajes];
        this.cdr.detectChanges();
        this.scrollToBottom();
      });
      await this.mensajesService.obtenerMensajes();
    } catch (error) {
      console.error('Error al inicializar el chat:', error);
    }
  }

  async enviarMensaje(): Promise<void> {
    const mensajeTrimmed = this.mensaje.trim();
    if (mensajeTrimmed) {
      try {
        await this.mensajesService.enviarMensaje(mensajeTrimmed);
        this.mensaje = '';
        this.cdr.detectChanges(); 
        this.scrollToBottom(); 
      } catch (error) {
        console.error('Error al enviar el mensaje:', error);
      }
    }
  }

  toggleSidebar(): void {
    this.plegado = !this.plegado;
    const contentElement = document.querySelector('.content');
    if (contentElement) {
      if (this.plegado) {
        this.renderer.removeClass(contentElement, 'chat-desplegado');
      } else {
        this.renderer.addClass(contentElement, 'chat-desplegado');
      }
    }
  }

  scrollToBottom(): void {
    try {
      setTimeout(() => {
        const container = this.mensajesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }, 0);
    } catch (error) {
      console.error('Error al desplazarse al último mensaje:', error);
    }
  }
}
