import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let bgm;
let audioInitialized = false;

function initAudio() {
    if (audioInitialized) return;
    
    bgm = new Audio('./bgm.mp3'); 
    bgm.loop = true; 
    bgm.volume = 0;  

    bgm.play().then(() => { 
        let vol = 0; 
        const targetVolume = 0.4; 
        
        const fadeInterval = setInterval(() => { 
            vol += 0.02; 
            if (vol >= targetVolume) { 
                bgm.volume = targetVolume; 
                clearInterval(fadeInterval); 
            } else { 
                bgm.volume = vol; 
            } 
        }, 100); 
        
    }).catch(error => { 
        console.warn("浏览器拦截了自动播放，等待用户进一步交互:", error); 
    }); 

    audioInitialized = true; 
}



const container = document.getElementById('canvas-container');
const tooltip = document.getElementById('tooltip');
const sidebar = document.getElementById('sidebar');
const loader = document.getElementById('loader');
const loaderCopy = document.getElementById('loader-copy');
const loaderCopyEn = document.getElementById('loader-copy-en');
const loaderCopyCn = document.getElementById('loader-copy-cn');
const loaderStatus = document.getElementById('loader-status');
const progressText = document.getElementById('progress-text');
const loaderProgressFill = document.getElementById('loader-progress-fill');
const loaderEnter = document.getElementById('loader-enter');
const holdFill = document.getElementById('hold-fill');
const eegCanvas = document.getElementById('eeg-canvas');
const infoToggle = document.getElementById('info-toggle');
const infoPanel = document.getElementById('info-panel');
const infoClose = document.getElementById('info-close');
const infoScroll = document.getElementById('info-scroll');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');
const hudInstruction = document.getElementById('hud-instruction');
const sideKicker = document.getElementById('side-kicker');
const sideId = document.getElementById('side-id');
const sideDate = document.getElementById('side-date');
const sideSequence = document.getElementById('side-sequence');
const sideEegVal = document.getElementById('side-eeg-val');
const sideEegNote = document.getElementById('side-eeg-note');
const sideStimulusMode = document.getElementById('side-stimulus-mode');
const sideEmotion = document.getElementById('side-emotion');
const sideVideoType = document.getElementById('side-video-type');
const sideEmotionTag = document.getElementById('side-emotion-tag');
const sideVideoName = document.getElementById('side-video-name');
const sideDreamContent = document.getElementById('side-dream-content');
const sideThread = document.getElementById('side-thread');
const sideRouteTitle = document.getElementById('side-route-title');
const sideRouteDetail = document.getElementById('side-route-detail');
const eegBarFill = document.getElementById('eeg-bar-fill');
const dreamFragment = document.getElementById('dream-fragment');
const dreamFragmentTitle = document.getElementById('dream-fragment-title');
const dreamFragmentMeta = document.getElementById('dream-fragment-meta');
const dreamFragmentMedia = document.getElementById('dream-fragment-media');
const dreamFragmentMediaLabel = document.getElementById('dream-fragment-media-label');
const dreamFragmentBody = document.getElementById('dream-fragment-body');
const journeyOverlay = document.getElementById('journey-overlay');
const journeyMedia = document.getElementById('journey-media');
const journeyKicker = document.getElementById('journey-kicker');
const journeyTitle = document.getElementById('journey-title');
const journeyBody = document.getElementById('journey-body');
const journeyHint = document.getElementById('journey-hint');
const journeyProgress = document.getElementById('journey-progress');
const journeyPanelA = document.getElementById('journey-panel-a');
const journeyPanelB = document.getElementById('journey-panel-b');

if (
    !container ||
    !tooltip ||
    !sidebar ||
    !loader ||
    !loaderCopy ||
    !loaderCopyEn ||
    !loaderCopyCn ||
    !loaderStatus ||
    !progressText ||
    !loaderProgressFill ||
    !loaderEnter ||
    !holdFill ||
    !eegCanvas ||
    !infoToggle ||
    !infoPanel ||
    !infoClose ||
    !infoScroll ||
    !btnBack ||
    !btnNext ||
    !hudInstruction ||
    !sideKicker ||
    !sideId ||
    !sideDate ||
    !sideSequence ||
    !sideEegVal ||
    !sideEegNote ||
    !sideStimulusMode ||
    !sideEmotion ||
    !sideVideoType ||
    !sideEmotionTag ||
    !sideVideoName ||
    !sideDreamContent ||
    !sideThread ||
    !sideRouteTitle ||
    !sideRouteDetail ||
    !eegBarFill ||
    !dreamFragment ||
    !dreamFragmentTitle ||
    !dreamFragmentMeta ||
    !dreamFragmentMedia ||
    !dreamFragmentMediaLabel ||
    !journeyOverlay ||
    !journeyMedia ||
    !journeyKicker ||
    !journeyTitle ||
    !journeyBody ||
    !journeyHint ||
    !journeyProgress ||
    !journeyPanelA ||
    !journeyPanelB ||
    !dreamFragmentBody
) {
    throw new Error('Missing required DOM nodes for the visualization UI.');
}

const rootStyle = document.documentElement.style;
const demoSections = Array.from(infoScroll.querySelectorAll('[data-demo]'));

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06070b, 0.0105);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 1600);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x06070b, 1);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.045;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.38;
controls.rotateSpeed = 0.55;
controls.maxDistance = 340;
controls.minDistance = 18;
controls.enablePan = false;

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const nodes = [];
const connectiveLines = [];
const demoNodes = {
    luminescence: null,
    chromatic: null,
    stimulus: null
};

const defaultCameraPosition = new THREE.Vector3(0, 22, 132); 
const defaultControlsTarget = new THREE.Vector3(0, 0, 0);

const btnViewToggle = document.getElementById('btn-view-toggle');
const topDownCameraPosition = new THREE.Vector3(0, 250, 0);
let isTopDownView = false;

const introCameraTarget = defaultCameraPosition.clone();
const cameraTransitionTarget = new THREE.Vector3();
const controlsTransitionTarget = new THREE.Vector3();

const baseBloomStrength = 0.8;
const bloomBurstStrength = 8.4;
const defaultLumaCap = 1.04;
const focusedLumaCap = 0.86;
const journeyWheelThreshold = 170;

let introAnimationActive = false;
let cameraTransitionActive = false;
let cameraTransitionSpeed = 0.08;
let resumeAutoRotateAfterTransition = false;
let bloomStrengthTarget = baseBloomStrength;
let displayedProgress = 0;

let hoveredNode = null;
let focusedNode = null;
let currentFragmentNode = null;
let demoNode = null;
let currentInfoDemo = '';
let infoPanelOpen = false;
let currentRoutes = [];
let currentRouteIndex = 0;
let journeyVisited = new Set();
let scenePrepared = false;
let loaderNarrativeDone = false;
let experienceStarted = false;
let loaderBurstTriggered = false;
let typewriterToken = 0;
let starfield = null;

let journeyActive = false;
let journeyStageIndex = 0;
let journeyWheelAccumulator = 0;
let journeyNodeOpacity = 0.5;
let journeyLineOpacity = 0.085;
let journeyFogDensity = 0.0105;
let journeySaturation = 1;
let journeyInputGuardUntil = 0;
let journeyPanelOnA = true;
let journeyPanelBusy = false;

let holdActive = false;
let holdStartedAt = 0;
let holdProgress = 0;
let holdRaf = 0;
const holdDurationMs = 500;

let eegCtx = null;
let eegRaf = 0;
let eegTime = 0;
let eegFracturing = false;
let eegFragments = [];
let eegDestroyed = false;

const eegCurveConfigs = [
    {
        offset: -32, 
        color: 'rgba(109, 184, 255, 0.45)',
        shadowColor: 'rgba(109, 184, 255, 0.35)',
        fragColor: '109, 184, 255', 
        speed: 1.0,
        spikeFreq: 260,
        spikeProb: 0.62,
        amp: 10
    },
    {
        offset: -10, 
        color: 'rgba(147, 255, 244, 0.45)',
        shadowColor: 'rgba(147, 255, 244, 0.35)',
        fragColor: '147, 255, 244',
        speed: 0.85,
        spikeFreq: 310, 
        spikeProb: 0.70,
        amp: 8
    },
    {
        offset: 12, 
        color: 'rgba(255, 211, 160, 0.45)',
        shadowColor: 'rgba(255, 211, 160, 0.35)',
        fragColor: '255, 211, 160',
        speed: 1.15,
        spikeFreq: 220,
        spikeProb: 0.58,
        amp: 11
    },
    {
        offset: 35, 
        color: 'rgba(232, 243, 255, 0.45)',
        shadowColor: 'rgba(232, 243, 255, 0.35)',
        fragColor: '232, 243, 255',
        speed: 0.95,
        spikeFreq: 280,
        spikeProb: 0.65,
        amp: 9
    }
];

let dataset = [];
let eegStats = { min: 0, max: 100 };

const defaultInstruction = 'Hover a luminous node to glimpse its emotional weather. Click to enter the archive and follow the dream deeper. 将鼠标停在发光节点上可预览情绪轮廓，点击后进入梦境档案继续阅读。';
const previewInstruction = 'This hover is only a preview. Click to isolate the signal and let the dream text appear beside it. 当前仅为预览，点击后会分离该束信号并在其旁边唤醒梦境文本。';
const focusInstruction = 'You are no longer an observer. Click the route button to continue the narrative, or return to orbit. 你已不再是旁观者，可以沿着共振路线继续阅读。';

