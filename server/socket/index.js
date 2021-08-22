const gameRooms = {
    // store useful info about room keys
}
module.exports = (io) => {
	io.on('connection', function (socket) {
		console.log('a user connected');
    })
};
