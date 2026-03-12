# Function to calculate the geometric mean of a list of numbers.
def geometric_mean(numbers):    
    product = 1
    n = len(numbers)
    
    for num in numbers:
        product *= num
        
    return product ** (1/n)  