const journeyStages = [
    {
        kicker: '入梦阈值 / Threshold Journey',
        title: '意识沉入深渊 / Sink into dreams ',
        body: '城市的喧嚣褪去，呼吸与钟表的滴答声同频。城市的光点隐入黑暗，白昼的疲惫正在剥离。在这里，在睡眠的边缘，只有微弱而平缓的神经脉冲在你视线中流转。' +
              'The rhythm of the city fades, and your breathing slows to match the ticking clock. Peripheral lights recede into the dark. Here, at the edge of sleep, only a faint neural dust remains drifting in front of you.',
        hint: '梦境的档案尚未完全展开。滚动鼠标，继续向更深处下潜。\nThe archive of the subconscious is not fully open yet. Scroll to descend deeper into the mind.',
        instruction: '潜意识的档案尚未完全展开。滚动鼠标，继续向意识的更深处下潜。',
        visual: { nodeOpacity: 0.16, lineOpacity: 0.014, starOpacity: 0.2, fogDensity: 0.018, bloom: 0.82, saturation: 0.64 },
        themeClass: 'theme-threshold',
        overlayGradient: 'radial-gradient(circle at 50% 50%, rgba(10, 15, 20, 0.9), rgba(0, 0, 0, 1))',
        chartHTML: `
            <div class="card-chart-container">
                <div class="chart-label">NEURAL FLUCTUATIONS</div>
                <div class="wave-pattern">
                    <div class="wave-segment"></div>
                    <div class="wave-segment"></div>
                    <div class="wave-segment"></div>
                </div>
            </div>
        `
    },
    {
        kicker: '记忆外溢 / Stimulus Leakage',
        title: '梦境交织现实 / Waking residue leakage',
        body: '现实与虚幻的边界开始溶解。现实里的残影——一块发光的屏幕、一条拥挤的街道、一段破碎的对话——开始浸染这片黑色的画布。记忆碎片在脑海中显影，成为构建梦境的“原始材料”。' +
              'The boundary between reality and illusion blurs. Shapes from your waking hours begin to stain the dark canvas of the mind. Fragments of reality begin to develop in the dark.',
        hint: '现实中记忆的痕迹正在外溢。继续下潜，让隐藏的情绪浮出水面。\nStimulus traces are emerging. Continue your drift to let the underlying emotions surface.',
        instruction: '白昼的刺激痕迹正在显现。继续你的漂移，让隐藏的情绪层浮出水面。',
        visual: { nodeOpacity: 0.34, lineOpacity: 0.03, starOpacity: 0.28, fogDensity: 0.015, bloom: 1.04, saturation: 0.78 },
        themeClass: 'theme-leakage',
        overlayGradient: 'radial-gradient(circle at 20% 80%, rgba(30, 60, 90, 0.6), rgba(10, 10, 15, 0.95))',
        chartHTML: `
            <div class="card-chart-container">
                <div class="chart-label">FRAGMENTED MEMORIES</div>
                <div class="fragment-grid">
                    <div class="fragment f1"></div>
                    <div class="fragment f2"></div>
                    <div class="fragment f3"></div>
                </div>
            </div>
        `
    },
    {
        kicker: '情绪显影 / Affective Bloom',
        title: '梦境的颜色 / Dreams colored by emotion',
        body: '梦境不仅是画面，更是情绪的放大镜。在这里，冷冰冰的数据开始被染上温度：温暖的橘色代表愉悦，深邃的蓝色是低落，而偏红的脉冲则在警示着隐秘的焦虑与恐惧。每一种发光的色彩，都是做梦者真实的心理反映。' +
              'Dreams are not just images; they are magnifying glasses for emotion. Here, data is dyed with temperature: warm orange for joy, deep blue for sadness, and red pulses for hidden anxiety.',
        hint: '情感的光谱已然浮现。再推进一步，靠近那道意识的螺旋。\nThe spectrum of human emotion has surfaced. Scroll to draw closer to the consciousness helix.',
        instruction: '人类情感的色谱已然浮现。再推进一步，靠近那道意识的螺旋。',
        visual: { nodeOpacity: 0.56, lineOpacity: 0.046, starOpacity: 0.36, fogDensity: 0.013, bloom: 1.22, saturation: 0.9 },
        themeClass: 'theme-bloom',
        overlayGradient: 'radial-gradient(circle at 70% 30%, rgba(120, 40, 60, 0.4), rgba(20, 10, 40, 0.85))',
        chartHTML: `
            <div class="card-chart-container">
                <div class="chart-label">EMOTION DISTRIBUTION IN DEED DATASET</div>
                <div class="spectrum-bar">
                    <div class="spectrum-segment positive" style="width: 35%;"></div>
                    <div class="spectrum-segment neutral" style="width: 20%;"></div>
                    <div class="spectrum-segment negative" style="width: 45%;"></div>
                </div>
                <div class="chart-legend">
                    <span><i class="dot pos"></i>Joy (35%)</span>
                    <span><i class="dot neu"></i>Neutral (20%)</span>
                    <span><i class="dot neg"></i>Fear/Sadness (45%)</span>
                </div>
            </div>
        `
    },
    {
        kicker: '梦境成形 / Dream Formation',
        title: '星系的连接 / Collective galaxy connection',
        body: '所有的脑电波、记忆碎片和情绪，终于组合成了一个完整的梦境维度。现在，我们的私人梦境共同汇聚成了一座巨大的螺旋星系。准备好了吗？我们将正式跨入这个由人类集体潜意识构建的数字空间。' +
              'All the brainwaves, memories, and emotions have finally merged. Now, the private dreams coalesce into a massive spiral galaxy. We are about to step into this digital space.',
        hint: '梦境的力场已然成形。迈出最后一步，解锁这本属于黑夜的完整档案。\nThe dream field is fully formed. Take one final step to unlock the complete archive of the night.',
        instruction: '梦境的力场已然成形。迈出最后一步，解锁这本属于黑夜的完整档案。',
        visual: { nodeOpacity: 0.8, lineOpacity: 0.065, starOpacity: 0.46, fogDensity: 0.0118, bloom: 1.42, saturation: 1 },
        themeClass: 'theme-formation',
        overlayGradient: 'radial-gradient(circle at 50% 50%, rgba(10, 40, 80, 0.2), rgba(0, 5, 10, 0.8))',
        chartHTML: `
            <div class="card-chart-container">
                <div class="chart-label">GALACTIC TOPOLOGY</div>
                <div class="node-cluster">
                    <div class="node n1"></div>
                    <div class="node n2"></div>
                    <div class="node n3"></div>
                    <div class="node n4"></div>
                </div>
            </div>
        `
    }
];

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), baseBloomStrength, 0.7, 0.18);
const composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

const vertexShader = `
    uniform float u_time;
    uniform float u_speed;
    uniform float u_focusBoost;
    varying float vPulse;

    void main() {
        vec3 pos = position;
        float pulse = sin(u_time * u_speed) * (0.08 + u_focusBoost * 0.04);
        pos += normal * pulse;
        vPulse = pulse;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
`;

const fragmentShader = `
    uniform vec3 u_color;
    uniform float u_time;
    uniform float u_speed;
    uniform float u_focusBoost;
    uniform float u_lumaCap;
    varying float vPulse;

    void main() {
        float shimmer = 0.55 + 0.55 * sin(u_time * u_speed + vPulse * 6.0);
        float alpha = mix(0.15, 0.55, shimmer) + u_focusBoost * 0.2;
        vec3 cappedColor = u_color;
        float luminance = dot(cappedColor, vec3(0.2126, 0.7152, 0.0722));
        if (luminance > u_lumaCap) {
            cappedColor *= u_lumaCap / max(luminance, 0.0001);
        }
        gl_FragColor = vec4(cappedColor, clamp(alpha, 0.0, 1.0));
    }
`;

const loaderNarrative = [
    {
        key: 'micro',
        en: 'It began with a simple notebook beside my bed, a micro-record of my own fragmented dreams and restless nights.',
        cn: '这一切始于我床头的一本笔记——一份记录着破碎梦境与辗转反侧的微观档案。'
    },
    {
        key: 'threshold',
        en: 'But what if we could look beyond a single room? Every night, above the quieted streets, millions of minds construct fleeting universes.',
        cn: '但如果我们能将视线越过这房间呢？每晚，在沉寂的城市街道上空，无数的心灵共同构建转瞬即逝的梦境宇宙。'
    },
    {
        key: 'macro',
        en: 'You are about to transcend the personal, and witness the collective shape of human sleep.',
        cn: '你即将越过个体意识的边界，见证人类梦境的集体画像。'
    }
];

