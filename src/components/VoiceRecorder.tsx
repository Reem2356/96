import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const MAX_SECONDS = 20;
const BAR_COUNT = 28;

interface VoiceRecorderProps {
  onComplete: (text: string) => void;
}

type RecorderState = "idle" | "recording" | "reviewing";

// دعم تحويل الصوت إلى نص عبر Web Speech API المدمجة في المتصفح (بدون أي
// مفتاح خدمة خارجي). غير مدعومة في كل المتصفحات (مثل فايرفوكس) — في هذه
// الحالة يستمر الموقع بالعمل ويطلب من المستخدم كتابة ما قاله يدويًا.
type SpeechRecognitionCtor = new () => SpeechRecognition;
function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function VoiceRecorder({ onComplete }: VoiceRecorderProps) {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(BAR_COUNT).fill(4));
  const [transcript, setTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micError, setMicError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognitionCtor()));
    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function cleanup() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) window.clearInterval(timerRef.current);
    recognitionRef.current?.stop();
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function drawLevels() {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const step = Math.floor(data.length / BAR_COUNT);
    const next = Array.from({ length: BAR_COUNT }, (_, i) => {
      const v = data[i * step] ?? 0;
      return Math.max(4, (v / 255) * 40);
    });
    setLevels(next);
    rafRef.current = requestAnimationFrame(drawLevels);
  }

  async function startRecording() {
    setMicError(null);
    finalTranscriptRef.current = "";
    setTranscript("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      drawLevels();

      const RecognitionCtor = getSpeechRecognitionCtor();
      if (RecognitionCtor) {
        const recognition = new RecognitionCtor();
        recognition.lang = "ar-SA";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) finalTranscriptRef.current += result[0].transcript + " ";
            else interim += result[0].transcript;
          }
          setTranscript((finalTranscriptRef.current + interim).trim());
        };
        recognition.onerror = () => {
          /* لا نوقف الموقع عند فشل التحويل — سيكمل المستخدم يدويًا */
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      setState("recording");
      setSeconds(0);
      timerRef.current = window.setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setMicError("تعذّر الوصول إلى الميكروفون. تحقق من الأذونات وحاول مجددًا، أو اكتب مشاركتك نصيًا.");
    }
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    recognitionRef.current?.stop();
    audioCtxRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setTranscript((finalTranscriptRef.current || transcript).trim());
    setState("reviewing");
  }

  if (micError) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-red-600">{micError}</p>
        <button
          type="button"
          onClick={() => setMicError(null)}
          className="mt-4 rounded-full bg-saudi-green-dark px-6 py-2 text-ivory"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (state === "reviewing") {
    return (
      <div className="mx-auto max-w-lg">
        {!speechSupported && (
          <p className="mb-3 text-center text-sm text-ink/60">
            تعذّر تحويل الصوت إلى نص تلقائيًا على هذا المتصفح — يرجى كتابة ما قلته أدناه.
          </p>
        )}
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value.slice(0, 150))}
          maxLength={150}
          placeholder="اكتب هنا ما قلته..."
          rows={4}
          className="w-full rounded-2xl border border-saudi-green/20 bg-white/70 p-4 text-lg leading-relaxed focus:border-saudi-green focus:outline-none"
        />
        <div className="mt-1 text-left text-xs text-ink/40">{transcript.length}/150</div>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setState("idle")}
            className="rounded-full border border-saudi-green-dark/30 px-6 py-3 text-saudi-green-dark"
          >
            إعادة التسجيل
          </button>
          <button
            type="button"
            disabled={!transcript.trim()}
            onClick={() => onComplete(transcript.trim())}
            className="rounded-full bg-saudi-green-dark px-8 py-3 font-bold text-ivory disabled:opacity-40"
          >
            حوّل كلماتي إلى جزء من اللوحة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      <p className="font-display text-xl font-bold text-saudi-green-dark sm:text-2xl">
        ماذا يعني لك الوطن وقادته؟
      </p>

      <motion.button
        type="button"
        onClick={state === "recording" ? stopRecording : startRecording}
        whileTap={{ scale: 0.94 }}
        className={`relative mt-10 flex h-28 w-28 items-center justify-center rounded-full text-4xl shadow-xl transition ${
          state === "recording" ? "bg-red-600 text-ivory" : "bg-saudi-green-dark text-ivory"
        }`}
      >
        {state === "recording" && (
          <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
        )}
        <span className="relative">{state === "recording" ? "■" : "🎙️"}</span>
      </motion.button>

      {state === "recording" && (
        <>
          {/* dir="ltr" ضروري هنا: بدونه يعيد خوارزمية Bidi ترتيب رقمي الوقت
              المفصولين بـ "/" داخل السياق العربي RTL فيظهران معكوسين */}
          <div dir="ltr" className="mt-6 font-mono text-2xl text-saudi-green-dark">
            00:{String(seconds).padStart(2, "0")} / 00:{MAX_SECONDS}
          </div>
          <div className="mt-4 flex h-12 items-end gap-1">
            {levels.map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-saudi-green"
                style={{ height: `${h}px`, transition: "height 80ms linear" }}
              />
            ))}
          </div>
          {transcript && <p className="mt-4 max-w-sm text-sm text-ink/60">{transcript}</p>}
        </>
      )}

      {state === "idle" && (
        <p className="mt-6 text-sm text-ink/60">اضغط على الميكروفون وابدأ الحديث (حتى 20 ثانية)</p>
      )}
    </div>
  );
}
