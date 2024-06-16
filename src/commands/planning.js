// Import libraries
const { SlashCommandBuilder, SlashCommandIntegerOption } = require('discord.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const Constants = require('../constants.json');
const { log } = require('../utils/log.js');


// Run dotenv
require('dotenv').config();


module.exports = {
	data: new SlashCommandBuilder()
		.setName('planning')
		.setDescription('Get the planning for the current week')
		// not a mandatory
		.addIntegerOption(new SlashCommandIntegerOption()
			.setName('week')
			.setDescription('number of week more than the actual (0 being actual)')
			.setMinValue(0)
			.setMaxValue(10)
			.setRequired(false),
		),

	async execute(interaction) {
		await interaction.deferReply();
		const weekOffset = interaction.options.getInteger('week') || 0;
		module.exports.sendPlanning(interaction, weekOffset);
	},

	async sendPlanning(interaction, weekOffset) {
		if (weekOffset > 10) {
			await interaction.editReply('You can only see the planning for the next 10 weeks');
			return;
		}

		if (weekOffset < 0) {
			await interaction.editReply('You cannot see the planning for the past weeks (yet?)');
			return;
		}

		fetch(process.env.CALENDAR_URL)
			.then(function(response) {
				return response.text();
			})
			.then(function(html) {
				const dom = new JSDOM(html);
				if (weekOffset === 0) {
					const message = module.exports.clickNext(dom, weekOffset);
					interaction.editReply(message);
				} else {
					const message = module.exports.clickNext(dom, weekOffset);
					interaction.editReply(message);
				}
			})
			.catch(function(error) {
				log(`${error}`);
				interaction.editReply(error.stack);
			});
	},


	/**
	 * write
	 * @param dom
	 * @param remainingClicks
	 * @returns {Promise<object|Error|string|*|string|string>}
	 */
	async clickNext(dom, remainingClicks) {
		remainingClicks--;

		const formData = new URLSearchParams();
		formData.append('__EVENTTARGET', 'ctl00$MainContent$btnNavNext');
		formData.append('__EVENTARGUMENT', '');
		formData.append('__VIEWSTATE', dom.window.document.querySelector('input[name="__VIEWSTATE"]').value);
		formData.append('__VIEWSTATEGENERATOR', dom.window.document.querySelector('input[name="__VIEWSTATEGENERATOR"]').value);
		formData.append('__EVENTVALIDATION', dom.window.document.querySelector('input[name="__EVENTVALIDATION"]').value);

		// Add other necessary form fields here

		try {
			const response = await fetch(process.env.CALENDAR_URL, {
				method: 'POST',
				body: formData,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				credentials: 'same-origin',
			});
			const html = await response.text();
			const newDom = new JSDOM(html);


			if (remainingClicks > 0) {
				return await module.exports.clickNext(newDom, remainingClicks);
			}

			return await module.exports.formatMessage(newDom);

		} catch (error) {
			log(`${error}`);
			return error.stack;
		}
	},

	formatMessage(dom) {
		const blankErrorMessage = '-------------- Erreur --------------\n';
		let errorMessage = blankErrorMessage;
		let message = '';

		let planningTable;

		try {
			planningTable = dom.window.document.getElementsByClassName('PlanningEvtContainer').item(0);
		} catch (error) {
			return error;
		}

		const spans = planningTable.querySelectorAll('span, a');

		spans.forEach(span => {
			const spanId = span.id.split('_');
			const spanType = spanId[spanId.length - 1];
			let textContent = span.textContent;

			switch (spanType) {
			case 'lblDay':
				// Jour
				if (message.length !== '') { message += '\n'; }
				message += `## **__${textContent.toUpperCase()}__**`;
				break;
			case 'lblEvtRange':
				// Heure
				message += `\n${textContent}`;
				break;
			case 'lblEvtType':
				// Type
				break;
			case 'lblEvtSalle':
				// Salle
				textContent = textContent.split(' - ')[0];
				message += ` - ${textContent}`;
				break;
			case 'lblEvtUE':
				// UE
				const course = Constants.courses.find((obj) => obj.code == textContent);
				try {
					textContent = course.name;
				} catch (error) {
					errorMessage += `Cours ${textContent} : code non trouvé dans la base. Mettre à jour le fichier constants.json\n`;
				}
				// falls through
			default:
				message += ` ${textContent}`;
				break;
			}
		});

		if (errorMessage !== blankErrorMessage) {
			log(errorMessage);
		}

		return message;
	},
};
