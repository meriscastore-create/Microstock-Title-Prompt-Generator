
export interface JsonPrompt {
  concept: string;
  composition: string;
  color: string;
  background: string;
  mood: string;
  style: string;
  settings: string;
}

export interface KeywordSuggestion {
  name: string;
  score: number;
}

export interface TopicCategory {
  category: string;
  topics: string[];
}
