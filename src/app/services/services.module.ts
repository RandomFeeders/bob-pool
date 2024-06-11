import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotifyService } from './spotify/spotify.service';
import { YoutubeService } from './youtube/youtube.service';
import { RadioService } from './radio/radio.service';
import { DiscordBot } from './discord/discord-bot';
import { LocaleService } from './locale/locale.service';
import { DatabaseModule } from './database/database.module';
import { DiscordVoiceService } from './discord/discord-voice';

@Module({
    imports: [TypeOrmModule.forFeature(), DatabaseModule.register()],
    providers: [SpotifyService, YoutubeService, RadioService, DiscordBot, DiscordVoiceService, LocaleService],
    exports: [
        SpotifyService,
        YoutubeService,
        RadioService,
        DiscordBot,
        DiscordVoiceService,
        LocaleService,
        DatabaseModule,
    ],
})
export class ServicesModule {}
