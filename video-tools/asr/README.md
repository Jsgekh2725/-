# Arabic transcription + word timing (works without Hugging Face / OpenAI hosts)

Models come from GitHub releases of k2-fsa/sherpa-onnx (installed by `setup.sh` into `/opt/asr`).

1. Text — Whisper large-v3-turbo (ONNX):
   `python3 transcribe.py speech16k.wav '[[start,end],...]' asr.json`  (16 kHz mono; one [start,end] per speech chunk)
2. Fix the text by hand into `transcript.json` (`display` = shown caption, `align` = spoken spelling, no diacritics).
3. Cut silences + remap words: `python3 cut_speech.py speech48.wav words.json out_dir [hook_s]`
4. Word times — CTC forced alignment with Meta Omnilingual ASR:
   `python3 align.py speech16k.wav transcript.json words.json`
