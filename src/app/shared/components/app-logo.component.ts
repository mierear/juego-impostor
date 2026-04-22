import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo-container" [class]="'logo-' + size">
      <img
        src="assets/icon/logo-impostor.svg"
        alt="Logo Impostor"
        class="logo-image"
        [class.animated]="animated"
      />
    </div>
  `,
  styles: [`
    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-lg {
      width: 280px;
      height: 280px;
    }

    .logo-md {
      width: 200px;
      height: 200px;
    }

    .logo-sm {
      width: 120px;
      height: 120px;
    }

    .logo-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.3)) drop-shadow(0 0 8px rgba(6, 182, 212, 0.2));
      transition: transform 0.3s ease, filter 0.3s ease;

      &:hover {
        transform: scale(1.08);
        filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.5)) drop-shadow(0 0 12px rgba(6, 182, 212, 0.4));
      }
    }

    .logo-image.animated {
      animation: float 3s ease-in-out infinite, glow 2.5s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-15px);
      }
    }

    @keyframes glow {
      0%, 100% {
        filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.4)) drop-shadow(0 0 10px rgba(6, 182, 212, 0.3));
      }
      50% {
        filter: drop-shadow(0 0 25px rgba(167, 139, 250, 0.6)) drop-shadow(0 0 15px rgba(6, 182, 212, 0.5));
      }
    }
  `]
})
export class AppLogoComponent {
  @Input() size: 'lg' | 'md' | 'sm' = 'md';
  @Input() animated: boolean = true;
}
