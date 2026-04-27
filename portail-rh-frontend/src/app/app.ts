import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}