import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppNavTab } from '../../../core/models/app-nav.model';
import { APP_BRAND_LINK, APP_BRAND_TITLE, NAV_TABS } from '../../constants';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-nav.component.html',
  styleUrl: './app-nav.component.scss',
})
export class AppNavComponent {
  brandTitle = input(APP_BRAND_TITLE);
  brandLink = input(APP_BRAND_LINK);

  readonly tabs: AppNavTab[] = [...NAV_TABS];
}