const routeStrategies = [
    {
        id: 'same-subject-video',
        shortEn: 'Same Subject + Same Stimulus',
        shortZh: '同被试 + 同刺激',
        detailEn: 'Stay with the same dreamer while keeping the exact video stimulus constant.',
        detailZh: '保持同一位被试，同时沿用完全相同的视频刺激。',
        predicate: (source, candidate) => sameText(source.Online_id, candidate.Online_id) && knownMatch(source.Video_name, candidate.Video_name),
        bonus: 6.2
    },
    {
        id: 'same-subject-emotion',
        shortEn: 'Same Subject + Same Emotion',
        shortZh: '同被试 + 同情绪',
        detailEn: 'Follow the emotional continuity of one participant across different dream fragments.',
        detailZh: '沿着同一位被试的情绪连续性，阅读不同梦境片段。',
        predicate: (source, candidate) => sameText(source.Online_id, candidate.Online_id) && sameText(source.Dream_emotion, candidate.Dream_emotion),
        bonus: 5.5
    },
    {
        id: 'same-video-emotion',
        shortEn: 'Same Video + Same Emotion',
        shortZh: '同视频 + 同情绪',
        detailEn: 'Trace how one cinematic stimulus returns through a similar emotional tone.',
        detailZh: '追踪同一视频刺激如何在相近情绪中反复显现。',
        predicate: (source, candidate) => knownMatch(source.Video_name, candidate.Video_name) && sameText(source.Dream_emotion, candidate.Dream_emotion),
        bonus: 5.1
    },
    {
        id: 'same-video-type-emotion',
        shortEn: 'Same Stimulus Type + Same Emotion',
        shortZh: '同刺激类型 + 同情绪',
        detailEn: 'Widen the reading field to entries that share both emotional weather and stimulus category.',
        detailZh: '把阅读范围扩展到同类刺激类型与同类情绪共同构成的档案层。',
        predicate: (source, candidate) => sameText(source.Video_type, candidate.Video_type) && sameText(source.Dream_emotion, candidate.Dream_emotion),
        bonus: 4.4
    },
    {
        id: 'same-subject',
        shortEn: 'Same Subject',
        shortZh: '同被试',
        detailEn: 'Remain inside a single participant’s subconscious archive.',
        detailZh: '继续停留在同一位被试的潜意识档案中。',
        predicate: (source, candidate) => sameText(source.Online_id, candidate.Online_id),
        bonus: 3.1
    },
    {
        id: 'same-video',
        shortEn: 'Same Stimulus',
        shortZh: '同视频',
        detailEn: 'Follow the return of the exact same filmic trigger across different sleepers.',
        detailZh: '跨越不同被试，追踪完全相同的视频刺激。',
        predicate: (source, candidate) => knownMatch(source.Video_name, candidate.Video_name),
        bonus: 2.8
    },
    {
        id: 'same-emotion',
        shortEn: 'Same Emotion',
        shortZh: '同类情绪',
        detailEn: 'Drift along a purely affective resonance route.',
        detailZh: '沿着纯粹的情绪共振继续漂移。',
        predicate: (source, candidate) => sameText(source.Dream_emotion, candidate.Dream_emotion),
        bonus: 2.2
    },
    {
        id: 'closest-eeg',
        shortEn: 'Closest EEG Echo',
        shortZh: '最接近脑电回声',
        detailEn: 'When narrative links weaken, follow the nearest neural intensity signature.',
        detailZh: '当叙事线索减弱时，转而跟随最接近的脑电强度回声。',
        predicate: () => true,
        bonus: 0.9
    }
];

function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case '\'': return '&#39;';
            default: return char;
        }
    });
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function sameText(left, right) {
    const leftText = normalizeText(left);
    const rightText = normalizeText(right);
    return leftText !== '' && rightText !== '' && leftText === rightText;
}

function knownMatch(left, right) {
    const leftText = normalizeText(left);
    const rightText = normalizeText(right);
    if (!leftText || !rightText || leftText === 'unknown' || rightText === 'unknown') {
        return false;
    }
    return leftText === rightText;
}

function translateEmotion(emotion = '') {
    const text = normalizeText(emotion);
    if (!text || text === 'unknown') return '未知情绪';
    if (text.includes('happy')) return '愉悦';
    if (text.includes('unhappy')) return '低落';
    if (text.includes('sad')) return '悲伤';
    if (text.includes('fear')) return '恐惧';
    if (text.includes('calm')) return '平静';
    if (text.includes('positive')) return '积极';
    if (text.includes('negative')) return '消极';
    if (text.includes('neutral')) return '中性';
    return emotion;
}

function translateVideoType(type = '') {
    const text = normalizeText(type);
    if (!text || text === 'unknown') return '未知情境';
    if (text.includes('positive')) return '积极刺激';
    if (text.includes('negative')) return '消极刺激';
    if (text.includes('neutral')) return '中性刺激';
    return type;
}

function getEmotionDescriptor(emotion = '') {
    const text = normalizeText(emotion);
    if (!text || text === 'unknown') return { en: 'Unlabeled affect', zh: '未标注情绪' };
    if (text.includes('happy')) return { en: 'Warm affect', zh: '温暖情绪' };
    if (text.includes('unhappy') || text.includes('sad')) return { en: 'Heavy affect', zh: '沉重情绪' };
    if (text.includes('fear')) return { en: 'Anxious affect', zh: '焦虑情绪' };
    if (text.includes('calm')) return { en: 'Calm affect', zh: '平静情绪' };
    return { en: 'Mixed affect', zh: '混合情绪' };
}

