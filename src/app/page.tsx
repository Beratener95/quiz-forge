'use client';

import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Quiz, Question, QuestionType, Result, QuizDesign, questionTypes } from '@/types/quiz';
import { templates, defaultDesign } from '@/data/templates';

type Tab = 'questions' | 'flow' | 'design' | 'settings';

export default function QuizBuilder() {
  const [view, setView] = useState<'projects' | 'builder'>('projects');
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});
  const [previewCurrentQuestion, setPreviewCurrentQuestion] = useState(0);
  const [previewScore, setPreviewScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('quizzes');
    if (saved) setQuizzes(JSON.parse(saved));
  }, []);

  const saveQuizzes = useCallback((newQuizzes: Quiz[]) => {
    setQuizzes(newQuizzes);
    localStorage.setItem('quizzes', JSON.stringify(newQuizzes));
  }, []);

  const createNewQuiz = useCallback((templateKey?: string) => {
    if (templateKey && templates[templateKey]) {
      const template = templates[templateKey];
      const newQuiz: Quiz = {
        ...template,
        id: uuidv4(),
        title: template.title,
        questions: template.questions.map(q => ({ ...q, id: uuidv4() })),
        results: template.results.map(r => ({ ...r, id: uuidv4() })),
        design: { ...template.design },
      };
      setCurrentQuiz(newQuiz);
      saveQuizzes([...quizzes, newQuiz]);
    } else {
      const newQuiz: Quiz = {
        id: uuidv4(),
        title: 'Новый квиз',
        description: 'Описание',
        questions: [],
        flow: [],
        results: [],
        design: defaultDesign,
        settings: { shuffleQuestions: false, showResults: true, collectEmail: false }
      };
      setCurrentQuiz(newQuiz);
      saveQuizzes([...quizzes, newQuiz]);
    }
    setView('builder');
    setActiveTab('questions');
    setSelectedQuestionId(null);
  }, [quizzes, saveQuizzes]);

  const loadQuiz = useCallback((quiz: Quiz) => {
    setCurrentQuiz(quiz);
    setView('builder');
    setActiveTab('questions');
    setSelectedQuestionId(quiz.questions[0]?.id || null);
  }, []);

  const deleteQuiz = useCallback((id: string) => {
    const newQuizzes = quizzes.filter(q => q.id !== id);
    saveQuizzes(newQuizzes);
    if (currentQuiz?.id === id) {
      setCurrentQuiz(null);
      setView('projects');
    }
  }, [quizzes, currentQuiz, saveQuizzes]);

  const duplicateQuiz = useCallback((quiz: Quiz) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: uuidv4(),
      title: `${quiz.title} (копия)`,
      questions: quiz.questions.map(q => ({ ...q, id: uuidv4() })),
      results: quiz.results.map(r => ({ ...r, id: uuidv4() })),
      design: { ...quiz.design },
    };
    saveQuizzes([...quizzes, newQuiz]);
  }, [quizzes, saveQuizzes]);

  const updateCurrentQuiz = useCallback((updates: Partial<Quiz>) => {
    if (!currentQuiz) return;
    const updated = { ...currentQuiz, ...updates };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const addQuestion = useCallback((type: QuestionType = 'multiple_choice') => {
    if (!currentQuiz) return;
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      question: 'Новый вопрос',
      required: false,
      points: 10,
      options: type === 'multiple_choice' ? [
        { id: uuidv4(), text: 'Вариант 1' },
        { id: uuidv4(), text: 'Вариант 2' },
      ] : undefined,
    };
    const updated = {
      ...currentQuiz,
      questions: [...currentQuiz.questions, newQuestion],
    };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
    setSelectedQuestionId(newQuestion.id);
  }, [currentQuiz]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    if (!currentQuiz) return;
    const updated = {
      ...currentQuiz,
      questions: currentQuiz.questions.map(q =>
        q.id === id ? { ...q, ...updates } : q
      ),
    };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const removeQuestion = useCallback((id: string) => {
    if (!currentQuiz) return;
    const updated = {
      ...currentQuiz,
      questions: currentQuiz.questions.filter(q => q.id !== id),
    };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
    if (selectedQuestionId === id) setSelectedQuestionId(null);
  }, [currentQuiz, selectedQuestionId]);

  const addOption = useCallback((questionId: string) => {
    if (!currentQuiz) return;
    const updated = {
      ...currentQuiz,
      questions: currentQuiz.questions.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: [...(q.options || []), { id: uuidv4(), text: `Вариант ${(q.options?.length || 0) + 1}` }]
        };
      }),
    };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const updateOption = useCallback((questionId: string, optionId: string, text: string) => {
    if (!currentQuiz) return;
    const updated = {
      ...currentQuiz,
      questions: currentQuiz.questions.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options?.map(o => o.id === optionId ? { ...o, text } : o)
        };
      }),
    };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const removeOption = useCallback((questionId: string, optionId: string) => {
    if (!currentQuiz) return;
    const updated = {
      ...currentQuiz,
      questions: currentQuiz.questions.map(q => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          options: q.options?.filter(o => o.id !== optionId)
        };
      }),
    };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedQuestion || !currentQuiz || draggedQuestion === targetId) return;
    const questions = [...currentQuiz.questions];
    const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
    const targetIndex = questions.findIndex(q => q.id === targetId);
    const [dragged] = questions.splice(draggedIndex, 1);
    questions.splice(targetIndex, 0, dragged);
    setCurrentQuiz({ ...currentQuiz, questions });
  };

  const updateDesign = useCallback((updates: Partial<QuizDesign>) => {
    if (!currentQuiz) return;
    const updated = { ...currentQuiz, design: { ...currentQuiz.design, ...updates } };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const updateSettings = useCallback((updates: Partial<Quiz['settings']>) => {
    if (!currentQuiz) return;
    const updated = { ...currentQuiz, settings: { ...currentQuiz.settings, ...updates } };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const addResult = useCallback(() => {
    if (!currentQuiz) return;
    const newResult: Result = {
      id: uuidv4(),
      title: 'Новый результат',
      description: 'Описание',
      minScore: 0,
      maxScore: 100,
    };
    const updated = { ...currentQuiz, results: [...currentQuiz.results, newResult] };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const updateResult = useCallback((id: string, updates: Partial<Result>) => {
    if (!currentQuiz) return;
    const updated = { ...currentQuiz, results: currentQuiz.results.map(r => r.id === id ? { ...r, ...updates } : r) };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const removeResult = useCallback((id: string) => {
    if (!currentQuiz) return;
    const updated = { ...currentQuiz, results: currentQuiz.results.filter(r => r.id !== id) };
    setCurrentQuiz(updated);
    setQuizzes(prev => prev.map(q => q.id === updated.id ? updated : q));
  }, [currentQuiz]);

  const exportQuiz = (format: 'json') => {
    if (!currentQuiz) return;
    if (format === 'json') {
      const dataStr = JSON.stringify(currentQuiz, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentQuiz.title || 'quiz'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const startPreview = () => {
    setPreviewAnswers({});
    setPreviewCurrentQuestion(0);
    setPreviewScore(0);
    setShowResult(false);
    setShowPreview(true);
    setTextAnswer('');
  };

  const handlePreviewAnswer = (answer: any) => {
    if (!currentQuiz) return;
    const question = currentQuiz.questions[previewCurrentQuestion];
    const newAnswers = { ...previewAnswers, [question.id]: answer };
    setPreviewAnswers(newAnswers);

    let addedScore = 0;
    if (typeof answer === 'string' && question.options) {
      const opt = question.options.find(o => o.text === answer);
      if (opt?.points) addedScore = opt.points;
    } else if (question.type === 'scale' || question.type === 'yes_no' || question.type === 'rating') {
      addedScore = (typeof answer === 'number' ? answer : (answer === 'true' ? 10 : 0)) || 0;
    }
    setPreviewScore(prev => prev + addedScore);

    if (previewCurrentQuestion < currentQuiz.questions.length - 1) {
      setPreviewCurrentQuestion(prev => prev + 1);
      setTextAnswer('');
    } else {
      setShowResult(true);
    }
  };

  const getPreviewResult = () => {
    if (!currentQuiz) return null;
    return currentQuiz.results.find(r => previewScore >= r.minScore && previewScore <= r.maxScore) || null;
  };

  const selectedQuestion = currentQuiz?.questions.find(q => q.id === selectedQuestionId);
  const tabs: { id: Tab; label: string }[] = [
    { id: 'questions', label: 'Вопросы' },
    { id: 'flow', label: 'Результаты' },
    { id: 'design', label: 'Дизайн' },
    { id: 'settings', label: 'Настройки' },
  ];

  if (view === 'projects') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Quiz Forge</h1>
              <p className="text-slate-500 mt-1">Создавай квизы для своего приложения</p>
            </div>
            <button
              onClick={() => createNewQuiz()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
            >
              + Новый квиз
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto p-8">
          <section className="mb-10">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Шаблоны квизов</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(templates).map(([key, tpl]) => (
                <button
                  key={key}
                  onClick={() => createNewQuiz(key)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 text-left hover:border-indigo-400 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl mb-4">
                    🎯
                  </div>
                  <h3 className="font-semibold text-slate-800">{tpl.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{tpl.questions.length} вопросов</p>
                </button>
              ))}
            </div>
          </section>

          {quizzes.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Мои квизы</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map(quiz => (
                  <div key={quiz.id} className="bg-white p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-semibold text-slate-800 text-lg">{quiz.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{quiz.description}</p>
                    <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                      <span>{quiz.questions.length} вопросов</span>
                      <span>{quiz.results.length} результатов</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => loadQuiz(quiz)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => { setCurrentQuiz(quiz); startPreview(); }}
                        className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        ▶
                      </button>
                      <button
                        onClick={() => duplicateQuiz(quiz)}
                        className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        ⎘
                      </button>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="px-3 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('projects')}
            className="text-slate-500 hover:text-slate-700"
          >
            ← Назад
          </button>
          <input
            type="text"
            value={currentQuiz?.title || ''}
            onChange={e => updateCurrentQuiz({ title: e.target.value })}
            className="text-lg font-semibold bg-transparent border-none outline-none text-slate-800"
            placeholder="Название"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={startPreview}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm"
          >
            ▶ Превью
          </button>
          <button
            onClick={() => exportQuiz('json')}
            className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm"
          >
            JSON
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 bg-white border-r border-slate-200 p-4 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-xl text-left transition ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 overflow-auto p-6 bg-slate-50">
          {activeTab === 'questions' && currentQuiz && (
            <div className="space-y-4 max-w-3xl">
              <input
                type="text"
                value={currentQuiz.description}
                onChange={e => updateCurrentQuiz({ description: e.target.value })}
                placeholder="Описание квиза"
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl"
              />

              <div className="space-y-2">
                {currentQuiz.questions.map((q, index) => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={() => setDraggedQuestion(q.id)}
                    onDragOver={(e) => handleDragOver(e, q.id)}
                    onDragEnd={() => setDraggedQuestion(null)}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-4 bg-white border rounded-xl cursor-pointer transition ${
                      selectedQuestionId === q.id
                        ? 'border-indigo-500 ring-2 ring-indigo-100'
                        : 'border-slate-200 hover:border-indigo-300'
                    } ${draggedQuestion === q.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 rounded-lg text-indigo-600 font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-slate-800">{q.question}</div>
                          <div className="text-xs text-slate-500">
                            {questionTypes.find(t => t.value === q.type)?.label} • {q.points} баллов
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                        className="p-2 text-slate-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-slate-500 self-center">Добавить:</span>
                {questionTypes.slice(0, 6).map(type => (
                  <button
                    key={type.value}
                    onClick={() => addQuestion(type.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:border-indigo-400"
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flow' && currentQuiz && (
            <div className="space-y-6 max-w-3xl">
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold mb-4">Результаты квиза</h3>
                {currentQuiz.results.length === 0 ? (
                  <p className="text-slate-500 mb-4">Добавьте результаты.</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {currentQuiz.results.map(result => (
                      <div key={result.id} className="p-4 bg-slate-50 rounded-xl">
                        <input
                          type="text"
                          value={result.title}
                          onChange={e => updateResult(result.id, { title: e.target.value })}
                          className="w-full font-medium mb-2 bg-transparent"
                        />
                        <input
                          type="text"
                          value={result.description}
                          onChange={e => updateResult(result.id, { description: e.target.value })}
                          className="w-full text-sm text-slate-500 bg-transparent mb-2"
                        />
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={result.minScore}
                            onChange={e => updateResult(result.id, { minScore: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm"
                            placeholder="Мин"
                          />
                          <input
                            type="number"
                            value={result.maxScore}
                            onChange={e => updateResult(result.id, { maxScore: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-sm"
                            placeholder="Макс"
                          />
                          <button
                            onClick={() => removeResult(result.id)}
                            className="text-red-500 text-sm ml-auto"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={addResult}
                  className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
                >
                  + Добавить результат
                </button>
              </div>
            </div>
          )}

          {activeTab === 'design' && currentQuiz && (
            <div className="grid grid-cols-2 gap-6 max-w-4xl">
              <div className="space-y-4">
                <h3 className="font-semibold">Цвета</h3>
                <div className="space-y-3">
                  {['primaryColor', 'accentColor', 'backgroundColor', 'buttonColor'].map(color => (
                    <div key={color}>
                      <label className="text-sm text-slate-500">{color.replace('Color', '')}</label>
                      <input
                        type="color"
                        value={currentQuiz.design[color as keyof QuizDesign] as string}
                        onChange={e => updateDesign({ [color]: e.target.value })}
                        className="w-full h-10 rounded-lg cursor-pointer mt-1"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold mb-4">Превью</h3>
                <div
                  className="p-6 rounded-xl border border-slate-200"
                  style={{ background: currentQuiz.design.backgroundColor }}
                >
                  <h4 className="font-bold mb-2" style={{ color: currentQuiz.design.primaryColor }}>
                    {currentQuiz.title || 'Название'}
                  </h4>
                  <p className="text-sm opacity-70 mb-4">{currentQuiz.description || 'Описание'}</p>
                  <div className="space-y-2 mb-4">
                    <div className="p-3 rounded-lg bg-black/10">Вариант 1</div>
                    <div className="p-3 rounded-lg bg-black/10">Вариант 2</div>
                  </div>
                  <button
                    className="w-full py-3 font-medium rounded-xl"
                    style={{ background: currentQuiz.design.buttonColor, color: '#fff' }}
                  >
                    Далее
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && currentQuiz && (
            <div className="space-y-6 max-w-xl">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentQuiz.settings.shuffleQuestions}
                    onChange={e => updateSettings({ shuffleQuestions: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                  Перемешать вопросы
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentQuiz.settings.showResults}
                    onChange={e => updateSettings({ showResults: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                  Показать результаты
                </label>
                <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentQuiz.settings.collectEmail}
                    onChange={e => updateSettings({ collectEmail: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600"
                  />
                  Сбор email
                </label>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold mb-4">Статистика</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-indigo-600">{currentQuiz.questions.length}</div>
                    <div className="text-xs text-slate-500">Вопросов</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-cyan-600">
                      {currentQuiz.questions.reduce((sum, q) => sum + q.points, 0)}
                    </div>
                    <div className="text-xs text-slate-500">Баллов</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{currentQuiz.results.length}</div>
                    <div className="text-xs text-slate-500">Результатов</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {selectedQuestion && (
          <aside className="w-80 bg-white border-l border-slate-200 p-4 overflow-auto">
            <h3 className="font-semibold mb-4">Редактор вопроса</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500">Тип</label>
                <select
                  value={selectedQuestion.type}
                  onChange={e => updateQuestion(selectedQuestion.id, { type: e.target.value as QuestionType })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {questionTypes.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Вопрос</label>
                <textarea
                  value={selectedQuestion.question}
                  onChange={e => updateQuestion(selectedQuestion.id, { question: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-slate-500">Баллы</label>
                  <input
                    type="number"
                    value={selectedQuestion.points}
                    onChange={e => updateQuestion(selectedQuestion.id, { points: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <label className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={selectedQuestion.required}
                    onChange={e => updateQuestion(selectedQuestion.id, { required: e.target.checked })}
                  />
                  <span className="text-sm">Обяз.</span>
                </label>
              </div>
              {(selectedQuestion.type === 'multiple_choice' || selectedQuestion.type === 'multi_select') && (
                <div>
                  <label className="text-xs text-slate-500">Варианты</label>
                  <div className="space-y-2 mt-2">
                    {selectedQuestion.options?.map((opt, i) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={e => updateOption(selectedQuestion.id, opt.id, e.target.value)}
                          placeholder={`Вариант ${i + 1}`}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeOption(selectedQuestion.id, opt.id)}
                          className="text-slate-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(selectedQuestion.id)}
                      className="text-sm text-indigo-600"
                    >
                      + Добавить
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {showPreview && currentQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-lg">{currentQuiz.title}</h2>
              <button onClick={() => setShowPreview(false)} className="text-2xl">&times;</button>
            </div>

            {!showResult ? (
              <div className="p-6">
                {currentQuiz.design.showProgress && (
                  <div className="h-2 bg-slate-100 rounded-full mb-6">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${((previewCurrentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                )}

                {currentQuiz.questions[previewCurrentQuestion] && (
                  <div>
                    <p className="text-lg font-medium mb-4">
                      {previewCurrentQuestion + 1}. {currentQuiz.questions[previewCurrentQuestion].question}
                    </p>

                    {(currentQuiz.questions[previewCurrentQuestion].type === 'multiple_choice' ||
                      currentQuiz.questions[previewCurrentQuestion].type === 'yes_no') && (
                      <div className="space-y-2">
                        {currentQuiz.questions[previewCurrentQuestion].options?.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => handlePreviewAnswer(opt.text)}
                            className="w-full p-4 text-left border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50"
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    )}

                    {(currentQuiz.questions[previewCurrentQuestion].type === 'scale' ||
                      currentQuiz.questions[previewCurrentQuestion].type === 'rating') && (
                      <div className="flex gap-2 flex-wrap">
                        {Array.from(
                          { length: currentQuiz.questions[previewCurrentQuestion].max || 10 },
                          (_, i) => i + 1
                        ).map(n => (
                          <button
                            key={n}
                            onClick={() => handlePreviewAnswer(n)}
                            className="w-12 h-12 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}

                    {(currentQuiz.questions[previewCurrentQuestion].type === 'text' ||
                      currentQuiz.questions[previewCurrentQuestion].type === 'email' ||
                      currentQuiz.questions[previewCurrentQuestion].type === 'number') && (
                      <div>
                        <input
                          type={currentQuiz.questions[previewCurrentQuestion].type === 'number' ? 'number' : 'text'}
                          value={textAnswer}
                          onChange={e => setTextAnswer(e.target.value)}
                          placeholder="Ваш ответ"
                          className="w-full p-4 border border-slate-200 rounded-xl mb-2"
                        />
                        <button
                          onClick={() => handlePreviewAnswer(textAnswer)}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                        >
                          Далее
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2">Результат</h3>
                {getPreviewResult() ? (
                  <>
                    <h4 className="text-xl font-semibold text-indigo-600 mb-2">{getPreviewResult()?.title}</h4>
                    <p className="text-slate-500">{getPreviewResult()?.description}</p>
                  </>
                ) : (
                  <p className="text-slate-500">Вы набрали {previewScore} баллов</p>
                )}
                <p className="mt-4 text-sm text-slate-500">
                  Баллы: {previewScore} / {currentQuiz.questions.reduce((sum, q) => sum + q.points, 0)}
                </p>
                <button
                  onClick={() => setShowPreview(false)}
                  className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
