import { Component, OnInit } from '@angular/core';
import { IMediaTrack, NgxAgoraSdkNgService } from 'ngx-agora-sdk-ng';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements OnInit {
  userName: string = null;
  mediaTrack?: IMediaTrack;
  token = null;
  channelName = null;

  micDevicesInfos: MediaDeviceInfo[] = [];
  speakerDevicesInfos: MediaDeviceInfo[] = [];
  camDevicesInfos: MediaDeviceInfo[] = [];
  private mediaDevicesInfos: MediaDeviceInfo[] = [];

  constructor(public agoraService: NgxAgoraSdkNgService) { }

  ngOnInit(): void {
    this.token = "007eJxTYPBPi78zd21efN31xsv8e+KnCIoxsk38WPrGZYHF/CpO3VwFhhQDI4tUI7PEFONkcxNj8yRL49RES1PzpBQjw2RDS2ODib/XJzcEMjL0KZiwMDJAIIjPwlCSWlzCwAAA8wweFQ==";
    this.channelName = "test";
    this.getDeviceInfos();
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

  async joinVideoCall() {
    this.mediaTrack = await this.agoraService.join(this.channelName, this.token)
      .WithCameraAndMicrophone(this.micDevicesInfos[0].deviceId, this.camDevicesInfos[0].deviceId)
      .Apply();
    console.log("++++++++++++++++++++++this.mediaTrack", this.mediaTrack)
  }

  leaveVideoCall() {

  }
}
