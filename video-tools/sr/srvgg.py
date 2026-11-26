"""Real-ESRGAN compact models (SRVGGNetCompact) on CPU with PyTorch, no basicsr needed.
Weights: /opt/sr/realesr-animevideov3.pth (x4, fast) or realesr-general-x4v3.pth (x4, real-world)."""
import torch, torch.nn as nn, torch.nn.functional as F

class SRVGGNetCompact(nn.Module):
    def __init__(self, num_in_ch=3, num_out_ch=3, num_feat=64, num_conv=16, upscale=4):
        super().__init__()
        self.upscale = upscale
        self.body = nn.ModuleList([nn.Conv2d(num_in_ch, num_feat, 3, 1, 1), nn.PReLU(num_parameters=num_feat)])
        for _ in range(num_conv):
            self.body.append(nn.Conv2d(num_feat, num_feat, 3, 1, 1)); self.body.append(nn.PReLU(num_parameters=num_feat))
        self.body.append(nn.Conv2d(num_feat, num_out_ch * upscale * upscale, 3, 1, 1))
        self.upsampler = nn.PixelShuffle(upscale)
    def forward(self, x):
        out = x
        for m in self.body: out = m(out)
        out = self.upsampler(out)
        return out + F.interpolate(x, scale_factor=self.upscale, mode='nearest')

def load(path, num_conv):
    m = SRVGGNetCompact(num_conv=num_conv)
    sd = torch.load(path, map_location='cpu', weights_only=True)
    m.load_state_dict(sd.get('params', sd.get('params_ema', sd)), strict=True)
    return m.eval()
