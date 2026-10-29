import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { packs } from '@/data/packs';
import { formatPrice } from '@/lib/utils';

interface QuizAnswer {
  questionId: number;
  answer: string;
}

const questions = [
  {
    id: 1,
    question: '¿Cuál es tu objetivo principal?',
    options: [
      { value: 'energia', label: 'Más energía en el día a día', icon: '⚡' },
      { value: 'digestion', label: 'Mejorar mi digestión', icon: '🍃' },
      { value: 'fitness', label: 'Aumentar mi proteína', icon: '💪' },
      { value: 'hogar', label: 'Un hogar más eco', icon: '🏠' },
    ],
  },
  {
    id: 2,
    question: '¿Cuál es tu dieta?',
    options: [
      { value: 'omnivoro', label: 'Como de todo', icon: '🍽️' },
      { value: 'vegetariano', label: 'Vegetariano', icon: '🥬' },
      { value: 'vegano', label: 'Vegano', icon: '🌱' },
      { value: 'flexitariano', label: 'Flexitariano', icon: '🥗' },
    ],
  },
  {
    id: 3,
    question: '¿Tienes alguna restricción alimentaria?',
    options: [
      { value: 'ninguna', label: 'Ninguna', icon: '✅' },
      { value: 'sin-gluten', label: 'Sin gluten', icon: '🌾' },
      { value: 'sin-lactosa', label: 'Sin lactosa', icon: '🥛' },
      { value: 'frutos-secos', label: 'Sin frutos secos', icon: '🥜' },
    ],
  },
  {
    id: 4,
    question: '¿Cuál es tu presupuesto mensual para productos eco?',
    options: [
      { value: 'economico', label: 'Menos de 30€', icon: '💰' },
      { value: 'medio', label: 'Entre 30€ y 50€', icon: '💵' },
      { value: 'premium', label: 'Entre 50€ y 80€', icon: '💎' },
      { value: 'sin-limite', label: 'Sin límite', icon: '✨' },
    ],
  },
  {
    id: 5,
    question: '¿Con qué frecuencia quieres recibir productos?',
    options: [
      { value: 'una-vez', label: 'Solo una vez', icon: '1️⃣' },
      { value: 'mensual', label: 'Cada mes', icon: '📅' },
      { value: 'quincenal', label: 'Cada 2 semanas', icon: '🔄' },
      { value: 'trimestral', label: 'Cada 3 meses', icon: '📆' },
    ],
  },
  {
    id: 6,
    question: '¿Cuánto tiempo dedicas a cocinar?',
    options: [
      { value: 'poco', label: 'Poco, busco rapidez', icon: '⏱️' },
      { value: 'medio', label: 'Lo justo, 20-30 min', icon: '👨‍🍳' },
      { value: 'mucho', label: 'Me gusta cocinar', icon: '❤️' },
      { value: 'variable', label: 'Depende del día', icon: '🎲' },
    ],
  },
  {
    id: 7,
    question: '¿Qué tipo de productos prefieres?',
    options: [
      { value: 'snacks', label: 'Snacks y picoteo', icon: '🍪' },
      { value: 'despensa', label: 'Básicos de despensa', icon: '🏺' },
      { value: 'mixto', label: 'Un poco de todo', icon: '📦' },
      { value: 'hogar', label: 'Productos de hogar', icon: '🧹' },
    ],
  },
];

const getRecommendations = (answers: QuizAnswer[]) => {
  const scores: Record<string, number> = {};
  
  // Initialize scores
  packs.forEach(pack => { scores[pack.slug] = 0; });
  
  answers.forEach(answer => {
    switch (answer.questionId) {
      case 1: // Objetivo
        if (answer.answer === 'energia') {
          scores['energia-mananas'] += 3;
          scores['inicio-eco'] += 1;
        } else if (answer.answer === 'digestion') {
          scores['digestion-bienestar'] += 3;
          scores['reset-suave'] += 2;
        } else if (answer.answer === 'fitness') {
          scores['proteico-natural'] += 3;
          scores['energia-mananas'] += 1;
        } else if (answer.answer === 'hogar') {
          scores['limpieza-ecologica'] += 3;
          scores['higiene-zero-waste'] += 2;
        }
        break;
      case 2: // Dieta
        if (answer.answer === 'vegano' || answer.answer === 'vegetariano') {
          scores['vegano-facil'] += 3;
        }
        break;
      case 3: // Restricciones
        if (answer.answer === 'sin-gluten') {
          scores['sin-gluten-seguro'] += 4;
        }
        break;
      case 4: // Presupuesto
        if (answer.answer === 'premium' || answer.answer === 'sin-limite') {
          scores['cesta-gourmet-eco'] += 2;
        } else if (answer.answer === 'economico') {
          scores['kids-eco'] += 1;
          scores['limpieza-ecologica'] += 1;
        }
        break;
      case 6: // Tiempo cocina
        if (answer.answer === 'poco') {
          scores['oficina-saludable'] += 2;
          scores['reset-suave'] += 1;
        }
        break;
      case 7: // Tipo productos
        if (answer.answer === 'snacks') {
          scores['oficina-saludable'] += 2;
          scores['kids-eco'] += 1;
        } else if (answer.answer === 'despensa') {
          scores['inicio-eco'] += 2;
        } else if (answer.answer === 'hogar') {
          scores['limpieza-ecologica'] += 2;
          scores['higiene-zero-waste'] += 2;
        }
        break;
    }
  });
  
  // Sort by score and get top 2
  const sorted = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([slug]) => packs.find(p => p.slug === slug)!);
  
  return sorted;
};

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, { questionId: questions[currentQuestion].id, answer }];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const recommendations = showResults ? getRecommendations(answers) : [];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-[80vh] section-padding flex items-center">
      <div className="container-eco max-w-2xl">
        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question */}
              <h1 className="font-display text-2xl md:text-3xl font-bold mb-8 text-center">
                {questions[currentQuestion].question}
              </h1>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {questions[currentQuestion].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className="p-5 rounded-2xl bg-card border-2 border-transparent hover:border-primary transition-all text-left group hover:shadow-eco-hover"
                  >
                    <span className="text-3xl mb-3 block">{option.icon}</span>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {currentQuestion > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="mt-8 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                ¡Tenemos tus packs ideales!
              </h1>
              <p className="text-muted-foreground mb-10">
                Basándonos en tus respuestas, estos son los packs perfectos para ti:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {recommendations.map((pack, i) => (
                  <Link
                    key={pack.id}
                    to={`/packs/${pack.slug}`}
                    className="pack-card group text-left"
                  >
                    {i === 0 && (
                      <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        🥇 Mejor opción
                      </div>
                    )}
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={pack.image}
                        alt={pack.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{pack.icon}</span>
                        <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                          {pack.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {pack.shortDescription}
                      </p>
                      <p className="font-semibold">Desde {formatPrice(pack.prices.S)}</p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/packs">
                  <Button variant="outline" size="lg">
                    Ver todos los packs
                  </Button>
                </Link>
                <Button
                  size="lg"
                  onClick={() => {
                    setCurrentQuestion(0);
                    setAnswers([]);
                    setShowResults(false);
                  }}
                >
                  Repetir test
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quiz;
