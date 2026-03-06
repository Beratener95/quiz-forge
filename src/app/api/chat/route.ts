import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { messages, quiz, apiKey, selectedTemplate } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ 
        message: 'API ключ не предоставлен',
        quiz: null 
      }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const templates = {
      onboarding: {
        title: 'Онбординг нового пользователя',
        description: 'Квиз для знакомства с пользователем и его потребностями',
        questions: [
          { id: '1', type: 'text', question: 'Как вас зовут?', correctAnswer: '', points: 0 },
          { id: '2', type: 'multiple_choice', question: 'Какая ваша цель?', options: ['Учеба', 'Работа', 'Хобби', 'Другое'], correctAnswer: '', points: 10 },
          { id: '3', type: 'multiple_choice', question: 'Сколько времени готовы уделять?', options: ['5-15 минут', '30 минут', '1 час', 'Больше'], correctAnswer: '', points: 10 },
        ]
      },
      knowledge_test: {
        title: 'Проверка знаний',
        description: 'Тестирование знаний по теме',
        questions: [
          { id: '1', type: 'multiple_choice', question: 'Вопрос 1', options: ['Да', 'Нет', 'Не знаю'], correctAnswer: '', points: 10 },
          { id: '2', type: 'multiple_choice', question: 'Вопрос 2', options: ['Вариант А', 'Вариант Б', 'Вариант В'], correctAnswer: '', points: 10 },
        ]
      },
      personality: {
        title: 'Определение типа личности',
        description: 'Узнай свой тип',
        questions: [
          { id: '1', type: 'multiple_choice', question: 'Как вы предпочитаете работать?', options: ['В команде', 'Самостоятельно', 'В паре'], correctAnswer: '', points: 10 },
          { id: '2', type: 'multiple_choice', question: 'Что для вас важнее?', options: ['Результат', 'Процесс', 'Отношения'], correctAnswer: '', points: 10 },
        ]
      },
      product_fit: {
        title: 'Product-Market Fit',
        description: 'Оценка потребности в продукте',
        questions: [
          { id: '1', type: 'multiple_choice', question: 'Какую проблему вы хотите решить?', options: [], correctAnswer: '', points: 0 },
          { id: '2', type: 'multiple_choice', question: 'Сколько готовы платить?', options: ['Бесплатно', 'До 500₽', '500-2000₽', 'Больше'], correctAnswer: '', points: 10 },
        ]
      },
      trivia: {
        title: 'Викторина',
        description: 'Развлекательный квиз',
        questions: [
          { id: '1', type: 'multiple_choice', question: 'Вопрос 1?', options: ['А', 'Б', 'В'], correctAnswer: '', points: 10 },
        ]
      }
    };

    const systemPrompt = `Ты — AI ассистент для создания квизов. Твоя задача адаптировать шаблоны под тему пользователя.

Текущий квиз:
${JSON.stringify(quiz, null, 2)}

${selectedTemplate ? `Выбранный шаблон: ${JSON.stringify(templates[selectedTemplate as keyof typeof templates] || {}, null, 2)}` : ''}

Правила:
1. Адаптируй вопросы шаблона под тему пользователя
2. Заполни correctAnswer для всех вопросов
3. Формат ответа JSON с полями: title, description, questions (массив объектов с полями: id, type, question, options, correctAnswer, points)
4. type: "multiple_choice" или "text"
5. Отвечай на русском
6. Всегда возвращай JSON в поле "quiz" и текст в "message"

Пример:
{
  "message": "Адаптировал шаблон под тему...",
  "quiz": {
    "title": "Название",
    "description": "Описание",
    "questions": [...]
  }
}`;

    const chatMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatMessages
      ],
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '';

    let quizData = null;
    let message = text;

    try {
      const parsed = JSON.parse(text);
      if (parsed.quiz) {
        quizData = parsed.quiz;
        if (quizData.questions) {
          quizData.questions = quizData.questions.map((q: { id?: string }) => ({
            ...q,
            id: q.id || uuidv4(),
          }));
        }
      }
      if (parsed.message) {
        message = parsed.message;
      }
    } catch {
      message = text;
    }

    return NextResponse.json({ message, quiz: quizData });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json({ 
      message: 'Ошибка при обращении к OpenAI API',
      quiz: null 
    }, { status: 500 });
  }
}
