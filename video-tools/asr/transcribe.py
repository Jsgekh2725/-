import sys, numpy as np, soundfile as sf, sherpa_onnx, json
d='/opt/asr/sherpa-onnx-whisper-turbo/'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=d+'turbo-encoder.int8.onnx',decoder=d+'turbo-decoder.int8.onnx',
    tokens=d+'turbo-tokens.txt',language='ar',task='transcribe',num_threads=4,enable_token_timestamps=True)
y,sr=sf.read(sys.argv[1]); segs=json.loads(sys.argv[2]); out=[]
for a,b in segs:
    s=rec.create_stream(); s.set_option('max_tokens_per_second','25'); s.accept_waveform(sr, y[int(a*sr):int(b*sr)].astype(np.float32)); rec.decode_stream(s)
    r=s.result; out.append(dict(start=a,end=b,text=r.text.strip()))
    print(f"[{a:.2f}-{b:.2f}] {r.text.strip()}")
json.dump(out,open(sys.argv[3],'w'),ensure_ascii=False,indent=1)
