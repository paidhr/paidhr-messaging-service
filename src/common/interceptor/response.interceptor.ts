import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor() {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const url = request.url;

    return next.handle().pipe(
      map((data: any) => {
        const response = {
          status: true,
          code: context.switchToHttp().getResponse().statusCode,
          message: data.message,
          data: data.data,
        };
        return response;
      }),
    );
  }
}
