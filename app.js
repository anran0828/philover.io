const $ = (sel) => document.querySelector(sel);

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function normalizeText(s) {
  return String(s || "")
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .trim();
}

function initialsOf(name) {
  const cleaned = String(name).trim().replace(/\s+/g, "");
  if (!cleaned) return "Φ";
  return cleaned.slice(0, 2);
}

function makeAvatarDataUri(initials, c1, c2) {
  const safeInitials = escapeXml(initials);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <circle cx="60" cy="60" r="58" fill="url(#g)" stroke="rgba(255,255,255,0.45)" stroke-width="2"/>
  <text x="50%" y="54%" text-anchor="middle" font-family="system-ui, Segoe UI, Arial"
    font-size="44" font-weight="800" fill="rgba(255,255,255,0.95)">${safeInitials}</text>
</svg>`.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function fetchWikipediaAvatar(wikiQuery) {
  const cacheKey = `philoAvatar:${wikiQuery}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return cached;
  } catch {
    // ignore
  }

  const url =
    "https://en.wikipedia.org/w/api.php" +
    `?action=query&prop=pageimages&pithumbsize=160&format=json&redirects=1&titles=${encodeURIComponent(wikiQuery)}&origin=*`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    const data = await res.json();
    const pages = data?.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0];
      const src = page?.thumbnail?.source;
      if (src) {
        try {
          localStorage.setItem(cacheKey, src);
        } catch {
          // ignore
        }
        return src;
      }
    }

    // Fallback 1: Wikipedia REST summary API
    const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`;
    try {
      const res2 = await fetch(restUrl);
      const d2 = await res2.json();
      const src2 = d2?.thumbnail?.source;
      if (src2) {
        try {
          localStorage.setItem(cacheKey, src2);
        } catch {
          // ignore
        }
        return src2;
      }
    } catch {
      // ignore
    }

    // Fallback 2: DuckDuckGo instant answer API (some entries include image)
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(wikiQuery)}&format=json&no_html=1&skip_disambig=1`;
    try {
      const res3 = await fetch(ddgUrl);
      const d3 = await res3.json();
      if (d3?.Image) {
        const src3 = d3.Image.startsWith("http") ? d3.Image : `https://duckduckgo.com${d3.Image}`;
        try {
          localStorage.setItem(cacheKey, src3);
        } catch {
          // ignore
        }
        return src3;
      }
    } catch {
      // ignore
    }

    return null;
  } catch {
    return null;
  }
}

