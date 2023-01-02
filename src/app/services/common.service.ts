import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { StreamService } from './stream.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CommonService {
    uid1: any = "63abd6402f07770016bd56af";
    uid2: any = "63aade464a3f3c0016b2bc8f";
    name1 = 'User 1';
    name2 = 'User 2';
    newUserJoined: Subject<any> = new Subject<any>();

    // public message: MessagingService,
    constructor(public stream: StreamService, public api: ApiService) { }
    // rtc token
    async generateTokenAndUid(uid: any) {
        // let url = 'https://test-agora.herokuapp.com/access_token?channel=test&uid=1234'
        // let url = 'https://test-agora.herokuapp.com/access_token?';
        let url = 'https://snah-api-ver2-dev.herokuapp.com/api/pharmacy/calluser'
        // const opts = {
        //   params: new HttpParams({ fromString: 'channel=test&uid=' + uid }),
        // };
        const data = await this.api.postRequest(url, { user: uid }).toPromise();
        return { uid: uid, token: data['token'] };
        // return "006e083c376ed644d0c8887e9ebdb48f36/dIACmiaALwoJjlClMlnw4uAA9MXJpp+jKFze+qT3JpKuJd82HeWEAAAAAEACxSyfBmKuzYwEAAQAoaLJj";
    }

    async generateRtmTokenAndUid(uid: any) {
        // https://sharp-pouncing-grass.glitch.me/rtmToken?account=1234
        let url = 'https://sharp-pouncing-grass.glitch.me/rtmToken?';
        const opts = { params: new HttpParams({ fromString: 'account=' + uid }) };
        const data = await this.api.getRequest(url, opts.params).toPromise();
        console.log(data['key'], "+++++++++++")
        return { uid: uid, token: data['key'] };
    }

    // async generateRtmTokenAndUid2(uid: string) {
    //   // https://sharp-pouncing-grass.glitch.me/rtmToken?account=1234
    //   let url = 'https://darkened-coffee-chicory.glitch.me/rtmToken?';
    //   const opts = { params: new HttpParams({ fromString: 'account=' + uid }) };
    //   const data = await this.api.getRequest(url, opts.params).toPromise();
    //   return { uid: uid, token: data['key'] };
    // }

    generateUid() {
        const length = 5;
        const randomNo = Math.floor(
            Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
        );
        return randomNo;
    }

    getNewUserInfo(peerId: string) {
        this.newUserJoined.next({ peerId });
    }
}
