import time
import math

class AnimationEngine:
    @staticmethod
    def interpolate_color(c1, c2, factor):
        """Interpolates between two hex colors by a factor of 0.0 to 1.0"""
        r1, g1, b1 = c1
        r2, g2, b2 = c2
        r = int(r1 + (r2 - r1) * factor)
        g = int(g1 + (g2 - g1) * factor)
        b = int(b1 + (b2 - b1) * factor)
        return (r, g, b)

    @staticmethod
    def get_frame(animation_type, color_rgb, bg_rgb=(0,0,0), time_elapsed=0.0):
        """
        Returns the computed color for the entire zone based on the animation type and time.
        For now, these are global color effects (entire device changes color over time).
        """
        if animation_type == "Solid":
            return color_rgb

        if animation_type == "Blink":
            # 2 second period: 1.0s on, 1.0s off
            if int(time_elapsed) % 2 == 0:
                return color_rgb
            else:
                return bg_rgb

        if animation_type == "Breathe":
            # Sin wave breathing, 6 second period
            factor = (math.sin(time_elapsed * 2 * math.pi / 6.0) + 1.0) / 2.0
            return AnimationEngine.interpolate_color(bg_rgb, color_rgb, factor)

        if animation_type == "Pulse":
            # Pulse, 2.5 second period, sharp peak
            factor = (math.sin(time_elapsed * 2 * math.pi / 2.5) + 1.0) / 2.0
            factor = factor ** 2  # Sharpen the peak
            return AnimationEngine.interpolate_color(bg_rgb, color_rgb, factor)

        return color_rgb
