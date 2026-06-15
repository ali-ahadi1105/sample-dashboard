import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { apiClient } from '../../lib/apiClient';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  tenantId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

export default function Orders() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('access_token');
  // Temporary: we assume the user belongs to mock-tenant-id based on Phase 3 mock db
  const tenantId = 'mock-tenant-id';

  // React Query to fetch initial orders (assuming there's an endpoint)
  // For now, there isn't a getOrders endpoint in Phase 4 description, so we start empty.
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['orders', tenantId],
    queryFn: async () => {
      // In a real app we'd fetch from /api/orders
      return [];
    },
    initialData: [],
  });

  useEffect(() => {
    if (!token) return;

    // Connect to WebSocket namespace '/orders'
    const socket: Socket = io('/orders', {
      auth: { token },
      // Optional: Add transport configurations if needed
    });

    socket.on('connect', () => {
      console.log('Connected to real-time order engine');
    });

    socket.on('order.created', (newOrder: Order) => {
      // Optimistically update the React Query cache
      queryClient.setQueryData<Order[]>(['orders', tenantId], (oldData) => {
        const data = oldData || [];
        if (data.find(o => o.id === newOrder.id)) return data;
        return [newOrder, ...data];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token, tenantId, queryClient]);

  // Handle Mock Create Order to simulate customer
  const createMockOrder = async () => {
    await apiClient.post(`/orders/${tenantId}`, {
      totalAmount: Math.floor(Math.random() * 100) + 10,
    });
  };

  const columns = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Order Board</h1>
        <button
          onClick={createMockOrder}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition"
        >
          Simulate Incoming Order
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
        {columns.map((status) => (
          <div key={status} className="bg-gray-100 rounded-lg p-4 flex flex-col min-w-[280px]">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
              {status}
            </h2>
            <div className="flex-1 space-y-4">
              <AnimatePresence>
                {orders
                  .filter((o) => o.status === status)
                  .map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-4 rounded-md shadow-sm border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">#{order.id.slice(0, 6)}</span>
                        <span className="font-semibold text-green-600">${order.totalAmount}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
              {orders.filter((o) => o.status === status).length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8 border-2 border-dashed border-gray-300 rounded-md">
                  No orders
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