function updateAccent(color) {
    const rgb = color.toArray().map((component) => Math.round(component * 255));
    rootStyle.setProperty('--accent', `#${color.getHexString()}`);
    rootStyle.setProperty('--accent-rgb', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`);
}

function setLoaderStatus(text) {
    loaderStatus.textContent = text;
}

function setLoadingProgress(value) {
    displayedProgress = clamp(value, 0, 100);
    const rounded = Math.round(displayedProgress);
    progressText.textContent = `${rounded}%`;
    loaderProgressFill.style.width = `${rounded}%`;
}

function setHoldProgress(percent) {
    const clamped = clamp(percent, 0, 100);
    holdFill.style.height = `${clamped}%`;
}

function resizeEEGCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.floor(window.innerWidth));
    const height = 120;
    eegCanvas.width = Math.floor(width * dpr);
    eegCanvas.height = Math.floor(height * dpr);
    eegCanvas.style.height = `${height}px`;
    const ctx = eegCanvas.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    eegCtx = ctx;
}

function buildEEGPoints(width, centerY, config) {
    const points = [];
    for (let x = 0; x <= width; x += 14) {
        // 基础正弦波：平缓且带有轻微起伏
        const baseWave = Math.sin(x * 0.012 + eegTime * config.speed) * config.amp;
        // 基础底噪
        const noise = (Math.random() - 0.5) * 5;
        let spike = 0;

        // 突发尖峰（睡眠纺锤波模拟）：只在特定周期内以一定概率出现
        if (x % config.spikeFreq < 20 && Math.random() > config.spikeProb) {
            spike = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 22 + 8);
        }

        // 加上纵向错开的偏移量
        points.push([x, centerY + baseWave + noise + spike + config.offset]);
    }
    return points;
}

function drawEEG() {
    if (!eegCtx || eegDestroyed) { return; }

    const width = Math.floor(window.innerWidth);
    const height = 120;
    const centerY = height / 2;
    eegCtx.clearRect(0, 0, width, height);

    if (eegFracturing) {
        eegCtx.save();
        eegCtx.globalCompositeOperation = 'lighter';
        eegFragments.forEach((p) => {
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.016;
            const alpha = clamp(p.life, 0, 1) * 0.7;
            eegCtx.fillStyle = `rgba(${p.color}, ${alpha})`;
            eegCtx.fillRect(p.x, p.y, 1.4, 1.4);
        });
        eegFragments = eegFragments.filter((p) => p.life > 0);
        eegCtx.restore();

        if (eegFragments.length === 0) {
            eegFracturing = false;
            eegDestroyed = true;
            eegCtx.clearRect(0, 0, width, height);
            return;
        }
    } else {
        eegCurveConfigs.forEach(config => {
            const points = buildEEGPoints(width, centerY, config);
            eegCtx.save();
            eegCtx.lineWidth = 1.4;
            eegCtx.strokeStyle = config.color;
            eegCtx.shadowColor = config.shadowColor;
            eegCtx.shadowBlur = 10;
            eegCtx.beginPath();
            points.forEach(([x, y], idx) => {
                const jx = x + (Math.random() - 0.5) * 1.2;
                const jy = y + (Math.random() - 0.5) * 1.2;
                if (idx === 0) eegCtx.moveTo(jx, jy);
                else eegCtx.lineTo(jx, jy);
            });
            eegCtx.stroke();
            eegCtx.restore();
        });
    }

    eegTime += 0.045;

    if (!eegDestroyed) {
        eegRaf = requestAnimationFrame(drawEEG);
    }
}

function startEEG() {
    resizeEEGCanvas();
    if (!eegRaf) {
        eegRaf = requestAnimationFrame(drawEEG);
    }
}

function stopEEG() {
    if (eegRaf) {
        cancelAnimationFrame(eegRaf);
        eegRaf = 0;
    }
}

function animateProgressTo(target, duration = 700) {
    const goal = clamp(target, 0, 100);
    const start = displayedProgress;
    const delta = goal - start;

    if (delta <= 0) {
        setLoadingProgress(goal);
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const startedAt = performance.now();

        function step(now) {
            const elapsed = now - startedAt;
            const progress = clamp(elapsed / duration, 0, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setLoadingProgress(start + delta * eased);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setLoadingProgress(goal);
                resolve();
            }
        }

        requestAnimationFrame(step);
    });
}

function updateLoaderEnterState() {
    if (scenePrepared && loaderNarrativeDone) {
        loaderEnter.classList.add('is-ready');
        loaderEnter.disabled = false;
        setLoaderStatus('Ready To Enter');
    }
}

function setLoaderNarrativeStage(stage) {
    loader.dataset.stage = stage.key || 'micro';
    loaderCopy.classList.remove('is-visible');

    window.setTimeout(() => {
        loaderCopyEn.textContent = stage.en;
        loaderCopyCn.textContent = stage.cn;
        loaderCopy.classList.add('is-visible');
    }, 500);
}

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

async function playLoaderNarrative() {
    loaderNarrativeDone = true;
    let index = 0;

    while (!experienceStarted && !journeyActive) {
        setLoaderNarrativeStage(loaderNarrative[index]);

        await wait(3000);

        if (experienceStarted || journeyActive) break;

        index = (index + 1) % loaderNarrative.length;
    }
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'absolute';
    errorDiv.style.top = '20px';
    errorDiv.style.left = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.color = '#ff9f9f';
    errorDiv.style.background = 'rgba(6, 8, 12, 0.88)';
    errorDiv.style.padding = '14px 16px';
    errorDiv.style.border = '1px solid rgba(255, 159, 159, 0.32)';
    errorDiv.style.borderRadius = '14px';
    errorDiv.style.font = '14px/1.6 "Segoe UI", sans-serif';
    errorDiv.style.zIndex = '140';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
}

function updateInstruction(text) {
    hudInstruction.textContent = text;
}

function showTooltip() {
    tooltip.style.display = 'block';
    requestAnimationFrame(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    });
}

function hideTooltip() {
    tooltip.style.opacity = '0';
    tooltip.style.transform = 'translateY(10px)';
    window.setTimeout(() => {
        if (tooltip.style.opacity === '0') {
            tooltip.style.display = 'none';
        }
    }, 250);
}

function setTooltipPosition(x, y) {
    const maxLeft = window.innerWidth - tooltip.offsetWidth - 18;
    const maxTop = window.innerHeight - tooltip.offsetHeight - 18;
    tooltip.style.left = `${Math.min(x, maxLeft)}px`;
    tooltip.style.top = `${Math.min(y, maxTop)}px`;
    tooltip.style.right = 'auto';
}

function openSidebar() {
    sidebar.classList.add('is-open');
    sidebar.setAttribute('aria-hidden', 'false');
}

function closeSidebar() {
    sidebar.classList.remove('is-open');
    sidebar.setAttribute('aria-hidden', 'true');
}

function setBackButtonVisible(visible) {
    btnBack.style.pointerEvents = visible ? 'auto' : 'none';
    btnBack.style.opacity = visible ? '1' : '0';
    btnBack.style.transform = visible
        ? 'translateX(-50%) translateY(0)'
        : 'translateX(-50%) translateY(20px)';
}

function setNextButtonState(enabled, label = 'Follow A Similar Pulse / 跟随相似脉冲') {
    btnNext.disabled = !enabled;
    btnNext.textContent = label;
}

function setRoutePreview(route) {
    if (!route) {
        sideRouteTitle.textContent = 'Awaiting route / 等待路线';
        sideRouteDetail.innerHTML = 'The archive will propose the next reading path once a pulse is selected.<span class="bilingual-sub">选中节点后，系统将按层级提供下一条“相似脉冲”路线。</span>';
        setNextButtonState(false, 'No Resonance Route / 暂无共振路线');
        return;
    }

    sideRouteTitle.innerHTML = `${escapeHtml(route.shortEn)}<span class="bilingual-sub">${escapeHtml(route.shortZh)}</span>`;
    sideRouteDetail.innerHTML = `${escapeHtml(route.detailEn)}<span class="bilingual-sub">${escapeHtml(route.detailZh)}</span>`;
    setNextButtonState(true, `Follow ${route.shortEn} / ${route.shortZh}`);
}

function openInfoPanel() {
    infoPanelOpen = true;
    infoPanel.classList.add('is-open');
    infoPanel.setAttribute('aria-hidden', 'false');
    updateInstruction('Read the archive guide while the 3D field remains alive behind the glass. 阅读说明时，背后的梦境空间仍会保持呼吸。');
    
    // updateInfoDemo();
}

function closeInfoPanel() {
    infoPanelOpen = false;
    infoPanel.classList.remove('is-open');
    infoPanel.setAttribute('aria-hidden', 'true');
    
    clearInfoDemo();

    if (!focusedNode) {
        updateInstruction(defaultInstruction);
    }
}

function setNodeScaleImmediate(node, scale) {
    node.scale.setScalar(scale);
    if (!node.userData) {
        node.userData = {};
    }
    node.userData.targetScale = scale;
}

function setNodeScaleTarget(node, scale) {
    node.userData.targetScale = scale;
}

function setFocusBoost(node, amount) {
    if (node?.material?.uniforms?.u_focusBoost) {
        node.material.uniforms.u_focusBoost.value = amount;
    }
}

function setNodeLumaCap(node, amount) {
    if (node?.material?.uniforms?.u_lumaCap) {
        node.material.uniforms.u_lumaCap.value = amount;
    }
}

function renderJourneyProgress() {
    journeyProgress.innerHTML = journeyStages
        .map((_, index) => `<span class="${index <= journeyStageIndex ? 'is-active' : ''}"></span>`)
        .join('');
}

function renderJourneyPanelHtml(stage) {
    const progressHtml = journeyStages
        .map((_, index) => `<span class="${index <= journeyStageIndex ? 'is-active' : ''}"></span>`)
        .join('');

    const isBottomAligned = (journeyStageIndex === 1 || journeyStageIndex === 3) ? ' bottom-aligned' : '';

    return `
        <div class="journey-panel-inner${isBottomAligned}">
            <div class="journey-kicker">${escapeHtml(stage.kicker)}</div>
            <div class="journey-title">${escapeHtml(stage.title)}</div>
            <div class="journey-body">${escapeHtml(stage.body)}</div>
            <div class="journey-hint">${escapeHtml(stage.hint)}</div>
            <div class="journey-progress">${progressHtml}</div>
        </div>
    `;
}

function swapJourneyPanel(stage, { immediate = false } = {}) {
    const incoming = journeyPanelOnA ? journeyPanelB : journeyPanelA;
    const outgoing = journeyPanelOnA ? journeyPanelA : journeyPanelB;

    incoming.innerHTML = renderJourneyPanelHtml(stage);

    if (immediate) {
        outgoing.classList.remove('is-active', 'is-exiting');
        incoming.classList.add('is-active');
        incoming.setAttribute('aria-hidden', 'false');
        outgoing.setAttribute('aria-hidden', 'true');
        journeyPanelOnA = !journeyPanelOnA;
        return;
    }

    if (journeyPanelBusy) {
        return;
    }
    journeyPanelBusy = true;

    incoming.classList.remove('is-exiting');
    incoming.classList.add('is-active');
    incoming.setAttribute('aria-hidden', 'false');
    outgoing.setAttribute('aria-hidden', 'true');
    outgoing.classList.add('is-exiting');
    outgoing.classList.remove('is-active');

    window.setTimeout(() => {
        outgoing.classList.remove('is-exiting');
        journeyPanelOnA = !journeyPanelOnA;
        journeyPanelBusy = false;
    }, 680);
}

function applyJourneyStage(stage, { immediate = false } = {}) {
    if (!stage) return;

    swapJourneyPanel(stage, { immediate });
    updateInstruction(stage.instruction);

    const visual = stage.visual;
    const targetFog = visual.fogDensity;
    const targetNodeOpacity = visual.nodeOpacity;
    const targetLineOpacity = visual.lineOpacity;
    const targetSaturation = visual.saturation;
    const targetBloom = visual.bloom;

    if (immediate) {
        journeyFogDensity = targetFog;
        journeyNodeOpacity = targetNodeOpacity;
        journeyLineOpacity = targetLineOpacity;
        journeySaturation = targetSaturation;
    }

    bloomStrengthTarget = targetBloom;
    journeyMedia.style.filter = `saturate(${(targetSaturation + 0.2).toFixed(2)}) brightness(${(0.84 + journeyStageIndex * 0.05).toFixed(2)})`;

    journeyOverlay.classList.remove('theme-threshold', 'theme-leakage', 'theme-bloom', 'theme-formation');

    // 2. 如果当前阶段配置了主题类，则加上去（这会激活你写好的字体和发光特效）
    if (stage.themeClass) {
        journeyOverlay.classList.add(stage.themeClass);
    }

    // 3. 应用当前阶段的变幻莫测的渐变背景
    if (stage.overlayGradient) {
        journeyOverlay.style.background = stage.overlayGradient;
    }
}

function finishJourney() {
    journeyActive = false;
    experienceStarted = true;
    journeyOverlay.classList.remove('is-visible');
    journeyOverlay.setAttribute('aria-hidden', 'true');
    introAnimationActive = true;
    journeyWheelAccumulator = 0;
    bloomStrengthTarget = baseBloomStrength;
    updateInstruction('You have crossed the threshold. The collective topology of sleep is now fully visible. 你已穿过门槛，群体睡眠的拓扑轮廓正在眼前展开。');
    btnViewToggle.classList.add('is-visible');
    setTimeout(() => {
        openInfoPanel();
    }, 1000);

}

function advanceJourneyStep() {
    if (!journeyActive) {
        return;
    }
    if (journeyPanelBusy) {
        return;
    }

    journeyStageIndex += 1;
    if (journeyStageIndex >= journeyStages.length) {
        finishJourney();
        return;
    }

    applyJourneyStage(journeyStages[journeyStageIndex]);
}

function retreatJourneyStep() {
    if (!journeyActive) {
        return;
    }
    if (journeyPanelBusy) {
        return;
    }

    if (journeyStageIndex > 0) {
        journeyStageIndex -= 1;
        applyJourneyStage(journeyStages[journeyStageIndex]);
    }
}

function startJourney() {
    journeyActive = true;
    journeyStageIndex = 0;
    journeyWheelAccumulator = 0;
    journeyInputGuardUntil = performance.now() + 280;
    journeyPanelBusy = false;
    loader.classList.add('is-hidden');
    loader.setAttribute('aria-hidden', 'true');
    bloomPass.strength = bloomBurstStrength * 0.55;
    journeyOverlay.classList.add('is-visible');
    journeyOverlay.setAttribute('aria-hidden', 'false');
    initAudio();
    applyJourneyStage(journeyStages[journeyStageIndex], { immediate: true });

    window.setTimeout(() => {
        stopEEG();
        loader.style.display = 'none';
    }, 620);
}

function tickHold(now) {
    if (!holdActive) {
        return;
    }
    const elapsed = now - holdStartedAt;
    holdProgress = clamp((elapsed / holdDurationMs) * 100, 0, 100);
    setHoldProgress(holdProgress);

    if (holdProgress >= 100) {
        holdActive = false;
        holdRaf = 0;
        loader.classList.add('burst');
        loaderBurstTriggered = true;
        bloomPass.strength = bloomBurstStrength;
        bloomStrengthTarget = journeyStages[0].visual.bloom;
        startJourney();
        return;
    }

    holdRaf = requestAnimationFrame(tickHold);
}

function startHolding() {
    if (!scenePrepared || !loaderNarrativeDone || journeyActive || experienceStarted) {
        return;
    }
    holdActive = true;
    holdStartedAt = performance.now();
    holdProgress = 0;
    setHoldProgress(0);
    if (!holdRaf) {
        holdRaf = requestAnimationFrame(tickHold);
    }
}

function stopHolding() {
    if (!holdActive) {
        return;
    }
    holdActive = false;
    if (holdRaf) {
        cancelAnimationFrame(holdRaf);
        holdRaf = 0;
    }
    holdProgress = 0;
    setHoldProgress(0);
}

function updateNodeScale(node) {
    const targetScale = node.userData.targetScale ?? node.userData.originalScale;
    node.scale.x += (targetScale - node.scale.x) * 0.16;
    node.scale.y += (targetScale - node.scale.y) * 0.16;
    node.scale.z += (targetScale - node.scale.z) * 0.16;
}

function getEmotionColor(emotionStr = '', videoType = '') {
    const text = `${emotionStr} ${videoType}`.toLowerCase();
    if (text.includes('happy') || text.includes('positive')) return new THREE.Color(0xffa63d);
    if (text.includes('negative')) return new THREE.Color(0x5d7dff);
    if (text.includes('sad') || text.includes('fear') || text.includes('unhappy')) return new THREE.Color(0xff5b6e);
    if (text.includes('calm') || text.includes('neutral')) return new THREE.Color(0x7be6ff);
    return new THREE.Color(0x7be6ff);
}

function formatRecordDate(value) {
    if (value === undefined || value === null || value === '' || value === 'Unknown') {
        return 'Record date / 记录日期: Unknown';
    }
    return `Record date / 记录日期: ${value}`;
}

function buildArchiveThread(data) {
    const emotionEn = data.Dream_emotion && data.Dream_emotion !== 'Unknown'
        ? data.Dream_emotion
        : 'an unreadable emotional tone';
    const emotionZh = data.Dream_emotion && data.Dream_emotion !== 'Unknown'
        ? translateEmotion(data.Dream_emotion)
        : '难以判读的情绪';

    const stimulusEn = data.Video_name && data.Video_name !== 'Unknown'
        ? `after exposure to ${data.Video_name}`
        : 'without an identified external stimulus';
    const stimulusZh = data.Video_name && data.Video_name !== 'Unknown'
        ? `在观看《${data.Video_name}》之后`
        : '在没有明确外部刺激记录的情况下';

    const eegValue = Number.parseFloat(data.EEG_Intensity);
    let intensityEn = 'an uncertain neural trace';
    let intensityZh = '不确定的神经残响';

    if (Number.isFinite(eegValue)) {
        if (eegValue > 75) {
            intensityEn = 'high neural agitation';
            intensityZh = '高度活跃的脑电波动';
        } else if (eegValue > 55) {
            intensityEn = 'a sustained neural glow';
            intensityZh = '持续发亮的神经余温';
        } else {
            intensityEn = 'a quieter neural trace';
            intensityZh = '较为安静的神经残留';
        }
    }

    return `${escapeHtml(`This entry suggests ${emotionEn} ${stimulusEn}, leaving behind ${intensityEn}. The dream text reads less like a report and more like a residue: a scene still glowing after wakefulness returns.`)}<span class="bilingual-sub">${escapeHtml(`这条记录更像一片仍在发光的意识残片：${stimulusZh}，情绪趋向${emotionZh}，并留下${intensityZh}。它不像报告，更像醒来后尚未完全熄灭的梦境余烬。`)}</span>`;
}

function summarizeHoverDream(text) {
    const content = String(text || '').trim();
    if (!content) {
        return 'No narrative fragment available.';
    }
    if (content.length <= 140) {
        return content;
    }
    return `${content.slice(0, 137)}...`;
}

function renderTooltipContent(node) {
    const data = node.userData;
    const eegValue = Number.parseFloat(data.EEG_Intensity);
    const eegText = Number.isFinite(eegValue) ? eegValue.toFixed(1) : 'N/A';
    const videoLabel = data.Video_type && data.Video_type !== 'Unknown'
        ? `${data.Video_type} / ${translateVideoType(data.Video_type)}`
        : 'Unclassified / 未分类';
    const emotionLabel = data.Dream_emotion
        ? `${data.Dream_emotion} / ${translateEmotion(data.Dream_emotion)}`
        : 'Unknown emotion / 未知情绪';
    const dreamText = summarizeHoverDream(data.Dream_content);

    tooltip.innerHTML = `
        <div class="tooltip-title">Preview / Subject ${escapeHtml(data.Online_id || 'Unknown')}</div>
        <div class="tooltip-tags">
            <span class="tooltip-tag">EEG ${escapeHtml(eegText)}</span>
            <span class="tooltip-tag">${escapeHtml(emotionLabel)}</span>
            <span class="tooltip-tag">${escapeHtml(videoLabel)}</span>
        </div>
        <div class="tooltip-dream">"${escapeHtml(dreamText)}"</div>
    `;
}

function createStarfield() {
    const starCount = 10000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const palette = [
        new THREE.Color(0x6db8ff),
        new THREE.Color(0x93fff4),
        new THREE.Color(0xffd3a0),
        new THREE.Color(0xe8f3ff)
    ];

    for (let i = 0; i < starCount; i += 1) {
        const radius = 220 + Math.random() * 620;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const index = i * 3;
        positions[index] = radius * Math.sin(phi) * Math.cos(theta);
        positions[index + 1] = radius * Math.cos(phi) * 0.45;
        positions[index + 2] = radius * Math.sin(phi) * Math.sin(theta);

        const color = palette[Math.floor(Math.random() * palette.length)]
            .clone()
            .lerp(new THREE.Color(0xffffff), Math.random() * 0.35);
        colors[index] = color.r;
        colors[index + 1] = color.g;
        colors[index + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 1.7,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
    });

    starfield = new THREE.Points(geometry, material);
    starfield.rotation.x = 0.45;
    scene.add(starfield);
}

function buildNarrativeStructure(data) {
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error('dream_data.json is empty or not an array.');
    }

    dataset = data;

    const eegValues = data
        .map((item) => Number.parseFloat(item.EEG_Intensity))
        .filter((value) => Number.isFinite(value));

    if (eegValues.length === 0) {
        throw new Error('No valid EEG_Intensity values were found in dream_data.json.');
    }

    eegStats = {
        min: Math.min(...eegValues),
        max: Math.max(...eegValues)
    };

    const eegRange = eegStats.max - eegStats.min || 1;
    const baseGeometry = new THREE.IcosahedronGeometry(1, 2);
    const total = data.length;
    const verticalSpan = clamp(total * 0.72, 140, 280);

    data.forEach((item, index) => {
        const angle = index * 0.46;
        const radius = 14 + index * 0.44 + Math.sin(index * 0.12) * 3.4;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);
        const y = total === 1
            ? 0
            : THREE.MathUtils.mapLinear(index, 0, total - 1, -verticalSpan / 2, verticalSpan / 2);

        const eegValue = Number.parseFloat(item.EEG_Intensity);
        const normalizedEEG = Number.isFinite(eegValue) ? (eegValue - eegStats.min) / eegRange : 0;
        const scale = 0.55 + normalizedEEG * 2.45;
        const color = getEmotionColor(item.Dream_emotion, item.Video_type);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                u_time: { value: 0 },
                u_color: { value: color.clone() },
                u_speed: { value: 0.9 + Math.random() * 1.8 },
                u_focusBoost: { value: 0 },
                u_lumaCap: { value: defaultLumaCap }
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        material.opacity = 1;

        const node = new THREE.Mesh(baseGeometry, material);
        node.position.set(x, y, z);
        node.userData = {
            ...item,
            dataIndex: index,
            originalColor: color.clone(),
            originalScale: scale,
            targetScale: scale,
            normalizedEEG
        };
        setNodeScaleImmediate(node, scale);

        scene.add(node);
        nodes.push(node);

        if (index > 0) {
            const prevNode = nodes[index - 1];
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([prevNode.position, node.position]);
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.085,
                blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(lineGeometry, lineMaterial);
            scene.add(line);
            connectiveLines.push(line);
        }

        if (!demoNodes.luminescence || normalizedEEG > demoNodes.luminescence.userData.normalizedEEG) {
            demoNodes.luminescence = node;
        }
        if (!demoNodes.stimulus && item.Video_name && item.Video_name !== 'Unknown') {
            demoNodes.stimulus = node;
        }
        if (!demoNodes.chromatic && normalizeText(item.Dream_emotion).includes('fear')) {
            demoNodes.chromatic = node;
        }
    });

    if (!demoNodes.chromatic) {
        demoNodes.chromatic = nodes.find((node) => normalizeText(node.userData.Dream_emotion).includes('sad')) || nodes[0];
    }
    if (!demoNodes.stimulus) {
        demoNodes.stimulus = nodes[0];
    }
}

function updateSceneEmphasis(mode = 'normal', targetNode = null) {
    connectiveLines.forEach((line) => {
        if (mode === 'focus') {
            line.material.opacity = 0.02;
        } else if (mode === 'demo') {
            line.material.opacity = 0.045;
        } else {
            line.material.opacity = 0.085;
        }
    });

    nodes.forEach((node) => {
        if (mode === 'focus') {
            node.material.opacity = node === targetNode ? 1 : 0.1;
        } else if (mode === 'demo') {
            node.material.opacity = node === targetNode ? 0.95 : 0.32;
        } else {
            node.material.opacity = 1;
        }
    });

    if (starfield?.material) {
        starfield.material.opacity = mode === 'focus' ? 0.18 : mode === 'demo' ? 0.34 : 0.55;
    }
}

function resetNodeAppearance(node) {
    if (!node) {
        return;
    }
    setNodeScaleTarget(node, node.userData.originalScale);
    node.material.uniforms.u_color.value.copy(node.userData.originalColor);
    node.material.opacity = 1;
    setFocusBoost(node, 0);
    setNodeLumaCap(node, defaultLumaCap);
}

function highlightNode(node, multiplier, brighten = false) {
    if (!node) {
        return;
    }
    setNodeScaleTarget(node, node.userData.originalScale * multiplier);
    const accent = brighten
        ? node.userData.originalColor.clone().lerp(new THREE.Color(0xffffff), 0.2)
        : node.userData.originalColor;
    node.material.uniforms.u_color.value.copy(accent);
    node.material.opacity = 1;
    setFocusBoost(node, brighten ? 0.55 : 0.3);
    setNodeLumaCap(node, brighten ? focusedLumaCap : defaultLumaCap);
}

function moveCameraTo(position, target, options = {}) {
    cameraTransitionTarget.copy(position);
    controlsTransitionTarget.copy(target);
    cameraTransitionActive = true;
    cameraTransitionSpeed = options.speed ?? 0.08;
    resumeAutoRotateAfterTransition = Boolean(options.resumeAutoRotate);
}

function getFocusCameraPosition(node, offsetScale = 1) {
    const targetPos = node.position.clone();
    const radial = targetPos.clone();

    if (radial.lengthSq() < 0.0001) {
        radial.set(1, 0.15, 1);
    }

    radial.normalize();
    const lateral = new THREE.Vector3().crossVectors(radial, new THREE.Vector3(0, 1, 0)).normalize();

    return targetPos
        .clone()
        .add(radial.multiplyScalar(20 * offsetScale))
        .add(lateral.multiplyScalar(-8 * offsetScale))
        .add(new THREE.Vector3(0, 6.5 * offsetScale, 0));
}

function getBaseSimilarityScore(sourceNode, candidateNode) {
    const source = sourceNode.userData;
    const candidate = candidateNode.userData;
    let score = 0;

    if (sameText(source.Dream_emotion, candidate.Dream_emotion)) {
        score += 4.6;
    }
    if (sameText(source.Video_type, candidate.Video_type)) {
        score += 2.6;
    }
    if (knownMatch(source.Video_name, candidate.Video_name)) {
        score += 1.9;
    }
    if (sameText(source.Online_id, candidate.Online_id)) {
        score += 1.6;
    }

    const eegDiff = Math.abs((source.normalizedEEG ?? 0) - (candidate.normalizedEEG ?? 0));
    score += (1 - clamp(eegDiff, 0, 1)) * 3.1;

    const indexDistance = Math.abs((candidate.dataIndex ?? 0) - (source.dataIndex ?? 0));
    score += 1 / (1 + indexDistance * 0.03);

    return score;
}

function buildRoutePool(sourceNode) {
    if (!sourceNode) {
        return [];
    }

    const source = sourceNode.userData;

    return routeStrategies
        .map((strategy) => {
            const candidates = nodes
                .filter((candidateNode) => {
                    if (candidateNode === sourceNode) {
                        return false;
                    }
                    if (journeyVisited.has(candidateNode.userData.dataIndex)) {
                        return false;
                    }
                    return strategy.predicate(source, candidateNode.userData);
                })
                .sort((leftNode, rightNode) => {
                    const leftScore = getBaseSimilarityScore(sourceNode, leftNode) + strategy.bonus;
                    const rightScore = getBaseSimilarityScore(sourceNode, rightNode) + strategy.bonus;
                    return rightScore - leftScore;
                });

            return {
                ...strategy,
                candidates
            };
        })
        .filter((route) => route.candidates.length > 0);
}

function refreshRoutes(preferredIndex = 0) {
    currentRoutes = buildRoutePool(focusedNode);

    if (currentRoutes.length === 0) {
        currentRouteIndex = 0;
        setRoutePreview(null);
        return;
    }

    currentRouteIndex = clamp(preferredIndex, 0, currentRoutes.length - 1);
    setRoutePreview(currentRoutes[currentRouteIndex]);
}

function populateSidebar(node, preferredRouteIndex = 0) {
    const data = node.userData;
    const eegValue = Number.parseFloat(data.EEG_Intensity);
    const normalized = Number.isFinite(eegValue)
        ? (eegValue - eegStats.min) / (eegStats.max - eegStats.min || 1)
        : 0;
    const eegPercent = clamp(normalized * 100, 0, 100);
    const originalColor = data.originalColor || new THREE.Color(0x7be6ff);
    const stimulusModeEn = data.Video_name && data.Video_name !== 'Unknown'
        ? 'Stimulus-linked'
        : 'Spontaneous dream';
    const stimulusModeZh = data.Video_name && data.Video_name !== 'Unknown'
        ? '外部刺激触发'
        : '自发性梦境';
    const videoTypeEn = data.Video_type && data.Video_type !== 'Unknown'
        ? data.Video_type
        : 'No tagged stimulus';
    const videoTypeZh = data.Video_type && data.Video_type !== 'Unknown'
        ? translateVideoType(data.Video_type)
        : '无明确刺激标签';
    const emotionEn = data.Dream_emotion || 'Unknown emotion';
    const emotionZh = data.Dream_emotion ? translateEmotion(data.Dream_emotion) : '未知情绪';
    const sequenceIndex = (data.dataIndex ?? 0) + 1;
    const descriptor = getEmotionDescriptor(data.Dream_emotion);

    updateAccent(originalColor);

    sideKicker.textContent = `${descriptor.en} / ${descriptor.zh}`;
    sideId.textContent = `Subject ${data.Online_id || 'Unknown'} / 被试 ${data.Online_id || '未知'}`;
    sideDate.textContent = formatRecordDate(data.Date);
    sideSequence.textContent = `Pulse ${sequenceIndex} of ${dataset.length} / 第 ${sequenceIndex} 条，共 ${dataset.length} 条`;
    sideEegVal.textContent = Number.isFinite(eegValue) ? eegValue.toFixed(2) : 'N/A';
    sideEegNote.textContent = Number.isFinite(eegValue)
        ? `${Math.round(eegPercent)}% of the recorded EEG range / 位于全部脑电范围的 ${Math.round(eegPercent)}%`
        : 'EEG intensity unavailable / 暂无有效脑电强度';
    sideStimulusMode.textContent = `${stimulusModeEn} / ${stimulusModeZh}`;
    sideEmotion.textContent = `Emotion / 情绪: ${emotionEn} / ${emotionZh}`;
    sideVideoType.textContent = `${videoTypeEn} / ${videoTypeZh}`;
    sideEmotionTag.textContent = `${emotionEn} / ${emotionZh}`;
    sideVideoName.textContent = data.Video_name && data.Video_name !== 'Unknown'
        ? `Stimulus / 刺激源: ${data.Video_name}`
        : 'Stimulus / 刺激源: Spontaneous dream without a recorded video source / 无明确视频刺激记录';
    const digest = summarizeHoverDream(data.Dream_content || 'No narrative data available for this node.');
    sideDreamContent.textContent = `"${digest}"`;
    sideThread.innerHTML = buildArchiveThread(data);

    eegBarFill.style.width = `${eegPercent}%`;
    eegBarFill.style.background = `linear-gradient(90deg, rgba(${rootStyle.getPropertyValue('--accent-rgb')}, 0.38), #${originalColor.getHexString()})`;
    eegBarFill.style.boxShadow = `0 0 28px rgba(${rootStyle.getPropertyValue('--accent-rgb')}, 0.46)`;

    refreshRoutes(preferredRouteIndex);
}

function showDreamFragment(node) {
    const data = node.userData;
    const eegValue = Number.parseFloat(data.EEG_Intensity);
    const eegText = Number.isFinite(eegValue) ? eegValue.toFixed(2) : 'N/A';
    const emotionLabel = data.Dream_emotion
        ? `${data.Dream_emotion} / ${translateEmotion(data.Dream_emotion)}`
        : 'Unknown emotion / 未知情绪';
    const stimulusLine = data.Video_name && data.Video_name !== 'Unknown'
        ? `Waking echo / 清醒刺激: ${data.Video_name}`
        : 'Waking echo / 清醒刺激: spontaneous dream without a recorded trigger / 无明确记录的自发性梦境';
    const dreamNarrative = String(data.Dream_content || 'No narrative data available for this node. / 当前节点暂无梦境文本。').trim();
    const mediaLabel = data.Video_name && data.Video_name !== 'Unknown'
        ? `Stimulus echo: ${data.Video_name}`
        : `Procedural motif: ${translateEmotion(data.Dream_emotion || 'Unknown')}`;
    const mediaColor = node.userData.originalColor.clone();

    currentFragmentNode = node;
    dreamFragment.setAttribute('aria-hidden', 'false');
    dreamFragment.style.display = 'block';
    dreamFragmentTitle.textContent = `Subject ${data.Online_id || 'Unknown'} / Dream Fragment`;
    dreamFragmentMeta.textContent = `${stimulusLine} | ${emotionLabel} | EEG ${eegText}`;
    dreamFragmentMedia.style.background = `
        radial-gradient(circle at 22% 28%, rgba(${Math.round(mediaColor.r * 255)}, ${Math.round(mediaColor.g * 255)}, ${Math.round(mediaColor.b * 255)}, 0.42), transparent 44%),
        radial-gradient(circle at 78% 68%, rgba(255, 156, 96, 0.24), transparent 42%),
        linear-gradient(130deg, rgba(14, 20, 32, 0.96), rgba(8, 12, 20, 0.92))
    `;
    dreamFragmentMediaLabel.textContent = `${mediaLabel} / 视觉锚点`;
    dreamFragmentBody.textContent = '';
    dreamFragment.classList.add('is-visible');

    const typewriterContent = [
        'Dream narrative / 梦境叙事',
        '',
        dreamNarrative
    ].join('\n');
    const token = Date.now();
    typewriterToken = token;
    let index = 0;

    function step() {
        if (typewriterToken !== token) {
            return;
        }

        index += 2;
        dreamFragmentBody.textContent = typewriterContent.slice(0, index);

        if (index < typewriterContent.length) {
            window.setTimeout(step, 18);
        }
    }

    step();
    updateDreamFragmentPosition();
}

function hideDreamFragment() {
    typewriterToken += 1;
    currentFragmentNode = null;
    dreamFragment.classList.remove('is-visible');
    dreamFragment.setAttribute('aria-hidden', 'true');
    window.setTimeout(() => {
        if (!dreamFragment.classList.contains('is-visible')) {
            dreamFragment.style.display = 'none';
        }
    }, 320);
}

function updateDreamFragmentPosition() {
    if (!currentFragmentNode || dreamFragment.style.display === 'none') {
        return;
    }

    const projected = currentFragmentNode.position.clone().project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-projected.y * 0.5 + 0.5) * window.innerHeight;
    const panelWidth = dreamFragment.offsetWidth || 360;
    const panelHeight = dreamFragment.offsetHeight || 220;
    const preferLeft = screenX > window.innerWidth * 0.48 || sidebar.classList.contains('is-open');
    const x = preferLeft ? screenX - panelWidth - 34 : screenX + 28;
    const y = screenY - panelHeight * 0.35;
    const clampedX = clamp(x, 18, window.innerWidth - panelWidth - 18);
    const clampedY = clamp(y, 88, window.innerHeight - panelHeight - 92);

    dreamFragment.style.left = `${clampedX}px`;
    dreamFragment.style.top = `${clampedY}px`;
}

function clearHoverPreview() {
    if (focusedNode) {
        return;
    }

    if (hoveredNode && hoveredNode !== demoNode) {
        resetNodeAppearance(hoveredNode);
        hoveredNode = null;
    }

    hideTooltip();
    document.body.style.cursor = 'default';

    if (!cameraTransitionActive && !introAnimationActive && !infoPanelOpen) {
        controls.autoRotate = true;
    }

    if (!infoPanelOpen) {
        updateInstruction(defaultInstruction);
    }
}

function focusNode(node, options = {}) {
    if (!node) { return; }
    btnViewToggle.classList.remove('is-visible'); 
    const { preserveJourney = false, preferredRouteIndex = 0 } = options;

    if (!preserveJourney) {
        journeyVisited = new Set();
    }
    journeyVisited.add(node.userData.dataIndex);

    if (focusedNode && focusedNode !== node) { resetNodeAppearance(focusedNode); }
    if (hoveredNode && hoveredNode !== node) { resetNodeAppearance(hoveredNode); }

    clearInfoDemo();

    focusedNode = node;
    hoveredNode = node;
    controls.autoRotate = false;
    updateSceneEmphasis('focus', node);
    highlightNode(node, 1.95, true);

    populateSidebar(node, preferredRouteIndex);
    openSidebar();

    hideTooltip();
    showDreamFragment(node);
    setBackButtonVisible(true);
    document.body.style.cursor = 'default';
    updateInstruction(focusInstruction);
    bloomStrengthTarget = baseBloomStrength * 0.74;

    moveCameraTo(getFocusCameraPosition(node), node.position, { resumeAutoRotate: false, speed: 0.085 });
}

function exitFocusMode() {
    if (!focusedNode) { return; }

    resetNodeAppearance(focusedNode);
    focusedNode = null;
    hoveredNode = null;
    journeyVisited = new Set();

    closeSidebar();
    hideTooltip();
    hideDreamFragment();
    setBackButtonVisible(false);

    if (typeof btnViewToggle !== 'undefined') {
        btnViewToggle.classList.add('is-visible');
    }

    updateAccent(new THREE.Color(0x7be6ff));
    currentRoutes = [];
    currentRouteIndex = 0;
    setRoutePreview(null);
    document.body.style.cursor = 'default';
    updateInstruction(defaultInstruction);
    bloomStrengthTarget = journeyActive ? journeyStages[journeyStageIndex].visual.bloom : baseBloomStrength;

    if (infoPanelOpen) {
        updateSceneEmphasis('demo', demoNode);
    } else {
        updateSceneEmphasis('normal');
    }

    const targetPos = isTopDownView ? topDownCameraPosition : defaultCameraPosition;
    moveCameraTo(targetPos, defaultControlsTarget, { resumeAutoRotate: true, speed: 0.065 });
}

function updatePointerFromEvent(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function getIntersectedNode(event) {
    updatePointerFromEvent(event);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(nodes);
    return intersects.length > 0 ? intersects[0].object : null;
}

function handlePointerMove(event) {
    if (!experienceStarted || journeyActive || focusedNode || infoPanelOpen) {
        return;
    }

    const node = getIntersectedNode(event);

    if (!node) {
        clearHoverPreview();
        return;
    }

    if (hoveredNode !== node) {
        if (hoveredNode) {
            resetNodeAppearance(hoveredNode);
        }

        hoveredNode = node;
        highlightNode(node, 1.45, false);
        renderTooltipContent(node);
        showTooltip();
        controls.autoRotate = false;
        document.body.style.cursor = 'crosshair';
        updateInstruction(previewInstruction);
    }

    setTooltipPosition(event.clientX + 18, event.clientY + 18);
}

function handleCanvasClick(event) {
    if (!experienceStarted || journeyActive || infoPanelOpen) {
        return;
    }

    const node = getIntersectedNode(event);

    if (!node) {
        exitFocusMode();
        return;
    }

    focusNode(node, { preserveJourney: false, preferredRouteIndex: 0 });
}

function followSimilarPulse() {
    if (!focusedNode || currentRoutes.length === 0) {
        setRoutePreview(null);
        return;
    }

    const route = currentRoutes[currentRouteIndex];
    const nextNode = route.candidates[0];

    if (!nextNode) {
        currentRouteIndex = (currentRouteIndex + 1) % currentRoutes.length;
        setRoutePreview(currentRoutes[currentRouteIndex]);
        return;
    }

    const nextRouteIndex = currentRoutes.length > 1
        ? (currentRouteIndex + 1) % currentRoutes.length
        : 0;

    focusNode(nextNode, {
        preserveJourney: true,
        preferredRouteIndex: nextRouteIndex
    });
}

function setDemoNode(node, demoKey) {
    if (!node || focusedNode) {
        return;
    }

    if (demoNode && demoNode !== node) {
        resetNodeAppearance(demoNode);
    }

    demoNode = node;
    currentInfoDemo = demoKey;
    updateSceneEmphasis('demo', node);
    highlightNode(node, 1.55, true);
    moveCameraTo(getFocusCameraPosition(node, 1.15), node.position, { resumeAutoRotate: false, speed: 0.06 });

    if (demoKey === 'stimulus') {
        updateInstruction('The guide has focused a stimulus-linked dream so you can watch the waking world leak into sleep. 当前说明正在聚焦一个受视频刺激影响的梦境节点。');
    } else if (demoKey === 'luminescence') {
        updateInstruction('The guide is isolating a high-intensity EEG pulse to show how scale and glow map neural agitation. 当前说明正在演示脑电强度如何决定节点体积与光晕。');
    } else if (demoKey === 'chromatic') {
        updateInstruction('The guide is isolating a color-coded emotional state so the palette can be read as affect. 当前说明正在演示颜色如何映射梦境情绪。');
    }
}

function clearInfoDemo() {
    if (demoNode && !focusedNode) {
        resetNodeAppearance(demoNode);
        demoNode = null;
    }

    currentInfoDemo = '';

    if (!focusedNode) {
        updateSceneEmphasis('normal');
    }
    if (!focusedNode) {
        updateSceneEmphasis('normal');
        const targetPos = isTopDownView ? topDownCameraPosition : defaultCameraPosition;
    }
}

function updateInfoDemo() {
    if (!infoPanelOpen || focusedNode || demoSections.length === 0) {
        return;
    }

    const scrollTop = infoScroll.scrollTop;
    const panelHeight = infoScroll.clientHeight;
    let activeSection = demoSections[0];
    let bestScore = Infinity;

    demoSections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const score = Math.abs(sectionTop - scrollTop - panelHeight * 0.2);
        if (score < bestScore) {
            bestScore = score;
            activeSection = section;
        }
    });

    const demoKey = activeSection.dataset.demo;
    if (!demoKey || currentInfoDemo === demoKey) {
        return;
    }

    setDemoNode(demoNodes[demoKey], demoKey);
}

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    nodes.forEach((node) => {
        if (node.material.uniforms) {
            node.material.uniforms.u_time.value = elapsedTime;
        }
        updateNodeScale(node);
    });

    if (journeyActive && !focusedNode && !infoPanelOpen) {
        const visual = journeyStages[journeyStageIndex].visual;
        journeyNodeOpacity += (visual.nodeOpacity - journeyNodeOpacity) * 0.06;
        journeyLineOpacity += (visual.lineOpacity - journeyLineOpacity) * 0.06;
        journeyFogDensity += (visual.fogDensity - journeyFogDensity) * 0.06;
        journeySaturation += (visual.saturation - journeySaturation) * 0.06;

        nodes.forEach((node) => {
            node.material.opacity = journeyNodeOpacity;
            setNodeLumaCap(node, defaultLumaCap);
        });
        connectiveLines.forEach((line) => {
            line.material.opacity = journeyLineOpacity;
        });
        if (starfield?.material) {
            starfield.material.opacity = visual.starOpacity;
        }
        scene.fog.density = journeyFogDensity;
        container.style.filter = `saturate(${journeySaturation.toFixed(2)})`;
    } else {
        scene.fog.density += (0.0105 - scene.fog.density) * 0.045;
        container.style.filter = 'saturate(1)';
    }
    if (starfield) {
        starfield.rotation.y += 0.00035;
        starfield.rotation.z = Math.sin(elapsedTime * 0.04) * 0.12;
    }

    if (introAnimationActive) {
        camera.position.lerp(introCameraTarget, 0.028);
        controls.target.lerp(defaultControlsTarget, 0.03);

        if (camera.position.distanceTo(introCameraTarget) < 0.8 &&
            controls.target.distanceTo(defaultControlsTarget) < 0.6) {
            camera.position.copy(introCameraTarget);
            controls.target.copy(defaultControlsTarget);
            introAnimationActive = false;
            controls.autoRotate = !infoPanelOpen && !focusedNode;
        }
    } else if (cameraTransitionActive) {
        camera.position.lerp(cameraTransitionTarget, cameraTransitionSpeed);
        controls.target.lerp(controlsTransitionTarget, cameraTransitionSpeed);

        if (camera.position.distanceTo(cameraTransitionTarget) < 0.28 &&
            controls.target.distanceTo(controlsTransitionTarget) < 0.28) {
            camera.position.copy(cameraTransitionTarget);
            controls.target.copy(controlsTransitionTarget);
            cameraTransitionActive = false;
            controls.autoRotate = resumeAutoRotateAfterTransition && !focusedNode && !infoPanelOpen;
            resumeAutoRotateAfterTransition = false;
        }
    }

    bloomPass.strength += (bloomStrengthTarget - bloomPass.strength) * 0.085;
    updateDreamFragmentPosition();
    controls.update();
    composer.render();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
    resizeEEGCanvas();
});

