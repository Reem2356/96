import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ParticipationMethod } from "../components/ParticipationMethod";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { TextSubmission } from "../components/TextSubmission";
import { ProcessingScreen } from "../components/ProcessingScreen";
import { TileAnimation } from "../components/TileAnimation";
import { extractKeywords } from "../lib/keywordExtraction";
import { submissionsRepository } from "../lib/data";
import type { InputType, Submission } from "../lib/types";

type Step = "select" | "voice" | "text" | "processing" | "result";

export function ParticipatePage() {
  const [step, setStep] = useState<Step>("select");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const keywords = submission ? extractKeywords(submission.text) : [];

  async function handleFinalText(text: string, type: InputType) {
    setError(null);
    setSubmitting(true);
    try {
      const created = await submissionsRepository.createSubmission({ text, inputType: type });
      setSubmission(created);
      setStep("processing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع، حاول مجددًا.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto min-h-[80vh] max-w-5xl px-4 py-14 sm:px-6">
      {step === "select" && (
        <ParticipationMethod
          onSelect={(method) => setStep(method)}
        />
      )}

      {(step === "voice" || step === "text") && (
        <div>
          {error && (
            <p className="mx-auto mb-6 max-w-lg rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </p>
          )}
          {submitting ? (
            <p className="text-center text-ink/60">جاري إرسال مشاركتك...</p>
          ) : step === "voice" ? (
            <VoiceRecorder onComplete={(text) => handleFinalText(text, "voice")} />
          ) : (
            <TextSubmission onComplete={(text) => handleFinalText(text, "text")} />
          )}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setStep("select")}
              className="text-sm text-ink/50 underline underline-offset-4"
            >
              العودة لاختيار طريقة أخرى
            </button>
          </div>
        </div>
      )}

      {step === "processing" && <ProcessingScreen keywords={keywords} onDone={() => setStep("result")} />}

      {step === "result" && submission?.tileIndex != null && (
        <TileAnimation tileIndex={submission.tileIndex} keywords={keywords} onFinish={() => navigate("/mosaic")} />
      )}
    </div>
  );
}
