var mineflayer = require('mineflayer');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var vec3 = mineflayer.vec3;
var bot = mineflayer.createBot({
	username: process.argv[4],
	verbose: true,
	port:parseInt(process.argv[3]),
	host:process.argv[2]});

navigatePlugin(bot);
var task=require('./task');
var achieve=require('./achieve');

task.init(bot,vec3,achieve.achieve);
achieve.init(task.regex,task.generated_tasks,task.tasks,task.parameterized_alias,task.alias,task.unique,bot,vec3);

bot.on('login', function() {
  console.log("I logged in.");
  bot.chat("/login "+process.argv[5]);
  console.log("settings", bot.settings);
});


bot.on('spawn', function() {
  console.log("game", bot.game);
});
bot.on('death', function() {
  bot.chat("I died x.x");
});

bot.on('chat',achieve.processMessage);

// bot.navigate.on('pathFound', function (path) {
//   bot.chat("found path. I can get there in " + path.length + " moves.");
// });
bot.navigate.on('cannotFind', function () {
  console.log("unable to find path");
});

bot.on('health', function() {
  console.log("I have " + bot.health + " health and " + bot.food + " food");
});

bot.on('playerJoined', function(player) {
  console.log("hello, " + player.username + "! welmove to the server.");
});
bot.on('playerLeft', function(player) {
  console.log("bye " + player.username);
});
bot.on('kicked', function(reason) {
  console.log("I got kicked for", reason, "lol");
});


bot.on('nonSpokenChat', function(message) {
  console.log("non spoken chat", message);
});