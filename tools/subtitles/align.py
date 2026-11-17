"""
Time a clip's subtitles from the words actually spoken (forced alignment), so each subtitle appears when its words
are said. Needs ffmpeg, Python 3 and PyTorch + torchaudio (CPU is fine):

  pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  python3 tools/subtitles/align.py scene-4-youssef-ennaciri

It reads tools/subtitles/<name>.txt, one subtitle per line:   <words as spoken> || <subtitle shown>
(the spoken words in the clip's language, as they sound; the subtitle in English), aligns the spoken words on
app/public/media/<name>.webm with the multilingual MMS aligner (downloads 1.2 GB once), and writes
app/subtitles/<name>.vtt. Each subtitle starts 0.1 s before its first word and stays until just after its last.
"""
import re, subprocess, sys, tempfile, unicodedata
from pathlib import Path
import numpy as np, torch, torchaudio

ROOT = Path(__file__).resolve().parents[2]
B = torchaudio.pipelines.MMS_FA
LEAD, TAIL, JOIN, MIN = 0.10, 0.35, 0.5, 1.0

def romanize(w):
    w = unicodedata.normalize("NFKD", w.lower().replace("’", "'"))
    return re.sub(r"[^a-z']", "", "".join(c for c in w if not unicodedata.combining(c)))

def ts(t):
    h, r = divmod(max(0, t), 3600); m, s = divmod(r, 60); return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"

def main(name):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "app/public/media" / f"{name}.webm"), "-vn", "-ac", "1",
                          "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    x = torch.from_numpy(np.frombuffer(pcm, np.int16).astype(np.float32) / 32768)
    dur = len(x) / 16000
    model = B.get_model(with_star=True).eval(); d = B.get_dict(star="*")
    chunk, ctx, parts = 20 * 16000, 16000, []
    with torch.inference_mode():
        for s in range(0, len(x), chunk):
            a, b = max(0, s - ctx), min(len(x), s + chunk + ctx)
            em = torch.log_softmax(model(x[a:b].unsqueeze(0))[0][0], -1); fps = em.shape[0] / ((b - a) / 16000)
            i0 = int(round((s - a) / 16000 * fps)); parts.append(em[i0:i0 + int(round(min(chunk, len(x) - s) / 16000 * fps))])
    em = torch.cat(parts); fr = dur / em.shape[0]
    cues = []
    for line in (ROOT / "tools/subtitles" / f"{name}.txt").read_text(encoding="utf-8").splitlines():
        if "||" in line:
            sp, sub = [p.strip() for p in line.split("||")]; cues.append({"words": [w for w in sp.split() if romanize(w)], "sub": sub})
    toks = [romanize(w) for c in cues for w in c["words"]]
    ali, sc = torchaudio.functional.forced_align(em.unsqueeze(0), torch.tensor([[d[ch] for t in toks for ch in t]], dtype=torch.int32), blank=0)
    spans = torchaudio.functional.merge_tokens(ali[0], sc[0].exp()); k = 0
    for c in cues:
        n = sum(len(romanize(w)) for w in c["words"]); sp = spans[k:k + n]; k += n
        c["w0"], c["w1"] = sp[0].start * fr, sp[-1].end * fr
    for i, c in enumerate(cues):
        c["start"] = max(c["w0"] - LEAD, cues[i - 1]["end"] + 0.04 if i else 0.0)
        if i + 1 < len(cues):
            nxt = cues[i + 1]["w0"] - LEAD; end = c["w1"] + TAIL
            end = nxt - 0.04 if nxt - end < JOIN else min(end, nxt - 0.04)
            c["end"] = min(c["start"] + MIN, nxt - 0.04) if end - c["start"] < MIN else end
        else:
            c["end"] = min(c["w1"] + 0.8, dur - 0.05)
    out = ["WEBVTT", ""]
    for i, c in enumerate(cues): out += [str(i + 1), f"{ts(c['start'])} --> {ts(c['end'])}", c["sub"], ""]
    (ROOT / "app/subtitles" / f"{name}.vtt").write_text("\n".join(out), encoding="utf-8")
    print(f"app/subtitles/{name}.vtt: {len(cues)} subtitles, words from {cues[0]['w0']:.1f}s to {cues[-1]['w1']:.1f}s")

if __name__ == "__main__":
    main(sys.argv[1])