const schools = [
  {
    period: "前5-4世纪（古希腊）",
    name: "古希腊哲学",
    summary: "从“什么是德性/正义/知识”开始，逐步把追问变成可讨论的论证方式。",
    accent: ["#ff4fa3", "#ffd1e8"],
    people: [
      {
        name: "苏格拉底",
        intro: "用诘问暴露概念的含糊处：真正的智慧来自于承认自己的无知与不断澄清。",
        keywords: ["诘问法", "德性知识", "无知之知"],
        wikiQuery: "Socrates",
        wikiUrl: "https://en.wikipedia.org/wiki/Socrates"
      },
      {
        name: "柏拉图",
        intro: "强调理念世界与灵魂结构：通过对话形式把概念放到更稳定的定义框架里。",
        keywords: ["理念论", "灵魂三分", "洞穴比喻"],
        wikiQuery: "Plato",
        wikiUrl: "https://en.wikipedia.org/wiki/Plato"
      },
      {
        name: "亚里士多德",
        intro: "把解释与分类做成工具：关注因果、目的与在经验中组织概念的方法。",
        keywords: ["实体与因因", "德性伦理", "形式逻辑"],
        wikiQuery: "Aristotle",
        wikiUrl: "https://en.wikipedia.org/wiki/Aristotle"
      }
    ]
  },
  {
    period: "前3-前2世纪（希腊化时期）",
    name: "斯多葛主义",
    summary: "把哲学当作“生活的训练”：强调宇宙秩序、德性优先，以及对不可控之事的态度。",
    accent: ["#ff5fae", "#ffc2e6"],
    people: [
      {
        name: "塞涅卡",
        intro: "从道德教养入手：把理性、情感调节与自律结合到日常实践。",
        keywords: ["情感训练", "自律", "德性优先"],
        wikiQuery: "Seneca the Younger",
        wikiUrl: "https://en.wikipedia.org/wiki/Seneca"
      },
      {
        name: "爱比克泰德",
        intro: "区分可控/不可控：把选择建立在判断能力而非外在结果之上。",
        keywords: ["可控性", "判断训练", "内在自由"],
        wikiQuery: "Epictetus",
        wikiUrl: "https://en.wikipedia.org/wiki/Epictetus"
      },
      {
        name: "马可·奥勒留",
        intro: "把反思写成“日常冥想”：在压力中保持对德性的忠诚。",
        keywords: ["反思写作", "宇宙秩序", "责任"],
        wikiQuery: "Marcus_Aurelius",
        wikiUrl: "https://en.wikipedia.org/wiki/Marcus_Aurelius"
      }
    ]
  },
  {
    period: "11-13世纪（经院哲学）",
    name: "经院哲学",
    summary: "在信仰与理性之间搭桥：用逻辑与论证来组织对上帝、存在与知识的理解。",
    accent: ["#ff4fa3", "#fff1f8"],
    people: [
      {
        name: "安瑟伦",
        intro: "提出上帝存在的理性论证，推动“信仰也要能被理解”的路线。",
        keywords: ["本体论证", "理性理解", "信仰与论证"],
        wikiQuery: "Anselm",
        wikiUrl: "https://en.wikipedia.org/wiki/Anselm"
      },
      {
        name: "托马斯·阿奎那",
        intro: "综合亚里士多德传统与基督教教义：以“因果与目的”组织世界观。",
        keywords: ["五路论证", "因果性", "自然律"],
        wikiQuery: "Thomas_Aquinas",
        wikiUrl: "https://en.wikipedia.org/wiki/Thomas_Aquinas"
      },
      {
        name: "约翰·邓斯·司各脱",
        intro: "细化概念与形而上结构：强调形式差异与更严格的区分。",
        keywords: ["概念精细化", "存在方式", "区分与推理"],
        wikiQuery: "John_Duns_Scotus",
        wikiUrl: "https://en.wikipedia.org/wiki/John_Duns_Scotus"
      }
    ]
  },
  {
    period: "17-18世纪（近代：经验论）",
    name: "近代经验论",
    summary: "从经验与证据出发：质疑哪些观念来自感觉，哪些来自心灵的结构。",
    accent: ["#ff6bbd", "#ffd7ea"],
    people: [
      {
        name: "约翰·洛克",
        intro: "把心灵解释为“白板”：知识从经验而来，但需要讨论观念的来源与边界。",
        keywords: ["白板说", "经验来源", "观念分析"],
        wikiQuery: "John_Locke",
        wikiUrl: "https://en.wikipedia.org/wiki/John_Locke"
      },
      {
        name: "乔治·贝克莱",
        intro: "强调“存在即被感知”：把物的稳定性重新解释为感知结构与观念关联。",
        keywords: ["物存在即被感知", "观念依赖", "理性与经验"],
        wikiQuery: "George_Berkeley",
        wikiUrl: "https://en.wikipedia.org/wiki/George_Berkeley"
      },
      {
        name: "大卫·休谟",
        intro: "追问因果、归纳与必然性：把怀疑带到论证最敏感的环节。",
        keywords: ["因果怀疑", "归纳问题", "观念关联"],
        wikiQuery: "David_Hume",
        wikiUrl: "https://en.wikipedia.org/wiki/David_Hume"
      }
    ]
  },
  {
    period: "17世纪（近代理性主义）",
    name: "近代理性主义",
    summary: "强调理性的结构力量：在数学般的确定性理想下重新安排知识的基础。",
    accent: ["#ff4fa3", "#ffe0f3"],
    people: [
      {
        name: "笛卡尔",
        intro: "用方法性怀疑寻找不可动摇的基础：把“我在思考”作为起点。",
        keywords: ["方法怀疑", "我思故我在", "理性基础"],
        wikiQuery: "René Descartes",
        wikiUrl: "https://en.wikipedia.org/wiki/Ren%C3%A9_Descartes"
      },
      {
        name: "斯宾诺莎",
        intro: "追求单一实体的统一解释：世界在必然性下呈现为一个整体。",
        keywords: ["实体一元论", "必然性", "理性几何化"],
        wikiQuery: "Baruch_Spinoza",
        wikiUrl: "https://en.wikipedia.org/wiki/Baruch_Spinoza"
      },
      {
        name: "莱布尼茨",
        intro: "主张充分理由与可理解的秩序：把单子作为解释世界的基本单位。",
        keywords: ["充分理由", "单子论", "最优可能世界"],
        wikiQuery: "Leibniz",
        wikiUrl: "https://en.wikipedia.org/wiki/Leibniz"
      }
    ]
  },
  {
    period: "18世纪末-19世纪初（德国古典）",
    name: "德国古典哲学",
    summary: "把“主体如何可能认识世界”推到前台：并把历史与理性理解成动态过程。",
    accent: ["#ff52a6", "#ffe8f3"],
    people: [
      {
        name: "伊曼努尔·康德",
        intro: "在现象与自在之物之间划出界线：知识的必然结构来自经验与范畴的结合。",
        keywords: ["哥白尼式转向", "范畴框架", "先验条件"],
        wikiQuery: "Immanuel_Kant",
        wikiUrl: "https://en.wikipedia.org/wiki/Immanuel_Kant"
      },
      {
        name: "格奥尔格·威廉·弗里德里希·黑格尔",
        intro: "把概念当作历史的推进器：通过辩证展开让矛盾转化为更高层次的理解。",
        keywords: ["辩证法", "绝对精神", "历史展开"],
        wikiQuery: "Georg_Wilhelm_Friedrich_Hegel",
        wikiUrl: "https://en.wikipedia.org/wiki/Georg_Wilhelm_Friedrich_Hegel"
      },
      {
        name: "约翰·戈特利布·费希特",
        intro: "强调主体活动：自我意识的行动构成知识与世界显现的条件。",
        keywords: ["主体活动", "自我设定", "行动基础"],
        wikiQuery: "Johann_Gottlieb_Fichte",
        wikiUrl: "https://en.wikipedia.org/wiki/Johann_Gottlieb_Fichte"
      }
    ]
  },
  {
    period: "19-20世纪（存在主义）",
    name: "存在主义",
    summary: "关注人的处境：自由如何可能、焦虑如何出现、选择如何塑造“你是谁”。",
    accent: ["#ff4fa3", "#ffd1e8"],
    people: [
      {
        name: "索伦·克尔凯郭尔",
        intro: "把信仰与选择写成“生存的决断”：强调个体面临的内在风险。",
        keywords: ["主观真理", "跃迁", "焦虑与选择"],
        wikiQuery: "Søren Kierkegaard",
        wikiUrl: "https://en.wikipedia.org/wiki/S%C3%B8ren_Kierkegaard"
      },
      {
        name: "马丁·海德格尔",
        intro: "从“在世存在”理解人：把理解、时间与关怀视为基础结构。",
        keywords: ["在世存在", "此在", "时间性"],
        wikiQuery: "Martin_Heidegger",
        wikiUrl: "https://en.wikipedia.org/wiki/Martin_Heidegger"
      },
      {
        name: "让-保罗·萨特",
        intro: "强调存在先于本质：人通过选择不断书写自己。",
        keywords: ["存在先于本质", "自由与责任", "坏信念"],
        wikiQuery: "Jean-Paul_Sartre",
        wikiUrl: "https://en.wikipedia.org/wiki/Jean-Paul_Sartre"
      }
    ]
  },
  {
    period: "20世纪（分析哲学）",
    name: "分析哲学",
    summary: "把哲学变成“概念的工程”：通过语言与逻辑澄清问题，而非靠修辞取胜。",
    accent: ["#ff6bbd", "#ffe0f3"],
    people: [
      {
        name: "戈特洛布·弗雷格",
        intro: "把意义与指称区分清楚：推动现代逻辑与语义分析的基础框架。",
        keywords: ["意义/指称", "逻辑基础", "可计算性理想"],
        wikiQuery: "Gottlob_Frege",
        wikiUrl: "https://en.wikipedia.org/wiki/Gottlob_Frege"
      },
      {
        name: "伯特兰·罗素",
        intro: "用逻辑重建数学与知识结构：并推动对“描述”的精确处理。",
        keywords: ["逻辑原子主义", "描述理论", "知识的形式化"],
        wikiQuery: "Bertrand_Russell",
        wikiUrl: "https://en.wikipedia.org/wiki/Bertrand_Russell"
      },
      {
        name: "路德维希·维特根斯坦",
        intro: "关注语言如何“使用”：问题往往来自概念在语言中的误用。",
        keywords: ["语言游戏", "意义即用法", "图像理论/转向"],
        wikiQuery: "Ludwig_Wittgenstein",
        wikiUrl: "https://en.wikipedia.org/wiki/Ludwig_Wittgenstein"
      }
    ]
  },
  {
    period: "20世纪后半（后现代/后结构主义）",
    name: "后现代/后结构主义",
    summary: "质疑宏大叙事：强调知识与权力的交织，并揭示概念内部的差异机制。",
    accent: ["#ff4fa3", "#fff1f8"],
    people: [
      {
        name: "米歇尔·福柯",
        intro: "把知识看作制度化的产物：权力在话语中运作，塑造可说与不可说。",
        keywords: ["话语与权力", "知识考古", "谱系学"],
        wikiQuery: "Michel_Foucault",
        wikiUrl: "https://en.wikipedia.org/wiki/Michel_Foucault"
      },
      {
        name: "雅克·德里达",
        intro: "用“差异/延异”拆解固定意义：文本的结构永远在生成而非封闭。",
        keywords: ["延异", "解构", "差异机制"],
        wikiQuery: "Jacques_Derrida",
        wikiUrl: "https://en.wikipedia.org/wiki/Jacques_Derrida"
      },
      {
        name: "让-弗朗索瓦·利奥塔",
        intro: "对“宏大叙事”的怀疑：强调多元话语与合法性标准的变化。",
        keywords: ["反宏大叙事", "合法性问题", "多元叙事"],
        wikiQuery: "Jean-François Lyotard",
        wikiUrl: "https://en.wikipedia.org/wiki/Jean-Fran%C3%A7ois_Lyotard"
      }
    ]
  }
];

