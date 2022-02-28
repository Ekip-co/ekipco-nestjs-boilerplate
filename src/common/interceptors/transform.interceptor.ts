import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
    error: boolean;
    data: T;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, Response<T>>
{
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<Response<T>> {
        return next.handle().pipe(
            map((data) => {
                if (data) {
                    if (typeof data === 'object') {
                        if (Object.keys(data).includes('data')) {
                            Object.assign(data, { error: false });
                        } else {
                            return { data, error: false };
                        }
                    }
                }
                return data;
            }),
        );
    }
}
