"""
Unit tests for ngrams.py module.

Tests text processing functions including lowercase conversion,
punctuation/number removal, and space normalization.
"""
import unittest
from ngrams import lowercase_remove_punct_numbers, multiple_to_single_spaces


class TestLowercaseRemovePunctNumbers(unittest.TestCase):
    """Test cases for lowercase_remove_punct_numbers function."""

    def test_lowercase_conversion(self):
        result = lowercase_remove_punct_numbers("HELLO WORLD")
        self.assertEqual(result, "hello world")

    def test_remove_punctuation(self):
        result = lowercase_remove_punct_numbers("Hello, World!")
        self.assertEqual(result, "hello world")

    def test_remove_numbers(self):
        result = lowercase_remove_punct_numbers("Hello123 World456")
        self.assertEqual(result, "hello world")

    def test_combined_remove(self):
        result = lowercase_remove_punct_numbers("Hello123, World! 456")
        self.assertEqual(result, "hello world")

    def test_empty_string(self):
        result = lowercase_remove_punct_numbers("")
        self.assertEqual(result, "")

    def test_only_punctuation_and_numbers(self):
        result = lowercase_remove_punct_numbers("123!@#$%")
        self.assertEqual(result, "")

    def test_preserve_spaces(self):
        result = lowercase_remove_punct_numbers("Hello   World")
        self.assertEqual(result, "hello   world")

    def test_mixed_content(self):
        result = lowercase_remove_punct_numbers("Test123: ABC-def!@#")
        self.assertEqual(result, "test abcdef")

    def test_remove_10_digit_phone_number(self):
        result = lowercase_remove_punct_numbers("Call me at 1234567890 tomorrow.")
        self.assertEqual(result, "call me at  tomorrow")

    def test_remove_formatted_phone_number(self):
        result = lowercase_remove_punct_numbers("Phone: (123) 456-7890")
        self.assertEqual(result, "phone  ")

    def test_remove_zip_code_five_plus_four(self):
        result = lowercase_remove_punct_numbers("Ship to ZIP 12345-6789 now.")
        self.assertEqual(result, "ship to zip  now")

    def test_remove_zip_code_between_words(self):
        result = lowercase_remove_punct_numbers("Address 02139-4307 Cambridge")
        self.assertEqual(result, "address  cambridge")


class TestMultipleToSingleSpaces(unittest.TestCase):
    """Test cases for multiple_to_single_spaces function."""

    def test_multiple_spaces_to_single(self):
        result = multiple_to_single_spaces("hello    world")
        self.assertEqual(result, "hello world")

    def test_single_space_unchanged(self):
        result = multiple_to_single_spaces("hello world")
        self.assertEqual(result, "hello world")

    def test_tabs_to_single_space(self):
        result = multiple_to_single_spaces("hello\t\tworld")
        self.assertEqual(result, "hello world")

    def test_newlines_to_single_space(self):
        result = multiple_to_single_spaces("hello\n\nworld")
        self.assertEqual(result, "hello world")

    def test_mixed_whitespace(self):
        result = multiple_to_single_spaces("hello  \t\n  world")
        self.assertEqual(result, "hello world")

    def test_leading_space(self):
        result = multiple_to_single_spaces("  hello world")
        self.assertEqual(result, " hello world")

    def test_trailing_space(self):
        result = multiple_to_single_spaces("hello world  ")
        self.assertEqual(result, "hello world ")

    def test_empty_string(self):
        result = multiple_to_single_spaces("")
        self.assertEqual(result, "")

    def test_only_spaces(self):
        result = multiple_to_single_spaces("     ")
        self.assertEqual(result, " ")

    def test_many_whitespace_blocks(self):
        result = multiple_to_single_spaces("a   b\t\tc\n\n\nd")
        self.assertEqual(result, "a b c d")

    def test_carriage_return_and_form_feed(self):
        result = multiple_to_single_spaces("a\r\rb\f\f c")
        self.assertEqual(result, "a b c")


class TestIntegration(unittest.TestCase):
    """Integration tests combining both functions."""

    def test_combined_processing(self):
        text = "Hello123,  World!!!   456"
        step1 = lowercase_remove_punct_numbers(text)
        result = multiple_to_single_spaces(step1)
        self.assertEqual(result, "hello world")

    def test_complex_text(self):
        text = "The   Quick123, Brown!  FOX---jumps   OVER!!!"
        step1 = lowercase_remove_punct_numbers(text)
        result = multiple_to_single_spaces(step1)
        self.assertEqual(result, "the quick brown foxjumps over")

    def test_phone_number_cleanup_pipeline(self):
        text = "Call me at (123) 456-7890 ASAP!!!"
        step1 = lowercase_remove_punct_numbers(text)
        result = multiple_to_single_spaces(step1)
        self.assertEqual(result, "call me at asap")

    def test_zip_code_cleanup_pipeline(self):
        text = "Send to 12345-6789, please."
        step1 = lowercase_remove_punct_numbers(text)
        result = multiple_to_single_spaces(step1)
        self.assertEqual(result, "send to please")


if __name__ == "__main__":
    unittest.main()