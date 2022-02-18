import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { MessageService } from '@modules/message/message.service';
import { MessageOptions } from '@modules/message/interfaces/message-options.interface';
import { MESSAGE_SERVICE } from '@modules/message/message.decorator';

@Module({})
export class MessageModule {
    static forRoot(options: MessageOptions): DynamicModule {
        const messageProvider: FactoryProvider<MessageService> = {
            provide: MESSAGE_SERVICE,
            useFactory: () => {
                return new MessageService(options);
            },
        };

        return {
            module: MessageModule,
            providers: [messageProvider],
            exports: [messageProvider],
        };
    }
}
