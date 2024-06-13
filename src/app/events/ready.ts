import { ActivityType, Client } from 'discord.js';
import { DiscordEvent } from '@app/models/discord/discord-event';
import { DiscordBot } from '@app/services/discord/discord-bot';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '@app/services/database/entities/activity.entity';

@Injectable()
@DiscordEvent('ready')
export class ReadyEvent implements DiscordEvent<'ready'> {
    public constructor(@InjectRepository(Activity) private activityRepository: Repository<Activity>) {}

    public async execute(client: Client): Promise<void> {
        const bot = <DiscordBot>client;

        const activities = await this.activityRepository.find();
        let count = 0;
        (function runActivities() {
            const activity = activities[count].value!;
            bot.user?.setActivity(activity, { type: ActivityType.Playing });
            if (++count >= activities.length) count = 0;
            setTimeout(runActivities, 2500);
        })();

        await bot.flushCommands();

        bot.user?.setStatus('online');
    }
}
