import { Component } from '@angular/core';
import { AuthService } from '../authService/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  constructor(private auth: AuthService, private route:Router) {}
  accountTab() {
    if (this.auth.isAuthenticated$()) {
      this.route.navigateByUrl('/tabs/account')
    }else{
      this.route.navigateByUrl('/tabs/home')
    }
  }
}