renderer.domElement.addEventListener('pointermove', handlePointerMove);
renderer.domElement.addEventListener('pointerleave', clearHoverPreview);
renderer.domElement.addEventListener('click', handleCanvasClick);

loaderEnter.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    startHolding();
});
loaderEnter.addEventListener('pointerup', stopHolding);
loaderEnter.addEventListener('pointercancel', stopHolding);
loaderEnter.addEventListener('pointerleave', stopHolding);

window.addEventListener('wheel', (event) => {
    if (!journeyActive) return;
    if (performance.now() < journeyInputGuardUntil) return;

    journeyWheelAccumulator += event.deltaY;

    if (journeyWheelAccumulator >= journeyWheelThreshold) {
        journeyWheelAccumulator = 0;
        advanceJourneyStep();
        journeyInputGuardUntil = performance.now() + 600;

    } else if (journeyWheelAccumulator <= -journeyWheelThreshold) {
        journeyWheelAccumulator = 0;
        retreatJourneyStep();
        journeyInputGuardUntil = performance.now() + 600;
    }
}, { passive: true });

infoToggle.addEventListener('click', () => {
    if (journeyActive) {
        return;
    }
    if (infoPanelOpen) {
        closeInfoPanel();
    } else {
        openInfoPanel();
    }
});

