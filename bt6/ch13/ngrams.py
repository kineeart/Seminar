import re

def lowercase_remove_punct_numbers(text, supercharte=True):
    return re.sub(r'[^a-z\s]', '', text.lower())

def multiple_to_single_spaces(text):
    letters_single_spaces = re.sub('\s+',' ', text)
    return letters_single_spaces