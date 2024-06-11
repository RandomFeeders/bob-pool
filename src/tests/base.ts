// import 'dotenv/config';
// import { DiscordBot } from '@app/app/services/discord/discord-bot';
// import { LocaleService } from '@app/app/services/locale/locale.service';
// import { beforeStart, group, afterAll, test, expect } from 'corde';

// let client: DiscordBot;

// beforeStart(async () => {
//     const localeService = new LocaleService();
//     await localeService.initialize();

//     client = new DiscordBot(localeService);
//     await client.login(process.env.CORDE_BOT_TOKEN);
// });

// group('main commands', () => {
//     test('ping command must return... Ping?!!', () => {
//         expect('ping').toReturn('Ping?');
//     });
// });

// afterAll(() => {
//     client.destroy();
// });
