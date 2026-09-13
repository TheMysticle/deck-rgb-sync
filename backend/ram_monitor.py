import asyncio

class RAMMonitor:
    def __init__(self, smoothing_samples=5):
        self.smoothing_samples = smoothing_samples
        self.samples = []
        self.current_percent = 0.0

    def get_ram_usage(self) -> float:
        try:
            with open('/proc/meminfo', 'r') as f:
                meminfo = {}
                for line in f:
                    parts = line.split()
                    if len(parts) >= 2:
                        meminfo[parts[0].strip(':')] = int(parts[1])
            
            mem_total = meminfo.get('MemTotal', 1)
            mem_available = meminfo.get('MemAvailable', 0)
            
            # MemAvailable is a better indicator than MemFree + Buffers + Cached
            used_percent = (mem_total - mem_available) / mem_total
            return max(0.0, min(1.0, used_percent))
        except Exception:
            return 0.0

    def sample(self):
        val = self.get_ram_usage()
        self.samples.append(val)
        if len(self.samples) > self.smoothing_samples:
            self.samples.pop(0)
        
        self.current_percent = sum(self.samples) / len(self.samples)

    def get_smoothed_percent(self) -> float:
        return self.current_percent
