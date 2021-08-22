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
            socket.to(roomKey).emit("newPlayerJoined", `${socket.id} has joined the mf room`);
            gameRooms[roomKey].playerNum += 1;
            gameRooms[roomKey].players[socket.id] = 'moving to the moon';
            console.log(gameRooms);
            socket.emit("roomInfo", gameRooms[roomKey]);
        })
    })
};
