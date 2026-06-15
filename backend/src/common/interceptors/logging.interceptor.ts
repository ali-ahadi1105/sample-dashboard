import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { trace } from '@opentelemetry/api';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();
    const activeSpan = trace.getActiveSpan();
    const traceId = activeSpan ? activeSpan.spanContext().traceId : undefined;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;
          this.logger.log({
             message: `${method} ${url} ${response.statusCode} - ${delay}ms`,
             traceId,
             durationMs: delay,
             path: url,
             method
          });
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error({
             message: `${method} ${url} - FAILED - ${delay}ms`,
             traceId,
             durationMs: delay,
             path: url,
             method,
             error: error.message
          });
        },
      }),
    );
  }
}