const state = {
  selectedPeriod: "all",
  selectedKeyword: null,
  searchText: "",
  theme: "light"
};

function buildFallbackAvatar(person, school) {
  const c1 = school.accent?.[0] || "#ff4fa3";
  const c2 = school.accent?.[1] || "#ffd1e8";
  return makeAvatarDataUri(initialsOf(person.name), c1, c2);
}

function getTokens(q) {
  const raw = normalizeText(q);
  if (!raw) return [];
  // split by spaces or common separators; keep Chinese tokens as-is
  return raw.split(/[\s/\\,，;；:]+/).filter(Boolean);
}

function renderKeywordChips() {
  const root = $("#keywordChipsRoot");
  if (!root) return;
  const allKeywords = new Set();
  for (const s of schools) {
    for (const p of s.people || []) {
      for (const k of p.keywords || []) allKeywords.add(k);
    }
  }
  const list = Array.from(allKeywords).sort((a, b) => a.localeCompare(b, "zh-CN"));
  root.innerHTML = list
    .map((k) => `<div class="keyword-chip" data-keyword="${escapeHtml(k)}">${escapeHtml(k)}</div>`)
    .join("");

  root.querySelectorAll(".keyword-chip").forEach((el) => {
    el.addEventListener("click", () => {
      const k = el.dataset.keyword;
      if (state.selectedKeyword === k) {
        state.selectedKeyword = null;
      } else {
        state.selectedKeyword = k;
      }
      applyKeywordChipUI();
      applyFilters();
    });
  });
}

