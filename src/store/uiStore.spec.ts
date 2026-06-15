import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true });
  });

  it('should toggle sidebar', () => {
    const { toggleSidebar } = useUIStore.getState();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
    
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('should set sidebar state explicitly', () => {
    const { setSidebarOpen } = useUIStore.getState();
    
    setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
  });
});
