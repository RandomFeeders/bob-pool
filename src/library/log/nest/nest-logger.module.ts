import { Global, Module } from "@nestjs/common";
import { CustomNestLogger } from "./nest-logger.service";

@Global()
@Module({
    providers: [CustomNestLogger],
    exports: [CustomNestLogger]
})
export class LoggerModule {}