const gameRooms = {
    // store useful info about room keys. metadata -> rooms, players in room with information like socket.id and move state
    room1: {
        players: {},
        playerNum: 0
    },
    room2: {
        players: {},
        playerNum: 0
    }
}
module.exports = (io) => {
	io.on('connection', function (socket) {
		console.log('a user connected');
        socket.on('joinRoom', (roomKey) => {
            // console.log(roomKey); -> room1 || room2 for now
            socket.join(roomKey);
            gameRooms[roomKey].playerNum += 1;
            gameRooms[roomKey].players[socket.id] = 'moving to the moon';
            console.log(roomKey);
            socket.to(roomKey).emit("newPlayerJoined", gameRooms[roomKey]);
            socket.emit("roomInfo", gameRooms[roomKey]);

            socket.on("updatePlayer", (moveState) => {
                console.log(socket.id, moveState);
                socket.to(roomKey).emit("playerMoved", { playerId: socket.id, moveState});
            })
        })
        socket.on('disconnecting', () => {
            let room = socket.rooms.values()
            console.log(room)
            let playerId = room.next().value
            let roomKey = room.next().value
            if(roomKey) {
                delete gameRooms[roomKey].players[playerId]
                gameRooms[roomKey].playerNum -= 1;
                socket.to(roomKey).emit("playerDisconnected", { roomInfo: gameRooms[roomKey], playerId } );
                console.log('player deleted')
                console.log(gameRooms)
            }
        })
    })
};