infoClose.addEventListener('click', () => {
    closeInfoPanel();
});

infoScroll.addEventListener('scroll', () => {
});

btnBack.addEventListener('click', () => {
    if (focusedNode) { 
        exitFocusMode();
    } else if (infoPanelOpen) { 
        closeInfoPanel(); 
    } 
});

btnViewToggle.addEventListener('click', (event) => {
    event.stopPropagation();

    if (journeyActive || focusedNode || infoPanelOpen) return;

    // 切换状态
    isTopDownView = !isTopDownView;

    if (isTopDownView) {
        // 切换为俯视
        btnViewToggle.textContent = 'Immersive View / 沉浸平视';
        moveCameraTo(topDownCameraPosition, defaultControlsTarget, { resumeAutoRotate: true, speed: 0.06 });
    } else {
        // 切换回平视
        btnViewToggle.textContent = 'Top-down View / 俯视星系';
        moveCameraTo(defaultCameraPosition, defaultControlsTarget, { resumeAutoRotate: true, speed: 0.06 });
    }
    controls.update();
});

btnNext.addEventListener('click', (event) => {
    event.stopPropagation();
    followSimilarPulse();
});

window.addEventListener('keydown', (event) => {
    if (journeyActive && event.key === 'Escape') {
        return;
    }
    if (event.key === 'Escape') {
        if (infoPanelOpen) {
            closeInfoPanel();
        } else {
            exitFocusMode();
        }
    }
});

