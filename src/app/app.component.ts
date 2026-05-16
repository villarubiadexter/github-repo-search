import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SOURCE_CODE_URL } from './shared/constants';
import { AppNavComponent } from './shared/components/app-nav/app-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  readonly sourceCodeUrl = SOURCE_CODE_URL;
}
