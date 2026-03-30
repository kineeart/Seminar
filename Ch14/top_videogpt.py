def get_top_video(path):
    cumulative_sum = None
    cumulative_count = None
    chunksize = 1000
    for chunk in pd.read_csv(path, chunksize=chunksize):
        chunk_sum = chunk.sum(skipna=True)
        chunk_count = chunk.count()
        if cumulative_sum is None:
            cumulative_sum = chunk_sum
            cumulative_count = chunk_count
        else:
            cumulative_sum += chunk_sum
            cumulative_count += chunk_count

    average_ratio = cumulative_sum / cumulative_count
    top_video = average_ratio.idxmax()
    return top_video


def get_top_video_batch(path, batch_size=5000):
    """
    Đọc file CSV theo từng batch nhỏ để tiết kiệm bộ nhớ
    """
    total_cols = pd.read_csv(path, nrows=1).shape[1]
    
    cumulative_sum = None
    row_count = 0
    
    for chunk in pd.read_csv(path, chunksize=batch_size):
        row_count += len(chunk)
        
        if cumulative_sum is None:
            cumulative_sum = chunk.sum(axis=0)
        else:
            cumulative_sum += chunk.sum(axis=0)
    
    avg_ratio = cumulative_sum / row_count
    return avg_ratio.idxmax()