async function loadData() {
    const response = await fetch('./data/dream_data.json');
    if (!response.ok) {
        throw new Error(`Failed to load data/dream_data.json (HTTP ${response.status}).`);
    }
    return response.json();
}

async function init() {
    try {
        updateAccent(new THREE.Color(0x7be6ff));
        setBackButtonVisible(false);
        setRoutePreview(null);
        setLoadingProgress(0);
        setLoaderStatus('Warming The Dream Field');
        loader.dataset.stage = 'micro';
        loaderEnter.disabled = true;
        setHoldProgress(0);
        startEEG();
        camera.position.copy(defaultCameraPosition);
        controls.target.copy(defaultControlsTarget);
        createStarfield();
        updateSceneEmphasis('normal');
        animate();

        const dataPromise = loadData();
        const narrativePromise = playLoaderNarrative();

        await Promise.all([
            dataPromise,
            animateProgressTo(36, 1100)
        ]);

        setLoaderStatus('Weaving Neural Archive');
        const data = await dataPromise;
        buildNarrativeStructure(data);
        renderer.compile(scene, camera);
        scenePrepared = true;
        await animateProgressTo(74, 900);

        setLoaderStatus('Stabilizing Consciousness Helix');
        await animateProgressTo(100, 950);
        updateLoaderEnterState();
    } catch (error) {
        console.error('Initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        setLoaderStatus(`Initialization Failed: ${errorMessage}`);
        progressText.textContent = 'ERROR';
        loaderCopyEn.textContent = `Startup error: ${errorMessage}`;
        loaderCopyCn.textContent = `启动失败：${errorMessage}`;
        loaderCopy.classList.add('is-visible');

        const message = window.location.protocol === 'file:'
            ? `Initialization failed: ${errorMessage}. This page must be opened through a local HTTP server because browser security blocks fetch() when using file://.`
            : `Initialization failed: ${errorMessage}`;

        showError(message);
    }
}

closeSidebar();
infoPanel.setAttribute('aria-hidden', 'true');
init();