import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT 
    ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces` 
    : 'http://localhost:4318/v1/traces',
});

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT 
    ? `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics` 
    : 'http://localhost:4318/v1/metrics',
});

export const otelSDK = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: 'restaurant-saas-backend',
  }),
  traceExporter,
  metricReader: metricExporter as any,
  instrumentations: [getNodeAutoInstrumentations()],
});

// Gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  otelSDK.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
