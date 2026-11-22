/* RoGUI Studio — export.js : توليد سكربت Lua ينشئ الواجهة كاملة داخل Part */
'use strict';

const LUA_RUNTIME = String.raw`--[[ RoGUI Runtime — تم توليده تلقائياً من RoGUI Studio
     يشغّل: Hover / Press / Click FX / Enter / Idle / Actions / Tooltip / Drag
     الإعدادات محفوظة في Attribute اسمها "RoGUI" على كل عنصر (JSON) — تقدر تعدلها ]]
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local HttpService = game:GetService("HttpService")
local GuiService = game:GetService("GuiService")
local SoundService = game:GetService("SoundService")

local gui = script.Parent
local DEF = __DEF__

local FX = Instance.new("Frame")
FX.Name = "RoGUI_FX"
FX.BackgroundTransparency = 1
FX.Size = UDim2.fromScale(1, 1)
FX.ZIndex = 9999
FX.Active = false
FX.Parent = gui

local function col(h)
	if typeof(h) ~= "string" then return Color3.new(1, 1, 1) end
	local ok, c = pcall(Color3.fromHex, h)
	return ok and c or Color3.new(1, 1, 1)
end
local function ES(n) local ok, v = pcall(function() return Enum.EasingStyle[n] end) return ok and v or Enum.EasingStyle.Quad end
local function ED(n) local ok, v = pcall(function() return Enum.EasingDirection[n] end) return ok and v or Enum.EasingDirection.Out end
local function TI(t, s, d) return TweenInfo.new(math.max(0, tonumber(t) or 0.2), ES(s), ED(d)) end
local function tween(o, info, goal) local tw = TweenService:Create(o, info, goal) tw:Play() return tw end
local function rid(id) local s = tostring(id or ""):gsub("%D", "") return s end
local function rnd(a, b) return a + math.random() * (b - a) end
local function round(o) local c = Instance.new("UICorner") c.CornerRadius = UDim.new(1, 0) c.Parent = o end

local function sound(id)
	local s = rid(id)
	if s == "" then return end
	local snd = Instance.new("Sound")
	snd.SoundId = "rbxassetid://" .. s
	snd.Volume = 0.7
	snd.Parent = SoundService
	snd:Play()
	task.delay(8, function() snd:Destroy() end)
end

local function getCfg(o)
	local s = o:GetAttribute("RoGUI")
	local t = {}
	if typeof(s) == "string" and s ~= "" then
		local ok, r = pcall(function() return HttpService:JSONDecode(s) end)
		if ok and type(r) == "table" then t = r end
	end
	return setmetatable(t, { __index = DEF })
end

-- ===== الشفافية (للظهور والإخفاء) =====
local TPROPS = { "BackgroundTransparency", "TextTransparency", "TextStrokeTransparency", "ImageTransparency", "ScrollBarImageTransparency" }
local function snapT(root)
	local list = {}
	local function add(o)
		local e = { o = o, p = {} }
		if o:IsA("GuiObject") then
			for _, k in ipairs(TPROPS) do
				local ok, v = pcall(function() return o[k] end)
				if ok and type(v) == "number" then e.p[k] = v end
			end
		elseif o:IsA("UIStroke") then
			e.p.Transparency = o.Transparency
		end
		if next(e.p) then table.insert(list, e) end
	end
	add(root)
	for _, d in ipairs(root:GetDescendants()) do
		if d.Name ~= "RoGUI_Ripple" then add(d) end
	end
	return list
end
local function fadeList(list, show, info)
	for _, e in ipairs(list) do
		if e.o.Parent then
			local goal = {}
			for k, v in pairs(e.p) do
				if show then e.o[k] = 1 goal[k] = v else goal[k] = 1 end
			end
			tween(e.o, info, goal)
		end
	end
end
local function restoreT(list)
	for _, e in ipairs(list) do for k, v in pairs(e.p) do e.o[k] = v end end
end

-- ===== حالة كل عنصر =====
local states = {}
local function nv(v) local n = Instance.new("NumberValue") n.Value = v return n end
local function getState(o)
	local st = states[o]
	if st then return st end
	st = { o = o, cfg = getCfg(o) }
	local c = st.cfg
	local sc = o:FindFirstChildWhichIsA("UIScale")
	if not sc then sc = Instance.new("UIScale") sc.Name = "RoGUI_Scale" sc.Parent = o end
	st.scale = sc
	st.baseScale = sc.Scale
	st.basePos = o.Position
	st.baseRot = o.Rotation
	st.baseSize = o.Size
	st.baseBg = o.BackgroundColor3
	st.baseBgT = o.BackgroundTransparency
	pcall(function() st.baseText = o.TextColor3 end)
	st.stroke = o:FindFirstChildWhichIsA("UIStroke")
	if not st.stroke and ((c.hoverOn and c.hoverStrokeOn) or c.idleType == "glow") then
		local s = Instance.new("UIStroke")
		s.ApplyStrokeMode = Enum.ApplyStrokeMode.Border
		s.Thickness = 0
		s.Color = col(c.hoverStrokeColor)
		s.Parent = o
		st.stroke = s
	end
	if st.stroke then st.baseSC = st.stroke.Color st.baseST = st.stroke.Thickness end
	st.hs, st.es, st.ms = nv(1), nv(1), nv(1)
	st.lift, st.ox, st.oy, st.rot, st.mx, st.mr = nv(0), nv(0), nv(0), nv(0), nv(0), nv(0)
	st.hover, st.press = false, false
	states[o] = st
	return st
end

local function refresh(st)
	local c, o = st.cfg, st.o
	local info = TI(c.tweenTime, c.easeStyle, c.easeDir)
	local h = st.hover and c.hoverOn
	local p = st.press and c.pressOn
	local s = 1
	if h then s = s * c.hoverScale end
	if p then s = s * c.pressScale end
	tween(st.hs, info, { Value = s })
	tween(st.lift, info, { Value = h and c.hoverLift or 0 })
	tween(st.rot, info, { Value = h and c.hoverRotate or 0 })
	if (c.hoverOn and c.hoverColorOn) or (c.pressOn and c.pressColorOn) then
		local bg = st.baseBg
		if h and c.hoverColorOn then bg = col(c.hoverColor) end
		if p and c.pressColorOn then bg = col(c.pressColor) end
		tween(o, info, { BackgroundColor3 = bg })
	end
	if c.hoverOn and c.hoverTextOn and st.baseText then
		tween(o, info, { TextColor3 = h and col(c.hoverTextColor) or st.baseText })
	end
	if c.hoverOn and c.hoverTranspOn then
		tween(o, info, { BackgroundTransparency = h and c.hoverTransp or st.baseBgT })
	end
	if c.hoverOn and c.hoverStrokeOn and st.stroke then
		tween(st.stroke, info, { Color = h and col(c.hoverStrokeColor) or st.baseSC, Thickness = h and c.hoverStrokeThick or st.baseST })
	end
end

-- ===== الجزيئات (طراطيع / قلوب / نجوم ...) =====
local parts = {}
local function newP(kind)
	local o
	if kind == "frame" then
		o = Instance.new("Frame") o.BorderSizePixel = 0
	elseif kind == "text" then
		o = Instance.new("TextLabel") o.BackgroundTransparency = 1 o.TextScaled = true o.Font = Enum.Font.GothamBlack o.Text = ""
	else
		o = Instance.new("ImageLabel") o.BackgroundTransparency = 1
	end
	o.AnchorPoint = Vector2.new(0.5, 0.5)
	o.ZIndex = 10000
	o.Parent = FX
	return o
end
local function addP(o, x, y, vx, vy, w, h, opt)
	opt = opt or {}
	table.insert(parts, {
		o = o, x = x, y = y, vx = vx, vy = vy, w = w, h = h,
		g = opt.g or 0, drag = opt.drag or 0, t = 0, life = opt.life or 1,
		rot = opt.rot or 0, vr = opt.vr or 0, s0 = opt.s0 or 1, s1 = opt.s1 or 1,
		prop = opt.prop or "BackgroundTransparency", a0 = opt.a0 or 0, stroke = opt.stroke, wob = opt.wob
	})
end

local GLYPHS = { sparkles = { "✦", "✧" }, stars = { "★" }, hearts = { "❤" }, snow = { "❄", "❅" }, coins = { "🪙" } }
local function burst(st, c, pos)
	local kind = c.clickFx
	local colors = {}
	if type(c.fxColors) == "table" then for _, h in ipairs(c.fxColors) do table.insert(colors, col(h)) end end
	if #colors == 0 then colors = { Color3.new(1, 1, 1) } end
	local function rc() return colors[math.random(1, #colors)] end
	local n = math.clamp(math.floor(tonumber(c.fxCount) or 20), 1, 150)
	local size, sp, g, life = c.fxSize, c.fxSpread, c.fxGravity, c.fxLife
	local x, y = pos.X, pos.Y
	local function cone(spread)
		local a = math.rad(-90 + rnd(-spread, spread))
		local v = sp * rnd(0.55, 1.15)
		return math.cos(a) * v, math.sin(a) * v
	end
	if kind == "confetti" then
		for _ = 1, n do
			local o = newP("frame") o.BackgroundColor3 = rc()
			local s = size * rnd(0.7, 1.3)
			local vx, vy = cone(60)
			addP(o, x, y, vx, vy, s, s * 0.55, { g = g, drag = 1.1, life = life * rnd(0.8, 1.3), rot = rnd(0, 360), vr = rnd(-720, 720) })
		end
	elseif kind == "fireworks" then
		for i = 1, n do
			local o = newP("frame") o.BackgroundColor3 = rc() round(o)
			local a = (i / n) * math.pi * 2 + rnd(-0.1, 0.1)
			local v = sp * rnd(0.8, 1.1)
			addP(o, x, y, math.cos(a) * v, math.sin(a) * v, size * 0.7, size * 0.7, { g = g * 0.35, drag = 2.2, life = life, s0 = 1.2, s1 = 0.2 })
		end
	elseif GLYPHS[kind] or kind == "emoji" then
		local list = GLYPHS[kind]
		if kind == "emoji" then
			list = {}
			for w in string.gmatch(tostring(c.fxEmoji), "%S+") do table.insert(list, w) end
			if #list == 0 then list = { "🎉" } end
		end
		for _ = 1, n do
			local o = newP("text")
			o.Text = list[math.random(1, #list)]
			o.TextColor3 = (kind == "emoji" or kind == "coins") and Color3.new(1, 1, 1) or rc()
			local s = size * rnd(1.2, 2)
			local vx, vy, opt
			if kind == "sparkles" then
				local a = rnd(0, math.pi * 2)
				local v = sp * rnd(0.2, 0.6)
				vx, vy = math.cos(a) * v, math.sin(a) * v
				opt = { drag = 2.5, life = life * rnd(0.6, 1), s0 = 1.3, s1 = 0, vr = rnd(-200, 200) }
			elseif kind == "hearts" then
				vx, vy = rnd(-60, 60), -sp * rnd(0.35, 0.7)
				opt = { g = -40, drag = 0.6, life = life * rnd(0.9, 1.4), s0 = 0.5, s1 = 1.2, wob = rnd(2, 4) }
			elseif kind == "snow" then
				vx, vy = rnd(-1, 1) * sp * 0.4, -sp * rnd(0.2, 0.5)
				opt = { g = 120, drag = 1.5, life = life * rnd(1, 1.6), vr = rnd(-90, 90), wob = rnd(1, 3) }
			else
				vx, vy = cone(kind == "coins" and 35 or 55)
				opt = { g = g, drag = 0.8, life = life * rnd(0.8, 1.2), vr = rnd(-360, 360) }
			end
			opt.prop = "TextTransparency"
			addP(o, x, y, vx, vy, s, s, opt)
		end
	elseif kind == "bubbles" then
		for _ = 1, n do
			local o = newP("frame") o.BackgroundColor3 = rc() o.BackgroundTransparency = 0.5 round(o)
			local s = size * rnd(0.8, 1.8)
			addP(o, x + rnd(-10, 10), y, rnd(-50, 50), -sp * rnd(0.25, 0.6), s, s, { g = -60, drag = 0.8, life = life * rnd(0.9, 1.5), a0 = 0.5, wob = rnd(2, 5) })
		end
	elseif kind == "image" then
		local img = st.fxImage or ("rbxassetid://" .. rid(c.fxImage))
		for _ = 1, n do
			local o = newP("image") o.Image = img
			local s = size * rnd(1.4, 2.2)
			local vx, vy = cone(55)
			addP(o, x, y, vx, vy, s, s, { g = g, drag = 0.8, life = life * rnd(0.8, 1.2), vr = rnd(-360, 360), prop = "ImageTransparency" })
		end
	elseif kind == "ring" then
		local o = newP("frame") o.BackgroundTransparency = 1 round(o)
		local s = Instance.new("UIStroke") s.Color = rc() s.Thickness = math.max(2, size * 0.3) s.Parent = o
		o.Position = UDim2.fromOffset(x, y) o.Size = UDim2.fromOffset(4, 4)
		local info = TweenInfo.new(life * 0.7, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
		tween(o, info, { Size = UDim2.fromOffset(size * 10, size * 10) })
		tween(s, info, { Transparency = 1, Thickness = 0 })
		task.delay(life * 0.7, function() o:Destroy() end)
	elseif kind == "text" then
		local o = newP("text")
		o.Text = tostring(c.fxText) o.TextColor3 = rc() o.TextStrokeTransparency = 0
		local s = size * 3
		addP(o, x, y, rnd(-20, 20), -sp * 0.45, s * 2, s, { drag = 1.6, life = life, s0 = 0.6, s1 = 1.15, prop = "TextTransparency", stroke = true })
	elseif kind == "ripple" then
		local o = st.o
		o.ClipsDescendants = true
		local scale = math.max(st.scale.Scale, 0.01)
		local lp = (pos - (o.AbsolutePosition - FX.AbsolutePosition)) / scale
		local r = Instance.new("Frame")
		r.Name = "RoGUI_Ripple" r.AnchorPoint = Vector2.new(0.5, 0.5) r.BorderSizePixel = 0
		r.BackgroundColor3 = rc() r.BackgroundTransparency = 0.6
		r.Position = UDim2.fromOffset(lp.X, lp.Y) r.Size = UDim2.fromOffset(0, 0)
		r.ZIndex = 0
		round(r) r.Parent = o
		local d = math.max(o.AbsoluteSize.X, o.AbsoluteSize.Y) * 2.4 / scale
		local info = TweenInfo.new(life * 0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
		tween(r, info, { Size = UDim2.fromOffset(d, d), BackgroundTransparency = 1 })
		task.delay(life * 0.6, function() r:Destroy() end)
	end
end

-- ===== التلميح Tooltip =====
local tipLabel, tipOwner
local function tip(text, owner)
	if not tipLabel then
		tipLabel = Instance.new("TextLabel")
		tipLabel.Name = "RoGUI_Tooltip"
		tipLabel.AutomaticSize = Enum.AutomaticSize.XY
		tipLabel.Size = UDim2.fromOffset(0, 0)
		tipLabel.BackgroundColor3 = Color3.fromRGB(20, 21, 32)
		tipLabel.BackgroundTransparency = 0.08
		tipLabel.TextColor3 = Color3.new(1, 1, 1)
		tipLabel.Font = Enum.Font.GothamMedium
		tipLabel.TextSize = 14
		tipLabel.ZIndex = 10001
		local c = Instance.new("UICorner") c.CornerRadius = UDim.new(0, 6) c.Parent = tipLabel
		local p = Instance.new("UIPadding")
		p.PaddingLeft = UDim.new(0, 8) p.PaddingRight = UDim.new(0, 8) p.PaddingTop = UDim.new(0, 5) p.PaddingBottom = UDim.new(0, 5)
		p.Parent = tipLabel
		local s = Instance.new("UIStroke") s.Color = Color3.fromRGB(139, 123, 255) s.Transparency = 0.4 s.Parent = tipLabel
		tipLabel.Parent = FX
	end
	tipLabel.Text = text
	tipLabel.Visible = true
	tipOwner = owner
end
local function hideTip(owner)
	if tipLabel and tipOwner == owner then tipLabel.Visible = false tipOwner = nil end
end

-- ===== حركات النقر =====
local function seq(v, list, dt, style)
	task.spawn(function()
		for _, x in ipairs(list) do
			tween(v, TweenInfo.new(dt, style or Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Value = x }).Completed:Wait()
		end
	end)
end
local function motion(st, m)
	local o = st.o
	if m == "shake" then seq(st.mx, { 9, -9, 7, -7, 4, -4, 0 }, 0.04)
	elseif m == "bounce" then seq(st.ms, { 0.82, 1.12, 0.96, 1 }, 0.09)
	elseif m == "pulse" then seq(st.ms, { 1.15, 1 }, 0.12)
	elseif m == "pop" then seq(st.ms, { 1.25, 1 }, 0.08, Enum.EasingStyle.Back)
	elseif m == "wobble" then seq(st.mr, { 12, -10, 7, -4, 0 }, 0.07)
	elseif m == "spin" then
		tween(st.mr, TweenInfo.new(0.5, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Value = 360 }).Completed:Connect(function() st.mr.Value = 0 end)
	elseif m == "jelly" then
		task.spawn(function()
			local b = st.baseSize
			for _, k in ipairs({ { 1.2, 0.8 }, { 0.88, 1.12 }, { 1.06, 0.94 }, { 1, 1 } }) do
				local goal = UDim2.new(b.X.Scale * k[1], b.X.Offset * k[1], b.Y.Scale * k[2], b.Y.Offset * k[2])
				tween(o, TweenInfo.new(0.09, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), { Size = goal }).Completed:Wait()
			end
		end)
	elseif m == "flash" then
		task.spawn(function()
			tween(o, TweenInfo.new(0.06), { BackgroundColor3 = Color3.new(1, 1, 1) }).Completed:Wait()
			tween(o, TweenInfo.new(0.3), { BackgroundColor3 = st.baseBg }).Completed:Wait()
			refresh(st)
		end)
	end
end

-- ===== أنميشن الظهور =====
local function playEnter(st, kind, delay)
	local c, o = st.cfg, st.o
	kind = kind or c.enterType
	delay = delay or c.enterDelay
	if kind == "none" then return end
	local info = TI(c.enterTime, c.enterStyle, c.enterDir)
	st.tlist = st.tlist or snapT(o)
	local needFade = kind ~= "typewriter" and kind ~= "pop" and kind ~= "drop"
	if kind == "pop" then st.es.Value = 0
	elseif kind == "zoom" then st.es.Value = 1.6
	elseif kind == "slideTop" then st.oy.Value = -160
	elseif kind == "slideBottom" then st.oy.Value = 160
	elseif kind == "slideLeft" then st.ox.Value = -220
	elseif kind == "slideRight" then st.ox.Value = 220
	elseif kind == "spinIn" then st.es.Value = 0 st.mr.Value = -180
	elseif kind == "drop" then st.oy.Value = -260
	elseif kind == "typewriter" then pcall(function() o.MaxVisibleGraphemes = 0 end)
	end
	if needFade then for _, e in ipairs(st.tlist) do for k in pairs(e.p) do e.o[k] = 1 end end end
	task.delay(delay, function()
		if kind == "typewriter" then
			local ok, len = pcall(function() return utf8.len(o.ContentText) or #o.Text end)
			len = ok and len or 0
			for i = 1, len do o.MaxVisibleGraphemes = i task.wait(c.enterTime / len) end
			pcall(function() o.MaxVisibleGraphemes = -1 end)
			return
		end
		tween(st.es, info, { Value = 1 })
		tween(st.ox, info, { Value = 0 })
		tween(st.oy, info, { Value = 0 })
		tween(st.mr, info, { Value = 0 })
		if needFade then
			local fi = TweenInfo.new(math.max(0.05, c.enterTime * 0.8), Enum.EasingStyle.Quad, Enum.EasingDirection.Out)
			for _, e in ipairs(st.tlist) do if e.o.Parent then tween(e.o, fi, e.p) end end
		end
	end)
end

-- ===== فتح / إغلاق =====
local function openEl(o)
	local st = getState(o)
	if o.Visible and not st.closing then return end
	st.closing = false
	o.Visible = true
	if st.cfg.enterType ~= "none" then
		playEnter(st, nil, 0)
	else
		st.tlist = st.tlist or snapT(o)
		st.es.Value = 0.8
		tween(st.es, TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out), { Value = 1 })
		fadeList(st.tlist, true, TweenInfo.new(0.2))
	end
end
local function closeEl(o)
	local st = getState(o)
	if not o.Visible or st.closing then return end
	st.closing = true
	st.tlist = st.tlist or snapT(o)
	local info = TweenInfo.new(0.18, Enum.EasingStyle.Quad, Enum.EasingDirection.In)
	tween(st.es, info, { Value = 0.85 })
	fadeList(st.tlist, false, info)
	task.delay(0.2, function()
		if st.closing then
			o.Visible = false
			restoreT(st.tlist)
			st.es.Value = 1
			st.closing = false
		end
	end)
end
local function find(name)
	if type(name) ~= "string" or name == "" then return nil end
	local t = gui:FindFirstChild(name, true)
	if t and t:IsA("GuiObject") then return t end
	return nil
end
local function doAction(st)
	local c, o = st.cfg, st.o
	local a = c.actionType
	if a == "toggle" then
		local t = find(c.actionTarget)
		if t then if t.Visible and not getState(t).closing then closeEl(t) else openEl(t) end end
	elseif a == "open" then local t = find(c.actionTarget) if t then openEl(t) end
	elseif a == "close" then local t = find(c.actionTarget) if t then closeEl(t) end
	elseif a == "closeParent" then local p = o.Parent if p and p:IsA("GuiObject") then closeEl(p) end
	elseif a == "closeSelf" then closeEl(o)
	end
end

local function onClick(st, pos)
	local c, o = st.cfg, st.o
	local now = os.clock()
	if c.clickCooldown > 0 and st.last and now - st.last < c.clickCooldown then return end
	st.last = now
	sound(c.clickSound)
	local p = o.AbsolutePosition + o.AbsoluteSize / 2 - FX.AbsolutePosition
	if c.fxOrigin ~= "center" and pos then p = pos - FX.AbsolutePosition end
	if c.clickFx ~= "none" then burst(st, c, p) end
	if c.clickMotion ~= "none" then motion(st, c.clickMotion) end
	doAction(st)
end

-- ===== السحب داخل اللعبة =====
local function makeDrag(st)
	local o = st.o
	local dragging, startIn, startPos = false, nil, nil
	o.InputBegan:Connect(function(i)
		if i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch then
			dragging, startIn, startPos = true, i.Position, st.basePos
			local con
			con = i.Changed:Connect(function()
				if i.UserInputState == Enum.UserInputState.End then dragging = false if con then con:Disconnect() end end
			end)
		end
	end)
	UserInputService.InputChanged:Connect(function(i)
		if dragging and (i.UserInputType == Enum.UserInputType.MouseMovement or i.UserInputType == Enum.UserInputType.Touch) then
			local d = i.Position - startIn
			st.basePos = UDim2.new(startPos.X.Scale, startPos.X.Offset + d.X, startPos.Y.Scale, startPos.Y.Offset + d.Y)
			st.force = true
		end
	end)
end

-- ===== الحلقة الرئيسية =====
local clock0 = os.clock()
local function heart(x)
	if x < 0.15 then return math.sin(x / 0.15 * math.pi) * 0.08 end
	if x > 0.25 and x < 0.4 then return math.sin((x - 0.25) / 0.15 * math.pi) * 0.06 end
	return 0
end
RunService.RenderStepped:Connect(function(dt)
	local now = os.clock() - clock0
	for i = #parts, 1, -1 do
		local p = parts[i]
		p.t += dt
		local k = p.t / p.life
		if k >= 1 or not p.o.Parent then
			p.o:Destroy()
			table.remove(parts, i)
		else
			local dr = math.max(0, 1 - p.drag * dt)
			p.vx *= dr
			p.vy *= dr
			p.vy += p.g * dt
			p.x += p.vx * dt
			p.y += p.vy * dt
			p.rot += p.vr * dt
			local s = p.s0 + (p.s1 - p.s0) * k
			local wx = p.wob and math.sin(p.t * p.wob * 3) * 6 or 0
			p.o.Position = UDim2.fromOffset(p.x + wx, p.y)
			p.o.Size = UDim2.fromOffset(p.w * s, p.h * s)
			p.o.Rotation = p.rot
			local f = k < 0.55 and 0 or (k - 0.55) / 0.45
			p.o[p.prop] = p.a0 + (1 - p.a0) * f
			if p.stroke then p.o.TextStrokeTransparency = f end
		end
	end
	if tipOwner and tipLabel then
		local m = UserInputService:GetMouseLocation() - GuiService:GetGuiInset() - FX.AbsolutePosition
		tipLabel.Position = UDim2.fromOffset(m.X + 14, m.Y + 18)
	end
	for o, st in pairs(states) do
		if not o.Parent then states[o] = nil continue end
		local c = st.cfg
		local ix, iy, ir, is = 0, 0, 0, 1
		local it = c.idleType
		if it ~= "none" and o.Visible then
			local sp, am = c.idleSpeed, c.idleAmount
			if it == "float" then iy = math.sin(now * 2 * sp) * 6 * am
			elseif it == "pulse" then is = 1 + math.sin(now * 4 * sp) * 0.04 * am
			elseif it == "breath" then is = 1 + (math.sin(now * 2 * sp) * 0.5 + 0.5) * 0.06 * am
			elseif it == "heartbeat" then is = 1 + heart((now * sp) % 1.2) * am
			elseif it == "spin" then ir = (now * 90 * sp) % 360
			elseif it == "swing" then ir = math.sin(now * 2.5 * sp) * 10 * am
			elseif it == "shake" then ix = math.sin(now * 47 * sp) * 1.5 * am iy = math.cos(now * 39 * sp) * 1.5 * am
			elseif it == "rainbow" then o.BackgroundColor3 = Color3.fromHSV((now * 0.15 * sp) % 1, 0.7, 1)
			elseif it == "rainbowText" then pcall(function() o.TextColor3 = Color3.fromHSV((now * 0.15 * sp) % 1, 0.7, 1) end)
			elseif it == "gradientSpin" then
				local g = o:FindFirstChildWhichIsA("UIGradient")
				if g then g.Rotation = (now * 120 * sp) % 360 end
			elseif it == "glow" then
				if st.stroke and not st.hover then st.stroke.Thickness = (st.baseST or 0) + (math.sin(now * 3 * sp) * 0.5 + 0.5) * 3 * am end
			end
		end
		local x = st.ox.Value + st.mx.Value + ix
		local y = st.oy.Value - st.lift.Value + iy
		local r = st.rot.Value + st.mr.Value + ir
		local s = st.hs.Value * st.es.Value * st.ms.Value * is
		local active = x ~= 0 or y ~= 0 or r ~= 0 or s ~= 1
		if active or st.wasActive or st.force then
			o.Position = st.basePos + UDim2.fromOffset(x, y)
			o.Rotation = st.baseRot + r
			st.scale.Scale = st.baseScale * s
			st.wasActive = active
			st.force = false
		else
			st.basePos = o.Position
			st.baseRot = o.Rotation
			st.baseScale = st.scale.Scale
		end
	end
end)

-- ===== الربط =====
local function isClick(i) return i.UserInputType == Enum.UserInputType.MouseButton1 or i.UserInputType == Enum.UserInputType.Touch end
local function setup(o)
	local st = getState(o)
	local c = st.cfg
	local fi = o:GetAttribute("RoGUI_FxImage")
	if typeof(fi) == "string" and fi ~= "" then st.fxImage = fi end
	o.MouseEnter:Connect(function()
		st.hover = true
		if c.hoverOn then refresh(st) end
		sound(c.hoverSound)
		if c.tooltip ~= "" then tip(c.tooltip, o) end
	end)
	o.MouseLeave:Connect(function()
		st.hover = false
		st.press = false
		if c.hoverOn or c.pressOn then refresh(st) end
		hideTip(o)
	end)
	o.InputBegan:Connect(function(i)
		if isClick(i) then
			st.press = true
			st.lastPos = Vector2.new(i.Position.X, i.Position.Y)
			if c.pressOn then refresh(st) end
			sound(c.pressSound)
		end
	end)
	o.InputEnded:Connect(function(i)
		if isClick(i) then
			local was = st.press
			st.press = false
			if c.pressOn then refresh(st) end
			if was and not o:IsA("GuiButton") then onClick(st, st.lastPos) end
		end
	end)
	if o:IsA("GuiButton") then
		o.Activated:Connect(function(i)
			local p = st.lastPos
			if typeof(i) == "Instance" and i:IsA("InputObject") then p = Vector2.new(i.Position.X, i.Position.Y) end
			onClick(st, p)
		end)
	end
	if c.draggable then makeDrag(st) end
	if c.enterType ~= "none" and o.Visible then playEnter(st) end
end

UserInputService.InputEnded:Connect(function(i)
	if not isClick(i) then return end
	task.defer(function()
		for _, st in pairs(states) do
			if st.press then st.press = false if st.cfg.pressOn then refresh(st) end end
		end
	end)
end)

for _, d in ipairs(gui:GetDescendants()) do
	if d:IsA("GuiObject") and d:GetAttribute("RoGUI") then task.spawn(setup, d) end
end
`;

