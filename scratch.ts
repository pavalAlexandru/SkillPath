import { proposeQuestionAction } from './server/actions/proposals';
async function test() {
    const res = await proposeQuestionAction({
        categoryId: 5,
        difficulty: "EASY",
        questionType: "SINGLE",
        questionText: "This is a test question?",
        options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
            { text: 'C', isCorrect: false },
            { text: 'D', isCorrect: false }
        ]
    });
    console.log(res);
}
test();
