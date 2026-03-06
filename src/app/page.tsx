'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Quiz, Question } from '@/types/quiz';

const templates: Record<string, Quiz> = {
  onboarding: {
    title: 'Онбординг',
    description: 'Знакомство с пользователем',
    questions: [
      { id: '1', type: 'text', question: 'Как вас зовут?', correctAnswer: '', points: 0 },
      { id: '2', type: 'multiple_choice', question: 'Откуда вы узнали о нас?', options: ['Соцсети', 'Друзья', 'Поиск', 'Другое'], correctAnswer: '', points: 5 },
      { id: '3', type: 'multiple_choice', question: 'Какая ваша цель?', options: ['Обучение', 'Работа', 'Хобби', 'Другое'], correctAnswer: '', points: 10 },
      { id: '4', type: 'multiple_choice', question: 'Сколько времени готовы уделять?', options: ['5-15 мин', '30 мин', '1 час', 'Больше'], correctAnswer: '', points: 5 },
    ]
  },
  knowledge_test: {
    title: 'Проверка знаний',
    description: 'Тестирование по теме',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Вопрос 1', options: ['Да', 'Нет', 'Не знаю'], correctAnswer: '', points: 10 },
      { id: '2', type: 'multiple_choice', question: 'Вопрос 2', options: ['Вариант А', 'Вариант Б', 'Вариант В'], correctAnswer: '', points: 10 },
      { id: '3', type: 'multiple_choice', question: 'Вопрос 3', options: ['А', 'Б', 'В', 'Г'], correctAnswer: '', points: 10 },
    ]
  },
  personality: {
    title: 'Тип личности',
    description: 'Определение типа',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Как вы предпочитаете работать?', options: ['В команде', 'Самостоятельно', 'В паре'], correctAnswer: '', points: 10 },
      { id: '2', type: 'multiple_choice', question: 'Что для вас важнее?', options: ['Результат', 'Процесс', 'Отношения'], correctAnswer: '', points: 10 },
      { id: '3', type: 'multiple_choice', question: 'Как принимаете решения?', options: ['Быстро', 'Обдумываю', 'Советуюсь'], correctAnswer: '', points: 10 },
    ]
  },
  product_fit: {
    title: 'Product Fit',
    description: 'Оценка потребности',
    questions: [
      { id: '1', type: 'text', question: 'Какую проблему хотите решить?', correctAnswer: '', points: 0 },
      { id: '2', type: 'multiple_choice', question: 'Сколько готовы платить?', options: ['Бесплатно', 'До 500₽', '500-2000₽', 'Больше'], correctAnswer: '', points: 10 },
      { id: '3', type: 'multiple_choice', question: 'Как часто пользуетесь подобными сервисами?', options: ['Впервые', 'Редко', 'Часто'], correctAnswer: '', points: 5 },
    ]
  },
  trivia: {
    title: 'Викторина',
    description: 'Развлекательный квиз',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Вопрос 1?', options: ['А', 'Б', 'В'], correctAnswer: '', points: 10 },
      { id: '2', type: 'multiple_choice', question: 'Вопрос 2?', options: ['А', 'Б', 'В'], correctAnswer: '', points: 10 },
      { id: '3', type: 'multiple_choice', question: 'Вопрос 3?', options: ['А', 'Б', 'В'], correctAnswer: '', points: 10 },
    ]
  },
  education: {
    title: 'Обучение',
    description: 'Учебный квиз',
    questions: [
      { id: '1', type: 'text', question: 'Ваше имя:', correctAnswer: '', points: 0 },
      { id: '2', type: 'multiple_choice', question: 'Урок 1 - Вопрос 1', options: ['Правильно', 'Неправильно'], correctAnswer: '', points: 10 },
      { id: '3', type: 'multiple_choice', question: 'Урок 1 - Вопрос 2', options: ['Правильно', 'Неправильно'], correctAnswer: '', points: 10 },
    ]
  },
  feedback: {
    title: 'Обратная связь',
    description: 'Сбор отзывов',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Насколько вы довольны?', options: ['1', '2', '3', '4', '5'], correctAnswer: '', points: 0 },
      { id: '2', type: 'text', question: 'Что понравилось?', correctAnswer: '', points: 0 },
      { id: '3', type: 'text', question: 'Что улучшить?', correctAnswer: '', points: 0 },
    ]
  },
  lead_magnet: {
    title: 'Лид-магнит',
    description: 'Квалификация лидов',
    questions: [
      { id: '1', type: 'text', question: 'Ваш email:', correctAnswer: '', points: 0 },
      { id: '2', type: 'text', question: 'Имя:', correctAnswer: '', points: 0 },
      { id: '3', type: 'multiple_choice', question: 'Интересует?', options: ['Да', 'Нет', 'Нужно больше информации'], correctAnswer: '', points: 5 },
    ]
  }
};

