import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Orders from './Orders';
import { io } from 'socket.io-client';
import { apiClient } from '../../lib/apiClient';

vi.mock('socket.io-client', () => {
  const onMock = vi.fn();
  const disconnectMock = vi.fn();
  const ioMock = vi.fn(() => ({
    on: onMock,
    disconnect: disconnectMock,
  }));
  return { io: ioMock };
});

vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('Orders Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    vi.clearAllMocks();
  });

  it('renders order board columns', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>
    );

    expect(screen.getByText('Live Order Board')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('PREPARING')).toBeInTheDocument();
    expect(screen.getByText('READY')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('connects to socket.io and handles order simulation', async () => {
    // Fake token to trigger socket connection
    localStorage.setItem('access_token', 'test-token');

    render(
      <QueryClientProvider client={queryClient}>
        <Orders />
      </QueryClientProvider>
    );

    expect(io).toHaveBeenCalledWith('/orders', expect.objectContaining({
      auth: { token: 'test-token' }
    }));

    const simulateButton = screen.getByText('Simulate Incoming Order');
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/orders/mock-tenant-id', expect.any(Object));
    });
    
    // Clean up
    localStorage.removeItem('access_token');
  });
});