function applyKeywordChipUI() {
  const root = $("#keywordChipsRoot");
  if (!root) return;
  root.querySelectorAll(".keyword-chip").forEach((el) => {
    const k = el.dataset.keyword;
    el.classList.toggle("is-selected", state.selectedKeyword === k);
  });
}

function renderPeriodSelect() {
  const sel = $("#periodSelect");
  if (!sel) return;
  const allPeriods = Array.from(new Set(schools.map((s) => s.period)));
  allPeriods.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    sel.appendChild(opt);
  });

  sel.value = state.selectedPeriod;
  sel.addEventListener("change", () => {
    state.selectedPeriod = sel.value;
    applyFilters();
  });
}

function setTheme(theme) {
  const body = document.body;
  body.dataset.theme = theme;
  state.theme = theme;
  try {
    localStorage.setItem("philoTheme", theme);
  } catch {
    // ignore
  }

  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.theme === theme);
  });
}

function setControlCollapsed(collapsed) {
  const bar = document.querySelector("#controlBar");
  const body = document.querySelector("#controlBody");
  const btn = document.querySelector("#controlToggle");
  if (!bar || !body || !btn) return;

  if (collapsed) {
    bar.classList.add("is-collapsed");
    body.hidden = true;
    btn.textContent = "展开";
    btn.setAttribute("aria-expanded", "false");
  } else {
    bar.classList.remove("is-collapsed");
    body.hidden = false;
    btn.textContent = "收起";
    btn.setAttribute("aria-expanded", "true");
  }

  try {
    localStorage.setItem("philoControlCollapsed", collapsed ? "1" : "0");
  } catch {
    // ignore
  }
}

