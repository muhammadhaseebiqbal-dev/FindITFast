import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportService } from '../../services/reportService';
import { ReportService, ItemService } from '../../services/firestoreService';

// Mock the firestore services
vi.mock('../../services/firestoreService', () => ({
  ReportService: {
    create: vi.fn(),
    getByItem: vi.fn(),
  },
  ItemService: {
    incrementReportCount: vi.fn(),
  },
}));

describe('Reporting System Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles complete reporting workflow', async () => {
    // Mock successful report creation
    const mockReportId = 'report123';
    vi.mocked(ReportService.create).mockResolvedValue(mockReportId);
    
    // Mock existing reports for flagging logic
    vi.mocked(ReportService.getByItem).mockResolvedValue([
      { id: 'report1', type: 'missing' },
      { id: 'report2', type: 'missing' },
    ] as any);

    const reportData = {
      itemId: 'item1',
      storeId: 'store1',
      type: 'missing' as const,
      comment: 'Could not find this item anywhere',
      userId: 'user123',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    };

    // Submit report using the enhanced processing
    const result = await reportService.processReportAndFlag(reportData);

    // Verify report was created
    expect(result).toBe(mockReportId);
    expect(ReportService.create).toHaveBeenCalledWith({
      itemId: 'item1',
      storeId: 'store1',
      type: 'missing',
      timestamp: expect.any(Object),
      userId: 'user123',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    });

    // Verify report count was incremented for negative report
    expect(ItemService.incrementReportCount).toHaveBeenCalledWith('item1');

    // Verify flagging logic was checked
    expect(ReportService.getByItem).toHaveBeenCalledWith('item1');
  });

  it('handles positive reports without incrementing count', async () => {
    const mockReportId = 'report456';
    vi.mocked(ReportService.create).mockResolvedValue(mockReportId);

    const reportData = {
      itemId: 'item2',
      storeId: 'store1',
      type: 'found' as const,
      comment: 'Found it exactly where shown!',
    };

    const result = await reportService.processReportAndFlag(reportData);

    expect(result).toBe(mockReportId);
    expect(ReportService.create).toHaveBeenCalledWith({
      itemId: 'item2',
      storeId: 'store1',
      type: 'found',
      timestamp: expect.any(Object),
      userId: undefined,
      location: undefined,
    });

    // Should not increment report count for positive reports
    expect(ItemService.incrementReportCount).not.toHaveBeenCalled();
  });

  it('handles error scenarios gracefully', async () => {
    vi.mocked(ReportService.create).mockRejectedValue(new Error('Network error'));

    const reportData = {
      itemId: 'item3',
      storeId: 'store1',
      type: 'missing' as const,
    };

    await expect(reportService.processReportAndFlag(reportData)).rejects.toThrow('Failed to submit report. Please try again.');
  });

  it('calculates report statistics correctly', async () => {
    const mockReports = [
      { id: 'r1', type: 'missing' },
      { id: 'r2', type: 'missing' },
      { id: 'r3', type: 'moved' },
      { id: 'r4', type: 'found' },
      { id: 'r5', type: 'confirm' },
      { id: 'r6', type: 'confirm' },
    ];
    
    vi.mocked(ReportService.getByItem).mockResolvedValue(mockReports as any);

    const stats = await reportService.getItemReportStats('item1');

    expect(stats).toEqual({
      total: 6,
      missing: 2,
      moved: 1,
      found: 1,
      confirmed: 2,
    });
  });

  it('flags items with excessive negative reports', async () => {
    const mockReports = [
      { id: 'r1', type: 'missing' },
      { id: 'r2', type: 'missing' },
      { id: 'r3', type: 'missing' },
      { id: 'r4', type: 'moved' },
    ];
    
    vi.mocked(ReportService.getByItem).mockResolvedValue(mockReports as any);

    const shouldFlag = await reportService.shouldFlagItem('item1');

    expect(shouldFlag).toBe(true);
  });

  it('does not flag items with balanced reports', async () => {
    const mockReports = [
      { id: 'r1', type: 'missing' },
      { id: 'r2', type: 'missing' },
      { id: 'r3', type: 'found' },
      { id: 'r4', type: 'found' },
      { id: 'r5', type: 'confirm' },
    ];
    
    vi.mocked(ReportService.getByItem).mockResolvedValue(mockReports as any);

    const shouldFlag = await reportService.shouldFlagItem('item1');

    expect(shouldFlag).toBe(false);
  });
});