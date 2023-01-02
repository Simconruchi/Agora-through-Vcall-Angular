import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StreamService } from '../services/stream.service';
import { CommonService } from './../services/common.service';
import { MessagingService } from './../services/messaging.service';
import { timer } from 'rxjs';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staging',
  templateUrl: './staging.component.html',
  styleUrls: ['./staging.component.scss']
})
export class StagingComponent implements OnInit {
  urlId: string;
  userName = '';
  toggleCamera = false;
  isVideoStreaming = false;
  toggleAudio = false;
  isAudioStreaming = false;

  @ViewChild('streamVideo') video;
  @ViewChild('streamAudio') audio;

  @ViewChild('streamVideo1') video1;
  @ViewChild('streamAudio1') audio1;

  callStarted: boolean = false;

  second;
  hours;
  minutes;
  subscriptions: Subscription[] = [];

  constructor(
    public activateRoute: ActivatedRoute,
    public common: CommonService,
    public stream: StreamService,
    public router: Router,
    public message: MessagingService) {

    this.urlId = this.activateRoute.snapshot.params['id'];
    if (this.urlId == '1') {
      // this.common.uid1 = this.common.generateUid();
      this.common.uid1 = "63abd6402f07770016bd56af";
      this.userName = this.common.name1;
    } else {
      // this.common.uid2 = this.common.generateUid();
      console.log("callll")
      this.common.uid2 = "63aade464a3f3c0016b2bc8f";
      this.userName = this.common.name2;
    }


    this.subscriptions.push(
      this.common.newUserJoined.subscribe(async (data) => {
        console.log("newUserJoined---", data)
        if (data) {
          console.log(this.message.rtmclient, "++++++++++")
          try {
            const user = await this.message.rtmclient.getUserAttributes(
              data
            ); // senderId means uid getUserInfo
            console.log('userinfo newUserJoined', data, user);
            console.log("this.stream", this.stream)
            console.log("remoteUsers======", this.stream.remoteUsers.length)
          } catch (error) {
            console.log(error);
          }
        }
      })
    );

    this.stream.updateUserInfo.subscribe(async (id) => {
      console.log("calllllllll", id, this.stream)
      if (id) {
        try {
          const user = await this.message.rtmclient.getUserAttributes(
            id
          ); // senderId means uid getUserInfo
          console.log('user getUserInfo', this.stream.remoteUsers);
          this.recoredTime();
          this.callStarted = true;
          for (let index = 0; index < this.stream.remoteUsers.length; index++) {
            const element = this.stream.remoteUsers[index];
            console.log(element, 'user getUserInfo remoteUsers');
            if (element.uid == id) {
              element.name = user.name;
            }
          }
        } catch (error) {
          console.log(error, 'error');
        }
      }
    });

  }

  ngOnInit(): void {
    try {
      this.rtmUserLogin(this.getUserId());
    } catch (error) {
      console.log(error);
    }
  }

  // VIDEO ON/OFF SET
  setVideo() {
    console.log("callll", this.stream.videoStatus)
    if (!this.stream.videoStatus) {
      this.toggleCamera = true;
      this.stream.videoStatus = true;
      this.isVideoStreaming = true;
      this.openCamera(this.video);
    }
    else {
      this.stop(this.video);
      this.toggleCamera = false;
      this.stream.videoStatus = false;
      this.isVideoStreaming = false;
    }
  }

