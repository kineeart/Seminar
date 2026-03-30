"""Data-driven unit tests for lowercase_remove_punct_numbers."""

import unittest

from ngrams import lowercase_remove_punct_numbers


class TestLowercaseRemovePunctNumbersDataDriven(unittest.TestCase):
    """Data-driven test cases for lowercase_remove_punct_numbers function."""

    def test_data_driven_cases(self):
        cases = [
            ("HELLO WORLD", "hello world"),
            ("Hello, World!", "hello world"),
            ("Hello123 World456", "hello world"),
            ("Hello123, World! 456", "hello world "),
            ("", ""),
            ("123!@#$%", ""),
            ("Hello   World", "hello   world"),
            ("Test123: ABC-def!@#", "test abcdef"),
            ("Call me at 1234567890 tomorrow.", "call me at  tomorrow"),
            ("Phone: (123) 456-7890", "phone  "),
            ("Ship to ZIP 12345-6789 now.", "ship to zip  now"),
            ("Address 02139-4307 Cambridge", "address  cambridge"),
        ]

        for original, expected in cases:
            with self.subTest(original=original):
                self.assertEqual(lowercase_remove_punct_numbers(original), expected)


if __name__ == "__main__":
    unittest.main()
