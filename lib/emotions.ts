export type EmotionCategory = "joy" | "anger" | "sadness" | "fear" | "shame" | "calm";

export interface EmotionItem {
    name: string;
    category: EmotionCategory;
}

export const EMOTIONS: EmotionItem[] = [
    // Радость
    { name: "Радость", category: "joy" },
    { name: "Восторг", category: "joy" },
    { name: "Надежда", category: "joy" },
    { name: "Гордость", category: "joy" },
    { name: "Нежность", category: "joy" },
    { name: "Благодарность", category: "joy" },
    { name: "Восхищение", category: "joy" },
    { name: "Любовь", category: "joy" },
    { name: "Умиротворение", category: "joy" },
    { name: "Умиление", category: "joy" },
    { name: "Безмятежность", category: "joy" },
    { name: "Воодушевление", category: "joy" },
    { name: "Азарт", category: "joy" },
    { name: "Ликование", category: "joy" },
    { name: "Симпатия", category: "joy" },
    { name: "Предвкушение", category: "joy" },
    // Гнев
    { name: "Гнев", category: "anger" },
    { name: "Раздражение", category: "anger" },
    { name: "Возмущение", category: "anger" },
    { name: "Недовольство", category: "anger" },
    { name: "Отвращение", category: "anger" },
    { name: "Презрение", category: "anger" },
    { name: "Бешенство", category: "anger" },
    { name: "Обида", category: "anger" },
    { name: "Злость", category: "anger" },
    { name: "Досада", category: "anger" },
    { name: "Зависть", category: "anger" },
    { name: "Негодование", category: "anger" },
    { name: "Злорадство", category: "anger" },
    { name: "Неприязнь", category: "anger" },
    { name: "Ревность", category: "anger" },
    // Печаль
    { name: "Печаль", category: "sadness" },
    { name: "Грусть", category: "sadness" },
    { name: "Разочарование", category: "sadness" },
    { name: "Тоска", category: "sadness" },
    { name: "Сочувствие", category: "sadness" },
    { name: "Отчаяние", category: "sadness" },
    { name: "Скорбь", category: "sadness" },
    { name: "Сожаление", category: "sadness" },
    { name: "Огорчение", category: "sadness" },
    { name: "Жалость", category: "sadness" },
    { name: "Горе", category: "sadness" },
    // Страх
    { name: "Страх", category: "fear" },
    { name: "Беспокойство", category: "fear" },
    { name: "Тревога", category: "fear" },
    { name: "Ужас", category: "fear" },
    { name: "Паника", category: "fear" },
    { name: "Испуг", category: "fear" },
    { name: "Волнение", category: "fear" },
    { name: "Настороженность", category: "fear" },
    { name: "Боязнь", category: "fear" },
    { name: "Опасение", category: "fear" },
    { name: "Трепет", category: "fear" },
    // Стыд
    { name: "Стыд", category: "shame" },
    { name: "Вина", category: "shame" },
    { name: "Смущение", category: "shame" },
    { name: "Неловкость", category: "shame" },
    { name: "Неудобство", category: "shame" },
];

export const CATEGORY_META: Record<EmotionCategory, { label: string; color: string; bg: string }> = {
    joy:     { label: "Радость",  color: "#d4a012", bg: "#2a2510" },
    anger:   { label: "Гнев",     color: "#d77070", bg: "#2a1515" },
    sadness: { label: "Печаль",   color: "#7aabd8", bg: "#152030" },
    fear:    { label: "Страх",    color: "#a07ad8", bg: "#1e1530" },
    shame:   { label: "Стыд",     color: "#d8a07a", bg: "#2a1e10" },
    calm:    { label: "Спокойно", color: "#7fb159", bg: "#152010" },
};