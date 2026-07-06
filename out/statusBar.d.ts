import type { CascadeMetrics } from './types';
export declare class StatusBar {
    private item;
    private refreshTimer?;
    constructor();
    update(metrics: CascadeMetrics | null): void;
    setError(msg: string): void;
    setLoading(): void;
    startAutoRefresh(intervalSeconds: number, callback: () => void): void;
    stopAutoRefresh(): void;
    private fmtNum;
    dispose(): void;
}