function initControlToggle() {
  const btn = document.querySelector("#controlToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const body = document.querySelector("#controlBody");
    const collapsed = !(body && body.hidden === false);
    setControlCollapsed(!collapsed);
  });
}

function renderTimeline() {
  const root = $("#timelineRoot");
  if (!root) return;

  root.innerHTML = schools
    .map((school, schoolIdx) => {
      const c1 = school.accent?.[0] || "#ff4fa3";
      const c2 = school.accent?.[1] || "#ffd1e8";

      const peopleHtml = (school.people || [])
        .slice(0, 3)
        .map((p, personIdx) => {
          const fallback = makeAvatarDataUri(initialsOf(p.name), c1, c2);
          const keywords = (p.keywords || []).slice(0, 3);
          return `
            <button class="person-card" type="button"
              data-action="open-person"
              data-school-idx="${schoolIdx}"
              data-person-idx="${personIdx}"
              aria-label="打开人物详情：${escapeHtml(p.name)}">
              <div class="avatar-wrap">
                <img class="avatar"
                  src="${fallback}"
                  data-wiki-query="${escapeHtml(p.wikiQuery || p.name)}"
                  data-fallback-src="${fallback}"
                  alt="${escapeHtml(p.name)} 头像"
                  loading="lazy"
                  referrerpolicy="no-referrer" />
              </div>
              <div>
                <div class="person-name">${escapeHtml(p.name)}</div>
                <div class="person-intro">${escapeHtml(p.intro)}</div>
                <div class="keywords">
                  ${keywords
                    .map((k) => `<span class="keyword" data-keyword-chip="${escapeHtml(k)}">${escapeHtml(k)}</span>`)
                    .join("")}
                </div>
              </div>
            </button>
          `;
        })
        .join("");

      return `
        <div class="timeline-item" data-school-idx="${schoolIdx}" data-period="${escapeHtml(school.period)}"
          data-school-name="${escapeHtml(school.name)}" data-school-text="${escapeHtml(
        normalizeText(`${school.name} ${school.period} ${school.summary}`)
      )}">
          <div class="school-head">
            <button class="school-open" type="button"
              data-action="open-school" data-school-idx="${schoolIdx}"
              aria-label="打开流派详情：${escapeHtml(school.name)}">
              <p class="timeline-period">${escapeHtml(school.period)}</p>
              <h3 class="timeline-title">${escapeHtml(school.name)}</h3>
            </button>
          </div>
          <p class="timeline-summary">${escapeHtml(school.summary)}</p>
          <div class="people-grid">${peopleHtml}</div>
        </div>
      `;
    })
    .join("");
}

