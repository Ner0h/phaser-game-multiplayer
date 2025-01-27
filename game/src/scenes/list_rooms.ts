import * as Phaser from 'phaser';
import { Socket } from "socket.io-client";

//Components
import { roomsContainerHTML, singleRoomContainer, span } from '../html/list_rooms.html';

//Custom Interfaces
import { RoomInfo } from '../interfaces/interfaces'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'ListRooms',
};

export default class ListRooms extends Phaser.Scene {
  constructor(private socket: Socket) {
    super(sceneConfig);
  }

  private HTML!: Phaser.GameObjects.DOMElement;

  public preload() {
  }

  loadUI() {
    this.HTML = this.add.dom(window.innerWidth / 2, window.innerHeight / 2).createFromHTML(roomsContainerHTML)
    //this.roomsButton = this.add.dom(window.innerWidth - 240, window.innerHeight - 10, 'button', selectionButtonStyle, 'SALAS').setOrigin(0);
    const container = this.HTML.getChildByID('container');
    container.querySelectorAll('button').forEach((object: any) => {
      object.addEventListener('pointerover', () => {
        object.style.opacity = "0.8"
      })
      object.addEventListener('pointerout', () => {
        object.style.opacity = "1"
      })
      object.addEventListener('click', () => {
        object.style.opacity = "0.6"
      })
    })

    const generateRoomContainerElement = (roomId: string, value: RoomInfo) =>
    `
    <a roomId="${roomId}">
      <div style="${singleRoomContainer}">
        <span style="${span}">${value.owner}</span>
        <span style="${span}">${value.playersCount}/${value.capacity}</span>
        <span style="${span}">${value.map}</span>
      </div>
    </a>
    `
    const roomsContainer = this.HTML.getChildByID('rooms_container');
  
    this.socket.emit('getAllRooms')

    this.socket.on('receivedAllRooms', (activeRooms: { [key: string]: RoomInfo }) => {

      Object.keys(activeRooms).forEach(roomId => {
        roomsContainer.innerHTML += generateRoomContainerElement(roomId, activeRooms[roomId])
      })

      roomsContainer.querySelectorAll('a').forEach(object => {
        const roomId = object.getAttribute('roomId')!;

        object.addEventListener('pointerover', () => {
          object.style.opacity = "0.8"
        })
        object.addEventListener('pointerout', () => {
          object.style.opacity = "1"
        })
        object.addEventListener('click', () => {
          object.style.opacity = "0.6"
          this.socket.emit('joinRoom', roomId)
        })
      })

      this.socket.on('enterInRoom', (roomId: string) => {
        this.scene.start('Gravel', { ...activeRooms[roomId], roomId });
      });

      this.socket.on('fullRoom', () => {
        console.log('Esta sala esta cheia')
      });

      this.socket.on('roomNotExists', () => {
        console.log('Esta sala não existe mais')
      });

    });

    const createRoomButton = this.HTML.getChildByID('create_room_button');
    createRoomButton.addEventListener('click', () => {
      this.scene.start('CreateRoom');
    })
  }

  public create() {
    this.loadUI()
  }
 
  public update() {
  }
}