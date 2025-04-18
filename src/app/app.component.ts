import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TisSmartTableViewerModule } from 'tis-smart-table-viewer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TisSmartTableViewerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tis-ng-smart-table-viewer';
}
