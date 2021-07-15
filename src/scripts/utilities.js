// Ping Test
function ping(message) {
	setTimeout(() => {
		message.channel.startTyping();
	}, 1500);
	setTimeout(() => {
		message.channel.send(" :rolling_eyes: omg");
		message.channel.stopTyping();
	}, 4000);

	setTimeout(() => {
		message.channel.startTyping();
	}, 4500);
	setTimeout(() => {
		message
			.reply(" what do you want?")
			.catch(console.error);
		message.channel.stopTyping();
	}, 7000);
}

function getPinned(message) {
	if (!message.member.hasPermission("MANAGE_ROLES")) return;
	message.channel.messages
		.fetchPinned()
		.then((messages) => {
			console.log(`FOUND ${messages.size} PINNED MESSAGES`);
			global.pinnedMessages = [...messages];
			message.channel.send("By hand? :rolling_eyes:\nFine.");
		})
		.catch(console.error);
}

function movePinned(message, pinnedMessages) {
	if (!message.member.hasPermission("MANAGE_ROLES")) return;
	if (typeof pinnedMessages === "undefined") {
		message.channel.send("You didn't give me anything to copy. :sweat_smile:");
		return;
	}
	console.log("Pasted pins:", pinnedMessages);
	pinnedMessages.forEach((msg, index) => {
		content = msg[1].content;
		author = msg[1].author.username;
		message.channel
			.send(`**Resource submitted by:** ${author},\n${content}`)
			.then((sentMsg) => {
				sentMsg.pin();
			})
			.catch(console.error);
	});
}

function unPin50thMsg(channel) {
	channel.messages.fetchPinned().then((messages) => {
		console.log(`${channel.name}: ${messages.size}`);
		if (messages.size === 50) {
			// Puts map keys into array and gets key at index 49
			const key = [...messages.keys()][49];
			const msg = messages.get(key);
			console.log("\nUNPINNING MESSAGE:", msg.content);
			msg.unpin().then(() => {
				if (msg.pinned === false) console.log("Successfully unpinned!");
				channel.messages.fetchPinned().then((newMessages) => {
					console.log("New Pinned Messages Amount:", newMessages.size);
				});
			});
		}
	}).catch(function (error) {
		console.log(error);
	});
}

function getAllChannels(client) {
	[...client.channels.cache].forEach((chnl) => {
		chnl = chnl[1];
		client.channels
			.fetch(chnl.id)
			.then((fullChannel) => {
				if (!fullChannel.members.get(client.user.id)) {
					return;
				}
				if (fullChannel.type === "text") {
					unPin50thMsg(fullChannel);
				}
			})
			.catch(console.error);
	});
}

function logMessageDate() {
	console.log(`\n\n${Date()}`);
}

function handleHelpCommand(message) {
	if (message.content.startsWith('!help role message')) {
		handleHelpRoleMessageCommand(message);
		return;
	}
	if (message.content.startsWith('!help timezone')) {
		handleHelpTimezoneCommand(message);
		return;
	}
	if (message.content.startsWith('!help cancel study')) {
		handleHelpCancelStudyCommand(message);
		return;
	}
	if (message.content.startsWith('!help study')) {
		handleHelpStudyCommand(message);
		return;
	}
	message.channel.send(null, {
		embed: {
			title: "Little LyonHeart ♡ features",
			fields: [
				{
					name: 'Exercises',
					value: `From within <#${process.env.EXERCISES_CHANNEL}> use \`!t\` or \`!ㅌ\` to start an exercise to help improve your typing abilities`
				},
				{
					name: 'Study Sessions',
					value: `
Use \`!upcoming study\` to list all of the upcoming study sessions that have been scheduled

Create a study session with the \`!study\` command. Use \`!help study\` for more information

You can cancel a study session either by deleting the message used to create the session or by using the \`!cancel study\` command. Use \`!help cancel study\` for more information
					`
				},
				{
					name: 'Timezones',
					value: `
Use \`!timezone\` to convert a date-time to equivalent date-times in different regions

Use \`!help timezone\` for more information
					`
				}, {
					name: 'Bookmarks',
					value: `
A copy of any message can be sent to you via direct message by the bot if you apply a 'bookmark' (🔖) reaction to the message you want to copy

If you remove your bookmark, the DM you received is removed

Any message the bot sends via DM can be deleted by applying an 'x' (❌) reaction to it
					`
				}, {
					name: 'Roles',
					value: `
Moderators can create a self-assigned role message using the \`!role message\` command

Use \`!help role message\` for more information
					`
				}, {
					name: 'Help',
					value: `Use the \`!help\` command to bring up a list of Little LyonHeart ♡'s available features`
				}
			]
		}
	});
}

