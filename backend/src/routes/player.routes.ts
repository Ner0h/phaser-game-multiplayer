import { Server, Socket } from 'socket.io'
import { Player, Chat } from '../interfaces/interfaces'

let playersInRoom: { [roomId: string]: { [key: string]: Player } } = {};
let chatInRoom: { [roomId: string]: Chat[] } = {};

export default function PlayerRoutes (io: Server, socket: Socket) {

    socket.on("playerEntered", (roomId: string) => {
        //add player to list
        playersInRoom[roomId] = {
            [socket.id]: {
                x: 400,
                y: 400,
                flipped: false,
                animation: 'player_idle'
            }
        }

        const initialInformations = {
            players: playersInRoom[roomId],
            chat: chatInRoom[roomId] ?? []
        }
        // on new player created, send updated players.
        io.to(roomId).emit('currentPlayers', initialInformations);
    })
    
    socket.on('playerMovement', (data) => {
        playersInRoom[data.roomId][socket.id] = {
            x: data.playerInfo.x,
            y: data.playerInfo.y,
            flipped: data.playerInfo.flipped,
            animation: data.playerInfo.animation
        };
    
        // emit a message to update players
        io.to(data.roomId).emit('playerMoved', playersInRoom[data.roomId]);
    });
    
    socket.on('playerShot', (data: any) => {
        io.to(data.roomId).emit('receivedBulletInfo', data.bulletInfo);
    });
    
    socket.on('playerDeath', (roomId: string) => {
        io.to(roomId).emit('playerDied', socket.id);
    });
    
    socket.on('playerMessage', (data: any) => {
        chatInRoom[data.roomId] = [...chatInRoom[data.roomId] ?? [], data.chatInfo]

        io.to(data.roomId).emit('receivedPlayerMessage', data.chatInfo);
    });
    
    socket.on('disconnecting', () => {
        const [_, currentRoomId] = Array.from(socket.rooms);
        //Delete player from server list
        delete playersInRoom[currentRoomId][socket.id];
        //Send to all clients, the current player has been removed
        io.to(currentRoomId).emit('removePlayer', socket.id);
    });

    socket.on('disconnect', () => {
        console.log(`Socket: Client ${socket.id} disconnected!`);
    });
}