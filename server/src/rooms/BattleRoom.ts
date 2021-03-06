import { Room, Client, matchMaker } from "colyseus";
import { Stuff } from "./schema/Stuff";
import * as readline from 'readline';

let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
/////////////////////////////////////////
//
//      FNFNet
//        Created by bit of trolling
//      Legend:
//      test - amount of users
//      theY - y position of chatText
//      
//
/////////////////////////////////////////
/*
      this.onMessage("string", async (client, message) => {

    }
        if (message.join){
            const room = await matchMaker.createRoom("battle", { mode: "duo" });
            
        }
    });
*/
interface PlayerData {
  name:string,
  ready:boolean,
  score:number
  finished:boolean
}
export class BattleRoom extends Room<Stuff> {
  scorep1:number;
  scorep2:number;

  startedGame:boolean = false;

  player1:PlayerData = {name: 'guest', ready: false, score: 0, finished: false};
  player2:PlayerData = {name: 'guest', ready: false, score: 0, finished: false};
  
  p1ready:Boolean;
  p2ready:Boolean;

  song: string;
  diff: number;
  week: number;
  maxClients = 2;
  public static stuff: string;
  onCreate (options: any) {
    this.setState(new Stuff());
    this.autoDispose = true;
    this.song = "";
    this.diff = 0;
    this.week = 0
    this.scorep1 = 0;
    this.scorep2 = 0;
    this.roomId = this.genID();
    console.log(this.roomId);
    
    this.onMessage('misc', (client, message) => {
      try{
        if(client.sessionId == this.clients[0].sessionId) this.p1ready = message.ready;
        else this.p2ready = message.ready;
        if(this.p1ready && this.p2ready){
          this.startedGame = true
          this.broadcast('start');
        }
        this.broadcast('misc', {p1: this.p1ready, p2: this.p2ready});
      }catch(e){
        console.log(e);
      }
    });
    this.onMessage('songname', (client, message) => {
      this.setMetadata({song: message.song});
      this.song = message.song;
      this.diff = message.diff;
      this.week = message.week
      try{
        client.send("creatematch", {song: message.song, diff: message.diff, week: message.week});
      }catch(err){
        console.log(err);
      }
    });
    this.onMessage('recvprev', (client, message) => {
      if(client.sessionId == this.clients[0].sessionId) {
        this.player1.name = message.name;
      }
      else {
        this.player2.name = message.name;
        this.broadcast('userjoin', {name: message.name});
      }
    });
    this.onMessage('chatHist', (client, message) => {
      if(this.clients[0].sessionId == client.sessionId){
        this.player1.name = message.name;
      }else {
        this.player2.name = message.name;
      }
      this.broadcast('chatHist', {p1name: this.player1.name, p2name: this.player2.name});
    });
    this.onMessage("message", (client, message) => {
      if(this.startedGame){
        if(client.sessionId == this.clients[0].sessionId){
          switch(message.rating){
            case 'shit':
              this.scorep1 += 50;
            case 'bad':
              this.scorep1 += 100;
            case 'good':
              this.scorep1 += 200;
            case 'sick':
              this.scorep1 += 350;
          }
        }else{
          switch(message.rating){
            case 'shit':
              this.scorep2 += 50;
            case 'bad':
              this.scorep2 += 100;
            case 'good':
              this.scorep2 += 200;
            case 'sick':
              this.scorep2 += 350;
          }
        }
        try{
          this.broadcast("retscore", {p1score: this.scorep1, p2score: this.scorep2});
        }catch(error){
          console.log(error);
        }
      }
    });
  }
  onJoin (client: Client, options: any) {
    console.log('client joined');
    if(this.clients.length != 2) try{ client.send("message", {iden: this.roomId}); }catch(error){ console.log(error); }
    if(this.clients.length >= 2) {
      try{
        setTimeout(() => {
          if(this.clients.length >= 2) this.clients[1].send('message', {song: this.song, diff: this.diff, week: this.week, p1name: this.player1.name});
        }, 2000);
      }catch(error){ console.log(error); }
    }
  }

  onLeave (client: Client, consented: boolean) {
    if(client.sessionId == this.clients[0].sessionId && !this.startedGame){
      for(let i = 0; i<this.clients.length; i++){
        this.clients[i].leave();
      }
    }else{
      this.player2.name = '';
      this.p2ready = false;
      this.broadcast('userleft', {})
      this.lock();
    }
    console.log("the score is: " + this.scorep1);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  safeSend(type:string, data:any = {}){ //DEPRECATED DONT USE!
    if(this.clients.length<2) this.clients[0].send(type, data);
    else{
      this.clients[0].send(type, data);
      this.clients[1].send(type, data);
    }
  }

  genID(){
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJLKMNOPQRSTUVWXYZ123456789#';
    var bullarray:string = '';
    for(var i = 0; i < 5; i++){
      bullarray += chars[Math.floor(Math.random() * (chars.length - 1 + 1) + 0)];
    }
    return bullarray;
  }

}