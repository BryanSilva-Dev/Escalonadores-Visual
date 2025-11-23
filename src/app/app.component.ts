import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'App';
  teste = environment.urlApiBase;
  showMenu = false;
  showSearch = false;
  showFooter = false;
  environment = environment;

  constructor(
    private router: Router,
  ) { }

  ngOnInit(): void {

  }
}