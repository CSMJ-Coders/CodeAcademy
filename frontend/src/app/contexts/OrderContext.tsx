import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Order, CartItem, OrderStatus } from '../types';

interface OrderContextType {
  orders: Order[];
  createOrder: (items: CartItem[], userId: string, total: number) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);

  const createOrder = (items: CartItem[], userId: string, total: number): Order => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId,
      items,
      total,
      status: 'pending',
      date: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
