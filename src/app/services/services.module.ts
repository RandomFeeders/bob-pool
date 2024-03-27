import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebService } from './web/web.service';
import { SpotifyService } from './spotify/spotify.service';
import { YoutubeService } from './youtube/youtube.service';
import { RadioService } from './radio/radio.service';
import { DiscordBot } from './discord/discord-bot';
import { LocaleService } from './locale/locale.service';
import { DatabaseModule } from './database/database.module';

@Module({
    imports: [TypeOrmModule.forFeature(), DatabaseModule.register()],
    providers: [WebService, SpotifyService, YoutubeService, RadioService, DiscordBot, LocaleService],
    exports: [WebService, SpotifyService, YoutubeService, RadioService, DiscordBot, LocaleService, DatabaseModule],
})
export class ServicesModule {}
