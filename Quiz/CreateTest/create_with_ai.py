import openai, dotenv, os

path_to_env = os.path.abspath(__file__ + '/../../../.env')
api_key = dotenv.get_key(path_to_env, 'open_ai_api')
client = openai.OpenAI(api_key=api_key)
def create_test(topic, multiple_choice_num, fill_blank_num, match_num, test_wishes):
    content = f'Привіт, згенеруй тест в такому форматі: '
    content += '''
    {
        "list_question": [
            {
                "type": "multiple_choice/fill_blank/match",
                "question_text": "текст питання",
                "answers": "",
                "correct_answer": ""
            }
        ]
    }
    Тип питання: multiple_choice — у такому випадку answers -> ["варіант1", "варіант2"]. Від 2 до 5 варіантів. correct_answer у такому випадку -> ["false", "true"] з будь-якою кількістю правильних відповідей, але вони мають відповідати індексам у answers.

    Тип питання: fill_blank — у такому випадку answers може бути (None) або -> [{"answer": "", "type": "exactly"}]. Відповідей може бути скільки завгодно, і є два типи: "exactly" — точна відповідність, "contains" — містить. correct_answer у такому випадку — це просто рядок з основною правильною відповіддю. Answers тут — це альтернативні варіанти відповіді.

    Тип питання: match, (відповіді потрібно співставляти с підказками) — у такому випадку answers -> ["що переставляти 1", "що переставляти 2"], від 2 до 5. Це варіанти, які користувач повинен співставити з правильними відповідями. correct_answer -> ["куди переставляти 1", "куди переставляти 2"] індекс кожного answers повинен співставлятись з correct_answer. Кількість answers та correct_answer повинна співдпадати

    Кількість варіантів відповідей у multiple_choice та match роби від 2 до 5, найчастіше 4, але за потреби можна більше або менше

    Окрім самого словника нічого писати не потрібно.
    '''
    
    content += f'У тесті повинно бути {multiple_choice_num} запитань з типом "multiple_choice", {fill_blank_num} запитань з типом "fill_blank" та {match_num} запитань з типом "match". Тема тесту - "{topic}". '
    
    if test_wishes:
        content += f'Побажання від автора тесту: "{test_wishes}"'

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": 'user',
                'content': content
            }
        ]
    )
    
    return response.choices[0].message.content
