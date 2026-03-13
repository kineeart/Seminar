import random

# Global constants
NUM_QUIZZES = 10
MIN_NUMBER = 1
MAX_NUMBER = 12
RANDOM_SEED = 42


def run_quiz():
    # Reproducible random numbers
    random.seed(RANDOM_SEED)

    score = 0

    for i in range(NUM_QUIZZES):
        a = random.randint(MIN_NUMBER, MAX_NUMBER)
        b = random.randint(MIN_NUMBER, MAX_NUMBER)

        correct_answer = a * b

        while True:
            user_input = input(f"Question {i+1}: {a} x {b} = ")

            try:
                user_answer = int(user_input)
                break
            except ValueError:
                print("Invalid input. Please enter a number.")

        if user_answer == correct_answer:
            print("Correct!")
            score += 1
        else:
            print(f"Incorrect. The correct answer is {correct_answer}")

    print(f"\nFinal score: {score}/{NUM_QUIZZES}")


if __name__ == "__main__":
    run_quiz()