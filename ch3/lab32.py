# Function to calculate the geometric mean of a list of numbers.
def geometric_mean(numbers):
    try:
        if len(numbers) == 0:
            raise ValueError("Danh sách không được rỗng")
        
        for num in numbers:
            if num < 0:
                raise ValueError("Danh sách không được chứa số âm")
        
        product = 1
        n = len(numbers)
        
        for num in numbers:
            product *= num
            
        return product ** (1/n)
    
    except ValueError as e:
        print(f"Lỗi: {e}")
        return None  