  openCamera(option) {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        console.log("Video Strem---", stream)
        if (this.toggleCamera)
          this.isVideoStreaming = true;
        else
          this.isVideoStreaming = false;
        option.nativeElement.srcObject = stream;
        option.nativeElement.play();
      })
      .catch((err) => {
        console.log("An error occurred: " + err);
        if (err == 'NotAllowedError: Permission denied') {
          console.log("err--", err)
          this.stream.errorValue = 'miccamera';
        }
      });
  }

  stop(option) {
    if (option) {
      const stream = option.nativeElement.srcObject;
      if (stream) {
        const tracks = stream.getTracks();

        for (let i = 0; i < tracks.length; i++) {
          const track = tracks[i];
          track.stop();
          track['enabled'] = false;
        }
      }
      option.nativeElement.srcObject = null;
    }
  }


  // AUDIO ON/OFF SET
  async setAudio() {
    if (!this.stream.audioStatus) {
      this.toggleAudio = true;
      this.stream.audioStatus = true;
      this.isAudioStreaming = true;
      this.onAudio();
    }
    else {
      this.toggleAudio = false;
      this.stream.audioStatus = false;
      this.isAudioStreaming = false;
      this.audio.nativeElement.srcObject = null;
    }
  }

  onAudio() {
    navigator.mediaDevices.getUserMedia({ video: false, audio: true })
      .then((stream) => {
        console.log("Audio Strem===", stream)
        if (this.toggleAudio)
          this.isAudioStreaming = true;
        else
          this.isAudioStreaming = false;
        this.audio.nativeElement.srcObject = stream;
        this.audio.nativeElement.play();
      })
      .catch((err) => {
        console.log("An error occurred: " + err);
        if (err == 'NotAllowedError: Permission denied') {
          console.log("err--", err)
          this.stream.errorValue = 'miccamera';
        }
      });
  }

  // START VIDEO CALL
  async startCall() {
    try {
      if (this.userName) {
        // const uid = this.common.generateUid();
        const uid = this.getUserId();
        const rtcDetails = await this.common.generateTokenAndUid(uid);
        this.stream.rtc.token = rtcDetails.token;
        // rtc
        this.stream.rtc.client = this.stream.createRTCClient('host');
        this.stream.agoraServerEvents(this.stream.rtc);
        // this.deviceToggle();
        // this.router.navigate([`/user/${this.urlId}`]);
        await this.stream.localUser(
          rtcDetails.token,
          uid,
          'host',
          this.stream.rtc
        );
        this.callStarted = true;
        this.recoredTime();
        if (this.isVideoStreaming) {
          this.openCamera(this.video1);
        }
        console.log("stream----", this.stream)
        // this.message.sendMessageChannel(this.message.channel, 'ping');

        // this.hideBtns = false;
      } else {
        alert('Enter name to start call');
      }
    } catch (error) {
      console.log(error);
      this.callStarted = false;
    }
  }

  getUserId() {
    return this.urlId == '1' ? this.common.uid1 : this.common.uid2;
  }

  recoredTime() {
    this.second = timer(0, 1000);
    this.second.subscribe(t => {

      this.second = t % 60;
      this.hours = Math.floor(t / 60 / 60);

      this.minutes = Math.floor(t / 60)
    })
  }

  setVideo1() {
    console.log("callll", this.stream.videoStatus)
    if (!this.stream.videoStatus) {
      this.toggleCamera = true;
      this.stream.videoStatus = true;
      this.isVideoStreaming = true;
      this.openCamera(this.video1);
    }
    else {
      this.stop(this.video1);
      this.toggleCamera = false;
      this.stream.videoStatus = false;
      this.isVideoStreaming = false;
    }
  }

  async setAudio1() {
    if (!this.stream.audioStatus) {
      this.toggleAudio = true;
      this.stream.audioStatus = true;
      this.isAudioStreaming = true;
      this.onAudio();
    }
    else {
      this.toggleAudio = false;
      this.stream.audioStatus = false;
      this.isAudioStreaming = false;
      this.audio.nativeElement.srcObject = null;
    }
  }

  // END CALL
  endCall() {

  }


  //////////////////////////////////////////
  async rtmUserLogin(uid: any) {
    try {
      this.message.rtmclient = this.message.createRTMClient(this.stream.options.appId);

      this.message.channel = this.message.createRtmChannel(
        this.message.rtmclient
      );
      const rtmDetails = await this.common.generateRtmTokenAndUid(uid);

      await this.message.signalLogin(
        this.message.rtmclient,
        rtmDetails.token,
        uid.toString()
      );
      await this.message.joinchannel(this.message.channel);
      await this.message.setLocalAttributes(
        this.message.rtmclient,
        this.userName
      );
      this.message.rtmEvents(this.message.rtmclient);
      this.message.receiveChannelMessage(
        this.message.channel,
        this.message.rtmclient
      );
    } catch (error) {
      console.log(error);
    }
  }

  // JOIN CALL
  async joinCall() {
    // const uid = this.common.generateUid();
    const uid = this.getUserId();
    // const rtcDetails = await this.common.generateTokenAndUid(uid);
    console.log("uiduiduiduiduiduiduid", uid)
    this.stream.rtcLiveUser.client = this.stream.createRTCClient('live');
    this.stream.agoraServerEvents(this.stream.rtcLiveUser);
    await this.stream.localUser(
      "006e083c376ed644d0c8887e9ebdb48f36dIAAR8gS9KCJ5CauG13bBtYbV5w0yzfPPW331iyfdRhMo282HeWEAAAAAEACCF2IMSQW0YwEAAQDZwbJj",
      uid,
      'live',
      this.stream.rtcLiveUser
    );
  }

}