function handleHelpTimezoneCommand(message) {
	message.channel.send(null, {
		embed: {
			title: "The !timezone command",
			fields: [
				{
					name: 'Description',
					value: 'The `!timezone` command can be used to convert a date-time into date-times around the world'
				}, {
					name: 'Format',
					value: `
This requires a date in the format YYYY/MM/DD and a UTC time in HH:mm followed by any number of [TZ database names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
					`
				}, {
					name: 'Example',
					value: `
If you've created a study session with these details
\`\`\`
!study 2022/03/05 at 13:30 ...
\`\`\`
You can get the equivalent date-times in Toronto, London and Seoul using
\`\`\`
!timezone 2022/03/05 13:30 America/Toronto Europe/London Asia/Seoul
\`\`\`
Which creates this response:
\`\`\`
Sat, 5 Mar at 08:30 (Eastern Standard Time)
Sat, 5 Mar at 13:30 (Greenwich Mean Time)
Sat, 5 Mar at 22:30 (Korean Standard Time)
\`\`\`
					`
				}
			]
		}
	});
}

function handleHelpCancelStudyCommand(message) {
	message.channel.send(null, {
		embed: {
			title: "The !cancel study command",
			fields: [
				{
					name: 'Description',
					value: 'The `!cancel study` command can be used to remove an upcoming study session that you\'ve scheduled'
				}, {
					name: 'Format',
					value: `
This requires a date in the format YYYY/MM/DD and a UTC time in HH:mm
					`
				}, {
					name: 'Example',
					value: `
If you've created a study session with these details
\`\`\`
!study 2022/03/05 at 13:30 for 1 hour
We'll be studying some fundamental Korean grammar!
\`\`\`
You can cancel the session with
\`\`\`
!cancel study 2022/03/05 13:30
\`\`\`
					`
				}
			]
		}
	});
}

function handleHelpStudyCommand(message) {
	message.channel.send(null, {
		embed: {
			title: "The !study command",
			fields: [
				{
					name: 'Description',
					value: 'The `!study` command can be used to schedule study sessions that other members of the server can subscribe to and be notified of'
				}, {
					name: 'Format',
					value: `
The study command requires
- a title placed on the first line (beside the \`!study\` command)
- a date in the format YYYY/MM/DD
- a UTC time in HH:mm
- a session length in H hours, mm minutes or a combination of both

This message should also contain a description of the session
					`
				}, {
					name: 'Example',
					value: `
Sending a message like this:
\`\`\`
!study Grammar lesson
2022/03/05 at 13:30 for 1 hour
We'll be studying some fundamental Korean grammar!
\`\`\`
Results in the bot creating a study session and responding with a message that looks like this:
					`
				}
			],
			image: {
				url: 'https://i.imgur.com/SczgdyX.png'
			}
		}
	});
}

function handleHelpRoleMessageCommand(message) {
	message.channel.send(null, {
		embed: {
			title: "The !role message command",
			fields: [
				{
					name: 'Description',
					value: 'The `!role message` command can be used to create self-assigned role selection menus'
				}, {
					name: 'Format',
					value: `
The role message command requires
- a title placed on the first line (beside the \`!role message\` command)
- at least one role option in the format: \`emoji: roleId - description\`

Each role goes on its own line
The emojis should be from the standard set (no custom emojis)
The description has a 50 character limit

Besides these rules, the message can have any additional information or formatting added
					`
				}, {
					name: 'Example',
					value: `
Sending a message like this:
\`\`\`
!role message Alphabet roles

Here's some information

:boom:: 819317488923049987 - For people who want to have role A
This role gives you access to #test-a
:knife:: 819317563841314816 - For people who want to have role B
This role gives you access to #test-b

Here's some more information. Here's \_some\_ \*\*formatting\*\*
\`\`\`
Results in the bot responding with a message that looks like this:
					`
				}
			],
			image: {
				url: 'https://i.imgur.com/Mjp3pVU.png'
			}
		}
	});
}

module.exports = { ping, getPinned, movePinned, unPin50thMsg, getAllChannels, logMessageDate, handleHelpCommand };
