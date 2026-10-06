// Demo mode: stands in for the json-server API (`npm run server` on
// localhost:9000), so the quiz runs without a backend.
import data from "./questions.json";

export function fetchQuestions() {
  return new Promise((resolve) =>
    setTimeout(() => resolve(structuredClone(data.questions)), 500)
  );
}
