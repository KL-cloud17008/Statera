import { getExerciseFormGuide } from "@/lib/exercise-form-guides";

export function ExerciseFormGuide({ name, cues }: { name: string; cues?: string | null }) {
  const guide = getExerciseFormGuide(name);
  if (!guide && !cues) return null;

  return <details className="mt-2 text-caption text-secondary">
    <summary className="flex min-h-10 cursor-pointer items-center font-medium text-primary focus-visible:outline-2 focus-visible:outline-accent">Form guide</summary>
    <div className="space-y-3 border-l-2 border-rule pb-2 pl-3 leading-relaxed">
      {guide ? <dl className="grid gap-2">
        <div><dt className="font-medium text-primary">Setup</dt><dd>{guide.setup}</dd></div>
        <div><dt className="font-medium text-primary">Movement</dt><dd>{guide.movement}</dd></div>
        <div><dt className="font-medium text-primary">Common mistake</dt><dd>{guide.commonMistake}</dd></div>
      </dl> : null}
      {cues ? <p><span className="block font-medium text-primary">Session cues</span>{cues}</p> : null}
    </div>
  </details>;
}
