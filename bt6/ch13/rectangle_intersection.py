# ...existing code...
def rect_intersection_area(rect1, rect2):
    x1_min, y1_min, x1_max, y1_max = rect1
    x2_min, y2_min, x2_max, y2_max = rect2

    overlap_width = min(x1_max, x2_max) - max(x1_min, x2_min)
    overlap_height = min(y1_max, y2_max) - max(y1_min, y2_min)

    if overlap_width <= 0 or overlap_height <= 0:
        return 0

    return overlap_width * overlap_height
# ...existing code...