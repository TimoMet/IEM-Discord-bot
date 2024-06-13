// Import libraries
const { SlashCommandBuilder } = require('discord.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const Constants = require('../constants.json');
const { log } = require('../utils/log.js');


// Run dotenv
require('dotenv').config();


module.exports = {
	data: new SlashCommandBuilder()
		.setName('planning')
		.setDescription('Get the planning for the current week'),

	async execute(interaction) {
		await interaction.deferReply();
		module.exports.sendPlanning(interaction);
	},

	async sendPlanning(interaction) {
		fetch(process.env.CALENDAR_URL)
			.then(function(response) {
				return response.text();
			})
			.then(function(html) {
				const dom = new JSDOM(html);
				const message = module.exports.formatMessage(dom);
				interaction.editReply(message);
			})
			.catch(function(error) {
				log(`${error}`);
				interaction.editReply(error.stack);
			});
	},


	formatMessage(dom) {
		const blankErrorMessage = '-------------- Erreur --------------\n';
		let errorMessage = blankErrorMessage;
		let message = '>>> ';

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
				if (message.length !== '>>> ') { message += '\n'; }
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
