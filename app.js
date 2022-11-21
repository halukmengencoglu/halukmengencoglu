const { Client, Collection, MessageEmbed, Message } = require("discord.js");
const { readdir } = require("fs");
const { Player } = require('discord-player');

const BotConf = require('./config.json');
const client = new Client();
client.cooldown = new Set();
client.player = new Player(client);
client.commands = new Collection();
client.aliases = new Collection();

client.on('ready', async () => { 
  client.user.setActivity(`${BotConf.CustomStatus}`, { type: "LISTENING", url: "https://www.youtube.com/channel/UC9Rq6ZD4Ge5udoCNUNk5hWw"})
      .then(console.log('Bot - '+ client.user.tag +' ismiyle API\'ye bağlanıldı ve bot hazır durumda.'))
      .catch(() => console.log('ERROR - Belirsiz Bir Hata İle Karşılaşıldı!'));
}); 

readdir('./Komutlar', (err, files) => { 
  files.forEach(fs => { 
  let command = require(`./Komutlar/${fs}`); 
  client.commands.set(command.config.name, command);
  if(command.config.aliases) command.config.aliases.forEach(Aliases => client.aliases.set(Aliases, command.config.name));
  });
});

client.on('message', async message => {
  if (!message.guild || message.author.bot || message.channel.type === 'dm') return;
  let prefix = BotConf.Prefix.filter(p => message.content.startsWith(p))[0]; 
  if (!prefix) return;
  let config = BotConf;
  let args = message.content.split(' ').slice(1);
  let command = message.content.split(' ')[0].slice(prefix.length); 
  let load = client.commands.get(command) || client.commands.get(client.aliases.get(command));
  if (load){
   if (!message.member.hasPermission(8) && client.cooldown.has(message.author.id)) return message.channel.send(new MessageEmbed().setDescription('**5** Saniyede Bir Komut Kullanabilirsin!').setFooter(BotConf.EmbedFooter).setColor('RANDOM').setTimestamp());
    client.cooldown.add(message.author.id);
    setTimeout(() => client.cooldown.delete(message.author.id), 5000);
    load.sex(client, message, args, config);
  };
});

client.player.on("trackStart", (message, track) => message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(`✔️ - ${track.title} İsimli Şarkı Başarıyla ${message.member.voice.channel.name} Kanalında Çalıyor.`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on("botDisconnect", (message) => message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("**❗️ - Müzik Bittiği İçin Sesli Kanaldan Ayrıldım.**").setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('channelEmpty', (message) => message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(`✔️ - Sesli Kanaldaki Herkes Çıktığı İçin Müziği Kapattım.`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('noResults', (message, query) => message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`**❗️ - ${query} İsimli Şarkı YouTube'da Bulunamadı.**`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('playlistAdd', (message, playlist) => message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(`✔️ - İçinde **${playlist.items.length}** Adet Şarkıyı Bulunduran **${playlist.title}** Başarıyla Oynatma Listesine Eklendi.`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('queueEnd', (message) => message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`**❗️ - Oynatma Listesinde Şarkı Olmadığı İçin Bot Durduruldu.**`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('searchCancel', (message) => message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`**❗️ - Geçerli Bir Argüman Girmediniz, Lütfen Tekrar Deneyin.**`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('searchInvalidResponse', (message, tracks) => message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`**❗️ - Lütfen **1** ve **${tracks.length}** Arasında Bir Sayı Giriniz.**`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('searchResults', (message, query, tracks) =>  message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(`${query} İçin Bulunan Sonuçlar;`).setDescription(`${tracks.map((t, i) => `**${i + 1}** - ${t.title}`).join('\n')}`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));
  
client.player.on('trackAdd', (message, track) => message.channel.send(new MessageEmbed().setColor("RANDOM").setAuthor(`✔️ - ${track.title} İsmli Şarkı Başarıyla Oynatma Listesine Eklendi.`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`)));

client.player.on('error', (message, error) => { switch (error) {
  case 'NotPlaying': message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("**❗ - Bu Sunucuda Müzik Çalamıyorum.**").setTimestamp().setFooter(`${BotConf.EmbedFooter}`)); break;
  case 'NotConnected': message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("**❗ - Şu Anda Bir Sesli Kanalda Bulunmamaktasınız.**").setTimestamp().setFooter(`${BotConf.EmbedFooter}`)); break;
  case 'UnableToJoin': message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription("**❗️ - Bulunduğunuz Kanala Girmem İçin Yeterli İznim Yok, Gerekli İzinleri Verdikten Sonra Lütfen Tekrar Deneyin.**").setTimestamp().setFooter(`${BotConf.EmbedFooter}`)); break;
  default: message.channel.send(new MessageEmbed().setColor("RANDOM").setDescription(`**❗️ - Bir Şeyler Ters Gitti, Lütfen Botun Sahibiyle İletişime Geçin...**`).setTimestamp().setFooter(`${BotConf.EmbedFooter}`));
}; });

client.login(BotConf["Token"]).catch(() => console.log("Hata - Bota Giriş Yapılırken Başarısız Olundu!"));

client
.on('disconnect', () => console.log('Hata - Bot Bağlantısı Kesildi...'))
.on('reconnecting', () => console.log('Hata - Bot Yeniden Bağlanıyor...'))
.on('error', err => console.log(`Hata - ${err}`))
.on('warn', err => console.log(`Hata - ${err}`));

process
.on('unhandledRejection', err => console.log('Hata - ', err))
.on('uncaughtException', err => { console.log('Hata - ', err); process.exit(1); });
