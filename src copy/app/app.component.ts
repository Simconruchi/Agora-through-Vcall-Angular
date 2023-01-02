import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxAgoraSdkNgService, IRemoteUser, IMediaTrack } from 'ngx-agora-sdk-ng';
import { BehaviorSubject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, retry, take } from 'rxjs/operators';

export enum MediaStreamType {
  audio,
  video,
  all
};

export interface IMeetingUser {
  type: 'local' | 'remote';
  user?: IRemoteUser;
  mediaTrack?: IMediaTrack;
}

export class SoundMeter {

  private instant: number = 0.0;
  private script!: ScriptProcessorNode;
  private mic!: MediaStreamAudioSourceNode;

  constructor(public context: AudioContext) { }

  private internalConnect(stream: MediaStream, callback?: (event: any) => void): void {
    try {
      this.mic = this.context.createMediaStreamSource(stream);
      this.mic.connect(this.script);
      this.script.connect(this.context.destination);
      if (typeof callback !== 'undefined') {
        callback(null);
      }
    } catch (error) {
      if (typeof callback !== 'undefined') {
        callback(error);
      }
    }
  };

  public connect(
    stream: MediaStream,
    updatedValueCallback: (instant: any) => void,
    errorCallback?: (error: any) => void
  ): void {

    this.script = this.context.createScriptProcessor(2048, 1, 1);
    this.script.addEventListener('audioprocess', (event) => {
      const input = event.inputBuffer.getChannelData(0);
      let i;
      let sum = 0.0;
      for (i = 0; i < input.length; ++i) {
        sum += input[i] * input[i];
      }
      this.instant = Math.sqrt(sum / input.length);
      updatedValueCallback(this.instant.toFixed(2));
    });

    this.internalConnect(stream, errorCallback);

  }

}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  title = 'agora-Vcall';
  hide: boolean = true;
  token = null;
  channelName = null;
  localPlayer = null;
  remotePlayeList: any;

  private mediaDevicesInfos: MediaDeviceInfo[] = [];
  micDevicesInfos: MediaDeviceInfo[] = [];
  speakerDevicesInfos: MediaDeviceInfo[] = [];
  camDevicesInfos: MediaDeviceInfo[] = [];
  public selectedVideoInputId = new BehaviorSubject<string>('');
  private stream?: MediaStream;
  @ViewChild('camera') cameraElementRef!: ElementRef;
  public lastStream?: MediaStream;

  private soundMeter!: SoundMeter;
  @ViewChild("meter") meterRef!: ElementRef;


  user?: IRemoteUser;
  userList: IMeetingUser[] = [];
  mediaTrack?: IMediaTrack;
  url = 'https://ngx-agora-sdk-ng.herokuapp.com/access_token';
  // url = 'https://test-agora.herokuapp.com/access_token?';
  uid = null;

  public isCameraOff = false;
  public muteMic = false;

  callStarted = false;


  constructor(public router: Router,
    public agoraService: NgxAgoraSdkNgService,
    private httpClinet: HttpClient) { }

  ngOnInit(): void {
    // let token = this.getToken("test");
    this.uid = this.generateUid();
    // console.log("+@@@@@@@@@@@", token)
    this.token = "007eJxTYPBPi78zd21efN31xsv8e+KnCIoxsk38WPrGZYHF/CpO3VwFhhQDI4tUI7PEFONkcxNj8yRL49RES1PzpBQjw2RDS2ODib/XJzcEMjL0KZiwMDJAIIjPwlCSWlzCwAAA8wweFQ==";
    this.channelName = "test";
    this.localPlayer = "local-player";
    this.remotePlayeList = 'remote-playerlist';
    // const rtcDetails = this.generateTokenAndUid(this.uid);
    // console.log("rtcDetails", rtcDetails)
  }

  generateUid() {
    const length = 5;
    const randomNo = Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
    );
    return randomNo;
  }
  // async generateTokenAndUid(uid: number) {
  //   // https://test-agora.herokuapp.com/access_token?channel=test&uid=1234
  //   let url = 'https://test-agora.herokuapp.com/access_token?';
  //   const opts = {
  //     params: new HttpParams({ fromString: 'channel=test&uid=' + uid }),
  //   };
  //   const data = await this.getRequest(url, opts.params).toPromise();
  //   return { uid: uid, token: data['token'] };
  // }

  // public getRequest(url, params = {}) {
  //   return this.httpClinet.get(url, { params }).pipe(
  //     map(res => {
  //       return res;
  //     }),
  //     catchError(err => {
  //       return this.handleError(err);
  //     })
  //   );
  // }

  // getToken(channelName: string): void {
  //   this.httpClinet.get<string>(this.url, {
  //     params: {
  //       channel: channelName,
  //       // uid: uuid //TODO: UID does not work in token server the response token is not valid
  //     }
  //   }).pipe(
  //     retry(3),
  //     take(1),
  //     catchError(this.handleError)
  //   ).subscribe((token: any) => {
  //     this.token.next(token.token as string);
  //   });
  // }

  private handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }


  async startVideoCall() {
    console.log("Start call")
    this.getDeviceInfos().then(() => {
      console.log("calllllllllllll", this.camDevicesInfos)
      if (this.camDevicesInfos.length > 0) {
        console.log("call__")
        this.videoInputId = this.camDevicesInfos[0].deviceId;
        console.log(this.videoInputId)
        this.selectedVideoInputId.subscribe(id => {
          console.log("calllllll((((", id)

          this.startCameraMic(id);
        });
      }
      console.log(this.micDevicesInfos, "++++++++++++")
      this.connectWithAudio(this.micDevicesInfos[0].deviceId);
      this.callStarted = true;
      // this.joinVideo();

    })


    const remoteUserLeaveSubs = this.agoraService.onRemoteUserLeft().subscribe(leftuser => {
      this.userList = this.userList.filter(user => user.user?.uid !== leftuser.user.uid);
      // if (this.pinnedUser && this.pinnedUser.user?.uid && this.pinnedUser.user.uid === leftuser.user.uid) {
      //   this.pinnedUser = null;
      // }
      if (localStorage.getItem('user_type') != 'therapist' && this.userList.length === 1) {
        // this.onLocalLeave()
      }
    });

    console.log("remoteUserLeaveSubs", remoteUserLeaveSubs)
    const remoteUserChangeSubs = this.agoraService.onRemoteUsersStatusChange().subscribe(status => {
      switch (status.connectionState) {
        case 'CONNECTED':
          if (!this.userList.find(user => user.user?.uid === status.user.uid)) {
            this.userList.push({ type: 'remote', user: status.user });
          }
          break;
        case 'DISCONNECTED':
        case 'DISCONNECTING':
        case 'RECONNECTING':
          const currentUserIndex = this.userList.findIndex(user => user.user?.uid === status.user.uid);
          if (currentUserIndex >= 0) {
            this.userList[currentUserIndex] = { type: 'remote', user: status.user };
            // if (this.pinnedUser && this.pinnedUser.user?.uid && this.pinnedUser.user.uid === status.user.uid) {
            //   this.pinnedUser = { type: 'remote', user: status.user };
            // }
          }
          break;
      }
    });
    console.log("remoteUserChangeSubs", remoteUserChangeSubs)
    const localUserJoinedSubs = this.agoraService.onLocalUserJoined().subscribe(track => {
      console.log(" +=================userList", track)
      this.userList.push({ type: 'local', mediaTrack: track.track });
    });
    console.log(localUserJoinedSubs, "++++++++++++++")
    console.log(this.userList, "userList++++++++++++")
    this.agoraService.onRemoteUserJoined().subscribe(res => {
      console.log("Callllllllllllllllllllllllllllllll", res)
    }, (err => {
      console.log("errr==", err)
    }))
  }

  // async joinVideo(): Promise<void> {
  //   this.mediaTrack = await this.agoraService.join(this.channelName, this.token)
  //     .WithCameraAndMicrophone(this.micDevicesInfos[0].deviceId, this.camDevicesInfos[0].deviceId)
  //     .Apply();
  //   console.log("++++++++++++++++++++++this.mediaTrack", this.mediaTrack)
  // }

  async connectWithAudio(deviceId?: string) {
    const stream = await this.getMediaStream(MediaStreamType.audio, undefined, undefined, undefined, deviceId);
    if (!stream) {
      return;
    }
    this.soundMeter = new SoundMeter(new AudioContext());
    this.soundMeter.connect(stream!,
      (instant) => {
        console.log("instant", instant)
        this.meterRef ? this.meterRef.nativeElement.value = instant : null
      },
      (error) => console.debug('navigator.MediaDevices.getUserMedia error: ', error.message, error.name)
    );
  }

  public set videoInputId(id: string) {
    console.log(id)
    this.selectedVideoInputId.next(id);
  }

  async getDeviceInfos() {
    this.micDevicesInfos = await this.getMediaSources('audioinput');
    this.speakerDevicesInfos = await this.getMediaSources('audiooutput');
    this.camDevicesInfos = await this.getMediaSources('videoinput');
    console.log("+calllllllllllllspeakerDevicesInfos", this.speakerDevicesInfos)
  }

  async getMediaSources(kind: MediaDeviceKind) {
    try {
      //await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      this.mediaDevicesInfos = await this.agoraService.getDevices(); //await navigator.mediaDevices.enumerateDevices();
    } catch (error) {
      console.error(error);
    }
    finally {
      return this.mediaDevicesInfos.filter(mdi => mdi.kind === kind);
    }
  }

  async startCameraMic(camDeviceId?: string) {
    // if (this.isCameraOff) {
    // if (this.stream) {
    //   this.stream.getTracks().forEach(track => {
    //     track.stop();
    //   });
    // }
    // return;
    // }
    const mediaStreamType = MediaStreamType.video;
    this.stream = await this.getMediaStream(mediaStreamType, undefined, undefined, camDeviceId);

    this.cameraElementRef.nativeElement.srcObject = this.stream;
    this.cameraElementRef.nativeElement.onloadedmetadata = () => {
      this.cameraElementRef.nativeElement.play();
    };
  }

  async getMediaStream(type: MediaStreamType, videoWidth?: number, videoHeight?: number, videoDeviceId?: string, audioDeviceId?: string) {
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: false
    };
    if (type === MediaStreamType.audio || type === MediaStreamType.all) {
      constraints.audio = true;
      if (audioDeviceId) {
        constraints.audio = {
          deviceId: audioDeviceId
        }
      }
    }
    if (type === MediaStreamType.video || type === MediaStreamType.all) {
      constraints.video = true;
      if ((videoHeight && videoWidth) || videoDeviceId) {
        constraints.video = {
          width: videoWidth,
          height: videoHeight,
          deviceId: videoDeviceId
        };
      }
    }
    try {
      this.lastStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error(error);
    }
    finally {
      return this.lastStream;
    }
  }

  stopVideoCall() {
    console.log("Stop call")
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
    }
    this.callStarted = false;
    this.mediaTrack.stop();
    this.agoraService.leave();
    this.soundMeter.context.close();
    return;
  }

  turnOnOffCamera() {
    this.isCameraOff = !this.isCameraOff;
  }
  muteUnmuteCall() {
    this.muteMic = !this.muteMic;
    this.muteMic ? this.mediaTrack?.microphoneMute() : this.mediaTrack?.microphoneUnMute();
  }

  joinCall() {
  }
}
