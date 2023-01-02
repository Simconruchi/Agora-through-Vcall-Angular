import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  urlId: string;
  userName = '';

  constructor(private activateRoute: ActivatedRoute,
    public common: CommonService) {
    this.urlId = this.activateRoute.snapshot.params['id'];
    if (this.urlId == '1') {
      // this.common.uid1 = this.common.generateUid();
      this.common.uid1 = "63abd6402f07770016bd56af";
      this.userName = this.common.name1;
    } else {
      this.common.uid2 = this.common.generateUid();
      this.userName = this.common.name2;
    }
  }

  ngOnInit(): void {


  }

}
