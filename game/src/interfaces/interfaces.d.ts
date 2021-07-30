export interface InitialPlayerInformations {
    players: Players,
    chat: Chat[]
}

export interface Players {
    [key: string]: {
        x: number, 
        y: number, 
        flipped: boolean,
        animation: string
    }
}

export interface Chat {
    playerId: string,
    playerName: string,
    message: string
}

export interface RoomInfo {
    owner: string,
    playersCount: number,
    capacity: number,
    map: string
}

export interface RoomInfoGame {
    roomId: string,
    owner: string,
    playersCount: number,
    capacity: number,
    map: string
}