export default function Home() {
  const [quiz, setQuiz] = useState<Quiz>({
    title: '',
    description: '',
    questions: [],
  });
  
  const [topic, setTopic] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const applyTemplate = useCallback(() => {
    if (!selectedTemplate || !templates[selectedTemplate]) return;
    
    const template = templates[selectedTemplate];
    const topicText = topic.trim() || selectedTemplate;
    
    const titleMap: Record<string, string> = {
      onboarding: 'Онбординг',
      knowledge_test: 'Тест по теме',
      personality: 'Определение типа',
      product_fit: 'Анализ потребностей',
      trivia: 'Викторина',
      education: 'Учебный квиз',
      feedback: 'Обратная связь',
      lead_magnet: 'Анкета',
    };
    
    const adaptedQuiz: Quiz = {
      title: topicText ? `${titleMap[selectedTemplate]}: ${topicText}` : template.title,
      description: template.description,
      questions: template.questions.map(q => ({
        ...q,
        id: uuidv4(),
        question: topicText ? q.question.replace(/Вопрос \d+/, `Вопрос о "${topicText}"`).replace(/Урок \d+/, topicText) : q.question,
        options: q.options?.map(o => topicText ? o.replace(/Правильно|Неправильно/g, (match) => match) : o)
      }))
    };
    
    setQuiz(adaptedQuiz);
  }, [selectedTemplate, topic]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, ...updates } : q
      ),
    }));
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
  }, []);

  const addQuestion = useCallback(() => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: 'multiple_choice',
      question: '',
      options: ['', ''],
      correctAnswer: '',
      points: 10,
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  }, []);

  const updateOption = useCallback((questionId: string, optionIndex: number, value: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const newOptions = [...(q.options || [])];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }),
    }));
  }, []);

  const addOption = useCallback((questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: [...(q.options || []), ''] };
      }),
    }));
  }, []);

  const removeOption = useCallback((questionId: string, optionIndex: number) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        const newOptions = q.options?.filter((_, i) => i !== optionIndex) || [];
        return { ...q, options: newOptions };
      }),
    }));
  }, []);

  const exportQuiz = () => {
    const dataStr = JSON.stringify(quiz, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quiz.title || 'quiz'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
            Quiz Forge
          </h1>
          <button
            onClick={exportQuiz}
            disabled={!quiz.questions.length}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Экспорт JSON
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] glow">
            <h2 className="text-xl font-semibold mb-4">Шаблоны квизов</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(templates).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedTemplate === key 
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10' 
                      : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                  }`}
                >
                  <div className="font-medium text-sm">{tpl.title}</div>
                  <div className="text-xs text-[var(--muted)]">{tpl.questions.length} вопросов</div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Тема (например: Английский язык)"
                className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
              />
              <button
                onClick={applyTemplate}
                disabled={!selectedTemplate}
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg font-medium disabled:opacity-50 transition-all"
              >
                Применить
              </button>
            </div>
          </div>

          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4">Редактирование</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Название квиза</label>
                <input
                  type="text"
                  value={quiz.title}
                  onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название..."
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[var(--muted)] mb-1">Описание</label>
                <textarea
                  value={quiz.description}
                  onChange={e => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание квиза..."
                  rows={2}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((q, index) => (
              <div
                key={q.id}
                className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[var(--muted)]">Вопрос {index + 1}</span>
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="text-[var(--error)] hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={q.question}
                    onChange={e => updateQuestion(q.id, { question: e.target.value })}
                    placeholder="Текст вопроса..."
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
                  />

                  <div className="flex gap-2">
                    <select
                      value={q.type}
                      onChange={e => updateQuestion(q.id, { type: e.target.value as Question['type'] })}
                      className="px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
                    >
                      <option value="multiple_choice">Выбор ответа</option>
                      <option value="text">Текстовый ответ</option>
                    </select>
                    <input
                      type="number"
                      value={q.points}
                      onChange={e => updateQuestion(q.id, { points: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none"
                    />
                    <span className="text-sm text-[var(--muted)] self-center">баллов</span>
                  </div>

                  {q.type === 'multiple_choice' && (
                    <div className="space-y-2 mt-3">
                      {q.options?.map((opt, optIndex) => (
                        <div key={optIndex} className="flex gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                            className="accent-[var(--primary)]"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={e => updateOption(q.id, optIndex, e.target.value)}
                            placeholder={`Вариант ${optIndex + 1}`}
                            className="flex-1 px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:border-[var(--primary)] focus:outline-none text-sm"
                          />
                          <button
                            onClick={() => removeOption(q.id, optIndex)}
                            className="text-[var(--muted)] hover:text-[var(--error)]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(q.id)}
                        className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
                      >
                        + Добавить вариант
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full py-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
            >
              + Добавить вопрос
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h2 className="text-xl font-semibold mb-4">Превью</h2>
            
            {quiz.title || quiz.questions.length > 0 ? (
              <div className="space-y-4">
                {quiz.title && <h3 className="text-lg font-medium">{quiz.title}</h3>}
                {quiz.description && <p className="text-[var(--muted)] text-sm">{quiz.description}</p>}
                
                {quiz.questions.length > 0 && (
                  <div className="space-y-3 mt-4">
                    {quiz.questions.map((q, i) => (
                      <div key={q.id} className="p-3 bg-[var(--background)] rounded-lg">
                        <p className="font-medium text-sm mb-2">{i + 1}. {q.question || 'Без текста'}</p>
                        {q.type === 'multiple_choice' && q.options && (
                          <div className="space-y-1">
                            {q.options.filter(o => o).map((opt, j) => (
                              <div key={j} className="text-xs text-[var(--muted)]">○ {opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-[var(--primary)]/10 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-[var(--primary)]">{quiz.questions.length} вопросов</span>
                  <span className="text-sm text-[var(--accent)]">{quiz.questions.reduce((sum, q) => sum + q.points, 0)} баллов</span>
                </div>
              </div>
            ) : (
              <p className="text-[var(--muted)]">Выберите шаблон или добавьте вопросы</p>
            )}
          </div>

          <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)]">
            <h3 className="font-semibold mb-3">JSON структура</h3>
            <pre className="text-xs text-[var(--muted)] bg-[var(--background)] p-3 rounded-lg overflow-x-auto max-h-64">
              {JSON.stringify(quiz, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
