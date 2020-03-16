var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
const path = require("path");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
app.use("/node_modules", express.static(path.join(__dirname, "node_modules")));

var users = {};
var usernames = [];

io.on("connection", socket => {
  socket.broadcast.emit("newMessage", "Ada user baru");

  socket.on("registerUser", function(username) {
    if (usernames.indexOf(username) != -1) {
      socket.emit("registerRespond", false);
    } else {
      users[socket.id] = username;
      usernames.push(username);
      socket.emit("registerRespond", true);
      io.emit("addOnlineUsers", usernames);
    }
  });

  socket.on("newMessage", msg => {
    io.emit("newMessage", msg);
  });
  
  socket.on("newTyping", msg => {
    io.emit("newTyping", msg);
  });

  socket.on("disconnect", msg => {
    socket.broadcast.emit("newMessage", "Diaa Disconnect");
    var index = usernames.indexOf(users[socket.id]);
    usernames.splice(index, 1);

    delete users[socket.id];
    io.emit("addOnlineUsers", usernames);
  });
});

http.listen(2000);
