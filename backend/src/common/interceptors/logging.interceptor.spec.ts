import { CallHandler, ExecutionContext } from '@nestjs/common';
import { LoggingInterceptor } from './logging.interceptor';
import { of, throwError } from 'rxjs';

// Mock the api from opentelemetry to prevent context issues during tests
jest.mock('@opentelemetry/api', () => ({
  trace: {
    getActiveSpan: jest.fn().mockReturnValue({
      spanContext: () => ({ traceId: 'mock-trace-id' }),
    }),
  },
}));

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should log successfully', (done) => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => of('test-response'),
    };

    const intercept$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

    intercept$.subscribe({
      next: (val) => {
        expect(val).toBe('test-response');
        done();
      },
    });
  });

  it('should log errors', (done) => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler: CallHandler = {
      handle: () => throwError(() => new Error('test-error')),
    };

    const intercept$ = interceptor.intercept(mockExecutionContext, mockCallHandler);

    intercept$.subscribe({
      error: (err) => {
        expect(err.message).toBe('test-error');
        done();
      },
    });
  });
});