function openModalWithHtml(html) {
  const overlay = $("#modalOverlay");
  const body = $("#modalBody");
  if (!overlay || !body) return;
  body.innerHTML = html;
  overlay.hidden = false;
  const closeBtn = $("#modalClose");
  if (closeBtn) closeBtn.focus();
}

function closeModal() {
  const overlay = $("#modalOverlay");
  if (!overlay) return;
  overlay.hidden = true;
  const body = $("#modalBody");
  if (body) body.innerHTML = "";
}

function openSchoolModal(schoolIdx) {
  const school = schools[schoolIdx];
  if (!school) return;
  const accent = school.accent || ["#ff4fa3", "#ffd1e8"];

  const peopleMini = (school.people || [])
    .slice(0, 3)
    .map((p, personIdx) => {
      const fallback = buildFallbackAvatar(p, school);
      const keywords = (p.keywords || []).slice(0, 3);
      return `
        <button class="modal-person-card" type="button"
          data-action="open-person"
          data-school-idx="${schoolIdx}"
          data-person-idx="${personIdx}">
          <img class="modal-avatar" src="${fallback}" data-wiki-query="${escapeHtml(p.wikiQuery || p.name)}" alt="${escapeHtml(p.name)}"/>
          <div class="modal-person-meta">
            <div class="modal-person-name">${escapeHtml(p.name)}</div>
            <div class="modal-person-intro">${escapeHtml(p.intro)}</div>
            <div class="modal-keywords">
              ${keywords.map((k) => `<span class="keyword">${escapeHtml(k)}</span>`).join("")}
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  const html = `
    <div class="modal-head">
      <div>
        <h2 class="modal-title">${escapeHtml(school.name)}</h2>
        <div class="modal-subtitle">${escapeHtml(school.period)}</div>
      </div>
    </div>
    <p class="modal-intro">${escapeHtml(school.summary)}</p>
    <div class="modal-links">
      <span class="modal-link" role="note">点击卡片查看人物详情</span>
    </div>
    <div class="modal-people-grid">${peopleMini}</div>
  `;

  openModalWithHtml(html);

  // Load avatars inside modal (best-effort)
  $("#modalBody")
    ?.querySelectorAll("img[data-wiki-query]")
    ?.forEach((img) => {
      loadAvatarForImg(img);
    });
}

function openPersonModal(schoolIdx, personIdx) {
  const school = schools[schoolIdx];
  const person = school?.people?.[personIdx];
  if (!school || !person) return;

  // Try to reuse the already-rendered avatar from the timeline card
  let avatarSrc = null;
  const timelineCardImg = document.querySelector(
    `.person-card[data-school-idx="${schoolIdx}"][data-person-idx="${personIdx}"] img.avatar`
  );
  if (timelineCardImg) avatarSrc = timelineCardImg.src;

  const fallback = buildFallbackAvatar(person, school);
  avatarSrc = avatarSrc || fallback;
  const html = `
    <div class="modal-head">
      <img class="modal-avatar" src="${avatarSrc}" data-wiki-query="${escapeHtml(
        person.wikiQuery || person.name
      )}" alt="${escapeHtml(person.name)}"/>
      <div>
        <h2 class="modal-title">${escapeHtml(person.name)}</h2>
        <div class="modal-subtitle">${escapeHtml(school.name)} · ${escapeHtml(school.period)}</div>
      </div>
    </div>
    <p class="modal-intro">${escapeHtml(person.intro)}</p>
    <div class="modal-keywords">
      ${(person.keywords || []).slice(0, 3).map((k) => `<span class="keyword">${escapeHtml(k)}</span>`).join("")}
    </div>
    <div class="modal-links">
      ${
        person.wikiUrl
          ? `<a class="modal-link" href="${escapeHtml(person.wikiUrl)}" target="_blank" rel="noopener noreferrer">维基百科链接</a>`
          : ""
      }
    </div>
  `;

  openModalWithHtml(html);
  const modalImg = $("#modalBody")?.querySelector("img[data-wiki-query]");
  if (modalImg) loadAvatarForImg(modalImg);
}

async function loadAvatarForImg(img) {
  const wikiQuery = img?.dataset?.wikiQuery;
  if (!wikiQuery) return;

  // If it's already not a data-uri placeholder, skip
  if (img.src && !img.src.startsWith("data:image")) return;

  const avatar = await fetchWikipediaAvatar(wikiQuery);
  if (avatar) {
    img.src = avatar;
    return;
  }

  const fallback = img.dataset.fallbackSrc;
  if (fallback) img.src = fallback;
}

function applyFilters() {
  const root = $("#timelineRoot");
  if (!root) return;

  const tokens = getTokens(state.searchText);
  const selectedKeyword = state.selectedKeyword;

  // clear previous highlights
  root.querySelectorAll(".hl").forEach((el) => el.classList.remove("hl"));

  const period = state.selectedPeriod;
  const items = root.querySelectorAll(".timeline-item");

  items.forEach((item) => {
    const schoolIdx = Number(item.dataset.schoolIdx);
    const school = schools[schoolIdx];
    const schoolText = item.dataset.schoolText || "";

    let match = true;
    if (period !== "all") match = match && school.period === period;
    if (selectedKeyword) {
      match =
        match &&
        (school.people || []).some((p) => (p.keywords || []).includes(selectedKeyword));
    }

    if (tokens.length > 0) {
      match =
        match &&
        tokens.every((t) => {
          if (schoolText.includes(t)) return true;
          const peopleMatch = (school.people || []).some((p) => {
            const personText = normalizeText(`${p.name} ${p.intro} ${(p.keywords || []).join(" ")}`);
            return personText.includes(t);
          });
          return peopleMatch;
        });
    }

    item.hidden = !match;
  });

  // highlight best-effort for visible items
  items.forEach((item) => {
    if (item.hidden) return;
    const schoolIdx = Number(item.dataset.schoolIdx);
    const school = schools[schoolIdx];

    const tokens = getTokens(state.searchText);
    if (tokens.length > 0) {
      const title = item.querySelector(".timeline-title");
      const periodEl = item.querySelector(".timeline-period");
      const schoolName = normalizeText(school.name);
      const schoolPeriod = normalizeText(school.period);
      if (tokens.some((t) => schoolName.includes(t))) title?.classList.add("hl");
      if (tokens.some((t) => schoolPeriod.includes(t))) periodEl?.classList.add("hl");

      item.querySelectorAll(".person-card").forEach((card) => {
        const personIdx = Number(card.dataset.personIdx);
        const person = school.people[personIdx];
        if (!person) return;

        const personNameEl = card.querySelector(".person-name");
        const personName = normalizeText(person.name);
        if (tokens.some((t) => personName.includes(t))) personNameEl?.classList.add("hl");

        card.querySelectorAll(".keyword").forEach((kwEl) => {
          const kw = kwEl.textContent || "";
          if (tokens.some((t) => normalizeText(kw).includes(t))) kwEl.classList.add("hl");
        });
      });
    }

    if (selectedKeyword) {
      item.querySelectorAll(`.keyword`).forEach((kwEl) => {
        const kw = kwEl.textContent || "";
        if (kw === selectedKeyword) kwEl.classList.add("hl");
      });
    }
  });
}

function wireEvents() {
  $("#searchInput")?.addEventListener("input", (e) => {
    state.searchText = e.target.value || "";
    applyFilters();
  });

  // Keyword chip UI
  applyKeywordChipUI();
}

function wireThemeButtons() {
  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
  });
}

function wireTimelineClick() {
  const root = $("#timelineRoot");
  if (!root) return;

  root.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;

    if (action === "open-school") {
      const schoolIdx = Number(target.dataset.schoolIdx);
      openSchoolModal(schoolIdx);
      return;
    }

    if (action === "open-person") {
      const schoolIdx = Number(target.dataset.schoolIdx);
      const personIdx = Number(target.dataset.personIdx);
      openPersonModal(schoolIdx, personIdx);
      return;
    }
  });
}

function wireDirectCardClicks() {
  document.querySelectorAll(".person-card[data-action='open-person']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const schoolIdx = Number(btn.dataset.schoolIdx);
      const personIdx = Number(btn.dataset.personIdx);
      openPersonModal(schoolIdx, personIdx);
    });
  });
}

function wireModalClick() {
  $("#modalOverlay")?.addEventListener("click", (e) => {
    if (e.target === $("#modalOverlay")) closeModal();
  });

  $("#modalClose")?.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  $("#modalBody")?.addEventListener("click", (e) => {
    const target = e.target.closest("[data-action='open-person']");
    if (!target) return;
    const schoolIdx = Number(target.dataset.schoolIdx);
    const personIdx = Number(target.dataset.personIdx);
    openPersonModal(schoolIdx, personIdx);
  });
}

function wireAvatarLazyLoad() {
  const root = $("#timelineRoot");
  if (!root) return;

  const imgs = Array.from(root.querySelectorAll("img.avatar[data-wiki-query]"));
  if (imgs.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        observer.unobserve(img);
        loadAvatarForImg(img);
      });
    },
    { rootMargin: "120px 0px", threshold: 0.01 }
  );

  imgs.forEach((img) => observer.observe(img));
  imgs.forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallbackSrc;
      if (fallback) img.src = fallback;
    });
  });
}

function wireRevealAnimations() {
  const root = $("#timelineRoot");
  if (!root) return;

  const items = Array.from(root.querySelectorAll(".timeline-item"));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((it) => observer.observe(it));
}

function init() {
  // Theme init
  let saved = null;
  try {
    saved = localStorage.getItem("philoTheme");
  } catch {
    // ignore
  }
  if (saved === "light" || saved === "dark" || saved === "pink") state.theme = saved;
  setTheme(state.theme);

  // Control bar collapse init (default collapsed)
  let collapsed = "1";
  try {
    collapsed = localStorage.getItem("philoControlCollapsed") ?? "1";
  } catch {
    // ignore
  }
  setControlCollapsed(collapsed !== "0");
  initControlToggle();

  renderPeriodSelect();
  renderKeywordChips();
  renderTimeline();

  wireEvents();
  wireTimelineClick();
  wireDirectCardClicks();
  wireModalClick();
  wireThemeButtons();

  applyFilters();
  wireAvatarLazyLoad();
  wireRevealAnimations();
}

document.addEventListener("DOMContentLoaded", init);