const Exporter = {
  n(v) { v = +v; if (!isFinite(v)) return '0'; const r = Math.round(v * 10000) / 10000; return (Object.is(r, -0) ? 0 : r).toString(); },
  big(v) { return v >= 99999 ? 'math.huge' : this.n(v); },
  str(s) {
    return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, c => '\\' + String(c.charCodeAt(0)).padStart(3, '0')) + '"';
  },
  color(h) { const c = hexRgb(h); return `Color3.fromRGB(${c.join(', ')})`; },
  seq(arr, isColor) {
    let s = [...arr].map(k => Object.assign({}, k, { t: Math.max(0, Math.min(1, +k.t)) })).sort((a, b) => a.t - b.t);
    if (!s.length) s = isColor ? [{ t: 0, c: '#ffffff' }] : [{ t: 0, v: 0 }];
    if (s[0].t !== 0) s.unshift(Object.assign({}, s[0], { t: 0 }));
    if (s[s.length - 1].t !== 1) s.push(Object.assign({}, s[s.length - 1], { t: 1 }));
    // روبلوكس يرفض أوقات مكررة متتالية بالضبط لأول/آخر نقطة فقط، نتركها كما هي
    return isColor
      ? `ColorSequence.new({${s.map(k => `ColorSequenceKeypoint.new(${this.n(k.t)}, ${this.color(k.c)})`).join(', ')}})`
      : `NumberSequence.new({${s.map(k => `NumberSequenceKeypoint.new(${this.n(k.t)}, ${this.n(Math.max(0, Math.min(1, k.v)))})`).join(', ')}})`;
  },
  value(p, v) {
    switch (p.type) {
      case 'bool': return v ? 'true' : 'false';
      case 'number': return this.n(v);
      case 'string': case 'text': return this.str(v);
      case 'color': return this.color(v);
      case 'enum': return `Enum.${ENUM_TYPE[p.k] || p.k}.${v}`;
      case 'font': return `FONT(${this.str(v)})`;
      case 'udim2': return `UDim2.new(${this.n(v.xs)}, ${this.n(v.xo)}, ${this.n(v.ys)}, ${this.n(v.yo)})`;
      case 'udim': return `UDim.new(${this.n(v.s)}, ${this.n(v.o)})`;
      case 'vec2': return `Vector2.new(${this.big(v.x)}, ${this.big(v.y)})`;
      case 'rect': return `Rect.new(${this.n(v.x0)}, ${this.n(v.y0)}, ${this.n(v.x1)}, ${this.n(v.y1)})`;
      case 'colorseq': return this.seq(v, true);
      case 'numseq': return this.seq(v, false);
      case 'image': return `IMG(${this.str(imageId(v))})`;
    }
    return 'nil';
  },
  luaLiteral(v) {
    if (Array.isArray(v)) return '{' + v.map(x => this.luaLiteral(x)).join(', ') + '}';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') return this.n(v);
    if (v && typeof v === 'object') return '{' + Object.keys(v).map(k => `${k} = ${this.luaLiteral(v[k])}`).join(', ') + '}';
    return this.str(v == null ? '' : v);
  },
  animJson(node) {
    const out = {};
    Object.keys(node.anim || {}).forEach(k => {
      if (k in ANIM_DEF && JSON.stringify(node.anim[k]) !== JSON.stringify(ANIM_DEF[k])) out[k] = node.anim[k];
    });
    return Object.keys(out).length ? JSON.stringify(out, (k, v) => typeof v === 'number' ? Math.round(v * 10000) / 10000 : v) : null;
  },
  propLines(node, opts) {
    const lines = [`Name = ${this.str(node.name)}`];
    (SCHEMA[node.cls] || []).forEach(p => {
      if (p.k[0] === '_') return;
      const v = node.props[p.k];
      if (v === undefined) return;
      if (p.rd !== undefined && JSON.stringify(v) === JSON.stringify(p.rd)) return;
      if (p.type === 'image' && !imageId(v)) return;
      if (p.when && !p.when(node.props)) return;
      lines.push(`${p.k} = ${this.value(p, v)}`);
    });
    return lines;
  },
  count(root) { let c = 0; const w = n => { c++; (n.children || []).forEach(w); }; w(root); return c; },
  generate(project, opts = {}) {
    opts = Object.assign({ runtime: true, decal: true, starterGui: false, partName: 'RoGUI_' + project.root.name, select: true }, opts);
    const root = project.root;
    if (!opts.partName) opts.partName = 'RoGUI_' + root.name;
    const L = [];
    const total = this.count(root);
    let anyAnim = false;
    const date = new Date().toISOString().slice(0, 16).replace('T', ' ');
    L.push('--[[');
    L.push('  ✦ RoGUI Studio — سكربت إنشاء الواجهة');
    L.push('  ─────────────────────────────────────');
    L.push(`  المشروع: ${String(project.name).replace(/[\[\]]/g, '')}   |   العناصر: ${total}   |   ${date}`);
    L.push('');
    L.push('  طريقة الاستخدام:');
    L.push('   1) افتح Roblox Studio ثم من فوق: View  ←  Command Bar');
    L.push('   2) الصق هذا السكربت كامل في الـ Command Bar واضغط Enter');
    L.push(`   3) بيظهر Part اسمه "${String(opts.partName).replace(/[\[\]]/g, '')}" في Workspace قدام الكاميرا`);
    L.push(`   4) افتح البارت وخذ "${String(root.name).replace(/[\[\]]/g, '')}" (ScreenGui) واسحبه إلى StarterGui`);
    L.push('   5) جرب اللعبة ▶ — الأنميشنات تشتغل تلقائياً من سكربت RoGUI_Runtime');
    L.push(']]');
    L.push('');
    L.push('local HttpService = game:GetService("HttpService")');
    L.push('local function FONT(n) local ok, f = pcall(function() return Enum.Font[n] end) return ok and f or Enum.Font.GothamBold end');
    if (opts.decal) {
      L.push('local _imgCache = {}');
      L.push('local function IMG(id)');
      L.push('\tif id == "" then return "" end');
      L.push('\tif _imgCache[id] then return _imgCache[id] end');
      L.push('\tlocal result = "rbxassetid://" .. id');
      L.push('\t-- تحويل تلقائي: إذا كان الـ ID حق Decal من التولبوكس نجيب الـ Image ID الحقيقي');
      L.push('\tlocal ok, tex = pcall(function()');
      L.push('\t\tlocal objs = game:GetObjects("rbxassetid://" .. id)');
      L.push('\t\tlocal d = objs and objs[1]');
      L.push('\t\tif d and (d:IsA("Decal") or d:IsA("Texture")) then return d.Texture end');
      L.push('\t\treturn nil');
      L.push('\tend)');
      L.push('\tif ok and type(tex) == "string" and tex ~= "" then result = tex end');
      L.push('\t_imgCache[id] = result');
      L.push('\treturn result');
      L.push('end');
    } else {
      L.push('local function IMG(id) if id == "" then return "" end return "rbxassetid://" .. id end');
    }
    L.push('local function N(class, parent, props)');
    L.push('\tlocal o = Instance.new(class)');
    L.push('\tfor k, v in pairs(props) do');
    L.push('\t\tlocal ok, err = pcall(function() o[k] = v end)');
    L.push('\t\tif not ok then warn("RoGUI: تعذر ضبط " .. class .. "." .. tostring(k) .. " — " .. tostring(err)) end');
    L.push('\tend');
    L.push('\to.Parent = parent');
    L.push('\treturn o');
    L.push('end');
    L.push('');
    L.push('-- البارت اللي بيحتوي الواجهة');
    L.push('local Part = Instance.new("Part")');
    L.push(`Part.Name = ${this.str(opts.partName)}`);
    L.push('Part.Anchored = true');
    L.push('Part.CanCollide = false');
    L.push('Part.Size = Vector3.new(4, 1, 4)');
    L.push('Part.Material = Enum.Material.Neon');
    L.push('Part.Color = Color3.fromRGB(127, 92, 255)');
    L.push('local cam = workspace.CurrentCamera');
    L.push('Part.Position = cam and (cam.CFrame.Position + cam.CFrame.LookVector * 14) or Vector3.new(0, 5, 0)');
    L.push('Part.Parent = workspace');
    L.push('');
    L.push('local E = {}');
    let idx = 0;
    const self = this;
    const fxImgs = [];
    function walk(node, parentVar) {
      const my = `E[${idx++}]`;
      const lines = self.propLines(node, opts);
      L.push('');
      L.push(`-- ${node.cls}: ${node.name}`);
      L.push(`${my} = N("${node.cls}", ${parentVar}, {`);
      lines.forEach(l => L.push('\t' + l + ','));
      L.push('})');
      if (isGui(node) && opts.runtime) {
        const j = self.animJson(node);
        if (j) {
          anyAnim = true;
          L.push(`${my}:SetAttribute("RoGUI", ${self.str(j)})`);
          const a = animOf(node);
          if (a.clickFx === 'image' && imageId(a.fxImage)) L.push(`${my}:SetAttribute("RoGUI_FxImage", IMG(${self.str(imageId(a.fxImage))}))`);
        }
      }
      // المعدلات أولاً ثم العناصر
      const kids = [...(node.children || [])].sort((a, b) => (isMod(b) ? 1 : 0) - (isMod(a) ? 1 : 0));
      kids.forEach(k => walk(k, my));
    }
    walk(root, 'Part');
    L.push('');
    if (anyAnim && opts.runtime) {
      const defLua = this.luaLiteral(ANIM_DEF);
      const rt = LUA_RUNTIME.replace('__DEF__', defLua);
      L.push('-- سكربت الأنميشنات (LocalScript) داخل الـ ScreenGui');
      L.push('local LS = Instance.new("LocalScript")');
      L.push('LS.Name = "RoGUI_Runtime"');
      L.push('local okSrc = pcall(function()');
      L.push('LS.Source = [=====[' + rt + ']=====]');
      L.push('end)');
      L.push('if not okSrc then warn("RoGUI: ما قدرت أكتب سكربت الأنميشن — شغّل السكربت من Command Bar داخل Studio") end');
      L.push('LS.Parent = E[0]');
      L.push('');
    }
    if (opts.starterGui) {
      L.push('-- نسخة جاهزة في StarterGui');
      L.push('local copy = E[0]:Clone()');
      L.push('copy.Parent = game:GetService("StarterGui")');
      L.push('');
    }
    if (opts.select) L.push('pcall(function() game:GetService("Selection"):Set({ E[0] }) end)');
    L.push('pcall(function() game:GetService("ChangeHistoryService"):SetWaypoint("RoGUI Import") end)');
    L.push(`print("✅ RoGUI: تم إنشاء ${total} عنصر داخل البارت '" .. Part.Name .. "' في Workspace — اسحب " .. ${this.str(root.name)} .. " إلى StarterGui")`);
    return L.join('\n');
  }
};
