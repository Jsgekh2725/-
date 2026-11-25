import sys, json, numpy as np, soundfile as sf, onnxruntime as ort, re
D='/opt/asr/sherpa-onnx-omnilingual-asr-1600-languages-300M-ctc-int8-2025-11-12/'
sess=ort.InferenceSession(D+'model.int8.onnx',providers=['CPUExecutionProvider'])
tok={}; 
for line in open(D+'tokens.txt',encoding='utf-8'):
    line=line.rstrip('\n'); 
    if not line: continue
    s,i=line.rsplit(' ',1) if not line.startswith('  ') else (' ',line.split()[-1])
    tok[s]=int(i)
id2={v:k for k,v in tok.items()}
y,sr=sf.read(sys.argv[1]); assert sr==16000
segs=json.load(open(sys.argv[2]))
def logits(x, norm):
    if norm: x=(x-x.mean())/(x.std()+1e-7)
    return sess.run(None,{'x':x[None].astype(np.float32)})[0][0]
out=[]
for seg in segs:
    a,b,text=seg['start'],seg['end'],seg['align']
    x=y[int(a*sr):int(b*sr)]
    L=logits(x,True); lp=L-np.log(np.exp(L-L.max(1,keepdims=True)).sum(1,keepdims=True))-L.max(1,keepdims=True)
    T=len(lp); fdur=(b-a)/T
    blank=int(np.bincount(L.argmax(1)).argmax())
    greedy=''.join(id2[k] for k,prev in zip(L.argmax(1),[-1]+list(L.argmax(1)[:-1])) if k!=blank and k!=prev)
    words=text.split(); chars=[]; owner=[]
    for wi,w in enumerate(words):
        if wi>0: chars.append(tok[' ']); owner.append(-1)
        for c in w:
            if c in tok: chars.append(tok[c]); owner.append(wi)
            else: print('  missing token',repr(c))
    # CTC Viterbi forced alignment
    S=[blank]; so=[-1]
    for c,o in zip(chars,owner): S+= [c,blank]; so+=[o,-1]
    N=len(S); NEG=-1e9; dp=np.full((T,N),NEG); bp=np.zeros((T,N),int)
    dp[0,0]=lp[0,S[0]]; dp[0,1]=lp[0,S[1]]
    for t in range(1,T):
        for s in range(N):
            cands=[(dp[t-1,s],s)]
            if s>0: cands.append((dp[t-1,s-1],s-1))
            if s>1 and S[s]!=blank and S[s]!=S[s-2]: cands.append((dp[t-1,s-2],s-2))
            v,p=max(cands); dp[t,s]=v+lp[t,S[s]]; bp[t,s]=p
    s=N-1 if dp[-1,N-1]>dp[-1,N-2] else N-2; path=[0]*T
    for t in range(T-1,-1,-1): path[t]=s; s=bp[t,s]
    ws={}
    for t,s in enumerate(path):
        o=so[s]
        if o>=0 and S[s]!=blank: ws.setdefault(o,[t,t]); ws[o][1]=t
    disp=seg['display'].split()
    assert len(disp)==len(words), (disp,words)
    for wi in range(len(words)):
        t0,t1=ws[wi]; out.append(dict(word=disp[wi],start=round(a+t0*fdur,3),end=round(a+(t1+1)*fdur,3)))
    print(f'[{a:.2f}] greedy: {greedy}')
    print('   ', ' '.join(f"{o['word']}({o['start']:.2f})" for o in out[-len(words):]))
json.dump(out,open(sys.argv[3],'w'),ensure_ascii=False,indent=1)
